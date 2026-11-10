// Outline of the Nikou "N" mark, traced from the official 512x512 logo PNG.
// Used for the vector logo fallback and the extruded 3D mark.
export const BRAND_MARK_VIEWBOX = 512
export const BRAND_MARK_POINTS: ReadonlyArray<readonly [number, number]> = [[33, 2], [37, 2], [45, 8], [369, 298], [378, 300], [385, 294], [384, 218], [379, 214], [373, 214], [354, 229], [287, 167], [466, 7], [473, 2], [481, 5], [481, 509], [479, 511], [471, 511], [466, 507], [137, 214], [131, 214], [125, 220], [126, 296], [131, 300], [137, 300], [155, 285], [223, 347], [44, 507], [39, 511], [31, 511], [29, 509], [28, 7], [32, 3]] as const

export const BRAND_MARK_PATH =
  'M' + BRAND_MARK_POINTS.map(([x, y]) => `${x} ${y}`).join(' L') + ' Z'
