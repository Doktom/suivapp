import type { Family, Frequency, HabitTemplate, Moment, TaskList, Tracking } from './types'

const id = () => crypto.randomUUID()

const FAMILIES: [string, string, string][] = [
  ['Santé', '#4F8A6B', 'Vitalité'],
  ['Sport', '#B5613C', 'Force'],
  ['Danse', '#A64D79', 'Grâce'],
  ['Souplesse', '#6A5A86', 'Souplesse'],
  ['Skincare & soins', '#C08A3E', 'Éclat'],
  ['Mental & bien-être', '#3D6673', 'Sérénité'],
  ['Maison', '#7A7355', 'Ordre'],
  ['Apprentissage & créativité', '#4A63A0', 'Savoir'],
]

const daily: Frequency = { type: 'daily' }
const perWeek = (count: number): Frequency => ({ type: 'per_week', count })

type Row = [family: string, name: string, tracking: Tracking, goal: number, unit: string, f: Frequency, moments: Moment[]]

/** Catalogue limited to the tracking types of V0.1; routines, counters and avoid-habits arrive in V0.2. */
const TEMPLATES: Row[] = [
  ['Danse', 'Cours de danse', 'duration', 60, 'min', perWeek(3), ['day']],
  ['Danse', 'Travail technique (pointes, tours, isolations…)', 'duration', 15, 'min', perWeek(3), ['day']],
  ['Souplesse', 'Séance grand écart / souplesse profonde', 'duration', 20, 'min', perWeek(2), ['day']],
  ['Sport', 'Renforcement musculaire', 'duration', 30, 'min', perWeek(3), ['day']],
  ['Sport', 'Cardio (course, vélo, corde)', 'duration', 30, 'min', perWeek(2), ['day']],
  ['Sport', 'Marche', 'quantity', 8000, 'pas', daily, ['day']],
  ['Skincare & soins', 'Masque / exfoliation', 'simple', 1, '', perWeek(2), ['evening']],
  ['Skincare & soins', 'Soin des cheveux', 'simple', 1, '', perWeek(1), ['evening']],
  ['Santé', 'Se coucher avant 23 h', 'simple', 1, '', daily, ['evening']],
  ['Mental & bien-être', 'Méditation', 'duration', 10, 'min', daily, ['morning']],
  ['Mental & bien-être', 'Journal / gratitude', 'simple', 1, '', daily, ['evening']],
  ['Maison', 'Faire son lit', 'simple', 1, '', daily, ['morning']],
  ['Maison', 'Vaisselle / cuisine rangée', 'simple', 1, '', daily, ['evening']],
  ['Maison', '15 min de rangement', 'duration', 15, 'min', daily, ['day']],
  ['Maison', 'Lessive', 'simple', 1, '', perWeek(2), ['day']],
  ['Apprentissage & créativité', 'Lecture', 'quantity', 10, 'pages', daily, ['evening']],
  ['Apprentissage & créativité', 'Langue étrangère', 'duration', 15, 'min', perWeek(5), ['day']],
]

export function buildSeed() {
  const families: Family[] = FAMILIES.map(([name, color, stat_name], position) => ({
    id: id(),
    name,
    color,
    stat_name,
    position,
  }))
  const habit_templates: HabitTemplate[] = TEMPLATES.map(([family, name, tracking, goal, unit, frequency, moments]) => ({
    id: id(),
    family_id: families.find((f) => f.name === family)!.id,
    name,
    tracking,
    goal,
    unit,
    frequency,
    moments,
    builtin: true,
  }))
  const task_lists: TaskList[] = [
    { id: id(), name: 'Courses', color: '#4F8A6B' },
    { id: id(), name: 'Admin', color: '#3D6673' },
    { id: id(), name: 'Maison', color: '#7A7355' },
  ]
  return { families, habit_templates, task_lists }
}
