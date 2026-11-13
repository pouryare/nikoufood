import { SectionHeading } from '@/components/ui/SectionHeading'
import { getMarkets, getProducts, getSiteSettings, productPicture, related } from '@/lib/cms'
import { FINDER_TEXTS } from '@/lib/home-defaults'
import { MARKET_ICONS, taxonomyIcon } from '@/lib/icons'
import { productTags } from '@/lib/product-tags'
import type { HomePage } from '@/payload-types'
import { MarketFinder, type FinderMarket, type FinderProduct } from './MarketFinder'

type Props = { finder: NonNullable<HomePage['finder']>; butterStop?: boolean }

/**
 * «کسب‌وکار شما چیست؟»: every market the company serves as one big, calm list. Choosing one shows
 * the products marked for it in the CMS (محصولات › بازارهای هدف), so the list stays true by itself.
 */
export async function FinderSection({ finder, butterStop }: Props) {
  if (finder.enabled === false) return null
  const [markets, products, settings] = await Promise.all([
    getMarkets(),
    getProducts(),
    getSiteSettings(),
  ])
  if (markets.length === 0) return null

  const empty = !finder.eyebrow && !finder.title && !finder.text
  const head = empty
    ? FINDER_TEXTS
    : { eyebrow: finder.eyebrow, title: finder.title, text: finder.text }
  const cta = finder.cta?.label ? finder.cta : empty ? FINDER_TEXTS.cta : null

  const list: FinderProduct[] = products.map((product) => ({
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    brand: related(product.brand)?.name ?? null,
    image: productPicture(product, settings).media,
    tags: productTags(product),
  }))
  const marketsOf = (product: (typeof products)[number]) =>
    (product.markets ?? []).map((m) => String(typeof m === 'object' && m ? m.id : m))
  const rows: FinderMarket[] = markets.map((market) => ({
    id: String(market.id),
    name: market.name,
    icon: taxonomyIcon(market, MARKET_ICONS) ?? 'building',
    productIds: products
      .filter((product) => marketsOf(product).includes(String(market.id)))
      .map((product) => String(product.id)),
  }))

  return (
    <section className="section-y" data-mood="finder">
      <div className="wrap">
        <div className="relative w-fit max-w-full">
          <SectionHeading eyebrow={head.eyebrow} title={head.title} text={head.text} />
          {butterStop ? (
            <span
              aria-hidden
              data-butter-stop="finder"
              className="butter-stop"
              style={{ left: '-3.5rem', top: '58%' }}
            />
          ) : null}
        </div>
        <MarketFinder
          markets={rows}
          products={list}
          emptyText={finder.emptyText || FINDER_TEXTS.emptyText}
          cta={cta?.label ? { label: cta.label, href: cta.href || '/partnership' } : null}
          groupLabel={head.title || FINDER_TEXTS.title}
        />
      </div>
    </section>
  )
}
