import type { CSSProperties } from 'react'
import { BrandPlate } from '@/components/brands/BrandPlate'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getBrands, getProducts, getUi, mediaOf, related } from '@/lib/cms'

type Props = { head: { eyebrow?: string | null; title?: string | null; text?: string | null } }

/** The company's own brands as large plates that lean toward each other like an open book and straighten under the pointer. */
export async function BrandsSection({ head }: Props) {
  const [brands, products, ui] = await Promise.all([getBrands({ featured: true }), getProducts(), getUi()])
  if (brands.length === 0) return null
  const countOf = (id: number | string) => products.filter((product) => related(product.brand)?.id === id).length

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
