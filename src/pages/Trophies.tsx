import { useMemo, useState, type ReactNode } from 'react'
import { FamilyDot, ProgressBar, SectionTitle } from '../components/ui'
import { useBadges, useStore, useTotalXp, useValidationIndex } from '../data/store'
import { addDays, formatShortDay, mondayOf } from '../domain/date'
import {
  completeMonths,
  completeWeeks,
  completionRate,
  equivalence,
  habitFunStats,
  habitVictories,
  MONTH_THRESHOLD,
  perfectDays,
  runs,
  streakBoard,
  type Victory,
} from '../domain/fun'
import { levelFromXp } from '../domain/xp'
import { BADGE_GROUP_LABELS, recordFeed, weekSummary, type BadgeGroup } from '../training/achievements'
import { formatMinutes, STYLE_LABELS } from '../training/dance'
import { volume } from '../training/logic'
import { BadgeCard, Delta, RecordFeed } from '../training/Trophies'

const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
const pct = (r: number) => `${Math.round(r * 100)} %`
const GROUPS = Object.keys(BADGE_GROUP_LABELS) as BadgeGroup[]
const VICTORY_DAYS = 14
const VICTORIES_SHOWN = 12
const STREAKS_SHOWN = 6

function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-2 rounded-xl border border-line bg-surface p-3 ${className}`}>
      {title && <h2 className="font-display text-base font-semibold">{title}</h2>}
      {children}
    </section>
  )
}

function Stat({ label, display, value, previous }: { label: string; display: string; value: number; previous: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="font-display text-2xl font-semibold tabular-nums">{display}</p>
      <p className="flex items-center gap-2 text-[12px] text-muted"><Delta current={value} previous={previous} /></p>
    </div>
  )
}

/** Level, XP and characteristics (the former Progression tab). */
function Level() {
  const { data } = useStore()
  const total = levelFromXp(useTotalXp())
  const families = [...data.families].sort((a, b) => a.position - b.position)
  const habitFamily = new Map(data.habits.map((h) => [h.id, h.family_id]))
  // Sport goals count for Sport (Force); dance figures and goals for Danse (Grâce).
  const sportFamily = data.families.find((f) => f.name === 'Sport')?.id ?? data.families.find((f) => f.stat_name === 'Force')?.id
  const danceFamily = data.families.find((f) => f.name === 'Danse')?.id ?? data.families.find((f) => f.stat_name === 'Grâce')?.id
  const xpOf = (familyId: string) =>
    data.validations.filter((v) => habitFamily.get(v.habit_id) === familyId).reduce((s, v) => s + v.xp_earned, 0) +
    data.training_logs.filter((l) => l.family_id === familyId).reduce((s, l) => s + l.xp_earned, 0) +
    data.dance_sessions.filter((d) => d.family_id === familyId).reduce((s, d) => s + d.xp_earned, 0) +
    (familyId === sportFamily ? data.training_goals.reduce((s, g) => s + g.xp_earned, 0) : 0) +
    (familyId === danceFamily ? data.dance_figures.reduce((s, f) => s + f.xp_earned, 0) + data.dance_goals.reduce((s, g) => s + g.xp_earned, 0) : 0)
  const stats = families.map((f) => ({ family: f, xp: xpOf(f.id) }))
  const favourite = [...stats].sort((a, b) => b.xp - a.xp)[0]

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-2xl font-semibold">Niveau {total.level}</span>
        <span className="text-[13px] text-muted tabular-nums">{fmt(total.xpInLevel)} / {fmt(total.needed)} XP</span>
      </div>
      <ProgressBar percent={(total.xpInLevel / total.needed) * 100} />
      <div className="grid gap-x-6 gap-y-2 pt-2 sm:grid-cols-2">
        {stats.map(({ family, xp }) => {
          const stat = levelFromXp(xp)
          return (
            <div key={family.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <FamilyDot color={family.color} />
                <span className="flex-1 font-medium">{family.stat_name}</span>
                <span className="text-[12px] text-muted tabular-nums">niv. {stat.level}</span>
              </div>
              <ProgressBar thin percent={(stat.xpInLevel / stat.needed) * 100} />
            </div>
          )
        })}
      </div>
      {favourite && favourite.xp > 0 && <p className="text-[13px] text-muted">Caractéristique chouchoute : <strong className="text-ink">{favourite.family.stat_name}</strong> ({fmt(favourite.xp)} XP).</p>}
    </Card>
  )
}

export function Trophies() {
  const { data, today } = useStore()
  const index = useValidationIndex()
  const badges = useBadges()
  const [week, setWeek] = useState<'current' | 'previous'>('current')

  const habits = data.habits
  const perfect = useMemo(() => perfectDays(habits, index, today), [habits, index, today])
  const weeks = useMemo(() => completeWeeks(habits, index, today), [habits, index, today])
  const months = useMemo(() => completeMonths(habits, index, today), [habits, index, today])
  const board = useMemo(() => streakBoard(habits, index, today), [habits, index, today])
  const fun = useMemo(() => habitFunStats(data, index, today), [data, index, today])
  const perfectRuns = runs(perfect, today)

  // The week shown and the one before it, habits and training together.
  const monday = week === 'current' ? mondayOf(today) : addDays(mondayOf(today), -7)
  const before = addDays(monday, -7)
  const habitWeek = (m: string) => {
    const end = addDays(m, 6)
    return {
      rate: completionRate(habits, index, m, end, today),
      perfect: perfect.filter((d) => d >= m && d <= end).length,
      tasks: data.tasks.filter((t) => !t.parent_id && t.completed_at && t.completed_at.slice(0, 10) >= m && t.completed_at.slice(0, 10) <= end).length,
      xp: data.validations.filter((v) => v.day >= m && v.day <= end).reduce((s, v) => s + v.xp_earned, 0),
    }
  }
  const h = habitWeek(monday)
  const hb = habitWeek(before)
  const t = weekSummary(data, monday, badges)
  const tb = weekSummary(data, before, badges)

  // Small victories: habits, records, badges, dance figures, goals.
  const victories: Victory[] = useMemo(() => {
    const from = addDays(today, -VICTORY_DAYS + 1)
    const list: Victory[] = [...habitVictories(habits, index, today, VICTORY_DAYS)]
    for (const r of recordFeed(data.training_logs, data.training_exercises)) {
      if (r.day >= from) list.push({ day: r.day, text: `Record : ${r.exercise.name} à ${fmt(r.value)} ${r.unit} (+${fmt(r.value - r.previous)})` })
    }
    for (const b of badges) if (b.unlocked_on && b.unlocked_on >= from) list.push({ day: b.unlocked_on, text: `Badge débloqué : ${b.title}` })
    for (const f of data.dance_figures) if (f.mastered_on && f.mastered_on >= from) list.push({ day: f.mastered_on, text: `Figure maîtrisée en ${STYLE_LABELS[f.style].toLowerCase()} : ${f.name}` })
    for (const g of [...data.dance_goals, ...data.training_goals]) if (g.achieved_on && g.achieved_on >= from) list.push({ day: g.achieved_on, text: `Objectif atteint : ${g.title}` })
    return list.sort((a, b) => b.day.localeCompare(a.day)).slice(0, VICTORIES_SHOWN)
  }, [habits, index, today, data.training_logs, data.training_exercises, badges, data.dance_figures, data.dance_goals, data.training_goals])

  // Quirky stats.
  const tonnage = data.training_logs.reduce((s, l) => s + volume(l.sets), 0)
  const trainingMinutes = data.training_logs.reduce((s, l) => s + l.duration_s / 60, 0) + data.dance_sessions.filter((d) => d.status === 'done').reduce((s, d) => s + d.duration_min, 0)
  const totalMinutes = fun.minutesInvested + trainingMinutes
  type Quirk = { label: string; value: string; note?: string }
  const quirky = ([

    fun.chronotype ? { label: 'Ton profil', value: `Plutôt ${fun.chronotype}`, note: 'D’après le moment de tes habitudes validées.' } : null,
    fun.busiestWeekday ? { label: 'Ton jour fort', value: `Le ${fun.busiestWeekday}`, note: 'Le jour où tu coches le plus.' } : null,
    fun.bestDay ? { label: 'Journée record', value: `${fun.bestDay.count} habitudes`, note: `le ${formatShortDay(fun.bestDay.day)}` } : null,
    { label: 'Coches au total', value: fmt(fun.totalValidations), note: fun.tasksDone ? `et ${fmt(fun.tasksDone)} tâches bouclées` : undefined },
    totalMinutes >= 30 ? { label: 'Temps investi', value: formatMinutes(Math.round(totalMinutes)), note: [equivalence(totalMinutes, 'min') && `soit ${equivalence(totalMinutes, 'min')}`, 'habitudes chronométrées, entraînement et danse'].filter(Boolean).join(' · ') } : null,
    tonnage >= 70 ? { label: 'Tonnage soulevé', value: `${fmt(Math.round(tonnage))} kg`, note: equivalence(tonnage, 'kg') ? `soit ${equivalence(tonnage, 'kg')}` : undefined } : null,
    fun.avoidDaysHeld ? { label: 'Jours de résistance', value: fmt(fun.avoidDaysHeld), note: 'tenus sur tes habitudes à éviter' } : null,
    fun.faithful ? { label: 'La plus fidèle', value: fun.faithful.habit.name, note: `${pct(fun.faithful.rate)} sur 30 jours` } : null,
    fun.shy && fun.shy.rate < 0.7 ? { label: 'La plus boudée', value: fun.shy.habit.name, note: `${pct(fun.shy.rate)} sur 30 jours : on lui redonne sa chance ?` } : null,
  ] as (Quirk | null)[]).filter((x): x is Quirk => x !== null)

  const pill = (active: boolean) => `min-h-[38px] rounded-md px-3 text-[13px] font-medium ${active ? 'bg-surface' : ''}`
  const unlocked = badges.filter((b) => b.unlocked_on).length

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-[28px] font-semibold">Trophées</h1>
      <Level />

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionTitle>Bilan de la semaine</SectionTitle>
          <div className="flex rounded-lg bg-chip p-[3px]">
            <button type="button" aria-pressed={week === 'current'} className={pill(week === 'current')} onClick={() => setWeek('current')}>Cette semaine</button>
            <button type="button" aria-pressed={week === 'previous'} className={pill(week === 'previous')} onClick={() => setWeek('previous')}>Semaine dernière</button>
          </div>
        </div>
        <p className="text-[13px] text-muted">Du {formatShortDay(monday)} au {formatShortDay(addDays(monday, 6))}, comparé à la semaine d'avant.</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Stat label="Habitudes tenues" display={h.rate.due ? pct(h.rate.rate) : '—'} value={Math.round(h.rate.rate * 100)} previous={Math.round(hb.rate.rate * 100)} />
          <Stat label="Journées parfaites" display={String(h.perfect)} value={h.perfect} previous={hb.perfect} />
          <Stat label="Séances de sport" display={String(t.sportSessions)} value={t.sportSessions} previous={tb.sportSessions} />
          <Stat label="Volume (kg)" display={fmt(t.volume)} value={t.volume} previous={tb.volume} />
          <Stat label="Routines de mobilité" display={String(t.mobilityRoutines)} value={t.mobilityRoutines} previous={tb.mobilityRoutines} />
          <Stat label="Danse" display={formatMinutes(t.danceMinutes)} value={t.danceMinutes} previous={tb.danceMinutes} />
          <Stat label="Tâches terminées" display={String(h.tasks)} value={h.tasks} previous={hb.tasks} />
          <Stat label="XP gagnée" display={fmt(h.xp + t.xp)} value={h.xp + t.xp} previous={hb.xp + tb.xp} />
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
        <Card title="Petites victoires">
          {victories.length === 0 && <p className="text-[13px] text-muted">Elles apparaîtront ici : journées parfaites, séries, records, badges…</p>}
          {victories.map((v, i) => (
            <div key={i} className="flex items-baseline gap-2 border-t border-line pt-1.5 first-of-type:border-t-0">
              <span aria-hidden="true" className="text-accent">★</span>
              <span className="min-w-0 flex-1 text-sm">{v.text}</span>
              <span className="text-[12px] text-muted">{formatShortDay(v.day)}</span>
            </div>
          ))}
        </Card>

        <Card title="Régularité">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-chip p-2">
              <p className="font-display text-2xl font-semibold tabular-nums">{perfect.length}</p>
              <p className="text-[12px] text-muted">journées parfaites</p>
            </div>
            <div className="rounded-lg bg-chip p-2">
              <p className="font-display text-2xl font-semibold tabular-nums">{weeks.length}</p>
              <p className="text-[12px] text-muted">semaines complètes</p>
            </div>
            <div className="rounded-lg bg-chip p-2">
              <p className="font-display text-2xl font-semibold tabular-nums">{months.length}</p>
              <p className="text-[12px] text-muted">mois complets</p>
            </div>
          </div>
          <p className="text-[13px] text-muted">
            Journées parfaites d'affilée : <strong className="text-ink">{perfectRuns.current}</strong> en cours, record <strong className="text-ink">{perfectRuns.longest}</strong>.
            {' '}Une semaine est complète si chaque habitude n'a qu'un oubli au plus et que les quotas sont tenus ; un mois, s'il dépasse {pct(MONTH_THRESHOLD)}.
          </p>
          <h3 className="pt-1 text-[12px] font-semibold tracking-wide text-muted uppercase">Séries en cours</h3>
          {board.filter((b) => b.best > 0).slice(0, STREAKS_SHOWN).map((b) => (
            <div key={b.habit.id} className="flex items-center gap-2 text-sm">
              <span className="min-w-0 flex-1 truncate">{b.habit.name}</span>
              <span className="w-24"><ProgressBar thin percent={b.best ? (b.current / b.best) * 100 : 0} /></span>
              <span className="w-28 text-right text-[12px] text-muted tabular-nums">
                <strong className="text-ink">{b.current} j</strong> · record {b.best} j
              </span>
            </div>
          ))}
          {board.every((b) => b.best === 0) && <p className="text-[13px] text-muted">Les séries de tes habitudes s'afficheront ici.</p>}
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <SectionTitle>Stats décalées</SectionTitle>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {quirky.map((q) => (
            <div key={q.label} className="rounded-xl border border-line bg-surface p-3">
              <p className="text-[12px] font-semibold tracking-wide text-muted uppercase">{q.label}</p>
              <p className="font-display text-lg leading-tight font-semibold">{q.value}</p>
              {q.note && <p className="text-[12px] text-muted">{q.note}</p>}
            </div>
          ))}
        </div>
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
