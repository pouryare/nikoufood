import type { MetadataRoute } from 'next'
import { articlesEnabled, getArticles, getBrands, getProducts } from '@/lib/cms'
import { absoluteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

const STATIC = ['/', '/about', '/products', '/brands', '/network', '/partnership', '/representation', '/contact']

/** Every public page. Articles are listed only once they are visible on the site. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands, showArticles] = await Promise.all([getProducts(), getBrands(), articlesEnabled()])
  const articles = showArticles ? await getArticles(200) : []
  const date = (value?: string | null) => (value ? new Date(value) : undefined)
  return [
    ...STATIC.map((path) => ({ url: absoluteUrl(path), priority: path === '/' ? 1 : 0.7 })),
    ...(showArticles ? [{ url: absoluteUrl('/articles'), priority: 0.6 }] : []),
    ...brands.map((b) => ({ url: absoluteUrl(`/brands/${b.slug}`), lastModified: date(b.updatedAt), priority: 0.7 })),
    ...products.map((p) => ({ url: absoluteUrl(`/products/${p.slug}`), lastModified: date(p.updatedAt), priority: 0.8 })),
    ...articles.map((a) => ({ url: absoluteUrl(`/articles/${a.slug}`), lastModified: date(a.updatedAt), priority: 0.5 })),
  ]
}
