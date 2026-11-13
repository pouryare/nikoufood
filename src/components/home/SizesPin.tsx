'use client'

import { useEffect, useRef } from 'react'
import { Icon } from '@/components/ui/Icon'
import { RiseText } from '@/components/ui/RiseText'
import { emitSound } from '@/lib/sound'

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

type V3 = [number, number, number]
type Scene = { ctx: CanvasRenderingContext2D; k: number; ox: number; oy: number; dpr: number }
/** Colours of one solid: top (lit → far), the two visible sides with their turning edges, the lit top edge, the shade near the ground. */
type Look = {
  top: [string, string]
  left: string
  leftEdge: string
  right: string
  rightEdge: string
  rim: string
  rimAlpha: number
  ao: string
  sheen: string
}
type Solid = { cx: number; cy: number; z0: number; w: number; d: number; h: number; r: number; rot: number }

const BUTTER: Look = {
  top: ['#fff7d6', '#f4d887'],
  left: '#edc566',
  leftEdge: '#dcae4c',
  right: '#d6a240',
  rightEdge: '#b98529',
  rim: '#fffbe8',
  rimAlpha: 1,
  ao: '122,66,6',
  sheen: '255,246,208',
}
const WOOD: Look = {
  top: ['#80573a', '#5a3a22'],
  left: '#553619',
  leftEdge: '#3f2710',
  right: '#3d2511',
  rightEdge: '#2a1808',
  rim: '#ffd9a8',
  rimAlpha: 0.4,
  ao: '10,4,0',
  sheen: '255,210,160',
}

/** Small repeatable random numbers, so the grain and each pat's flaws are the same on every draw. */
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
/** No two hand-cut pats are alike: a slight turn, shift, height, tone and their own knife marks. */
const FLAWS = Array.from({ length: 8 }, (_, i) => {
  const r = rng(17 + i * 31)
  return {
    rot: (r() - 0.5) * 0.13,
    dx: (r() - 0.5) * 6,
    dy: (r() - 0.5) * 6,
    dh: (r() - 0.5) * 3,
    tone: r() * 0.09,
    marks: [0.2 + r() * 0.12, 0.45 + r() * 0.12, 0.7 + r() * 0.12],
    bend: (r() - 0.5) * 5,
  }
})

const lin = (s: Scene, v: V3): [number, number] => [(v[0] - v[1]) * C30 * s.k, ((v[0] + v[1]) * 0.5 - v[2]) * s.k]
const pt = (s: Scene, v: V3): [number, number] => {
  const [a, b] = lin(s, v)
  return [s.ox + a, s.oy + b]
}
/** Draw in the flat page. */
const flat = (s: Scene) => s.ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0)
/** Draw on a surface of the scene: origin o, with u and v as the surface's own x and y. */
const plane = (s: Scene, o: V3, u: V3, v: V3) => {
  const [px, py] = pt(s, o)
  const [ux, uy] = lin(s, u)
  const [vx, vy] = lin(s, v)
  s.ctx.setTransform(s.dpr * ux, s.dpr * uy, s.dpr * vx, s.dpr * vy, s.dpr * px, s.dpr * py)
}
const UP: V3 = [0, 0, 1]

/**
 * One solid with rounded upright corners and a rounded top edge (a block of butter, a pat, the board).
 * `onTop` draws on the top face, in units measured from its centre; `tint` warms the whole solid a little.
 */
