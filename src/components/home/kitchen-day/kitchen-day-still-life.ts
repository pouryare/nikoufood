// Painters for the three still lifes on the counter.
// Each one is painted once into an offscreen sprite; only steam, shadows and the melting butter are drawn per frame.
// Local space: origin is the middle of the group on the counter, y grows downwards (so "up" is negative).

type C = CanvasRenderingContext2D

export const SPRITE_W = 760
export const SPRITE_H = 440
export const SPRITE_OX = 380
export const SPRITE_OY = 380

export type ShadowBlob = { x: number; rx: number; h: number }
export type SteamSource = { x: number; y: number; spread: number; rise: number; strength: number }

export const STILL_LIFE: { shadows: ShadowBlob[]; steam: SteamSource[] }[] = [
  {
    shadows: [
      { x: -135, rx: 150, h: 34 },
      { x: 150, rx: 96, h: 150 },
      { x: 150, rx: 42, h: 190 },
    ],
    steam: [{ x: 150, y: -172, spread: 12, rise: 150, strength: 1 }],
  },
  { shadows: [{ x: 0, rx: 250, h: 90 }], steam: [{ x: -10, y: -130, spread: 40, rise: 120, strength: 0.55 }] },
  {
    shadows: [
      { x: -130, rx: 172, h: 250 },
      { x: 205, rx: 150, h: 96 },
    ],
    steam: [{ x: -130, y: -300, spread: 110, rise: 150, strength: 0.6 }],
  },
]

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function ell(c: C, x: number, y: number, rx: number, ry: number) {
  c.beginPath()
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
}

// Soft round patch of colour, used for contact shadows, glows and reflections.
function blob(c: C, x: number, y: number, rx: number, ry: number, rgb: string, a: number) {
  c.save()
  c.translate(x, y)
  c.scale(1, ry / rx)
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx)
  g.addColorStop(0, `rgba(${rgb},${a})`)
  g.addColorStop(0.5, `rgba(${rgb},${a * 0.6})`)
  g.addColorStop(1, `rgba(${rgb},0)`)
  c.fillStyle = g
  c.beginPath()
  c.arc(0, 0, rx, 0, Math.PI * 2)
  c.fill()
  c.restore()
}

function lin(c: C, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) {
  const g = c.createLinearGradient(x0, y0, x1, y1)
  for (const [o, col] of stops) g.addColorStop(o, col)
  return g
}

function poly(c: C, pts: number[]) {
  c.beginPath()
  c.moveTo(pts[0], pts[1])
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1])
  c.closePath()
}

