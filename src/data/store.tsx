import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { buildSeed, syncCatalog } from '../domain/catalog'
import { addDays, clockTime, logicalDay } from '../domain/date'
import { fixedOccurrences, nextDate } from '../domain/recurrence'
import {
  getValidation,
  indexValidations,
  isActiveOn,
  isAvoidOk,
  isAvoidSettled,
  isScheduledDay,
  reachedLevel,
} from '../domain/schedule'
import { computeStreak, streakDays } from '../domain/streak'
import {
  normalizeShape,
  type CalendarEvent,
  type Checklist,
  type Family,
  type Habit,
  type HabitTemplate,
  type Moment,
  type Profile,
  type Recurrence,
  type Slip,
  type Task,
  type TaskList,
  type Validation,
} from '../domain/types'
import { BLOCK_BONUS_XP, levelsValidationXp, routineXp, SUBTASK_XP, TASK_XP, validationXp } from '../domain/xp'
import { repo, type Row, type Table } from './repo'

export interface Data {
  families: Family[]
  habit_templates: HabitTemplate[]
  habits: Habit[]
  validations: Validation[]
  slips: Slip[]
  task_lists: TaskList[]
  tasks: Task[]
  checklists: Checklist[]
  events: CalendarEvent[]
  profile: Profile[]
}

const TABLES: Table[] = ['families', 'habit_templates', 'habits', 'validations', 'slips', 'task_lists', 'tasks', 'checklists', 'events', 'profile']

/** How far back unsettled "avoid" days are credited. */
const AVOID_LOOKBACK_DAYS = 30

/** Rows saved before V0.2 lack its fields. */
function normalize(d: Data): Data {
  return {
    ...d,
    habits: d.habits.map(normalizeShape),
    habit_templates: d.habit_templates.map(normalizeShape),
    validations: d.validations.map((v) => ({ ...v, steps: v.steps ?? [] })),
    tasks: d.tasks.map((t) => ({ ...t, recurrence: t.recurrence ?? null })),
  }
}

const newTask = (fields: Partial<Task> & Pick<Task, 'title'>): Task => ({
  id: crypto.randomUUID(),
  list_id: null,
  parent_id: null,
  note: '',
  due_date: null,
  priority: 'normal',
  recurrence: null,
  completed_at: null,
  xp_earned: 0,
  ...fields,
})

