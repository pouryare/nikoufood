import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { articlesEnabled, getArticle, getListingPages, getUi, mediaOf } from '@/lib/cms'
import { formatJalali } from '@/lib/format'
import { articleLd } from '@/lib/jsonld'
import { pageMetadata } from '@/lib/seo'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}
  return pageMetadata({ title: article.title, description: article.excerpt, path: `/articles/${article.slug}`, meta: article.meta, image: mediaOf(article.coverImage), type: 'article' })
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params
  if (!(await articlesEnabled())) notFound()
  const [article, ui, listing] = await Promise.all([getArticle(slug), getUi(), getListingPages()])
  if (!article) notFound()
  const cover = mediaOf(article.coverImage)
  const list = listing.articles?.header

  return (
    <>
      <JsonLd data={articleLd({ title: article.title, description: article.excerpt, path: `/articles/${article.slug}`, image: cover?.url, publishedAt: article.publishedAt, updatedAt: article.updatedAt })} />
      <PageHeader
        eyebrow={article.publishedAt ? formatJalali(article.publishedAt) : list?.eyebrow}
        title={article.title}
        intro={article.excerpt}
        homeLabel={ui.common.home}
        trail={[
          { name: list?.eyebrow || list?.title || '', path: '/articles' },
          { name: article.title, path: `/articles/${article.slug}` },
        ]}
      />
      <article className="pb-24">
        <div className="wrap">
          {cover ? (
            <div className="relative mb-12 aspect-[16/8] overflow-hidden rounded-lg border border-line">
              <Image src={cover.url} alt={cover.alt || article.title} fill priority sizes="(max-width: 1280px) 94vw, 72rem" style={{ objectFit: 'cover', objectPosition: cover.focal }} />
            </div>
          ) : null}
          <div className="prose-nk">
            <RichText data={article.content as never} />
          </div>
          <div className="mt-12">
            <ButtonLink href="/articles" variant="outline" icon="arrowLeft">
              {ui.articles.backToList}
            </ButtonLink>
          </div>
        </div>
      </article>
    </>
  )
}
