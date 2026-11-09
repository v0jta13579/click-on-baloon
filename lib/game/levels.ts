export const COLORS = [
  { id: "red", nom: "červené", gen: "červených", light: "#fca5a5", base: "#ef4444", dark: "#b91c1c" },
  { id: "blue", nom: "modré", gen: "modrých", light: "#93c5fd", base: "#3b82f6", dark: "#1d4ed8" },
  { id: "green", nom: "zelené", gen: "zelených", light: "#86efac", base: "#22c55e", dark: "#15803d" },
  { id: "yellow", nom: "žluté", gen: "žlutých", light: "#fef08a", base: "#eab308", dark: "#a16207" },
  { id: "orange", nom: "oranžové", gen: "oranžových", light: "#fdba74", base: "#f97316", dark: "#c2410c" },
  { id: "purple", nom: "fialové", gen: "fialových", light: "#d8b4fe", base: "#a855f7", dark: "#7e22ce" },
  { id: "pink", nom: "růžové", gen: "růžových", light: "#f9a8d4", base: "#ec4899", dark: "#be185d" },
] as const

export type ColorId = (typeof COLORS)[number]["id"]
export type SpecialId = "bronze" | "silver" | "gold"
export type BalloonKind = ColorId | SpecialId | "bomb"

export type Palette = { light: string; base: string; dark: string }

export const SPECIALS: Record<
  SpecialId,
  Palette & { name: string; description: string; points: number; chance: number }
> = {
  bronze: {
    name: "Bronzový",
    description: "+10 kliků",
    points: 10,
    chance: 1 / 60,
    light: "#f3c9a0",
    base: "#cd7f32",
    dark: "#7c4313",
  },
  silver: {
    name: "Stříbrný",
    description: "dvojnásobné kliky na 30 s",
    points: 1,
    chance: 1 / 250,
    light: "#f8fafc",
    base: "#b6bfcc",
    dark: "#64748b",
  },
  gold: {
    name: "Zlatý",
    description: "+100 kliků",
    points: 100,
    chance: 1 / 800,
    light: "#fff7b0",
    base: "#f5b50a",
    dark: "#a15c06",
  },
}

export const BOMB_PALETTE: Palette = { light: "#64748b", base: "#1e293b", dark: "#020617" }

export const DOUBLE_POINTS_MS = 30_000
export const MAX_LIVES = 3
export const MAX_LEVEL = 30

export function isSpecial(kind: BalloonKind): kind is SpecialId {
  return kind in SPECIALS
}

export function paletteOf(kind: BalloonKind): Palette {
  if (kind === "bomb") return BOMB_PALETTE
  if (isSpecial(kind)) return SPECIALS[kind]
  return COLORS.find((c) => c.id === kind) as Palette
}

export type Task =
  | { id: string; kind: "pop"; target: number; reward: number; label: string }
  | { id: string; kind: "streak"; target: number; reward: number; label: string }
  | { id: string; kind: "bonus"; target: number; reward: number; label: string }
  | { id: string; kind: "color"; color: ColorId; target: number; reward: number; label: string }

export type Difficulty = {
  riseSeconds: number
  spawnMs: number
  balloonSize: number
  bombChance: number
}

/** XP potřebné k přechodu z levelu `level` na `level + 1`. */
export function xpNeeded(level: number): number {
  return 150 + 75 * (level - 1)
}

function reward(level: number, factor: number): number {
  return Math.round((xpNeeded(level) * factor) / 10) * 10
}

function balloonWord(count: number) {
  if (count === 1) return "balónek"
  if (count >= 2 && count <= 4) return "balónky"
  return "balónků"
}

function colorTask(level: number, colorIndex: number, target: number): Task {
  const color = COLORS[colorIndex % COLORS.length]
  return {
    id: `l${level}-color-${color.id}`,
    kind: "color",
    color: color.id,
    target,
    reward: reward(level, 0.8),
    label: `Prasknout ${target} ${target <= 4 ? color.nom : color.gen} ${balloonWord(target)}`,
  }
}

/** Úkoly, které vedou z levelu `level` na `level + 1`. */
export function getTasks(level: number): Task[] {
  if (level >= MAX_LEVEL) return []
  const n = level - 1

  const popTarget = 30 + 12 * n
  const tasks: Task[] = [
    {
      id: `l${level}-pop`,
      kind: "pop",
      target: popTarget,
      reward: reward(level, 2 / 3),
      label: `Prasknout ${popTarget} balónků`,
    },
    colorTask(level, n, 8 + 2 * n),
  ]

  const streakTarget = Math.min(60, 10 + 3 * n)
  tasks.push({
    id: `l${level}-streak`,
    kind: "streak",
    target: streakTarget,
    reward: reward(level, 1),
    label: `${streakTarget} balónků za sebou bez chyby`,
  })

  if (level >= 3) {
    const bonusTarget = level >= 12 ? 3 : level >= 7 ? 2 : 1
    tasks.push({
      id: `l${level}-bonus`,
      kind: "bonus",
      target: bonusTarget,
      reward: reward(level, 1.2),
      label:
        bonusTarget === 1
          ? "Prasknout bonusový balónek"
          : `Prasknout ${bonusTarget} bonusové balónky`,
    })
  }

  if (level >= 5) {
    tasks.push(colorTask(level, n + 3, 6 + 2 * n))
  }

  return tasks
}

export function getDifficulty(level: number): Difficulty {
  const n = level - 1
  return {
    riseSeconds: Math.max(4, 9.5 - 0.22 * n),
    spawnMs: Math.max(330, Math.round(1250 - 32 * n)),
    balloonSize: Math.max(54, Math.round(92 - 1.3 * n)),
    bombChance: Math.min(0.22, 0.09 + 0.005 * n),
  }
}
