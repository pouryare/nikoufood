'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import type { ProductCardTag } from '@/components/products/ProductCard'
import { ButtonLink } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import type { MediaInfo } from '@/lib/cms'
import { toFa } from '@/lib/format'

export type FinderMarket = { id: string; name: string; icon: IconName; productIds: string[] }
export type FinderProduct = {
  id: string
  slug: string
  name: string
  brand: string | null
  image: MediaInfo | null
  tags: ProductCardTag[]
}

type Props = {
  markets: FinderMarket[]
  products: FinderProduct[]
  emptyText: string
  cta: { label: string; href: string } | null
  groupLabel: string
}

/**
 * The market list: on a computer the name under the mouse fills with gold from right to left and a gold
 * circle with that market's drawing follows the mouse. Choosing a market (click or tap) shows its
 * products beside the list, or right under the chosen row on a phone.
 */
export function MarketFinder({ markets, products, emptyText, cta, groupLabel }: Props) {
  const first = markets.find((m) => m.productIds.length > 0) ?? markets[0]
  const [chosen, setChosen] = useState(first?.id)
  const [hover, setHover] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const floatRef = useRef<HTMLSpanElement>(null)
  const aim = useRef({ x: 0, y: 0, tx: 0, ty: 0, frame: 0 })

  const market = markets.find((m) => m.id === chosen) ?? first
  const shown = market ? products.filter((p) => market.productIds.includes(p.id)) : []
  const lit = markets.find((m) => m.id === hover)

  useEffect(() => {
    const a = aim.current
    return () => cancelAnimationFrame(a.frame)
  }, [])

  const glide = () => {
    const a = aim.current
    const el = floatRef.current
    a.x += (a.tx - a.x) * 0.2
    a.y += (a.ty - a.y) * 0.2
    if (el) el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`
    a.frame = Math.abs(a.tx - a.x) + Math.abs(a.ty - a.y) > 0.4 ? requestAnimationFrame(glide) : 0
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !listRef.current) return
    const box = listRef.current.getBoundingClientRect()
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-market]')
    const a = aim.current
    a.tx = e.clientX - box.left
    a.ty = e.clientY - box.top
    if (!hover) {
      a.x = a.tx
      a.y = a.ty
    }
    setHover(row?.dataset.market ?? null)
    if (!a.frame) a.frame = requestAnimationFrame(glide)
  }

  const panel = (
    <div className="finder-panel" key={market?.id}>
      <p className="finder-panel-head">
        {market ? <Icon name={market.icon} size={20} /> : null}
        <span>{market?.name}</span>
        {shown.length ? (
          <span className="finder-pill">
            <Icon name="box" size={14} />
            <b>{toFa(shown.length)}</b>
          </span>
        ) : null}
      </p>
      {shown.length ? (
        <ul className="finder-cards">
          {shown.map((p, i) => (
            <li key={p.id} className="finder-card" style={{ '--i': i } as CSSProperties}>
              <span className="finder-card-pic">
                {p.image ? (
                  <Image
                    src={p.image.url}
                    alt={p.image.alt}
                    fill
                    sizes="9rem"
                    className="object-contain p-2"
                  />
                ) : null}
              </span>
              <span className="min-w-0">
                {p.brand ? <span className="finder-card-brand">{p.brand}</span> : null}
                <Link href={`/products/${p.slug}`} className="finder-card-link">
                  {p.name}
                </Link>
                <span className="finder-card-tags">
                  {p.tags.map((t) => (
                    <span key={t.label}>
                      {t.icon ? <Icon name={t.icon} size={13} /> : null}
                      {t.label}
                    </span>
                  ))}
                </span>
              </span>
              <Icon name="arrowUpLeft" size={18} className="finder-card-arrow" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="finder-empty">
          <Icon name="chat" size={20} />
          {emptyText}
        </p>
      )}
      {cta ? (
        <ButtonLink href={cta.href} variant="outline" className="mt-6">
          {cta.label}
        </ButtonLink>
      ) : null}
    </div>
  )

  return (
    <div className="finder mt-12">
      <div
        ref={listRef}
        className="finder-list"
        role="group"
        aria-label={groupLabel}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {markets.map((m, i) => (
          <div
            key={m.id}
            className="finder-row"
            data-market={m.id}
            data-on={m.id === market?.id ? '' : undefined}
            data-reveal
            style={{ '--i': i % 6 } as CSSProperties}
          >
            <button
              type="button"
              className="finder-btn"
              aria-pressed={m.id === market?.id}
              onClick={() => setChosen(m.id)}
            >
              <span aria-hidden className="finder-icon">
                <Icon name={m.icon} size={22} />
              </span>
              <span className="finder-name" data-text={m.name}>
                {m.name}
              </span>
              <span className="finder-count">
                <Icon name="box" size={14} />
                {m.productIds.length ? toFa(m.productIds.length) : '–'}
              </span>
              <Icon name="arrowLeft" size={20} className="finder-go" />
            </button>
            {m.id === market?.id ? <div className="finder-inline">{panel}</div> : null}
          </div>
        ))}
        <span ref={floatRef} aria-hidden className="finder-float" data-show={lit ? '' : undefined}>
          {lit ? <Icon name={lit.icon} size={40} strokeWidth={1.3} /> : null}
        </span>
      </div>
      <div className="finder-side" aria-live="polite">
        {panel}
      </div>
    </div>
  )
}
