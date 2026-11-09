"use client"

import { useState } from "react"
import { Check, ChevronDown, Lock, Sparkles } from "lucide-react"
import { getTasks, MAX_LEVEL, SPECIALS, xpNeeded, type SpecialId } from "@/lib/game/levels"
import { BalloonArt } from "./balloon-art"

type Props = {
  level: number
  xp: number
  progress: Record<string, number>
  done: Record<string, boolean>
  open: boolean
  onToggle: () => void
}

export function LevelMenu({ level, xp, progress, done, open, onToggle }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const shown = expanded ?? level
  const maxed = level >= MAX_LEVEL
  const need = xpNeeded(level)
  const percent = maxed ? 100 : Math.min(100, (xp / need) * 100)
  const levels = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1)

  return (
    <div className="pointer-events-auto relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="battle-pass"
        className="flex items-center gap-3 rounded-2xl bg-white/95 py-2 pl-2 pr-3 text-left shadow-lg ring-2 ring-white transition-colors hover:bg-white"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-600 text-xl font-bold text-white">
          {level}
        </span>
        <span className="block w-32 sm:w-44">
          <span className="block text-sm font-bold leading-tight text-slate-800">
            Level {level}
          </span>
          <span
            role="progressbar"
            aria-label="Zkušenosti"
            aria-valuemin={0}
            aria-valuemax={maxed ? 1 : need}
            aria-valuenow={maxed ? 1 : xp}
            className="mt-1 block h-2.5 overflow-hidden rounded-full bg-slate-200"
          >
            <span
              className="block h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </span>
          <span className="mt-0.5 block text-xs font-semibold tabular-nums text-slate-500">
            {maxed ? "Maximální level" : `${xp} / ${need} XP`}
          </span>
        </span>
        <ChevronDown
          className={`size-5 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <section
          id="battle-pass"
          aria-label="Levely a úkoly"
          className="absolute left-0 top-full mt-2 flex max-h-[calc(100dvh-7.5rem)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
        >
          <header className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-lg font-bold text-slate-800">Battle pass</h2>
            <p className="text-sm text-slate-500">
              Hra je pozastavená. Každý balónek dá 1 XP, splněný úkol mnohem víc.
            </p>
          </header>

          <ol className="flex-1 space-y-1.5 overflow-y-auto p-2">
            {levels.map((n) => {
              const reached = n <= level
              const passed = n < level
              const tasks = getTasks(n)
              const isOpen = shown === n
              const finished = tasks.filter((t) => done[t.id]).length

              return (
                <li key={n} className="rounded-2xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`level-tasks-${n}`}
                    onClick={() => setExpanded(isOpen ? -1 : n)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left"
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-full text-base font-bold ${
                        n === level
                          ? "bg-sky-600 text-white"
                          : passed
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {passed ? (
                        <Check className="size-5" aria-hidden="true" />
                      ) : reached ? (
                        n
                      ) : (
                        <Lock className="size-4" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-800">Level {n}</span>
                      <span className="block text-sm text-slate-500">
                        {tasks.length === 0
                          ? "Maximum"
                          : reached
                            ? `Úkoly: ${finished}/${tasks.length} splněno`
                            : `${tasks.length} úkolů do levelu ${n + 1}`}
                      </span>
                    </span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div id={`level-tasks-${n}`} className="px-3 pb-3">
                      {tasks.length === 0 ? (
                        <p className="text-sm text-slate-600">
                          Dosáhl jsi nejvyššího levelu. Praskej dál a vylepši rekord.
                        </p>
                      ) : (
                        <>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Úkoly do levelu {n + 1}
                          </p>
                          <ul className="space-y-3">
                            {tasks.map((task) => {
                              const complete = !!done[task.id]
                              const value = reached ? Math.min(task.target, progress[task.id] ?? 0) : 0
                              return (
                                <li key={task.id}>
                                  <div className="flex items-start gap-2 text-sm text-slate-700">
                                    <span
                                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                                        complete
                                          ? "bg-emerald-500 text-white"
                                          : reached
                                            ? "border-2 border-slate-300"
                                            : "bg-slate-200 text-slate-400"
                                      }`}
                                    >
                                      {complete ? (
                                        <Check className="size-3.5" aria-hidden="true" />
                                      ) : (
                                        !reached && <Lock className="size-3" aria-hidden="true" />
                                      )}
                                    </span>
                                    <span
                                      className={`flex-1 ${complete ? "text-slate-400 line-through" : ""}`}
                                    >
                                      {task.label}
                                    </span>
                                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
                                      <Sparkles className="size-3" aria-hidden="true" />+
                                      {task.reward} XP
                                    </span>
                                  </div>
                                  {reached && (
                                    <div className="mt-1.5 flex items-center gap-2 pl-7">
                                      <div
                                        role="progressbar"
                                        aria-label={task.label}
                                        aria-valuemin={0}
                                        aria-valuemax={task.target}
                                        aria-valuenow={complete ? task.target : value}
                                        className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
                                      >
                                        <div
                                          className={`h-full rounded-full transition-all ${
                                            complete ? "bg-emerald-500" : "bg-sky-500"
                                          }`}
                                          style={{
                                            width: `${((complete ? task.target : value) / task.target) * 100}%`,
                                          }}
                                        />
                                      </div>
                                      <span className="w-14 text-right text-xs font-semibold tabular-nums text-slate-500">
                                        {complete ? task.target : value}/{task.target}
                                      </span>
                                    </div>
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ol>

          <footer className="hidden border-t border-slate-200 px-4 py-3 [@media(min-height:760px)]:block">
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
              <li className="flex items-center gap-2 text-sm text-slate-700">
                <BalloonArt kind="bomb" width={18} />
                <span>
                  <strong>Bomba</strong> — ztratíš život
                </span>
              </li>
            </ul>
          </footer>
        </section>
      )}
    </div>
  )
}
