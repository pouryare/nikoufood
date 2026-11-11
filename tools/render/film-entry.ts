/**
 * Placeholder "butter on Persian rice" film, drawn entirely in code.
 * It only stands in for the real (AI-generated or filmed) clip: upload a video in
 * «صفحه اصلی ← فیلم اسکرولی» and this one is replaced.
 *
 * One continuous camera move in three beats that match the three chapters on the page:
 *   1. macro: a pat of butter melting on saffron rice
 *   2. the koobideh kababs next to it
 *   3. joojeh and grilled tomato, ending on the whole plate
 */
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Fog,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  LatheGeometry,
  MathUtils,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { BUTTER_MATERIAL } from '@/three/butter'
import { createStudioEnvironment } from '@/three/studio'

declare global {
  interface Window {
    initFilm: (width: number, height: number, quality?: number) => void
    renderFilmFrame: (t: number, samples?: number) => string
  }
}

/* ---------- tiny deterministic helpers ---------- */
let seed = 20261110
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}
const range = (a: number, b: number) => a + (b - a) * rand()
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s)
}
/** Smooth 3D value noise, 0…1. */
const noise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z)
  const xf = x - xi, yf = y - yi, zf = z - zi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf)
  const l = (a: number, b: number, t: number) => a + (b - a) * t
  return l(
    l(l(hash(xi, yi, zi), hash(xi + 1, yi, zi), u), l(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u), v),
    l(l(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u), l(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u), v),
    w,
  )
}

/* ---------- layout of the plate (top view: x to the right, z toward the viewer) ---------- */
const PLATE = { rx: 4.5, rz: 3.2 }
const RICE = { x: 1.75, z: -0.15, rx: 2.25, rz: 2.05, height: 1.12 }
const riceHeight = (x: number, z: number) => {
  const dx = (x - RICE.x) / RICE.rx
  const dz = (z - RICE.z) / RICE.rz
  const d2 = dx * dx + dz * dz
  if (d2 >= 1) return 0
  return RICE.height * Math.pow(1 - d2, 1.35) * (0.94 + 0.12 * noise(x * 1.3, 0, z * 1.3)) + 0.06
}
const BUTTER_POS = new Vector3(RICE.x - 0.05, riceHeight(RICE.x - 0.05, RICE.z + 0.05) + 0.07, RICE.z + 0.05)

let renderer: WebGLRenderer
let scene: Scene
let camera: PerspectiveCamera
let out: HTMLCanvasElement
let ctx: CanvasRenderingContext2D
let portrait = false

let rice: InstancedMesh
const riceBase: Color[] = []
const ricePos: Vector3[] = []
let butter: Mesh
const drips: { mesh: Mesh; from: Vector3; to: Vector3; start: number }[] = []
const steam: { sprite: Sprite; phase: number; x: number; z: number; size: number }[] = []

function buildPlate(root: Group) {
  // A wide, shallow dish: dark glazed ceramic with a thin gold rim.
  const profile = [
    new Vector2(0, 0.0),
    new Vector2(0.72, 0.0),
    new Vector2(0.86, 0.03),
    new Vector2(0.95, 0.1),
    new Vector2(1.0, 0.16),
    new Vector2(1.015, 0.165),
    new Vector2(1.0, 0.12),
    new Vector2(0.9, 0.0),
    new Vector2(0.6, -0.05),
    new Vector2(0, -0.05),
  ]
  const plate = new Mesh(
    new LatheGeometry(profile, 128),
    new MeshPhysicalMaterial({ color: '#141a2b', roughness: 0.32, metalness: 0.1, clearcoat: 0.7, clearcoatRoughness: 0.25, side: DoubleSide }),
  )
  plate.scale.set(PLATE.rx + 0.55, 1, PLATE.rz + 0.5)
  plate.position.y = 0.05
  plate.receiveShadow = true
  plate.castShadow = true
  root.add(plate)

  const rim = new Mesh(new TorusGeometry(1, 0.006, 12, 180), new MeshStandardMaterial({ color: '#e3b04b', metalness: 1, roughness: 0.25 }))
  rim.rotation.x = Math.PI / 2
  rim.scale.set((PLATE.rx + 0.55) * 1.012, (PLATE.rz + 0.5) * 1.012, 4)
  rim.position.y = 0.215
  root.add(rim)

  // The table: almost black, slightly glossy, fading into the page colour far away.
  const table = new Mesh(new PlaneGeometry(80, 80), new MeshStandardMaterial({ color: '#080c18', roughness: 0.5, metalness: 0.35 }))
  table.rotation.x = -Math.PI / 2
  table.receiveShadow = true
  root.add(table)
}

