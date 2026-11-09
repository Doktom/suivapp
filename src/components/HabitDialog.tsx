import { useState, type FormEvent } from 'react'
import { useStore, useToday } from '../data/store'
import { MOMENT_LABELS, MOMENTS, type Frequency, type Habit, type Moment, type Tracking } from '../domain/types'
import { Button, Dialog, Field, inputClass } from './ui'

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const WEEKDAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export function HabitDialog({ habit, onClose }: { habit: Partial<Habit> | null; onClose: () => void }) {
  const { data, save } = useStore()
  const today = useToday()
  const families = [...data.families].sort((a, b) => a.position - b.position)
  const existingId = habit?.id
  const [name, setName] = useState(habit?.name ?? '')
  const [description, setDescription] = useState(habit?.description ?? '')
  const [familyId, setFamilyId] = useState(habit?.family_id ?? families[0]?.id ?? '')
  const [tracking, setTracking] = useState<Tracking>(habit?.tracking ?? 'simple')
  const [goal, setGoal] = useState(habit?.goal ?? 10)
  const [unit, setUnit] = useState(habit?.unit ?? '')
  const [frequency, setFrequency] = useState<Frequency>(habit?.frequency ?? { type: 'daily' })
  const [moments, setMoments] = useState<Moment[]>(habit?.moments ?? ['morning'])
  const [time, setTime] = useState(habit?.time_of_day ?? '')
  const [start, setStart] = useState(habit?.start_date ?? today)
  const [end, setEnd] = useState(habit?.end_date ?? '')

  const days = frequency.type === 'weekdays' ? frequency.days : []
  const invalid =
    moments.length === 0 ||
    (frequency.type === 'weekdays' && days.length === 0) ||
    (tracking !== 'simple' && goal <= 0)

  const fields = () => ({
    name: name.trim(),
    family_id: familyId || null,
    tracking,
    goal: tracking === 'simple' ? 1 : goal,
    unit: tracking === 'simple' ? '' : tracking === 'duration' ? 'min' : unit.trim(),
    frequency,
    moments: MOMENTS.filter((m) => moments.includes(m)),
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || invalid) return
    save('habits', {
      ...fields(),
      id: existingId ?? crypto.randomUUID(),
      description,
      time_of_day: time || null,
      start_date: start,
      end_date: end || null,
      pauses: habit?.pauses ?? [],
      archived: habit?.archived ?? false,
    } satisfies Habit)
    onClose()
  }

  const saveAsTemplate = () => {
    if (!name.trim() || invalid) return
    save('habit_templates', { ...fields(), id: crypto.randomUUID(), builtin: false })
    onClose()
  }

  const toggleMoment = (m: Moment) =>
    setMoments((list) => (list.includes(m) ? list.filter((x) => x !== m) : [...list, m]))

  const toggleDay = (d: number) =>
    setFrequency({ type: 'weekdays', days: days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort() })

  return (
    <Dialog title={existingId ? "Modifier l'habitude" : 'Nouvelle habitude'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Nom">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Famille">
          <select className={inputClass} value={familyId} onChange={(e) => setFamilyId(e.target.value)}>
            {families.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Description (facultative)">
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Suivi">
            <select className={inputClass} value={tracking} onChange={(e) => setTracking(e.target.value as Tracking)}>
              <option value="simple">Simple</option>
              <option value="duration">Durée</option>
              <option value="quantity">Quantité</option>
            </select>
          </Field>
          {tracking !== 'simple' && (
            <Field label={tracking === 'duration' ? 'Objectif (min)' : 'Objectif'}>
              <input type="number" min="1" className={inputClass} value={goal} onChange={(e) => setGoal(Number(e.target.value))} />
            </Field>
          )}
          {tracking === 'quantity' && (
            <Field label="Unité">
              <input className={inputClass} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pages" />
            </Field>
          )}
        </div>

        <Field label="Fréquence">
          <select
            className={inputClass}
            value={frequency.type}
            onChange={(e) => {
              const type = e.target.value as Frequency['type']
              setFrequency(type === 'daily' ? { type } : type === 'weekdays' ? { type, days: [0, 2, 4] } : { type, count: 3 })
            }}
          >
            <option value="daily">Tous les jours</option>
            <option value="weekdays">Certains jours</option>
            <option value="per_week">X fois par semaine</option>
          </select>
        </Field>
        {frequency.type === 'weekdays' && (
          <div className="flex justify-between">
            {WEEKDAYS.map((label, d) => (
              <button key={d} type="button" aria-label={WEEKDAY_NAMES[d]} aria-pressed={days.includes(d)} onClick={() => toggleDay(d)} className={`size-11 rounded-full text-sm font-medium ${days.includes(d) ? 'bg-accent text-white' : 'bg-chip'}`}>
                {label}
              </button>
            ))}
          </div>
        )}
        {frequency.type === 'per_week' && (
          <Field label="Nombre de fois par semaine">
            <input type="number" min="1" max="7" className={inputClass} value={frequency.count} onChange={(e) => setFrequency({ type: 'per_week', count: Number(e.target.value) })} />
          </Field>
        )}

        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm font-medium">Moments de la journée</legend>
          <div className="flex gap-2">
            {MOMENTS.map((m) => (
              <button key={m} type="button" aria-pressed={moments.includes(m)} onClick={() => toggleMoment(m)} className={`min-h-11 flex-1 rounded-lg text-sm font-medium ${moments.includes(m) ? 'bg-accent text-white' : 'bg-chip'}`}>
                {MOMENT_LABELS[m]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Horaire">
            <input type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="Début">
            <input type="date" className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} required />
          </Field>
          <Field label="Fin">
            <input type="date" className={inputClass} value={end} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>

        {moments.length === 0 && <p className="text-sm text-warn">Choisissez au moins un moment.</p>}
        <Button type="submit" variant="primary" disabled={invalid}>Enregistrer</Button>
        <Button onClick={saveAsTemplate} disabled={invalid}>Enregistrer comme modèle</Button>
      </form>
    </Dialog>
  )
}
