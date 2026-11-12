// Drawing helpers for the ButterRice toy. Everything works in a fixed
// 560 x 560 "plate space" (the size of the photo), so a resize never loses
// the butter that is already on the plate.

export const PLATE = 560
export const GRID = 56 // coverage grid cells per side

export type Masks = {
  /** photo with butter already melted in; alpha = food only */
  gloss: HTMLCanvasElement
  /** 1 where a grid cell is rice */
  riceCells: Uint8Array
  /** 1 where a grid cell is any food (rice, kebab, tomato) */
  foodCells: Uint8Array
  riceTotal: number
}

export type Pat = {
  x: number
  y: number
  r: number
  rot: number
  born: number
  /** blob outline: radius factor per corner */
  shape: number[]
}

function makeCanvas(size: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  return c
}

function boxBlur(src: Float32Array, n: number, rad: number): Float32Array {
  const tmp = new Float32Array(n * n)
  const out = new Float32Array(n * n)
  const w = rad * 2 + 1
  for (let y = 0; y < n; y++) {
    let s = 0
    const row = y * n
    for (let x = -rad; x <= rad; x++) s += src[row + Math.min(n - 1, Math.max(0, x))]
    for (let x = 0; x < n; x++) {
      tmp[row + x] = s / w
      s += src[row + Math.min(n - 1, x + rad + 1)] - src[row + Math.max(0, x - rad)]
    }
  }
  for (let x = 0; x < n; x++) {
    let s = 0
    for (let y = -rad; y <= rad; y++) s += tmp[Math.min(n - 1, Math.max(0, y)) * n + x]
    for (let y = 0; y < n; y++) {
      out[y * n + x] = s / w
      s += tmp[Math.min(n - 1, y + rad + 1) * n + x] - tmp[Math.max(0, y - rad) * n + x]
    }
  }
  return out
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * Build the "buttered" version of the photo once. Rubbing only reveals it,
 * so the per-frame cost is two drawImage calls.
 * Mask image: red = rice, green = kebab and tomato.
 */
export function buildMasks(photo: HTMLImageElement, mask: HTMLImageElement): Masks {
  const n = PLATE
  const pc = makeCanvas(n)
  const pctx = pc.getContext('2d', { willReadFrequently: true })!
  pctx.drawImage(photo, 0, 0, n, n)
  const img = pctx.getImageData(0, 0, n, n)
  const px = img.data

  const mc = makeCanvas(n)
  const mctx = mc.getContext('2d', { willReadFrequently: true })!
  mctx.drawImage(mask, 0, 0, n, n)
  const mk = mctx.getImageData(0, 0, n, n).data

  const lum = new Float32Array(n * n)
  for (let i = 0; i < n * n; i++) lum[i] = 0.3 * px[i * 4] + 0.59 * px[i * 4 + 1] + 0.11 * px[i * 4 + 2]
  const soft = boxBlur(boxBlur(lum, n, 3), n, 3)

  // light comes from the top-left: a broad warm sheen sits there
  const sx = n * 0.33
  const sy = n * 0.3
  const sr = n * 0.36

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = y * n + x
      const o = i * 4
      const rice = mk[o] / 255
      const keb = mk[o + 1] / 255
      const food = Math.max(rice, keb)
      if (food < 0.02) {
        px[o + 3] = 0
        continue
      }
      const r = px[o]
      const g = px[o + 1]
      const b = px[o + 2]
      const L = lum[i]
      const hp = L - soft[i] // fine detail: grain tops are positive
      const sheen = Math.max(0, 1 - Math.hypot(x - sx, y - sy) / sr)
      // cheap stable noise for the tiny glints
      const h = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1
      const glint = Math.abs(h) > 0.972 && hp > 5 ? 1 : 0

      // rice: golden, wetter contrast, bright grain tops
      const rs = smooth(5, 24, hp) * smooth(105, 190, L)
      const rr = r * 1.01 + 6 + hp * 0.6 + rs * 58 + sheen * sheen * 20 + glint * 70
      const rg = g * 0.92 + 1 + hp * 0.6 + rs * 52 + sheen * sheen * 16 + glint * 66
      const rb = b * 0.52 + hp * 0.5 + rs * 30 + sheen * sheen * 4 + glint * 40

      // kebab and tomato: oily, deeper, with sharp glints
      const ks = smooth(3, 16, hp) * smooth(38, 120, L)
      const kr = r * 1.1 + 5 + hp * 1.4 + ks * 92 + glint * 34
      const kg = g * 1.05 + 1 + hp * 1.3 + ks * 80 + glint * 30
      const kb = b * 0.92 + hp * 1.1 + ks * 54 + glint * 18

      const w = rice + keb > 0 ? rice / (rice + keb) : 0
      px[o] = Math.max(0, Math.min(255, rr * w + kr * (1 - w)))
      px[o + 1] = Math.max(0, Math.min(255, rg * w + kg * (1 - w)))
      px[o + 2] = Math.max(0, Math.min(255, rb * w + kb * (1 - w)))
      px[o + 3] = Math.round(food * px[o + 3])
    }
  }
  pctx.putImageData(img, 0, 0)

  const riceCells = new Uint8Array(GRID * GRID)
  const foodCells = new Uint8Array(GRID * GRID)
  let riceTotal = 0
  const cell = n / GRID
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const o = (Math.floor((gy + 0.5) * cell) * n + Math.floor((gx + 0.5) * cell)) * 4
      if (mk[o] > 140) {
        riceCells[gy * GRID + gx] = 1
        riceTotal++
      }
      if (mk[o] > 140 || mk[o + 1] > 140) foodCells[gy * GRID + gx] = 1
    }
  }
  return { gloss: pc, riceCells, foodCells, riceTotal }
}

