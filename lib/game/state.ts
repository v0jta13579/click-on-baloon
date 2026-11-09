import {
  COLORS,
  DOUBLE_POINTS_MS,
  MAX_LEVEL,
  MAX_LIVES,
  SPECIALS,
  getDifficulty,
  getTasks,
  isSpecial,
  xpNeeded,
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

export type Notice = { id: number; text: string; tone: "task" | "level" }

export type GameState = {
  status: "menu" | "playing" | "over"
  level: number
  xp: number
  lives: number
  score: number
  popped: number
  streak: number
  progress: Record<string, number>
  done: Record<string, boolean>
  balloons: Balloon[]
  effects: PopEffect[]
  notices: Notice[]
  noticeSeq: number
  hurt: number
  doubleUntil: number
}

export type Action =
  | { type: "start" }
  | { type: "spawn"; balloon: Balloon }
  | { type: "pop"; id: number; x: number; y: number; now: number }
  | { type: "escape"; id: number }
  | { type: "miss" }
  | { type: "effectDone"; id: number }
  | { type: "noticeDone"; id: number }

export function createState(status: GameState["status"] = "menu"): GameState {
  return {
    status,
    level: 1,
    xp: 0,
    lives: MAX_LIVES,
    score: 0,
    popped: 0,
    streak: 0,
    progress: {},
    done: {},
    balloons: [],
    effects: [],
    notices: [],
    noticeSeq: 0,
    hurt: 0,
    doubleUntil: 0,
  }
}

/** Úkoly všech dosažených levelů, které ještě nejsou splněné. */
export function activeTasks(level: number, done: Record<string, boolean>): Task[] {
  const tasks: Task[] = []
  for (let l = 1; l <= Math.min(level, MAX_LEVEL - 1); l++) {
    for (const task of getTasks(l)) {
      if (!done[task.id]) tasks.push(task)
    }
  }
  return tasks
}

export function pendingColors(level: number, done: Record<string, boolean>): ColorId[] {
  return activeTasks(level, done)
    .filter((t): t is Extract<Task, { kind: "color" }> => t.kind === "color")
    .map((t) => t.color)
}

function loseLife(state: GameState): GameState {
  const lives = state.lives - 1
  const over = lives <= 0
  return {
    ...state,
    lives: Math.max(0, lives),
    streak: 0,
    hurt: state.hurt + 1,
    status: over ? "over" : state.status,
    balloons: over ? [] : state.balloons,
  }
}

function advanceTasks(
  state: GameState,
  kind: BalloonKind,
  streak: number,
): { progress: Record<string, number>; done: Record<string, boolean>; xp: number; notices: string[] } {
  const progress = { ...state.progress }
  const done = { ...state.done }
  let xp = 0
  const notices: string[] = []

  for (const task of activeTasks(state.level, state.done)) {
    const current = progress[task.id] ?? 0
    let next = current
    switch (task.kind) {
      case "pop":
        next = current + 1
        break
      case "color":
        if (kind === task.color) next = current + 1
        break
      case "bonus":
        if (isSpecial(kind)) next = current + 1
        break
      case "streak":
        next = Math.max(current, streak)
        break
    }
    progress[task.id] = Math.min(task.target, next)
    if (next >= task.target) {
      done[task.id] = true
      xp += task.reward
      notices.push(`Úkol splněn: ${task.label} (+${task.reward} XP)`)
    }
  }

  return { progress, done, xp, notices }
}

function addXp(
  state: GameState,
  gained: number,
): { level: number; xp: number; levelUps: number[] } {
  let { level, xp } = state
  const levelUps: number[] = []
  xp += gained
  while (level < MAX_LEVEL && xp >= xpNeeded(level)) {
    xp -= xpNeeded(level)
    level += 1
    levelUps.push(level)
  }
  if (level >= MAX_LEVEL) xp = 0
  return { level, xp, levelUps }
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "start":
      return createState("playing")

    case "spawn": {
      if (state.status !== "playing") return state
      return { ...state, balloons: [...state.balloons, action.balloon] }
    }

    case "pop": {
      if (state.status !== "playing") return state
      const balloon = state.balloons.find((b) => b.id === action.id)
      if (!balloon) return state

      const remaining = state.balloons.filter((b) => b.id !== balloon.id)

      if (balloon.kind === "bomb") {
        const hit = loseLife({ ...state, balloons: remaining })
        return {
          ...hit,
          effects: [
            ...state.effects,
            { id: balloon.id, x: action.x, y: action.y, kind: "bomb", label: "BUM! -1 život" },
          ],
        }
      }

      const multiplier = action.now < state.doubleUntil ? 2 : 1
      const base = isSpecial(balloon.kind) ? SPECIALS[balloon.kind as SpecialId].points : 1
      const gained = base * multiplier

      const streak = state.streak + 1
      const tasks = advanceTasks(state, balloon.kind, streak)
      const levelResult = addXp(state, 1 + tasks.xp)

      const notices = [
        ...tasks.notices.map((text) => ({ text, tone: "task" as const })),
        ...levelResult.levelUps.map((level) => ({
          text: `Level ${level}! Odemčeny nové úkoly`,
          tone: "level" as const,
        })),
      ].map((notice, i) => ({ ...notice, id: state.noticeSeq + i + 1 }))

      let label = `+${gained}`
      if (balloon.kind === "silver") label += " · x2 na 30 s"
      if (balloon.kind === "gold") label += " ZLATÝ!"

      return {
        ...state,
        level: levelResult.level,
        xp: levelResult.xp,
        score: state.score + gained,
        popped: state.popped + 1,
        streak,
        progress: tasks.progress,
        done: tasks.done,
        doubleUntil:
          balloon.kind === "silver" ? action.now + DOUBLE_POINTS_MS : state.doubleUntil,
        balloons: remaining,
        effects: [
          ...state.effects,
          { id: balloon.id, x: action.x, y: action.y, kind: balloon.kind, label },
        ],
        notices: [...state.notices, ...notices],
        noticeSeq: state.noticeSeq + notices.length,
      }
    }

    case "escape": {
      const balloon = state.balloons.find((b) => b.id === action.id)
      if (!balloon) return state
      const remaining = state.balloons.filter((b) => b.id !== balloon.id)
      if (balloon.kind === "bomb") return { ...state, balloons: remaining }
      return loseLife({ ...state, balloons: remaining })
    }

    case "miss": {
      if (state.status !== "playing" || state.streak === 0) return state
      return { ...state, streak: 0 }
    }

    case "effectDone":
      return { ...state, effects: state.effects.filter((e) => e.id !== action.id) }

    case "noticeDone":
      return { ...state, notices: state.notices.filter((n) => n.id !== action.id) }
  }
}

export function pickBalloonKind(
  lastKind: BalloonKind | null,
  level: number,
  wanted: ColorId[],
  random: () => number = Math.random,
): BalloonKind {
  if (lastKind !== "bomb" && random() < getDifficulty(level).bombChance) return "bomb"

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
