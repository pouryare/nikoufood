'use client'

import { useEffect, useRef } from 'react'
import { Icon } from '@/components/ui/Icon'
import { RiseText } from '@/components/ui/RiseText'

type Props = {
  eyebrow?: string | null
  title?: string | null
  text?: string | null
  bulk: { label: string; text?: string | null }
  single: { label: string; text?: string | null }
  /** The travelling butter rests on the board while this section holds still. */
  butterStop?: boolean
  pictureLabel: string
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const C30 = Math.cos(Math.PI / 6)

/** Draws the board, the knife lines and the eight pieces at progress q (0 = one big block, 1 = eight pats). */
function draw(canvas: HTMLCanvasElement, q: number, board: string, edge: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (!w || !h) return
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  // The board and the tall block span about 540 × 370 units; centre that box in the canvas.
  const k = Math.min(w / 540, h / 370)
  const ox = w * 0.5
  const oy = h * 0.5 + 8.75 * k
  const P = (x: number, y: number, z: number): [number, number] => [
    ox + (x - y) * C30 * k,
    oy + ((x + y) * 0.5 - z) * k,
  ]
  const poly = (pts: [number, number][], fill: string | CanvasGradient, stroke?: string) => {
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }
  poly([P(-150, -110, 0), P(190, -110, 0), P(190, 150, 0), P(-150, 150, 0)], board, edge)
  const cut = clamp((q - 0.2) / 0.26)
  const e = ease(clamp((q - 0.5) / 0.34))
  const BW = 240
  const BD = 150
  const BH = 90
  const PW = 50
  const PD = 62
  const PH = 18
  const GAP = 26
  const gw = 4 * PW + 3 * GAP
  const gd = 2 * PD + GAP
  const mix = (u: number, v: number) => u + (v - u) * e
  const pieces: { x: number; y: number; w: number; d: number; h: number }[] = []
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 4; i++) {
      pieces.push({
        x: mix(-BW / 2 + i * (BW / 4), -gw / 2 + i * (PW + GAP)),
        y: mix(-BD / 2 + j * (BD / 2), -gd / 2 + j * (PD + GAP)),
        w: mix(BW / 4, PW),
        d: mix(BD / 2, PD),
        h: mix(BH, PH),
      })
    }
  }
  pieces.sort((a, b) => a.x + a.y - (b.x + b.y))
  for (const { x, y, w: pw, d, h: ph } of pieces) {
    ctx.save()
    ctx.globalAlpha = 0.45
    poly(
      [
        P(x + 4, y + 6, 0),
        P(x + pw + 8, y + 6, 0),
        P(x + pw + 8, y + d + 10, 0),
        P(x + 4, y + d + 10, 0),
      ],
      'rgba(0,0,0,0.6)',
    )
    ctx.restore()
    poly([P(x, y + d, 0), P(x + pw, y + d, 0), P(x + pw, y + d, ph), P(x, y + d, ph)], '#d29e3a')
    poly([P(x + pw, y, 0), P(x + pw, y + d, 0), P(x + pw, y + d, ph), P(x + pw, y, ph)], '#e6b752')
    const g = ctx.createLinearGradient(...P(x, y, ph), ...P(x + pw, y + d, ph))
    g.addColorStop(0, '#fff4c8')
    g.addColorStop(1, '#f2d27a')
    poly(
      [P(x, y, ph), P(x + pw, y, ph), P(x + pw, y + d, ph), P(x, y + d, ph)],
      g,
      'rgba(255,248,220,0.55)',
    )
  }
  // The knife marks the cuts on the whole block before it comes apart.
  if (cut > 0 && e < 0.02) {
    ctx.strokeStyle = 'rgba(105,62,10,0.95)'
    ctx.lineWidth = 2.2
    const lines: [[number, number], [number, number]][] = [
      [
        [-BW / 4, -BD / 2],
        [-BW / 4, BD / 2],
      ],
      [
        [0, -BD / 2],
        [0, BD / 2],
      ],
      [
        [BW / 4, -BD / 2],
        [BW / 4, BD / 2],
      ],
      [
        [-BW / 2, 0],
        [BW / 2, 0],
      ],
    ]
    lines.forEach(([[x1, y1], [x2, y2]], n) => {
      const u = clamp(cut * 4 - n)
      if (!u) return
      const [ax, ay] = P(x1, y1, BH)
      const [bx, by] = P(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, BH)
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(bx, by)
      ctx.stroke()
      if (u < 1) {
        ctx.fillStyle = '#fffbe6'
        ctx.beginPath()
        ctx.arc(bx, by, 2.6, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }
}

/**
 * «فله‌ای یا تک‌نفره؟»: the section holds still while one big block of butter is marked with a knife
 * and comes apart into eight single-serve pats; the words beside it change from bulk to single-serve.
 */
export function SizesPin({ eyebrow, title, text, bulk, single, butterStop, pictureLabel }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const sec = ref.current
    const canvas = sec?.querySelector('canvas')
    if (!sec || !canvas) return
    const css = getComputedStyle(document.documentElement)
    const board = css.getPropertyValue('--nk-surface').trim() || '#0e1526'
    const edge = 'rgba(168,116,31,0.35)'
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sec.setAttribute('data-still', '')
      const still = () => draw(canvas, 1, board, edge)
      still()
      window.addEventListener('resize', still)
      return () => window.removeEventListener('resize', still)
    }
    let frame = 0
    let phase = ''
    const update = () => {
      frame = 0
      const h = window.innerHeight
      const q = clamp(-sec.getBoundingClientRect().top / Math.max(1, sec.offsetHeight - h))
      sec.style.setProperty('--q', q.toFixed(4))
      const next = q > 0.62 ? 'single' : 'bulk'
      if (next !== phase) {
        phase = next
        sec.dataset.phase = next
      }
      draw(canvas, q, board, edge)
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

  return (
    <section ref={ref} className="sizes-pin" data-phase="bulk" data-butter-pin="">
      <div className="sizes-stage">
        <div className="wrap sizes-grid">
          <div className="sizes-copy">
            {eyebrow ? (
              <p data-reveal className="eyebrow">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 data-reveal className="rise mt-5 text-h2">
                <RiseText text={title} />
              </h2>
            ) : null}
            {text ? <p className="mt-4 text-muted">{text}</p> : null}
            <div className="sizes-state">
              <div data-state="bulk">
                <p className="sizes-k">
                  <Icon name="boxes" size={30} strokeWidth={1.4} />
                  <span>{bulk.label}</span>
                </p>
                {bulk.text ? <p className="sizes-t">{bulk.text}</p> : null}
              </div>
              <div data-state="single">
                <p className="sizes-k">
                  <Icon name="grid" size={30} strokeWidth={1.4} />
                  <span>{single.label}</span>
                </p>
                {single.text ? <p className="sizes-t">{single.text}</p> : null}
              </div>
            </div>
            <div aria-hidden className="sizes-bar">
              <i />
            </div>
          </div>
          <div className="sizes-vis">
            <canvas role="img" aria-label={pictureLabel} />
            {butterStop ? (
              <span
                aria-hidden
                data-butter-stop="sizes"
                data-from="0"
                data-to="0.88"
                className="butter-stop"
                style={{ left: '14%', top: '82%' }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
