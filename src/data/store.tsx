import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { buildSeed } from '../domain/catalog'
import { logicalDay } from '../domain/date'
import { indexValidations } from '../domain/schedule'
import { computeStreak } from '../domain/streak'
import type { Family, Habit, HabitTemplate, Moment, Profile, Task, TaskList, Validation } from '../domain/types'
import { BLOCK_BONUS_XP, SUBTASK_XP, TASK_XP, validationXp } from '../domain/xp'
import { repo, type Row, type Table } from './repo'

export interface Data {
  families: Family[]
  habit_templates: HabitTemplate[]
  habits: Habit[]
  validations: Validation[]
  task_lists: TaskList[]
  tasks: Task[]
  profile: Profile[]
}

const TABLES: Table[] = ['families', 'habit_templates', 'habits', 'validations', 'task_lists', 'tasks', 'profile']

function useStoreValue() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Writes run one after another so that a row always reaches the server after its parents.
  const queue = useRef(Promise.resolve())

  const enqueue = (write: () => Promise<void>) => {
    queue.current = queue.current.then(write).catch(() => {
      setError("Une modification n'a pas pu être enregistrée. Rechargez la page.")
    })
  }

  const save = <K extends Table>(table: K, row: Data[K][number]) => {
    setData((d) => d && { ...d, [table]: [...(d[table] as Row[]).filter((r) => r.id !== row.id), row] })
    enqueue(() => repo.upsert(table, row))
  }

  const remove = (table: Table, id: string) => {
    setData((d) => d && { ...d, [table]: (d[table] as Row[]).filter((r) => r.id !== id) })
    enqueue(() => repo.remove(table, id))
  }

  // React's StrictMode runs effects twice; the first-run seed must only happen once.
  const loadStarted = useRef(false)

  useEffect(() => {
    if (loadStarted.current) return
    loadStarted.current = true
    async function load() {
      const rows = await Promise.all(TABLES.map((t) => repo.list(t)))
      const loaded = Object.fromEntries(TABLES.map((t, i) => [t, rows[i]])) as unknown as Data
      if (loaded.profile.length === 0) {
        const seed = buildSeed()
        const profile: Profile = { id: crypto.randomUUID(), day_rollover_hour: 4 }
        for (const f of seed.families) await repo.upsert('families', f)
        for (const t of seed.habit_templates) await repo.upsert('habit_templates', t)
        for (const l of seed.task_lists) await repo.upsert('task_lists', l)
        await repo.upsert('profile', profile)
        Object.assign(loaded, seed, { profile: [profile] })
      }
      setData(loaded)
    }
    load().catch(() => setError('Impossible de charger vos données.'))
  }, [])

  const setValidation = (habit: Habit, day: string, moment: Moment, value: number) => {
    if (!data) return
    const existing = data.validations.find((v) => v.habit_id === habit.id && v.day === day && v.moment === moment)
    if (value <= 0) {
      if (existing) remove('validations', existing.id)
      return
    }
    const streak = computeStreak(habit, indexValidations(data.validations.filter((v) => v.day !== day)), day)
    const streakDays = streak.unit === 'weeks' ? streak.current * 7 : streak.current + 1
    save('validations', {
      id: existing?.id ?? crypto.randomUUID(),
      habit_id: habit.id,
      day,
      moment,
      value,
      xp_earned: validationXp(value, habit.goal, streakDays),
    } satisfies Validation)
  }

  const toggleTask = (task: Task) => {
    if (!data) return
    const completing = task.completed_at === null
    const xp = task.parent_id ? SUBTASK_XP : TASK_XP[task.priority]
    const updated: Task = {
      ...task,
      completed_at: completing ? new Date().toISOString() : null,
      xp_earned: completing ? xp : 0,
    }
    save('tasks', updated)
    if (!task.parent_id) return
    const parent = data.tasks.find((t) => t.id === task.parent_id)
    if (!parent) return
    const siblings = data.tasks.filter((t) => t.parent_id === parent.id).map((t) => (t.id === task.id ? updated : t))
    const allDone = siblings.every((t) => t.completed_at !== null)
    if (allDone !== (parent.completed_at !== null)) {
      save('tasks', {
        ...parent,
        completed_at: allDone ? new Date().toISOString() : null,
        xp_earned: allDone ? BLOCK_BONUS_XP : 0,
      } satisfies Task)
    }
  }

  const removeTask = (task: Task) => {
    data?.tasks.filter((t) => t.parent_id === task.id).forEach((t) => remove('tasks', t.id))
    remove('tasks', task.id)
  }

  /** Detach rows that may still point at a deleted family or list (archived habits, tasks). */
  const removeFamily = (family: Family) => {
    data?.habits.filter((h) => h.family_id === family.id).forEach((h) => save('habits', { ...h, family_id: null }))
    remove('families', family.id)
  }

  const removeList = (list: TaskList) => {
    data?.tasks.filter((t) => t.list_id === list.id).forEach((t) => save('tasks', { ...t, list_id: null }))
    remove('task_lists', list.id)
  }

  return { data, error, save, remove, setValidation, toggleTask, removeTask, removeFamily, removeList }
}

type StoreValue = ReturnType<typeof useStoreValue>
const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useStoreValue()
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store || !store.data) throw new Error('Store not ready')
  return { ...store, data: store.data }
}

export function useStoreStatus() {
  const store = useContext(StoreContext)!
  return { ready: store.data !== null, error: store.error }
}

export function useToday() {
  const { data } = useStore()
  return logicalDay(new Date(), data.profile[0].day_rollover_hour)
}

export function useValidationIndex() {
  const { data } = useStore()
  return useMemo(() => indexValidations(data.validations), [data.validations])
}

export function useTotalXp() {
  const { data } = useStore()
  return data.validations.reduce((s, v) => s + v.xp_earned, 0) + data.tasks.reduce((s, t) => s + t.xp_earned, 0)
}
