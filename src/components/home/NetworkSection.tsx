import { NetworkMap, type NetworkMapLabels } from '@/components/map/NetworkMap'
import type { Coverage } from '@/components/map/types'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { RoutePin, type RouteStep } from './RoutePin'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getNetworkPage, getProvinces, getPublicRepresentatives, getSiteSettings, getTheme, getUi, mediaOf } from '@/lib/cms'
import { themeColors } from '@/lib/theme'

type Head = { eyebrow?: string | null; title?: string | null; text?: string | null }
type Card = { title?: string | null; text?: string | null }

/** Mixes two hex colours (the 3D map needs plain colours, not CSS color-mix). */
function mix(a: string, b: string, t: number) {
  const p = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  const [x, y] = [p(a), p(b)]
  return `#${x.map((v, i) => Math.round(v * t + y[i] * (1 - t)).toString(16).padStart(2, '0')).join('')}`
}

/** The coverage map with its heading and the two "how we distribute" cards. Used on the home page and the network page. */
export async function NetworkSection({
  head,
  tehran,
  others,
  cta,
  as = 'h2',
  route,
}: {
  head: Head
  tehran?: Card
  others?: Card
  cta?: { label?: string | null; href: string }
  as?: 'h1' | 'h2'
  /** The golden route from packing to the kitchen; it replaces the two cards (home page only). */
  route?: { steps: RouteStep[]; label: string } | null
}) {
  const [provinces, reps, network, ui, theme, settings] = await Promise.all([getProvinces(), getPublicRepresentatives(), getNetworkPage(), getUi(), getTheme(), getSiteSettings()])
  const c = themeColors(theme)
  const labels: NetworkMapLabels = { ...ui.network }
  const cards = [
    { ...tehran, icon: 'truck' as const },
    { ...others, icon: 'users' as const },
  ].filter((card) => card.title)

  return (
    <section className="section-y" data-mood="network">
      <div className="wrap">
        <SectionHeading {...head} as={as} />
        {route && route.steps.length ? (
          <RoutePin steps={route.steps} label={route.label} />
        ) : cards.length ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {cards.map((card, i) => (
              <div key={card.title} data-reveal style={{ '--i': i } as React.CSSProperties} className="panel flex gap-5 p-6 md:p-8">
                <span className="grid size-12 flex-none place-items-center rounded-full border border-gold/40 text-gold">
                  <Icon name={card.icon} size={22} />
                </span>
                <div>
                  <h3 className="text-[1.25rem] font-bold">{card.title}</h3>
                  {card.text ? <p className="mt-2 text-muted">{card.text}</p> : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-[clamp(2.5rem,6vw,5rem)]" data-reveal>
          <NetworkMap
            provinces={provinces.map((p) => ({ slug: p.slug, name: p.name, coverage: p.coverage as Coverage, note: p.publicNote }))}
            labels={labels}
            partner={{ name: network.tehran?.partnerName, logo: mediaOf(network.tehran?.partnerLogo), url: network.tehran?.partnerUrl }}
            representatives={reps}
            enable3D={settings.enable3D !== false}
            colors={{
              direct: c.primary,
              covered: mix(c.primary, c.surfaceRaised, 0.52),
              open: mix(c.accent, c.surfaceRaised, 0.24),
              soon: c.surface,
              gold: c.primary,
              glow: mix(c.primary, c.secondary, 0.5),
              edge: c.background,
            }}
          />
        </div>
        {cta?.label ? (
          <div className="mt-12 flex justify-center">
            <ButtonLink href={cta.href} variant="outline">
              {cta.label}
            </ButtonLink>
          </div>
        ) : null}
      </div>
    </section>
  )
}
