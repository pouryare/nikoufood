export type Coverage = 'direct' | 'covered' | 'open' | 'soon'

export type MapProvince = { slug: string; name: string; coverage: Coverage; note?: string | null }

export type MapViewProps = {
  provinces: Record<string, MapProvince>
  hubSlug: string
  selected: string | null
  hovered: string | null
  onHover: (slug: string | null) => void
  onSelect: (slug: string) => void
}

/** Fill colours per coverage status; the same values feed the flat map, the 3D map and the legend. */
export const COVERAGE_ORDER: Coverage[] = ['direct', 'covered', 'open', 'soon']
