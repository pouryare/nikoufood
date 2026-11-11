'use client'

import { Edges, Line } from '@react-three/drei'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide, ExtrudeGeometry, MathUtils, QuadraticBezierCurve3, Vector3, type Group, type Mesh } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { IRAN_MAP_VIEWBOX, IRAN_PROVINCE_SHAPES } from '@/data/iran-provinces'
import type { Coverage, MapViewProps } from './types'

export type Map3DColors = Record<Coverage, string> & { gold: string; glow: string; edge: string }

const DEPTH: Record<Coverage, number> = { direct: 20, covered: 13, open: 7, soon: 4 }
const CX = IRAN_MAP_VIEWBOX.width / 2
const CY = IRAN_MAP_VIEWBOX.height / 2
/** Map units → scene position (the map lies flat; +z is up). */
const at = (x: number, y: number, z = 0) => new Vector3(x - CX, CY - y, z)

function useProvinceGeometries() {
  const geometries = useMemo(() => {
    const loader = new SVGLoader()
    return IRAN_PROVINCE_SHAPES.map((shape) => {
      const data = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${shape.d}"/></svg>`)
      const shapes = data.paths.flatMap((path) => path.toShapes())
      const geometry = new ExtrudeGeometry(shapes, { depth: 1, bevelEnabled: false, curveSegments: 4 })
      geometry.translate(-CX, -CY, 0)
      geometry.scale(1, -1, 1)
      geometry.computeVertexNormals()
      return { slug: shape.slug, geometry }
    })
  }, [])
  useEffect(() => () => geometries.forEach((g) => g.geometry.dispose()), [geometries])
  return geometries
}

function Province({
  geometry,
  coverage,
  color,
  highlight,
  edge,
  active,
  slug,
  onHover,
  onSelect,
}: {
  geometry: ExtrudeGeometry
  coverage: Coverage
  color: string
  highlight: string
  edge: string
  active: boolean
  slug: string
  onHover: (slug: string | null) => void
  onSelect: (slug: string) => void
}) {
  const mesh = useRef<Mesh>(null)
  useFrame((_, delta) => {
    const m = mesh.current
    if (!m) return
    // Provinces rise with their status, and a little more under the cursor.
    m.scale.z = MathUtils.damp(m.scale.z, DEPTH[coverage] + (active ? 16 : 0), 7, Math.min(delta, 0.05))
  })
  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      scale={[1, 1, 1]}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        onHover(slug)
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        onSelect(slug)
      }}
    >
      <meshStandardMaterial color={active ? highlight : color} roughness={0.55} metalness={0.25} side={DoubleSide} emissive={active ? highlight : '#000000'} emissiveIntensity={active ? 0.18 : 0} />
      {/* thin dark outlines keep neighbouring provinces apart */}
      <Edges threshold={35} color={edge} lineWidth={1} />
    </mesh>
  )
}

function Route({ from, to, color, active, phase }: { from: Vector3; to: Vector3; color: string; active: boolean; phase: number }) {
  const points = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5)
    mid.z = 26 + from.distanceTo(to) * 0.3
    return new QuadraticBezierCurve3(from, mid, to).getPoints(36)
  }, [from, to])
  const line = useRef<{ material: { dashOffset: number } }>(null)
  useFrame((state) => {
    if (line.current) line.current.material.dashOffset = -(state.clock.elapsedTime * 22 + phase)
  })
  return (
    <>
      <Line points={points} color={color} lineWidth={active ? 1.6 : 0.8} transparent opacity={active ? 0.9 : 0.22} />
      <Line ref={line as never} points={points} color={color} lineWidth={active ? 2.6 : 1.7} dashed dashSize={16} gapSize={150} transparent opacity={0.95} />
    </>
  )
}

function Scene({ provinces, hubSlug, selected, hovered, onHover, onSelect, colors }: MapViewProps & { colors: Map3DColors }) {
  const group = useRef<Group>(null)
  const geometries = useProvinceGeometries()
  const hub = IRAN_PROVINCE_SHAPES.find((p) => p.slug === hubSlug)
  const hubTop = hub ? at(hub.cx, hub.cy, DEPTH[provinces[hubSlug]?.coverage ?? 'direct'] + 3) : null

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const dt = Math.min(delta, 0.05)
    // The whole map leans a little toward the cursor.
    g.rotation.z = MathUtils.damp(g.rotation.z, state.pointer.x * 0.12, 3, dt)
    g.rotation.x = MathUtils.damp(g.rotation.x, -state.pointer.y * 0.07, 3, dt)
  })

  return (
    <group ref={group}>
      {geometries.map(({ slug, geometry }) => {
        const coverage = provinces[slug]?.coverage ?? 'soon'
        return (
          <Province
            key={slug}
            slug={slug}
            geometry={geometry}
            coverage={coverage}
            color={colors[coverage]}
            highlight={colors.glow}
            edge={colors.edge}
            active={selected === slug || hovered === slug}
            onHover={onHover}
            onSelect={onSelect}
          />
        )
      })}
      {hubTop
        ? IRAN_PROVINCE_SHAPES.filter((p) => p.slug !== hubSlug).map((shape, i) => (
            <Route
              key={shape.slug}
              from={hubTop}
              to={at(shape.cx, shape.cy, DEPTH[provinces[shape.slug]?.coverage ?? 'soon'] + 2)}
              color={colors.gold}
              active={selected === shape.slug || hovered === shape.slug}
              phase={i * 37}
            />
          ))
        : null}
      {hubTop ? (
        <mesh position={hubTop}>
          <sphereGeometry args={[5, 24, 24]} />
          <meshBasicMaterial color={colors.glow} />
        </mesh>
      ) : null}
    </group>
  )
}

export default function IranMap3D({ active, onReady, ...props }: MapViewProps & { colors: Map3DColors; active: boolean; onReady?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 32, position: [0, -720, 858], near: 10, far: 4000, up: [0, 0, 1] }}
      frameloop={active ? 'always' : 'never'}
      onCreated={({ camera }) => {
        camera.lookAt(0, -6, 0)
        onReady?.()
      }}
    >
      <ambientLight intensity={1.05} />
      <directionalLight position={[-300, -500, 700]} intensity={1.5} />
      <directionalLight position={[400, 300, 300]} intensity={0.5} color="#9fb4ff" />
      <Scene {...props} />
    </Canvas>
  )
}
