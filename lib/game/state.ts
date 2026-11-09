import {
  COLORS,
  DOUBLE_POINTS_MS,
  SPECIALS,
  getLevel,
  type BalloonKind,
  type ColorId,
  type SpecialId,
  type Task,
} from "./levels"

export type Balloon = {
  id: number
  kind: BalloonKind
  x: number
  size: number
  duration: number
  swayDuration: number
  swayDelay: number
}

export type PopEffect = {
  id: number
  x: number
  y: number
  kind: BalloonKind
  label: string
}

export type Stats = {
  popped: number
  colors: Partial<Record<ColorId, number>>
  streak: number
  bestStreak: number
}

export type GameState = {
  level: number
  status: "playing" | "complete"
  balloons: Balloon[]
  effects: PopEffect[]
  score: number
  stats: Stats
  doubleUntil: number
}

export type Action =
  | { type: "spawn"; balloon: Balloon }
  | { type: "pop"; id: number; x: number; y: number; now: number }
  | { type: "escape"; id: number }
  | { type: "miss" }
  | { type: "effectDone"; id: number }
  | { type: "selectLevel"; level: number }
  | { type: "newGame" }

const emptyStats = (): Stats => ({
  popped: 0,
  colors: {},
  streak: 0,
  bestStreak: 0,
})

export function createState(level: number, score = 0): GameState {
  return {
    level,
    status: "playing",
    balloons: [],
    effects: [],
    score,
    stats: emptyStats(),
    doubleUntil: 0,
  }
}

export function taskValue(task: Task, stats: Stats): number {
  switch (task.kind) {
    case "pop":
      return stats.popped
    case "streak":
      return stats.bestStreak
    case "color":
      return stats.colors[task.color] ?? 0
  }
}

export function isLevelComplete(level: number, stats: Stats): boolean {
  return getLevel(level).tasks.every((t) => taskValue(t, stats) >= t.target)
}

export function pendingColors(level: number, stats: Stats): ColorId[] {
  return getLevel(level)
    .tasks.filter(
      (t): t is Extract<Task, { kind: "color" }> =>
        t.kind === "color" && taskValue(t, stats) < t.target,
    )
    .map((t) => t.color)
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "spawn": {
      if (state.status !== "playing") return state
      return { ...state, balloons: [...state.balloons, action.balloon] }
    }

    case "pop": {
      if (state.status !== "playing") return state
      const balloon = state.balloons.find((b) => b.id === action.id)
      if (!balloon) return state

      const special = balloon.kind in SPECIALS
      const multiplier = action.now < state.doubleUntil ? 2 : 1
      const base = special ? SPECIALS[balloon.kind as SpecialId].points : 1
      const gained = base * multiplier

      const streak = state.stats.streak + 1
      const stats: Stats = {
        popped: state.stats.popped + 1,
        colors: special
          ? state.stats.colors
          : {
              ...state.stats.colors,
              [balloon.kind]: (state.stats.colors[balloon.kind as ColorId] ?? 0) + 1,
            },
        streak,
        bestStreak: Math.max(state.stats.bestStreak, streak),
      }

      let label = `+${gained}`
      if (balloon.kind === "silver") label += " · x2 na 30 s"
      if (balloon.kind === "gold") label += " ZLATÝ!"

      const complete = isLevelComplete(state.level, stats)

      return {
        ...state,
        score: state.score + gained,
        stats,
        doubleUntil:
          balloon.kind === "silver" ? action.now + DOUBLE_POINTS_MS : state.doubleUntil,
        effects: [
          ...state.effects,
          { id: balloon.id, x: action.x, y: action.y, kind: balloon.kind, label },
        ],
        balloons: complete ? [] : state.balloons.filter((b) => b.id !== balloon.id),
        status: complete ? "complete" : "playing",
      }
    }

    case "escape": {
      const exists = state.balloons.some((b) => b.id === action.id)
      if (!exists) return state
      return {
        ...state,
        balloons: state.balloons.filter((b) => b.id !== action.id),
        stats: { ...state.stats, streak: 0 },
      }
    }

    case "miss": {
      if (state.status !== "playing" || state.stats.streak === 0) return state
      return { ...state, stats: { ...state.stats, streak: 0 } }
    }

    case "effectDone":
      return { ...state, effects: state.effects.filter((e) => e.id !== action.id) }

    case "selectLevel":
      return createState(action.level, state.score)

    case "newGame":
      return createState(1, 0)
  }
}

export function pickBalloonKind(
  lastKind: BalloonKind | null,
  wanted: ColorId[],
  random: () => number = Math.random,
): BalloonKind {
  const roll = random()
  let threshold = 0
  for (const id of ["gold", "silver", "bronze"] as SpecialId[]) {
    threshold += SPECIALS[id].chance
    if (roll < threshold) return id
  }

  const allowed = COLORS.map((c) => c.id as ColorId).filter((id) => id !== lastKind)
  const wantedAllowed = wanted.filter((id) => id !== lastKind)

  if (wantedAllowed.length > 0 && random() < 0.35) {
    return wantedAllowed[Math.floor(random() * wantedAllowed.length)]
  }
  return allowed[Math.floor(random() * allowed.length)]
}
