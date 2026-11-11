import { useStore, useToday } from '../data/store'
import { SectionTitle } from '../components/ui'
import { STYLE_LABELS } from './dance'
import { trainingToday } from './today'

/** "Entraînement du jour" on the Today screen: next gym session, mobility routines, evening dance class. */
export function TrainingToday() {
  const { data } = useStore()
  const today = useToday()
  const t = trainingToday(data.training_sessions, data.training_logs, data.dance_classes, data.dance_sessions, today)
  if (!t.sport && t.mobility.length === 0 && t.dance.length === 0) return null

  const row = (key: string, label: string, detail: string, done: boolean) => (
    <a key={key} href="#training" className="flex min-h-11 items-center gap-3 border-t border-line py-2">
      <span aria-hidden="true" className={`flex size-6 flex-none items-center justify-center rounded-full border text-xs ${done ? 'border-accent bg-accent text-white' : 'border-line text-transparent'}`}>✓</span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate ${done ? 'text-muted line-through' : ''}`}>{label}</span>
        <span className="block truncate text-[13px] text-muted">{detail}</span>
      </span>
      <span aria-hidden="true" className="text-muted">›</span>
    </a>
  )

  return (
    <section className="pb-5">
      <div className="pb-2"><SectionTitle>Entraînement du jour</SectionTitle></div>
      {t.sport && row('sport', t.sport.doneToday ? 'Sport : séance faite' : `Sport : ${t.sport.session.name}`, t.sport.doneToday ? `Prochaine : ${t.sport.session.name}` : 'Prochaine séance de la rotation', t.sport.doneToday)}
      {t.dance.map((c) => row(c.danceClass.id, `Cours de ${STYLE_LABELS[c.danceClass.style].toLowerCase()}`, `${c.danceClass.start_time} – ${c.danceClass.end_time}${c.danceClass.place ? ` · ${c.danceClass.place}` : ''}`, c.done))}
      {t.mobility.map((m) => row(m.session.id, m.session.name, m.session.levels.length > 0 ? m.session.levels.map((l) => l.detail).join(' / ') : 'Routine guidée', m.doneToday))}
      <div className="border-t border-line" />
    </section>
  )
}