function solid(s: Scene, b: Solid, look: Look, onTop?: (ctx: CanvasRenderingContext2D) => void, tint = 0) {
  const { ctx } = s
  const c = Math.cos(b.rot)
  const sn = Math.sin(b.rot)
  const ex: V3 = [c, sn, 0]
  const ey: V3 = [-sn, c, 0]
  const hw = b.w / 2
  const hd = b.d / 2
  const at = (lx: number, ly: number, z: number): V3 => [
    b.cx + ex[0] * lx + ey[0] * ly,
    b.cy + ex[1] * lx + ey[1] * ly,
    b.z0 + z,
  ]
  const ring = (z: number) => {
    plane(s, at(0, 0, z), ex, ey)
    ctx.roundRect(-hw, -hd, b.w, b.d, b.r)
  }
  // The outline's leftmost and rightmost points on screen: the walls run straight down from them.
  const ax = lin(s, ex)[0]
  const bx = lin(s, ey)[0]
  const n = Math.hypot(ax, bx) || 1
  const lx = -(Math.sign(ax) * (hw - b.r) + (b.r * ax) / n)
  const ly = -(Math.sign(bx) * (hd - b.r) + (b.r * bx) / n)
  const L0 = pt(s, at(lx, ly, 0))
  const Lh = pt(s, at(lx, ly, b.h))
  const R0 = pt(s, at(-lx, -ly, 0))
  const Rh = pt(s, at(-lx, -ly, b.h))
  const hull = () => {
    ctx.beginPath()
    ring(0)
    ring(b.h)
    flat(s)
    ctx.moveTo(Lh[0], Lh[1])
    ctx.lineTo(Rh[0], Rh[1])
    ctx.lineTo(R0[0], R0[1])
    ctx.lineTo(L0[0], L0[1])
    ctx.closePath()
  }
  // Sides: one sweep of colour from the lit left side, round the near corner, to the shaded right side.
  const span = Math.max(1, R0[0] - L0[0])
  const tc = (pt(s, at(hw, hd, 0))[0] - L0[0]) / span
  const rw = Math.min(0.12, (b.r * C30 * s.k) / span)
  const g = ctx.createLinearGradient(L0[0], 0, R0[0], 0)
  g.addColorStop(0, look.leftEdge)
  g.addColorStop(rw, look.left)
  g.addColorStop(clamp(tc - rw, rw, 1 - rw), look.left)
  g.addColorStop(clamp(tc + rw, rw, 1 - rw), look.right)
  g.addColorStop(1 - rw, look.right)
  g.addColorStop(1, look.rightEdge)
  hull()
  ctx.fillStyle = g
  ctx.fill()
  ctx.save()
  ctx.clip()
  // Each side is darker near the ground and catches a little light under the top edge.
  const band = clamp(13 / b.h, 0.1, 0.7)
  const v = ctx.createLinearGradient(0, 0, 0, b.h)
  v.addColorStop(0, `rgba(${look.ao},0.5)`)
  v.addColorStop(band * 0.45, `rgba(${look.ao},0.16)`)
  v.addColorStop(band, `rgba(${look.ao},0)`)
  v.addColorStop(Math.max(band, 1 - band * 0.6), `rgba(${look.sheen},0)`)
  v.addColorStop(1, `rgba(${look.sheen},0.26)`)
  ctx.fillStyle = v
  plane(s, at(-hw, hd, 0), ex, UP)
  ctx.fillRect(-b.r, 0, b.w + b.r, b.h)
  plane(s, at(hw, -hd, 0), ey, UP)
  ctx.fillRect(-b.r, 0, b.d + b.r, b.h)
  // Top face.
  plane(s, at(0, 0, b.h), ex, ey)
  const t = ctx.createLinearGradient(-hw, -hd * 0.4, hw, hd * 0.4)
  t.addColorStop(0, look.top[0])
  t.addColorStop(1, look.top[1])
  ctx.beginPath()
  ctx.roundRect(-hw, -hd, b.w, b.d, b.r)
  ctx.fillStyle = t
  ctx.fill()
  if (onTop) {
    ctx.save()
    ctx.clip()
    onTop(ctx)
    ctx.restore()
    plane(s, at(0, 0, b.h), ex, ey)
    ctx.beginPath()
    ctx.roundRect(-hw, -hd, b.w, b.d, b.r)
  }
  // The rounded top edge: a soft light band that straddles the edge.
  ctx.strokeStyle = look.rim
  ctx.globalAlpha = 0.32 * look.rimAlpha
  ctx.lineWidth = b.r * 1.2
  ctx.stroke()
  ctx.globalAlpha = 0.55 * look.rimAlpha
  ctx.lineWidth = b.r * 0.42
  ctx.stroke()
  ctx.globalAlpha = 1
  if (tint > 0) {
    flat(s)
    ctx.fillStyle = `rgba(176,104,12,${tint.toFixed(3)})`
    ctx.fillRect(L0[0], Math.min(Lh[1], Rh[1]) - b.d * s.k, span, (b.h + b.w + b.d) * s.k)
  }
  ctx.restore()
}

