import {
  ACESFilmicToneMapping,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { explodedPadding, peelPadding, type Padding } from './packLayout'
import { bendLid, createPack, createPackEnvironment, PACK, PEEL_DIAGONAL, TAB_INWARD, TAB_TIP, type Pack } from './packModel'

/*
 * The small WebGL stage both pack components draw on. It only renders when something changed
 * (no idle frame loop), which keeps it cheap next to the rest of the page.
 * This file pulls in three.js, so the components load it lazily.
 */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

class Stage {
  readonly renderer: WebGLRenderer
  readonly scene = new Scene()
  readonly camera: PerspectiveCamera
  readonly pack: Pack
  width = 1
  height = 1
  private env: { dispose: () => void }
  private ground: Mesh
  private frame = 0
  private disposed = false
  private readonly scratch = new Vector3()
  /** Runs right after each draw (used to tell the component the first frame is on screen). */
  afterRender: (() => void) | null = null

  constructor(
    readonly canvas: HTMLCanvasElement,
    /** Direction from the pack toward the camera. */
    private readonly viewDir: Vector3,
    private readonly target: Vector3,
    fov: number,
  ) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'default' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.outputColorSpace = SRGBColorSpace
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFShadowMap
    this.renderer.setClearColor(0x000000, 0)

    const env = createPackEnvironment(this.renderer)
    this.env = env
    this.scene.environment = env.texture

    this.camera = new PerspectiveCamera(fov, 1, 0.5, 40)
    this.viewDir.normalize()

    // Key light from the upper left, matching the gold softbox in the reflected room.
    const key = new DirectionalLight('#fff0d4', 2.1)
    key.position.set(-3.4, 6, 2.6)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = -2.4
    key.shadow.camera.right = 2.4
    key.shadow.camera.top = 2.4
    key.shadow.camera.bottom = -2.4
    key.shadow.camera.near = 1
    key.shadow.camera.far = 16
    key.shadow.radius = 7
    key.shadow.bias = -0.0006
    key.shadow.normalBias = 0.012
    this.scene.add(key, new HemisphereLight('#d6deff', '#1c233c', 0.4))

    // Invisible table that only shows the shadows falling on it.
    const groundMaterial = new ShadowMaterial({ opacity: 0.42, depthWrite: false })
    this.ground = new Mesh(new PlaneGeometry(9, 9), groundMaterial)
    this.ground.rotation.x = -Math.PI / 2
    this.ground.position.y = -0.006
    this.ground.receiveShadow = true
    this.scene.add(this.ground)

    this.pack = createPack()
    this.scene.add(this.pack.group)
  }

  /** Sizes the canvas and moves the camera so that `points` fill the area left inside `pad`. */
  fit(width: number, height: number, points: Vector3[], pad: Padding) {
    this.width = Math.max(1, width)
    this.height = Math.max(1, height)
    this.renderer.setSize(this.width, this.height, false)
    const cam = this.camera
    cam.clearViewOffset()
    cam.aspect = this.width / this.height
    const availW = Math.max(40, this.width - pad.left - pad.right)
    const availH = Math.max(40, this.height - pad.top - pad.bottom)
    let dist = 6
    let minX = 0
    let maxX = 0
    let minY = 0
    let maxY = 0
    for (let pass = 0; pass < 6; pass++) {
      cam.position.copy(this.target).addScaledVector(this.viewDir, dist)
      cam.lookAt(this.target)
      cam.updateProjectionMatrix()
      cam.updateMatrixWorld(true)
      minX = minY = Infinity
      maxX = maxY = -Infinity
      for (const p of points) {
        this.scratch.copy(p).project(cam)
        minX = Math.min(minX, this.scratch.x)
        maxX = Math.max(maxX, this.scratch.x)
        minY = Math.min(minY, this.scratch.y)
        maxY = Math.max(maxY, this.scratch.y)
      }
      const k = Math.max((((maxX - minX) / 2) * this.width) / availW, (((maxY - minY) / 2) * this.height) / availH)
      if (Math.abs(k - 1) < 0.004) break
      dist *= k
    }
    // Slide the picture so the subject sits in the middle of the free area (labels take the rest).
    const cx = (((minX + maxX) / 2) * 0.5 + 0.5) * this.width
    const cy = (1 - (((minY + maxY) / 2) * 0.5 + 0.5)) * this.height
    cam.setViewOffset(this.width, this.height, cx - (pad.left + availW / 2), cy - (pad.top + availH / 2), this.width, this.height)
    cam.updateProjectionMatrix()
    this.requestRender()
  }

  /** World point to CSS pixels inside the canvas. */
  toScreen(point: Vector3): [number, number] {
    this.scratch.copy(point).project(this.camera)
    return [(this.scratch.x * 0.5 + 0.5) * this.width, (1 - (this.scratch.y * 0.5 + 0.5)) * this.height]
  }

  requestRender() {
    if (this.frame || this.disposed) return
    this.frame = requestAnimationFrame(() => {
      this.frame = 0
      this.renderNow()
    })
  }

  renderNow() {
    if (this.disposed) return
    this.renderer.render(this.scene, this.camera)
    this.afterRender?.()
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.frame)
    this.pack.dispose()
    this.env.dispose()
    this.ground.geometry.dispose()
    ;(this.ground.material as ShadowMaterial).dispose()
    this.renderer.dispose()
  }
}

