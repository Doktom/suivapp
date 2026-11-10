import type { ReactNode } from 'react'
import { isDemo } from '../data/repo'

export type Route = 'today' | 'habits' | 'tasks' | 'agenda' | 'progress' | 'settings'

const ICONS: Record<Route, ReactNode> = {
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
  ['tasks', 'Tâches'],
  ['agenda', 'Agenda'],
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
        <main className="mx-auto max-w-5xl px-5 pt-6 lg:px-10 lg:pt-10">{children}</main>
      </div>

      <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 grid grid-cols-6 border-t border-line bg-surface px-1 pt-1.5 pb-2.5 lg:hidden">
        {NAV.map(([r, label]) => (
          <a key={r} href={`#${r}`} aria-current={r === route ? 'page' : undefined} className={`flex min-h-13 flex-col items-center justify-center gap-0.5 text-[10px] ${color(r)}`}>
            <Icon route={r} />
            {label}
          </a>
        ))}
      </nav>
    </div>
  )
}
