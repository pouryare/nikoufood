import Image from 'next/image'
import Link from 'next/link'
import { LitEdge } from '@/components/effects/LitEdge'
import { Icon, type IconName } from '@/components/ui/Icon'
import { TiltCard } from '@/components/ui/TiltCard'
import type { MediaInfo } from '@/lib/cms'

export type ProductCardTag = { label: string; icon?: IconName | null }

export type ProductCardData = {
  slug: string
  name: string
  brand?: string | null
  /** Short facts shown as small tags, e.g. «تک‌نفره» and «گیاهی», each with an optional icon. */
  tags?: (ProductCardTag | string | null | undefined)[]
  image: MediaInfo | null
}

/** A product as a tall card that leans toward the mouse; the picture floats in front of the card. */
export function ProductCard({ product, sizes = '(max-width: 767px) 78vw, (max-width: 1279px) 44vw, 22rem' }: { product: ProductCardData; sizes?: string }) {
  const { image } = product
  const tags = (product.tags ?? [])
    .map((tag) => (typeof tag === 'string' ? { label: tag } : tag))
    .filter((tag): tag is ProductCardTag => Boolean(tag?.label))
  // Photos with their own background fill the stage; cut-out pictures (PNG, WebP) float inside it.
  const fills = image?.mimeType === 'image/jpeg'
  return (
    <TiltCard className="h-full" innerClassName="rounded-lg" max={5}>
      <article className="product-card panel" data-lit data-cursor="view">
        <LitEdge />
        {/* A soft shine that slides over the card like light on gold foil (تنظیمات سایت › جلوه‌های ویژه). */}
        <span aria-hidden className="product-card-foil" />
        <div className="product-card-stage" data-fills={fills ? '' : undefined}>
          <span aria-hidden className="product-card-halo" />
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              width={image.width ?? 800}
              height={image.height ?? 800}
              sizes={sizes}
              className="product-card-image"
              style={fills ? { objectPosition: image.focal } : undefined}
            />
          ) : null}
        </div>
        <div className="product-card-body">
          {product.brand ? <p className="product-card-brand">{product.brand}</p> : null}
          <h3 className="product-card-name">
            <Link href={`/products/${product.slug}`} className="product-card-link">
              {product.name}
            </Link>
          </h3>
          <div className="product-card-foot">
            <ul className="product-card-tags">
              {tags.map((tag) => (
                <li key={tag.label}>
                  {tag.icon ? <Icon name={tag.icon} size={14} /> : null}
                  {tag.label}
                </li>
              ))}
            </ul>
            <span aria-hidden className="product-card-arrow">
              <Icon name="arrowUpLeft" size={18} />
            </span>
          </div>
        </div>
      </article>
    </TiltCard>
  )
}
