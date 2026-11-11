'use client'

import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import type { Scene, Texture } from 'three'
import { createStudioEnvironment, STUDIO_LIGHTS } from '@/three/studio'

/** R3F hands out the live three.js scene; the studio lighting is attached to it here. */
const setEnvironment = (scene: Scene, texture: Texture | null) => {
  scene.environment = texture
}

type Props = { accentFrom?: string; accentTo?: string; intensity?: number }

/** Puts the shared code-built photo studio (see `three/studio.ts`) into an R3F scene. */
export function StudioLights({ accentFrom, accentTo, intensity = 1 }: Props) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const invalidate = useThree((s) => s.invalidate)

  useLayoutEffect(() => {
    const studio = createStudioEnvironment(gl, { accentFrom, accentTo, intensity })
    setEnvironment(scene, studio.texture)
    invalidate()
    return () => {
      setEnvironment(scene, null)
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
