'use client'

import { useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { JSX } from 'react'
import { emitSound } from '@/lib/sound'
import { GRID, PLATE, buildMasks, drawPat, makeBrush, makePat, seeded } from './butter-rice-paint'
import type { Masks, Pat } from './butter-rice-paint'
import './butter-rice.css'

const PHOTO = '/fun/chelow-kabab.webp'
const MASK = '/fun/chelow-kabab-mask.png'
const BRUSH = 38 // brush radius in plate space (560 px wide)
const MELT_MS = 2200
const MAX_PATS = 18
const DONE_AT = 70
// With a finger the butter is drawn this far above the fingertip (in screen px), so the hand never hides it,
// and the brush is a little wider because a fingertip is less exact than a mouse.
const LIFT = 58
const TOUCH_BRUSH = 1.3
// Where the dotted guide leads over the rice, in plate space (560 px wide), and where its label sits.
const GUIDE = 'M268 300 C 236 352, 160 372, 104 322 C 66 286, 78 214, 118 168 C 156 126, 214 96, 276 98'
const GUIDE_FROM: [number, number] = [268, 300]

type Props = {
  onProgress?: (percent: number) => void
  onDone?: () => void
  /** Called once per plate, the first time a finger or the mouse touches it. */
  onStart?: () => void
  /** The label that points at where to start; the dotted guide shows until the first touch. */
  guide?: string
  /** A finger is drawing: the butter is drawn above the fingertip and the brush is wider. */
  touch?: boolean
  resetKey?: number
  className?: string
  label?: string
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image()
    im.decoding = 'async'
    im.onload = () => resolve(im)
    im.onerror = reject
    im.src = src
  })
}

