import { useState } from 'react'
import { ProgressBar, SectionTitle } from '../components/ui'
import { useBadges, useStore } from '../data/store'
import { addDays, formatShortDay, mondayOf } from '../domain/date'
import { BADGE_GROUP_LABELS, BADGE_XP, change, recordFeed, weekSummary, type Badge, type BadgeGroup, type WeekSummary } from './achievements'
import { formatMinutes } from './dance'

const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
const GROUPS = Object.keys(BADGE_GROUP_LABELS) as BadgeGroup[]

function useWeeks() {
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
function Medal({ unlocked }: { unlocked: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" className="flex-none">
      <path d="M12 3h5l3 9h-5zM24 3h-5l-3 9h5z" fill={unlocked ? 'var(--color-accent)' : 'var(--color-track)'} opacity={unlocked ? 0.6 : 1} />
      <circle cx="18" cy="22" r="10" fill={unlocked ? 'var(--color-accent)' : 'none'} stroke={unlocked ? 'var(--color-accent)' : 'var(--color-track)'} strokeWidth="2" />
      {unlocked && <path d="M13.5 22.3 16.7 25.4 22.8 18.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

function Delta({ current, previous, unit = '' }: { current: number; previous: number; unit?: string }) {
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

function Stat({ label, value, previous, display }: { label: string; value: number; previous: number; display: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="font-display text-2xl font-semibold tabular-nums">{display}</p>
      <p className="flex items-center gap-2 text-[12px] text-muted">
        <Delta current={value} previous={previous} />
        <span>sem. d'avant : {label === 'Danse' ? formatMinutes(previous) : fmt(previous)}</span>
      </p>
    </div>
  )
}

function Summary({ week, previous }: { week: WeekSummary; previous: WeekSummary }) {
  const best = [
    week.records > 0 ? `${week.records} record${week.records > 1 ? 's' : ''} battu${week.records > 1 ? 's' : ''}` : '',
    week.sportSessions >= 3 ? 'semaine de sport complète' : '',
    week.mobilityDays >= 5 ? `${week.mobilityDays} jours de mobilité` : '',
    week.badges.length ? `${week.badges.length} badge${week.badges.length > 1 ? 's' : ''} gagné${week.badges.length > 1 ? 's' : ''}` : '',
  ].filter(Boolean)
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Stat label="Séances de sport" value={week.sportSessions} previous={previous.sportSessions} display={String(week.sportSessions)} />
        <Stat label="Volume (kg)" value={week.volume} previous={previous.volume} display={fmt(week.volume)} />
        <Stat label="Routines de mobilité" value={week.mobilityRoutines} previous={previous.mobilityRoutines} display={String(week.mobilityRoutines)} />
        <Stat label="Danse" value={week.danceMinutes} previous={previous.danceMinutes} display={formatMinutes(week.danceMinutes)} />
      </div>
      <p className="rounded-xl bg-chip px-3 py-2 text-sm">
        <strong>+{week.xp} XP</strong> cette semaine{best.length ? ` · ${best.join(' · ')}` : ''}.
      </p>
    </div>
  )
}

function BadgeCard({ badge }: { badge: Badge }) {
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

/** Weekly summary, records and badges. */
export function Trophies() {
  const { current, previous, beforePrevious, badges } = useWeeks()
  const [week, setWeek] = useState<'current' | 'previous'>('current')
  const shown = week === 'current' ? current : previous
  const compared = week === 'current' ? previous : beforePrevious
  const unlocked = badges.filter((b) => b.unlocked_on).length
  const pill = (active: boolean) => `min-h-[38px] rounded-md px-3 text-[13px] font-medium ${active ? 'bg-surface' : ''}`
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionTitle>Bilan de la semaine</SectionTitle>
          <div className="flex rounded-lg bg-chip p-[3px]">
            <button type="button" aria-pressed={week === 'current'} className={pill(week === 'current')} onClick={() => setWeek('current')}>Cette semaine</button>
            <button type="button" aria-pressed={week === 'previous'} className={pill(week === 'previous')} onClick={() => setWeek('previous')}>Semaine dernière</button>
          </div>
        </div>
        <p className="text-[13px] text-muted">Semaine du {formatShortDay(shown.monday)} au {formatShortDay(addDays(shown.monday, 6))}</p>
        <Summary week={shown} previous={compared} />
      </section>

      <RecordFeed limit={8} />

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <SectionTitle>Badges</SectionTitle>
          <span className="text-sm text-muted tabular-nums">{unlocked} / {badges.length}</span>
        </div>
        {GROUPS.map((g) => (
          <div key={g} className="flex flex-col gap-2">
            <h3 className="text-[12px] font-semibold tracking-wide text-muted uppercase">{BADGE_GROUP_LABELS[g]}</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {badges
                .filter((b) => b.group === g)
                .sort((a, b) => Number(!!b.unlocked_on) - Number(!!a.unlocked_on))
                .map((b) => <BadgeCard key={b.id} badge={b} />)}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
