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
  WebGLRenderer,
} from 'three'
import { BUTTER_MATERIAL, createButterCurlGeometry, CURL_REST_ROTATION } from '@/three/butter'
import { createStudioEnvironment, STUDIO_LIGHTS } from '@/three/studio'

declare global {
  interface Window {
    renderButter: (size: number, rotation?: [number, number, number], fov?: number, distance?: number) => string
  }
}

window.renderButter = (size, rotation = CURL_REST_ROTATION, fov = 30, distance = 6.4) => {
  const canvas = document.getElementById('c') as HTMLCanvasElement
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(size, size, false)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  scene.environment = createStudioEnvironment(renderer).texture
  scene.add(new AmbientLight(STUDIO_LIGHTS.ambient.color, STUDIO_LIGHTS.ambient.intensity))
  for (const key of ['key', 'kicker'] as const) {
    const light = new DirectionalLight(STUDIO_LIGHTS[key].color, STUDIO_LIGHTS[key].intensity)
    light.position.set(...STUDIO_LIGHTS[key].position)
    scene.add(light)
  }

  const group = new Group()
  group.rotation.set(...rotation)
  group.add(new Mesh(createButterCurlGeometry(), new MeshPhysicalMaterial({ ...BUTTER_MATERIAL })))
  scene.add(group)

  const camera = new PerspectiveCamera(fov, 1, 0.1, 40)
  camera.position.set(0, 0, distance)
  renderer.render(scene, camera)
  return canvas.toDataURL('image/png')
}
