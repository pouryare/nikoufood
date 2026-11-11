'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, type RefObject } from 'react'
import { Color, ExtrudeGeometry, Float32BufferAttribute, MathUtils, Shape } from 'three'
import type { Group } from 'three'
import { useRef } from 'react'
import { BRAND_MARK_POINTS, BRAND_MARK_VIEWBOX } from '@/data/brand-mark'
import { StudioLights } from './StudioLights'

type SceneProps = {
  pointer: RefObject<{ x: number; y: number }>
  accentFrom: string
  accentTo: string
  onReady?: () => void
}

/** The N of the logo as a solid: the flat outline pushed into depth, rounded at the edges, coloured with the logo gradient. */
function createMarkGeometry(from: string, to: string) {
  const half = BRAND_MARK_VIEWBOX / 2
  const shape = new Shape()
  BRAND_MARK_POINTS.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x - half, half - y) : shape.lineTo(x - half, half - y)))
  shape.closePath()
  const geometry = new ExtrudeGeometry(shape, { depth: 64, steps: 1, bevelEnabled: true, bevelThickness: 10, bevelSize: 8, bevelSegments: 4 })
  geometry.center()
  geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  const position = geometry.attributes.position
  const colors = new Float32Array(position.count * 3)
  const a = new Color(from)
  const b = new Color(to)
  const mixed = new Color()
  for (let i = 0; i < position.count; i++) {
    const t = MathUtils.clamp((position.getX(i) - box.min.x) / (box.max.x - box.min.x), 0, 1)
    mixed.copy(a).lerp(b, t)
    colors.set([mixed.r, mixed.g, mixed.b], i * 3)
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  return geometry
}

function Mark({ pointer, accentFrom, accentTo, onReady }: SceneProps) {
  const group = useRef<Group>(null)
  const announced = useRef(false)
  const geometry = useMemo(() => createMarkGeometry(accentFrom, accentTo), [accentFrom, accentTo])
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    if (!announced.current) {
      announced.current = true
      onReady?.()
    }
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    // Turns slowly on its own and follows the pointer; the pointer takes over smoothly when it moves.
    g.rotation.y = MathUtils.damp(g.rotation.y, -0.5 + Math.sin(t * 0.35) * 0.28 + (pointer.current?.x ?? 0) * 0.55, 3, dt)
    g.rotation.x = MathUtils.damp(g.rotation.x, 0.12 - (pointer.current?.y ?? 0) * 0.3, 3, dt)
    g.position.y = Math.sin(t * 0.8) * 0.06
  })

  return (
    <group ref={group} scale={0.0074}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial vertexColors metalness={0.25} roughness={0.28} clearcoat={0.9} clearcoatRoughness={0.18} envMapIntensity={1.15} />
      </mesh>
    </group>
  )
}

export default function BrandMarkScene(props: SceneProps & { active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, position: [0, 0, 10], near: 0.1, far: 40 }}
      frameloop={props.active ? 'always' : 'never'}
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      <StudioLights accentFrom={props.accentFrom} accentTo={props.accentTo} />
      <Mark {...props} />
    </Canvas>
  )
}
