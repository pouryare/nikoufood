import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  FrontSide,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PMREMGenerator,
  RepeatWrapping,
  Scene,
  SphereGeometry,
  Vector2,
  type Texture,
  type WebGLRenderer,
} from 'three'

/*
 * One single-serve butter pack, built in code: thermoformed tray, butter slab and peelable foil lid.
 * Both the exploded view and the peel toy use this file, so they always show the same product.
 * Units: the tray opening is 1.6 wide (x) and 1.1 deep (z); y is up.
 */

export const PACK = {
  hx: 0.8, // half width of the tray opening
  hz: 0.55, // half depth of the tray opening
  radius: 0.2, // corner radius of the opening
  height: 0.34,
  flange: 0.1, // width of the flat rim
  lidLift: 0.004, // the lid rests a hair above the rim so the two never flicker
  tabCentre: [-0.845, 0.595] as [number, number], // pull tab: a round ear at the front-left corner
  tabRadius: 0.14,
} as const

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/* ---------- small deterministic noise (no Math.random, so every visit looks the same) ---------- */

const hash = (ix: number, iy: number, seed: number) => {
  let h = (ix * 374761393 + iy * 668265263 + seed * 1442695041) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967295
}

const noise = (x: number, y: number, seed: number) => {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  // Quintic fade keeps the slopes smooth, so the normal map has no grid creases.
  const ux = fx * fx * fx * (fx * (fx * 6 - 15) + 10)
  const uy = fy * fy * fy * (fy * (fy * 6 - 15) + 10)
  const a = hash(ix, iy, seed)
  const b = hash(ix + 1, iy, seed)
  const c = hash(ix, iy + 1, seed)
  const d = hash(ix + 1, iy + 1, seed)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

/* ---------- outlines ---------- */

/** Signed distance to a rounded rectangle centred on the origin (negative inside). */
const sdRoundRect = (x: number, z: number, hx: number, hz: number, r: number) => {
  const qx = Math.abs(x) - (hx - r)
  const qz = Math.abs(z) - (hz - r)
  const ox = Math.max(qx, 0)
  const oz = Math.max(qz, 0)
  return Math.hypot(ox, oz) + Math.min(Math.max(qx, qz), 0) - r
}

const LID_HX = PACK.hx + PACK.flange - 0.004
const LID_HZ = PACK.hz + PACK.flange - 0.004
const LID_R = PACK.radius + PACK.flange - 0.004

/** Signed distance to the lid outline: the rim rectangle with the pull tab blended onto one corner. */
export const sdLid = (x: number, z: number) => {
  const a = sdRoundRect(x, z, LID_HX, LID_HZ, LID_R)
  const b = Math.hypot(x - PACK.tabCentre[0], z - PACK.tabCentre[1]) - PACK.tabRadius
  // Smooth union: the tab flows out of the corner instead of meeting it at a sharp notch.
  const k = 0.07
  const h = clamp01(0.5 + (0.5 * (b - a)) / k)
  return b + (a - b) * h - k * h * (1 - h)
}

/** Lid bounds on the table plane, used for texture coordinates. */
const LID_BOUNDS = { minX: -1.02, maxX: 0.92, minZ: -0.67, maxZ: 0.77 }

/** The tip of the pull tab and the unit direction from it toward the middle of the pack. */
export const TAB_TIP: [number, number] = (() => {
  // Walk outward from the tab along the corner diagonal until we leave the lid.
  let t = 0
  while (sdLid(PACK.tabCentre[0] - t, PACK.tabCentre[1] + t) < 0 && t < 1) t += 0.001
  return [PACK.tabCentre[0] - t, PACK.tabCentre[1] + t]
})()
export const TAB_INWARD: [number, number] = (() => {
  const l = Math.hypot(TAB_TIP[0], TAB_TIP[1])
  return [-TAB_TIP[0] / l, -TAB_TIP[1] / l]
})()
/** Distance from the tab tip to the far corner: the full length of a peel. */
export const PEEL_DIAGONAL = Math.hypot(LID_HX - TAB_TIP[0], -LID_HZ - TAB_TIP[1])

/* ---------- lofted shells (tray and butter) ---------- */

const ARC = 14 // segments per rounded corner
const SIDE = 6 // segments per straight side
const RING = 4 * (ARC + SIDE)

/** Points of a rounded rectangle, always the same count and order so rings can be stitched together. */
const ringPoints = (hx: number, hz: number, r: number, out: number[], y: number) => {
  const corners: Array<[number, number, number]> = [
    [hx - r, hz - r, 0],
    [-(hx - r), hz - r, Math.PI / 2],
    [-(hx - r), -(hz - r), Math.PI],
    [hx - r, -(hz - r), (3 * Math.PI) / 2],
  ]
  for (let c = 0; c < 4; c++) {
    const [cx, cz, a0] = corners[c]
    const pts: Array<[number, number]> = []
    for (let i = 0; i <= ARC; i++) {
      const a = a0 + (i / ARC) * (Math.PI / 2)
      pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r])
    }
    const [nx, nz, na] = corners[(c + 1) % 4]
    const next: [number, number] = [nx + Math.cos(na) * r, nz + Math.sin(na) * r]
    const last = pts[pts.length - 1]
    for (let i = 1; i < SIDE; i++) pts.push([last[0] + ((next[0] - last[0]) * i) / SIDE, last[1] + ((next[1] - last[1]) * i) / SIDE])
    for (const [x, z] of pts) out.push(x, y, z)
  }
}

