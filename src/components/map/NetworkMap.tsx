'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { hasWebGL, isLowPower, prefersReducedMotion, wantsLessData, whenIdle } from '@/lib/webgl'
import type { Map3DColors } from './IranMap3D'
import { IranMapFlat } from './IranMapFlat'
import { COVERAGE_ORDER, type Coverage, type MapProvince } from './types'

const IranMap3D = dynamic(() => import('./IranMap3D'), { ssr: false })

export type NetworkMapLabels = Record<Coverage, string> & {
  selectProvince: string
  applyForProvince: string
  provinceList: string
  representatives: string
  mapHint: string
  mapLabel: string
  directBy: string
  sisterCompany: string
  visitWebsite: string
  hub: string
}

type Props = {
  provinces: MapProvince[]
  hubSlug?: string
  labels: NetworkMapLabels
  /** The company that distributes directly in the hub province. */
  partner?: { name?: string | null; logo?: { url: string; alt: string } | null; url?: string | null } | null
  representatives?: { id: number | string; name: string; city: string; phone: string; provinceSlug: string }[]
  representationHref?: string
  enable3D?: boolean
  colors: Map3DColors
}

/** The Iran coverage map with its info panel: live 3D on capable desktops, a flat animated map everywhere else. */
export function NetworkMap({ provinces, hubSlug = 'tehran', labels, partner, representatives = [], representationHref = '/representation', enable3D = true, colors }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const bySlug = useMemo(() => Object.fromEntries(provinces.map((p) => [p.slug, p])), [provinces])
  const [selected, setSelected] = useState<string>(bySlug[hubSlug] ? hubSlug : (provinces[0]?.slug ?? ''))
  const [hovered, setHovered] = useState<string | null>(null)
  const [mount3D, setMount3D] = useState(false)
  const [ready3D, setReady3D] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '15% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // The 3D map is for large screens with a mouse; it loads only when the section comes near.
  useEffect(() => {
    if (!enable3D || !active || mount3D) return
    if (prefersReducedMotion() || wantsLessData() || !hasWebGL() || isLowPower()) return
    if (!window.matchMedia('(min-width: 1024px)').matches) return
    return whenIdle(() => setMount3D(true), 600)
  }, [enable3D, active, mount3D])

  const shown = bySlug[hovered ?? selected] ?? bySlug[selected]
  const reps = shown ? representatives.filter((r) => r.provinceSlug === shown.slug) : []
  const view = { provinces: bySlug, hubSlug, selected, hovered, onHover: setHovered, onSelect: setSelected }

  return (
    <div ref={rootRef} className="network-map">
      <div className="network-map-stage" data-3d={ready3D ? '' : undefined}>
        <IranMapFlat {...view} label={labels.mapLabel} />
        {mount3D ? (
          <div className="network-map-3d" aria-hidden>
            <IranMap3D {...view} colors={colors} active={active} onReady={() => setReady3D(true)} />
          </div>
        ) : null}
        <p className="network-map-hint">{labels.mapHint}</p>
      </div>

      <div className="network-map-side">
        <label className="network-map-select">
          <span>{labels.provinceList}</span>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {provinces.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" size={18} />
        </label>

        {shown ? (
          <div className="network-map-card panel" aria-live="polite">
            <span className="network-map-status" data-coverage={shown.coverage}>
              {labels[shown.coverage]}
            </span>
            <h3 className="mt-4 text-h3">{shown.name}</h3>
            {shown.note ? <p className="mt-3 text-muted">{shown.note}</p> : null}

            {shown.coverage === 'direct' && partner?.name ? (
              <div className="network-map-partner">
                <span className="network-map-partner-logo">
                  {partner.logo ? <Image src={partner.logo.url} alt={partner.logo.alt || partner.name} width={96} height={96} className="size-full object-contain" /> : <span>{partner.name.slice(0, 1)}</span>}
                </span>
                <span>
                  <span className="block text-small text-muted">{labels.directBy}</span>
                  <strong className="block text-[1.15rem]">{partner.name}</strong>
                  <span className="block text-small text-muted">{labels.sisterCompany}</span>
                </span>
                {partner.url ? (
                  <a href={partner.url} target="_blank" rel="noopener" className="network-map-partner-link">
                    {labels.visitWebsite}
                    <Icon name="external" size={15} />
                  </a>
                ) : null}
              </div>
            ) : null}

            {reps.length ? (
              <div className="mt-6">
                <p className="text-small font-bold text-gold">{labels.representatives}</p>
                <ul className="mt-2 space-y-1.5 text-small">
                  {reps.map((r) => (
                    <li key={r.id}>
                      {r.name}
                      {r.city ? <span className="text-muted">، {r.city}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {shown.coverage !== 'direct' ? (
              <ButtonLink href={`${representationHref}?province=${shown.slug}`} size="md" className="mt-7 w-full sm:w-auto">
                {labels.applyForProvince}
              </ButtonLink>
            ) : null}
          </div>
        ) : null}

        <ul className="network-map-legend">
          {COVERAGE_ORDER.filter((status) => provinces.some((p) => p.coverage === status)).map((status) => (
            <li key={status}>
              <i data-coverage={status} className={cn('network-map-swatch')} />
              {labels[status]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
