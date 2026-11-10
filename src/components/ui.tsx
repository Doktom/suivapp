import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export const inputClass =
  'w-full min-h-11 rounded-lg border border-line bg-surface px-3 text-[16px] lg:text-sm text-ink'

export function Button({
  variant = 'ghost',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  const look = variant === 'primary' ? 'bg-accent text-white' : 'bg-chip text-ink'
  return (
    <button type="button" className={`min-h-11 rounded-lg px-4 text-sm font-medium ${look} ${className}`} {...props} />
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      {children}
    </label>
  )
}

export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
  }, [])
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[calc(100%-32px)] max-w-lg rounded-2xl bg-ground p-5 text-ink backdrop:bg-black/40"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <Button onClick={() => ref.current?.close()}>Fermer</Button>
      </div>
      {children}
    </dialog>
  )
}

export function ProgressBar({ percent, thin = false }: { percent: number; thin?: boolean }) {
  return (
    <div className={`${thin ? 'h-1' : 'h-2'} overflow-hidden rounded-full bg-track`}>
      <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  )
}

export function CheckButton({
  done,
  label,
  onClick,
  square = false,
}: {
  done: boolean
  label: string
  onClick: () => void
  square?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={done}
      className="flex size-11 flex-none items-center justify-center"
    >
      <span
        className={`flex size-7 items-center justify-center border-[1.5px] border-accent ${square ? 'rounded-md' : 'rounded-full'} ${done ? 'bg-accent' : ''}`}
      >
        {done && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 8.5 6.5 12 13 4.5" />
          </svg>
        )}
      </span>
    </button>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-lg font-semibold">{children}</h2>
}

export function FamilyDot({ color }: { color?: string }) {
  return <span className="inline-block size-2.5 flex-none rounded-full" style={{ background: color ?? '#9aa39a' }} aria-hidden="true" />
}

/** A family's color, faded for backgrounds. */
export const tint = (color: string | undefined, percent = 12) => `color-mix(in srgb, ${color ?? '#9aa39a'} ${percent}%, transparent)`

/** A block grouping the habits of one family: colored edge, tinted header with the family name and its stat. */
export function FamilyCard({
  name,
  color,
  stat,
  count,
  id,
  children,
}: {
  name: string
  color?: string
  stat?: string
  count?: number
  id?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="shrink-0 scroll-mt-4 overflow-hidden rounded-xl border border-line bg-surface" style={{ borderLeft: `5px solid ${color ?? '#9aa39a'}` }}>
      <h2 className="flex items-baseline gap-2 px-3 py-2" style={{ background: tint(color) }}>
        <span className="font-display text-base font-semibold">{name}</span>
        {stat && <span className="text-[13px] text-muted">· {stat}</span>}
        {count !== undefined && <span className="ml-auto text-[13px] text-muted tabular-nums">{count}</span>}
      </h2>
      <div className="px-3 [&>*:first-child]:border-t-0">{children}</div>
    </section>
  )
}