type Level = { inset: number; y: number; alpha?: number }

/** Stacks rounded-rectangle rings (each shrunk by `inset`) into one smooth skin and closes the middle. */
const loft = (levels: Level[], centreY: number, startCentreY?: number) => {
  const positions: number[] = []
  const colors: number[] = []
  for (const level of levels) {
    const r = Math.max(PACK.radius - level.inset * 0.75, 0.05)
    ringPoints(PACK.hx - level.inset, PACK.hz - level.inset, r, positions, level.y)
    for (let i = 0; i < RING; i++) colors.push(1, 1, 1, level.alpha ?? 1)
  }
  positions.push(0, centreY, 0)
  colors.push(1, 1, 1, levels[levels.length - 1].alpha ?? 1)

  const indices: number[] = []
  for (let l = 0; l < levels.length - 1; l++) {
    for (let i = 0; i < RING; i++) {
      const a = l * RING + i
      const b = l * RING + ((i + 1) % RING)
      const c = a + RING
      const d = b + RING
      indices.push(a, b, c, b, d, c)
    }
  }
  const centre = levels.length * RING
  const lastRing = (levels.length - 1) * RING
  for (let i = 0; i < RING; i++) indices.push(lastRing + i, lastRing + ((i + 1) % RING), centre)
  if (startCentreY !== undefined) {
    positions.push(0, startCentreY, 0)
    colors.push(1, 1, 1, levels[0].alpha ?? 1)
    for (let i = 0; i < RING; i++) indices.push(centre + 1, (i + 1) % RING, i)
  }

  const uvs: number[] = []
  for (let i = 0; i < positions.length; i += 3) {
    uvs.push((positions[i] + PACK.hx) / (2 * PACK.hx), (positions[i + 2] + PACK.hz) / (2 * PACK.hz))
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 4))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/** Wall line of the tray: how far it leans inward at a given height (thermoformed draft angle). */
const wallInset = (y: number) => 0.03 + (1 - clamp01((y - 0.03) / (PACK.height - 0.115))) * 0.06

/**
 * Thermoformed tray, from the outer edge of the rim to the middle of the floor: turned-down rim edge,
 * flat flange, a stacking shoulder, tapered wall, rounded foot and a slightly raised base panel.
 * The alpha per level makes the rim and folds milkier than the thin stretched walls.
 */