/* ---------- exploded view ---------- */

export type ExplodedAnchors = { lid: [number, number]; butter: [number, number]; tray: [number, number] }

export type ExplodedStage = {
  setProgress: (progress: number) => void
  resize: (width: number, height: number) => void
  dispose: () => void
}

export const createExplodedStage = (
  canvas: HTMLCanvasElement,
  options: { onLayout: (anchors: ExplodedAnchors) => void; onFirstFrame: () => void },
): ExplodedStage => {
  const stage = new Stage(canvas, new Vector3(0.5, 0.5, 1), new Vector3(0, 0.6, 0), 24)
  const { pack } = stage
  const lidRestY = PACK.height + PACK.lidLift
  let progress = 0
  let first = true
  stage.afterRender = () => {
    if (!first) return
    first = false
    options.onFirstFrame()
  }

  const lidAnchor = new Vector3()
  const butterAnchor = new Vector3()
  const trayAnchor = new Vector3(PACK.hx + 0.02, 0.15, 0.2)
  const tabPull: [number, number] = [0, 0]

  const pose = (p: number) => {
    const lift = easeInOut(clamp01(p / 0.75))
    const rise = easeInOut(clamp01((p - 0.16) / 0.74))
    pack.lid.position.y = lidRestY + lift * 0.86
    // The floating lid leans toward the viewer and swings a touch, so its reflections travel.
    pack.lid.rotation.set(0.2 * lift, -0.16 * lift, -0.07 * lift)
    pack.butter.position.y = rise * 0.44
    // Free of the rim, the tab springs up a little.
    const spring = lift * 0.17
    tabPull[0] = TAB_TIP[0] + TAB_INWARD[0] * spring
    tabPull[1] = TAB_TIP[1] + TAB_INWARD[1] * spring
    bendLid(pack.lidGeometry, spring > 0.004 ? tabPull : null, 0.085)
    pack.group.updateMatrixWorld(true)
  }

  const layout = () => {
    lidAnchor.set(PACK.hx + PACK.flange - 0.03, 0, 0.2).applyMatrix4(pack.lid.matrixWorld)
    butterAnchor.set(PACK.hx - 0.07, 0.17 + pack.butter.position.y, 0.2)
    options.onLayout({ lid: stage.toScreen(lidAnchor), butter: stage.toScreen(butterAnchor), tray: stage.toScreen(trayAnchor) })
  }

  return {
    setProgress: (p) => {
      p = clamp01(p)
      if (p === progress && !first) return
      progress = p
      pose(p)
      layout()
      stage.requestRender()
    },
    resize: (width, height) => {
      // Frame the pack closed and fully apart at once, so the camera never moves while scrolling.
      const ox = PACK.hx + PACK.flange
      const oz = PACK.hz + PACK.flange
      const points = [new Vector3(-ox, 0, -oz), new Vector3(ox, 0, -oz), new Vector3(ox, 0, oz), new Vector3(-ox, 0, oz), new Vector3(TAB_TIP[0], 0, TAB_TIP[1])]
      pose(1)
      for (const [x, z] of [[-ox, -oz], [ox, -oz], [ox, oz], [-ox, oz]]) points.push(new Vector3(x, 0.06, z).applyMatrix4(pack.lid.matrixWorld))
      pose(progress)
      stage.fit(width, height, points, explodedPadding(width))
      layout()
    },
    dispose: () => stage.dispose(),
  }
}

/* ---------- peel ---------- */

export type PeelStage = {
  resize: (width: number, height: number) => void
  reset: () => void
  /** Takes the lid off without a drag (keyboard users). */
  peelNow: () => void
  /** Stops the invite motion while the pack is off screen. */
  setVisible: (visible: boolean) => void
  dispose: () => void
}

type PeelOptions = {
  /** Element laid over the tab corner; it alone swallows touch gestures, so the page still scrolls elsewhere. */
  grab: HTMLElement
  hint: HTMLElement | null
  reducedMotion: boolean
  onFirstFrame: () => void
  onDone: () => void
}

