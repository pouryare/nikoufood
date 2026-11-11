import { BufferGeometry, Float32BufferAttribute } from 'three'

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export type CurlOptions = {
  /** How many times the shaving rolls around itself. */
  turns?: number
  segmentsU?: number
  segmentsV?: number
  width?: number
  thickness?: number
  innerRadius?: number
  /** How quickly the spiral opens up. */
  growth?: number
  /** The fine ribs a butter curler leaves on the outside. */
  ridges?: number
  ridgeDepth?: number
  /** How far the shaving slides sideways while it rolls (a slight corkscrew, like a real curl). */
  drift?: number
}

/**
 * A butter curl: a thin ribbon rolled into an open spiral, ribbed on the outside,
 * thinning out towards its edges and both ends like a real shaving.
 * Built as one closed, smooth-shaded mesh (outer skin + inner skin + rounded rims).
 */
export function createButterCurlGeometry(options: CurlOptions = {}): BufferGeometry {
  const {
    turns = 1.42,
    segmentsU = 300,
    segmentsV = 112,
    width = 1.5,
    thickness = 0.1,
    innerRadius = 0.33,
    growth = 0.084,
    ridges = 14,
    ridgeDepth = 0.02,
    drift = 0.34,
  } = options

  const thetaMax = turns * Math.PI * 2
  const rows = segmentsU + 1
  const cols = segmentsV + 1
  const skin = rows * cols
  const positions = new Float32Array(skin * 2 * 3)
  const uvs = new Float32Array(skin * 2 * 2)

  const write = (index: number, u: number, v: number, side: 1 | -1) => {
    const theta = u * thetaMax
    const taper = smooth(0, 0.1, u) * smooth(1, 0.88, u) // 0 at both ends, 1 along the body
    const r = innerRadius + growth * theta
    const wobble = 1 + 0.03 * Math.sin(theta * 2.3 + 0.7) + 0.018 * Math.sin(theta * 5.1 + 2.0)
    const w = width * (0.8 + 0.2 * taper) * wobble
    const z = (v - 0.5) * w + 0.06 * Math.sin(theta * 0.9 + 0.4) + drift * (u - 0.5)
    const lip = Math.pow(Math.sin(v * Math.PI), 0.4) // 0 on the two long edges
    const t = thickness * (0.22 + 0.78 * taper) * (0.3 + 0.7 * lip)
    const ridge = side > 0 ? ridgeDepth * (0.5 - 0.5 * Math.cos(v * ridges * Math.PI * 2)) * taper * lip : 0
    const rr = r + side * t * 0.5 + ridge
    positions[index * 3] = Math.cos(theta) * rr
    positions[index * 3 + 1] = Math.sin(theta) * rr
    positions[index * 3 + 2] = z
    uvs[index * 2] = u * 6
    uvs[index * 2 + 1] = v
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const u = i / segmentsU
      const v = j / segmentsV
      write(i * cols + j, u, v, 1)
      write(skin + i * cols + j, u, v, -1)
    }
  }

  const indices: number[] = []
  const O = (i: number, j: number) => i * cols + j
  const I = (i: number, j: number) => skin + i * cols + j

  for (let i = 0; i < segmentsU; i++) {
    for (let j = 0; j < segmentsV; j++) {
      // outer skin faces away from the spiral's centre, inner skin towards it
      indices.push(O(i, j), O(i + 1, j), O(i, j + 1), O(i + 1, j), O(i + 1, j + 1), O(i, j + 1))
      indices.push(I(i, j), I(i, j + 1), I(i + 1, j), I(i + 1, j), I(i, j + 1), I(i + 1, j + 1))
    }
    // the two long rims
    indices.push(O(i, 0), I(i, 0), O(i + 1, 0), I(i, 0), I(i + 1, 0), O(i + 1, 0))
    const e = segmentsV
    indices.push(O(i, e), O(i + 1, e), I(i, e), I(i, e), O(i + 1, e), I(i + 1, e))
  }
  for (let j = 0; j < segmentsV; j++) {
    // the two ends of the ribbon
    indices.push(O(0, j), O(0, j + 1), I(0, j), O(0, j + 1), I(0, j + 1), I(0, j))
    const e = segmentsU
    indices.push(O(e, j), I(e, j), O(e, j + 1), O(e, j + 1), I(e, j), I(e, j + 1))
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

/** Shared look of the butter so the hero, posters and the film placeholder all match. */
export const BUTTER_MATERIAL = {
  color: '#f0b535',
  roughness: 0.38,
  metalness: 0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.4,
  sheen: 0.8,
  sheenRoughness: 0.5,
  sheenColor: '#ffdf8f',
  emissive: '#8a4a00',
  emissiveIntensity: 0.3,
  envMapIntensity: 0.95,
} as const

/** Resting pose of the hero curl (radians). The static poster is rendered in exactly this pose. */
export const CURL_REST_ROTATION: [number, number, number] = [0.5, -0.72, 0.2]