// A shallow porcelain dish seen from slightly above. rimY is the height of the rim above the counter (negative).
function dish(c: C, x: number, rimY: number, rx: number, ry: number, wellRx: number, footRx: number, gold: boolean) {
  blob(c, x, 2, rx * 0.95, ry * 0.62, '2,4,10', 0.75)
  // underside, in shade because the light comes from above and behind
  c.beginPath()
  c.moveTo(x - rx, rimY)
  c.bezierCurveTo(x - rx * 0.86, rimY + ry * 0.9, x - footRx - 12, -3, x - footRx, -2)
  c.ellipse(x, -2, footRx, footRx * 0.2, 0, Math.PI, 0, true)
  c.bezierCurveTo(x + footRx + 12, -3, x + rx * 0.86, rimY + ry * 0.9, x + rx, rimY)
  c.ellipse(x, rimY, rx, ry, 0, 0, Math.PI, false)
  c.closePath()
  c.fillStyle = lin(c, x - rx, 0, x + rx, 0, [
    [0, '#aeb3c6'],
    [0.35, '#8d92a9'],
    [0.75, '#666b84'],
    [1, '#7d8299'],
  ])
  c.fill()
  // rim: brighter at the back where it catches the window
  ell(c, x, rimY, rx, ry)
  c.fillStyle = lin(c, 0, rimY - ry, 0, rimY + ry, [
    [0, '#ffffff'],
    [0.45, '#eeeef2'],
    [1, '#cfd2de'],
  ])
  c.fill()
  // well
  const wry = (wellRx / rx) * ry * 0.92
  const wy = rimY + ry * 0.1
  ell(c, x, wy, wellRx, wry)
  c.fillStyle = lin(c, 0, wy - wry, 0, wy + wry, [
    [0, '#b5b9ca'],
    [0.4, '#dcdde6'],
    [1, '#fbf9f4'],
  ])
  c.fill()
  // edge thickness at the front and a rim light at the back
  c.lineWidth = 2.2
  c.strokeStyle = 'rgba(118,124,150,0.55)'
  c.beginPath()
  c.ellipse(x, rimY + 1.4, rx - 0.5, ry, 0, 0.12, Math.PI - 0.12)
  c.stroke()
  c.lineWidth = 1.8
  c.strokeStyle = 'rgba(255,255,255,0.95)'
  c.beginPath()
  c.ellipse(x, rimY, rx - 1, ry - 1, 0, Math.PI + 0.25, Math.PI * 2 - 0.25)
  c.stroke()
  if (gold) {
    c.lineWidth = 1.7
    c.strokeStyle = 'rgba(214,160,58,0.85)'
    ell(c, x, rimY, rx - 6, ry - 2.6)
    c.stroke()
    c.lineWidth = 0.8
    c.strokeStyle = 'rgba(247,220,146,0.9)'
    c.beginPath()
    c.ellipse(x, rimY, rx - 6, ry - 2.6, 0, Math.PI * 1.1, Math.PI * 1.55)
    c.stroke()
  }
}

type BoxOpts = { r?: number; marks?: number; seed?: number; deep?: boolean }

// A block of butter: front face, top face and right side, with softened edges.
function butterBox(c: C, x: number, y: number, w: number, h: number, dz: number, skew: number, o: BoxOpts = {}) {
  const r = o.r ?? 5
  const x0 = x - w / 2
  const x1 = x + w / 2
  const top = y - h
  c.lineJoin = 'round'
  c.lineCap = 'round'
  const face = (pts: number[], fill: string | CanvasGradient) => {
    poly(c, pts)
    c.fillStyle = fill
    c.strokeStyle = fill
    c.lineWidth = r
    c.fill()
    c.stroke()
  }
  // right side
  face(
    [x1, top, x1 + skew, top - dz, x1 + skew, y - dz, x1, y],
    lin(c, x1, 0, x1 + skew, 0, [
      [0, '#cf9b38'],
      [1, o.deep ? '#a8741f' : '#b9852b'],
    ]),
  )
  // front
  face(
    [x0, top, x1, top, x1, y, x0, y],
    lin(c, 0, top, 0, y, [
      [0, '#edc564'],
      [0.55, '#e3b24c'],
      [1, '#c8922f'],
    ]),
  )
  // top
  face(
    [x0, top, x1, top, x1 + skew, top - dz, x0 + skew, top - dz],
    lin(c, x0, top - dz, x1, top, [
      [0, '#fff6d2'],
      [0.6, '#f8e19a'],
      [1, '#f0cf78'],
    ]),
  )
  // creamy texture on the front: faint smears
  const rand = rng(o.seed ?? 3)
  c.save()
  poly(c, [x0, top, x1, top, x1, y, x0, y])
  c.clip()
  for (let i = 0; i < Math.max(4, h / 5); i++) {
    const yy = top + rand() * h
    c.strokeStyle = rand() > 0.5 ? 'rgba(255,240,190,0.10)' : 'rgba(150,95,20,0.08)'
    c.lineWidth = 1 + rand() * 2
    c.beginPath()
    c.moveTo(x0 + rand() * w * 0.3, yy)
    c.quadraticCurveTo(x, yy + (rand() - 0.5) * 6, x1 - rand() * w * 0.3, yy + (rand() - 0.5) * 4)
    c.stroke()
  }
  blob(c, x0 + w * 0.2, top + h * 0.3, w * 0.5, h * 0.7, '255,244,200', 0.18)
  c.restore()
  // knife marks and sheen on top
  c.save()
  poly(c, [x0, top, x1, top, x1 + skew, top - dz, x0 + skew, top - dz])
  c.clip()
  const n = o.marks ?? 4
  for (let i = 0; i < n; i++) {
    const f = (i + 0.6 + rand() * 0.3) / (n + 0.4)
    const yy = top - dz * f
    const xs = skew * f
    c.strokeStyle = 'rgba(176,124,34,0.20)'
    c.lineWidth = 1.2
    c.beginPath()
    c.moveTo(x0 + xs + 3, yy)
    c.lineTo(x1 + xs - 3, yy - 0.6)
    c.stroke()
    c.strokeStyle = 'rgba(255,252,232,0.5)'
    c.lineWidth = 0.9
    c.beginPath()
    c.moveTo(x0 + xs + 3, yy + 1.3)
    c.lineTo(x1 + xs - 3, yy + 0.7)
    c.stroke()
  }
  blob(c, x0 + skew + w * 0.3, top - dz * 0.7, w * 0.45, dz * 0.8, '255,255,244', 0.5)
  c.restore()
  // soft light along the top front edge and the near corner
  c.strokeStyle = 'rgba(255,250,224,0.55)'
  c.lineWidth = 1.6
  c.beginPath()
  c.moveTo(x0 + 2, top + 0.5)
  c.lineTo(x1 - 1, top + 0.5)
  c.stroke()
  c.strokeStyle = 'rgba(255,238,180,0.35)'
  c.lineWidth = 1.2
  c.beginPath()
  c.moveTo(x1, top + 2)
  c.lineTo(x1, y - 2)
  c.stroke()
}