const createTrayGeometry = () => {
  const H = PACK.height
  const F = PACK.flange
  const levels: Level[] = [
    { inset: -F - 0.004, y: H - 0.016, alpha: 0.9 },
    { inset: -F - 0.002, y: H - 0.005, alpha: 0.9 },
    { inset: -F + 0.006, y: H, alpha: 0.86 },
    { inset: -F / 2, y: H, alpha: 0.8 },
    { inset: -0.014, y: H, alpha: 0.82 },
    { inset: -0.004, y: H - 0.003, alpha: 0.86 },
    { inset: 0.002, y: H - 0.013, alpha: 0.8 },
    { inset: 0.005, y: H - 0.05, alpha: 0.5 },
    { inset: 0.009, y: H - 0.062, alpha: 0.62 },
    { inset: 0.02, y: H - 0.07, alpha: 0.72 },
    { inset: 0.028, y: H - 0.08, alpha: 0.62 },
    { inset: wallInset(H - 0.115), y: H - 0.115, alpha: 0.42 },
    { inset: wallInset(0.17), y: 0.17, alpha: 0.38 },
    { inset: wallInset(0.07), y: 0.07, alpha: 0.42 },
    { inset: wallInset(0.03), y: 0.03, alpha: 0.55 },
    { inset: 0.1, y: 0.012, alpha: 0.7 },
    { inset: 0.117, y: 0.003, alpha: 0.74 },
    { inset: 0.14, y: 0, alpha: 0.66 },
    { inset: 0.2, y: 0, alpha: 0.6 },
    { inset: 0.214, y: 0.004, alpha: 0.68 },
    { inset: 0.228, y: 0.011, alpha: 0.64 },
    { inset: 0.3, y: 0.012, alpha: 0.56 },
    { inset: 0.42, y: 0.012, alpha: 0.56 },
  ]
  return loft(levels, 0.012)
}

/** Butter slab cast by the tray: same taper, soft edges, and a top that is not perfectly flat. */
const createButterGeometry = () => {
  const top = PACK.height - 0.052
  const gap = 0.012
  const levels: Level[] = [
    { inset: 0.5, y: top },
    { inset: 0.42, y: top },
    { inset: 0.34, y: top },
    { inset: 0.26, y: top },
    { inset: 0.19, y: top },
    { inset: 0.13, y: top },
    { inset: 0.085, y: top },
    { inset: 0.058, y: top - 0.003 },
    { inset: 0.044, y: top - 0.011 },
    { inset: 0.04, y: top - 0.026 },
    { inset: wallInset(0.17) + gap, y: 0.17 },
    { inset: wallInset(0.07) + gap, y: 0.07 },
    { inset: wallInset(0.03) + gap + 0.004, y: 0.04 },
    { inset: 0.122, y: 0.022 },
    { inset: 0.15, y: 0.016 },
    { inset: 0.3, y: 0.016 },
  ]
  const geometry = loft(levels, 0.016, top)
  // The top is a filled surface: a low swell with soft dips, fading out toward the walls.
  // Only the top gets it; the sides and underside must keep fitting the tray.
  const pos = geometry.getAttribute('position') as BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    if (y <= top - 0.012) continue
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const edge = smoothstep(0, 0.22, -sdRoundRect(x, z, PACK.hx - 0.04, PACK.hz - 0.04, PACK.radius))
    const swell = edge * (0.012 + (noise(x * 2.1 + 5, z * 2.1 + 9, 7) - 0.5) * 0.02)
    pos.setY(i, y + swell * smoothstep(top - 0.012, top, y))
  }
  geometry.computeVertexNormals()
  return geometry
}

/* ---------- foil lid ---------- */

const LID_RINGS = 60
const LID_SPOKES = 420

export type LidGeometry = BufferGeometry & { userData: { rest: Float32Array } }