function buildRice(root: Group, count: number) {
  // A smooth mound underneath fills the gaps between the grains.
  const base = new SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2)
  const pos = base.attributes.position as BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = RICE.x + pos.getX(i) * RICE.rx * 0.985
    const z = RICE.z + pos.getZ(i) * RICE.rz * 0.985
    pos.setXYZ(i, x, Math.max(0.04, riceHeight(x, z) - 0.035), z)
  }
  base.computeVertexNormals()
  const mound = new Mesh(base, new MeshStandardMaterial({ color: '#e6dcc4', roughness: 0.9 }))
  mound.receiveShadow = true
  mound.position.y = 0.1
  root.add(mound)

  const grain = new CapsuleGeometry(0.021, 0.125, 2, 6)
  rice = new InstancedMesh(grain, new MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.5 }), count)
  rice.castShadow = true
  rice.receiveShadow = true
  const dummy = new Object3D()
  const up = new Vector3(0, 1, 0)
  const normal = new Vector3()
  const q = new Quaternion()
  const plain = new Color('#f6efe0')
  const saffronA = new Color('#f4b41a')
  const saffronB = new Color('#e58e0a')
  for (let i = 0; i < count; i++) {
    // Uniform over the ellipse, a little denser toward the top.
    const r = Math.pow(rand(), 0.62)
    const a = rand() * Math.PI * 2
    const x = RICE.x + Math.cos(a) * r * RICE.rx
    const z = RICE.z + Math.sin(a) * r * RICE.rz
    const h = riceHeight(x, z)
    const e = 0.02
    normal.set(riceHeight(x - e, z) - riceHeight(x + e, z), 2 * e, riceHeight(x, z - e) - riceHeight(x, z + e)).normalize()
    dummy.position.set(x, h + 0.1 + range(-0.012, 0.03), z)
    // Lay each grain flat on the mound, pointing any way, with a small random lift.
    q.setFromUnitVectors(up, normal)
    dummy.quaternion.copy(q)
    dummy.rotateY(rand() * Math.PI * 2)
    dummy.rotateZ(Math.PI / 2 + range(-0.38, 0.38))
    dummy.scale.setScalar(range(0.82, 1.18))
    dummy.updateMatrix()
    rice.setMatrixAt(i, dummy.matrix)

    // Saffron rice is spooned over the top: a golden cap with a ragged edge.
    const dTop = Math.hypot((x - RICE.x) / RICE.rx, (z - RICE.z) / RICE.rz)
    const capEdge = 0.4 + 0.2 * noise(x * 2.1, 3, z * 2.1)
    const c = new Color()
    if (dTop < capEdge && rand() > 0.07) c.copy(saffronA).lerp(saffronB, rand()).multiplyScalar(range(0.9, 1.05))
    else c.copy(plain).multiplyScalar(range(0.9, 1.0))
    rice.setColorAt(i, c)
    riceBase.push(c.clone())
    ricePos.push(dummy.position.clone())
  }
  rice.instanceMatrix.needsUpdate = true
  root.add(rice)
}

function buildButter(root: Group) {
  butter = new Mesh(new RoundedBoxGeometry(0.66, 0.2, 0.66, 8, 0.055), new MeshPhysicalMaterial({ ...BUTTER_MATERIAL, color: '#f6c446', roughness: 0.3, clearcoat: 0.55 }))
  butter.position.copy(BUTTER_POS)
  butter.rotation.set(0.05, 0.5, -0.04)
  butter.castShadow = true
  butter.receiveShadow = true
  root.add(butter)

  // Melted butter running down the mound in a few glossy beads.
  const mat = new MeshPhysicalMaterial({ ...BUTTER_MATERIAL, color: '#f2b62f', roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.94 })
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + range(-0.3, 0.3)
    const reach = range(0.55, 1.25)
    const from = BUTTER_POS.clone().add(new Vector3(Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3))
    const to = new Vector3(BUTTER_POS.x + Math.cos(a) * reach, 0, BUTTER_POS.z + Math.sin(a) * reach)
    from.y = riceHeight(from.x, from.z) + 0.13
    to.y = riceHeight(to.x, to.z) + 0.13
    const mesh = new Mesh(new SphereGeometry(range(0.05, 0.085), 20, 14), mat)
    mesh.scale.set(1, 0.42, 1)
    mesh.visible = false
    root.add(mesh)
    drips.push({ mesh, from, to, start: range(0.18, 0.5) })
  }
}

