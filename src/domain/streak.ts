import { addDays, mondayOf, weekday } from './date'
import { isActiveOn, isDayDone, type ValidationIndex } from './schedule'
import type { Habit } from './types'

export interface Streak {
  current: number
  best: number
  unit: 'days' | 'weeks'
  /** Grace is recorded by the Monday of the week that used it. */
  graceWeeks: Set<string>
}

function dailyStreak(habit: Habit, index: ValidationIndex, today: string): Streak {
  const f = habit.frequency
  const scheduled = (day: string) => f.type !== 'weekdays' || f.days.includes(weekday(day))
  const graceWeeks = new Set<string>()
  let current = 0
  let best = 0
  for (let day = habit.start_date; day <= today; day = addDays(day, 1)) {
    if (!isActiveOn(habit, day) || !scheduled(day)) continue
    if (isDayDone(habit, index, day)) {
      current++
      best = Math.max(best, current)
    } else if (day !== today) {
      const week = mondayOf(day)
      if (current > 0 && !graceWeeks.has(week)) graceWeeks.add(week)
      else current = 0
    }
  }
  return { current, best, unit: 'days', graceWeeks }
}

/** A week succeeds at quota; one missing session is forgiven (the weekly form of the grace day). */
function weeklyStreak(habit: Habit, index: ValidationIndex, today: string, quota: number): Streak {
  const graceWeeks = new Set<string>()
  const thisWeek = mondayOf(today)
  const firstWeek = mondayOf(habit.start_date)
  let current = 0
  let best = 0
  for (let week = firstWeek; week <= thisWeek; week = addDays(week, 7)) {
    let count = 0
    let activeDays = 0
    for (let i = 0; i < 7; i++) {
      const day = addDays(week, i)
      if (day > today || !isActiveOn(habit, day)) continue
      activeDays++
      if (isDayDone(habit, index, day)) count++
    }
    if (activeDays === 0) continue
    if (count >= quota) current++
    else if (week === thisWeek) continue
    else if (count >= Math.max(1, quota - 1)) {
      current++
      graceWeeks.add(week)
    } else if (week !== firstWeek) current = 0
    best = Math.max(best, current)
  }
  return { current, best, unit: 'weeks', graceWeeks }
}

export function computeStreak(habit: Habit, index: ValidationIndex, today: string): Streak {
  return habit.frequency.type === 'per_week'
    ? weeklyStreak(habit, index, today, habit.frequency.count)
    : dailyStreak(habit, index, today)
}
