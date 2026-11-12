import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbLd } from '@/lib/jsonld'
import { RiseText } from './RiseText'

type Props = {
  eyebrow?: string | null
  title: string
  intro?: string | null
  /** Where this page sits, e.g. [{ name: 'محصولات', path: '/products' }]; the home link is added in front. */
  trail?: { name: string; path: string }[]
  homeLabel: string
  /** A picture or 3D scene shown on the opposite side of the title on large screens. */
  visual?: ReactNode
}

/** The opening of every inner page: breadcrumb, eyebrow, big title and a short introduction. */
export function PageHeader({ eyebrow, title, intro, trail = [], homeLabel, visual }: Props) {
  const crumbs = [{ name: homeLabel, path: '/' }, ...trail]
  return (
    <header className="page-header">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <div className="wrap">
        <div className={visual ? 'grid items-center gap-10 lg:grid-cols-12' : undefined}>
          <div className={visual ? 'lg:col-span-7' : 'max-w-4xl'}>
            {trail.length ? (
              <nav aria-label="breadcrumb" data-reveal>
                <ol className="flex flex-wrap items-center gap-x-2 text-small text-muted">
                  {crumbs.map((crumb, i) => (
                    <li key={crumb.path} className="flex items-center gap-2">
                      {i > 0 ? <span aria-hidden>/</span> : null}
                      {i < crumbs.length - 1 ? (
                        <Link href={crumb.path} className="transition-colors hover:text-gold">
                          {crumb.name}
                        </Link>
                      ) : (
                        <span aria-current="page" className="text-ink/80">
                          {crumb.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
            {eyebrow ? (
              <p data-reveal style={{ '--i': 1 } as CSSProperties} className="eyebrow mt-7">
                {eyebrow}
              </p>
            ) : null}
            <h1 data-reveal style={{ '--i': 2 } as CSSProperties} className="rise mt-5 text-h1">
              <RiseText text={title} />
            </h1>
            {intro ? (
              <p data-reveal style={{ '--i': 3 } as CSSProperties} className="rise-text mt-7 max-w-2xl text-lead text-muted">
                {intro}
              </p>
            ) : null}
          </div>
          {visual ? <div className="lg:col-span-5">{visual}</div> : null}
        </div>
      </div>
    </header>
  )
}
