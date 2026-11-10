import { useMemo, useState } from 'react'
import { EventDialog } from '../components/EventDialog'
import { TaskDialog } from '../components/TaskDialog'
import { Button, inputClass, ProgressBar } from '../components/ui'
import { useStore, useToday, useValidationIndex } from '../data/store'
import { agendaItems, quotaLines, type AgendaFilters, type AgendaItem, type ItemKind, type ItemState } from '../domain/agenda'
import { addDays, addMonths, firstOfMonth, formatLongDay, formatMonth, formatShortDay, mondayOf } from '../domain/date'
import { computeStreak } from '../domain/streak'
import type { CalendarEvent } from '../domain/types'

type View = 'day' | 'week' | 'month'

const VIEW_LABELS: Record<View, string> = { day: 'Jour', week: 'Semaine', month: 'Mois' }
const KIND_LABELS: Record<ItemKind, string> = { habit: 'Habitudes', task: 'Tâches', event: 'Événements' }
const STATE_LABELS: Record<ItemState, string> = { done: 'fait', todo: 'à faire', missed: 'manqué', grace: 'jour de grâce', late: 'en retard' }
const WEEK_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const stateClass = (s: ItemState) =>
  s === 'done' ? 'text-muted line-through' : s === 'missed' || s === 'late' ? 'text-warn' : s === 'grace' ? 'text-warn italic' : ''

function Mark({ item }: { item: AgendaItem }) {
  const shape = item.kind === 'event' ? 'rounded-sm' : item.kind === 'task' ? 'rounded-[3px] border-2 bg-transparent' : 'rounded-full'
  const fill = item.state === 'done' || item.kind === 'event' ? { background: item.color, borderColor: item.color } : { borderColor: item.color, border: `2px solid ${item.color}` }
  return <span aria-hidden="true" className={`inline-block size-2.5 flex-none ${shape}`} style={fill} />
}

function ItemLine({ item, onEvent, compact = false }: { item: AgendaItem; onEvent: (e: CalendarEvent) => void; compact?: boolean }) {
  const content = (
    <>
      <Mark item={item} />
      {!compact && <span className="w-20 flex-none text-[13px] text-muted tabular-nums">{item.when}</span>}
      <span className={`min-w-0 flex-1 ${compact ? 'leading-tight break-words' : 'truncate'} ${stateClass(item.state)}`}>{item.title}</span>
      {!compact && item.state !== 'todo' && <span className={`flex-none text-[12px] ${stateClass(item.state).replace('line-through', '')}`}>{STATE_LABELS[item.state]}</span>}
    </>
  )
  const cls = `flex w-full gap-2 text-left ${compact ? 'min-h-7 items-baseline py-0.5 text-[13px]' : 'min-h-11 items-center border-t border-line'}`
  return item.event ? (
    <button type="button" className={cls} onClick={() => onEvent(item.event!)} aria-label={`${item.title}, ${item.when}`}>{content}</button>
  ) : (
    <div className={cls}>{content}</div>
  )
}