/** Koobideh: a long flat kabab with the finger-pressed ridges and darker, charred tops. */
function koobidehGeometry(length: number, phase: number): BufferGeometry {
  const N = 220, M = 40
  const positions: number[] = [], colors: number[] = [], indices: number[] = []
  const meat = new Color('#7a4423'), char = new Color('#24120a'), fat = new Color('#a8652f')
  const c = new Color()
  for (let i = 0; i <= N; i++) {
    const s = (i / N) * 2 - 1
    const taper = Math.pow(1 - Math.pow(Math.abs(s), 5), 0.5)
    const ridge = 0.5 + 0.5 * Math.cos(s * 15 * Math.PI + phase)
    const halfW = 0.27 * taper * (1 + 0.05 * ridge)
    const halfH = 0.105 * taper * (0.66 + 0.34 * ridge)
    for (let j = 0; j <= M; j++) {
      const phi = (j / M) * Math.PI * 2
      const cx = Math.cos(phi), sy = Math.sin(phi)
      const x = halfW * Math.sign(cx) * Math.pow(Math.abs(cx), 0.72)
      let y = halfH * Math.sign(sy) * Math.pow(Math.abs(sy), 0.8)
      if (y < 0) y *= 0.45
      const z = (s * length) / 2
      const n = noise(x * 9 + phase, y * 9, z * 6)
      const bump = (n - 0.5) * 0.022 * taper
      positions.push(x + bump * cx, y + halfH * 0.45 + bump, z)
      const top = Math.max(0, sy)
      const charAmount = Math.min(1, smooth(0.45, 0.95, ridge * top + (n - 0.5) * 0.7) * 0.85 + smooth(0.62, 0.8, noise(x * 5, 7 + phase, z * 3.2)) * 0.45)
      c.copy(meat).lerp(fat, smooth(0.5, 0.9, n) * 0.5).lerp(char, charAmount)
      colors.push(c.r, c.g, c.b)
    }
  }
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j, b = a + 1, d = a + M + 1, e = d + 1
      indices.push(a, d, b, b, d, e)
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(positions, 3))
  g.setAttribute('color', new Float32BufferAttribute(colors, 3))
  g.setIndex(indices)
  g.computeVertexNormals()
  return g
}

function buildKababs(root: Group) {
  const mat = new MeshPhysicalMaterial({ vertexColors: true, roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.45 })
  ;[
    { x: -1.2, z: 0.05, rot: 0.2, phase: 0.4 },
    { x: -1.98, z: -0.12, rot: 0.24, phase: 2.1 },
  ].forEach((k) => {
    const mesh = new Mesh(koobidehGeometry(4.5, k.phase), mat)
    mesh.position.set(k.x, 0.115, k.z)
    mesh.rotation.y = k.rot
    mesh.castShadow = true
    mesh.receiveShadow = true
    root.add(mesh)
  })
}

/** Joojeh: saffron-marinated chicken pieces on a flat steel skewer, with grill marks. */
function buildJoojeh(root: Group) {
  const group = new Group()
  const mat = new MeshPhysicalMaterial({ vertexColors: true, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3 })
  const saffron = new Color('#eba02a'), deep = new Color('#d97a12'), char = new Color('#3a1a08')
  const c = new Color()
  const pieces = 7
  for (let i = 0; i < pieces; i++) {
    const g = new IcosahedronGeometry(0.25, 4)
    const pos = g.attributes.position as BufferAttribute
    const colors: number[] = []
    const s = i * 7.31
    for (let v = 0; v < pos.count; v++) {
      const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v)
      const n = noise(x * 3.2 + s, y * 3.2, z * 3.2)
      const k = 1 + (n - 0.5) * 0.42
      pos.setXYZ(v, x * k * 1.05, y * k * 0.74, z * k * 1.16)
      const marks = smooth(0.62, 0.8, noise(x * 7 + s, y * 2, z * 7)) * smooth(-0.05, 0.2, y)
      c.copy(saffron).lerp(deep, noise(x * 5 + s, y * 5, z * 5)).lerp(char, Math.min(1, marks * 0.9))
      colors.push(c.r, c.g, c.b)
    }
    g.setAttribute('color', new Float32BufferAttribute(colors, 3))
    g.computeVertexNormals()
    const mesh = new Mesh(g, mat)
    mesh.position.set(range(-0.03, 0.03), 0.24 + range(-0.015, 0.02), (i - (pieces - 1) / 2) * 0.47)
    mesh.rotation.set(range(-0.3, 0.3), range(0, 3), range(-0.3, 0.3))
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }
  const skewer = new Mesh(new RoundedBoxGeometry(0.075, 0.016, 4.9, 2, 0.006), new MeshStandardMaterial({ color: '#c9ced6', metalness: 1, roughness: 0.28 }))
  skewer.position.set(0, 0.24, 0.35)
  skewer.castShadow = true
  group.add(skewer)
  group.position.set(-3.02, 0.0, -0.1)
  group.rotation.y = 0.3
  root.add(group)
}

