import { useId } from "react"
import { paletteOf, SPECIALS, type BalloonKind } from "@/lib/game/levels"

const STAR_POINTS =
  "50,35 54.7,48.5 69,48.8 57.6,57.5 61.8,71.2 50,63 38.2,71.2 42.4,57.5 31,48.8 45.3,48.5"

export function BalloonArt({
  kind,
  width,
  className,
}: {
  kind: BalloonKind
  width: number
  className?: string
}) {
  const gradientId = useId()
  const palette = paletteOf(kind)
  const special = kind in SPECIALS

  if (kind === "bomb") {
    return (
      <svg
        viewBox="0 0 100 142"
        width={width}
        height={width * 1.42}
        aria-hidden="true"
        className={className}
        style={{ filter: "drop-shadow(0 0 8px rgba(239, 68, 68, 0.7))" }}
      >
        <defs>
          <radialGradient id={gradientId} cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor={palette.light} />
            <stop offset="0.5" stopColor={palette.base} />
            <stop offset="1" stopColor={palette.dark} />
          </radialGradient>
        </defs>
        <path
          d="M50 120 C42 127 58 133 50 141"
          fill="none"
          stroke="#475569"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="50" cy="68" r="46" fill={`url(#${gradientId})`} />
        <rect x="38" y="14" width="24" height="14" rx="3" fill="#334155" />
        <path
          d="M50 16 C50 6 62 8 64 -2"
          transform="translate(0 6)"
          fill="none"
          stroke="#a16207"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <g className="bomb-spark">
          <polygon
            points="64,-8 67,2 77,0 70,7 75,15 65,11 58,18 60,8 52,3 62,3"
            transform="translate(0 6)"
            fill="#fbbf24"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
        <ellipse
          cx="30"
          cy="50"
          rx="8"
          ry="15"
          fill="#fff"
          opacity="0.28"
          transform="rotate(-25 30 50)"
        />
        <path d="M50 114 L42 122 L58 122 Z" fill={palette.dark} />
        <circle cx="50" cy="70" r="15" fill="#ef4444" />
        <path
          d="M44 64 L56 76 M56 64 L44 76"
          stroke="#fff"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 100 142"
      width={width}
      height={width * 1.42}
      aria-hidden="true"
      className={className}
      style={
        kind === "gold"
          ? { filter: "drop-shadow(0 0 10px rgba(250, 204, 21, 0.95))" }
          : kind === "silver"
            ? { filter: "drop-shadow(0 0 7px rgba(226, 232, 240, 0.95))" }
            : undefined
      }
    >
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="28%" r="80%">
          <stop offset="0" stopColor={palette.light} />
          <stop offset="0.55" stopColor={palette.base} />
          <stop offset="1" stopColor={palette.dark} />
        </radialGradient>
      </defs>
      <path
        d="M50 122 C42 128 58 134 50 141"
        fill="none"
        stroke="#475569"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M50 3 C82 3 98 29 98 54 C98 84 72 108 50 113 C28 108 2 84 2 54 C2 29 18 3 50 3 Z"
        fill={`url(#${gradientId})`}
      />
      <path d="M50 111 L42 123 L58 123 Z" fill={palette.dark} />
      <ellipse
        cx="30"
        cy="32"
        rx="9"
        ry="16"
        fill="#fff"
        opacity="0.45"
        transform="rotate(-25 30 32)"
      />
      {special && (
        <g transform="translate(50 55) scale(1.35) translate(-50 -55)">
          <polygon
            points={STAR_POINTS}
            fill="#fff"
            fillOpacity="0.92"
            stroke={palette.dark}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  )
}
