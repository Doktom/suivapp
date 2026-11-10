import { useState } from 'react'
import { HabitDialog } from '../components/HabitDialog'
import { Button, Dialog, FamilyDot, SectionTitle } from '../components/ui'
import { useStore, useToday, useValidationIndex } from '../data/store'
import { addDays } from '../domain/date'
import { isPaused } from '../domain/schedule'
import { computeStreak, STREAK_UNIT } from '../domain/streak'
import { describeFrequency, describeTracking } from '../domain/describe'
import type { Habit, HabitTemplate } from '../domain/types'

function HabitLine({ habit, onEdit }: { habit: Habit; onEdit: () => void }) {
  const { save } = useStore()
  const today = useToday()
  const index = useValidationIndex()
  const streak = computeStreak(habit, index, today)
  const paused = isPaused(habit, today)
  const unit = STREAK_UNIT[streak.unit]
  const tracking = describeTracking(habit)

  const togglePause = () => {
    const pauses = paused
      ? habit.pauses.map((p) => (p.to === null ? { ...p, to: addDays(today, -1) } : p)).filter((p) => p.to! >= p.from)
      : [...habit.pauses, { from: today, to: null }]
    save('habits', { ...habit, pauses })
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 border-t border-line py-2">
      <div className="min-w-48 flex-1">
        <div className="font-medium">{habit.name}</div>
        <div className="text-[13px] text-muted">
          {describeFrequency(habit.frequency)}{tracking ? ` · ${tracking}` : ''} · série {streak.current} {unit} · record {streak.best} {unit}
          {paused ? ' · en pause' : ''}
        </div>
      </div>
      <div className="flex text-[13px] text-muted">
        <button type="button" className="min-h-11 px-2" onClick={onEdit}>Modifier</button>
        <button type="button" className="min-h-11 px-2" onClick={togglePause}>{paused ? 'Reprendre' : 'Pause'}</button>
        <button type="button" className="min-h-11 px-2" onClick={() => save('habits', { ...habit, archived: !habit.archived })}>{habit.archived ? 'Restaurer' : 'Archiver'}</button>
      </div>
    </div>
  )
}

function Catalog({ onClose }: { onClose: () => void }) {
  const { data, save, remove } = useStore()
  const today = useToday()
  const [added, setAdded] = useState<string[]>([])

  const add = (t: HabitTemplate) => {
    const { builtin: _builtin, ...fields } = t
    save('habits', {
      ...fields,
      id: crypto.randomUUID(),
      description: '',
      time_of_day: null,
      start_date: today,
      end_date: null,
      pauses: [],
      archived: false,
    } satisfies Habit)
    setAdded((list) => [...list, t.id])
  }

  const families = [...data.families].sort((a, b) => a.position - b.position)
  return (
    <Dialog title="Catalogue d'habitudes" onClose={onClose}>
      <div className="flex max-h-[65dvh] flex-col gap-3 overflow-y-auto">
        {families.map((f) => {
          const templates = data.habit_templates.filter((t) => t.family_id === f.id)
          if (templates.length === 0) return null
          return (
            <div key={f.id}>
              <h3 className="flex items-center gap-2 pb-1 text-[13px] font-semibold text-muted"><FamilyDot color={f.color} />{f.name}</h3>
              {templates.map((t) => (
                <div key={t.id} className="flex items-center gap-2 border-t border-line py-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-[13px] text-muted">{describeFrequency(t.frequency)}{describeTracking(t) ? ` · ${describeTracking(t)}` : ''}</div>
                  </div>
                  {!t.builtin && <button type="button" className="min-h-11 px-2 text-[13px] text-muted" onClick={() => remove('habit_templates', t.id)}>Retirer</button>}
                  <Button disabled={added.includes(t.id)} onClick={() => add(t)}>{added.includes(t.id) ? 'Ajoutée' : 'Ajouter'}</Button>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </Dialog>
  )
}

export function Habits() {
  const { data } = useStore()
  const [editing, setEditing] = useState<Partial<Habit> | null>(null)
  const [creating, setCreating] = useState(false)
  const [catalog, setCatalog] = useState(false)
  const active = data.habits.filter((h) => !h.archived)
  const archived = data.habits.filter((h) => h.archived)
  const families = [...data.families].sort((a, b) => a.position - b.position)
  const close = () => {
    setEditing(null)
    setCreating(false)
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
        <h1 className="font-display text-[28px] font-semibold">Habitudes</h1>
        <div className="flex gap-2">
          <Button onClick={() => setCatalog(true)}>Catalogue</Button>
          <Button variant="primary" onClick={() => setCreating(true)}>Nouvelle habitude</Button>
        </div>
      </div>
      {active.length === 0 && <p className="text-muted">Aucune habitude. Commencez par le catalogue.</p>}
      <div className="flex flex-col gap-5">
        {families.map((f) => {
          const habits = active.filter((h) => h.family_id === f.id)
          if (habits.length === 0) return null
          return (
            <section key={f.id}>
              <h2 className="flex items-center gap-2 pb-2 text-sm font-semibold"><FamilyDot color={f.color} />{f.name}</h2>
              {habits.map((h) => <HabitLine key={h.id} habit={h} onEdit={() => setEditing(h)} />)}
            </section>
          )
        })}
        {active.some((h) => !h.family_id) && (
          <section>
            <h2 className="pb-2 text-sm font-semibold">Sans famille</h2>
            {active.filter((h) => !h.family_id).map((h) => <HabitLine key={h.id} habit={h} onEdit={() => setEditing(h)} />)}
          </section>
        )}
        {archived.length > 0 && (
          <section>
            <SectionTitle>Archivées</SectionTitle>
            <div className="pt-2">{archived.map((h) => <HabitLine key={h.id} habit={h} onEdit={() => setEditing(h)} />)}</div>
          </section>
        )}
      </div>
      {(editing || creating) && <HabitDialog habit={editing} onClose={close} />}
      {catalog && <Catalog onClose={() => setCatalog(false)} />}
    </>
  )
}