/* ---------- breakfast: butter pat on a small dish, a glass of tea ---------- */

// Half width of the narrow-waisted tea glass at height y (0 = bottom of the glass, negative = up).
function glassHalf(y: number) {
  const f = Math.min(1, Math.max(0, -y / 150))
  // wide foot, narrow waist at about 40%, flaring to the lip
  const waist = 1 - Math.exp(-Math.pow((f - 0.4) / 0.3, 2))
  return 26 + 13.5 * Math.pow(f, 1.5) + 5 * waist * (f < 0.4 ? 1 : 0.35)
}

function glassPath(c: C, x: number, by: number, y0: number, y1: number) {
  c.beginPath()
  const steps = 26
  for (let i = 0; i <= steps; i++) {
    const y = y0 + ((y1 - y0) * i) / steps
    const px = x - glassHalf(y)
    if (i === 0) c.moveTo(px, by + y)
    else c.lineTo(px, by + y)
  }
  for (let i = steps; i >= 0; i--) {
    const y = y0 + ((y1 - y0) * i) / steps
    c.lineTo(x + glassHalf(y), by + y)
  }
  c.closePath()
}

export function paintBreakfast(c: C) {
  // --- butter dish
  const dx = -135
  dish(c, dx, -17, 150, 39, 112, 74, true)
  blob(c, dx + 12, -14, 66, 15, '70,60,40', 0.5)
  butterBox(c, dx - 6, -17, 96, 27, 30, 20, { r: 6, marks: 4, seed: 11 })
  // --- tea
  const tx = 150
  dish(c, tx, -11, 96, 25, 70, 44, false)
  const by = -13 // the glass stands in the well of the saucer
  // light that passes through the tea and lands on the saucer
  blob(c, tx - 8, by + 9, 46, 9, '236,120,30', 0.42)
  blob(c, tx, by + 2, 34, 8, '40,20,10', 0.5)

  // glass body
  glassPath(c, tx, by, 0, -150)
  c.fillStyle = 'rgba(205,222,240,0.13)'
  c.fill()
  // tea
  c.save()
  glassPath(c, tx, by, -9, -129)
  c.clip()
  c.fillStyle = lin(c, tx - 40, 0, tx + 40, 0, [
    [0, '#571304'],
    [0.16, '#a23a10'],
    [0.42, '#e07a22'],
    [0.6, '#c9561a'],
    [0.86, '#7c2408'],
    [1, '#4a1004'],
  ])
  c.fillRect(tx - 50, by - 160, 100, 170)
  c.fillStyle = lin(c, 0, by - 129, 0, by - 9, [
    [0, 'rgba(255,176,70,0.42)'],
    [0.35, 'rgba(255,150,50,0.08)'],
    [1, 'rgba(40,8,0,0.38)'],
  ])
  c.fillRect(tx - 50, by - 160, 100, 170)
  // the waist glows where the glass is thinnest
  blob(c, tx - 4, by - 62, 20, 40, '255,170,70', 0.3)
  c.restore()
  // thick glass foot
  ell(c, tx, by - 1, glassHalf(0), 7.5)
  c.fillStyle = 'rgba(214,228,244,0.34)'
  c.fill()
  blob(c, tx - 6, by - 4, 22, 5, '255,255,255', 0.55)
  // tea surface
  const sy = by - 129
  const srx = glassHalf(-129) - 1.5
  ell(c, tx, sy, srx, srx * 0.25)
  c.fillStyle = lin(c, tx - srx, 0, tx + srx, 0, [
    [0, '#7b260a'],
    [0.5, '#b65216'],
    [1, '#6a1e06'],
  ])
  c.fill()
  c.save()
  ell(c, tx, sy, srx, srx * 0.25)
  c.clip()
  blob(c, tx - 6, sy - 3, srx * 0.7, 5, '255,214,150', 0.6)
  c.restore()
  // gold band and lip
  const ly = by - 150
  const lrx = glassHalf(-150)
  c.lineWidth = 2.2
  c.strokeStyle = 'rgba(227,176,75,0.75)'
  c.beginPath()
  c.ellipse(tx, by - 141, glassHalf(-141), glassHalf(-141) * 0.25, 0, 0.05, Math.PI - 0.05)
  c.stroke()
  c.lineWidth = 1.5
  c.strokeStyle = 'rgba(255,255,255,0.55)'
  ell(c, tx, ly, lrx, lrx * 0.25)
  c.stroke()
  c.lineWidth = 1.8
  c.strokeStyle = 'rgba(255,255,255,0.95)'
  c.beginPath()
  c.ellipse(tx, ly, lrx, lrx * 0.25, 0, Math.PI * 1.08, Math.PI * 1.6)
  c.stroke()
  // long highlights that follow the curve of the glass
  const streak = (off: number, w: number, a: number, y0: number, y1: number) => {
    c.strokeStyle = `rgba(255,255,255,${a})`
    c.lineWidth = w
    c.lineCap = 'round'
    c.beginPath()
    for (let i = 0; i <= 18; i++) {
      const y = y0 + ((y1 - y0) * i) / 18
      const px = tx + Math.sign(off) * (glassHalf(y) - Math.abs(off))
      if (i === 0) c.moveTo(px, by + y)
      else c.lineTo(px, by + y)
    }
    c.stroke()
  }
  streak(-6, 3.4, 0.5, -16, -122)
  streak(-11.5, 1.2, 0.35, -30, -100)
  streak(5, 1.6, 0.3, -24, -136)
  // outline so the glass reads against the bright window
  c.lineWidth = 1
  c.strokeStyle = 'rgba(230,240,255,0.4)'
  glassPath(c, tx, by, 0, -150)
  c.stroke()

  // two sugar cubes on the saucer
  const cube = (x: number, y: number, s: number) => {
    blob(c, x + 3, y + 1, s * 1.1, s * 0.4, '60,50,40', 0.4)
    poly(c, [x - s, y - s * 1.1, x + s, y - s * 1.1, x + s, y, x - s, y])
    c.fillStyle = '#e6e3dc'
    c.fill()
    poly(c, [x - s, y - s * 1.1, x + s, y - s * 1.1, x + s + s * 0.5, y - s * 1.6, x - s + s * 0.5, y - s * 1.6])
    c.fillStyle = '#ffffff'
    c.fill()
    poly(c, [x + s, y - s * 1.1, x + s + s * 0.5, y - s * 1.6, x + s + s * 0.5, y - s * 0.5, x + s, y])
    c.fillStyle = '#c4c2c4'
    c.fill()
  }
  cube(tx + 58, -9, 7)
  cube(tx + 44, -3, 7)
}

