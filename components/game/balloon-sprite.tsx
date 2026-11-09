"use client"

import { memo } from "react"
import { SPECIALS, COLORS, type SpecialId } from "@/lib/game/levels"
import type { Balloon } from "@/lib/game/state"
import { BalloonArt } from "./balloon-art"

function describe(kind: Balloon["kind"]) {
  if (kind in SPECIALS) return `${SPECIALS[kind as SpecialId].name} balónek`
  const color = COLORS.find((c) => c.id === kind)
  return `Balónek, ${color?.nom ?? ""}`
}

type Props = {
  balloon: Balloon
  onPop: (balloon: Balloon, clientX: number, clientY: number) => void
  onEscape: (id: number) => void
}

function BalloonSpriteBase({ balloon, onPop, onEscape }: Props) {
  const height = balloon.size * 1.42

  return (
    <button
      type="button"
      aria-label={describe(balloon.kind)}
      onPointerDown={(event) => {
        event.stopPropagation()
        onPop(balloon, event.clientX, event.clientY)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          const rect = event.currentTarget.getBoundingClientRect()
          onPop(balloon, rect.left + rect.width / 2, rect.top + rect.height / 2)
        }
      }}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onEscape(balloon.id)
      }}
      className="absolute cursor-pointer touch-none appearance-none border-0 bg-transparent p-0 outline-none focus-visible:ring-4 focus-visible:ring-white/90"
      style={{
        left: `${balloon.x}%`,
        marginLeft: -balloon.size / 2,
        bottom: -(height + 20),
        width: balloon.size,
        height,
        animation: `balloon-rise ${balloon.duration}s linear forwards`,
        willChange: "transform",
      }}
    >
      <span
        className="balloon-sway block"
        style={{
          animationDuration: `${balloon.swayDuration}s`,
          animationDelay: `-${balloon.swayDelay}s`,
        }}
      >
        <BalloonArt kind={balloon.kind} width={balloon.size} />
      </span>
    </button>
  )
}

export const BalloonSprite = memo(BalloonSpriteBase)
