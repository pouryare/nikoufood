import { unstable_cache } from 'next/cache'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { CMS_CACHE_TAG } from '@/hooks/revalidate'
import type { Brand, Product } from '@/payload-types'
import { mergeUi, type UiTexts } from './ui-defaults'

export const getCMS = () => getPayload({ config })

/** Cached read: refreshed automatically when an editor saves anything in the admin panel. */
function cached<T>(keys: string[], load: (payload: Payload) => Promise<T>): Promise<T> {
  return unstable_cache(async () => load(await getCMS()), ['cms', ...keys], {
    tags: [CMS_CACHE_TAG],
    revalidate: 3600,
  })()
}

const published = { _status: { equals: 'published' } } as const

/* ---------- globals ---------- */
export const getSiteSettings = () => cached(['site-settings'], (p) => p.findGlobal({ slug: 'site-settings', depth: 1 }))
export const getTheme = () => cached(['theme'], (p) => p.findGlobal({ slug: 'theme', depth: 1 }))
export const getNavigation = () => cached(['navigation'], (p) => p.findGlobal({ slug: 'navigation' }))
export const getHomePage = () => cached(['home-page'], (p) => p.findGlobal({ slug: 'home-page', depth: 2 }))
export const getAboutPage = () => cached(['about-page'], (p) => p.findGlobal({ slug: 'about-page', depth: 2 }))
export const getNetworkPage = () => cached(['network-page'], (p) => p.findGlobal({ slug: 'network-page', depth: 2 }))
export const getRepresentationPage = () => cached(['representation-page'], (p) => p.findGlobal({ slug: 'representation-page' }))
export const getPartnershipPage = () => cached(['partnership-page'], (p) => p.findGlobal({ slug: 'partnership-page' }))
export const getContactPage = () => cached(['contact-page'], (p) => p.findGlobal({ slug: 'contact-page' }))
export const getListingPages = () => cached(['listing-pages'], (p) => p.findGlobal({ slug: 'listing-pages' }))

/* ---------- brands & products ---------- */
export const getBrands = (opts: { featured?: boolean } = {}) =>
  cached(['brands', String(opts.featured ?? 'all')], async (p) =>
    (
      await p.find({
        collection: 'brands',
        where: { and: [published, ...(opts.featured ? [{ featured: { equals: true } }] : [])] },
        sort: 'order',
        limit: 50,
        depth: 1,
        pagination: false,
      })
    ).docs,
  )

export const getBrand = (slug: string) =>
  cached(['brand', slug], async (p) => {
    const res = await p.find({ collection: 'brands', where: { and: [published, { slug: { equals: slug } }] }, depth: 2, limit: 1 })
    return res.docs[0] ?? null
  })

export type ProductFilter = { brand?: string; category?: string; fatType?: string; featured?: boolean }

export const getProducts = (filter: ProductFilter = {}) =>
  cached(['products', JSON.stringify(filter)], async (p) => {
    const and: Record<string, unknown>[] = [published]
    if (filter.featured) and.push({ featured: { equals: true } })
    if (filter.brand) and.push({ 'brand.slug': { equals: filter.brand } })
    if (filter.category) and.push({ 'category.slug': { equals: filter.category } })
    if (filter.fatType) and.push({ 'fatType.slug': { equals: filter.fatType } })
    return (await p.find({ collection: 'products', where: { and } as never, sort: 'order', limit: 200, depth: 2, pagination: false })).docs
  })

export const getProduct = (slug: string) =>
  cached(['product', slug], async (p) => {
    const res = await p.find({ collection: 'products', where: { and: [published, { slug: { equals: slug } }] }, depth: 2, limit: 1 })
    return res.docs[0] ?? null
  })

export const getCategories = () =>
  cached(['categories'], async (p) => (await p.find({ collection: 'product-categories', sort: 'order', limit: 50, pagination: false })).docs)

export const getFatTypes = () =>
  cached(['fat-types'], async (p) => (await p.find({ collection: 'fat-types', sort: 'order', limit: 50, pagination: false })).docs)

/* ---------- network ---------- */
export const getProvinces = () =>
  cached(['provinces'], async (p) => (await p.find({ collection: 'provinces', sort: 'name', limit: 100, pagination: false })).docs)

/** Only representatives explicitly marked as public, and only their public fields. */
export const getPublicRepresentatives = () =>
  cached(['public-representatives'], async (p) => {
    const res = await p.find({
      collection: 'representatives',
      where: { showPublicly: { equals: true } },
      depth: 1,
      limit: 200,
      pagination: false,
    })
    return res.docs.map((r) => ({
      id: r.id,
      name: r.publicName || '',
      phone: r.publicPhone || '',
      address: r.publicAddress || '',
      city: r.city || '',
      provinceSlug: typeof r.province === 'object' && r.province ? r.province.slug : '',
    }))
  })

/* ---------- articles ---------- */
export const getArticles = (limit = 24) =>
  cached(['articles', String(limit)], async (p) =>
    (await p.find({ collection: 'articles', where: published, sort: '-publishedAt', limit, depth: 1 })).docs,
  )

export const getArticle = (slug: string) =>
  cached(['article', slug], async (p) => {
    const res = await p.find({ collection: 'articles', where: { and: [published, { slug: { equals: slug } }] }, depth: 1, limit: 1 })
    return res.docs[0] ?? null
  })

export const hasPublishedArticles = () =>
  cached(['has-articles'], async (p) => (await p.count({ collection: 'articles', where: published })).totalDocs > 0)

/** Articles are shown in menus / sitemap only when the settings say so (default: once one is published). */
export async function articlesEnabled(): Promise<boolean> {
  const settings = await getSiteSettings()
  if (settings.articlesVisibility === 'show') return true
  if (settings.articlesVisibility === 'hide') return false
  return hasPublishedArticles()
}

/* ---------- small helpers shared by pages ---------- */
export type { Brand, Product }

export function mediaOf(value: unknown): { url: string; alt: string; width?: number; height?: number; mimeType?: string } | null {
  if (!value || typeof value !== 'object') return null
  const m = value as { url?: string | null; alt?: string; width?: number | null; height?: number | null; mimeType?: string | null }
  if (!m.url) return null
  return { url: m.url, alt: m.alt ?? '', width: m.width ?? undefined, height: m.height ?? undefined, mimeType: m.mimeType ?? undefined }
}

/* ---------- interface texts ---------- */

export const getUi = async (): Promise<UiTexts> =>
  mergeUi(await cached(['ui-texts'], (p) => p.findGlobal({ slug: 'ui-texts' })))
