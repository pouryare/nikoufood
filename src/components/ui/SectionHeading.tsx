import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  eyebrow?: string | null
  title?: string | null
  text?: string | null
  align?: 'start' | 'center'
  as?: 'h1' | 'h2'
  className?: string
  children?: ReactNode
}

/** Eyebrow + big title + supporting paragraph: the heading block used at the top of every section. */
export function SectionHeading({ eyebrow, title, text, align = 'start', as: Tag = 'h2', className, children }: Props) {
  if (!eyebrow && !title && !text) return null
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow ? (
        <p data-reveal className="eyebrow">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <Tag data-reveal style={{ '--i': 1 } as React.CSSProperties} className={cn('mt-5', Tag === 'h1' ? 'text-h1' : 'text-h2')}>
          {title}
        </Tag>
      ) : null}
      {text ? (
        <p data-reveal style={{ '--i': 2 } as React.CSSProperties} className="mt-6 text-lead text-muted">
          {text}
        </p>
      ) : null}
      {children}
    </div>
  )
}