/* ---------- lunch: a plate of white rice ---------- */

const MOUND_RX = 172
const MOUND_BASE = -24

function moundTop(x: number) {
  const f = Math.min(1, Math.abs(x) / MOUND_RX)
  return MOUND_BASE - 104 * Math.pow(1 - Math.pow(f, 2.3), 0.85)
}
function moundBottom(x: number) {
  const f = Math.min(1, Math.abs(x) / MOUND_RX)
  return MOUND_BASE + 40 * Math.sqrt(1 - f * f)
}

export function paintLunch(c: C) {
  dish(c, 0, -19, 250, 64, 196, 110, true)
  // shadow of the rice inside the plate
  blob(c, 6, -6, 200, 46, '60,56,60', 0.5)

  // base shape of the mound
  c.beginPath()
  for (let x = -MOUND_RX; x <= MOUND_RX; x += 4) {
    if (x === -MOUND_RX) c.moveTo(x, moundTop(x))
    else c.lineTo(x, moundTop(x))
  }
  for (let x = MOUND_RX; x >= -MOUND_RX; x -= 4) c.lineTo(x, moundBottom(x))
  c.closePath()
  c.fillStyle = lin(c, -MOUND_RX, MOUND_BASE - 110, MOUND_RX * 0.6, MOUND_BASE + 40, [
    [0, '#fdfaf0'],
    [0.55, '#e9e3d3'],
    [1, '#c2baa8'],
  ])
  c.fill()

  // long grains; each one gets a tiny shadow so the surface reads as rice, not as a white dome
  const rand = rng(41)
  const grain = (x: number, y: number, len: number, wd: number, rot: number, fill: string, sh: number) => {
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    c.fillStyle = `rgba(110,96,74,${sh})`
    c.beginPath()
    c.ellipse(0.8, 1.3, len, wd, 0, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = fill
    c.beginPath()
    c.ellipse(0, 0, len, wd, 0, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }
  for (let i = 0; i < 2300; i++) {
    const x = (rand() * 2 - 1) * (MOUND_RX - 2)
    const top = moundTop(x)
    const bot = moundBottom(x)
    const v = rand()
    const y = top + (bot - top) * v
    // lit from above and behind: bright crown, soft shade low and to the right
    const shade = Math.min(1, Math.max(0, 0.75 * v * v + 0.22 * (x / MOUND_RX) + rand() * 0.16 - 0.04))
    const r = Math.round(255 - shade * 58)
    const g = Math.round(253 - shade * 62)
    const b = Math.round(246 - shade * 72)
    grain(x, y, 5.2 + rand() * 2.2, 1.45 + rand() * 0.5, rand() * Math.PI, `rgb(${r},${g},${b})`, 0.22 + shade * 0.2)
  }
  // a little saffron rice on the crown
  for (let i = 0; i < 210; i++) {
    const a = rand() * Math.PI * 2
    const d = Math.sqrt(rand())
    const x = Math.cos(a) * d * 78 + 4
    const y = moundTop(x) + 6 + Math.abs(Math.sin(a)) * d * 26 + rand() * 6
    const warm = rand()
    const col = warm > 0.6 ? '#f3b62c' : warm > 0.25 ? '#f7cb4e' : '#e99a1e'
    grain(x, y, 5 + rand() * 2, 1.5 + rand() * 0.4, rand() * Math.PI, col, 0.3)
  }
  // soft light on the crown, soft shade at the foot
  c.save()
  c.globalCompositeOperation = 'source-atop'
  blob(c, -40, MOUND_BASE - 84, 150, 52, '255,255,250', 0.22)
  blob(c, 70, MOUND_BASE + 28, 190, 30, '70,62,60', 0.28)
  c.restore()

}

/* Butter on the rice, redrawn every frame: m = 0 is a fresh pat, m = 1 is nearly a pool. */
export function drawMeltingButter(c: C, m: number) {
  const y = MOUND_BASE - 98
  const pool = 0.25 + 0.75 * m
  // glossy melted butter running into the grains
  c.fillStyle = 'rgba(243,196,62,0.58)'
  c.beginPath()
  c.ellipse(2, y + 6, 34 + 52 * pool, 9 + 13 * pool, 0, 0, Math.PI * 2)
  c.fill()
  const tongue = (x: number, len: number, w: number, lean: number) => {
    if (len < 2) return
    c.beginPath()
    c.moveTo(x - w, y + 8)
    c.quadraticCurveTo(x - w + lean, y + 8 + len * 0.8, x + lean * 1.6, y + 8 + len)
    c.quadraticCurveTo(x + w + lean, y + 8 + len * 0.8, x + w, y + 8)
    c.closePath()
    c.fill()
  }
  tongue(-52, 12 + 46 * m, 10, -9)
  tongue(14, 8 + 34 * m, 9, 3)
  tongue(60, 10 + 52 * m, 11, 12)
  // gloss
  c.strokeStyle = 'rgba(255,248,214,0.75)'
  c.lineWidth = 1.6
  c.lineCap = 'round'
  c.beginPath()
  c.ellipse(-2, y + 4, 26 + 42 * pool, 6 + 9 * pool, 0, Math.PI * 1.08, Math.PI * 1.55)
  c.stroke()
  c.beginPath()
  c.moveTo(-58, y + 14)
  c.lineTo(-62, y + 14 + (8 + 30 * m))
  c.stroke()

  // the pat sinks and rounds off as it melts
  const w = 78 * (1 - 0.42 * m)
  const h = 4 + 20 * (1 - m) * (1 - 0.3 * m)
  const dz = 20 * (1 - 0.3 * m)
  const sk = 13
  const x0 = -w / 2 - 4
  const x1 = w / 2 - 4
  const top = y - h
  c.lineJoin = 'round'
  c.lineWidth = 5 + 5 * m
  const face = (col: string, pts: number[]) => {
    c.fillStyle = col
    c.strokeStyle = col
    c.beginPath()
    c.moveTo(pts[0], pts[1])
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1])
    c.closePath()
    c.fill()
    c.stroke()
  }
  face('#c9952f', [x1, top, x1 + sk, top - dz, x1 + sk, y - dz, x1, y])
  face('#e6b850', [x0, top, x1, top, x1, y, x0, y])
  face('#fbe9a6', [x0, top, x1, top, x1 + sk, top - dz, x0 + sk, top - dz])
  c.fillStyle = 'rgba(255,255,244,0.55)'
  c.beginPath()
  c.ellipse(x0 + sk + w * 0.36, top - dz * 0.62, w * 0.26, dz * 0.24, -0.1, 0, Math.PI * 2)
  c.fill()
}

