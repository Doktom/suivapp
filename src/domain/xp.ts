import type { Priority } from './types'

export const BASE_HABIT_XP = 10
export const LEVEL_STEP_XP = 5
export const ROUTINE_STEP_XP = 2
export const SUBTASK_XP = 5
export const BLOCK_BONUS_XP = 25
export const TASK_XP: Record<Priority, number> = { low: 5, normal: 10, high: 20 }

export function streakBonus(streakDays: number): number {
  if (streakDays >= 100) return 0.5
  if (streakDays >= 30) return 0.25
  if (streakDays >= 7) return 0.1
  return 0
}

const withBonus = (xp: number, streakDays: number) => Math.round(xp * (1 + streakBonus(streakDays)))

/** Simple, duration and quantity habits: proportional to the goal reached. */
export function validationXp(value: number, goal: number, streakDays: number): number {
  return withBonus(BASE_HABIT_XP * Math.min(value / goal, 1), streakDays)
}

/** Level 1 earns 10 XP, each level above it 5 more (10 / 15 / 20). */
export function levelXp(level: number): number {
  return level > 0 ? BASE_HABIT_XP + LEVEL_STEP_XP * (level - 1) : 0
}

export function levelsValidationXp(level: number, streakDays: number): number {
  return withBonus(levelXp(level), streakDays)
}

/** Routines: 2 XP per step done, plus the XP of the level reached. A partial routine still earns its steps. */
export function routineXp(stepsDone: number, level: number, streakDays: number): number {
  return withBonus(ROUTINE_STEP_XP * stepsDone + levelXp(level), streakDays)
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