/** A fine polar mesh that follows the lid outline exactly, dense enough to curl smoothly when peeled. */
const createLidGeometry = (): LidGeometry => {
  const count = 1 + LID_RINGS * LID_SPOKES
  const rest = new Float32Array(count * 3)
  const uvs = new Float32Array(count * 2)
  const put = (i: number, x: number, z: number) => {
    rest[i * 3] = x
    rest[i * 3 + 1] = 0
    rest[i * 3 + 2] = z
    uvs[i * 2] = (x - LID_BOUNDS.minX) / (LID_BOUNDS.maxX - LID_BOUNDS.minX)
    uvs[i * 2 + 1] = (z - LID_BOUNDS.minZ) / (LID_BOUNDS.maxZ - LID_BOUNDS.minZ)
  }
  put(0, 0, 0)
  for (let s = 0; s < LID_SPOKES; s++) {
    const a = (s / LID_SPOKES) * Math.PI * 2
    const dx = Math.cos(a)
    const dz = Math.sin(a)
    // Find the outline along this spoke by bisection.
    let lo = 0.3
    let hi = 1.6
    for (let i = 0; i < 26; i++) {
      const mid = (lo + hi) / 2
      if (sdLid(dx * mid, dz * mid) < 0) lo = mid
      else hi = mid
    }
    for (let r = 1; r <= LID_RINGS; r++) {
      const f = r / LID_RINGS
      put(1 + (r - 1) * LID_SPOKES + s, dx * lo * f, dz * lo * f)
    }
  }
  const indices: number[] = []
  const at = (r: number, s: number) => 1 + (r - 1) * LID_SPOKES + (s % LID_SPOKES)
  for (let s = 0; s < LID_SPOKES; s++) {
    indices.push(0, at(1, s + 1), at(1, s))
    for (let r = 1; r < LID_RINGS; r++) indices.push(at(r, s), at(r, s + 1), at(r + 1, s), at(r, s + 1), at(r + 1, s + 1), at(r + 1, s))
  }
  const geometry = new BufferGeometry() as LidGeometry
  const normals = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) normals[i * 3 + 1] = 1
  geometry.setAttribute('position', new BufferAttribute(rest.slice(), 3))
  geometry.setAttribute('normal', new BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.userData.rest = rest
  return geometry
}

/** Angle the foil wraps around the curl before it runs straight again (a little short of a full fold-over). */
const CURL_STOP = Math.PI - 0.3

/**
 * Peels the lid: everything on the tab side of a fold line rolls up around a soft curl and lies back
 * over the rest, so the tab tip lands at `pull` (a point on the lid plane). `null` lays the lid flat.
 * Runs on every pointer move, so it only does plain arithmetic and reuses the geometry's buffers.
 */
export const bendLid = (geometry: LidGeometry, pull: [number, number] | null, curl = 0.1) => {
  const rest = geometry.userData.rest
  const pos = geometry.getAttribute('position') as BufferAttribute
  const nor = geometry.getAttribute('normal') as BufferAttribute
  const p = pos.array as Float32Array
  const n = nor.array as Float32Array
  const dx = pull ? pull[0] - TAB_TIP[0] : 0
  const dz = pull ? pull[1] - TAB_TIP[1] : 0
  const dist = Math.hypot(dx, dz)
  if (!pull || dist < 0.004) {
    p.set(rest)
    for (let i = 0; i < n.length; i += 3) {
      n[i] = 0
      n[i + 1] = 1
      n[i + 2] = 0
    }
  } else {
    const ux = dx / dist
    const uz = dz / dist
    // A short pull makes a tight curl; it opens up to `curl` as more foil comes off.
    const r = Math.min(curl, dist * 0.3)
    const cs = Math.cos(CURL_STOP)
    const sn = Math.sin(CURL_STOP)
    // Place the fold so that the tab tip, after rolling over, sits exactly under the finger.
    const fold = (dist + r * (sn - CURL_STOP * cs)) / (1 - cs)
    const arc = r * CURL_STOP
    for (let i = 0; i < rest.length; i += 3) {
      const x = rest[i]
      const z = rest[i + 2]
      const d = fold - ((x - TAB_TIP[0]) * ux + (z - TAB_TIP[1]) * uz) // how far past the fold line
      if (d <= 0) {
        p[i] = x
        p[i + 1] = 0
        p[i + 2] = z
        n[i] = 0
        n[i + 1] = 1
        n[i + 2] = 0
        continue
      }
      let back: number
      let up: number
      let a: number
      if (d < arc) {
        a = d / r
        back = r * Math.sin(a)
        up = r * (1 - Math.cos(a))
      } else {
        a = CURL_STOP
        back = r * sn + (d - arc) * cs
        up = r * (1 - cs) + (d - arc) * sn
      }
      // Foot of the point on the fold line, then out along the curl.
      p[i] = x + ux * (d - back)
      p[i + 1] = up
      p[i + 2] = z + uz * (d - back)
      const s = Math.sin(a)
      n[i] = ux * s
      n[i + 1] = Math.cos(a)
      n[i + 2] = uz * s
    }
  }
  pos.needsUpdate = true
  nor.needsUpdate = true
}