function buildTomatoes(root: Group) {
  const mat = new MeshPhysicalMaterial({ vertexColors: true, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 })
  const red = new Color('#c8261a'), orange = new Color('#e3541f'), char = new Color('#1c0d08')
  const c = new Color()
  ;[
    { x: -0.25, z: 2.2, r: 0.4, s: 1.3 },
    { x: 0.5, z: 2.52, r: 0.34, s: 4.7 },
  ].forEach((t) => {
    const g = new SphereGeometry(t.r, 56, 40)
    const pos = g.attributes.position as BufferAttribute
    const colors: number[] = []
    for (let v = 0; v < pos.count; v++) {
      let x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v)
      const ny = y / t.r
      const dent = smooth(0.82, 1, ny) * 0.16 * t.r
      const lobes = 1 + 0.035 * Math.cos(Math.atan2(z, x) * 5 + t.s)
      x *= lobes
      z *= lobes
      y = y * 0.84 - dent
      pos.setXYZ(v, x, y, z)
      const blister = smooth(0.56, 0.74, noise(x * 5.5 + t.s, y * 5.5, z * 5.5)) * smooth(-0.1, 0.55, ny)
      c.copy(red).lerp(orange, noise(x * 3 + t.s, y * 3, z * 3) * 0.6).lerp(char, Math.min(1, blister * 0.92))
      colors.push(c.r, c.g, c.b)
    }
    g.setAttribute('color', new Float32BufferAttribute(colors, 3))
    g.computeVertexNormals()
    const mesh = new Mesh(g, mat)
    mesh.position.set(t.x, 0.11 + t.r * 0.84, t.z)
    mesh.rotation.set(0.12, t.s, -0.1)
    mesh.castShadow = true
    mesh.receiveShadow = true
    root.add(mesh)
  })

  // A few basil leaves for a touch of fresh green.
  const leaf = new Shape()
  leaf.moveTo(0, 0)
  leaf.bezierCurveTo(0.2, 0.1, 0.24, 0.42, 0, 0.66)
  leaf.bezierCurveTo(-0.24, 0.42, -0.2, 0.1, 0, 0)
  const leafMat = new MeshPhysicalMaterial({ color: '#3f8a2e', roughness: 0.5, clearcoat: 0.4, side: DoubleSide })
  ;[
    { x: 0.95, z: 2.25, r: 0.4 },
    { x: -0.95, z: 2.45, r: 2.6 },
    { x: 0.2, z: 2.85, r: 1.5 },
    { x: -3.3, z: 2.0, r: 0.9 },
    { x: -2.6, z: -2.35, r: 3.4 },
  ].forEach((l, i) => {
    const g = new ShapeGeometry(leaf, 14)
    const pos = g.attributes.position as BufferAttribute
    for (let v = 0; v < pos.count; v++) {
      const x = pos.getX(v), y = pos.getY(v)
      pos.setZ(v, 0.09 * Math.sin(y * 3.4) - 0.5 * x * x + 0.02 * Math.sin(x * 30))
    }
    g.computeVertexNormals()
    const mesh = new Mesh(g, leafMat)
    mesh.rotation.set(-Math.PI / 2 + 0.12, 0, l.r)
    mesh.position.set(l.x, 0.17 + i * 0.004, l.z)
    mesh.scale.setScalar(range(0.75, 1.05))
    mesh.castShadow = true
    mesh.receiveShadow = true
    root.add(mesh)
  })
}