export const createPeelStage = (canvas: HTMLCanvasElement, options: PeelOptions): PeelStage => {
  const stage = new Stage(canvas, new Vector3(0, 1, 0.36), new Vector3(0, 0.2, 0), 26)
  const { pack } = stage
  const { grab, hint } = options
  const lidY = PACK.height + PACK.lidLift
  const lidPlane = new Plane(new Vector3(0, 1, 0), -lidY)
  const raycaster = new Raycaster()
  const ndc = new Vector2()
  const hit = new Vector3()
  const tipWorld = new Vector3(TAB_TIP[0], lidY, TAB_TIP[1])

  type Mode = 'idle' | 'drag' | 'back' | 'fly' | 'gone'
  let mode: Mode = 'idle'
  let touched = false
  let visible = true
  let first = true
  let loop = 0
  let animStart = 0
  const pull: [number, number] = [TAB_TIP[0], TAB_TIP[1]]
  const from: [number, number] = [0, 0]
  const grabOffset: [number, number] = [0, 0]

  stage.afterRender = () => {
    if (!first) return
    first = false
    options.onFirstFrame()
  }

  const apply = () => {
    const d = Math.hypot(pull[0] - TAB_TIP[0], pull[1] - TAB_TIP[1])
    bendLid(pack.lidGeometry, d > 0.004 ? pull : null, 0.11)
    stage.requestRender()
  }

  /** Pointer position on the lid plane, kept to pulls that go across the pack (never outward). */
  const pullFromPointer = (clientX: number, clientY: number, out: [number, number]) => {
    const rect = canvas.getBoundingClientRect()
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(ndc, stage.camera)
    if (!raycaster.ray.intersectPlane(lidPlane, hit)) return false
    out[0] = hit.x
    out[1] = hit.z
    return true
  }
  const constrain = (p: [number, number]) => {
    const dx = p[0] - TAB_TIP[0]
    const dz = p[1] - TAB_TIP[1]
    let along = dx * TAB_INWARD[0] + dz * TAB_INWARD[1]
    let side = -dx * TAB_INWARD[1] + dz * TAB_INWARD[0]
    along = Math.max(0, along)
    const maxSide = along * 0.9
    side = Math.max(-maxSide, Math.min(maxSide, side))
    const len = Math.hypot(along, side)
    const limit = PEEL_DIAGONAL * 1.05
    if (len > limit) {
      along *= limit / len
      side *= limit / len
    }
    p[0] = TAB_TIP[0] + along * TAB_INWARD[0] - side * TAB_INWARD[1]
    p[1] = TAB_TIP[1] + along * TAB_INWARD[1] + side * TAB_INWARD[0]
  }

  const resetLid = () => {
    pack.lid.position.set(0, lidY, 0)
    pack.lid.rotation.set(0, 0, 0)
    pack.lid.visible = true
    pack.setLidOpacity(1)
    pull[0] = TAB_TIP[0]
    pull[1] = TAB_TIP[1]
    apply()
  }

  const tick = (now: number) => {
    loop = 0
    const t = now / 1000
    if (mode === 'back') {
      const u = clamp01((now - animStart) / 380)
      const e = easeOut(u)
      pull[0] = from[0] + (TAB_TIP[0] - from[0]) * e
      pull[1] = from[1] + (TAB_TIP[1] - from[1]) * e
      apply()
      if (u >= 1) mode = 'idle'
    } else if (mode === 'fly') {
      const u = clamp01((now - animStart) / (options.reducedMotion ? 260 : 900))
      const dx = from[0] - TAB_TIP[0]
      const dz = from[1] - TAB_TIP[1]
      const len = Math.hypot(dx, dz) || 1
      if (!options.reducedMotion) {
        // Keep pulling the same way until the whole sheet has rolled over, while it lifts off.
        const reach = len + (PEEL_DIAGONAL * 1.3 - len) * easeOut(clamp01(u / 0.7))
        pull[0] = TAB_TIP[0] + (dx / len) * reach
        pull[1] = TAB_TIP[1] + (dz / len) * reach
        const away = u * u
        pack.lid.position.set((dx / len) * away * 2.4, lidY + away * 1.1, (dz / len) * away * 2.4)
        pack.lid.rotation.set(-away * 0.5, away * 0.35, away * 0.25)
        bendLid(pack.lidGeometry, pull, 0.11 + away * 0.25)
      }
      pack.setLidOpacity(1 - clamp01((u - (options.reducedMotion ? 0 : 0.5)) / (options.reducedMotion ? 1 : 0.5)))
      stage.requestRender()
      if (u >= 1) {
        mode = 'gone'
        pack.lid.visible = false
        stage.requestRender()
        options.onDone()
      }
    } else if (mode === 'idle' && !touched && visible && !options.reducedMotion) {
      // Every few seconds the tab lifts and settles, to show it can be pulled.
      const phase = (t % 3.4) / 1.15
      const lift = phase < 1 ? Math.pow(Math.sin(phase * Math.PI), 2) * 0.24 : 0
      const next0 = TAB_TIP[0] + TAB_INWARD[0] * lift
      if (Math.abs(next0 - pull[0]) > 1e-5) {
        pull[0] = next0
        pull[1] = TAB_TIP[1] + TAB_INWARD[1] * lift
        apply()
      }
    }
    run()
  }
  const run = () => {
    const wanted = mode === 'back' || mode === 'fly' || (mode === 'idle' && !touched && visible && !options.reducedMotion)
    if (wanted && !loop) loop = requestAnimationFrame(tick)
  }

  const onDown = (e: PointerEvent) => {
    if (mode === 'gone' || mode === 'fly' || (e.pointerType === 'mouse' && e.button !== 0)) return
    const p: [number, number] = [0, 0]
    if (!pullFromPointer(e.clientX, e.clientY, p)) return
    // Remember where on the tab the finger landed, so the tip does not jump under it.
    grabOffset[0] = pull[0] - p[0]
    grabOffset[1] = pull[1] - p[1]
    mode = 'drag'
    touched = true
    if (hint) hint.dataset.hidden = 'true'
    grab.setPointerCapture(e.pointerId)
    grab.dataset.dragging = 'true'
    e.preventDefault()
  }
  const onMove = (e: PointerEvent) => {
    if (mode !== 'drag') return
    if (!pullFromPointer(e.clientX, e.clientY, pull)) return
    pull[0] += grabOffset[0]
    pull[1] += grabOffset[1]
    constrain(pull)
    apply()
  }
  const onUp = () => {
    if (mode !== 'drag') return
    delete grab.dataset.dragging
    from[0] = pull[0]
    from[1] = pull[1]
    animStart = performance.now()
    const far = Math.hypot(pull[0] - TAB_TIP[0], pull[1] - TAB_TIP[1]) > PEEL_DIAGONAL * 0.55
    mode = far ? 'fly' : 'back'
    run()
  }
  // With a mouse, the room the foil mirrors turns a little with the pointer, so the glints travel.
  const onHover = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || options.reducedMotion) return
    const rect = canvas.getBoundingClientRect()
    stage.scene.environmentRotation.set(((e.clientY - rect.top) / rect.height - 0.5) * 0.25, ((e.clientX - rect.left) / rect.width - 0.5) * 0.7, 0)
    stage.requestRender()
  }
  const hoverTarget = canvas.parentElement ?? canvas
  grab.addEventListener('pointerdown', onDown)
  grab.addEventListener('pointermove', onMove)
  grab.addEventListener('pointerup', onUp)
  grab.addEventListener('pointercancel', onUp)
  hoverTarget.addEventListener('pointermove', onHover)

  run()

  return {
    resize: (width, height) => {
      const ox = PACK.hx + PACK.flange
      const oz = PACK.hz + PACK.flange
      const points = [
        new Vector3(-ox, lidY, -oz),
        new Vector3(ox, lidY, -oz),
        new Vector3(ox, lidY, oz),
        new Vector3(-ox, lidY, oz),
        new Vector3(-ox, 0, oz),
        new Vector3(ox, 0, oz),
        tipWorld,
      ]
      stage.fit(width, height, points, peelPadding(width))
      // Put the grab zone over the tab corner and the hint just outside it.
      const [tx, ty] = stage.toScreen(tipWorld)
      const [cx] = stage.toScreen(new Vector3(0, lidY, 0))
      const size = Math.max(96, Math.abs(cx - tx) * 0.95)
      grab.style.width = `${size}px`
      grab.style.height = `${size}px`
      grab.style.left = `${tx - size * 0.3}px`
      grab.style.top = `${ty - size * 0.7}px`
      if (hint) {
        hint.style.left = `${tx}px`
        hint.style.top = `${ty}px`
      }
    },
    reset: () => {
      mode = 'idle'
      resetLid()
      run()
    },
    peelNow: () => {
      if (mode !== 'idle') return
      touched = true
      if (hint) hint.dataset.hidden = 'true'
      from[0] = TAB_TIP[0] + TAB_INWARD[0] * 0.02
      from[1] = TAB_TIP[1] + TAB_INWARD[1] * 0.02
      animStart = performance.now()
      mode = 'fly'
      run()
    },
    setVisible: (v) => {
      visible = v
      run()
    },
    dispose: () => {
      cancelAnimationFrame(loop)
      grab.removeEventListener('pointerdown', onDown)
      grab.removeEventListener('pointermove', onMove)
      grab.removeEventListener('pointerup', onUp)
      grab.removeEventListener('pointercancel', onUp)
      hoverTarget.removeEventListener('pointermove', onHover)
      stage.dispose()
    },
  }
}
