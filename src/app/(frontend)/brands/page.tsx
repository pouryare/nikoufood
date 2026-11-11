import type { CSSProperties } from 'react'
import { BrandPlate } from '@/components/brands/BrandPlate'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHeader } from '@/components/ui/PageHeader'
import { getBrands, getListingPages, getProducts, getUi, mediaOf, related } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const listing = await getListingPages()
  const header = listing.brands?.header
  return pageMetadata({ title: header?.title, description: header?.intro, path: '/brands' })
}

export default async function BrandsPage() {
  const [listing, ui, brands, products] = await Promise.all([getListingPages(), getUi(), getBrands(), getProducts()])
  const header = listing.brands?.header
  const cta = listing.productCta
  const countOf = (id: number | string) => products.filter((p) => related(p.brand)?.id === id).length

  return (
    <>
      <PageHeader
        eyebrow={header?.eyebrow}
        title={header?.title ?? ui.products.brand}
        intro={header?.intro}
        homeLabel={ui.common.home}
        trail={[{ name: header?.eyebrow || header?.title || '', path: '/brands' }]}
      />
      <section className="pb-24">
        <div className="wrap">
          <ul className="brand-plates" data-lean={brands.length === 2 || brands.length === 3 ? '' : undefined} style={{ '--n': Math.min(Math.max(brands.length, 1), 3) } as CSSProperties}>
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
                    description: brand.description,
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
      <CtaBand title={cta?.title} text={cta?.text} actions={[cta?.primary, cta?.secondary]} />
    </>
  )
}
