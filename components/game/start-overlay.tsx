"use client"

import { Bomb, Heart, Play, Sparkles, Trophy } from "lucide-react"
import { MAX_LIVES } from "@/lib/game/levels"

type Props = {
  mode: "menu" | "over"
  score: number
  level: number
  best: number
  bestLevel: number
  newRecord: boolean
  onPlay: () => void
}

export function StartOverlay({ mode, score, level, best, bestLevel, newRecord, onPlay }: Props) {
  const over = mode === "over"

  return (
    <div className="absolute inset-0 z-40 grid place-items-center overflow-y-auto bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="overlay-title"
        onPointerDown={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8"
      >
        <h2 id="overlay-title" className="text-4xl font-bold text-slate-800">
          {over ? "Konec hry" : "Balónky"}
        </h2>

        {over ? (
          <div className="mt-3 space-y-1 text-lg text-slate-600">
            <p>
              Dal jsi <strong className="text-slate-800">{score}</strong> kliků a došel na level{" "}
              <strong className="text-slate-800">{level}</strong>.
            </p>
            {newRecord && (
              <p className="font-bold text-amber-600">Nový rekord!</p>
            )}
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5 text-left text-base text-slate-700">
            <li className="flex items-start gap-3">
              <Heart className="mt-0.5 size-5 shrink-0 fill-red-500 text-red-500" aria-hidden="true" />
              <span>
                Máš <strong>{MAX_LIVES} životy</strong>. Když ti balónek uletí, jeden ztratíš.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Bomb className="mt-0.5 size-5 shrink-0 text-slate-800" aria-hidden="true" />
              <span>
                Na <strong>bombu</strong> nemačkej, přijdeš o život.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-violet-600" aria-hidden="true" />
              <span>
                Balónek dá <strong>1 XP</strong>, splněný úkol hodně víc. XP posouvají levely.
              </span>
            </li>
          </ul>
        )}

        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-slate-700">
          <Trophy className="size-5 text-amber-500" aria-hidden="true" />
          <span>
            Rekord: <strong>{best}</strong> kliků · level <strong>{bestLevel}</strong>
          </span>
        </div>

        <button
          type="button"
          autoFocus
          onClick={onPlay}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-4 text-2xl font-bold text-white transition-colors hover:bg-sky-700"
        >
          <Play className="size-6 fill-white" aria-hidden="true" />
          {over ? "Hrát znovu" : "Hrát"}
        </button>
      </div>
    </div>
  )
}
