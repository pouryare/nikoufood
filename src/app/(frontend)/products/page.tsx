import type { CSSProperties } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductFilters } from '@/components/products/ProductFilters'
import { ButtonLink } from '@/components/ui/Button'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHeader } from '@/components/ui/PageHeader'
import { getBrands, getCategories, getFatTypes, getListingPages, getProducts, getSiteSettings, getUi, productPicture, related } from '@/lib/cms'
import { toFa } from '@/lib/format'
import { pageMetadata } from '@/lib/seo'

type Search = Promise<{ category?: string; brand?: string; type?: string }>

const clean = (value?: string) => (value && /^[a-z0-9-]{1,80}$/.test(value) ? value : undefined)

export async function generateMetadata({ searchParams }: { searchParams: Search }) {
  const [listing, params] = await Promise.all([getListingPages(), searchParams])
  const header = listing.products?.header
  const filtered = Boolean(clean(params.category) || clean(params.brand) || clean(params.type))
  return pageMetadata({ title: header?.title, description: header?.intro, path: '/products', noIndex: filtered })
}

export default async function ProductsPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams
  const active = { category: clean(params.category), brand: clean(params.brand), type: clean(params.type) }
  const [listing, settings, ui, categories, brands, fatTypes, products, all] = await Promise.all([
    getListingPages(),
    getSiteSettings(),
    getUi(),
    getCategories(),
    getBrands(),
    getFatTypes(),
    getProducts({ category: active.category, brand: active.brand, fatType: active.type }),
    getProducts(),
  ])
  const header = listing.products?.header
  const cta = listing.productCta
  // Only offer filter values that lead somewhere, so nobody lands on an empty list.
  const used = {
    category: new Set(all.map((p) => related(p.category)?.slug)),
    brand: new Set(all.map((p) => related(p.brand)?.slug)),
    type: new Set(all.map((p) => related(p.fatType)?.slug)),
  }
  const groups = [
    { key: 'category' as const, label: ui.products.category, options: categories.filter((c) => used.category.has(c.slug)).map((c) => ({ slug: c.slug, name: c.name })) },
    { key: 'brand' as const, label: ui.products.brand, options: brands.filter((b) => used.brand.has(b.slug)).map((b) => ({ slug: b.slug, name: b.name })) },
    { key: 'type' as const, label: ui.products.type, options: fatTypes.filter((t) => used.type.has(t.slug)).map((t) => ({ slug: t.slug, name: t.name })) },
  ].filter((group) => group.options.length > 1)
  const hasFilter = Boolean(active.category || active.brand || active.type)

  return (
    <>
      <PageHeader
        eyebrow={header?.eyebrow}
        title={header?.title ?? ui.common.viewAll}
        intro={header?.intro}
        homeLabel={ui.common.home}
        trail={[{ name: header?.eyebrow || header?.title || '', path: '/products' }]}
      />

      <section className="pb-24">
        <div className="wrap">
          <ProductFilters groups={groups} active={active} allLabel={ui.common.all} label={ui.products.filtersLabel} />

          <p className="mt-8 text-small text-muted" aria-live="polite">
            {toFa(String(products.length))} {ui.products.countLabel}
          </p>

          {products.length ? (
            <ul className="product-grid mt-6">
              {products.map((product, i) => (
                <li key={product.id} data-reveal style={{ '--i': i % 3 } as CSSProperties}>
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
          ) : (
            <div className="panel mt-6 flex flex-col items-center gap-6 px-6 py-16 text-center">
              <p className="text-lead text-muted">{ui.products.empty}</p>
              {hasFilter ? (
                <ButtonLink href="/products" variant="outline">
                  {ui.products.clearFilters}
                </ButtonLink>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <CtaBand title={cta?.title} text={cta?.text} actions={[cta?.primary, cta?.secondary]} />
    </>
  )
}
