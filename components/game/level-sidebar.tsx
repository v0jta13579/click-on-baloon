"use client"

import { Check, Lock, RotateCcw, X } from "lucide-react"
import { getLevel, MAX_LEVEL, SPECIALS, type SpecialId } from "@/lib/game/levels"
import { taskValue, type Stats } from "@/lib/game/state"
import { BalloonArt } from "./balloon-art"

type Props = {
  currentLevel: number
  unlocked: number
  stats: Stats
  open: boolean
  onClose: () => void
  onSelect: (level: number) => void
  onNewGame: () => void
}

export function LevelSidebar({
  currentLevel,
  unlocked,
  stats,
  open,
  onClose,
  onSelect,
  onNewGame,
}: Props) {
  const levels = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1)

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Zavřít seznam levelů"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
        />
      )}
      <aside
        aria-label="Levely"
        className={`fixed inset-y-0 left-0 z-40 flex w-80 max-w-[85vw] flex-col border-r border-white/60 bg-white/90 shadow-xl backdrop-blur transition-transform md:static md:z-10 md:max-w-none md:translate-x-0 md:shadow-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 className="text-2xl font-bold text-slate-800">Levely</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít"
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <ol className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
          {levels.map((n) => {
            const locked = n > unlocked
            const active = n === currentLevel
            const done = n < unlocked
            const def = getLevel(n)

            return (
              <li key={n}>
                <button
                  type="button"
                  disabled={locked}
                  aria-current={active ? "step" : undefined}
                  onClick={() => {
                    onSelect(n)
                    onClose()
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed ${
                    active
                      ? "border-sky-500 bg-sky-50"
                      : locked
                        ? "border-transparent bg-slate-100 text-slate-400"
                        : "border-transparent bg-white hover:border-sky-200"
                  }`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full text-base font-bold ${
                      active
                        ? "bg-sky-500 text-white"
                        : done
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {locked ? (
                      <Lock className="size-4" aria-hidden="true" />
                    ) : done && !active ? (
                      <Check className="size-5" aria-hidden="true" />
                    ) : (
                      n
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-slate-800">
                      Level {n}
                    </span>
                    <span className="block text-sm text-slate-500">
                      {locked ? "Zamčeno" : `${def.tasks.length} úkoly`}
                    </span>
                  </span>
                </button>

                {active && (
                  <ul className="mx-1 mt-2 space-y-3 rounded-2xl bg-sky-50/70 p-3">
                    {def.tasks.map((task) => {
                      const value = Math.min(task.target, taskValue(task, stats))
                      const complete = value >= task.target
                      return (
                        <li key={task.id}>
                          <div className="flex items-start gap-2 text-sm text-slate-700">
                            <span
                              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                                complete
                                  ? "bg-emerald-500 text-white"
                                  : "border-2 border-slate-300"
                              }`}
                            >
                              {complete && <Check className="size-3.5" aria-hidden="true" />}
                            </span>
                            <span className={complete ? "text-slate-400 line-through" : ""}>
                              {task.label}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2 pl-7">
                            <div
                              role="progressbar"
                              aria-valuemin={0}
                              aria-valuemax={task.target}
                              aria-valuenow={value}
                              aria-label={task.label}
                              className="h-2 flex-1 overflow-hidden rounded-full bg-white"
                            >
                              <div
                                className={`h-full rounded-full transition-all ${
                                  complete ? "bg-emerald-500" : "bg-sky-500"
                                }`}
                                style={{ width: `${(value / task.target) * 100}%` }}
                              />
                            </div>
                            <span className="w-14 text-right text-xs font-semibold tabular-nums text-slate-500">
                              {value}/{task.target}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>

        <div className="border-t border-slate-200 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Bonusové balónky
          </p>
          <ul className="space-y-1.5">
            {(Object.keys(SPECIALS) as SpecialId[]).map((id) => (
              <li key={id} className="flex items-center gap-2 text-sm text-slate-700">
                <BalloonArt kind={id} width={18} />
                <span>
                  <strong>{SPECIALS[id].name}</strong> — {SPECIALS[id].description}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              onNewGame()
              onClose()
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Nová hra od levelu 1
          </button>
        </div>
      </aside>
    </>
  )
}
