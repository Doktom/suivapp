import type { Priority } from './types'

export const BASE_HABIT_XP = 10
export const SUBTASK_XP = 5
export const BLOCK_BONUS_XP = 25
export const TASK_XP: Record<Priority, number> = { low: 5, normal: 10, high: 20 }

export function streakBonus(streakDays: number): number {
  if (streakDays >= 100) return 0.5
  if (streakDays >= 30) return 0.25
  if (streakDays >= 7) return 0.1
  return 0
}

export function validationXp(value: number, goal: number, streakDays: number): number {
  const ratio = Math.min(value / goal, 1)
  return Math.round(BASE_HABIT_XP * ratio * (1 + streakBonus(streakDays)))
}

export function xpForNextLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5))
}

export function levelFromXp(totalXp: number) {
  let level = 1
  let xpInLevel = totalXp
  while (xpInLevel >= xpForNextLevel(level)) {
    xpInLevel -= xpForNextLevel(level)
    level++
  }
  return { level, xpInLevel, needed: xpForNextLevel(level) }
}
