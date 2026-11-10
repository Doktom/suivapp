import { ProgressBar } from '../components/ui'
import { useBadges, useStore } from '../data/store'
import { addDays, formatShortDay, mondayOf } from '../domain/date'
import { BADGE_XP, change, recordFeed, weekSummary, type Badge } from './achievements'
import { formatMinutes } from './dance'

const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })

export function useWeeks() {
  const { data, today } = useStore()
  const badges = useBadges()
  const monday = mondayOf(today)
  return {
    current: weekSummary(data, monday, badges),
    previous: weekSummary(data, addDays(monday, -7), badges),
    /** The week before last, to compare last week with its own previous week. */
    beforePrevious: weekSummary(data, addDays(monday, -14), badges),
    badges,
  }
}

/** A medal: filled when unlocked, outlined otherwise. */
export function Medal({ unlocked }: { unlocked: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" className="flex-none">
      <path d="M12 3h5l3 9h-5zM24 3h-5l-3 9h5z" fill={unlocked ? 'var(--color-accent)' : 'var(--color-track)'} opacity={unlocked ? 0.6 : 1} />
      <circle cx="18" cy="22" r="10" fill={unlocked ? 'var(--color-accent)' : 'none'} stroke={unlocked ? 'var(--color-accent)' : 'var(--color-track)'} strokeWidth="2" />
      {unlocked && <path d="M13.5 22.3 16.7 25.4 22.8 18.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

export function Delta({ current, previous, unit = '' }: { current: number; previous: number; unit?: string }) {
  const pct = change(current, previous)
  if (pct === null) return null
  const up = pct >= 0
  return (
    <span className={`text-[12px] font-medium ${up ? 'text-accent' : 'text-muted'}`} title={`Semaine dernière : ${fmt(previous)}${unit}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)} %
    </span>
  )
}

/** One-line summary of the week, shown at the top of the Entraînement tab. */
export function WeekStrip({ onOpen }: { onOpen: () => void }) {
  const { current } = useWeeks()
  const parts = [
    `${current.sportSessions} séance${current.sportSessions > 1 ? 's' : ''}`,
    current.volume > 0 ? `${fmt(current.volume)} kg` : '',
    current.records ? `${current.records} record${current.records > 1 ? 's' : ''}` : '',
    current.mobilityRoutines ? `${current.mobilityRoutines} routine${current.mobilityRoutines > 1 ? 's' : ''}` : '',
    current.danceMinutes ? `${formatMinutes(current.danceMinutes)} de danse` : '',
  ].filter(Boolean)
  return (
    <button type="button" onClick={onOpen} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line bg-surface px-3 py-2 text-left">
      <span className="text-[12px] font-semibold tracking-wide text-muted uppercase">Cette semaine</span>
      <span className="min-w-0 flex-1 text-sm">{parts.join(' · ')}</span>
      <span className="text-[13px] font-medium text-accent">+{current.xp} XP</span>
      {current.badges.length > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">{current.badges.length} badge{current.badges.length > 1 ? 's' : ''}</span>}
    </button>
  )
}

export function BadgeCard({ badge }: { badge: Badge }) {
  const unlocked = badge.unlocked_on !== null
  return (
    <div className={`flex items-center gap-3 rounded-xl border bg-surface p-3 ${unlocked ? 'border-accent' : 'border-line'}`}>
      <Medal unlocked={unlocked} />
      <div className="min-w-0 flex-1">
        <p className={`font-medium ${unlocked ? '' : 'text-muted'}`}>{badge.title}</p>
        <p className="text-[12px] text-muted">{badge.description}</p>
        {unlocked ? (
          <p className="text-[12px] font-medium text-accent">Obtenu le {formatShortDay(badge.unlocked_on!)} · +{BADGE_XP} XP</p>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1"><ProgressBar thin percent={(badge.value / badge.target) * 100} /></div>
            <span className="text-[11px] text-muted tabular-nums">{fmt(Math.min(badge.value, badge.target))} / {fmt(badge.target)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/** Recent personal records, newest first. */
export function RecordFeed({ limit = 5 }: { limit?: number }) {
  const { data } = useStore()
  const feed = recordFeed(data.training_logs, data.training_exercises).reverse().slice(0, limit)
  return (
    <section className="rounded-xl border border-line bg-surface p-3">
      <h2 className="pb-1 font-display text-base font-semibold">Derniers records</h2>
      {feed.length === 0 && <p className="text-[13px] text-muted">Ton premier record arrivera dès que tu battras une charge de ta dernière séance.</p>}
      {feed.map((r, i) => (
        <div key={`${r.logId}-${r.exercise.id}-${i}`} className="flex items-baseline gap-2 border-t border-line py-1.5 first:border-t-0">
          <span className="min-w-0 flex-1 text-sm font-medium">{r.exercise.name}</span>
          <span className="text-sm font-semibold tabular-nums">{fmt(r.value)} {r.unit}</span>
          <span className="text-[12px] text-accent tabular-nums">+{fmt(r.value - r.previous)}</span>
          <span className="w-14 text-right text-[12px] text-muted">{formatShortDay(r.day)}</span>
        </div>
      ))}
    </section>
  )
}
