"use client"

import { Bomb, Flame, Heart, MousePointerClick, Play, Sparkles, Trophy } from "lucide-react"
import { COLORS, MAX_LIVES, SPECIALS, type BalloonKind } from "@/lib/game/levels"
import { BalloonArt } from "./balloon-art"

type Props = {
  mode: "menu" | "over"
  score: number
  streak: number
  level: number
  best: number
  bestLevel: number
  newRecord: boolean
  onPlay: () => void
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
    <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lg">
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

function GuideRow({
  balloons,
  title,
  children,
  wide = false,
}: {
  balloons: BalloonKind[]
  title: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ${wide ? "sm:col-span-2" : ""}`}
    >
      <div className="flex w-20 shrink-0 flex-wrap items-end justify-center gap-0.5">
        {balloons.map((kind) => (
          <BalloonArt key={kind} kind={kind} width={balloons.length > 1 ? 22 : 38} />
        ))}
      </div>
      <div className="min-w-0 text-sm leading-snug text-slate-600">
        <div className="text-base font-bold text-slate-800">{title}</div>
        {children}
      </div>
    </li>
  )
}

function BalloonGuide() {
  return (
    <section aria-labelledby="guide-title" className="mt-5 text-left">
      <h3 id="guide-title" className="text-lg font-bold text-slate-800">
        Balónky ve hře
      </h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        <GuideRow
          wide
          title="Základní barvy"
          balloons={COLORS.map((c) => c.id)}
        >
          Sedm barev, každý balónek dá 1 klik a 1 XP. Dva za sebou nikdy nemají stejnou barvu.
        </GuideRow>
        <GuideRow title={`${SPECIALS.bronze.name} (vzácný)`} balloons={["bronze"]}>
          {SPECIALS.bronze.description}
        </GuideRow>
        <GuideRow title={`${SPECIALS.silver.name} (velmi vzácný)`} balloons={["silver"]}>
          {SPECIALS.silver.description}
        </GuideRow>
        <GuideRow title={`${SPECIALS.gold.name} (téměř nikdy)`} balloons={["gold"]}>
          {SPECIALS.gold.description}
        </GuideRow>
        <GuideRow title="Hvězdný (asi 1 z 20)" balloons={["star-red", "star-blue", "star-green"]}>
          Všechny barvy s hvězdou, letí o dost rychleji a dá 5 kliků. Když uletí, ztratíš život.
        </GuideRow>
        <GuideRow wide title="Bomba" balloons={["bomb"]}>
          Nemačkej ji, přijdeš o život. Když uletí, nic se neděje.
        </GuideRow>
      </ul>
    </section>
  )
}

export function StartOverlay({
  mode,
  score,
  streak,
  level,
  best,
  bestLevel,
  newRecord,
  onPlay,
}: Props) {
  const over = mode === "over"

  return (
    <div className="absolute inset-0 z-40 flex flex-col overflow-y-auto bg-slate-900/40 p-3 sm:p-4">
      <div
        role="group"
        aria-label="Statistiky"
        onPointerDown={(event) => event.stopPropagation()}
        className="flex flex-wrap items-center justify-end gap-2 self-end"
      >
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
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="overlay-title"
        onPointerDown={(event) => event.stopPropagation()}
        className="m-auto mt-3 w-full max-w-2xl rounded-3xl bg-white p-5 text-center shadow-2xl sm:p-7"
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
            {newRecord && <p className="font-bold text-amber-600">Nový rekord!</p>}
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

        {!over && <BalloonGuide />}

        <p className="mt-5 text-slate-600">
          Nejvyšší level: <strong className="text-slate-800">{bestLevel}</strong>
        </p>

        <button
          type="button"
          autoFocus
          onClick={onPlay}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-4 text-2xl font-bold text-white transition-colors hover:bg-sky-700"
        >
          <Play className="size-6 fill-white" aria-hidden="true" />
          {over ? "Hrát znovu" : "Hrát"}
        </button>
      </div>
    </div>
  )
}
