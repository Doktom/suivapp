import { describe, expect, it } from 'vitest'
import { addDays, logicalDay, mondayOf, weekday } from './date'
import { indexValidations, isDueOn } from './schedule'
import { computeStreak } from './streak'
import type { Frequency, Habit, Validation } from './types'
import { levelFromXp, streakBonus, validationXp, xpForNextLevel } from './xp'

const habit = (frequency: Frequency = { type: 'daily' }, overrides: Partial<Habit> = {}): Habit => ({
  id: 'h',
  family_id: null,
  name: 'Test',
  description: '',
  tracking: 'simple',
  goal: 1,
  unit: '',
  frequency,
  moments: ['morning'],
  time_of_day: null,
  start_date: '2026-11-02', // a Monday
  end_date: null,
  pauses: [],
  archived: false,
  ...overrides,
})

const done = (...days: string[]) =>
  indexValidations(
    days.map((day): Validation => ({ id: day, habit_id: 'h', day, moment: 'morning', value: 1, xp_earned: 10 })),
  )

const range = (from: string, n: number) => Array.from({ length: n }, (_, i) => addDays(from, i))

describe('dates', () => {
  it('garde la veille avant la bascule', () => {
    expect(logicalDay(new Date(2026, 10, 9, 1, 0), 4)).toBe('2026-11-08')
    expect(logicalDay(new Date(2026, 10, 9, 4, 0), 4)).toBe('2026-11-09')
  })
  it('numérote la semaine depuis lundi', () => {
    expect(weekday('2026-11-09')).toBe(0)
    expect(weekday('2026-11-15')).toBe(6)
    expect(mondayOf('2026-11-15')).toBe('2026-11-09')
  })
})

describe('planification', () => {
  it('respecte les jours de la semaine', () => {
    const h = habit({ type: 'weekdays', days: [0, 2] })
    expect(isDueOn(h, done(), '2026-11-09')).toBe(true)
    expect(isDueOn(h, done(), '2026-11-10')).toBe(false)
  })
  it('masque une habitude hebdomadaire une fois le quota atteint', () => {
    const h = habit({ type: 'per_week', count: 2 })
    const index = done('2026-11-09', '2026-11-10')
    expect(isDueOn(h, index, '2026-11-10')).toBe(true)
    expect(isDueOn(h, index, '2026-11-11')).toBe(false)
  })
  it('exclut les habitudes archivées ou en pause', () => {
    expect(isDueOn(habit(undefined, { archived: true }), done(), '2026-11-09')).toBe(false)
    expect(isDueOn(habit(undefined, { pauses: [{ from: '2026-11-08', to: null }] }), done(), '2026-11-09')).toBe(false)
  })
})

describe('séries', () => {
  it("ne casse pas la série tant qu'aujourd'hui n'est pas fini", () => {
    expect(computeStreak(habit(), done('2026-11-02', '2026-11-03'), '2026-11-04').current).toBe(2)
  })
  it('accorde un seul jour de grâce par semaine', () => {
    const one = computeStreak(habit(), done('2026-11-02', '2026-11-04', '2026-11-05'), '2026-11-05')
    expect(one.current).toBe(3)
    expect(one.graceWeeks.has('2026-11-02')).toBe(true)
    const two = computeStreak(habit(), done('2026-11-02', '2026-11-05'), '2026-11-05')
    expect(two.current).toBe(1)
    expect(two.best).toBe(1)
  })
  it('accorde de nouveau la grâce la semaine suivante', () => {
    const days = [...range('2026-11-02', 2), ...range('2026-11-05', 5), ...range('2026-11-11', 2)]
    expect(computeStreak(habit(), done(...days), '2026-11-12').current).toBe(9)
  })
  it('ignore les jours non planifiés et les pauses', () => {
    const weekdays = habit({ type: 'weekdays', days: [0, 2] })
    expect(computeStreak(weekdays, done('2026-11-02', '2026-11-04', '2026-11-09'), '2026-11-09').current).toBe(3)
    const paused = habit(undefined, { pauses: [{ from: '2026-11-03', to: '2026-11-08' }] })
    expect(computeStreak(paused, done('2026-11-02', '2026-11-09'), '2026-11-09').current).toBe(2)
  })
  it('compte les semaines réussies pour un quota hebdomadaire', () => {
    const h = habit({ type: 'per_week', count: 2 })
    const streak = computeStreak(h, done('2026-11-02', '2026-11-04', '2026-11-09', '2026-11-11'), '2026-11-11')
    expect(streak).toMatchObject({ current: 2, unit: 'weeks' })
  })
  it('pardonne une séance manquée sur un quota, mais pas une semaine vide', () => {
    const h = habit({ type: 'per_week', count: 2 })
    const forgiven = computeStreak(h, done('2026-11-02', '2026-11-03', '2026-11-09'), '2026-11-16')
    expect(forgiven.graceWeeks.has('2026-11-09')).toBe(true)
    expect(forgiven.current).toBe(2)
    const once = habit({ type: 'per_week', count: 1 })
    expect(computeStreak(once, done('2026-11-02'), '2026-11-17').current).toBe(0)
  })
})

describe('XP', () => {
  it('applique les paliers de bonus', () => {
    expect([6, 7, 30, 100].map(streakBonus)).toEqual([0, 0.1, 0.25, 0.5])
  })
  it('est proportionnelle et plafonnée à l’objectif', () => {
    expect(validationXp(5, 10, 0)).toBe(5)
    expect(validationXp(20, 10, 7)).toBe(11)
  })
  it('suit la courbe de niveau', () => {
    expect(xpForNextLevel(4)).toBe(800)
    expect(levelFromXp(0)).toEqual({ level: 1, xpInLevel: 0, needed: 100 })
    expect(levelFromXp(100).level).toBe(2)
  })
})
