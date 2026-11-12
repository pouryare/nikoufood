'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'
import { toFa } from '@/lib/format'

export type RouteStep = {
  title: string
  text?: string | null
  short?: string | null
  icon?: IconName | null
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/** The lines of the drawing; `step` is the step (0–3) whose part of the scroll draws it. */
const PATHS: { step: number; d: string }[] = [
  { step: 0, d: 'M372 62C340 92 300 118 262 150' },
  { step: 1, d: 'M262 150C210 112 168 84 118 72' },
  { step: 1, d: 'M262 150C196 162 140 182 92 206' },
  { step: 1, d: 'M262 150C244 200 226 240 206 276' },
  { step: 2, d: 'M262 150C290 170 310 196 322 222' },
  { step: 2, d: 'M118 72C96 60 80 50 64 38' },
  { step: 2, d: 'M92 206C76 222 64 236 52 252' },
  { step: 2, d: 'M206 276C228 286 248 292 268 298' },
]
const KITCHENS = [
  [322, 236],
  [52, 26],
  [40, 266],
  [280, 304],
] as const

/**
 * «از بسته‌بندی تا آشپزخانه»: the section holds still while a gold route draws itself, step by step,
 * from packing to the distributor in Tehran, out to the provinces and into kitchens. The step being
 * drawn is lit in the list beside it. Without motion the whole route is shown at once.
 */
export function RoutePin({ steps, label }: { steps: RouteStep[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sec = ref.current
    if (!sec) return
    const paths = Array.from(sec.querySelectorAll<SVGPathElement>('.route-line'))
    const rows = Array.from(sec.querySelectorAll<HTMLElement>('.route-step'))
    const nodes = Array.from(sec.querySelectorAll<SVGGElement>('[data-node]'))
    const runner = sec.querySelector<SVGCircleElement>('.route-runner')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sec.setAttribute('data-still', '')
      paths.forEach((p) => p.style.setProperty('--d', '0'))
      nodes.forEach((n) => n.setAttribute('data-on', ''))
      rows.forEach((r) => r.setAttribute('data-on', ''))
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const h = window.innerHeight
      const q = clamp(-sec.getBoundingClientRect().top / Math.max(1, sec.offsetHeight - h))
      const x = q * 4.25
      const step = clamp(Math.floor(x), 0, 3)
      rows.forEach((r, i) => r.toggleAttribute('data-on', i === step))
      let lead: SVGPathElement | null = null
      let leadU = 0
      paths.forEach((p) => {
        const u = clamp(x - Number(p.dataset.step))
        p.style.setProperty('--d', (1 - u).toFixed(4))
        if (u > 0 && u < 1 && !lead) {
          lead = p
          leadU = u
        }
      })
      nodes.forEach((n) => n.toggleAttribute('data-on', x >= Number(n.dataset.node) - 0.05))
      if (runner) {
        if (lead) {
          const pt = (lead as SVGPathElement).getPointAtLength(
            leadU * (lead as SVGPathElement).getTotalLength(),
          )
          runner.setAttribute('cx', pt.x.toFixed(1))
          runner.setAttribute('cy', pt.y.toFixed(1))
          runner.style.opacity = '1'
        } else runner.style.opacity = '0'
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const short = (i: number) => steps[i]?.short || steps[i]?.title || ''
  return (
    <div ref={ref} className="route-pin">
      <div className="route-stage">
        <div className="route-grid">
          <ol className="route-steps">
            {steps.map((step, i) => (
              <li
                key={`${step.title}-${i}`}
                className="route-step"
                data-on={i === 0 ? '' : undefined}
              >
                <span aria-hidden className="route-step-icon">
                  {step.icon ? <Icon name={step.icon} size={20} /> : <span>{toFa(i + 1)}</span>}
                </span>
                <div className="min-w-0">
                  <p className="route-step-num">{toFa(String(i + 1).padStart(2, '0'))}</p>
                  <h3 className="route-step-title">{step.title}</h3>
                  {step.text ? <p className="route-step-text">{step.text}</p> : null}
                </div>
              </li>
            ))}
          </ol>
          <div className="route-vis">
            <svg viewBox="0 0 440 330" role="img" aria-label={label}>
              <g className="route-ghosts">
                {PATHS.map((p) => (
                  <path key={`g${p.d}`} d={p.d} />
                ))}
              </g>
              {PATHS.map((p) => (
                <path
                  key={p.d}
                  d={p.d}
                  pathLength={1}
                  data-step={p.step}
                  className="route-line"
                  style={{ '--d': 1 } as CSSProperties}
                />
              ))}
              <g data-node="0" className="route-node" data-on="">
                <path d="M372 34l26 13-26 13-26-13z" className="route-box-top" />
                <path d="M346 47v18l26 13V60z" className="route-box-left" />
                <path d="M398 47v18l-26 13V60z" className="route-box-right" />
                <text x="372" y="104" textAnchor="middle" className="route-label">
                  {short(0)}
                </text>
              </g>
              <g data-node="1" className="route-node">
                <circle cx="262" cy="150" r="17" className="route-hub-ring" />
                <circle cx="262" cy="150" r="9" className="route-hub" />
                <text x="262" y="190" textAnchor="middle" className="route-label">
                  {short(1)}
                </text>
              </g>
              <g data-node="2" className="route-node">
                <circle cx="118" cy="72" r="6" className="route-dot" />
                <circle cx="92" cy="206" r="6" className="route-dot" />
                <circle cx="206" cy="276" r="6" className="route-dot" />
                <text x="128" y="102" textAnchor="middle" className="route-sub">
                  {short(2)}
                </text>
              </g>
              <g data-node="3" className="route-node route-kitchens">
                {KITCHENS.map(([x, y]) => (
                  <Icon
                    key={`${x}-${y}`}
                    name="cloche"
                    size={22}
                    x={x - 11}
                    y={y - 11}
                    strokeWidth={1.5}
                  />
                ))}
                <text x="352" y="270" textAnchor="middle" className="route-sub">
                  {short(3)}
                </text>
              </g>
              <circle className="route-runner" r="4.5" cx="-20" cy="-20" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
