'use client'

import { Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { MathUtils, type Group } from 'three'
import { BUTTER_MATERIAL, createButterCurlGeometry, CURL_REST_ROTATION } from '@/three/butter'
import { StudioLights } from './StudioLights'

export type HeroSceneProps = {
  /** Pointer position over the page, -1…1 on both axes. */
  pointer: RefObject<{ x: number; y: number }>
  /** How far the hero has been scrolled away, 0…1. */
  progress: RefObject<number>
  active: boolean
  lowPower?: boolean
  accentFrom?: string
  accentTo?: string
  onReady?: () => void
}

function Curl({ pointer, progress, lowPower, onReady }: Pick<HeroSceneProps, 'pointer' | 'progress' | 'lowPower' | 'onReady'>) {
  const group = useRef<Group>(null)
  const announced = useRef(false)
  const geometry = useMemo(
    () => createButterCurlGeometry(lowPower ? { segmentsU: 200, segmentsV: 84 } : undefined),
    [lowPower],
  )
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    if (!announced.current) {
      // The first real frame is on screen: the still image underneath can fade away.
      announced.current = true
      onReady?.()
    }
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)
    const p = progress.current ?? 0
    const px = pointer.current?.x ?? 0
    const py = pointer.current?.y ?? 0
    // Lean toward the cursor, breathe a little, and roll away as the page scrolls on.
    const sway = Math.sin(t * 0.42) * 0.16
    g.rotation.x = MathUtils.damp(g.rotation.x, CURL_REST_ROTATION[0] - py * 0.3 + p * 0.6, 3.2, dt)
    g.rotation.y = MathUtils.damp(g.rotation.y, CURL_REST_ROTATION[1] + px * 0.55 + sway + p * 2.1, 3.2, dt)
    g.rotation.z = CURL_REST_ROTATION[2] + Math.sin(t * 0.45) * 0.035
    g.position.y = Math.sin(t * 0.8) * 0.05 - p * 0.3
    g.scale.setScalar(MathUtils.damp(g.scale.x, 1 + p * 0.18, 4, dt))
  })

  return (
    <group ref={group} rotation={CURL_REST_ROTATION}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial {...BUTTER_MATERIAL} />
      </mesh>
    </group>
  )
}

export default function ButterHeroScene({ pointer, progress, active, lowPower, accentFrom, accentTo, onReady }: HeroSceneProps) {
  return (
    <Canvas
      dpr={lowPower ? [1, 1.3] : [1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, position: [0, 0, 6.4], near: 0.1, far: 40 }}
      frameloop={active ? 'always' : 'never'}
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      <StudioLights accentFrom={accentFrom} accentTo={accentTo} />
      <Curl pointer={pointer} progress={progress} lowPower={lowPower} onReady={onReady} />
      {lowPower ? null : <Sparkles count={34} scale={[6.5, 4.2, 3]} size={2.2} speed={0.2} opacity={0.5} color="#ffe6a8" noise={0.6} />}
    </Canvas>
  )
}
