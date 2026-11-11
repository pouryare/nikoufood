import type { CSSProperties } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { ButtonLink } from '@/components/ui/Button'
import { Marquee } from '@/components/ui/Marquee'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getMarkets, getProducts, getSiteSettings, getUi, productPicture, related } from '@/lib/cms'

type Props = {
  head: { eyebrow?: string | null; title?: string | null; text?: string | null }
  ctaLabel?: string | null
  showMarkets?: boolean
}

/** The products picked for the home page, then a slow band naming the kinds of businesses they are made for. */
export async function ProductsSection({ head, ctaLabel, showMarkets = true }: Props) {
  const [products, settings, ui, markets] = await Promise.all([getProducts({ featured: true }), getSiteSettings(), getUi(), showMarkets ? getMarkets() : []])
  if (products.length === 0) return null

  return (
    <section className="pt-[clamp(4.5rem,10vw,9.5rem)]">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <SectionHeading {...head} />
          {ctaLabel ? (
            <div data-reveal className="max-md:hidden">
              <ButtonLink href="/products" variant="outline">
                {ctaLabel}
              </ButtonLink>
            </div>
          ) : null}
        </div>

        <ul className="product-rail mt-12">
          {products.map((product, i) => (
            <li key={product.id} data-reveal style={{ '--i': i % 4 } as CSSProperties}>
              <ProductCard
                product={{
                  slug: product.slug,
                  name: product.name,
                  brand: related(product.brand)?.name,
                  tags: [related(product.category)?.name, related(product.fatType)?.name],
                  image: productPicture(product, settings).media,
                }}
              />
            </li>
          ))}
        </ul>

        {ctaLabel ? (
          <div className="mt-6 md:hidden">
            <ButtonLink href="/products" variant="outline" className="w-full">
              {ctaLabel}
            </ButtonLink>
          </div>
        ) : null}
      </div>

      <Marquee className="mt-[clamp(3.5rem,8vw,7rem)]" label={ui.products.markets} items={markets.map((market) => market.name)} />
    </section>
  )
}
