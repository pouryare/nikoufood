import type { ReactNode } from 'react'

export type FilmArtName = 'farm' | 'seed' | 'milk' | 'oil' | 'cream' | 'butter' | 'table'

const petals = Array.from({ length: 14 }, (_, i) => (i * 360) / 14)
const SQUARE = '0 0 240 240'

/** Thin line drawings: the stand-in for a scene that has no photo or video yet. */
const ART: Record<FilmArtName, { viewBox: string; node: ReactNode }> = {
  // One shot: the crop on one side, cows on the other, the same sun above both.
  farm: {
    viewBox: '0 0 430 240',
    node: (
      <>
        <circle cx="215" cy="58" r="20" />
        <path d="M215 26V16M215 100v-8M183 58h-10M257 58h-10M192 35l-7-7M238 35l7-7M192 81l-7 7M238 81l7 7" />
        <path d="M8 150l24-5M178 134c80-8 168-4 244 16" />
        <path d="M262 228c14-30 34-54 60-72M312 230c6-28 16-54 30-78M366 230c-2-28-6-54-12-80M416 224c-12-30-30-56-52-72" />
        <path d="M300 146v-40M300 124c-15 0-24-9-26-22 15 0 24 9 26 22ZM300 114c13-2 21-11 23-24-13 2-21 11-23 24Z" />
        <path d="M392 148v-28M392 132c-10 0-17-6-18-15 10 0 17 6 18 15ZM392 126c9-1 15-8 16-17-9 1-15 8-16 17Z" />
        <g transform="translate(18 62) scale(0.8)">
          <path d="M78 68c32-6 72-6 98-2 10 2 13 14 12 26l-2 76h-10l-2-46c-20 6-48 6-70-2l-2 48H92l-2-50c-10-6-18-12-20-22l-12-6c-8 4-22 4-26-2-4-4-2-12 4-16l12-14c2-6 6-8 12-6 8 2 14 6 18 12Z" />
          <path d="M49 57c-2-6 0-10 5-12M58 60l10-6-3 10" />
          <path d="M146 123c0 8 4 12 10 12s10-4 10-12M188 74c8 6 10 22 8 40l-3 8-3-8" />
          <path d="M120 65c4 14 16 20 28 16 8-3 11-9 10-16M108 121v47h-8M160 123v45h8" />
          <circle cx="45" cy="71" r="1.5" />
        </g>
        <path d="M24 204l5-10 4 10M150 210l5-10 4 10M196 198l5-10 4 10" />
      </>
    ),
  },
  seed: {
    viewBox: SQUARE,
    node: (
      <>
        {petals.map((angle) => (
          <path key={angle} transform={`rotate(${angle} 120 100)`} d="M120 66c-9-10-9-22 0-34 9 12 9 24 0 34Z" />
        ))}
        <circle cx="120" cy="100" r="30" />
        <path d="M102 88l36 24M102 100l28 20M110 80l28 20M138 88l-36 24M138 100l-28 20M130 80l-28 20" />
        <path d="M120 170c0 24-3 40-10 58M114 204c-14-2-24-10-28-22 14 0 24 8 28 22Z" />
      </>
    ),
  },
  milk: {
    viewBox: SQUARE,
    node: (
      <>
        <path d="M82 100c0-16 10-22 16-32h44c6 10 16 16 16 32v96a12 12 0 0 1-12 12H94a12 12 0 0 1-12-12v-96Z" />
        <path d="M98 68V52h44v16M90 52h60" />
        <path d="M82 122c-14 0-22 8-22 18s8 18 22 18M158 122c14 0 22 8 22 18s-8 18-22 18" />
        <path d="M82 150c13-9 25 9 38 0s25-9 38 0" />
        <path d="M200 44c9 13 13 20 13 27a13 13 0 0 1-26 0c0-7 4-14 13-27Z" />
        <path d="M40 60c6 9 9 13 9 18a9 9 0 0 1-18 0c0-5 3-9 9-18Z" />
      </>
    ),
  },
  oil: {
    viewBox: SQUARE,
    node: (
      <>
        <path d="M120 30c32 46 48 74 48 100a48 48 0 0 1-96 0c0-26 16-54 48-100Z" />
        <path d="M96 134a25 25 0 0 0 17 23" />
        <path d="M52 204c22-9 46 9 68 0s46-9 68 0M72 224c17-7 32 7 48 0s31-7 48 0" />
      </>
    ),
  },
  cream: {
    viewBox: SQUARE,
    node: (
      <>
        <path d="M40 128h160a80 80 0 0 1-160 0Z" />
        <path d="M94 216h52M120 208v8" />
        <path d="M72 128c2-26 22-46 48-46 22 0 38 14 38 32 0 15-11 25-25 25-11 0-19-7-19-16 0-7 5-12 12-12" />
        <path d="M120 82c-4-14 2-26 14-34" />
      </>
    ),
  },
  butter: {
    viewBox: SQUARE,
    node: (
      <>
        <path d="M36 150l84-36 84 36-84 38-84-38Z" />
        <path d="M36 150v32l84 38v-32M204 150v32l-84 38" />
        <path d="M150 108c-21-12-48-2-48 18 0 17 20 27 35 19 13-7 12-27-3-27-12 0-17 13-8 17" />
        <path d="M70 165l34 15M146 180l30-13" />
      </>
    ),
  },
  table: {
    viewBox: SQUARE,
    node: (
      <>
        <ellipse cx="120" cy="182" rx="100" ry="28" />
        <path d="M50 176c0-42 30-74 70-74s70 32 70 74" />
        <path d="M98 94l22-10 22 10-22 10-22-10ZM98 94v9l22 10 22-10v-9" />
        <path d="M90 62c-9-11 9-17 0-30M120 54c-9-11 9-17 0-30M150 62c-9-11 9-17 0-30" />
        <path d="M78 152l11-4M104 140l11-4M130 150l11-4M152 134l11-4M94 166l11-4M142 168l11-4M118 126l11-4" />
      </>
    ),
  },
}

export function FilmArt({ name, className }: { name: FilmArtName; className?: string }) {
  const art = ART[name]
  const [, , w, h] = art.viewBox.split(' ')
  return (
    <svg
      viewBox={art.viewBox}
      className={className}
      style={{ aspectRatio: `${w} / ${h}` }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {art.node}
    </svg>
  )
}

export const isFilmArt = (value: unknown): value is FilmArtName => typeof value === 'string' && value in ART