export function Agenda() {
  const { data } = useStore()
  const today = useToday()
  const index = useValidationIndex()
  const [view, setView] = useState<View>('week')
  const [anchor, setAnchor] = useState(today)
  const [filters, setFilters] = useState<AgendaFilters>({ kinds: { habit: true, task: true, event: true }, familyId: '', listId: '' })
  const [eventDialog, setEventDialog] = useState<{ event: CalendarEvent | null; day: string } | null>(null)
  const [taskDay, setTaskDay] = useState<string | null>(null)

  const streaks = useMemo(() => new Map(data.habits.map((h) => [h.id, computeStreak(h, index, today)])), [data.habits, index, today])
  const itemsOf = (day: string) => agendaItems(data, day, today, index, streaks, filters)
  const openEvent = (event: CalendarEvent) => setEventDialog({ event, day: event.day })

  const step = (delta: number) => setAnchor(view === 'day' ? addDays(anchor, delta) : view === 'week' ? addDays(anchor, 7 * delta) : addMonths(firstOfMonth(anchor), delta))
  const monday = mondayOf(anchor)
  const title =
    view === 'day' ? formatLongDay(anchor) : view === 'week' ? `${formatShortDay(monday)} – ${formatShortDay(addDays(monday, 6))}` : formatMonth(anchor)
  const pill = (active: boolean) => `min-h-[38px] rounded-md px-3 text-[13px] font-medium ${active ? 'bg-surface' : ''}`
  const chip = (active: boolean) => `min-h-9 rounded-full px-3 text-[13px] font-medium ${active ? 'bg-accent text-white' : 'bg-chip'}`
  const openDay = (day: string) => {
    setAnchor(day)
    setView('day')
  }
  const quota = filters.kinds.habit && !filters.listId ? quotaLines(data.habits, anchor, index, filters.familyId) : []

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <h1 className="font-display text-[28px] font-semibold">Agenda</h1>
        <div className="flex gap-2">
          <Button onClick={() => setTaskDay(anchor)}>+ Tâche</Button>
          <Button variant="primary" onClick={() => setEventDialog({ event: null, day: anchor })}>+ Événement</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <div className="flex rounded-lg bg-chip p-[3px]">
          {(Object.keys(VIEW_LABELS) as View[]).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} className={pill(view === v)} onClick={() => setView(v)}>{VIEW_LABELS[v]}</button>
          ))}
        </div>
        <div className="flex w-full items-center text-sm sm:w-auto">
          <button type="button" aria-label="Période précédente" className="size-11 text-lg" onClick={() => step(-1)}>‹</button>
          <span className="min-w-0 flex-1 text-center font-medium sm:min-w-40">{title}</span>
          <button type="button" aria-label="Période suivante" className="size-11 text-lg" onClick={() => step(1)}>›</button>
          <Button className="ml-1" onClick={() => setAnchor(today)}>Aujourd'hui</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-4">
        {(Object.keys(KIND_LABELS) as ItemKind[]).map((k) => (
          <button key={k} type="button" aria-pressed={filters.kinds[k]} className={chip(filters.kinds[k])} onClick={() => setFilters({ ...filters, kinds: { ...filters.kinds, [k]: !filters.kinds[k] } })}>
            {KIND_LABELS[k]}
          </button>
        ))}
        <select aria-label="Filtrer par famille" className={`${inputClass} !min-h-9 !w-auto`} value={filters.familyId} onChange={(e) => setFilters({ ...filters, familyId: e.target.value, listId: '' })}>
          <option value="">Toutes les familles</option>
          {[...data.families].sort((a, b) => a.position - b.position).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select aria-label="Filtrer par liste" className={`${inputClass} !min-h-9 !w-auto`} value={filters.listId} onChange={(e) => setFilters({ ...filters, listId: e.target.value, familyId: '' })}>
          <option value="">Toutes les listes</option>
          {data.task_lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {view !== 'month' && quota.length > 0 && (
        <section aria-label="Cette semaine" className="mb-4 rounded-xl bg-surface p-3">
          <h2 className="pb-1 text-[13px] font-semibold text-muted">Cette semaine · sans jour fixe</h2>
          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {quota.map((q) => (
              <div key={q.habit.id} className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{q.habit.name}</span>
                <div className="w-16"><ProgressBar thin percent={(q.done / q.quota) * 100} /></div>
                <span className="w-24 text-right text-[13px] text-muted tabular-nums">{q.done} / {q.quota}{q.monthly ? ' ce mois' : ''}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {view === 'day' && (
        <div className="max-w-3xl">
          {itemsOf(anchor).length === 0 && <p className="border-t border-line py-4 text-muted">Rien de prévu ce jour.</p>}
          {itemsOf(anchor).map((item) => <ItemLine key={item.key} item={item} onEvent={openEvent} />)}
        </div>
      )}

      {view === 'week' && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7 xl:gap-2">
          {Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map((day, i) => {
            const items = itemsOf(day)
            return (
              <div key={day} className={`rounded-xl p-2 ${day === today ? 'bg-surface ring-1 ring-accent' : 'bg-surface/60'}`}>
                <button type="button" className="flex min-h-9 w-full items-baseline gap-2 text-left" onClick={() => openDay(day)} aria-label={`Voir le ${formatLongDay(day)}`}>
                  <span className="font-semibold">{WEEK_HEADERS[i]}</span>
                  <span className="text-[13px] text-muted">{formatShortDay(day)}</span>
                </button>
                {items.length === 0 && <p className="text-[13px] text-muted">—</p>}
                {items.map((item) => <ItemLine key={item.key} item={item} onEvent={openEvent} compact />)}
              </div>
            )
          })}
        </div>
      )}

      {view === 'month' && (
        <div>
          <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[12px] font-semibold text-muted">
            {WEEK_HEADERS.map((h) => <span key={h}>{h}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const first = firstOfMonth(anchor)
              const start = mondayOf(first)
              const end = addDays(addMonths(first, 1), -1)
              const cells: string[] = []
              for (let d = start; d <= end || cells.length % 7 !== 0; d = addDays(d, 1)) cells.push(d)
              return cells.map((day) => {
                const items = itemsOf(day)
                const inMonth = day.slice(0, 7) === first.slice(0, 7)
                return (
                  <button key={day} type="button" onClick={() => openDay(day)} aria-label={`${formatLongDay(day)} : ${items.length} éléments`} className={`flex min-h-16 flex-col items-start gap-1 rounded-lg p-1.5 text-left lg:min-h-24 ${day === today ? 'bg-surface ring-1 ring-accent' : 'bg-surface/60'} ${inMonth ? '' : 'opacity-40'}`}>
                    <span className="text-[13px] font-semibold tabular-nums">{Number(day.slice(8))}</span>
                    <span className="flex flex-wrap gap-1">
                      {items.slice(0, 8).map((item) => <Mark key={item.key} item={item} />)}
                    </span>
                    <span className="hidden w-full flex-col lg:flex">
                      {items.filter((it) => it.kind !== 'habit').slice(0, 2).map((item) => (
                        <span key={item.key} className={`truncate text-[12px] ${stateClass(item.state)}`}>{item.title}</span>
                      ))}
                    </span>
                  </button>
                )
              })
            })()}
          </div>
          <p className="pt-2 text-[12px] text-muted">● habitude (pleine si faite) · ■ événement · □ tâche</p>
        </div>
      )}

      {eventDialog && <EventDialog event={eventDialog.event} defaultDay={eventDialog.day} onClose={() => setEventDialog(null)} />}
      {taskDay && <TaskDialog task={null} defaultDue={taskDay} onClose={() => setTaskDay(null)} />}
    </>
  )
}