function useStoreValue() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())
  // Writes run one after another so that a row always reaches the server after its parents.
  const queue = useRef(Promise.resolve())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

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
      const loaded = normalize(Object.fromEntries(TABLES.map((t, i) => [t, rows[i]])) as unknown as Data)
      if (loaded.profile.length === 0) {
        const seed = buildSeed()
        const profile: Profile = { id: crypto.randomUUID(), day_rollover_hour: 4 }
        for (const f of seed.families) await repo.upsert('families', f)
        for (const t of seed.habit_templates) await repo.upsert('habit_templates', t)
        for (const l of seed.task_lists) await repo.upsert('task_lists', l)
        for (const c of seed.checklists) await repo.upsert('checklists', c)
        await repo.upsert('profile', profile)
        Object.assign(loaded, seed, { profile: [profile] })
      } else {
        // Accounts created before a catalogue update receive the new built-in templates.
        for (const t of syncCatalog(loaded.families, loaded.habit_templates)) {
          await repo.upsert('habit_templates', t)
          loaded.habit_templates = [...loaded.habit_templates.filter((x) => x.id !== t.id), t]
        }
      }
      setData(loaded)
    }
    load().catch(() => setError('Impossible de charger vos données.'))
  }, [])

  const today = data ? logicalDay(now, data.profile[0].day_rollover_hour) : ''

  const streakDaysBefore = (habit: Habit, day: string) => {
    const others = indexValidations(data!.validations.filter((v) => v.day !== day))
    const streak = computeStreak(habit, others, day)
    return streakDays(streak) + (streak.unit === 'days' ? 1 : 0)
  }

  /** Simple, duration, quantity and levels habits. For levels, the value is the level reached. */
  const setValidation = (habit: Habit, day: string, moment: Moment, value: number) => {
    if (!data) return
    const existing = getValidation(indexValidations(data.validations), habit.id, day, moment)
    if (value <= 0) {
      if (existing) remove('validations', existing.id)
      return
    }
    const bonusDays = streakDaysBefore(habit, day)
    save('validations', {
      id: existing?.id ?? crypto.randomUUID(),
      habit_id: habit.id,
      day,
      moment,
      value,
      steps: [],
      xp_earned: habit.tracking === 'levels' ? levelsValidationXp(value, bonusDays) : validationXp(value, habit.goal, bonusDays),
    } satisfies Validation)
  }

  const setRoutineSteps = (habit: Habit, day: string, moment: Moment, steps: string[]) => {
    if (!data) return
    const existing = getValidation(indexValidations(data.validations), habit.id, day, moment)
    if (steps.length === 0) {
      if (existing) remove('validations', existing.id)
      return
    }
    const level = reachedLevel(habit, steps)
    save('validations', {
      id: existing?.id ?? crypto.randomUUID(),
      habit_id: habit.id,
      day,
      moment,
      value: level,
      steps,
      xp_earned: routineXp(steps.length, level, streakDaysBefore(habit, day)),
    } satisfies Validation)
  }

  /** Today's slips take the current time; slips noted on a past day always count. */
  const addSlip = (habit: Habit, day: string) => {
    const time = day === today ? clockTime(now) : habit.avoid?.after ? '23:59' : '00:00'
    save('slips', { id: crypto.randomUUID(), habit_id: habit.id, day, time } satisfies Slip)
  }

  const removeSlip = (habit: Habit, day: string) => {
    const last = data?.slips.filter((s) => s.habit_id === habit.id && s.day === day).sort((a, b) => a.time.localeCompare(b.time)).pop()
    if (last) remove('slips', last.id)
  }

  const avoidValidation = (habit: Habit, day: string): Validation => ({
    id: crypto.randomUUID(),
    habit_id: habit.id,
    day,
    moment: habit.moments[0] ?? 'day',
    value: 1,
    steps: [],
    xp_earned: validationXp(1, 1, streakDaysBefore(habit, day)),
  })

  /** "Tenu": credit an avoid habit before the day is over. */
  const confirmAvoid = (habit: Habit, day: string) => {
    if (!data || !isAvoidOk(habit, data.slips, day)) return
    if (!getValidation(indexValidations(data.validations), habit.id, day, habit.moments[0] ?? 'day')) save('validations', avoidValidation(habit, day))
  }

  /** A new occurrence of a recurring task, with fresh copies of its sub-tasks. The old one loses its recurrence. */
  const spawnOccurrence = (task: Task, due: string, recurrence: Recurrence | null, children: Task[]) => {
    const copy = newTask({ ...task, id: crypto.randomUUID(), due_date: due, recurrence, completed_at: null, xp_earned: 0 })
    save('tasks', copy)
    children.forEach((c) => save('tasks', newTask({ ...c, id: crypto.randomUUID(), parent_id: copy.id, completed_at: null, xp_earned: 0 })))
    return copy
  }

  const afterCompletion = (task: Task) => {
    if (!data || task.parent_id || task.recurrence?.mode !== 'after') return
    save('tasks', { ...task, recurrence: null })
    const children = data.tasks.filter((t) => t.parent_id === task.id)
    spawnOccurrence(task, nextDate(today, task.recurrence), task.recurrence, children)
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
    if (!task.parent_id) {
      if (completing) afterCompletion(updated)
      return
    }
    const parent = data.tasks.find((t) => t.id === task.parent_id)
    if (!parent) return
    const siblings = data.tasks.filter((t) => t.parent_id === parent.id).map((t) => (t.id === task.id ? updated : t))
    const allDone = siblings.every((t) => t.completed_at !== null)
    if (allDone !== (parent.completed_at !== null)) {
      const done: Task = {
        ...parent,
        completed_at: allDone ? new Date().toISOString() : null,
        xp_earned: allDone ? BLOCK_BONUS_XP : 0,
      }
      save('tasks', done)
      if (allDone) afterCompletion(done)
    }
  }

  const removeTask = (task: Task) => {
    data?.tasks.filter((t) => t.parent_id === task.id).forEach((t) => remove('tasks', t.id))
    remove('tasks', task.id)
  }

  const launchChecklist = (checklist: Checklist, due: string | null) => {
    const block = newTask({
      title: checklist.name,
      list_id: checklist.list_id,
      due_date: due ?? (checklist.recurrence ? today : null),
      recurrence: checklist.recurrence,
    })
    save('tasks', block)
    checklist.items.forEach((item) => save('tasks', newTask({ title: item, parent_id: block.id, list_id: checklist.list_id })))
  }

  /** Detach rows that may still point at a deleted family or list (archived habits, tasks). */
  const removeFamily = (family: Family) => {
    data?.habits.filter((h) => h.family_id === family.id).forEach((h) => save('habits', { ...h, family_id: null }))
    remove('families', family.id)
  }

  const removeList = (list: TaskList) => {
    data?.tasks.filter((t) => t.parent_id === null && t.list_id === list.id).forEach((t) => save('tasks', { ...t, list_id: null }))
    data?.checklists.filter((c) => c.list_id === list.id).forEach((c) => save('checklists', { ...c, list_id: null }))
    remove('task_lists', list.id)
  }

  // Rows written by the automatic pass below, so that StrictMode's double effects never write them twice.
  const handled = useRef(new Set<string>())

  /** Automatic bookkeeping: credit avoid habits whose day is over, and bring back fixed recurring tasks. */
  useEffect(() => {
    if (!data) return
    const index = indexValidations(data.validations)
    const time = clockTime(now)
    for (const habit of data.habits) {
      if (habit.tracking !== 'avoid' || habit.archived) continue
      const moment = habit.moments[0] ?? 'day'
      const from = habit.start_date > addDays(today, -AVOID_LOOKBACK_DAYS) ? habit.start_date : addDays(today, -AVOID_LOOKBACK_DAYS)
      for (let day = from; day <= today; day = addDays(day, 1)) {
        if (!isActiveOn(habit, day) || !isScheduledDay(habit, day)) continue
        const existing = getValidation(index, habit.id, day, moment)
        const ok = isAvoidOk(habit, data.slips, day)
        const key = `${habit.id}|${day}`
        if (!ok && existing) remove('validations', existing.id)
        else if (ok && !existing && isAvoidSettled(habit, day, today, time) && !handled.current.has(key)) {
          handled.current.add(key)
          save('validations', avoidValidation(habit, day))
        }
        if (!ok) handled.current.delete(key)
      }
    }
    for (const task of data.tasks) {
      const r = task.recurrence
      if (!r || r.mode !== 'fixed' || task.parent_id || !task.due_date || task.due_date > today || handled.current.has(task.id)) continue
      handled.current.add(task.id)
      const children = data.tasks.filter((t) => t.parent_id === task.id)
      const dates = fixedOccurrences(task.due_date, r, today)
      save('tasks', { ...task, recurrence: null })
      dates.forEach((due, i) => spawnOccurrence(task, due, i === dates.length - 1 ? r : null, children))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, today, now])

  return {
    data,
    error,
    today,
    save,
    remove,
    setValidation,
    setRoutineSteps,
    addSlip,
    removeSlip,
    confirmAvoid,
    toggleTask,
    removeTask,
    launchChecklist,
    removeFamily,
    removeList,
  }
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
  return useStore().today
}

export function useValidationIndex() {
  const { data } = useStore()
  return useMemo(() => indexValidations(data.validations), [data.validations])
}

export function useTotalXp() {
  const { data } = useStore()
  return data.validations.reduce((s, v) => s + v.xp_earned, 0) + data.tasks.reduce((s, t) => s + t.xp_earned, 0)
}