/* ---------- textures ---------- */

/** Turns a height function into a tangent-space normal map (u follows x, v follows z). */
const normalMapFrom = (width: number, height: number, heightAt: (u: number, v: number) => number, strength: number) => {
  const field = new Float32Array(width * height)
  for (let j = 0; j < height; j++) for (let i = 0; i < width; i++) field[j * width + i] = heightAt(i / (width - 1), j / (height - 1))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const image = ctx.createImageData(width, height)
  const data = image.data
  for (let j = 0; j < height; j++) {
    const j0 = Math.max(j - 1, 0)
    const j1 = Math.min(j + 1, height - 1)
    for (let i = 0; i < width; i++) {
      const i0 = Math.max(i - 1, 0)
      const i1 = Math.min(i + 1, width - 1)
      const gx = (field[j * width + i1] - field[j * width + i0]) * strength * width * 0.5
      const gy = (field[j1 * width + i] - field[j0 * width + i]) * strength * height * 0.5
      const l = 1 / Math.hypot(gx, gy, 1)
      const o = (j * width + i) * 4
      data[o] = (-gx * l * 0.5 + 0.5) * 255
      data[o + 1] = (-gy * l * 0.5 + 0.5) * 255
      data[o + 2] = (l * 0.5 + 0.5) * 255
      data[o + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  const texture = new CanvasTexture(canvas)
  // Row 0 of the canvas is v = 0 here, so do not flip.
  texture.flipY = false
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  texture.anisotropy = 4
  return texture
}

/**
 * Foil surface: wide soft dents, small dimples, a few wandering creases and the pressed seal ring.
 * Everything comes from warped noise, so nothing lines up into straight or parallel marks.
 */
const createFoilNormalMap = () => {
  const w = LID_BOUNDS.maxX - LID_BOUNDS.minX
  const d = LID_BOUNDS.maxZ - LID_BOUNDS.minZ
  return normalMapFrom(
    896,
    Math.round((896 * d) / w),
    (u, v) => {
      const x = LID_BOUNDS.minX + u * w
      const z = LID_BOUNDS.minZ + v * d
      const rim = sdRoundRect(x, z, LID_HX, LID_HZ, LID_R)
      // Bend the sampling space first: creases then wander instead of running straight.
      const wx = x + (noise(x * 1.3 + 3, z * 1.3 + 8, 11) - 0.5) * 0.9
      const wz = z + (noise(x * 1.3 + 17, z * 1.3 + 2, 12) - 0.5) * 0.9
      const dents = (noise(wx * 1.6, wz * 1.6, 1) - 0.5) * 0.05 + (noise(wx * 3.7 + 9, wz * 3.7, 2) - 0.5) * 0.014
      const dimples = (noise(x * 9, z * 9, 3) - 0.5) * 0.0035 + (noise(x * 25, z * 25, 4) - 0.5) * 0.001
      const ridgeA = 1 - Math.abs(noise(wx * 2.3 + 40, wz * 2.3 + 40, 5) * 2 - 1)
      const ridgeB = 1 - Math.abs(noise(wz * 3.4 + 70, wx * 3.4 + 70, 6) * 2 - 1)
      const patch = smoothstep(0.45, 0.75, noise(x * 1.7 + 90, z * 1.7 + 90, 8))
      // Soft folds only in patches, like foil that was handled, never sharp drawn lines.
      const creases = (smoothstep(0.55, 1, ridgeA) * 0.006 + smoothstep(0.6, 1, ridgeB) * 0.004) * patch
      // Over the rim the foil is heat-pressed flat; over the butter it is free to dent.
      const free = smoothstep(-0.085, -0.16, rim)
      const band = smoothstep(-0.012, -0.03, rim) * (1 - smoothstep(-0.078, -0.098, rim))
      return (dents + creases) * (0.18 + 0.82 * free) + dimples - band * 0.0075 + free * 0.006
    },
    0.75,
  )
}

/** Butter top: long soft spreading marks that curve and fade, plus a fine creamy grain. */
const createButterNormalMap = () =>
  normalMapFrom(
    384,
    264,
    (u, v) => {
      const x = (u - 0.5) * 1.6
      const z = (v - 0.5) * 1.1
      const wx = x + (noise(x * 1.1 + 4, z * 1.1 + 1, 21) - 0.5) * 1.1
      const wz = z + (noise(x * 1.1 + 9, z * 1.1 + 6, 22) - 0.5) * 1.1
      // Stretched noise reads as the drag of a blade; the warp keeps the marks from being straight.
      const drag = noise(wx * 1.2 + wz * 0.5, wz * 5.5 - wx * 1.4, 23)
      const marks = smoothstep(0.2, 1, 1 - Math.abs(drag * 2 - 1)) * 0.005
      const swell = (noise(x * 2.4, z * 2.4, 24) - 0.5) * 0.012
      const grain = (noise(x * 46, z * 46, 25) - 0.5) * 0.0006
      return marks + swell + grain
    },
    1.3,
  )

/** Soft round shadow that sits under the tray where it touches the table. */
const createContactShadowTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128)
  g.addColorStop(0, 'rgba(0,0,0,0.9)')
  g.addColorStop(0.45, 'rgba(0,0,0,0.55)')
  g.addColorStop(0.8, 'rgba(0,0,0,0.12)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  return texture
}

/* ---------- the room the foil reflects ---------- */

/**
 * A dark navy room with one warm gold light and a couple of pale softboxes, baked into an environment
 * map. Built in code (no HDR download). The foil is a mirror, so this room is what gives it its look.
 */
export const createPackEnvironment = (renderer: WebGLRenderer): { texture: Texture; dispose: () => void } => {
  const scene = new Scene()
  const disposables: Array<{ dispose: () => void }> = []
  const room = new Mesh(new SphereGeometry(30, 32, 16), new MeshBasicMaterial({ color: new Color('#16203c').multiplyScalar(0.9), side: BackSide }))
  scene.add(room)
  disposables.push(room.geometry, room.material as MeshBasicMaterial)

  type Panel = { color: string; power: number; at: [number, number, number]; size: [number, number] }
  const panels: Panel[] = [
    { color: '#ffc867', power: 8, at: [-6.5, 5.5, 2.5], size: [5, 4] }, // warm gold key, upper left
    { color: '#fff3dc', power: 4.2, at: [-3.2, 8, -2.2], size: [5, 3.4] }, // pale softbox overhead: lights half the lid, seen from above
    { color: '#eef2ff', power: 3.4, at: [-4.5, 3.6, -8], size: [8, 4] }, // back wall wash: what the lid mirrors in the three-quarter view
    { color: '#ffd893', power: 2.6, at: [4.5, 2.2, -8], size: [3.5, 3] }, // warm patch on the back wall
    { color: '#dfe8ff', power: 2.6, at: [7, 4, 3], size: [3, 5] }, // cool fill, right
    { color: '#ffffff', power: 11, at: [2.2, 9, -0.5], size: [1.6, 0.8] }, // small bright lamp: the mirror glints
    { color: '#31456f', power: 1.6, at: [0, 2, 9], size: [14, 5] }, // navy wall behind the viewer
    { color: '#0b1020', power: 1, at: [0, -6, 0], size: [30, 30] }, // dark table
  ]
  for (const panel of panels) {
    const geometry = new PlaneGeometry(1, 1)
    const material = new MeshBasicMaterial({ color: new Color(panel.color).multiplyScalar(panel.power), side: DoubleSide, toneMapped: false })
    const mesh = new Mesh(geometry, material)
    mesh.position.set(...panel.at)
    mesh.scale.set(panel.size[0], panel.size[1], 1)
    mesh.lookAt(0, 0, 0)
    scene.add(mesh)
    disposables.push(geometry, material)
  }
  const pmrem = new PMREMGenerator(renderer)
  const target = pmrem.fromScene(scene, 0.02)
  pmrem.dispose()
  disposables.forEach((d) => d.dispose())
  return { texture: target.texture, dispose: () => target.dispose() }
}

/* ---------- the pack ---------- */

export type Pack = {
  group: Group
  tray: Mesh
  butter: Mesh
  /** Holds both faces of the lid; move or tilt this to move the lid. */
  lid: Group
  lidGeometry: LidGeometry
  /** Fades the whole lid (used when it flies away). */
  setLidOpacity: (opacity: number) => void
  dispose: () => void
}

export const createPack = (): Pack => {
  const group = new Group()

  const trayGeometry = createTrayGeometry()
  const trayMaterial = new MeshPhysicalMaterial({
    color: '#f6f2e8',
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    transparent: true,
    vertexColors: true,
    side: DoubleSide,
    depthWrite: false,
    envMapIntensity: 1.1,
  })
  const tray = new Mesh(trayGeometry, trayMaterial)
  tray.renderOrder = 2
  tray.receiveShadow = true
  group.add(tray)

  const butterGeometry = createButterGeometry()
  const butterNormal = createButterNormalMap()
  const butterMaterial = new MeshPhysicalMaterial({
    color: '#e8b440',
    roughness: 0.46,
    metalness: 0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.55,
    sheen: 0.35,
    sheenRoughness: 0.5,
    sheenColor: new Color('#fff0c0'),
    // A little inner glow stands in for light passing through the butter.
    emissive: new Color('#8a5208'),
    emissiveIntensity: 0.32,
    normalMap: butterNormal,
    normalScale: new Vector2(1, 1),
    envMapIntensity: 0.55,
  })
  const butter = new Mesh(butterGeometry, butterMaterial)
  butter.castShadow = true
  butter.receiveShadow = true
  group.add(butter)

  const lidGeometry = createLidGeometry()
  const foilNormal = createFoilNormalMap()
  const foilTop = new MeshStandardMaterial({
    color: '#f1f2f4',
    metalness: 1,
    roughness: 0.27,
    normalMap: foilNormal,
    normalScale: new Vector2(1, 1),
    envMapIntensity: 1.25,
    side: FrontSide,
  })
  // The sealing side of the foil is lacquered: still silver, but much duller.
  const foilUnder = new MeshStandardMaterial({
    color: '#7c8592',
    metalness: 0.9,
    roughness: 0.52,
    normalMap: foilNormal,
    normalScale: new Vector2(0.5, 0.5),
    envMapIntensity: 0.9,
    side: BackSide,
  })
  const lid = new Group()
  lid.position.y = PACK.height + PACK.lidLift
  const lidTop = new Mesh(lidGeometry, foilTop)
  const lidUnder = new Mesh(lidGeometry, foilUnder)
  lidTop.castShadow = true
  lidTop.receiveShadow = true
  lidUnder.receiveShadow = true
  // The curled flap leaves the bounds of the flat lid, so skip culling for this one small mesh.
  lidTop.frustumCulled = false
  lidUnder.frustumCulled = false
  lid.add(lidTop, lidUnder)
  group.add(lid)

  const contactTexture = createContactShadowTexture()
  const contactMaterial = new MeshBasicMaterial({ map: contactTexture, transparent: true, depthWrite: false, opacity: 0.75, toneMapped: false })
  const contact = new Mesh(new PlaneGeometry(2.5, 1.95), contactMaterial)
  contact.rotation.x = -Math.PI / 2
  contact.position.set(0.04, -0.004, 0.05)
  contact.renderOrder = 0
  group.add(contact)

  return {
    group,
    tray,
    butter,
    lid,
    lidGeometry,
    setLidOpacity: (opacity) => {
      const see = opacity < 0.999
      for (const m of [foilTop, foilUnder]) {
        if (m.transparent !== see) {
          m.transparent = see
          m.needsUpdate = true
        }
        m.opacity = opacity
      }
      lidTop.castShadow = opacity > 0.5
    },
    dispose: () => {
      for (const d of [trayGeometry, trayMaterial, butterGeometry, butterNormal, butterMaterial, lidGeometry, foilNormal, foilTop, foilUnder, contactTexture, contactMaterial, contact.geometry]) d.dispose()
    },
  }
}
