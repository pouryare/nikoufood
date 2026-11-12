import type { CSSProperties } from 'react'
import { BrandPlate } from '@/components/brands/BrandPlate'
import { BrandSplit, type BrandSplitItem } from '@/components/home/BrandSplit'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getBrands, getProducts, getSiteSettings, getUi, mediaOf, productPicture, related } from '@/lib/cms'

type Props = { head: { eyebrow?: string | null; title?: string | null; text?: string | null } }

/**
 * The company's own brands. Two brands share one wide split screen (each half grows under the mouse
 * and shows its products); any other number of brands shows as large plates that lean like an open book.
 */
export async function BrandsSection({ head }: Props) {
  const [brands, products, ui, settings] = await Promise.all([getBrands({ featured: true }), getProducts(), getUi(), getSiteSettings()])
  if (brands.length === 0) return null
  const productsOf = (id: number | string) => products.filter((product) => related(product.brand)?.id === id)
  const countOf = (id: number | string) => productsOf(id).length

  if (brands.length === 2) {
    const items = brands.map(
      (brand): BrandSplitItem => ({
        slug: brand.slug,
        name: brand.name,
        tagline: brand.tagline,
        logo: mediaOf(brand.logo),
        photo: mediaOf(brand.heroImage),
        color: brand.brandColor,
        productCount: countOf(brand.id),
        products: productsOf(brand.id)
          .slice(0, 3)
          .map((product) => ({ slug: product.slug, name: product.name, image: productPicture(product, settings).media })),
      }),
    ) as [BrandSplitItem, BrandSplitItem]
    return (
      <section className="section-y">
        <div className="wrap">
          <SectionHeading {...head} />
        </div>
        <div data-reveal className="mt-12">
          <BrandSplit brands={items} viewLabel={ui.products.viewBrand} countLabel={ui.products.countLabel} />
        </div>
      </section>
    )
  }

  return (
    <section className="section-y">
      <div className="wrap">
        <SectionHeading {...head} />
        <ul className="brand-plates mt-12" data-lean={brands.length === 2 || brands.length === 3 ? '' : undefined} style={{ '--n': Math.min(brands.length, 3) } as CSSProperties}>
          {brands.map((brand, i) => (
            <li key={brand.id} data-reveal style={{ '--i': i % 3 } as CSSProperties}>
              <BrandPlate
                index={i}
                viewLabel={ui.products.viewBrand}
                countLabel={ui.products.countLabel}
                brand={{
                  slug: brand.slug,
                  name: brand.name,
                  tagline: brand.tagline,
                  logo: mediaOf(brand.logo),
                  photo: mediaOf(brand.heroImage),
                  color: brand.brandColor,
                  productCount: countOf(brand.id),
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
