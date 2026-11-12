// Canvas renderer for "a day in a kitchen".
// Static parts (interior, stars, city lights, still lifes) are painted once into offscreen canvases on resize.
// A frame is then a handful of gradient fills, vector fills and image blits.
// Space: the picture is always 1000 units high; the width in units follows the aspect ratio.

import {
  SPRITE_H,
  SPRITE_OX,
  SPRITE_OY,
  SPRITE_W,
  STILL_LIFE,
  drawMeltingButter,
  paintBreakfast,
  paintDinner,
  paintLunch,
} from './kitchen-day-still-life'

type C = CanvasRenderingContext2D
type Layer = { cv: HTMLCanvasElement; w: number; h: number }

export type KitchenScene = {
  resize: (cssW: number, cssH: number, dpr: number) => void
  draw: (t: number, now: number) => void
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (a: number, b: number, x: number) => {
  const u = clamp01((x - a) / (b - a))
  return u * u * (3 - 2 * u)
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ---------- colours of the hour ---------- */

// Key times: 7:00, 9:48, 13:00, 16:00, 17:30, 18:30, 19:30, 21:00
const KT = [0, 0.2, 0.43, 0.64, 0.75, 0.82, 0.89, 1]
const PAL = {
  skyTop: ['33507f', '2b5c9e', '28599f', '37629c', '37367a', '1b2150', '0c1232', '050916'],
  skyMid: ['8fa6c8', '6298cf', '5a93cc', '86a9cc', 'a8648c', '5a3a72', '1c2148', '0a1026'],
  skyLow: ['f4c9a2', 'c6dcee', 'b9d3ea', 'f0d6a8', 'f89a4c', 'd96a48', '4a3462', '161e3c'],
  mtnFar: ['8088aa', '7b93b8', '7894ba', '8a93b0', '6d5a8c', '3b3566', '1a2046', '0d1329'],
  mtnNear: ['666f93', '65799e', '637ca2', '727c98', '54467a', '2d2a55', '141a3a', '0a0f22'],
  snow: ['fde8d8', 'f6f9fd', 'ffffff', 'fdf3e2', 'ffc7a0', 'c98fa2', '56618e', '2b3659'],
  cityFar: ['566083', '556b8e', '546c90', '636a86', '473a68', '25234a', '10152f', '080c1c'],
  cityNear: ['343c5e', '384b6e', '384d72', '434964', '2f264a', '181734', '0b1024', '05080f'],
  cityLit: ['e8bf9e', '9db2ca', 'a5b9d0', 'dcc29c', 'e58d58', '7a4a60', '1a2040', '0a0f1e'],
  towerLit: ['f0d0b6', 'c9d5e3', 'd3deea', 'eed6b4', 'f4a472', '8f5d7a', '262e55', '141a34'],
  towerShade: ['666c8e', '6c82a3', '7089ab', '7c7f98', '573d6a', '2b2750', '121733', '090d1c'],
  cloudLit: ['ffe6d0', 'ffffff', 'ffffff', 'fff1da', 'ffb47c', 'd4748c', '3c4472', '1b2346'],
  cloudShade: ['c7a8b6', 'bccde2', 'c3d3e6', 'd4c0b2', '8a5a8c', '4a3568', '1a2248', '0c1230'],
  sun: ['ffdcaa', 'fff4d6', 'fffbea', 'ffeab4', 'ffb458', 'ff7e3c', 'ff7e3c', 'ff7e3c'],
} as const
type PalKey = keyof typeof PAL

const PALN = {} as Record<PalKey, number[][]>
for (const k of Object.keys(PAL) as PalKey[]) {
  PALN[k] = PAL[k].map((h) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)])
}

/* ---------- small canvas helpers ---------- */

function makeLayer(wU: number, hU: number, px: number): Layer & { c: C } {
  const cv = document.createElement('canvas')
  cv.width = Math.max(1, Math.ceil(wU * px))
  cv.height = Math.max(1, Math.ceil(hU * px))
  const c = cv.getContext('2d')!
  c.setTransform(px, 0, 0, px, 0, 0)
  return { cv, c, w: wU, h: hU }
}

// Cheap blur that works in every browser: shrink, then stretch back with smoothing.
function blurLayer(layer: Layer & { c: C }, factor: number) {
  const { cv, c } = layer
  const sw = Math.max(2, Math.round(cv.width / factor))
  const sh = Math.max(2, Math.round(cv.height / factor))
  const small = document.createElement('canvas')
  small.width = sw
  small.height = sh
  const sc = small.getContext('2d')!
  sc.imageSmoothingQuality = 'high'
  sc.drawImage(cv, 0, 0, sw, sh)
  c.save()
  c.setTransform(1, 0, 0, 1, 0, 0)
  c.clearRect(0, 0, cv.width, cv.height)
  c.imageSmoothingQuality = 'high'
  c.drawImage(small, 0, 0, cv.width, cv.height)
  c.restore()
}

function radial(c: C, x: number, y: number, rx: number, ry: number, rgb: string, a: number) {
  c.save()
  c.translate(x, y)
  c.scale(1, ry / rx)
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx)
  g.addColorStop(0, `rgba(${rgb},${a})`)
  g.addColorStop(0.5, `rgba(${rgb},${a * 0.55})`)
  g.addColorStop(1, `rgba(${rgb},0)`)
  c.fillStyle = g
  c.beginPath()
  c.arc(0, 0, rx, 0, Math.PI * 2)
  c.fill()
  c.restore()
}

/* ---------- geometry of the room ---------- */

const O_X = 60 // wall on each side of the opening
const O_Y0 = 46
const O_Y1 = 690
const REVEAL = 24 // depth of the wall, seen as a bevel around the frame
const FRAME = 16
const MULLION = 16
const G_Y0 = O_Y0 + REVEAL + FRAME // glass
const G_Y1 = O_Y1 - REVEAL - FRAME
const SILL_BACK = O_Y1 - REVEAL - 2
const SILL_FRONT = 702
const SILL_FACE = 720
const COUNTER_Y = 756
const GROUND = 896 // where the still life stands
const SL = 1.16 // still life scale
const CITY_BASE = 670
const MTN_BASE = 632

