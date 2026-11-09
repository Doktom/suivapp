import { addDays, mondayOf, weekday } from './date'
import type { Habit, Moment, Validation } from './types'

export type ValidationIndex = Map<string, Validation>

const key = (habitId: string, day: string, moment: Moment) => `${habitId}|${day}|${moment}`

export function indexValidations(validations: Validation[]): ValidationIndex {
  return new Map(validations.map((v) => [key(v.habit_id, v.day, v.moment), v]))
}

export function getValidation(index: ValidationIndex, habitId: string, day: string, moment: Moment) {
  return index.get(key(habitId, day, moment))
}

export function isPaused(habit: Habit, day: string): boolean {
  return habit.pauses.some((p) => p.from <= day && (p.to === null || day <= p.to))
}

export function isActiveOn(habit: Habit, day: string): boolean {
  return day >= habit.start_date && (!habit.end_date || day <= habit.end_date) && !isPaused(habit, day)
}

export function isMomentDone(habit: Habit, index: ValidationIndex, day: string, moment: Moment): boolean {
  return (getValidation(index, habit.id, day, moment)?.value ?? 0) >= habit.goal
}

export function isDayDone(habit: Habit, index: ValidationIndex, day: string): boolean {
  return habit.moments.every((m) => isMomentDone(habit, index, day, m))
}

export function weekDoneCount(habit: Habit, index: ValidationIndex, day: string): number {
  const monday = mondayOf(day)
  let count = 0
  for (let i = 0; i < 7; i++) if (isDayDone(habit, index, addDays(monday, i))) count++
  return count
}

/** Should this habit appear on this day? A weekly quota hides it once met, except on days it was done. */
export function isDueOn(habit: Habit, index: ValidationIndex, day: string): boolean {
  if (habit.archived || !isActiveOn(habit, day)) return false
  const f = habit.frequency
  if (f.type === 'daily') return true
  if (f.type === 'weekdays') return f.days.includes(weekday(day))
  return isDayDone(habit, index, day) || weekDoneCount(habit, index, day) < f.count
}
