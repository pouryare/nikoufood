import type { CSSProperties } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { ButtonLink } from '@/components/ui/Button'
import { Marquee } from '@/components/ui/Marquee'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getMarkets, getProducts, getSiteSettings, getUi, productPicture, related } from '@/lib/cms'
import { toFa } from '@/lib/format'
import { productTags } from '@/lib/product-tags'
import { ShowroomPin } from './ShowroomPin'

type Props = {
  head: { eyebrow?: string | null; title?: string | null; text?: string | null }
  ctaLabel?: string | null
  showMarkets?: boolean
  /** On a computer the cards glide sideways while the section holds still (تنظیمات سایت › جلوه‌های ویژه). */
  showroom?: boolean
}

/** The products picked for the home page, then (unless the market finder replaces it) a slow band naming the businesses they suit. */
export async function ProductsSection({ head, ctaLabel, showMarkets = true, showroom = false }: Props) {
  const [products, settings, ui, markets] = await Promise.all([getProducts({ featured: true }), getSiteSettings(), getUi(), showMarkets ? getMarkets() : []])
  if (products.length === 0) return null

  const button = (className?: string) =>
    ctaLabel ? (
      <ButtonLink href="/products" variant="outline" className={className}>
        {ctaLabel}
      </ButtonLink>
    ) : null

  const cards = (
    <ul className={showroom ? 'product-rail showroom-track' : 'product-rail mt-12'}>
      {products.map((product, i) => (
        <li key={product.id} data-reveal style={{ '--i': i % 4 } as CSSProperties}>
          <ProductCard
            product={{
              slug: product.slug,
              name: product.name,
              brand: related(product.brand)?.name,
              tags: productTags(product),
              image: productPicture(product, settings).media,
            }}
          />
        </li>
      ))}
    </ul>
  )

  const heading = (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
      <SectionHeading {...head} />
      {ctaLabel ? (
        <div data-reveal className="max-md:hidden">
          {button()}
        </div>
      ) : null}
    </div>
  )

  const marquee = showMarkets ? <Marquee className="mt-[clamp(3.5rem,8vw,7rem)]" label={ui.products.markets} items={markets.map((market) => market.name)} /> : null

  if (showroom) {
    return (
      <>
        <ShowroomPin total={products.length} className="showroom pt-[clamp(4.5rem,10vw,9.5rem)]">
          <div className="showroom-stage">
            <div className="wrap">
              {heading}
              <div className="showroom-window mt-12">{cards}</div>
              <div aria-hidden className="showroom-foot">
                <span className="showroom-count">
                  <b data-show-now>{toFa(1)}</b> / {toFa(products.length)}
                </span>
                <span className="showroom-bar">
                  <i />
                </span>
              </div>
              {ctaLabel ? <div className="mt-6 md:hidden">{button('w-full')}</div> : null}
            </div>
          </div>
        </ShowroomPin>
        {marquee}
      </>
    )
  }

  return (
    <section className="pt-[clamp(4.5rem,10vw,9.5rem)]">
      <div className="wrap">
        {heading}
        {cards}
        {ctaLabel ? <div className="mt-6 md:hidden">{button('w-full')}</div> : null}
      </div>
      {marquee}
    </section>
  )
}
