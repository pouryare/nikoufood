'use client'

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Icon, iconName, type IconName } from '@/components/ui/Icon'
import { leadingFigure } from '@/lib/icons'

export type BentoItem = {
  id?: string | null
  title: string
  text?: string | null
  icon?: string | null
}

type Kind = 'big' | 'routes' | 'seal' | 'beam' | 'rotate' | 'icon'

const kindOf = (icon: IconName | null, index: number, hasMarkets: boolean): Kind => {
  if (index === 0) return 'big'
  if (icon === 'truck' || icon === 'map' || icon === 'route') return 'routes'
  if (icon === 'shield' || icon === 'award' || icon === 'check') return 'seal'
  if (icon === 'headset' || icon === 'users' || icon === 'chat' || icon === 'handshake')
    return 'beam'
  if (hasMarkets && (icon === 'building' || icon === 'store' || icon === 'cart')) return 'rotate'
  return 'icon'
}

/** Gold routes leaving one hub, drawn again and again. */
function Routes() {
  const lines = [
    'M250 32C200 6 120 8 40 14',
    'M250 32C190 40 120 52 60 54',
    'M250 32C210 22 170 26 130 30',
    'M250 32C230 50 200 58 170 60',
  ]
  return (
    <svg viewBox="0 0 300 66" className="bento-routes" aria-hidden>
      {lines.map((d) => (
        <path key={`b${d}`} d={d} className="bento-route-base" />
      ))}
      {lines.map((d, i) => (
        <path key={d} d={d} className="bento-route" style={{ animationDelay: `${-i * 0.7}s` }} />
      ))}
      <circle cx="250" cy="32" r="5" className="bento-hub" />
      {[
        [40, 14],
        [60, 54],
        [130, 30],
        [170, 60],
      ].map(([x, y]) => (
        <circle key={`${x}`} cx={x} cy={y} r="2.6" className="bento-node" />
      ))}
    </svg>
  )
}

/** Two slowly turning rings around the tile's icon, like a seal. */
function Seal({ icon }: { icon: IconName }) {
  return (
    <span className="bento-seal" aria-hidden>
      <svg viewBox="0 0 60 60">
        <circle className="bento-ring-a" cx="30" cy="30" r="27" />
        <circle className="bento-ring-b" cx="30" cy="30" r="20" />
      </svg>
      <Icon name={icon} size={24} />
    </span>
  )
}

/** Two people (or a team and a partner) with a light travelling between them. */
function Beam({ icon }: { icon: IconName }) {
  return (
    <span className="bento-beam" aria-hidden>
      <span className="bento-beam-end">
        <Icon name={icon} size={20} />
      </span>
      <svg viewBox="0 0 80 8" preserveAspectRatio="none">
        <path d="M2 4h76" className="bento-beam-base" />
        <path d="M2 4h76" className="bento-beam-light" />
      </svg>
      <span className="bento-beam-end">
        <Icon name="users" size={20} />
      </span>
    </span>
  )
}

/** A word that keeps changing: the kinds of businesses the company works with. */
function Rotating({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (words.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), 2200)
    return () => window.clearInterval(id)
  }, [words.length])
  return (
    <span className="bento-rot" aria-hidden>
      {words.map((w, i) => (
        <span
          key={w}
          data-state={
            i === index ? 'in' : i === (index - 1 + words.length) % words.length ? 'out' : undefined
          }
        >
          {w}
        </span>
      ))}
    </span>
  )
}

/**
 * «چرا نیکو اعتماد» as tiles of different sizes. The first reason gets the biggest tile and its number
 * set huge; every other tile has a small moving picture chosen by its icon. The tile edges catch the light
 * under the mouse.
 */
export function Bento({ items, markets }: { items: BentoItem[]; markets: string[] }) {
  const ref = useRef<HTMLUListElement>(null)
  const onMove = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    for (const tile of ref.current.querySelectorAll<HTMLElement>('.bento-tile')) {
      const r = tile.getBoundingClientRect()
      tile.style.setProperty('--px', `${(e.clientX - r.left).toFixed(0)}px`)
      tile.style.setProperty('--py', `${(e.clientY - r.top).toFixed(0)}px`)
    }
  }

  return (
    <ul ref={ref} className="bento" data-count={items.length} onPointerMove={onMove}>
      {items.map((item, i) => {
        const icon = iconName(item.icon)
        const kind = kindOf(icon, i, markets.length > 1)
        const figure = kind === 'big' ? leadingFigure(item.text) : null
        return (
          <li
            key={item.id ?? item.title}
            className="bento-tile"
            data-kind={kind}
            data-reveal
            style={{ '--i': i } as CSSProperties}
          >
            <p className="bento-head">
              {icon ? (
                <span aria-hidden className="bento-icon">
                  <Icon name={icon} size={18} />
                </span>
              ) : null}
              <span>{item.title}</span>
            </p>
            {kind === 'big' ? (
              figure ? (
                <p aria-hidden className="bento-big">
                  <span className="bento-big-num">{figure.value}</span>
                  {figure.unit ? <span className="bento-big-unit">{figure.unit}</span> : null}
                </p>
              ) : icon ? (
                <span aria-hidden className="bento-big-icon">
                  <Icon name={icon} size={72} strokeWidth={1.1} />
                </span>
              ) : null
            ) : null}
            {kind === 'routes' ? <Routes /> : null}
            {kind === 'seal' && icon ? <Seal icon={icon} /> : null}
            {kind === 'beam' && icon ? <Beam icon={icon} /> : null}
            {kind === 'rotate' ? <Rotating words={markets} /> : null}
            {kind === 'icon' && icon ? (
              <span aria-hidden className="bento-float">
                <Icon name={icon} size={30} strokeWidth={1.3} />
              </span>
            ) : null}
            {item.text ? <p className="bento-text">{item.text}</p> : null}
          </li>
        )
      })}
    </ul>
  )
}