function buildSteam(root: Group) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,0.9)')
  grad.addColorStop(0.4, 'rgba(255,255,255,0.28)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  const texture = new CanvasTexture(c)
  texture.colorSpace = SRGBColorSpace
  for (let i = 0; i < 9; i++) {
    const sprite = new Sprite(new SpriteMaterial({ map: texture, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, color: '#ffe9c4' }))
    root.add(sprite)
    steam.push({ sprite, phase: rand(), x: RICE.x + range(-1.0, 1.0), z: RICE.z + range(-0.9, 0.9), size: range(0.7, 1.3) })
  }
}

/* ---------- camera path ---------- */
type Key = { at: number; pos: [number, number, number]; look: [number, number, number] }
const B = BUTTER_POS
const KEYS: Key[] = [
  { at: 0.0, pos: [B.x + 1.35, B.y + 0.62, B.z + 1.75], look: [B.x, B.y + 0.02, B.z] },
  { at: 0.17, pos: [B.x + 0.55, B.y + 0.8, B.z + 2.0], look: [B.x - 0.02, B.y - 0.02, B.z] },
  { at: 0.34, pos: [B.x - 0.75, B.y + 1.05, B.z + 2.45], look: [B.x - 0.15, B.y - 0.12, B.z + 0.05] },
  { at: 0.5, pos: [-0.9, 1.75, 4.1], look: [-1.25, 0.3, 0.55] },
  { at: 0.64, pos: [-2.7, 1.5, 3.7], look: [-1.75, 0.22, 0.35] },
  { at: 0.78, pos: [-4.6, 1.75, 2.9], look: [-2.75, 0.3, 0.15] },
  { at: 0.9, pos: [-2.6, 4.6, 6.3], look: [-0.5, 0.15, 0.2] },
  { at: 1.0, pos: [0.0, 6.9, 7.3], look: [0.0, 0.1, 0.12] },
]
const posCurve = new CatmullRomCurve3(KEYS.map((k) => new Vector3(...k.pos)), false, 'centripetal')
const lookCurve = new CatmullRomCurve3(KEYS.map((k) => new Vector3(...k.look)), false, 'centripetal')
/** Film time (0…1) → position along the curves, so the keys land exactly at their `at` times. */
const curveU = (t: number) => {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i], b = KEYS[i + 1]
    if (t <= b.at) {
      const local = smooth(0, 1, (t - a.at) / (b.at - a.at)) * 0.35 + ((t - a.at) / (b.at - a.at)) * 0.65
      return (i + local) / (KEYS.length - 1)
    }
  }
  return 1
}

const camPos = new Vector3(), camLook = new Vector3(), right = new Vector3(), upv = new Vector3()

function setState(t: number) {
  const melt = smooth(0.03, 0.46, t)
  // The pat slumps, spreads and sinks into the rice.
  butter.scale.set(1 + melt * 0.3, 1 - melt * 0.74, 1 + melt * 0.3)
  butter.position.y = BUTTER_POS.y - melt * 0.085
  butter.rotation.y = 0.5 + melt * 0.25
  ;(butter.material as MeshPhysicalMaterial).roughness = MathUtils.lerp(0.3, 0.1, melt)
  ;(butter.material as MeshPhysicalMaterial).clearcoat = MathUtils.lerp(0.55, 1, melt)

  // The rice around it turns glossy gold as the butter soaks in.
  const gold = new Color('#f5b93a')
  const c = new Color()
  const reach = 0.35 + melt * 1.5
  for (let i = 0; i < ricePos.length; i++) {
    const p = ricePos[i]
    const d = Math.hypot(p.x - BUTTER_POS.x, p.z - BUTTER_POS.z)
    const soak = melt * (1 - smooth(reach * 0.35, reach, d + (hash(i, 1, 2) - 0.5) * 0.3))
    c.copy(riceBase[i]).lerp(gold, soak * 0.72)
    rice.setColorAt(i, c)
  }
  rice.instanceColor!.needsUpdate = true

  for (const d of drips) {
    const k = smooth(d.start, d.start + 0.3, t)
    d.mesh.visible = k > 0.001
    d.mesh.position.lerpVectors(d.from, d.to, k)
    d.mesh.position.y = riceHeight(d.mesh.position.x, d.mesh.position.z) + 0.125
    const grow = 0.6 + 0.4 * Math.sin(Math.min(1, k * 1.4) * Math.PI * 0.5)
    d.mesh.scale.set(grow, 0.42 * grow, grow)
  }

  for (const s of steam) {
    const life = (t * 2.6 + s.phase) % 1
    s.sprite.position.set(s.x + Math.sin(life * 5 + s.phase * 9) * 0.18, 1.2 + life * 1.9, s.z)
    s.sprite.scale.setScalar(s.size * (0.7 + life * 1.5))
    s.sprite.material.opacity = Math.sin(life * Math.PI) * 0.085 * (1 - smooth(0.82, 1, t) * 0.5)
  }

  const u = curveU(t)
  posCurve.getPoint(u, camPos)
  lookCurve.getPoint(u, camLook)
  if (portrait) {
    // A tall frame sees less to the sides: step back and aim between the subjects.
    camPos.sub(camLook).multiplyScalar(1.22 + smooth(0.8, 1, t) * 0.35).add(camLook)
  }
}

