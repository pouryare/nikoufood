import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { MediaInfo } from '@/lib/cms'
import { toFa } from '@/lib/format'

export type BrandPlateData = {
  slug: string
  name: string
  tagline?: string | null
  description?: string | null
  logo: MediaInfo | null
  photo: MediaInfo | null
  /** Optional brand colour (#RRGGBB) for the glow; the site gold is used when it is empty. */
  color?: string | null
  productCount?: number
}

type Props = { brand: BrandPlateData; index: number; viewLabel: string; countLabel: string }

/**
 * One brand as a large plate. Until a logo is uploaded the brand's name itself is set very large,
 * so nothing invented stands in for the real logo.
 */
export function BrandPlate({ brand, index, viewLabel, countLabel }: Props) {
  const color = brand.color && /^#[0-9a-fA-F]{6}$/.test(brand.color) ? brand.color : undefined
  return (
    <article className="brand-plate" style={color ? ({ '--brand': color } as CSSProperties) : undefined}>
      {brand.photo ? (
        <Image src={brand.photo.url} alt="" fill sizes="(max-width: 1023px) 100vw, 42rem" className="brand-plate-photo" style={{ objectPosition: brand.photo.focal }} />
      ) : null}
      <span aria-hidden className="brand-plate-ring" />

      <div className="flex items-center justify-between gap-4">
        <span aria-hidden className="brand-plate-index">
          {toFa(String(index + 1).padStart(2, '0'))}
        </span>
        {brand.tagline ? <span className="text-small text-muted">{brand.tagline}</span> : null}
      </div>

      <div className="mt-auto pt-16">
        {brand.logo ? (
          <Image
            src={brand.logo.url}
            alt=""
            width={brand.logo.width ?? 320}
            height={brand.logo.height ?? 160}
            sizes="14rem"
            className="mb-5 h-20 w-auto max-w-[14rem] object-contain object-right"
          />
        ) : null}
        <h3 className={brand.logo ? 'text-h3' : 'brand-plate-word'}>
          <Link href={`/brands/${brand.slug}`} className="brand-plate-link">
            {brand.name}
          </Link>
        </h3>
        {brand.description ? <p className="mt-4 line-clamp-2 max-w-md text-muted">{brand.description}</p> : null}
      </div>

      <div className="brand-plate-foot">
        <span className="brand-plate-cta">
          {viewLabel}
          <Icon name="arrowLeft" size={18} />
        </span>
        {brand.productCount ? (
          <span className="text-small text-muted">
            {toFa(brand.productCount)} {countLabel}
          </span>
        ) : null}
      </div>
    </article>
  )
}
