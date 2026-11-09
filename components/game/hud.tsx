"use client"

import { useEffect, useState } from "react"
import { Flame, Menu, MousePointerClick, Trophy, Zap } from "lucide-react"

function DoubleBadge({ until }: { until: number }) {
  const [now, setNow] = useState(0)

  useEffect(() => {
    if (until === 0) return
    const tick = () => setNow(Date.now())
    const first = setTimeout(tick, 0)
    const id = setInterval(tick, 250)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [until])

  const remaining = Math.ceil((until - now) / 1000)
  if (until === 0 || remaining <= 0) return null

  return (
    <div
      role="status"
      className="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-3 py-2 text-base font-bold text-slate-700 shadow-lg ring-2 ring-white"
    >
      <Zap className="size-5 fill-slate-400 text-slate-500" aria-hidden="true" />
      x2 · {remaining} s
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 shadow-lg">
      {icon}
      <div className="leading-tight">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="text-xl font-bold tabular-nums text-slate-800">{value}</div>
      </div>
    </div>
  )
}

type Props = {
  level: number
  score: number
  best: number
  streak: number
  doubleUntil: number
  onOpenLevels: () => void
}

export function Hud({ level, score, best, streak, doubleUntil, onOpenLevels }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-center gap-2 p-3 sm:gap-3 sm:p-4">
      <button
        type="button"
        onClick={onOpenLevels}
        className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-base font-bold text-slate-800 shadow-lg md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
        Level {level}
      </button>
      <div className="hidden rounded-2xl bg-sky-600 px-4 py-2 text-xl font-bold text-white shadow-lg md:block">
        Level {level}
      </div>
      <Stat
        icon={<MousePointerClick className="size-6 text-sky-600" aria-hidden="true" />}
        label="Kliky"
        value={score}
      />
      <Stat
        icon={<Trophy className="size-6 text-amber-500" aria-hidden="true" />}
        label="Rekord"
        value={best}
      />
      <Stat
        icon={<Flame className="size-6 text-orange-500" aria-hidden="true" />}
        label="Řetěz"
        value={streak}
      />
      <DoubleBadge until={doubleUntil} />
    </div>
  )
}
