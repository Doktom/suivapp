export type Tracking = 'simple' | 'duration' | 'quantity'
export type Moment = 'morning' | 'day' | 'evening'
export type Priority = 'low' | 'normal' | 'high'

export type Frequency =
  | { type: 'daily' }
  /** Weekdays are numbered from 0 (Monday) to 6 (Sunday). */
  | { type: 'weekdays'; days: number[] }
  | { type: 'per_week'; count: number }

export interface Pause {
  from: string
  to: string | null
}

export interface Family {
  id: string
  name: string
  color: string
  stat_name: string
  position: number
}

export interface HabitTemplate {
  id: string
  family_id: string | null
  name: string
  tracking: Tracking
  goal: number
  unit: string
  frequency: Frequency
  moments: Moment[]
  builtin: boolean
}

export interface Habit {
  id: string
  family_id: string | null
  name: string
  description: string
  tracking: Tracking
  goal: number
  unit: string
  frequency: Frequency
  moments: Moment[]
  time_of_day: string | null
  start_date: string
  end_date: string | null
  pauses: Pause[]
  archived: boolean
}

export interface Validation {
  id: string
  habit_id: string
  day: string
  moment: Moment
  value: number
  xp_earned: number
}

export interface TaskList {
  id: string
  name: string
  color: string
}

export interface Task {
  id: string
  list_id: string | null
  parent_id: string | null
  title: string
  note: string
  due_date: string | null
  priority: Priority
  completed_at: string | null
  xp_earned: number
}

export interface Profile {
  id: string
  day_rollover_hour: number
}

export const MOMENTS: Moment[] = ['morning', 'day', 'evening']
export const MOMENT_LABELS: Record<Moment, string> = { morning: 'Matin', day: 'Journée', evening: 'Soir' }
