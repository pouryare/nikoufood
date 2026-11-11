'use client'

import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { createStudioEnvironment, STUDIO_LIGHTS } from '@/three/studio'

type Props = { accentFrom?: string; accentTo?: string; intensity?: number }

/** Puts the shared code-built photo studio (see `three/studio.ts`) into an R3F scene. */
export function StudioLights({ accentFrom, accentTo, intensity = 1 }: Props) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const invalidate = useThree((s) => s.invalidate)

  useLayoutEffect(() => {
    const studio = createStudioEnvironment(gl, { accentFrom, accentTo, intensity })
    scene.environment = studio.texture
    invalidate()
    return () => {
      scene.environment = null
      studio.dispose()
    }
  }, [gl, scene, invalidate, accentFrom, accentTo, intensity])

  return (
    <>
      <ambientLight color={STUDIO_LIGHTS.ambient.color} intensity={STUDIO_LIGHTS.ambient.intensity * intensity} />
      <directionalLight color={STUDIO_LIGHTS.key.color} intensity={STUDIO_LIGHTS.key.intensity * intensity} position={STUDIO_LIGHTS.key.position} />
      <directionalLight color={STUDIO_LIGHTS.kicker.color} intensity={STUDIO_LIGHTS.kicker.intensity * intensity} position={STUDIO_LIGHTS.kicker.position} />
    </>
  )
}
