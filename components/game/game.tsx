"use client"

import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { PartyPopper } from "lucide-react"
import { getLevel, MAX_LEVEL, type BalloonKind } from "@/lib/game/levels"
import { updateSave, useSave } from "@/lib/game/save"
import {
  createState,
  pendingColors,
  pickBalloonKind,
  reducer,
  type Balloon,
} from "@/lib/game/state"
import { BalloonSprite } from "./balloon-sprite"
import { Hud } from "./hud"
import { LevelSidebar } from "./level-sidebar"
import { PopBurst } from "./pop-burst"

export function Game() {
  const [state, dispatch] = useReducer(reducer, 1, (level) => createState(level))
  const save = useSave()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fieldRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef(state)
  const nextId = useRef(1)
  const lastKind = useRef<BalloonKind | null>(null)

  useEffect(() => {
    stateRef.current = state
  })

  useEffect(() => {
    if (state.score > save.best) updateSave({ best: state.score })
  }, [state.score, save.best])

  useEffect(() => {
    if (state.status === "complete" && state.level < MAX_LEVEL && state.level + 1 > save.unlocked) {
      updateSave({ unlocked: state.level + 1 })
    }
  }, [state.status, state.level, save.unlocked])

  useEffect(() => {
    if (state.status !== "playing") return

    const def = getLevel(state.level)

    const spawn = () => {
      if (document.hidden) return
      const { level, stats } = stateRef.current
      const kind = pickBalloonKind(lastKind.current, pendingColors(level, stats))
      lastKind.current = kind

      const balloon: Balloon = {
        id: nextId.current++,
        kind,
        x: 7 + Math.random() * 86,
        size: def.balloonSize,
        duration: def.riseSeconds * (0.85 + Math.random() * 0.3),
        swayDuration: 2.2 + Math.random() * 1.8,
        swayDelay: Math.random() * 3,
      }
      dispatch({ type: "spawn", balloon })
    }

    spawn()
    const interval = setInterval(spawn, def.spawnMs)
    return () => clearInterval(interval)
  }, [state.status, state.level])

  const handlePop = useCallback((balloon: Balloon, clientX: number, clientY: number) => {
    const rect = fieldRef.current?.getBoundingClientRect()
    dispatch({
      type: "pop",
      id: balloon.id,
      x: clientX - (rect?.left ?? 0),
      y: clientY - (rect?.top ?? 0),
      now: Date.now(),
    })
  }, [])

  const handleEscape = useCallback((id: number) => dispatch({ type: "escape", id }), [])
  const handleEffectDone = useCallback((id: number) => dispatch({ type: "effectDone", id }), [])

  const lastLevel = state.level >= MAX_LEVEL

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-sky-200">
      <LevelSidebar
        currentLevel={state.level}
        unlocked={save.unlocked}
        stats={state.stats}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(level) => dispatch({ type: "selectLevel", level })}
        onNewGame={() => dispatch({ type: "newGame" })}
      />

      <div
        ref={fieldRef}
        onPointerDown={() => dispatch({ type: "miss" })}
        className="sky-field relative flex-1 touch-none select-none overflow-hidden"
      >
        <h1 className="sr-only">Balónky – praskej balónky a plň úkoly</h1>

        <Hud
          level={state.level}
          score={state.score}
          best={save.best}
          streak={state.stats.streak}
          doubleUntil={state.doubleUntil}
          onOpenLevels={() => setSidebarOpen(true)}
        />

        {state.balloons.map((balloon) => (
          <BalloonSprite
            key={balloon.id}
            balloon={balloon}
            onPop={handlePop}
            onEscape={handleEscape}
          />
        ))}

        {state.effects.map((effect) => (
          <PopBurst key={effect.id} effect={effect} onDone={handleEffectDone} />
        ))}

        {state.status === "complete" && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-slate-900/30 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="level-complete-title"
              onPointerDown={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"
            >
              <PartyPopper className="mx-auto size-12 text-amber-500" aria-hidden="true" />
              <h2 id="level-complete-title" className="mt-3 text-3xl font-bold text-slate-800">
                {lastLevel ? "Vyhrál jsi!" : `Level ${state.level} splněn!`}
              </h2>
              <p className="mt-2 text-lg text-slate-600">
                Máš <strong>{state.score}</strong> kliků.
                {lastLevel
                  ? " Splnil jsi všechny levely."
                  : ` Level ${state.level + 1} bude těžší.`}
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {!lastLevel && (
                  <button
                    type="button"
                    autoFocus
                    onClick={() => dispatch({ type: "selectLevel", level: state.level + 1 })}
                    className="rounded-2xl bg-sky-600 px-6 py-3 text-lg font-bold text-white hover:bg-sky-700"
                  >
                    Další level
                  </button>
                )}
                <button
                  type="button"
                  autoFocus={lastLevel}
                  onClick={() => dispatch({ type: "selectLevel", level: state.level })}
                  className="rounded-2xl bg-slate-100 px-6 py-3 text-lg font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Hrát tento level znovu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
