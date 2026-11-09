"use client"

import { useEffect, useState } from "react"
import { Heart, Zap } from "lucide-react"
import { MAX_LIVES } from "@/lib/game/levels"
import { LevelMenu } from "./level-menu"

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

function Lives({ lives }: { lives: number }) {
  return (
    <div
      role="img"
      aria-label={`Životy: ${lives} ze ${MAX_LIVES}`}
      className="flex items-center gap-1 rounded-2xl bg-white/90 px-3 py-3 shadow-lg"
    >
      {Array.from({ length: MAX_LIVES }, (_, i) => (
        <Heart
          key={i}
          aria-hidden="true"
          className={`size-6 ${
            i < lives ? "fill-red-500 text-red-500" : "fill-transparent text-slate-300"
          }`}
        />
      ))}
    </div>
  )
}

type Props = {
  level: number
  xp: number
  lives: number
  doubleUntil: number
  progress: Record<string, number>
  done: Record<string, boolean>
  menuOpen: boolean
  onToggleMenu: () => void
}

export function Hud({
  level,
  xp,
  lives,
  doubleUntil,
  progress,
  done,
  menuOpen,
  onToggleMenu,
}: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-wrap items-start gap-2 p-3 sm:gap-3 sm:p-4">
      <LevelMenu
        level={level}
        xp={xp}
        progress={progress}
        done={done}
        open={menuOpen}
        onToggle={onToggleMenu}
      />
      <Lives lives={lives} />
      <DoubleBadge until={doubleUntil} />
    </div>
  )
}