window.initFilm = (width, height, quality = 1) => {
  portrait = height > width
  const gl = document.getElementById('c') as HTMLCanvasElement
  renderer = new WebGLRenderer({ canvas: gl, antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(width, height, false)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap

  scene = new Scene()
  scene.background = new Color('#070b16')
  scene.fog = new Fog('#070b16', 9, 21)
  scene.environment = createStudioEnvironment(renderer, { intensity: 0.8 }).texture
  scene.environmentIntensity = 0.75

  scene.add(new AmbientLight('#8fa3d9', 0.16))
  const key = new DirectionalLight('#ffe7c2', 3.1)
  key.position.set(4.5, 8.5, 4.2)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.left = -7
  key.shadow.camera.right = 7
  key.shadow.camera.top = 7
  key.shadow.camera.bottom = -7
  key.shadow.camera.near = 1
  key.shadow.camera.far = 24
  key.shadow.bias = -0.0006
  key.shadow.normalBias = 0.018
  key.shadow.radius = 5
  scene.add(key)
  const rim = new DirectionalLight('#ff9e3d', 2.3)
  rim.position.set(-5.5, 3.2, -6)
  scene.add(rim)
  const cool = new DirectionalLight('#5fa8ff', 0.5)
  cool.position.set(-6, 4, 5)
  scene.add(cool)

  const root = new Group()
  scene.add(root)
  buildPlate(root)
  buildRice(root, Math.round(9000 * quality))
  buildButter(root)
  buildKababs(root)
  buildJoojeh(root)
  buildTomatoes(root)
  buildSteam(root)

  camera = new PerspectiveCamera(portrait ? 44 : 33, width / height, 0.1, 60)

  out = document.createElement('canvas')
  out.width = width
  out.height = height
  ctx = out.getContext('2d')!
}

/**
 * Renders one frame. `samples` > 1 moves the camera a hair around the focus point and averages the
 * pictures: things at the focus distance stay sharp, everything else blurs like a real macro lens.
 */
window.renderFilmFrame = (t, samples = 1) => {
  setState(t)
  const aperture = MathUtils.lerp(0.05, 0.016, smooth(0.4, 0.95, t))
  for (let k = 0; k < samples; k++) {
    camera.position.copy(camPos)
    camera.up.set(0, 1, 0)
    camera.lookAt(camLook)
    if (samples > 1 && k > 0) {
      const a = ((k - 1) / (samples - 1)) * Math.PI * 2 + 0.4
      const r = aperture * camPos.distanceTo(camLook) * (k % 2 ? 1 : 0.6)
      camera.updateMatrixWorld()
      right.setFromMatrixColumn(camera.matrixWorld, 0)
      upv.setFromMatrixColumn(camera.matrixWorld, 1)
      camera.position.addScaledVector(right, Math.cos(a) * r).addScaledVector(upv, Math.sin(a) * r)
      camera.lookAt(camLook)
    }
    renderer.render(scene, camera)
    ctx.globalAlpha = 1 / (k + 1)
    ctx.drawImage(renderer.domElement, 0, 0)
  }
  ctx.globalAlpha = 1
  return out.toDataURL('image/jpeg', 0.96)
}

// Keep unused imports honest for bundlers that tree-shake aggressively.
void Matrix4
