import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  RingGeometry,
  Scene,
  type Texture,
  type WebGLRenderer,
} from 'three'

export type StudioOptions = {
  /** The two thin rim lights carry the logo gradient (cyan and magenta) onto the butter's edges. */
  accentFrom?: string
  accentTo?: string
  /** Overall brightness of the softboxes. */
  intensity?: number
}

type Panel = {
  form?: 'rect' | 'ring'
  color: string
  intensity: number
  position: [number, number, number]
  scale: [number, number]
}

/**
 * A small photo studio built in code: softboxes are glowing panels around the subject, baked into
 * an environment map. Nothing is downloaded (no HDR files, no CDN), so it also works in Iran and offline.
 * The live hero, the still posters and the placeholder film all use this same studio, so they match.
 */
export function createStudioEnvironment(renderer: WebGLRenderer, options: StudioOptions = {}): { texture: Texture; dispose: () => void } {
  const { accentFrom = '#15d3df', accentTo = '#f412ff', intensity = 1 } = options
  const scene = new Scene()
  scene.background = new Color('#04060c')

  const panels: Panel[] = [
    { color: '#fff4dc', intensity: 3.6, position: [0, 5, 1.5], scale: [9, 5] }, // big softbox above
    { color: '#ffd9a0', intensity: 1.6, position: [-5, 1, 3], scale: [4, 6] }, // warm fill, left
    { color: '#ffe6c0', intensity: 0.9, position: [5, -1, 4], scale: [3, 4] }, // soft fill, right
    { color: accentFrom, intensity: 1.3, position: [6, 0.5, -2.5], scale: [0.9, 7] }, // cyan rim
    { color: accentTo, intensity: 1.3, position: [-6, -0.5, -3], scale: [0.9, 7] }, // magenta rim
    { form: 'ring', color: '#ffdf9e', intensity: 1.8, position: [0, -1.5, -6], scale: [5, 5] }, // halo behind
  ]

  const disposables: Array<{ dispose: () => void }> = []
  for (const panel of panels) {
    const geometry = panel.form === 'ring' ? new RingGeometry(0.5, 1, 64) : new PlaneGeometry(1, 1)
    const material = new MeshBasicMaterial({ color: new Color(panel.color).multiplyScalar(panel.intensity * intensity), side: DoubleSide, toneMapped: false })
    const mesh = new Mesh(geometry, material)
    mesh.position.set(...panel.position)
    mesh.scale.set(panel.scale[0], panel.scale[1], 1)
    mesh.lookAt(0, 0, 0)
    scene.add(mesh)
    disposables.push(geometry, material)
  }

  const pmrem = new PMREMGenerator(renderer)
  const target = pmrem.fromScene(scene, 0.035)
  pmrem.dispose()
  disposables.forEach((d) => d.dispose())

  return { texture: target.texture, dispose: () => target.dispose() }
}

/** Direct lights that go with the studio: a warm key from the upper right and an amber kicker from behind. */
export const STUDIO_LIGHTS = {
  ambient: { color: '#ffe8c2', intensity: 0.25 },
  key: { color: '#fff2d6', intensity: 2.4, position: [3.5, 5, 4] as [number, number, number] },
  kicker: { color: '#ffb04a', intensity: 1.7, position: [-4, 1.5, -3] as [number, number, number] },
} as const