export function ButterRice({ onProgress, onDone, onStart, guide, touch = false, resetKey = 0, className, label = 'کره را روی برنج بمالید' }: Props): JSX.Element {
  const still = useReducedMotion()
  const guideRef = useRef<HTMLDivElement>(null)
  const plateRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const knobRef = useRef<HTMLSpanElement>(null)
  // keep the latest callbacks without re-running the canvas setup
  const cb = useRef({ onProgress, onDone, onStart })
  useEffect(() => {
    cb.current = { onProgress, onDone, onStart }
  })
  const resetRef = useRef<() => void>(() => {})

  useEffect(() => {
    const plate = plateRef.current
    const canvas = canvasRef.current
    const knob = knobRef.current
    if (!plate || !canvas || !knob) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let alive = true
    let masks: Masks | null = null
    let raf = 0
    let drawing = false
    let prev: [number, number] | null = null
    let done = false
    let touched = false
    // the brush of the stroke in progress: wider with a finger
    let radius = BRUSH
    let lastSent = 0
    let lastPercent = -1
    let pats: Pat[] = []
    let rnd = seeded(7)

    // wet = where butter has been rubbed (alpha only)
    const wet = document.createElement('canvas')
    wet.width = wet.height = PLATE
    const wctx = wet.getContext('2d')!
    // pats are drawn apart so they can be clipped to the food
    const patLayer = document.createElement('canvas')
    patLayer.width = patLayer.height = PLATE
    const pctx = patLayer.getContext('2d')!
    const brush = makeBrush(BRUSH)
    const covered = new Uint8Array(GRID * GRID)
    let coveredRice = 0

    const cellAt = (x: number, y: number) => {
      const gx = Math.floor((x / PLATE) * GRID)
      const gy = Math.floor((y / PLATE) * GRID)
      return gx < 0 || gy < 0 || gx >= GRID || gy >= GRID ? -1 : gy * GRID + gx
    }
    const onFood = (x: number, y: number) => {
      const c = cellAt(x, y)
      return c >= 0 && !!masks && masks.foodCells[c] === 1
    }

    const cover = (x: number, y: number) => {
      if (!masks) return
      const cell = PLATE / GRID
      const rad = radius * 0.62
      const x0 = Math.max(0, Math.floor((x - rad) / cell))
      const x1 = Math.min(GRID - 1, Math.floor((x + rad) / cell))
      const y0 = Math.max(0, Math.floor((y - rad) / cell))
      const y1 = Math.min(GRID - 1, Math.floor((y + rad) / cell))
      for (let gy = y0; gy <= y1; gy++) {
        for (let gx = x0; gx <= x1; gx++) {
          const i = gy * GRID + gx
          if (covered[i]) continue
          if (Math.hypot((gx + 0.5) * cell - x, (gy + 0.5) * cell - y) > rad) continue
          covered[i] = 1
          if (masks.riceCells[i]) coveredRice++
        }
      }
    }

    const stamp = (a: [number, number], b: [number, number]) => {
      const d = Math.hypot(b[0] - a[0], b[1] - a[1])
      const n = Math.max(1, Math.ceil(d / (radius * 0.28)))
      for (let i = 0; i <= n; i++) {
        const x = a[0] + ((b[0] - a[0]) * i) / n
        const y = a[1] + ((b[1] - a[1]) * i) / n
        // uneven pressure, so the edge of a stroke is not a perfect tube
        const s = radius * (0.86 + rnd() * 0.3)
        wctx.drawImage(brush, x - s, y - s, s * 2, s * 2)
        cover(x, y)
      }
    }

    const addPats = (x: number, y: number, now: number) => {
      if (!onFood(x, y)) return
      pats.push(makePat(x, y, 21 + rnd() * 6, now, rnd))
      for (let i = 0; i < 2; i++) {
        const a = rnd() * Math.PI * 2
        const d = 32 + rnd() * 24
        const cx = x + Math.cos(a) * d
        const cy = y + Math.sin(a) * d
        if (onFood(cx, cy)) pats.push(makePat(cx, cy, 7 + rnd() * 5, now, rnd))
      }
      // old bits have melted away by now
      if (pats.length > MAX_PATS) pats = pats.slice(pats.length - MAX_PATS)
    }

    const percent = () => (masks && masks.riceTotal ? Math.min(100, Math.round((coveredRice / masks.riceTotal) * 100)) : 0)

    const report = (force: boolean) => {
      const now = performance.now()
      if (!force && now - lastSent < 220) return
      lastSent = now
      const p = percent()
      if (p !== lastPercent) {
        lastPercent = p
        cb.current.onProgress?.(p)
      }
      if (p >= DONE_AT && !done) {
        done = true
        cb.current.onDone?.()
      }
    }

    const render = (now: number) => {
      raf = 0
      if (!masks) return
      let melting = false
      pctx.clearRect(0, 0, PLATE, PLATE)
      for (const p of pats) {
        const t = reduce ? 1 : Math.min(1, (now - p.born) / MELT_MS)
        if (t < 1) melting = true
        drawPat(pctx, p, t)
      }
      // butter never sits on the plate itself
      pctx.globalCompositeOperation = 'destination-in'
      pctx.drawImage(masks.gloss, 0, 0)
      pctx.globalCompositeOperation = 'source-over'

      ctx.clearRect(0, 0, PLATE, PLATE)
      ctx.drawImage(wet, 0, 0)
      ctx.globalCompositeOperation = 'source-in'
      ctx.drawImage(masks.gloss, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(patLayer, 0, 0)
      if (melting) schedule()
    }
    const schedule = () => {
      if (!raf && alive) raf = requestAnimationFrame(render)
    }

    const moveKnob = (x: number, y: number) => {
      const k = plate.clientWidth / PLATE
      knob.style.setProperty('--kx', `${(x * k).toFixed(1)}px`)
      knob.style.setProperty('--ky', `${(y * k).toFixed(1)}px`)
    }

    const reset = () => {
      wctx.clearRect(0, 0, PLATE, PLATE)
      covered.fill(0)
      coveredRice = 0
      pats = []
      done = false
      touched = false
      radius = BRUSH
      guideRef.current?.removeAttribute('data-gone')
      lastPercent = -1
      rnd = seeded(7)
      // one short stroke already on the rice, so the idea reads at a glance
      const demo: [number, number][] = [
        [124, 262],
        [142, 212],
        [176, 170],
        [222, 140],
        [272, 126],
      ]
      addPats(demo[0][0], demo[0][1], -MELT_MS)
      for (let i = 1; i < demo.length; i++) stamp(demo[i - 1], demo[i])
      moveKnob(296, 122)
      knob.style.opacity = '1'
      schedule()
      report(true)
    }
    resetRef.current = reset

    const pos = (e: PointerEvent): [number, number] => {
      const r = plate.getBoundingClientRect()
      const lift = e.pointerType === 'touch' ? LIFT : 0
      return [((e.clientX - r.left) / r.width) * PLATE, ((e.clientY - r.top - lift) / r.height) * PLATE]
    }

    let lastScrape = 0
    const down = (e: PointerEvent) => {
      if (!masks || (e.pointerType === 'mouse' && e.button !== 0)) return
      drawing = true
      radius = e.pointerType === 'touch' ? BRUSH * TOUCH_BRUSH : BRUSH
      if (!touched) {
        touched = true
        guideRef.current?.setAttribute('data-gone', '')
        cb.current.onStart?.()
      }
      try {
        plate.setPointerCapture(e.pointerId)
      } catch {
        // capture can fail on synthetic events; rubbing still works inside the plate
      }
      const p = pos(e)
      prev = p
      moveKnob(p[0], p[1])
      knob.dataset.down = '1'
      addPats(p[0], p[1], performance.now())
      stamp(p, p)
      lastScrape = performance.now()
      emitSound('scrape')
      schedule()
      report(false)
    }
    const move = (e: PointerEvent) => {
      const p = pos(e)
      moveKnob(p[0], p[1])
      if (!drawing || !prev) return
      stamp(prev, p)
      prev = p
      schedule()
      report(false)
      // a few grains of rice under the butter, now and then while the finger drags
      const now = performance.now()
      if (now - lastScrape > 140) {
        lastScrape = now
        emitSound('scrape')
      }
    }
    const up = () => {
      if (!drawing) return
      drawing = false
      prev = null
      knob.dataset.down = '0'
      report(true)
    }
    plate.addEventListener('pointerdown', down)
    plate.addEventListener('pointermove', move)
    plate.addEventListener('pointerup', up)
    plate.addEventListener('pointercancel', up)

    Promise.all([loadImage(PHOTO), loadImage(MASK)])
      .then(([photo, mask]) => {
        if (!alive) return
        masks = buildMasks(photo, mask)
        reset()
      })
      .catch(() => {
        // without the images the plain photo (or nothing) stays; no toy
      })

    return () => {
      alive = false
      if (raf) cancelAnimationFrame(raf)
      plate.removeEventListener('pointerdown', down)
      plate.removeEventListener('pointermove', move)
      plate.removeEventListener('pointerup', up)
      plate.removeEventListener('pointercancel', up)
    }
  }, [])

  // a new resetKey serves a fresh plate (skip the first run: setup does it)
  const firstKey = useRef(true)
  useEffect(() => {
    if (firstKey.current) {
      firstKey.current = false
      return
    }
    resetRef.current()
  }, [resetKey])

  return (
    <div className={className ? `butter-rice ${className}` : 'butter-rice'} data-touch={touch ? '' : undefined}>
      <div ref={plateRef} className="butter-rice__plate" dir="ltr" role="img" aria-label={label}>
        <div className="butter-rice__food">
          {/* eslint-disable-next-line @next/next/no-img-element -- the canvas layer must line up pixel for pixel */}
          <img className="butter-rice__photo" src={PHOTO} alt="" width={560} height={560} draggable={false} />
          <canvas ref={canvasRef} className="butter-rice__canvas" width={PLATE} height={PLATE} aria-hidden="true" />
        </div>
        {guide ? (
          // The dotted guide: a fingertip travels along it until the visitor starts, then it fades away.
          <div ref={guideRef} className="butter-rice__guide" aria-hidden="true">
            <svg viewBox={`0 0 ${PLATE} ${PLATE}`}>
              <path d={GUIDE} />
              <g className="butter-rice__finger">
                <circle r="19" />
                <circle r="7" />
                {still ? null : <animateMotion dur="3.2s" repeatCount="indefinite" path={GUIDE} keyPoints="0;1;1" keyTimes="0;0.8;1" calcMode="linear" />}
              </g>
              {still ? <g transform={`translate(${GUIDE_FROM[0]} ${GUIDE_FROM[1]})`} className="butter-rice__finger"><circle r="19" /><circle r="7" /></g> : null}
            </svg>
            <span className="butter-rice__guide-label" style={{ left: `${((GUIDE_FROM[0] + 20) / PLATE) * 100}%`, top: `${((GUIDE_FROM[1] + 14) / PLATE) * 100}%` }}>
              {guide}
            </span>
          </div>
        ) : null}
        <span ref={knobRef} className="butter-rice__knob" style={{ opacity: 0 }} aria-hidden="true">
          <i />
        </span>
      </div>
    </div>
  )
}

export default ButterRice