export function createKitchenScene(canvas: HTMLCanvasElement): KitchenScene {
  const ctx = canvas.getContext('2d', { alpha: false })!
  let px = 1
  let VW = 1600
  let ready = false

  // per-frame palette cursor
  let seg = 0
  let segU = 0
  const col = (k: PalKey, a = 1) => {
    const p = PALN[k]
    const A = p[seg]
    const B = p[seg + 1]
    const r = (A[0] + (B[0] - A[0]) * segU) | 0
    const g = (A[1] + (B[1] - A[1]) * segU) | 0
    const b = (A[2] + (B[2] - A[2]) * segU) | 0
    return a >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`
  }

  // built on resize
  let interiorDay: Layer, interiorLamp: Layer, stars: Layer, moon: Layer, sheen: Layer, patch: Layer, shadow: Layer, puff: Layer
  let lights: Layer[] = []
  let towerGlow: Layer
  let sprites: Layer[] = []
  let cloudMasks: Layer[] = []
  let cloudScratch: (Layer & { c: C })[] = []
  let clouds: { x: number; y: number; w: number; h: number; speed: number; i: number }[] = []
  let pMtnFar: Path2D, pSnow: Path2D, pFacetL: Path2D, pFacetR: Path2D, pMtnNear: Path2D, pNearFacetL: Path2D, pNearFacetR: Path2D
  let pCityFar: Path2D, pCityNear: Path2D, pStripL: Path2D, pStripR: Path2D, pRoof: Path2D, pFloors: Path2D
  let pTower: Path2D, pTowerL: Path2D, pTowerR: Path2D, pTowerBands: Path2D, pTowerCone: Path2D
  let MX = 0 // Milad Tower
  let AX = 0 // still life
  let gx0 = 0
  let gx1 = 0

  /* ----- mountains ----- */
  function ridge(seed: number, peaks: [number, number, number][], noise: number) {
    const rand = rng(seed)
    const step = 4
    const n = Math.ceil((VW + 80) / step) + 1
    // value noise, three octaves
    const tab = Array.from({ length: 512 }, () => rand())
    const vn = (x: number) => {
      const i = Math.floor(x)
      const f = x - i
      const u = f * f * (3 - 2 * f)
      return tab[i & 511] * (1 - u) + tab[(i + 1) & 511] * u
    }
    const ys = new Float32Array(n)
    const s = VW / 1600
    for (let i = 0; i < n; i++) {
      const x = -40 + i * step
      let h = 0
      for (const [cx, ph, pw] of peaks) {
        const d = Math.abs(x - cx * VW) / (pw * s)
        if (d < 1) h = Math.max(h, ph * Math.pow(1 - d, 1.12))
      }
      h += noise * ((vn(x / 120) - 0.5) * 1.6 + (vn(x / 44 + 40) - 0.5) * 1.1 + (vn(x / 17 + 90) - 0.5) * 0.5 + (vn(x / 7 + 130) - 0.5) * 0.2)
      ys[i] = h
    }
    return { ys, step, n, rand, vn }
  }

  function buildMountains() {
    const far = ridge(
      9,
      [
        [-0.03, 196, 430],
        [0.12, 236, 390],
        [0.25, 204, 340],
        [0.4, 300, 430],
        [0.55, 252, 380],
        [0.7, 212, 360],
        [0.86, 178, 360],
        [1.0, 226, 380],
      ],
      26,
    )
    const X = (i: number) => -40 + i * far.step
    const Y = (i: number) => MTN_BASE - far.ys[i]
    pMtnFar = new Path2D()
    pMtnFar.moveTo(-40, CITY_BASE)
    for (let i = 0; i < far.n; i++) pMtnFar.lineTo(X(i), Y(i))
    pMtnFar.lineTo(X(far.n - 1), CITY_BASE)
    pMtnFar.closePath()

    // snow: everything above a ragged line, with fingers running down the gullies
    pSnow = new Path2D()
    const bottom: number[] = []
    for (let i = 0; i < far.n; i++) {
      const x = X(i)
      const line = 474 + (far.vn(x / 60 + 7) - 0.5) * 50 + (far.vn(x / 19 + 3) - 0.5) * 40 + (far.vn(x / 7 + 11) - 0.5) * 24
      bottom.push(Math.max(Y(i), line))
    }
    pSnow.moveTo(X(0), Y(0))
    for (let i = 1; i < far.n; i++) pSnow.lineTo(X(i), Y(i))
    for (let i = far.n - 1; i >= 0; i--) pSnow.lineTo(X(i), bottom[i])
    pSnow.closePath()

    const facets = (r: ReturnType<typeof ridge>, base: number, win: number) => {
      const L = new Path2D()
      const R = new Path2D()
      const y = (i: number) => base - r.ys[i]
      for (let i = win; i < r.n - win; i++) {
        let isPeak = true
        for (let j = 1; j <= win; j++) if (r.ys[i] < r.ys[i - j] || r.ys[i] <= r.ys[i + j]) isPeak = false
        if (!isPeak) continue
        for (const dir of [-1, 1]) {
          // walk down the ridge to the next valley on this side
          let v = i
          while (v + dir > 0 && v + dir < r.n - 1 && r.ys[v + dir] <= r.ys[v] + 0.5) v += dir
          if (Math.abs(v - i) < 4) continue
          const p = dir < 0 ? L : R
          p.moveTo(X(i), y(i))
          for (let k = i; k !== v + dir; k += dir) p.lineTo(X(k), y(k))
          // come back to the summit along a lower, broken line: the shaded flank under the ridge
          const depth = (r.ys[i] - r.ys[v]) * 0.55 + 22
          const nodes = Math.max(3, Math.round(Math.abs(v - i) / 5))
          for (let q = nodes - 1; q >= 1; q--) {
            const f = q / nodes
            const k = Math.round(i + (v - i) * f)
            const sag = depth * Math.sin(Math.PI * f) * (1.15 - 0.7 * f) * (0.55 + r.rand() * 0.75)
            p.lineTo(X(k) - dir * sag * 0.35, y(k) + sag)
          }
          p.closePath()
        }
      }
      return [L, R]
    }
    ;[pFacetL, pFacetR] = facets(far, MTN_BASE, 5)

    const near = ridge(
      23,
      [
        [0.02, 92, 260],
        [0.2, 70, 230],
        [0.33, 118, 250],
        [0.52, 84, 240],
        [0.68, 104, 230],
        [0.84, 76, 220],
        [0.99, 112, 240],
      ],
      9,
    )
    pMtnNear = new Path2D()
    pMtnNear.moveTo(-40, CITY_BASE)
    for (let i = 0; i < near.n; i++) pMtnNear.lineTo(X(i), MTN_BASE + 8 - near.ys[i])
    pMtnNear.lineTo(X(near.n - 1), CITY_BASE)
    pMtnNear.closePath()
    ;[pNearFacetL, pNearFacetR] = facets(near, MTN_BASE + 8, 5)
  }

  /* ----- Milad Tower ----- */
  const TK = 1.2 // units per metre
  const HEAD: [number, number][] = [
    [244, 6.3],
    [250, 11],
    [258, 20],
    [266, 27],
    [270, 29.5],
    [282, 29.5],
    [284, 26],
    [291, 25],
    [293, 20],
    [300, 18.5],
    [302, 13],
    [309, 11],
    [311, 7],
    [316, 5],
  ]
  const MAST: [number, number][] = [
    [316, 3.6],
    [346, 3.6],
    [346, 2.6],
    [384, 2.6],
    [384, 1.8],
    [418, 1.8],
    [418, 1.1],
    [435, 1.1],
  ]
  const shaftW = (h: number) => 6.2 + 10 * Math.exp(-h / 36)
  const ty = (h: number) => CITY_BASE - h * TK

  function buildTower() {
    const prof: [number, number][] = []
    for (let h = 0; h <= 244; h += 12) prof.push([h, shaftW(h)])
    prof.push(...HEAD, ...MAST)
    pTower = new Path2D()
    pTower.moveTo(MX - prof[0][1] * TK, ty(0))
    for (const [h, w] of prof) pTower.lineTo(MX - w * TK, ty(h))
    for (let i = prof.length - 1; i >= 0; i--) pTower.lineTo(MX + prof[i][1] * TK, ty(prof[i][0]))
    pTower.closePath()
    // the sunlit third of the round shaft and head
    const strip = (side: number) => {
      const p = new Path2D()
      const body = prof.filter(([h]) => h <= 316)
      p.moveTo(MX + side * body[0][1] * TK, ty(0))
      for (const [h, w] of body) p.lineTo(MX + side * w * TK, ty(h))
      for (let i = body.length - 1; i >= 0; i--) p.lineTo(MX + side * body[i][1] * TK * 0.22, ty(body[i][0]))
      p.closePath()
      return p
    }
    pTowerL = strip(-1)
    pTowerR = strip(1)
    // window bands of the head
    pTowerBands = new Path2D()
    for (const [h, w] of [
      [272.2, 29.5],
      [276, 29.5],
      [279.8, 29.5],
      [287.5, 25.4],
      [296.5, 19],
      [305.5, 12],
    ]) {
      pTowerBands.rect(MX - w * TK, ty(h) - 1, w * 2 * TK, 2)
    }
    // the basket under the head is open steelwork, so it reads darker
    pTowerCone = new Path2D()
    pTowerCone.moveTo(MX - 6.3 * TK, ty(244))
    for (const [h, w] of HEAD.slice(0, 5)) pTowerCone.lineTo(MX - w * TK, ty(h))
    for (const [h, w] of HEAD.slice(0, 5).reverse()) pTowerCone.lineTo(MX + w * TK, ty(h))
    pTowerCone.closePath()
  }

  /* ----- city ----- */
  type Bld = { x: number; w: number; top: number }
  let nearBlds: Bld[] = []
  let farBlds: Bld[] = []

  function buildCity() {
    const rand = rng(1234)
    pCityFar = new Path2D()
    farBlds = []
    for (let x = -20; x < VW + 20; ) {
      const w = 13 + rand() * 30
      const tall = rand() > 0.93
      const top = (tall ? 548 : 590) + rand() * 34
      pCityFar.rect(x, top, w + 0.6, CITY_BASE - top + 10)
      if (rand() > 0.6) pCityFar.rect(x + w * 0.3, top - 5, w * 0.3, 6)
      farBlds.push({ x, w, top })
      x += w + (rand() > 0.8 ? rand() * 6 : 0)
    }
    pCityNear = new Path2D()
    pStripL = new Path2D()
    pStripR = new Path2D()
    pRoof = new Path2D()
    pFloors = new Path2D()
    nearBlds = []
    for (let x = -30; x < VW + 30; ) {
      const w = 42 + rand() * 70
      const nearTower = Math.abs(x + w / 2 - MX) < 90
      const tall = !nearTower && rand() > 0.84
      const top = tall ? 548 + rand() * 30 : 606 + rand() * 40
      pCityNear.rect(x, top, w + 0.6, CITY_BASE - top + 10)
      const sw = Math.min(16, w * 0.2)
      pStripL.rect(x, top, sw, CITY_BASE - top)
      pStripR.rect(x + w - sw, top, sw, CITY_BASE - top)
      // roof clutter: stair heads, water tanks, aerials
      if (rand() > 0.35) pCityNear.rect(x + w * (0.15 + rand() * 0.4), top - 7 - rand() * 5, 10 + rand() * 12, 13)
      if (rand() > 0.5) {
        const tx = x + w * (0.2 + rand() * 0.6)
        pCityNear.rect(tx, top - 6, 9, 6)
        pCityNear.rect(tx + 1.5, top - 9, 6, 3)
      }
      if (rand() > 0.55) pCityNear.rect(x + w * rand() * 0.9, top - 16 - rand() * 14, 1.2, 30)
      pRoof.rect(x, top, w, 1.6)
      for (let fy = top + 7; fy < CITY_BASE - 3; fy += 10.5) pFloors.rect(x + 4, fy, w - 8 - sw, 4)
      nearBlds.push({ x, w, top })
      x += w + (rand() > 0.7 ? 3 + rand() * 10 : 0)
    }
  }

  function buildLights() {
    const rand = rng(99)
    const y0 = 520
    const mk = () => makeLayer(VW, 160, px)
    const ls = [mk(), mk(), mk()]
    const warm = ['255,210,122', '255,226,168', '255,184,102', '255,238,205', '206,224,255']
    const dot = (L: Layer & { c: C }, x: number, y: number, w: number, h: number, a: number) => {
      const rgb = warm[(rand() * warm.length) | 0]
      L.c.fillStyle = `rgba(${rgb},${0.16 * a})`
      L.c.fillRect(x - w * 0.9, y - y0 - h * 0.9, w * 2.8, h * 2.8)
      L.c.fillStyle = `rgba(${rgb},${a})`
      L.c.fillRect(x, y - y0, w, h)
    }
    for (const b of farBlds) {
      for (let y = b.top + 4; y < CITY_BASE - 4; y += 6) {
        for (let x = b.x + 2.5; x < b.x + b.w - 3; x += 5.5) {
          if (rand() < 0.2) dot(ls[(rand() * 3) | 0], x, y, 1.9, 2.1, 0.7)
        }
      }
    }
    for (const b of nearBlds) {
      const pitch = 9 + rand() * 3
      const lit = 0.24 + rand() * 0.26
      for (let y = b.top + 6; y < CITY_BASE - 4; y += 10.5) {
        for (let x = b.x + 5; x < b.x + b.w - 7; x += pitch) {
          if (rand() < lit) dot(ls[(rand() * 3) | 0], x, y, 3.6, 4.6, 0.95)
        }
      }
    }
    // a few homes up on the foothills
    for (let i = 0; i < 90; i++) dot(ls[(rand() * 3) | 0], rand() * VW, 572 + rand() * 40, 1.5, 1.5, 0.55)
    lights = ls

    // Milad at night: lit bands, a soft wash on the shaft, red aircraft lights
    const tg = makeLayer(160, 600, px)
    const c = tg.c
    c.translate(80 - MX, -90)
    radial(c, MX, ty(280), 78, 70, '255,206,130', 0.4)
    const g = c.createLinearGradient(0, ty(244), 0, ty(60))
    g.addColorStop(0, 'rgba(255,214,150,0.5)')
    g.addColorStop(1, 'rgba(255,214,150,0.08)')
    c.fillStyle = g
    c.beginPath()
    c.moveTo(MX - shaftW(60) * TK * 0.6, ty(60))
    c.lineTo(MX - 6.2 * TK * 0.6, ty(244))
    c.lineTo(MX + 6.2 * TK * 0.6, ty(244))
    c.lineTo(MX + shaftW(60) * TK * 0.6, ty(60))
    c.fill()
    c.fillStyle = 'rgba(255,226,160,0.95)'
    c.fill(pTowerBands)
    c.fillStyle = 'rgba(255,196,110,0.5)'
    for (const [h, w] of [
      [262, 23],
      [254, 15],
    ])
      c.fillRect(MX - w * TK, ty(h) - 0.8, w * 2 * TK, 1.6)
    for (const h of [435, 384, 346]) {
      radial(c, MX, ty(h), 13, 13, '255,70,50', 0.75)
      c.fillStyle = '#ffb0a0'
      c.beginPath()
      c.arc(MX, ty(h), 2, 0, 7)
      c.fill()
    }
    towerGlow = tg
  }

  /* ----- sky furniture ----- */
  function buildSky() {
    const rand = rng(5)
    const st = makeLayer(VW, 440, px)
    for (let i = 0; i < 240; i++) {
      const x = rand() * VW
      const y = Math.pow(rand(), 1.4) * 400
      const r = 0.45 + Math.pow(rand(), 3) * 1.15
      const a = 0.3 + rand() * 0.7
      if (r > 1.25) radial(st.c, x, y, r * 3.2, r * 3.2, '210,225,255', 0.16)
      st.c.fillStyle = `rgba(${rand() > 0.8 ? '255,232,200' : '232,240,255'},${a})`
      st.c.beginPath()
      st.c.arc(x, y, r, 0, 7)
      st.c.fill()
    }
    stars = st

    const m = makeLayer(240, 240, px)
    radial(m.c, 120, 120, 120, 120, '200,214,255', 0.22)
    m.c.fillStyle = 'rgba(190,205,240,0.10)'
    m.c.beginPath()
    m.c.arc(120, 120, 33, 0, 7)
    m.c.fill()
    // crescent: a bright disc with a bite taken out, on its own canvas so the bite does not eat the glow
    const cr = makeLayer(240, 240, px)
    const g = cr.c.createRadialGradient(108, 108, 4, 120, 120, 34)
    g.addColorStop(0, '#fffdf2')
    g.addColorStop(1, '#f1e7cc')
    cr.c.fillStyle = g
    cr.c.beginPath()
    cr.c.arc(120, 120, 33, 0, 7)
    cr.c.fill()
    cr.c.globalCompositeOperation = 'destination-out'
    cr.c.beginPath()
    cr.c.arc(136, 110, 30, 0, 7)
    cr.c.fill()
    m.c.drawImage(cr.cv, 0, 0, 240, 240)
    moon = m

    // clouds: long soft banks, kept as white masks and tinted every frame
    cloudMasks = []
    cloudScratch = []
    clouds = []
    const defs: [number, number, number, number, number][] = [
      [0.06, 190, 420, 0.14, 1],
      [0.42, 300, 520, 0.09, 2],
      [0.7, 150, 340, 0.2, 3],
      [0.95, 250, 460, 0.12, 4],
      [0.5, 372, 380, 0.06, 5],
    ]
    for (const [fx, y, w, speed, seed] of defs) {
      const r = rng(seed * 17)
      const h = w * 0.3
      const L = makeLayer(w, h, px * 0.5)
      L.c.fillStyle = '#fff'
      for (let i = 0; i < 26; i++) {
        const u = r()
        const cx = w * (0.14 + 0.72 * u)
        const env = Math.sin(Math.PI * u)
        const rx = w * (0.07 + 0.1 * r()) * (0.6 + env * 0.6)
        const ryy = rx * (0.26 + 0.2 * r())
        const cy = h * (0.62 - 0.26 * env * r())
        L.c.globalAlpha = 0.5 + r() * 0.4
        L.c.beginPath()
        L.c.ellipse(cx, cy, rx, ryy, 0, 0, 7)
        L.c.fill()
      }
      blurLayer(L, 5)
      cloudMasks.push(L)
      const s = makeLayer(w, h, px * 0.5)
      cloudScratch.push(s)
      clouds.push({ x: fx, y, w, h, speed, i: cloudMasks.length - 1 })
    }

    // faint reflections on the glass
    const sh = makeLayer(VW, G_Y1 - G_Y0, px * 0.25)
    const sg = sh.c.createLinearGradient(0, 0, VW * 0.5, (G_Y1 - G_Y0) * 1.2)
    for (const [o, a] of [
      [0, 0],
      [0.18, 0],
      [0.24, 0.5],
      [0.3, 0.1],
      [0.34, 0.35],
      [0.4, 0],
      [0.72, 0],
      [0.8, 0.3],
      [0.9, 0],
    ])
      sg.addColorStop(o, `rgba(255,255,255,${a})`)
    sh.c.fillStyle = sg
    sh.c.fillRect(0, 0, VW, G_Y1 - G_Y0)
    sheen = sh
  }

  /* ----- interior ----- */
  function paintInterior(lamp: boolean): Layer {
    const L = makeLayer(VW, 1000, px)
    const c = L.c
    const ox0 = O_X
    const ox1 = VW - O_X
    const ix0 = ox0 + REVEAL
    const ix1 = ox1 - REVEAL
    const iy0 = O_Y0 + REVEAL
    const iy1 = O_Y1 - REVEAL
    const mx = VW / 2

    // wall
    if (lamp) {
      const g = c.createRadialGradient(VW * 0.1, -40, 40, VW * 0.1, -40, VW * 1.05)
      g.addColorStop(0, '#5a4630')
      g.addColorStop(0.35, '#2c2530')
      g.addColorStop(1, '#0d101e')
      c.fillStyle = g
    } else {
      const g = c.createLinearGradient(0, 0, 0, COUNTER_Y)
      g.addColorStop(0, '#111a30')
      g.addColorStop(1, '#0b1122')
      c.fillStyle = g
    }
    c.fillRect(0, 0, VW, 1000)
    // tiles, barely there
    for (let row = 0, y = 8; y < COUNTER_Y; y += 47, row++) {
      c.fillStyle = 'rgba(0,0,0,0.35)'
      c.fillRect(0, y, VW, 1.6)
      c.fillStyle = lamp ? 'rgba(255,214,150,0.07)' : 'rgba(170,190,230,0.05)'
      c.fillRect(0, y + 1.6, VW, 1)
      for (let x = (row % 2) * 47 - 20; x < VW; x += 94) {
        c.fillStyle = 'rgba(0,0,0,0.3)'
        c.fillRect(x, y, 1.6, 47)
        c.fillStyle = lamp ? 'rgba(255,214,150,0.05)' : 'rgba(170,190,230,0.04)'
        c.fillRect(x + 1.6, y, 1, 47)
      }
    }
    // soft shadow the opening throws on the wall around it
    c.strokeStyle = 'rgba(0,0,0,0.28)'
    c.lineWidth = 10
    c.strokeRect(ox0 - 4, O_Y0 - 4, ox1 - ox0 + 8, O_Y1 - O_Y0 + 8)

    // reveal: the four inner faces of the wall
    const quad = (pts: number[], fill: string | CanvasGradient) => {
      c.beginPath()
      c.moveTo(pts[0], pts[1])
      for (let i = 2; i < 8; i += 2) c.lineTo(pts[i], pts[i + 1])
      c.closePath()
      c.fillStyle = fill
      c.fill()
    }
    const gl = c.createLinearGradient(ox0, 0, ix0, 0)
    const gr = c.createLinearGradient(ox1, 0, ix1, 0)
    if (lamp) {
      gl.addColorStop(0, '#2a2530')
      gl.addColorStop(1, '#17151f')
      gr.addColorStop(0, '#7a6244')
      gr.addColorStop(1, '#4a3c34')
    } else {
      // daylight wraps round the edge of the wall
      gl.addColorStop(0, '#1a2440')
      gl.addColorStop(1, '#46587e')
      gr.addColorStop(0, '#1a2440')
      gr.addColorStop(1, '#46587e')
    }
    quad([ox0, O_Y0, ix0, iy0, ix0, iy1, ox0, O_Y1], gl)
    quad([ox1, O_Y0, ix1, iy0, ix1, iy1, ox1, O_Y1], gr)
    quad([ox0, O_Y0, ox1, O_Y0, ix1, iy0, ix0, iy0], lamp ? '#15131c' : '#0a0f1f')
    quad([ox0, O_Y1, ox1, O_Y1, ix1, iy1, ix0, iy1], lamp ? '#3a3238' : '#2a3654')

    // frame and mullion
    const fcol = lamp ? '#3a3238' : '#121a30'
    c.fillStyle = fcol
    c.fillRect(ix0, iy0, ix1 - ix0, iy1 - iy0)
    const hi = lamp ? 'rgba(247,220,146,0.42)' : 'rgba(196,214,244,0.5)'
    const lo = 'rgba(0,0,0,0.45)'
    const member = (x: number, y: number, w: number, h: number) => {
      // each bar gets a lit edge and a dark edge so it reads as a solid section
      const g = w < h ? c.createLinearGradient(x, 0, x + w, 0) : c.createLinearGradient(0, y, 0, y + h)
      if (lamp) {
        g.addColorStop(0, '#6a5a4a')
        g.addColorStop(0.35, '#453c40')
        g.addColorStop(1, '#25222c')
      } else {
        g.addColorStop(0, '#2a3654')
        g.addColorStop(0.3, '#161f38')
        g.addColorStop(1, '#0b1122')
      }
      c.fillStyle = g
      c.fillRect(x, y, w, h)
    }
    member(ix0, iy0, FRAME, iy1 - iy0)
    member(ix1 - FRAME, iy0, FRAME, iy1 - iy0)
    member(ix0, iy0, ix1 - ix0, FRAME)
    member(ix0, iy1 - FRAME, ix1 - ix0, FRAME)
    member(mx - MULLION / 2, iy0, MULLION, iy1 - iy0)
    // punch the panes
    const panes: [number, number][] = [
      [ix0 + FRAME, mx - MULLION / 2],
      [mx + MULLION / 2, ix1 - FRAME],
    ]
    for (const [a, b] of panes) {
      c.clearRect(a, G_Y0, b - a, G_Y1 - G_Y0)
      // bevel next to the glass: shadow on top and left, light on the bottom
      c.fillStyle = lo
      c.fillRect(a, G_Y0, b - a, 3)
      c.fillRect(a, G_Y0, 2.5, G_Y1 - G_Y0)
      c.fillStyle = hi
      c.fillRect(a, G_Y1 - 2, b - a, 2)
      c.fillRect(b - 1.8, G_Y0, 1.8, G_Y1 - G_Y0)
    }
    // brass handle on the mullion
    const hy = 430
    c.fillStyle = 'rgba(0,0,0,0.4)'
    c.beginPath()
    c.roundRect(mx - 3, hy - 16, 10, 76, 4)
    c.fill()
    const bg = c.createLinearGradient(mx - 6, 0, mx + 6, 0)
    bg.addColorStop(0, '#a8741f')
    bg.addColorStop(0.4, lamp ? '#ffe9a8' : '#f7dc92')
    bg.addColorStop(1, '#8a5d16')
    c.fillStyle = bg
    c.beginPath()
    c.roundRect(mx - 5.5, hy - 20, 11, 30, 3)
    c.fill()
    c.beginPath()
    c.roundRect(mx - 4, hy - 8, 8, 62, 4)
    c.fill()

    // sill: top face, front face, and the shadow under its lip
    const sx0 = ox0 - 30
    const sx1 = ox1 + 30
    const gs = c.createLinearGradient(0, SILL_BACK, 0, SILL_FRONT)
    if (lamp) {
      gs.addColorStop(0, '#2c2830')
      gs.addColorStop(1, '#5e4e40')
    } else {
      gs.addColorStop(0, '#33415f')
      gs.addColorStop(1, '#1a2440')
    }
    quad([ix0, SILL_BACK, ix1, SILL_BACK, sx1, SILL_FRONT, sx0, SILL_FRONT], gs)
    const gf = c.createLinearGradient(0, SILL_FRONT, 0, SILL_FACE)
    gf.addColorStop(0, lamp ? '#4a3e38' : '#141c33')
    gf.addColorStop(1, lamp ? '#221f28' : '#0a0f1e')
    c.fillStyle = gf
    c.fillRect(sx0, SILL_FRONT, sx1 - sx0, SILL_FACE - SILL_FRONT)
    c.fillStyle = lamp ? 'rgba(247,220,146,0.5)' : 'rgba(200,216,244,0.4)'
    c.fillRect(sx0, SILL_FRONT - 0.8, sx1 - sx0, 1.6)
    const gsh = c.createLinearGradient(0, SILL_FACE, 0, SILL_FACE + 30)
    gsh.addColorStop(0, 'rgba(0,0,0,0.6)')
    gsh.addColorStop(1, 'rgba(0,0,0,0)')
    c.fillStyle = gsh
    c.fillRect(sx0 - 6, SILL_FACE, sx1 - sx0 + 12, 30)

    // counter: dark honed stone
    const gc = c.createLinearGradient(0, COUNTER_Y, 0, 1000)
    if (lamp) {
      gc.addColorStop(0, '#2b2630')
      gc.addColorStop(0.5, '#1c1a24')
      gc.addColorStop(1, '#100f18')
    } else {
      gc.addColorStop(0, '#222e4e')
      gc.addColorStop(0.5, '#17213b')
      gc.addColorStop(1, '#0b1122')
    }
    c.fillStyle = gc
    c.fillRect(0, COUNTER_Y, VW, 1000 - COUNTER_Y)
    c.save()
    c.beginPath()
    c.rect(0, COUNTER_Y, VW, 1000 - COUNTER_Y)
    c.clip()
    const rand = rng(31)
    for (let i = 0; i < 9; i++) {
      // veins, drawn wide and flat because the slab is seen at a low angle
      let x = rand() * VW
      let y = COUNTER_Y + 10 + rand() * 230
      c.strokeStyle = i % 3 === 0 ? 'rgba(227,176,75,0.10)' : 'rgba(190,205,235,0.06)'
      c.lineWidth = 0.8 + rand() * 1.4
      c.beginPath()
      c.moveTo(x, y)
      for (let k = 0; k < 7; k++) {
        x += 50 + rand() * 90
        y += (rand() - 0.5) * 16
        c.lineTo(x, y)
      }
      c.stroke()
    }
    if (lamp) radial(c, VW * 0.3, COUNTER_Y + 110, VW * 0.5, 150, '255,196,120', 0.2)
    c.restore()
    // where the counter meets the wall
    c.fillStyle = 'rgba(0,0,0,0.5)'
    c.fillRect(0, COUNTER_Y - 2.5, VW, 2.5)
    c.fillStyle = lamp ? 'rgba(255,220,160,0.16)' : 'rgba(190,210,245,0.14)'
    c.fillRect(0, COUNTER_Y, VW, 1.4)

    // corners fall away into the dark page
    const v = c.createRadialGradient(VW / 2, 520, 380, VW / 2, 520, Math.max(VW * 0.72, 760))
    v.addColorStop(0, 'rgba(4,7,15,0)')
    v.addColorStop(1, 'rgba(4,7,15,0.62)')
    c.globalCompositeOperation = 'source-atop'
    c.fillStyle = v
    c.fillRect(0, 0, VW, 1000)
    c.globalCompositeOperation = 'source-over'
    return L
  }

  function buildSprites() {
    // window light lying on the counter: two panes with the mullion's shadow between them
    const p = makeLayer(400, 100, Math.max(0.2, px * 0.3))
    p.c.fillStyle = '#fff0d0'
    p.c.fillRect(22, 14, 168, 72)
    p.c.fillRect(210, 14, 168, 72)
    blurLayer(p, 6)
    // fade towards the viewer
    p.c.globalCompositeOperation = 'destination-in'
    const g = p.c.createLinearGradient(0, 0, 0, 100)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(1, 'rgba(0,0,0,0.15)')
    p.c.fillStyle = g
    p.c.fillRect(0, 0, 400, 100)
    patch = p

    const s = makeLayer(128, 128, 1)
    const sg = s.c.createRadialGradient(64, 64, 0, 64, 64, 64)
    sg.addColorStop(0, 'rgba(1,2,8,1)')
    sg.addColorStop(0.6, 'rgba(1,2,8,0.8)')
    sg.addColorStop(0.85, 'rgba(1,2,8,0.3)')
    sg.addColorStop(1, 'rgba(1,2,8,0)')
    s.c.fillStyle = sg
    s.c.fillRect(0, 0, 128, 128)
    shadow = s
    const f = makeLayer(64, 64, 1)
    radial(f.c, 32, 32, 32, 32, '255,255,255', 1)
    puff = f

    sprites = [paintBreakfast, paintLunch, paintDinner].map((paint) => {
      const L = makeLayer(SPRITE_W, SPRITE_H, px * SL)
      L.c.translate(SPRITE_OX, SPRITE_OY)
      paint(L.c)
      return L
    })
  }

  function resize(cssW: number, cssH: number, dpr: number) {
    if (cssW < 2 || cssH < 2) return
    let ratio = Math.min(dpr || 1, 2)
    // keep the backing store modest so a frame stays cheap on phones and large monitors alike
    const maxPixels = 2_200_000
    if (cssW * cssH * ratio * ratio > maxPixels) ratio = Math.sqrt(maxPixels / (cssW * cssH))
    const w = Math.round(cssW * ratio)
    const h = Math.round(cssH * ratio)
    if (ready && w === canvas.width && h === canvas.height) return
    canvas.width = w
    canvas.height = h
    px = h / 1000
    VW = Math.min(2600, Math.max(900, (w / h) * 1000))
    gx0 = O_X + REVEAL + FRAME
    gx1 = VW - gx0
    MX = VW * 0.705
    AX = VW * 0.345
    buildMountains()
    buildTower()
    buildCity()
    buildLights()
    buildSky()
    interiorDay = paintInterior(false)
    interiorLamp = paintInterior(true)
    buildSprites()
    ready = true
  }

  function img(L: Layer, x: number, y: number, w = L.w, h = L.h) {
    ctx.drawImage(L.cv, x, y, w, h)
  }

  function dropShadow(x: number, rx: number, dx: number, dy: number, len: number, a: number) {
    if (a < 0.01) return
    const ry = rx * 0.24
    for (let i = 0; i < 4; i++) {
      const f = i / 3
      const sx = rx * (1 + 0.2 * f)
      const sy = ry * (1 + 0.7 * f)
      ctx.globalAlpha = Math.min(1, a * (1 - 0.6 * f) * 0.85)
      ctx.drawImage(shadow.cv, x + dx * len * f - sx, GROUND + dy * len * f - sy + ry * 0.2, sx * 2, sy * 2)
    }
    ctx.globalAlpha = 1
  }

  function draw(t: number, now: number) {
    if (!ready) return
    t = clamp01(t)
    seg = 0
    while (seg < KT.length - 2 && t > KT[seg + 1]) seg++
    segU = clamp01((t - KT[seg]) / (KT[seg + 1] - KT[seg]))

    const c = ctx
    c.setTransform(px, 0, 0, px, 0, 0)
    c.globalAlpha = 1
    c.globalCompositeOperation = 'source-over'

    // the sun: up on the right in the morning, down behind the ridge on the left
    const ang = Math.PI * (0.12 + (0.88 * t) / 0.9)
    const elev = Math.sin(Math.min(ang, Math.PI))
    const sunX = VW * (0.86 - (0.74 * t) / 0.9)
    const sunY = 640 - Math.sin(ang) * 520
    const low = 1 - clamp01(elev)
    const sunUp = 1 - smooth(0.76, 0.84, t)
    const night = smooth(0.78, 0.93, t)
    const lamp = smooth(0.6, 0.9, t)

    /* --- outside --- */
    c.save()
    c.beginPath()
    c.rect(gx0 - 1, G_Y0 - 1, gx1 - gx0 + 2, G_Y1 - G_Y0 + 2)
    c.clip()

    const sky = c.createLinearGradient(0, G_Y0, 0, MTN_BASE)
    sky.addColorStop(0, col('skyTop'))
    sky.addColorStop(0.55, col('skyMid'))
    sky.addColorStop(1, col('skyLow'))
    c.fillStyle = sky
    c.fillRect(gx0 - 1, G_Y0 - 1, gx1 - gx0 + 2, G_Y1 - G_Y0 + 2)

    if (night > 0.01) {
      c.globalAlpha = night
      img(stars, 0, G_Y0)
      const mAlpha = smooth(0.8, 0.9, t)
      c.globalAlpha = mAlpha
      img(moon, VW * 0.86 - 120, 330 - 130 * mAlpha - 120)
      c.globalAlpha = 1
    }

    if (sunUp > 0.01) {
      // wide glow that warms the horizon when the sun is low
      const gr = 240 + low * 300
      const glow = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, gr)
      glow.addColorStop(0, col('sun', 0.75 * sunUp))
      glow.addColorStop(0.25, col('sun', 0.3 * sunUp))
      glow.addColorStop(1, col('sun', 0))
      c.fillStyle = glow
      c.fillRect(sunX - gr, sunY - gr, gr * 2, gr * 2)
      const disc = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, 34)
      disc.addColorStop(0, '#fffdf4')
      disc.addColorStop(0.45, '#fff6dc')
      disc.addColorStop(0.7, col('sun', 1))
      disc.addColorStop(0.82, col('sun', 0.5))
      disc.addColorStop(1, col('sun', 0))
      c.globalAlpha = sunUp
      c.fillStyle = disc
      c.beginPath()
      c.arc(sunX, sunY, 34, 0, 7)
      c.fill()
      c.globalAlpha = 1
    }

    // clouds
    const cl = col('cloudLit')
    const cs = col('cloudShade')
    const cloudA = 0.9 - 0.45 * night
    for (const cd of clouds) {
      const s = cloudScratch[cd.i]
      const sc = s.c
      sc.globalCompositeOperation = 'source-over'
      sc.clearRect(0, 0, cd.w, cd.h)
      sc.drawImage(cloudMasks[cd.i].cv, 0, 0, cd.w, cd.h)
      sc.globalCompositeOperation = 'source-in'
      const g = sc.createLinearGradient(0, cd.h * 0.2, 0, cd.h * 0.85)
      g.addColorStop(0, cl)
      g.addColorStop(1, cs)
      sc.fillStyle = g
      sc.fillRect(0, 0, cd.w, cd.h)
      const span = VW + cd.w
      const x = ((((cd.x + t * cd.speed) * span) % span) + span) % span
      c.globalAlpha = cloudA
      c.drawImage(s.cv, x - cd.w, cd.y - cd.h / 2, cd.w, cd.h)
    }
    c.globalAlpha = 1

    // Alborz
    const sunLeft = smooth(0.62, 0.38, sunX / VW) // 1 when the sun is on the left
    const day = 1 - night
    c.fillStyle = col('mtnFar')
    c.fill(pMtnFar)
    c.fillStyle = col('snow')
    c.fill(pSnow)
    c.fillStyle = `rgba(22,30,66,${0.34 * (0.35 + 0.65 * sunLeft) * (0.4 + 0.6 * day)})`
    c.fill(pFacetR)
    c.fillStyle = `rgba(22,30,66,${0.34 * (0.35 + 0.65 * (1 - sunLeft)) * (0.4 + 0.6 * day)})`
    c.fill(pFacetL)
    // haze pooling at the foot of the range
    const haze = c.createLinearGradient(0, 470, 0, MTN_BASE + 10)
    haze.addColorStop(0, col('skyLow', 0))
    haze.addColorStop(1, col('skyLow', 0.5 - 0.3 * night))
    c.fillStyle = haze
    c.fillRect(gx0, 470, gx1 - gx0, MTN_BASE - 460)
    c.fillStyle = col('mtnNear')
    c.fill(pMtnNear)
    c.fillStyle = `rgba(16,22,52,${0.3 * (0.35 + 0.65 * sunLeft) * (0.4 + 0.6 * day)})`
    c.fill(pNearFacetR)
    c.fillStyle = `rgba(16,22,52,${0.3 * (0.35 + 0.65 * (1 - sunLeft)) * (0.4 + 0.6 * day)})`
    c.fill(pNearFacetL)
    const haze2 = c.createLinearGradient(0, 560, 0, 640)
    haze2.addColorStop(0, col('skyLow', 0))
    haze2.addColorStop(1, col('skyLow', 0.34 - 0.2 * night))
    c.fillStyle = haze2
    c.fillRect(gx0, 560, gx1 - gx0, 80)

    // city
    c.fillStyle = col('cityFar')
    c.fill(pCityFar)
    c.fillStyle = col('towerShade')
    c.fill(pTower)
    c.fillStyle = col('towerLit', 0.9)
    c.fill(sunX < MX ? pTowerL : pTowerR)
    c.fillStyle = col('cityNear', 0.5)
    c.fill(pTowerCone)
    c.fillStyle = col('cityNear', 0.8)
    c.fill(pTowerBands)
    c.fillStyle = col('cityNear')
    c.fill(pCityNear)
    c.fillStyle = 'rgba(8,12,30,0.2)'
    c.fill(pFloors)
    c.fillStyle = col('cityLit', 0.42)
    c.fill(sunX < VW * 0.5 ? pStripL : pStripR)
    c.fillStyle = col('cityLit', 0.3)
    c.fill(pRoof)

    // lights come on in three waves
    for (let i = 0; i < 3; i++) {
      const a = smooth(0.72 + i * 0.05, 0.79 + i * 0.05, t)
      if (a > 0.01) {
        c.globalAlpha = a
        img(lights[i], 0, 520)
      }
    }
    const tgA = smooth(0.74, 0.86, t)
    if (tgA > 0.01) {
      c.globalAlpha = tgA
      img(towerGlow, MX - 80, 90)
    }
    c.globalAlpha = 0.07 - 0.035 * night
    img(sheen, 0, G_Y0, VW, G_Y1 - G_Y0)
    c.globalAlpha = 1
    c.restore()

    /* --- inside --- */
    img(interiorDay, 0, 0, VW, 1000)
    if (lamp > 0.01) {
      c.globalAlpha = lamp
      img(interiorLamp, 0, 0, VW, 1000)
      c.globalAlpha = 1
    }

    // the sky lies on the sill and on the back of the counter
    const refl = (0.5 - 0.42 * night) * (1 - 0.3 * lamp)
    const sg = c.createLinearGradient(0, SILL_BACK, 0, SILL_FRONT)
    sg.addColorStop(0, col('skyLow', refl))
    sg.addColorStop(1, col('skyLow', refl * 0.25))
    c.fillStyle = sg
    c.beginPath()
    c.moveTo(O_X + REVEAL, SILL_BACK)
    c.lineTo(VW - O_X - REVEAL, SILL_BACK)
    c.lineTo(VW - O_X + 30, SILL_FRONT)
    c.lineTo(O_X - 30, SILL_FRONT)
    c.closePath()
    c.fill()
    const cg = c.createLinearGradient(0, COUNTER_Y, 0, COUNTER_Y + 150)
    cg.addColorStop(0, col('skyLow', refl * 0.42))
    cg.addColorStop(1, col('skyLow', 0))
    c.fillStyle = cg
    c.fillRect(0, COUNTER_Y, VW, 150)

    // sunlight through the panes, sliding across the counter as the sun moves
    const lean = (VW * 0.5 - sunX) / VW
    if (sunUp > 0.01) {
      const len = 130 + low * 110
      c.save()
      c.beginPath()
      c.rect(0, COUNTER_Y, VW, 1000 - COUNTER_Y)
      c.clip()
      c.globalCompositeOperation = 'screen'
      c.globalAlpha = sunUp * (0.16 + 0.2 * low)
      c.transform(1, 0, lean * 2.2, 1, -lean * 2.2 * (COUNTER_Y + 6), 0)
      img(patch, gx0 + 20, COUNTER_Y + 6, gx1 - gx0 - 40, len)
      c.restore()
    }

    /* --- still life --- */
    const a0 = 1 - smooth(0.31, 0.37, t)
    const a2 = smooth(0.64, 0.7, t)
    const a1 = (1 - a0) * (1 - a2)
    const alphas = [a0, a1, a2]
    const sunShadow = sunUp * (1 - 0.5 * lamp)
    for (let i = 0; i < 3; i++) {
      const a = alphas[i]
      if (a < 0.01) continue
      const sl = STILL_LIFE[i]
      for (const b of sl.shadows) {
        const ox = AX + b.x * SL
        // away from the sun (towards the viewer) and away from the lamp (up left, inside the room)
        const dxs = Math.max(-1.3, Math.min(1.3, (ox - sunX) / 620))
        dropShadow(ox, b.rx * SL, dxs, 0.32, b.h * SL * (0.45 + 0.9 * low), 0.75 * a * sunShadow)
        dropShadow(ox, b.rx * SL, 0.95, 0.16, b.h * SL * 0.5, 0.6 * a * lamp)
      }
      c.globalAlpha = a
      img(sprites[i], AX - SPRITE_OX * SL, GROUND - SPRITE_OY * SL, SPRITE_W * SL, SPRITE_H * SL)
      if (i === 1) {
        c.save()
        c.translate(AX, GROUND)
        c.scale(SL, SL)
        drawMeltingButter(c, smooth(0.37, 0.66, t))
        c.restore()
      }
      // steam
      for (const s of sl.steam) {
        const n = 9
        for (let k = 0; k < n; k++) {
          const p = (now * 0.00016 + k / n + Math.abs(s.x) * 0.01) % 1
          const wob = Math.sin(p * 5.2 + k * 1.7 + now * 0.0007) * (6 + 16 * p)
          const off = ((k * 37) % n) / (n - 1) - 0.5
          const size = 16 + p * 40 + s.spread * 0.2
          c.globalAlpha = a * s.strength * 0.2 * Math.sin(Math.PI * p) * (1 - 0.3 * p)
          c.drawImage(puff.cv, AX + (s.x + off * s.spread * (1 + p) + wob) * SL - size, GROUND + (s.y - p * s.rise) * SL - size, size * 2, size * 2)
        }
      }
      c.globalAlpha = 1
    }
  }

  return { resize, draw }
}
