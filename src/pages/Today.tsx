import { useState } from 'react'
import { HabitRow } from '../components/HabitRow'
import { TaskItem } from '../components/TaskItem'
import { Button, ProgressBar, SectionTitle } from '../components/ui'
import { useStore, useToday, useTotalXp, useValidationIndex } from '../data/store'
import { addDays, clockTime, formatLongDay } from '../domain/date'
import { isAvoidOk, isAvoidSettled, isDayDone, isDueOn } from '../domain/schedule'
import { MOMENT_LABELS, MOMENTS } from '../domain/types'
import { levelFromXp } from '../domain/xp'
import { TrainingToday } from '../training/TodayCard'

/** How many past days can be corrected. */
const MAX_CORRECTION_DAYS = 13
const fmt = (n: number) => n.toLocaleString('fr-FR')

export function Today() {
  const { data, now } = useStore()
  const today = useToday()
  const index = useValidationIndex()
  const totalXp = useTotalXp()
  const [day, setDay] = useState(today)
  const [groupBy, setGroupBy] = useState<'moment' | 'family'>('moment')
  const { level, xpInLevel, needed } = levelFromXp(totalXp)

  const due = data.habits.filter((h) => isDueOn(h, index, day)).sort((a, b) => (a.time_of_day ?? '99').localeCompare(b.time_of_day ?? '99'))
  const rows = due.flatMap((habit) => habit.moments.map((moment) => ({ habit, moment })))
  const families = [...data.families].sort((a, b) => a.position - b.position)
  const sections =
    groupBy === 'moment'
      ? MOMENTS.map((m) => ({ key: m, label: MOMENT_LABELS[m], rows: rows.filter((r) => r.moment === m) }))
      : [...families.map((f) => ({ id: f.id as string | null, name: f.name })), { id: null, name: 'Sans famille' }].map((f) => ({
          key: f.id ?? 'none',
          label: f.name,
          rows: rows.filter((r) => r.habit.family_id === f.id),
        }))
  const tasks = data.tasks.filter((t) => !t.parent_id && t.due_date !== null && t.due_date <= day && (!t.completed_at || t.due_date === day))
  const doneCount = due.filter((h) => isDayDone(h, index, day)).length
  // Avoid habits still running today are neither done nor missed yet: they are counted apart.
  const running = due.filter(
    (h) => h.tracking === 'avoid' && !isDayDone(h, index, day) && isAvoidOk(h, data.slips, day) && !isAvoidSettled(h, day, today, clockTime(now)),
  ).length

  const pill = (active: boolean) => `min-h-[38px] rounded-md px-3 text-[13px] font-medium ${active ? 'bg-surface' : ''}`

  return (
    <>
      <header className="flex flex-col gap-4 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold">{day === today ? "Aujourd'hui" : 'Correction'}</h1>
            <div className="-ml-2 flex items-center text-sm text-muted">
              <button type="button" aria-label="Jour précédent" disabled={day <= addDays(today, -MAX_CORRECTION_DAYS)} onClick={() => setDay(addDays(day, -1))} className="size-11 text-lg disabled:opacity-30">‹</button>
              <span>{formatLongDay(day)}</span>
              <button type="button" aria-label="Jour suivant" disabled={day >= today} onClick={() => setDay(addDays(day, 1))} className="size-11 text-lg disabled:opacity-30">›</button>
            </div>
          </div>
          <p className="pt-2 text-right text-sm text-muted">
            <span className="whitespace-nowrap">{doneCount} sur {due.length - running} habitudes</span>
            {running > 0 && <span className="block text-[13px] whitespace-nowrap">+ {running} à tenir en cours</span>}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Niveau {level}</span>
            <span className="text-[13px] text-muted tabular-nums">{fmt(xpInLevel)} / {fmt(needed)} XP</span>
          </div>
          <ProgressBar percent={(xpInLevel / needed) * 100} />
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start lg:gap-10">
        <section>
          <div className="flex items-center justify-between gap-3 pb-2">
            <SectionTitle>Habitudes</SectionTitle>
            <div className="flex rounded-lg bg-chip p-[3px]">
              <button type="button" aria-pressed={groupBy === 'moment'} className={pill(groupBy === 'moment')} onClick={() => setGroupBy('moment')}>Moment</button>
              <button type="button" aria-pressed={groupBy === 'family'} className={pill(groupBy === 'family')} onClick={() => setGroupBy('family')}>Famille</button>
            </div>
          </div>
          {due.length === 0 && (
            <div className="flex flex-col items-start gap-3 border-t border-line py-6">
              <p className="text-muted">Aucune habitude prévue ce jour.</p>
              <a href="#habits"><Button variant="primary" tabIndex={-1}>Ajouter des habitudes</Button></a>
            </div>
          )}
          {sections.filter((s) => s.rows.length > 0).map((s) => (
            <div key={s.key} className="pb-1">
              <h3 className="pt-2 pb-1 text-[13px] font-semibold text-muted">{s.label}</h3>
              {s.rows.map((r) => (
                <HabitRow key={`${r.habit.id}-${r.moment}`} habit={r.habit} moment={r.moment} day={day} showMoment={groupBy === 'family'} />
              ))}
            </div>
          ))}
        </section>

        <div className="pt-5 lg:pt-0">
        {day === today && <TrainingToday />}
        <section>
          <div className="pb-2"><SectionTitle>Tâches</SectionTitle></div>
          {tasks.length === 0 && <p className="border-t border-line py-4 text-muted">Aucune tâche due ce jour.</p>}
          {tasks.map((t) => <TaskItem key={t.id} task={t} today={today} />)}
        </section>
        </div>
      </div>
    </>
  )
}
