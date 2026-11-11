import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { CtaBand } from '@/components/ui/CtaBand'
import { PageHeader } from '@/components/ui/PageHeader'
import { getBrand, getListingPages, getProducts, getSiteSettings, getUi, mediaOf, productPicture, related } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) return {}
  return pageMetadata({ title: brand.name, description: brand.description || brand.tagline, path: `/brands/${brand.slug}`, meta: brand.meta, image: mediaOf(brand.heroImage) })
}

export default async function BrandPage({ params }: { params: Params }) {
  const { slug } = await params
  const [brand, settings, ui, listing] = await Promise.all([getBrand(slug), getSiteSettings(), getUi(), getListingPages()])
  if (!brand) notFound()
  const products = await getProducts({ brand: brand.slug })
  const logo = mediaOf(brand.logo)
  const photo = mediaOf(brand.heroImage)
  const cta = listing.productCta
  const hasStory = brand.story && (brand.story as { root?: { children?: unknown[] } }).root?.children?.length

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Brand',
          name: brand.name,
          description: brand.description ?? undefined,
          url: absoluteUrl(`/brands/${brand.slug}`),
          ...(logo ? { logo: absoluteUrl(logo.url) } : {}),
        }}
      />
      <PageHeader
        eyebrow={brand.tagline || listing.brands?.header?.eyebrow}
        title={brand.name}
        intro={brand.description}
        homeLabel={ui.common.home}
        trail={[
          { name: listing.brands?.header?.eyebrow || listing.brands?.header?.title || '', path: '/brands' },
          { name: brand.name, path: `/brands/${brand.slug}` },
        ]}
        visual={
          logo || photo ? (
            <div className="pd-stage" data-fills={!logo ? '' : undefined} style={{ aspectRatio: '4 / 3' }} data-reveal>
              {logo ? (
                <Image src={logo.url} alt={logo.alt || brand.name} width={logo.width ?? 480} height={logo.height ?? 240} sizes="(max-width: 1023px) 80vw, 30vw" priority style={{ height: 'auto', maxHeight: '55%', width: '70%', objectFit: 'contain' }} />
              ) : photo ? (
                <Image src={photo.url} alt={photo.alt || brand.name} fill sizes="(max-width: 1023px) 92vw, 40vw" priority style={{ objectFit: 'cover', objectPosition: photo.focal }} />
              ) : null}
            </div>
          ) : undefined
        }
      />

      {hasStory ? (
        <section className="pb-16">
          <div className="wrap">
            <div className="prose-nk" data-reveal>
              <RichText data={brand.story as never} />
            </div>
          </div>
        </section>
      ) : null}

      {products.length ? (
        <section className="pb-24">
          <div className="wrap">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-h2" data-reveal>
                {ui.products.brandProducts}
              </h2>
              <ButtonLink href={`/products?brand=${brand.slug}`} variant="outline" icon="arrowLeft">
                {ui.common.viewAll}
              </ButtonLink>
            </div>
            <ul className="product-grid mt-10">
              {products.map((p, i) => (
                <li key={p.id} data-reveal style={{ '--i': i % 3 } as CSSProperties}>
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
