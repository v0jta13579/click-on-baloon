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
export type BalloonKind = ColorId | SpecialId

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

export const DOUBLE_POINTS_MS = 30_000

export function paletteOf(kind: BalloonKind): Palette {
  if (kind in SPECIALS) return SPECIALS[kind as SpecialId]
  return COLORS.find((c) => c.id === kind) as Palette
}

export type Task =
  | { id: string; kind: "pop"; target: number; label: string }
  | { id: string; kind: "streak"; target: number; label: string }
  | { id: string; kind: "color"; color: ColorId; target: number; label: string }

export type LevelDef = {
  level: number
  tasks: Task[]
  riseSeconds: number
  spawnMs: number
  balloonSize: number
}

export const MAX_LEVEL = 20

function balloonWord(count: number) {
  if (count === 1) return "balónek"
  if (count >= 2 && count <= 4) return "balónky"
  return "balónků"
}

export function getLevel(level: number): LevelDef {
  const n = level - 1

  const popTarget = 10 + 6 * n
  const tasks: Task[] = [
    {
      id: "pop",
      kind: "pop",
      target: popTarget,
      label: `Prasknout ${popTarget} balónků`,
    },
  ]

  const first = COLORS[n % COLORS.length]
  const firstTarget = 2 + Math.ceil(level * 0.7)
  tasks.push({
    id: `color-${first.id}`,
    kind: "color",
    color: first.id,
    target: firstTarget,
    label: `Prasknout ${firstTarget} ${firstTarget <= 4 ? first.nom : first.gen} ${balloonWord(firstTarget)}`,
  })

  if (level >= 3) {
    const streak = 3 + level
    tasks.push({
      id: "streak",
      kind: "streak",
      target: streak,
      label: `${streak} balónků za sebou bez chyby`,
    })
  }

  if (level >= 6) {
    const second = COLORS[(n + 3) % COLORS.length]
    const secondTarget = 2 + Math.ceil(level * 0.5)
    tasks.push({
      id: `color-${second.id}`,
      kind: "color",
      color: second.id,
      target: secondTarget,
      label: `Prasknout ${secondTarget} ${secondTarget <= 4 ? second.nom : second.gen} ${balloonWord(secondTarget)}`,
    })
  }

  return {
    level,
    tasks,
    riseSeconds: Math.max(4.5, 10.5 - 0.32 * n),
    spawnMs: Math.max(380, Math.round(1150 - 40 * n)),
    balloonSize: Math.max(58, Math.round(94 - 1.9 * n)),
  }
}
