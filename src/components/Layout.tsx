import { useEffect, type ReactNode } from 'react'
import { isDemo } from '../data/repo'
import { useUndo } from '../data/store'

export type Route = 'today' | 'habits' | 'training' | 'tasks' | 'agenda' | 'progress' | 'settings'

const ICONS: Record<Route, ReactNode> = {
  training: <path d="M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12" />,
  today: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </>
  ),
  habits: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.8 2.8L16 9.5" />
    </>
  ),
  tasks: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
  agenda: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  progress: <path d="M4 20h16M7 20v-6M12 20V9M17 20V4" />,
  settings: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
}

const NAV: [Route, string][] = [
  ['today', "Aujourd'hui"],
  ['habits', 'Habitudes'],
  ['training', 'Entraînement'],
  ['tasks', 'Tâches'],
  ['agenda', 'Agenda'],
  ['progress', 'Progression'],
  ['settings', 'Réglages'],
]

/** How long the "Annuler" banner stays. */
const UNDO_MS = 6000

function UndoBanner() {
  const { entry, undo, dismiss } = useUndo()
  useEffect(() => {
    if (!entry) return
    const timer = setTimeout(dismiss, UNDO_MS)
    return () => clearTimeout(timer)
    // Restart the timer for each new action only, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.at])
  if (!entry) return null
  return (
    <div role="status" className="fixed inset-x-3 bottom-[84px] z-10 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-ink py-1.5 pr-1.5 pl-4 text-sm text-ground shadow-lg lg:bottom-6">
      <span className="min-w-0 flex-1 truncate">{entry.label}</span>
      <button type="button" className="min-h-11 rounded-lg px-3 font-semibold" onClick={undo}>Annuler</button>
    </div>
  )
}

/** On phones, these two live at the top instead of in the bottom bar. */
const MORE: [Route, string][] = [
  ['progress', 'Progression'],
  ['settings', 'Réglages'],
]

const Icon = ({ route }: { route: Route }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[route]}
  </svg>
)

export function Layout({ route, error, children }: { route: Route; error: string | null; children: ReactNode }) {
  const color = (r: Route) => (r === route ? 'text-accent font-semibold' : 'text-muted')
  return (
    <div className="lg:flex lg:min-h-dvh">
      <nav aria-label="Navigation principale" className="hidden w-56 flex-none flex-col gap-1 border-r border-line bg-surface p-4 lg:flex">
        <p className="mb-4 px-3 font-display text-xl font-semibold">Suivapp</p>
        {NAV.map(([r, label]) => (
          <a key={r} href={`#${r}`} aria-current={r === route ? 'page' : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${color(r)} ${r === route ? 'bg-chip' : ''}`}>
            <Icon route={r} />
            {label}
          </a>
        ))}
      </nav>

      <div className="min-w-0 flex-1 pb-24 lg:pb-8">
        {isDemo && <p className="bg-chip px-5 py-2 text-center text-xs text-muted">Mode démo : les données restent dans ce navigateur.</p>}
        {error && <p role="alert" className="bg-warn px-5 py-2 text-center text-sm text-white">{error}</p>}
        <div className="flex justify-end gap-1 px-3 pt-2 lg:hidden">
          {MORE.map(([r, label]) => (
            <a key={r} href={`#${r}`} aria-label={label} aria-current={r === route ? 'page' : undefined} className={`flex size-11 items-center justify-center rounded-lg ${r === route ? 'bg-chip text-accent' : 'text-muted'}`}>
              <Icon route={r} />
            </a>
          ))}
        </div>
        <main className="mx-auto max-w-5xl px-5 pt-2 lg:px-10 lg:pt-10">{children}</main>
      </div>

      <UndoBanner />

      <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 grid grid-cols-5 border-t border-line bg-surface px-1 pt-1.5 pb-2.5 lg:hidden">
        {NAV.filter(([r]) => !MORE.some(([m]) => m === r)).map(([r, label]) => (
          <a key={r} href={`#${r}`} aria-current={r === route ? 'page' : undefined} className={`flex min-h-13 flex-col items-center justify-center gap-0.5 text-[10px] ${color(r)}`}>
            <Icon route={r} />
            {label}
          </a>
        ))}
      </nav>
    </div>
  )
}
