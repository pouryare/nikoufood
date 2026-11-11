import { IRAN_MAP_VIEWBOX, IRAN_PROVINCE_SHAPES } from '@/data/iran-provinces'
import { cn } from '@/lib/cn'
import type { MapViewProps } from './types'

/** A gentle arc between two points, bulging "up" the page so routes read as flights from the hub. */
export function routePath(ax: number, ay: number, bx: number, by: number) {
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  const lift = Math.hypot(bx - ax, by - ay) * 0.22
  return `M${ax.toFixed(1)} ${ay.toFixed(1)}Q${mx.toFixed(1)} ${(my - lift).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`
}

/** The flat map: works everywhere, and is what phones and reduced-motion visitors always see. */
export function IranMapFlat({ provinces, hubSlug, selected, hovered, onHover, onSelect, label }: MapViewProps & { label: string }) {
  const hub = IRAN_PROVINCE_SHAPES.find((p) => p.slug === hubSlug)
  return (
    <svg viewBox={`0 0 ${IRAN_MAP_VIEWBOX.width} ${IRAN_MAP_VIEWBOX.height}`} className="iran-map" role="group" aria-label={label}>
      <g className="iran-map-land">
        {IRAN_PROVINCE_SHAPES.map((shape) => {
          const province = provinces[shape.slug]
          return (
            <path
              key={shape.slug}
              d={shape.d}
              data-coverage={province?.coverage ?? 'soon'}
              className={cn(selected === shape.slug && 'is-selected', hovered === shape.slug && 'is-hovered')}
              onPointerEnter={() => onHover(shape.slug)}
              onPointerLeave={() => onHover(null)}
              onClick={() => onSelect(shape.slug)}
            >
              <title>{province?.name ?? shape.name}</title>
            </path>
          )
        })}
      </g>
      {hub ? (
        <g className="iran-map-routes" aria-hidden>
          {IRAN_PROVINCE_SHAPES.filter((p) => p.slug !== hubSlug).map((shape, i) => {
            const d = routePath(hub.cx, hub.cy, shape.cx, shape.cy)
            const active = selected === shape.slug || hovered === shape.slug
            return (
              <g key={shape.slug} className={cn(active && 'is-active')}>
                <path d={d} className="iran-map-route" />
                <path d={d} pathLength={1} className="iran-map-pulse" style={{ animationDelay: `${(i * 0.37) % 4.2}s` }} />
                <circle cx={shape.cx} cy={shape.cy} r={2.4} className="iran-map-node" />
              </g>
            )
          })}
          <circle cx={hub.cx} cy={hub.cy} r={5} className="iran-map-hub-ring" />
          <circle cx={hub.cx} cy={hub.cy} r={4.2} className="iran-map-hub" />
        </g>
      ) : null}
    </svg>
  )
}