/** Soft round brush, drawn once and stamped along the stroke. */
export function makeBrush(radius: number): HTMLCanvasElement {
  const c = makeCanvas(radius * 2)
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius)
  g.addColorStop(0, 'rgba(0,0,0,0.5)')
  g.addColorStop(0.55, 'rgba(0,0,0,0.3)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, radius * 2, radius * 2)
  return c
}

// small seeded generator so the first plate looks the same on every visit
export function seeded(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

export function makePat(x: number, y: number, r: number, born: number, rnd: () => number): Pat {
  const shape: number[] = []
  for (let i = 0; i < 7; i++) shape.push(0.7 + rnd() * 0.5)
  return { x, y, r, rot: rnd() * Math.PI * 2, born, shape }
}

function blobPath(ctx: CanvasRenderingContext2D, p: Pat, scale: number) {
  const k = p.shape.length
  const pts: [number, number][] = []
  for (let i = 0; i < k; i++) {
    const a = p.rot + (i / k) * Math.PI * 2
    const rad = p.r * p.shape[i] * scale
    pts.push([p.x + Math.cos(a) * rad, p.y + Math.sin(a) * rad * 0.86])
  }
  ctx.beginPath()
  for (let i = 0; i < k; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % k]
    const mx = (a[0] + b[0]) / 2
    const my = (a[1] + b[1]) / 2
    if (i === 0) ctx.moveTo(mx, my)
    const c = pts[(i + 1) % k]
    const d = pts[(i + 2) % k]
    ctx.quadraticCurveTo(c[0], c[1], (c[0] + d[0]) / 2, (c[1] + d[1]) / 2)
  }
  ctx.closePath()
}

/**
 * One bit of butter. melt 0 = fresh knob, 1 = half melted: a smaller soft
 * lump sitting in a little clear puddle.
 */
export function drawPat(ctx: CanvasRenderingContext2D, p: Pat, melt: number) {
  const m = melt * melt * (3 - 2 * melt)
  // melted puddle spreading out under the lump
  const pr = p.r * (1.25 + 1.25 * m)
  const pg = ctx.createRadialGradient(p.x, p.y, p.r * 0.2, p.x, p.y, pr)
  pg.addColorStop(0, `rgba(255,224,120,${0.62 * m})`)
  pg.addColorStop(0.6, `rgba(250,206,96,${0.34 * m})`)
  pg.addColorStop(1, 'rgba(250,206,96,0)')
  ctx.fillStyle = pg
  ctx.beginPath()
  ctx.arc(p.x, p.y, pr, 0, Math.PI * 2)
  ctx.fill()

  const scale = 1 - 0.42 * m
  ctx.save()
  ctx.shadowColor = 'rgba(96,52,4,0.5)'
  ctx.shadowBlur = p.r * 0.5
  ctx.shadowOffsetX = p.r * 0.14
  ctx.shadowOffsetY = p.r * 0.2
  blobPath(ctx, p, scale)
  const bg = ctx.createLinearGradient(p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r)
  bg.addColorStop(0.15, '#fff3bf')
  bg.addColorStop(0.55, '#f3cf6c')
  bg.addColorStop(0.95, '#cc9632')
  ctx.fillStyle = bg
  ctx.fill()
  ctx.restore()

  // wet rim, then the small bright spot facing the light
  blobPath(ctx, p, scale)
  ctx.strokeStyle = `rgba(255,246,206,${0.18 + 0.14 * m})`
  ctx.lineWidth = Math.max(1, p.r * 0.09)
  ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.beginPath()
  ctx.ellipse(p.x - p.r * 0.26 * scale, p.y - p.r * 0.26 * scale, p.r * 0.2 * scale, p.r * 0.1 * scale, -0.7, 0, Math.PI * 2)
  ctx.fill()
}
