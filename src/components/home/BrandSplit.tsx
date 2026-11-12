'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, type CSSProperties } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { MediaInfo } from '@/lib/cms'
import { toFa } from '@/lib/format'

export type BrandSplitItem = {
  slug: string
  name: string
  tagline?: string | null
  logo: MediaInfo | null
  photo: MediaInfo | null
  /** The brand colour from the CMS (#RRGGBB); a placeholder colour is used while it is empty. */
  color?: string | null
  products: { slug: string; name: string; image: MediaInfo | null }[]
  productCount: number
}

type Props = { brands: [BrandSplitItem, BrandSplitItem]; viewLabel: string; countLabel: string }

/** Placeholder colours until each brand's own colour is entered in the CMS. */
const FALLBACK = ['var(--nk-gold)', 'color-mix(in oklab, var(--nk-gold) 55%, #c2410c)']

/**
 * Two brands sharing one wide screen, split down the middle like the film. On a computer, the half
 * under the mouse grows, fills with its brand colour and shows its products. Phones and tablets
 * show the two halves one above the other, with everything visible.
 */
export function BrandSplit({ brands, viewLabel, countLabel }: Props) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div
      className="brand-split"
      data-active={active ?? undefined}
      onPointerLeave={() => setActive(null)}
    >
      {brands.map((brand, i) => {
        const color =
          brand.color && /^#[0-9a-fA-F]{6}$/.test(brand.color) ? brand.color : FALLBACK[i]
        return (
          <article
            key={brand.slug}
            className="brand-half"
            style={{ '--brand': color } as CSSProperties}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
            onFocus={() => setActive(i)}
          >
            {brand.photo ? (
              <Image
                src={brand.photo.url}
                alt=""
                fill
                sizes="(max-width: 1023px) 100vw, 64vw"
                className="brand-half-photo"
                style={{ objectPosition: brand.photo.focal }}
              />
            ) : null}
            <span aria-hidden className="brand-half-wash" />

            <div className="brand-half-in">
              <div className="flex items-center justify-between gap-4">
                <span aria-hidden className="brand-half-index">
                  {toFa(String(i + 1).padStart(2, '0'))}
                </span>
                {brand.tagline ? (
                  <span className="brand-half-side text-small text-muted">{brand.tagline}</span>
                ) : null}
              </div>

              <div className="mt-auto pt-10">
                {brand.logo ? (
                  <Image
                    src={brand.logo.url}
                    alt=""
                    width={brand.logo.width ?? 320}
                    height={brand.logo.height ?? 160}
                    sizes="16rem"
                    className="mb-5 h-20 w-auto max-w-[16rem] object-contain object-right lg:h-24"
                  />
                ) : null}
                <h3 className={brand.logo ? 'text-h2' : 'brand-half-word'}>
                  <Link href={`/brands/${brand.slug}`} className="brand-half-link">
                    {brand.name}
                  </Link>
                </h3>

                {brand.products.length ? (
                  <ul className="brand-half-products">
                    {brand.products.map((product, n) => (
                      <li key={product.slug} style={{ '--n': n } as CSSProperties}>
                        <Link href={`/products/${product.slug}`} className="brand-half-product">
                          <span className="brand-half-thumb">
                            {product.image ? (
                              <Image
                                src={product.image.url}
                                alt=""
                                fill
                                sizes="5rem"
                                className="object-contain p-1.5"
                              />
                            ) : null}
                          </span>
                          <span className="line-clamp-2 text-small font-bold">{product.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="brand-half-foot">
                <span className="brand-half-cta">
                  {viewLabel}
                  <Icon name="arrowLeft" size={18} />
                </span>
                {brand.productCount ? (
                  <span className="brand-half-side text-small text-muted">
                    {toFa(brand.productCount)} {countLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