/** The shadow a solid throws on the board: a dark line where it touches, and a soft patch away from the light. */
function shadow(s: Scene, cx: number, cy: number, w: number, d: number, h: number) {
  const { ctx } = s
  plane(s, [cx, cy, 0], [1, 0, 0], [0, 1, 0])
  const off = 3 + h * 0.3
  ctx.save()
  ctx.translate(off, off * 0.3)
  ctx.scale(w / 2 + off * 0.5 + 9, d / 2 + 9)
  const g = ctx.createRadialGradient(0, 0, 0.45, 0, 0, 1.3)
  g.addColorStop(0, 'rgba(8,3,0,0.6)')
  g.addColorStop(0.55, 'rgba(8,3,0,0.26)')
  g.addColorStop(1, 'rgba(8,3,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(-1.3, -1.3, 2.6, 2.6)
  ctx.restore()
  ctx.beginPath()
  ctx.roundRect(-w / 2 - 0.5, -d / 2 - 0.5, w + 3.5, d + 3, 5)
  ctx.fillStyle = 'rgba(14,6,0,0.5)'
  ctx.fill()
}

/** Soft knife marks and a soft highlight on top of a piece of butter (w × d, centred). */
function butterTop(ctx: CanvasRenderingContext2D, w: number, d: number, marks: number[], bend: number) {
  const hw = w / 2
  const hd = d / 2
  ctx.lineCap = 'round'
  for (const m of marks) {
    const y = -hd + m * d
    ctx.beginPath()
    ctx.moveTo(-hw, y)
    ctx.bezierCurveTo(-hw * 0.4, y + bend * 0.5, hw * 0.3, y - bend * 0.4, hw, y + bend * 0.3)
    ctx.strokeStyle = 'rgba(186,134,36,0.2)'
    ctx.lineWidth = 2.2
    ctx.stroke()
    ctx.translate(0, 1.5)
    ctx.strokeStyle = 'rgba(255,254,240,0.5)'
    ctx.lineWidth = 1.2
    ctx.stroke()
    ctx.translate(0, -1.5)
  }
  const r = Math.min(w, d) * 0.75
  const g = ctx.createRadialGradient(-hw * 0.4, -hd * 0.25, 0, -hw * 0.4, -hd * 0.25, r)
  g.addColorStop(0, 'rgba(255,255,246,0.6)')
  g.addColorStop(0.5, 'rgba(255,255,246,0.16)')
  g.addColorStop(1, 'rgba(255,255,246,0)')
  ctx.fillStyle = g
  ctx.fillRect(-hw, -hd, w, d)
}

const BOARD: Solid = { cx: 15, cy: 17, z0: -12, w: 322, d: 246, h: 12, r: 16, rot: 0 }
let boardLayer: { key: string; canvas: HTMLCanvasElement } | null = null

/** The wooden board never changes, so it is drawn once per canvas size and reused on every frame. */
function getBoard(s: Scene, pw: number, ph: number, base: string, edge: string) {
  const key = `${pw}x${ph}|${base}|${edge}`
  if (boardLayer?.key === key) return boardLayer.canvas
  const canvas = document.createElement('canvas')
  canvas.width = pw
  canvas.height = ph
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  const b: Scene = { ...s, ctx }
  const { cx, cy, w, d, r } = BOARD
  // A faint patch of the page's surface colour, so the board sits on something.
  plane(b, [cx, cy, BOARD.z0], [1, 0, 0], [0, 1, 0])
  ctx.fillStyle = base
  ctx.globalAlpha = 0.07
  for (let i = 0; i < 12; i++) {
    ctx.beginPath()
    ctx.ellipse(8, 8, w * (0.74 - i * 0.03), d * (0.78 - i * 0.03), 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.shadowColor = 'rgba(0,0,0,0.8)'
  ctx.shadowBlur = 30 * s.k * s.dpr
  ctx.shadowOffsetX = 8 * s.k * s.dpr
  ctx.shadowOffsetY = 12 * s.k * s.dpr
  ctx.beginPath()
  ctx.roundRect(-w / 2 + 4, -d / 2 + 4, w - 8, d - 8, r)
  ctx.fillStyle = '#000'
  ctx.fill()
  ctx.shadowColor = 'transparent'
  solid(b, BOARD, WOOD, (c) => {
    const rnd = rng(7)
    const hw = w / 2
    const hd = d / 2
    // Glued strips of slightly different wood.
    let y = -hd
    while (y < hd) {
      const sw = 30 + rnd() * 34
      c.fillStyle = rnd() > 0.5 ? `rgba(255,196,140,${(rnd() * 0.09).toFixed(3)})` : `rgba(20,8,0,${(rnd() * 0.16).toFixed(3)})`
      c.fillRect(-hw, y, w, sw)
      c.fillStyle = 'rgba(20,8,0,0.28)'
      c.fillRect(-hw, y + sw - 0.4, w, 0.8)
      y += sw
    }
    // Grain: long, slightly wavy lines along the board.
    for (let i = 0; i < 150; i++) {
      const y0 = -hd + rnd() * d
      const amp = 0.6 + rnd() * 2.6
      const f = 0.008 + rnd() * 0.02
      const ph0 = rnd() * 6.3
      const x0 = -hw + rnd() * w * 0.5 - 20
      const x1 = x0 + w * (0.3 + rnd() * 0.9)
      c.beginPath()
      for (let x = x0; x <= x1; x += 9) {
        const yy = y0 + Math.sin(x * f + ph0) * amp
        if (x === x0) c.moveTo(x, yy)
        else c.lineTo(x, yy)
      }
      c.strokeStyle = rnd() > 0.35 ? `rgba(28,12,2,${(0.08 + rnd() * 0.22).toFixed(3)})` : `rgba(255,206,150,${(0.04 + rnd() * 0.1).toFixed(3)})`
      c.lineWidth = 0.4 + rnd() * 1.3
      c.stroke()
    }
    // Old knife scratches.
    c.lineCap = 'round'
    for (let i = 0; i < 9; i++) {
      const x = (rnd() - 0.5) * w * 0.8
      const yy = (rnd() - 0.5) * d * 0.8
      const a = (rnd() - 0.5) * 1.2 + (rnd() > 0.5 ? 1.57 : 0)
      const len = 14 + rnd() * 34
      c.beginPath()
      c.moveTo(x, yy)
      c.lineTo(x + Math.cos(a) * len, yy + Math.sin(a) * len)
      c.strokeStyle = 'rgba(255,224,180,0.16)'
      c.lineWidth = 0.6
      c.stroke()
    }
    // Light falls from the far left; the near right falls off into shade.
    const lg = c.createRadialGradient(-hw * 0.7, -hd * 0.5, 0, -hw * 0.7, -hd * 0.5, w * 0.9)
    lg.addColorStop(0, 'rgba(255,214,160,0.2)')
    lg.addColorStop(0.5, 'rgba(255,214,160,0.04)')
    lg.addColorStop(1, 'rgba(0,0,0,0.3)')
    c.fillStyle = lg
    c.fillRect(-hw, -hd, w, d)
  })
  // A thin warm line round the top keeps the board apart from the dark page.
  plane(b, [cx, cy, 0], [1, 0, 0], [0, 1, 0])
  ctx.beginPath()
  ctx.roundRect(-w / 2, -d / 2, w, d, r)
  flat(b)
  ctx.strokeStyle = edge
  ctx.lineWidth = 1
  ctx.stroke()
  boardLayer = { key, canvas }
  return canvas
}

const BW = 240
const BD = 150
const BH = 90
/** The four cuts, each from where the knife enters to where it leaves. */
const CUTS: [number, number, number, number][] = [
  [-BW / 4, -BD / 2, -BW / 4, BD / 2],
  [0, -BD / 2, 0, BD / 2],
  [BW / 4, -BD / 2, BW / 4, BD / 2],
  [-BW / 2, 0, BW / 2, 0],
]

/** A groove pressed into butter: shaded inside, with a lit lip on the side that faces the light. */
function groove(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, lx: number, ly: number) {
  ctx.lineCap = 'round'
  const line = (dx: number, dy: number, style: string, width: number) => {
    ctx.beginPath()
    ctx.moveTo(x1 + dx, y1 + dy)
    ctx.lineTo(x2 + dx, y2 + dy)
    ctx.strokeStyle = style
    ctx.lineWidth = width
    ctx.stroke()
  }
  line(0, 0, 'rgba(160,104,24,0.22)', 6)
  line(lx * 1.9, ly * 1.9, 'rgba(255,252,232,0.75)', 1.3)
  line(-lx * 1.6, -ly * 1.6, 'rgba(255,252,232,0.3)', 1)
  line(0, 0, 'rgba(98,58,10,0.92)', 1.8)
}

/** The knife blade standing in the cut, its tip at the origin, drawn in the upright plane of the cut. */
function blade(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, -2, 0, 27)
  g.addColorStop(0, '#fbfcfe')
  g.addColorStop(0.1, '#f3e8c8')
  g.addColorStop(0.3, '#c6cedb')
  g.addColorStop(0.75, '#98a3b6')
  g.addColorStop(1, '#6f7a8e')
  ctx.beginPath()
  ctx.moveTo(-62, -2)
  ctx.lineTo(-16, -2)
  ctx.quadraticCurveTo(-2, -1, 5, 7)
  ctx.quadraticCurveTo(-26, 21, -62, 26)
  ctx.closePath()
  ctx.fillStyle = g
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 0.8
  ctx.stroke()
  // Handle.
  ctx.beginPath()
  ctx.roundRect(-104, 4, 44, 21, 7)
  ctx.fillStyle = '#1d1a1c'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.stroke()
  ctx.fillStyle = '#b9c1ce'
  ctx.fillRect(-64, 2, 5, 25)
  ctx.beginPath()
  ctx.arc(-78, 14.5, 1.8, 0, Math.PI * 2)
  ctx.arc(-92, 14.5, 1.8, 0, Math.PI * 2)
  ctx.fillStyle = '#9aa3b2'
  ctx.fill()
}

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
  // The board and the tall block span about 540 × 370 units; centre that box in the canvas.
  const k = Math.min(w / 540, h / 370)
  const s: Scene = { ctx, k, ox: w * 0.5, oy: h * 0.5 + 8.75 * k, dpr }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(getBoard(s, canvas.width, canvas.height, board, edge), 0, 0)
  const cut = clamp((q - 0.2) / 0.26)
  const e = ease(clamp((q - 0.5) / 0.34))

  if (e <= 0) {
    // One whole block; the knife presses the four cuts into it one after another.
    shadow(s, 0, 0, BW, BD, BH)
    solid(s, { cx: 0, cy: 0, z0: 0, w: BW, d: BD, h: BH, r: 7, rot: 0 }, BUTTER, (c) => {
      butterTop(c, BW, BD, [0.16, 0.37, 0.61, 0.83], 5)
      CUTS.forEach(([x1, y1, x2, y2], n) => {
        const u = clamp(cut * 4 - n)
        if (!u) return
        const tu = Math.min(1, u / 0.85)
        const alongY = x1 === x2
        groove(c, x1, y1, x1 + (x2 - x1) * tu, y1 + (y2 - y1) * tu, alongY ? 1 : 0, alongY ? 0 : 1)
      })
    })
    CUTS.forEach(([x1, y1, x2, y2], n) => {
      const u = clamp(cut * 4 - n)
      if (!u) return
      const alongY = x1 === x2
      // The cut shows on the side the knife comes out of, deeper as it finishes.
      const depth = clamp((u - 0.6) / 0.4)
      if (depth > 0) {
        if (alongY) plane(s, [x1, BD / 2, 0], [1, 0, 0], UP)
        else plane(s, [BW / 2, 0, 0], [0, 1, 0], UP)
        ctx.lineCap = 'butt'
        const seam = (dx: number, style: string, width: number) => {
          ctx.beginPath()
          ctx.moveTo(dx, BH - 2)
          ctx.lineTo(dx, BH * (1 - depth) + 1)
          ctx.strokeStyle = style
          ctx.lineWidth = width
          ctx.stroke()
        }
        seam(0, 'rgba(150,96,22,0.25)', 5)
        seam(alongY ? 1.7 : -1.7, 'rgba(255,248,220,0.55)', 1.1)
        seam(0, 'rgba(98,58,10,0.85)', 1.6)
      }
      if (u < 1) {
        const tu = Math.min(1, u / 0.85)
        const lift = clamp((u - 0.85) / 0.15)
        ctx.save()
        ctx.globalAlpha = Math.min(1, u / 0.2) * (1 - lift)
        const tip: V3 = [x1 + (x2 - x1) * tu, y1 + (y2 - y1) * tu, BH + lift * 16]
        plane(s, tip, alongY ? [0, 1, 0] : [1, 0, 0], UP)
        ctx.scale(1.45, 1.45)
        blade(ctx)
        ctx.restore()
      }
    })
    flat(s)
    return
  }

  const PW = 50
  const PD = 62
  const PH = 18
  const GAP = 26
  const gw = 4 * PW + 3 * GAP
  const gd = 2 * PD + GAP
  const mix = (u: number, v: number) => u + (v - u) * e
  // While the pieces still stand together, a hair of space keeps the cuts visible.
  const slit = 1.6 * (1 - e)
  const pieces: (Solid & { n: number })[] = []
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 4; i++) {
      const n = j * 4 + i
      const f = FLAWS[n]
      const pw = mix(BW / 4, PW)
      const pd = mix(BD / 2, PD)
      pieces.push({
        n,
        cx: mix(-BW / 2 + i * (BW / 4), -gw / 2 + i * (PW + GAP)) + pw / 2 + f.dx * e,
        cy: mix(-BD / 2 + j * (BD / 2), -gd / 2 + j * (PD + GAP)) + pd / 2 + f.dy * e,
        z0: 0,
        w: pw - slit,
        d: pd - slit,
        h: mix(BH, PH) + f.dh * e,
        r: mix(4.5, 5.5),
        rot: f.rot * e,
      })
    }
  }
  pieces.sort((a, b) => a.cx + a.cy - (b.cx + b.cy))
  for (const p of pieces) shadow(s, p.cx, p.cy, p.w, p.d, p.h)
  for (const p of pieces) {
    const f = FLAWS[p.n]
    solid(s, p, BUTTER, (c) => butterTop(c, p.w, p.d, f.marks, f.bend * e), f.tone * e)
  }
  flat(s)
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
        // a soft pop when the big pack turns into single portions (and back), never on the first look
        if (phase) emitSound('pop')
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
    <section ref={ref} className="sizes-pin" data-phase="bulk" data-butter-pin="" data-mood="sizes">
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
