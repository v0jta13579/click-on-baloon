"use client"

import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { Sparkles, Trophy } from "lucide-react"
import { STAR_SPEED, getDifficulty, isStar, type BalloonKind } from "@/lib/game/levels"
import { updateSave, useSave } from "@/lib/game/save"
import {
  createState,
  pendingColors,
  pickBalloonKind,
  reducer,
  type Balloon,
  type Notice,
} from "@/lib/game/state"
import { BalloonSprite } from "./balloon-sprite"
import { Hud } from "./hud"
import { PopBurst } from "./pop-burst"
import { StartOverlay } from "./start-overlay"

function Toast({ notice, onDone }: { notice: Notice; onDone: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(notice.id), 3500)
    return () => clearTimeout(timer)
  }, [notice.id, onDone])

  const level = notice.tone === "level"

  return (
    <div
      className={`toast-in flex items-center gap-2 rounded-2xl px-4 py-2.5 text-base font-bold shadow-xl ${
        level ? "bg-violet-600 text-white" : "bg-white text-slate-800"
      }`}
    >
      {level ? (
        <Trophy className="size-5 shrink-0 text-amber-300" aria-hidden="true" />
      ) : (
        <Sparkles className="size-5 shrink-0 text-violet-600" aria-hidden="true" />
      )}
      {notice.text}
    </div>
  )
}

export function Game() {
  const [state, dispatch] = useReducer(reducer, undefined, () => createState("menu"))
  const save = useSave()
  const [menuOpen, setMenuOpen] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)

  const fieldRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef(state)
  const nextId = useRef(1)
  const lastKind = useRef<BalloonKind | null>(null)
  const [recordAtStart, setRecordAtStart] = useState(0)

  useEffect(() => {
    stateRef.current = state
  })

  useEffect(() => {
    if (state.score > save.best) updateSave({ best: state.score })
    if (state.level > save.bestLevel) updateSave({ bestLevel: state.level })
  }, [state.score, state.level, save.best, save.bestLevel])

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden)
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  const paused = menuOpen || tabHidden
  const playing = state.status === "playing"

  useEffect(() => {
    if (!playing || paused) return

    const spawn = () => {
      const { level, done } = stateRef.current
      const def = getDifficulty(level)
      const kind = pickBalloonKind(lastKind.current, level, pendingColors(level, done))
      lastKind.current = kind

      const balloon: Balloon = {
        id: nextId.current++,
        kind,
        x: 7 + Math.random() * 86,
        size: def.balloonSize,
        duration: def.riseSeconds * (0.85 + Math.random() * 0.3) * (isStar(kind) ? STAR_SPEED : 1),
        swayDuration: 2.2 + Math.random() * 1.8,
        swayDelay: Math.random() * 3,
      }
      dispatch({ type: "spawn", balloon })
    }

    spawn()
    const interval = setInterval(spawn, getDifficulty(state.level).spawnMs)
    return () => clearInterval(interval)
  }, [playing, paused, state.level])

  const handlePlay = useCallback(() => {
    setRecordAtStart(save.best)
    lastKind.current = null
    setMenuOpen(false)
    dispatch({ type: "start" })
  }, [save.best])

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
  const handleNoticeDone = useCallback((id: number) => dispatch({ type: "noticeDone", id }), [])

  return (
    <main className="h-dvh w-full overflow-hidden bg-sky-200">
      <div
        ref={fieldRef}
        onPointerDown={() => dispatch({ type: "miss" })}
        data-paused={paused}
        className="sky-field relative h-full touch-none select-none overflow-hidden"
      >
        <h1 className="sr-only">Balónky – praskej balónky, plň úkoly a získávej levely</h1>

        {state.hurt > 0 && (
          <div key={state.hurt} aria-hidden="true" className="hurt-flash absolute inset-0 z-20" />
        )}

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

        {menuOpen && (
          <button
            type="button"
            aria-label="Zavřít levely a pokračovat ve hře"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 z-20 cursor-default bg-slate-900/30"
          />
        )}

        <Hud
          level={state.level}
          xp={state.xp}
          lives={state.lives}
          doubleUntil={state.doubleUntil}
          progress={state.progress}
          done={state.done}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((open) => !open)}
        />

        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 bottom-6 z-30 flex flex-col items-center gap-2 px-3"
        >
          {state.notices.map((notice) => (
            <Toast key={notice.id} notice={notice} onDone={handleNoticeDone} />
          ))}
        </div>

        {state.status !== "playing" && (
          <StartOverlay
            mode={state.status}
            score={state.score}
            streak={state.bestStreak}
            level={state.level}
            best={save.best}
            bestLevel={save.bestLevel}
            newRecord={state.status === "over" && state.score > 0 && state.score > recordAtStart}
            onPlay={handlePlay}
          />
        )}
      </div>
    </main>
  )
}
