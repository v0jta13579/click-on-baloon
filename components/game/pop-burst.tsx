"use client"

import { memo } from "react"
import { paletteOf } from "@/lib/game/levels"
import type { PopEffect } from "@/lib/game/state"

const SHARDS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2
  const distance = 46 + (i % 3) * 14
  return {
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance),
  }
})

function PopBurstBase({
  effect,
  onDone,
}: {
  effect: PopEffect
  onDone: (id: number) => void
}) {
  const palette = paletteOf(effect.kind)

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-20"
      style={{ left: effect.x, top: effect.y }}
    >
      {SHARDS.map((shard, i) => (
        <span
          key={i}
          className="pop-shard absolute block size-3 rounded-full"
          style={
            {
              background: palette.base,
              "--dx": `${shard.dx}px`,
              "--dy": `${shard.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
      <span
        className="pop-label absolute left-0 top-0 whitespace-nowrap text-xl font-bold text-white"
        style={{ textShadow: `0 2px 0 ${palette.dark}, 0 0 8px rgba(0,0,0,0.25)` }}
        onAnimationEnd={() => onDone(effect.id)}
      >
        {effect.label}
      </span>
    </div>
  )
}

export const PopBurst = memo(PopBurstBase)
