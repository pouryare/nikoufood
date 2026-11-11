import type { Metadata } from 'next'
import { mediaOf } from './cms'
import { absoluteUrl } from './site'

type SeoGroup = { title?: string | null; description?: string | null; image?: unknown } | null | undefined

type Input = {
  /** Fallback title when the editor left the SEO title empty. */
  title?: string | null
  description?: string | null
  /** Path of the page, e.g. /products/butter-5kg (used for the canonical address). */
  path: string
  /** The «سئو» group filled in the CMS. */
  meta?: SeoGroup
  image?: unknown
  type?: 'website' | 'article'
  noIndex?: boolean
}

const trim = (value: string | null | undefined, max: number) => {
  const text = (value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

/** Builds the <head> tags of a page: CMS values first, sensible fallbacks after. */
export function pageMetadata({ title, description, path, meta, image, type = 'website', noIndex }: Input): Metadata {
  const finalTitle = trim(meta?.title || title, 70) || undefined
  const finalDescription = trim(meta?.description || description, 170) || undefined
  const shareImage = mediaOf(meta?.image) ?? mediaOf(image)
  const images = shareImage ? [{ url: absoluteUrl(shareImage.url), width: shareImage.width, height: shareImage.height, alt: shareImage.alt || finalTitle }] : undefined

  return {
    // Left out (not set to undefined) when empty, so the site-wide title and description still apply.
    ...(finalTitle ? { title: finalTitle } : {}),
    ...(finalDescription ? { description: finalDescription } : {}),
    alternates: { canonical: path },
    openGraph: { type, title: finalTitle, description: finalDescription, url: path, ...(images ? { images } : {}) },
    twitter: { card: 'summary_large_image', title: finalTitle, description: finalDescription, ...(images ? { images: images.map((i) => i.url) } : {}) },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}
