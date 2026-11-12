'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, type CSSProperties } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { MediaInfo } from '@/lib/cms'
import { emitSound } from '@/lib/sound'

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
}

const clampPct = (v: number) => Math.min(96, Math.max(4, v))

/**
 * A Persian table seen from above. Touching a dish drops a pat of butter onto it; the butter melts,
 * and a small card names the butter that suits that dish, with a link to it.
 */
export function SofrehTable({ image, dishes, hint, pairLabel, viewLabel }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const [buttered, setButtered] = useState<number[]>([])
  const dish = open === null ? null : dishes[open]

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
