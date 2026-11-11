import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHeader } from '@/components/ui/PageHeader'
import { getListingPages, getProduct, getProducts, getSiteSettings, getUi, mediaOf, productPicture, related } from '@/lib/cms'
import { productLd } from '@/lib/jsonld'
import { pageMetadata } from '@/lib/seo'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProduct(slug), getSiteSettings()])
  if (!product) return {}
  return pageMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/products/${product.slug}`,
    meta: product.meta,
    image: productPicture(product, settings).media,
  })
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params
  const [product, settings, ui, listing] = await Promise.all([getProduct(slug), getSiteSettings(), getUi(), getListingPages()])
  if (!product) notFound()

  const brand = related(product.brand)
  const category = related(product.category)
  const fatType = related(product.fatType)
  const { media, standIn } = productPicture(product, settings)
  const gallery = (product.images ?? []).map((item) => mediaOf(item.image)).filter((m) => m !== null).slice(1)
  const variants = (product.variants ?? []).filter((v) => v.label)
  const features = (product.features ?? []).filter((f) => f.text)
  const specs = (product.specs ?? []).filter((s) => s.label && s.value)
  const applications = (product.applications ?? []).filter((a) => a.title)
  const markets = (product.markets ?? []).map((m) => related(m)).filter((m) => m !== null)
  const others = (await getProducts({ category: category?.slug })).filter((p) => p.id !== product.id).slice(0, 3)
  const more = others.length ? others : (await getProducts()).filter((p) => p.id !== product.id).slice(0, 3)
  const cta = listing.productCta
  const fills = media?.mimeType === 'image/jpeg'
  const hasBody = product.description && (product.description as { root?: { children?: unknown[] } }).root?.children?.length

  return (
    <>
      <JsonLd
        data={productLd({
          name: product.name,
          description: product.shortDescription,
          path: `/products/${product.slug}`,
          image: media?.url,
          brand: brand?.name,
          category: category?.name,
        })}
      />
      <PageHeader
        eyebrow={[brand?.name, category?.name].filter(Boolean).join(' · ')}
        title={product.name}
        intro={product.shortDescription}
        homeLabel={ui.common.home}
        trail={[
          { name: listing.products?.header?.eyebrow || listing.products?.header?.title || '', path: '/products' },
          { name: product.name, path: `/products/${product.slug}` },
        ]}
      />

      <section className="pb-20">
        <div className="wrap pd-grid">
          <div className="pd-sticky">
            <div className="pd-stage" data-fills={fills ? '' : undefined} data-reveal>
              {media ? (
                <Image src={media.url} alt={media.alt || product.name} width={media.width ?? 1000} height={media.height ?? 1000} sizes="(max-width: 1023px) 92vw, 40vw" priority />
              ) : null}
              {standIn ? <p className="pd-note">{ui.products.imageSoon}</p> : null}
            </div>
            {gallery.length ? (
              <ul className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((m) => (
                  <li key={m.url} className="overflow-hidden rounded-md border border-line">
                    <Image src={m.url} alt={m.alt || product.name} width={m.width ?? 400} height={m.height ?? 400} sizes="12vw" className="aspect-square w-full object-cover" />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid gap-12">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3" data-reveal>
              {[
                { label: ui.products.brand, value: brand?.name, href: brand ? `/brands/${brand.slug}` : undefined },
                { label: ui.products.category, value: category?.name, href: category ? `/products?category=${category.slug}` : undefined },
                { label: ui.products.type, value: fatType?.name, href: fatType ? `/products?type=${fatType.slug}` : undefined },
              ]
                .filter((row) => row.value)
                .map((row) => (
                  <div key={row.label}>
                    <dt className="text-small text-muted">{row.label}</dt>
                    <dd className="mt-1 text-lg font-bold">
                      {row.href ? (
                        <Link href={row.href} className="transition-colors hover:text-gold">
                          {row.value}
                        </Link>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
            </dl>

            {variants.length ? (
              <div data-reveal>
                <h2 className="text-h3">{ui.products.variants}</h2>
                <ul className="pd-variants mt-5">
                  {variants.map((v) => (
                    <li key={v.id ?? v.label}>
                      <strong>{v.label}</strong>
                      <small>{[v.weight, v.packaging].filter(Boolean).join(' · ')}</small>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {features.length ? (
              <div data-reveal>
                <h2 className="text-h3">{ui.products.features}</h2>
                <ul className="pd-list mt-5">
                  {features.map((f) => (
                    <li key={f.id ?? f.text}>{f.text}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {specs.length ? (
              <div data-reveal>
                <h2 className="text-h3">{ui.products.specs}</h2>
                <table className="pd-specs mt-3">
                  <tbody>
                    {specs.map((s) => (
                      <tr key={s.id ?? s.label}>
                        <th scope="row">{s.label}</th>
                        <td>{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {applications.length ? (
              <div data-reveal>
                <h2 className="text-h3">{ui.products.applications}</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {applications.map((a) => (
                    <li key={a.id ?? a.title} className="panel p-5">
                      <strong>{a.title}</strong>
                      {a.description ? <p className="mt-1 text-small text-muted">{a.description}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {markets.length ? (
              <div data-reveal>
                <h2 className="text-h3">{ui.products.markets}</h2>
                <ul className="filter-chips mt-5">
                  {markets.map((m) => (
                    <li key={m.id} className="chip">
                      {m.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {hasBody ? (
              <div className="prose-nk" data-reveal>
                <RichText data={product.description as never} />
              </div>
            ) : null}

            {brand ? (
              <div data-reveal>
                <ButtonLink href={`/brands/${brand.slug}`} variant="outline" icon="arrowLeft">
                  {ui.products.viewBrand}: {brand.name}
                </ButtonLink>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {more.length ? (
        <section className="pb-24">
          <div className="wrap">
            <h2 className="text-h2" data-reveal>
              {ui.products.related}
            </h2>
            <ul className="product-grid mt-10">
              {more.map((p, i) => (
                <li key={p.id} data-reveal style={{ '--i': i } as CSSProperties}>
                  <ProductCard
                    product={{
                      slug: p.slug,
                      name: p.name,
                      brand: related(p.brand)?.name,
                      tags: [related(p.category)?.name, related(p.fatType)?.name],
                      image: productPicture(p, settings).media,
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand title={cta?.title} text={cta?.text} actions={[cta?.primary, cta?.secondary]} />
    </>
  )
}
