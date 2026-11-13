import { SectionHeading } from '@/components/ui/SectionHeading'
import { getMarkets, getUi, related } from '@/lib/cms'
import { KITCHEN_SCENES, KITCHEN_TEXTS } from '@/lib/home-defaults'
import { MARKET_ICONS, taxonomyIcon } from '@/lib/icons'
import type { HomePage, Market } from '@/payload-types'
import { KitchenDay, type KitchenMeal } from './KitchenDay'

type Props = { day: NonNullable<HomePage['kitchenDay']> }

/** «یک روز در آشپزخانه»: the heading, then a day that plays by itself in a kitchen window over Tehran. */
export async function KitchenDaySection({ day }: Props) {
  if (day.enabled === false) return null
  const [markets, ui] = await Promise.all([getMarkets(), getUi()])
  const market = (m: Market | null | undefined) => (m ? { name: m.name, icon: taxonomyIcon(m, MARKET_ICONS) ?? 'store' } : null)

  const own = (day.scenes ?? []).filter((s) => s.title)
  const meals: KitchenMeal[] = own.length
    ? own.map((s) => ({ time: s.time, title: s.title, text: s.text, market: market(related(s.market)), link: s.link?.label && s.link.href ? s.link : null }))
    : KITCHEN_SCENES.map((s) => ({ ...s, market: market(markets.find((m) => m.slug === s.market)) }))
  const head = day.title || day.eyebrow || day.text ? day : KITCHEN_TEXTS

  return (
    <section className="section-y" data-mood="kitchen">
      <div className="wrap">
        <SectionHeading eyebrow={head.eyebrow} title={head.title} text={head.text} />
        <div data-reveal className="mt-12">
          <KitchenDay meals={meals.slice(0, 3)} seconds={day.seconds ?? 21} labels={{ play: ui.toys.play, pause: ui.toys.pause }} />
        </div>
      </div>
    </section>
  )
}
