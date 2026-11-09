import { FamilyDot, ProgressBar } from '../components/ui'
import { useStore, useTotalXp } from '../data/store'
import { levelFromXp } from '../domain/xp'

const fmt = (n: number) => n.toLocaleString('fr-FR')

export function Progress() {
  const { data } = useStore()
  const total = levelFromXp(useTotalXp())
  const families = [...data.families].sort((a, b) => a.position - b.position)
  const habitFamily = new Map(data.habits.map((h) => [h.id, h.family_id]))
  const xpOf = (familyId: string) =>
    data.validations.filter((v) => habitFamily.get(v.habit_id) === familyId).reduce((s, v) => s + v.xp_earned, 0)

  return (
    <>
      <h1 className="pb-5 font-display text-[28px] font-semibold">Progression</h1>
      <div className="max-w-2xl">
        <div className="flex items-baseline justify-between pb-2">
          <span className="text-lg font-semibold">Niveau {total.level}</span>
          <span className="text-[13px] text-muted tabular-nums">{fmt(total.xpInLevel)} / {fmt(total.needed)} XP</span>
        </div>
        <ProgressBar percent={(total.xpInLevel / total.needed) * 100} />
        <h2 className="pt-8 pb-3 font-display text-lg font-semibold">Caractéristiques</h2>
        <div className="flex flex-col gap-4">
          {families.map((f) => {
            const stat = levelFromXp(xpOf(f.id))
            return (
              <div key={f.id} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <FamilyDot color={f.color} />
                  <span className="flex-1 font-medium">{f.stat_name}</span>
                  <span className="text-[13px] text-muted tabular-nums">Niv. {stat.level} · {fmt(stat.xpInLevel)} / {fmt(stat.needed)}</span>
                </div>
                <ProgressBar thin percent={(stat.xpInLevel / stat.needed) * 100} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
