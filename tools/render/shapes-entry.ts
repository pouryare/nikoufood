import {
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  VSMShadowMap,
  WebGLRenderer,
  type BufferGeometry,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { BUTTER_MATERIAL, createButterCurlGeometry } from '@/three/butter'
import { createStudioEnvironment, STUDIO_LIGHTS } from '@/three/studio'

export type ButterShape = 'pats' | 'block'

declare global {
  interface Window {
    renderShape: (shape: ButterShape, size: number) => string
  }
}

/** Butter is soft: no edge is perfectly straight. A tiny, smooth wobble takes the "gold bar" look away. */
function soften(geometry: BufferGeometry, amount: number, seed: number) {
  const p = geometry.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const n = Math.sin(x * 3.1 + seed) * Math.cos(z * 2.7 - seed * 1.3) + 0.5 * Math.sin((x + z) * 6.3 + seed * 2.1)
    p.setXYZ(i, x + n * amount * 0.4, y + n * amount, z + Math.cos(x * 2.3 + y * 3.7 + seed) * amount * 0.4)
  }
  geometry.computeVertexNormals()
  return geometry
}

const slab = (w: number, h: number, d: number, seed: number, radius = 0.07) => soften(new RoundedBoxGeometry(w, h, d, 10, radius), 0.012, seed)

window.renderShape = (shape, size) => {
  const canvas = document.getElementById('c') as HTMLCanvasElement
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(size, size, false)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.setClearColor(0x000000, 0)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = VSMShadowMap

  const scene = new Scene()
  scene.environment = createStudioEnvironment(renderer).texture
  scene.add(new AmbientLight(STUDIO_LIGHTS.ambient.color, 0.16))
  // The key light comes from the side, so the top, front and side of every piece get a clearly different tone.
  const key = new DirectionalLight(STUDIO_LIGHTS.key.color, 2.7)
  key.position.set(5.5, 5, 2.5)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.radius = 7
  key.shadow.blurSamples = 20
  key.shadow.bias = -0.0008
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 20 })
  scene.add(key)
  const kicker = new DirectionalLight(STUDIO_LIGHTS.kicker.color, STUDIO_LIGHTS.kicker.intensity)
  kicker.position.set(...STUDIO_LIGHTS.kicker.position)
  scene.add(kicker)

  // Large flat faces mirror the big softbox and wash out, so these pieces take a little less of it than the curl does.
  const material = new MeshPhysicalMaterial({ ...BUTTER_MATERIAL, color: '#eda92a', envMapIntensity: 0.55, emissiveIntensity: 0.24 })
  const group = new Group()
  const add = (geometry: BufferGeometry, position: [number, number, number], rotation: [number, number, number] = [0, 0, 0], scale = 1) => {
    const mesh = new Mesh(geometry, material)
    mesh.position.set(...position)
    mesh.rotation.set(...rotation)
    mesh.scale.setScalar(scale)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }

  if (shape === 'pats') {
    // Single-serve: thin square pats, stacked a little carelessly, with one leaning on the pile.
    const [w, h, d] = [1.5, 0.21, 1.5]
    const yaw = [-0.16, 0.2, -0.05, 0.34, -0.3]
    yaw.forEach((angle, i) => add(slab(w, h, d, i + 1, 0.05), [Math.sin(i * 1.7) * 0.07 - 0.35, h * (i + 0.5), Math.cos(i * 2.3) * 0.06], [0, angle, 0]))
    add(slab(w, h, d, 9, 0.05), [1.02, 0.56, 0.5], [0.05, 0.42, 0.93])
  } else {
    // Bulk: one big block with the first slice cut off and a curl shaved from the top.
    const [w, h, d] = [2.5, 1.15, 1.55]
    add(slab(w, h, d, 5, 0.09), [-0.25, h * 0.5, 0], [0, 0.32, 0])
    add(slab(0.24, h, d, 6, 0.05), [1.5, 0.125, 0.85], [0, 0.62, Math.PI / 2])
    add(slab(0.24, h, d, 7, 0.05), [1.72, 0.37, 0.72], [0, 0.3, Math.PI / 2])
    add(createButterCurlGeometry({ segmentsU: 220, segmentsV: 84 }), [-0.35, h + 0.33, 0.1], [Math.PI / 2 - 0.25, 0.5, 0.2], 0.52)
  }
  scene.add(group)

  const camera = new PerspectiveCamera(shape === 'block' ? 34 : 26, 1, 0.1, 60)
  camera.position.set(0.8, 3.5, 9)
  camera.lookAt(shape === 'pats' ? 0.2 : 0.9, shape === 'pats' ? 0.5 : 0.66, 0.1)
  renderer.render(scene, camera)
  return canvas.toDataURL('image/png')
}
