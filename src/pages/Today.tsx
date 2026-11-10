import { useState } from 'react'
import { TaskItem } from '../components/TaskItem'
import { Button, CheckButton, FamilyDot, ProgressBar, SectionTitle } from '../components/ui'
import { useStore, useToday, useTotalXp, useValidationIndex } from '../data/store'
import { addDays, clockTime, formatLongDay, mondayOf } from '../domain/date'
import { describeAvoid } from '../domain/describe'
import {
  getValidation,
  isAvoidOk,
  isAvoidSettled,
  isDayDone,
  isDueOn,
  isMomentDone,
  isQuota,
  periodDoneCount,
  quotaCount,
  routineLevels,
  slipsOn,
} from '../domain/schedule'
import { computeStreak, STREAK_UNIT } from '../domain/streak'
import { MOMENT_LABELS, MOMENTS, type Habit, type Moment } from '../domain/types'
import { levelFromXp } from '../domain/xp'

const MAX_CORRECTION_DAYS = 6
const fmt = (n: number) => n.toLocaleString('fr-FR')

function stepFor(habit: Habit) {
  if (habit.tracking === 'duration') return 5
  return habit.goal >= 1000 ? 1000 : Math.max(1, Math.round(habit.goal / 5))
}

const chip = (active: boolean) =>
  `min-h-9 rounded-full px-3 text-[13px] font-medium ${active ? 'bg-accent text-white' : 'bg-chip text-ink'}`

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`

function LevelsInput({ habit, value, onChange }: { habit: Habit; value: number; onChange: (level: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1 pb-1.5 pl-[52px]">
      {habit.levels.map((level, i) => (
        <button key={i} type="button" aria-pressed={value === i + 1} className={chip(value === i + 1)} onClick={() => onChange(value === i + 1 ? 0 : i + 1)}>
          {level.name}{level.detail ? ` · ${level.detail}` : ''}
        </button>
      ))}
    </div>
  )
}

function RoutineInput({ habit, done, onChange }: { habit: Habit; done: string[]; onChange: (steps: string[]) => void }) {
  const toggle = (id: string) => onChange(done.includes(id) ? done.filter((s) => s !== id) : [...done, id])
  const levels = routineLevels(habit)
  return (
    <div className="pt-1 pb-1.5 pl-[52px]">
      {habit.levels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-1.5">
          {levels.map((level, i) => {
            const complete = level.steps.length > 0 && level.steps.every((id) => done.includes(id))
            return (
              <button key={i} type="button" aria-pressed={complete} className={chip(complete)} onClick={() => onChange(complete ? done.filter((id) => !level.steps.includes(id)) : [...new Set([...done, ...level.steps])])}>
                {level.name}{level.detail ? ` · ${level.detail}` : ''}
              </button>
            )
          })}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {habit.steps.map((step) => (
          <button key={step.id} type="button" aria-pressed={done.includes(step.id)} onClick={() => toggle(step.id)} className={`min-h-9 rounded-md border px-2.5 text-[13px] ${done.includes(step.id) ? 'border-accent text-accent line-through' : 'border-line'}`}>
            {step.name}
          </button>
        ))}
      </div>
    </div>
  )
}

function HabitRow({ habit, moment, day, showMoment }: { habit: Habit; moment: Moment; day: string; showMoment: boolean }) {
  const { data, setValidation, setRoutineSteps, addSlip, removeSlip, confirmAvoid } = useStore()
  const today = useToday()
  const index = useValidationIndex()
  const validation = getValidation(index, habit.id, day, moment)
  const value = validation?.value ?? 0
  const done = isMomentDone(habit, index, day, moment)
  const family = data.families.find((f) => f.id === habit.family_id)
  const streak = computeStreak(habit, index, today)
  const step = stepFor(habit)

  const parts: string[] = []
  if (isQuota(habit)) {
    const period = habit.frequency.type === 'per_month' ? 'ce mois' : 'cette semaine'
    parts.push(`${periodDoneCount(habit, index, day)} sur ${quotaCount(habit)} ${period}`)
    if (streak.current > 0) parts.push(`série ${streak.current} ${STREAK_UNIT[streak.unit]}`)
  } else if (streak.current > 0) {
    parts.push(`Série ${streak.current} j`)
  }
  if (family) parts.push(family.name)
  if (habit.time_of_day) parts.push(habit.time_of_day)

  let check = () => setValidation(habit, day, moment, done ? 0 : habit.goal)
  let status: string | null = null
  let missed = false
  if (habit.tracking === 'levels') check = () => setValidation(habit, day, moment, done ? 0 : 1)
  if (habit.tracking === 'routine') {
    const levels = routineLevels(habit)
    check = () => setRoutineSteps(habit, day, moment, done ? [] : levels[levels.length - 1].steps)
    if (value > 0 && habit.levels.length > 0) status = `Niveau ${levels[value - 1].name}`
  }
  const slipCount = habit.tracking === 'avoid' ? slipsOn(habit, data.slips, day) : 0
  const anySlip = data.slips.some((s) => s.habit_id === habit.id && s.day === day)
  if (habit.tracking === 'avoid') {
    const ok = isAvoidOk(habit, data.slips, day)
    const settled = isAvoidSettled(habit, day, today, clockTime(new Date()))
    if (habit.avoid) {
      const rule = describeAvoid(habit.avoid)
      if (rule) parts.unshift(rule)
    }
    const slipsText = slipCount ? ` · ${plural(slipCount, 'écart')}` : ''
    missed = !ok
    status = !ok ? `Manqué${slipsText}` : done || settled ? `Tenu${slipsText}` : `En cours${slipsText}`
    check = () => {
      if (!done) confirmAvoid(habit, day)
      else if (!settled) setValidation(habit, day, moment, 0)
    }
  }

  return (
    <div className="border-t border-line py-1.5">
      <div className="flex items-center gap-2">
        <CheckButton done={done} label={`${done ? 'Annuler' : 'Valider'} : ${habit.name}`} onClick={check} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-medium">
            <FamilyDot color={family?.color} />
            <span>{habit.name}{showMoment && habit.moments.length > 1 ? ` (${MOMENT_LABELS[moment].toLowerCase()})` : ''}</span>
          </div>
          <div className="text-[13px] text-muted">{parts.join(' · ')}</div>
          {status && <div className={`text-[13px] ${missed ? 'text-warn' : 'text-accent'}`}>{status}</div>}
          {streak.graceWeeks.has(mondayOf(today)) && !isQuota(habit) && <div className="text-[13px] text-warn">Jour de grâce utilisé cette semaine</div>}
        </div>
        {validation && validation.xp_earned > 0 && <span className="flex-none text-[13px] font-medium text-accent tabular-nums">+{validation.xp_earned} XP</span>}
      </div>
      {(habit.tracking === 'duration' || habit.tracking === 'quantity') && (
        <div className="flex items-center gap-1 pl-[52px]">
          <div className="flex-1"><ProgressBar thin percent={(value / habit.goal) * 100} /></div>
          <span className="min-w-24 text-right text-[13px] text-muted tabular-nums">{fmt(value)} / {fmt(habit.goal)} {habit.unit}</span>
          <button type="button" aria-label={`Diminuer ${habit.name}`} className="size-11 text-xl" onClick={() => setValidation(habit, day, moment, Math.max(0, value - step))}>−</button>
          <button type="button" aria-label={`Augmenter ${habit.name}`} className="size-11 text-xl" onClick={() => setValidation(habit, day, moment, Math.min(habit.goal, value + step))}>+</button>
        </div>
      )}
      {habit.tracking === 'levels' && <LevelsInput habit={habit} value={value} onChange={(level) => setValidation(habit, day, moment, level)} />}
      {habit.tracking === 'routine' && <RoutineInput habit={habit} done={validation?.steps ?? []} onChange={(steps) => setRoutineSteps(habit, day, moment, steps)} />}
      {habit.tracking === 'avoid' && (
        <div className="flex flex-wrap gap-1.5 pt-1 pb-1.5 pl-[52px]">
          <Button className="!min-h-9 text-[13px]" onClick={() => addSlip(habit, day)}>Noter un écart</Button>
          {anySlip && <Button className="!min-h-9 text-[13px]" onClick={() => removeSlip(habit, day)}>Retirer un écart</Button>}
        </div>
      )}
    </div>
  )
}

export function Today() {
  const { data } = useStore()
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
          <p className="pt-2 text-sm whitespace-nowrap text-muted">{doneCount} sur {due.length} habitudes</p>
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

        <section className="pt-5 lg:pt-0">
          <div className="pb-2"><SectionTitle>Tâches</SectionTitle></div>
          {tasks.length === 0 && <p className="border-t border-line py-4 text-muted">Aucune tâche due ce jour.</p>}
          {tasks.map((t) => <TaskItem key={t.id} task={t} today={today} />)}
        </section>
      </div>
    </>
  )
}
