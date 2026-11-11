import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { articlesEnabled, getArticles, getListingPages, getUi, mediaOf } from '@/lib/cms'
import { formatJalali } from '@/lib/format'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const listing = await getListingPages()
  const header = listing.articles?.header
  return pageMetadata({ title: header?.title, description: header?.intro, path: '/articles' })
}

export default async function ArticlesPage() {
  if (!(await articlesEnabled())) notFound()
  const [listing, ui, articles] = await Promise.all([getListingPages(), getUi(), getArticles()])
  const header = listing.articles?.header

  return (
    <>
      <PageHeader
        eyebrow={header?.eyebrow}
        title={header?.title ?? ''}
        intro={header?.intro}
        homeLabel={ui.common.home}
        trail={[{ name: header?.eyebrow || header?.title || '', path: '/articles' }]}
      />
      <section className="pb-24">
        <div className="wrap">
          {articles.length ? (
            <ul className="product-grid">
              {articles.map((a, i) => {
                const cover = mediaOf(a.coverImage)
                return (
                  <li key={a.id} data-reveal style={{ '--i': i % 3 } as CSSProperties}>
                    <article className="panel article-card">
                      <div className="article-card-cover">
                        {cover ? <Image src={cover.url} alt="" fill sizes="(max-width: 767px) 92vw, 30vw" style={{ objectFit: 'cover', objectPosition: cover.focal }} /> : null}
                      </div>
                      <div className="grid gap-3 p-6">
                        {a.publishedAt ? <time dateTime={a.publishedAt} className="text-small text-muted">{formatJalali(a.publishedAt)}</time> : null}
                        <h2 className="text-h3">
                          <Link href={`/articles/${a.slug}`} className="product-card-link">
                            {a.title}
                          </Link>
                        </h2>
                        {a.excerpt ? <p className="line-clamp-3 text-muted">{a.excerpt}</p> : null}
                        <span className="text-small font-bold text-gold">{ui.articles.readMore}</span>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="panel p-10 text-center text-muted">{ui.articles.empty}</p>
          )}
        </div>
      </section>
    </>
  )
}
