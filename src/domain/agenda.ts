import { addDays, mondayOf } from './date'
import { isActiveOn, isAvoidOk, isDayDone, isDueOn, isQuota, periodDoneCount, quotaCount, type ValidationIndex } from './schedule'
import type { Streak } from './streak'
import { MOMENT_LABELS, type CalendarEvent, type Family, type Habit, type Moment, type Slip, type Task } from './types'

export type ItemKind = 'habit' | 'task' | 'event'
export type ItemState = 'done' | 'todo' | 'missed' | 'grace' | 'late'

export interface AgendaItem {
  key: string
  kind: ItemKind
  title: string
  /** 'HH:MM', or a moment name when there is no time. */
  when: string
  /** Sort key: times first, then morning / day / evening, then the rest. */
  order: string
  state: ItemState
  color: string
  /** Habits: the moment of the day they belong to. */
  moment?: Moment
  event?: CalendarEvent
}

export interface AgendaFilters {
  kinds: Record<ItemKind, boolean>
  familyId: string
  listId: string
}

export interface AgendaSource {
  habits: Habit[]
  tasks: Task[]
  events: CalendarEvent[]
  families: Family[]
  slips: Slip[]
}

const MOMENT_ORDER = { morning: '1', day: '2', evening: '3' } as const

export function agendaItems(
  src: AgendaSource,
  day: string,
  today: string,
  index: ValidationIndex,
  streaks: Map<string, Streak>,
  filters: AgendaFilters,
): AgendaItem[] {
  const items: AgendaItem[] = []
  if (filters.kinds.event && !filters.familyId && !filters.listId) {
    for (const e of src.events.filter((e) => e.day === day)) {
      items.push({
        key: `e-${e.id}`,
        kind: 'event',
        title: e.title,
        when: e.start_time ? `${e.start_time}${e.end_time ? `–${e.end_time}` : ''}` : 'Journée',
        order: e.start_time ? `0${e.start_time}` : '00',
        state: 'todo',
        color: e.color,
        event: e,
      })
    }
  }
  if (filters.kinds.habit && !filters.listId) {
    for (const h of src.habits) {
      if (isQuota(h) || (filters.familyId && h.family_id !== filters.familyId) || !isDueOn(h, index, day)) continue
      const done = isDayDone(h, index, day)
      // An avoid habit is lost as soon as its tolerance is exceeded, even before the day ends.
      const lost = h.tracking === 'avoid' && !isAvoidOk(h, src.slips, day)
      const grace = streaks.get(h.id)?.graceDays.has(day) ?? false
      const moment = h.moments[0] ?? 'day'
      items.push({
        key: `h-${h.id}`,
        kind: 'habit',
        title: h.name,
        when: h.time_of_day ?? h.moments.map((m) => MOMENT_LABELS[m]).join(', '),
        order: h.time_of_day ? `0${h.time_of_day}` : MOMENT_ORDER[moment],
        state: done ? 'done' : lost ? 'missed' : day >= today ? 'todo' : grace ? 'grace' : 'missed',
        color: src.families.find((f) => f.id === h.family_id)?.color ?? '#9aa39a',
        moment,
      })
    }
  }
  if (filters.kinds.task && !filters.familyId) {
    for (const t of src.tasks) {
      if (t.parent_id || t.due_date !== day || (filters.listId && t.list_id !== filters.listId)) continue
      items.push({
        key: `t-${t.id}`,
        kind: 'task',
        title: t.title,
        when: 'Tâche',
        order: '4',
        state: t.completed_at ? 'done' : day < today ? 'late' : 'todo',
        color: '#596159',
      })
    }
  }
  return items.sort((a, b) => a.order.localeCompare(b.order) || a.title.localeCompare(b.title))
}

export interface QuotaLine {
  habit: Habit
  done: number
  quota: number
  monthly: boolean
}

/** Habits without a fixed day, for the "this week" band. */
export function quotaLines(habits: Habit[], weekDay: string, index: ValidationIndex, familyId: string): QuotaLine[] {
  const monday = mondayOf(weekDay)
  return habits
    .filter((h) => isQuota(h) && !h.archived && (!familyId || h.family_id === familyId))
    .filter((h) => Array.from({ length: 7 }, (_, i) => addDays(monday, i)).some((d) => isActiveOn(h, d)))
    .map((h) => ({ habit: h, done: periodDoneCount(h, index, weekDay), quota: quotaCount(h), monthly: h.frequency.type === 'per_month' }))
}