/* ---------- dinner: a big steel pot and a block of bulk butter on paper ---------- */

export function paintDinner(c: C) {
  const px = -130
  const hw = 158
  const yTop = -246
  const yBot = -10
  const ry = 40

  blob(c, px, 4, hw * 1.08, 34, '2,3,8', 0.85)

  // side handles (behind the body edge)
  const handle = (side: number) => {
    const hx = px + side * (hw - 2)
    const hy = yTop + 52
    c.lineCap = 'round'
    c.strokeStyle = '#2b3246'
    c.lineWidth = 13
    c.beginPath()
    c.moveTo(hx, hy - 20)
    c.bezierCurveTo(hx + side * 44, hy - 22, hx + side * 44, hy + 20, hx, hy + 18)
    c.stroke()
    c.strokeStyle = lin(c, 0, hy - 24, 0, hy + 22, [
      [0, '#f1f4f9'],
      [0.5, '#8e97ac'],
      [1, '#4b536a'],
    ])
    c.lineWidth = 9
    c.stroke()
    c.strokeStyle = 'rgba(255,255,255,0.75)'
    c.lineWidth = 2
    c.beginPath()
    c.moveTo(hx + side * 8, hy - 21)
    c.bezierCurveTo(hx + side * 40, hy - 22, hx + side * 41, hy + 4, hx + side * 30, hy + 12)
    c.stroke()
  }
  handle(-1)
  handle(1)

  // body
  const body = () => {
    c.beginPath()
    c.moveTo(px - hw, yTop)
    c.lineTo(px - hw, yBot - 6)
    c.ellipse(px, yBot - 6, hw, ry, 0, Math.PI, 0, true)
    c.lineTo(px + hw, yTop)
    c.closePath()
  }
  body()
  c.fillStyle = lin(c, px - hw, 0, px + hw, 0, [
    [0, '#2f364c'],
    [0.05, '#77819a'],
    [0.17, '#dfe5ee'],
    [0.27, '#aab3c5'],
    [0.42, '#59627b'],
    [0.6, '#3b4359'],
    [0.76, '#7f889f'],
    [0.9, '#d9c79f'],
    [0.97, '#7a7888'],
    [1, '#3a3f55'],
  ])
  c.fill()
  c.save()
  body()
  c.clip()
  // the dark counter reflects in the lower half, the room above
  c.fillStyle = lin(c, 0, yTop, 0, yBot + ry, [
    [0, 'rgba(255,255,255,0.10)'],
    [0.3, 'rgba(255,255,255,0)'],
    [0.62, 'rgba(8,12,26,0.05)'],
    [0.86, 'rgba(8,12,26,0.5)'],
    [1, 'rgba(6,9,20,0.72)'],
  ])
  c.fillRect(px - hw, yTop, hw * 2, yBot + ry - yTop)
  // brushed steel
  const rand = rng(77)
  for (let i = 0; i < 90; i++) {
    const yy = yTop + rand() * (yBot - yTop)
    c.strokeStyle = rand() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(10,14,30,0.06)'
    c.lineWidth = 0.8 + rand()
    c.beginPath()
    c.ellipse(px, yy - 6, hw, ry, 0, 0.02, Math.PI - 0.02)
    c.stroke()
  }
  // the window, bent by the curve of the pot
  c.fillStyle = 'rgba(232,240,255,0.5)'
  c.beginPath()
  c.roundRect(px - hw * 0.74, yTop + 34, 34, 138, 9)
  c.fill()
  c.fillStyle = 'rgba(70,80,104,0.6)'
  c.fillRect(px - hw * 0.74 + 15, yTop + 34, 3.5, 138)
  // the butter block glows on the near side
  blob(c, px + hw * 0.78, -70, 44, 70, '240,186,76', 0.34)
  // bright line where the wall meets the base
  c.strokeStyle = 'rgba(210,220,238,0.35)'
  c.lineWidth = 1.6
  c.beginPath()
  c.ellipse(px, yBot - 12, hw - 1, ry, 0, 0.1, Math.PI - 0.1)
  c.stroke()
  c.restore()

  // rolled rim
  c.lineWidth = 8
  c.strokeStyle = lin(c, px - hw, 0, px + hw, 0, [
    [0, '#5a637b'],
    [0.2, '#f4f7fb'],
    [0.5, '#8f98ad'],
    [0.85, '#e6d7b4'],
    [1, '#4f566e'],
  ])
  ell(c, px, yTop, hw + 3, ry + 1)
  c.stroke()

  // lid
  const lw = hw - 5
  c.beginPath()
  c.moveTo(px - lw, yTop - 2)
  c.bezierCurveTo(px - lw * 0.82, yTop - 44, px - lw * 0.3, yTop - 58, px, yTop - 58)
  c.bezierCurveTo(px + lw * 0.3, yTop - 58, px + lw * 0.82, yTop - 44, px + lw, yTop - 2)
  c.ellipse(px, yTop - 2, lw, ry - 3, 0, 0, Math.PI, false)
  c.closePath()
  c.fillStyle = lin(c, px - lw, yTop - 50, px + lw, yTop + 30, [
    [0, '#6b748c'],
    [0.2, '#f4f6fa'],
    [0.38, '#b7bfcf'],
    [0.62, '#5e6780'],
    [0.84, '#8a8f9f'],
    [1, '#3f465c'],
  ])
  c.fill()
  c.save()
  c.clip()
  blob(c, px - lw * 0.42, yTop - 34, 76, 20, '255,255,255', 0.6)
  blob(c, px + lw * 0.5, yTop + 6, 90, 22, '236,196,120', 0.22)
  c.restore()
  c.strokeStyle = 'rgba(245,248,252,0.8)'
  c.lineWidth = 1.6
  c.beginPath()
  c.ellipse(px, yTop - 2, lw, ry - 3, 0, 0.15, Math.PI - 0.5)
  c.stroke()
  // knob
  c.fillStyle = '#343b50'
  c.fillRect(px - 7, yTop - 72, 14, 16)
  ell(c, px, yTop - 74, 24, 8.5)
  c.fillStyle = lin(c, px - 24, 0, px + 24, 0, [
    [0, '#737c94'],
    [0.3, '#f7f9fc'],
    [0.6, '#99a2b6'],
    [1, '#454c63'],
  ])
  c.fill()
  c.strokeStyle = 'rgba(40,46,66,0.6)'
  c.lineWidth = 1
  c.stroke()

  // --- bulk butter on paper
  const bx = 205
  blob(c, bx + 8, 8, 176, 36, '2,3,8', 0.75)
  // paper sheet, a little larger than the block, with one corner lifting
  c.beginPath()
  c.moveTo(bx - 150, 12)
  c.quadraticCurveTo(bx - 60, 20, bx + 96, 17)
  c.lineTo(bx + 158, 9)
  c.quadraticCurveTo(bx + 150, -18, bx + 128, -42)
  c.quadraticCurveTo(bx, -50, bx - 118, -44)
  c.quadraticCurveTo(bx - 140, -18, bx - 150, 12)
  c.closePath()
  c.fillStyle = lin(c, bx - 150, -44, bx + 120, 18, [
    [0, '#f6eedc'],
    [0.6, '#e6dcc4'],
    [1, '#cfc3a6'],
  ])
  c.fill()
  // creases
  c.lineWidth = 1
  for (const [a, b, d, e, col] of [
    [-110, -40, -126, 12, 'rgba(120,104,70,0.28)'],
    [-20, -46, -34, 17, 'rgba(255,255,255,0.6)'],
    [70, -46, 84, 17, 'rgba(120,104,70,0.22)'],
    [-140, -12, 150, -14, 'rgba(255,255,255,0.35)'],
  ] as [number, number, number, number, string][]) {
    c.strokeStyle = col
    c.beginPath()
    c.moveTo(bx + a, b)
    c.lineTo(bx + d, e)
    c.stroke()
  }
  // lifted corner
  poly(c, [bx + 96, 17, bx + 158, 9, bx + 136, -4])
  c.fillStyle = '#fbf6ea'
  c.fill()
  blob(c, bx + 120, 12, 30, 6, '60,50,30', 0.35)
  // shadow of the block on the paper
  blob(c, bx + 22, -6, 140, 26, '74,60,30', 0.55)

  // the block, with one thick slice cut and standing a little apart
  blob(c, bx - 108, -4, 30, 8, '74,60,30', 0.5)
  butterBox(c, bx - 116, -4, 26, 84, 40, 30, { r: 6, marks: 6, seed: 9, deep: true })
  butterBox(c, bx + 18, -8, 196, 86, 40, 30, { r: 8, marks: 6, seed: 5, deep: true })
}
