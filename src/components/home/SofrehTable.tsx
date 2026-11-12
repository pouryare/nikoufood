'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { MediaInfo } from '@/lib/cms'
import { emitSound } from '@/lib/sound'
import './butter-art.css'

export type SofrehDish = {
  name: string
  x: number
  y: number
  note?: string | null
  product: { name: string; slug: string; image: MediaInfo | null } | null
}

type Props = {
  image: MediaInfo
  dishes: SofrehDish[]
  hint?: string | null
  pairLabel: string
  viewLabel: string
  /** The dish (index) where the travelling butter lands and melts, if it is on. */
  butterDish?: number | null
  /** Anything drawn over the photo, above the dishes (for example a greeting). */
  overlay?: ReactNode
}

/** Outline of the melted pool: an uneven blob, wider than tall. */
const POOL =
  'M30 52C22 34 44 16 70 18C92 12 122 20 134 38C146 52 138 76 112 82C92 90 62 88 46 80C34 76 34 62 30 52Z'

const clampPct = (v: number) => Math.min(96, Math.max(4, v))

/**
 * A Persian table seen from above. Touching a dish drops a pat of butter onto it; the butter melts,
 * and a small card names the butter that suits that dish, with a link to it.
 */
export function SofrehTable({ image, dishes, hint, pairLabel, viewLabel, butterDish, overlay }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const [buttered, setButtered] = useState<number[]>([])
  const dish = open === null ? null : dishes[open]
  const landing = typeof butterDish === 'number' ? dishes[butterDish] : null

  const choose = (i: number) => {
    setOpen(i)
    if (!buttered.includes(i)) {
      setButtered((list) => [...list, i])
      // The sizzle starts as the butter lands (only heard when the visitor turned sound on).
      window.setTimeout(() => emitSound('sizzle'), 380)
    }
  }

  return (
    <div
      className="sofreh"
      style={
        dish
          ? ({ '--cx': `${clampPct(dish.x)}%`, '--cy': `${clampPct(dish.y)}%` } as CSSProperties)
          : undefined
      }
    >
      <div className="sofreh-frame">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 1023px) 100vw, 72rem"
          style={{ objectPosition: image.focal }}
          className="object-cover"
        />
        <span aria-hidden className="sofreh-dim" data-on={open !== null ? '' : undefined} />
        {landing ? (
          <>
            {/* Where the travelling butter lands: it melts into a glossy pool while the rice steams. */}
            <span aria-hidden className="sofreh-soak" style={{ left: `${landing.x}%`, top: `${landing.y}%` } as CSSProperties} />
            <span aria-hidden className="sofreh-puddle" style={{ left: `${landing.x}%`, top: `${landing.y}%` } as CSSProperties}>
              <svg viewBox="0 0 160 100">
                <defs>
                  {/* Melted butter is clear gold: thin and pale in the middle, deeper where it gathers at the rim. */}
                  <radialGradient id="sofreh-pool" cx="0.46" cy="0.44" r="0.62">
                    <stop offset="0" stopColor="#ffd45c" stopOpacity="0.34" />
                    <stop offset="0.55" stopColor="#f7b632" stopOpacity="0.5" />
                    <stop offset="0.88" stopColor="#e0920f" stopOpacity="0.66" />
                    <stop offset="1" stopColor="#b86f06" stopOpacity="0.78" />
                  </radialGradient>
                  <linearGradient id="sofreh-rim" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fffbe8" stopOpacity="0.95" />
                    <stop offset="0.45" stopColor="#fff3c4" stopOpacity="0.15" />
                    <stop offset="1" stopColor="#7a4300" stopOpacity="0.55" />
                  </linearGradient>
                  <filter id="sofreh-soft" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.1" />
                  </filter>
                  <clipPath id="sofreh-pool-clip">
                    <path d={POOL} />
                  </clipPath>
                </defs>
                <path d={POOL} fill="url(#sofreh-pool)" />
                <g clipPath="url(#sofreh-pool-clip)">
                  <path d={POOL} fill="none" stroke="url(#sofreh-rim)" strokeWidth="5" filter="url(#sofreh-soft)" />
                  {/* Reflections of the light above the table. */}
                  <path d="M40 40C48 27 66 22 84 24" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.85" filter="url(#sofreh-soft)" />
                  <path d="M44 38C51 29 62 26 74 26" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                  <ellipse cx="104" cy="30" rx="6" ry="2.6" fill="#fff" opacity="0.9" transform="rotate(14 104 30)" />
                  <path d="M92 74C104 73 116 68 124 60" fill="none" stroke="#fff6d6" strokeWidth="2.4" strokeLinecap="round" opacity="0.5" filter="url(#sofreh-soft)" />
                </g>
                <g fill="#f2b848" fillOpacity="0.75">
                  <ellipse cx="149" cy="70" rx="5" ry="3.8" />
                  <ellipse cx="17" cy="73" rx="3.4" ry="2.6" />
                  <ellipse cx="128" cy="90" rx="2.4" ry="1.9" />
                </g>
                <g fill="#fff" opacity="0.9">
                  <circle cx="147.5" cy="68.6" r="1.1" />
                  <circle cx="16" cy="72" r="0.8" />
                </g>
              </svg>
              <i className="sofreh-lump" />
            </span>
            <span aria-hidden className="sofreh-steam" style={{ left: `${landing.x}%`, top: `${landing.y}%` } as CSSProperties}>
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span aria-hidden data-butter-stop="table" className="butter-stop" style={{ left: `${landing.x}%`, top: `${landing.y + 1.5}%` } as CSSProperties} />
          </>
        ) : null}
        {dishes.map((d, i) => (
          <div
            key={`${d.name}-${i}`}
            className="sofreh-spot"
            style={{ left: `${d.x}%`, top: `${d.y}%` } as CSSProperties}
            data-open={open === i ? '' : undefined}
            data-buttered={buttered.includes(i) ? '' : undefined}
          >
            <span aria-hidden className="sofreh-butter">
              <i />
            </span>
            <button
              type="button"
              className="sofreh-dot"
              aria-pressed={open === i}
              aria-controls="sofreh-card"
              onClick={() => choose(i)}
            >
              <span className="sofreh-name">{d.name}</span>
            </button>
          </div>
        ))}
        {overlay}
      </div>

      <div
        id="sofreh-card"
        className="sofreh-card"
        aria-live="polite"
        data-side={dish && dish.x > 50 ? 'left' : 'right'}
        data-on={dish ? '' : undefined}
      >
        {dish ? (
          <div key={open} className="sofreh-card-in">
            <p className="eyebrow">{dish.name}</p>
            {dish.product ? (
              <>
                <p className="mt-3 text-small text-muted">{pairLabel}</p>
                <div className="mt-2 flex items-center gap-4">
                  {dish.product.image ? (
                    <span className="sofreh-card-thumb">
                      <Image
                        src={dish.product.image.url}
                        alt=""
                        fill
                        sizes="4.5rem"
                        className="object-contain p-1"
                      />
                    </span>
                  ) : null}
                  <h3 className="text-h3 leading-snug">{dish.product.name}</h3>
                </div>
              </>
            ) : null}
            {dish.note ? <p className="mt-3 text-small text-muted">{dish.note}</p> : null}
            {dish.product ? (
              <Link href={`/products/${dish.product.slug}`} className="sofreh-card-link">
                {viewLabel}
                <Icon name="arrowLeft" size={18} />
              </Link>
            ) : null}
          </div>
        ) : hint ? (
          <p className="sofreh-hint">{hint}</p>
        ) : null}
      </div>
    </div>
  )
}
