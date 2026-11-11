import Image from 'next/image'
import { mediaOf } from '@/lib/cms'

type Props = {
  media: unknown
  alt?: string
  sizes?: string
  priority?: boolean
  className?: string
  fill?: boolean
}

/** Renders an image picked in the CMS. SVGs are served as-is; photos go through the optimizer. */
export function CmsImage({ media, alt, sizes = '100vw', priority, className, fill }: Props) {
  const m = mediaOf(media)
  if (!m) return null
  const label = alt ?? m.alt
  if (m.mimeType === 'image/svg+xml' || !m.width || !m.height) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={m.url} alt={label} className={className} loading={priority ? 'eager' : 'lazy'} decoding="async" />
  }
  return fill ? (
    <Image src={m.url} alt={label} fill sizes={sizes} priority={priority} className={className} />
  ) : (
    <Image src={m.url} alt={label} width={m.width} height={m.height} sizes={sizes} priority={priority} className={className} />
  )
}
