'use client'

import { Fragment, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/cn'
import { splitWords } from '@/lib/split-words'

type Props = {
  text: string
  /** Words that turn gold when they light up. Words with digits always do. */
  keys?: string[]
  className?: string
}

const clean = (word: string) => word.replace(/[«»،؛.!?:()]/g, '')

/**
 * A paragraph that is read to the visitor: every word starts dim and lights up as the page scrolls,
 * like a finger moving along the line. Numbers and the key words turn gold.
 * The text is complete in the HTML from the start; visitors who prefer less motion see it fully lit.
 */
export function ReadingText({ text, keys = [], className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null)
  const words = useMemo(() => splitWords(text), [text])
  const keySet = useMemo(
    () =>
      new Set(
        keys
          .flatMap((k) => k.split(/\s+/))
          .map(clean)
          .filter(Boolean),
      ),
    [keys],
  )

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const spans = Array.from(el.querySelectorAll<HTMLElement>('.read-w'))
    const n = spans.length
    let frame = 0
    let last = -1
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const h = window.innerHeight
      const p = Math.min(1, Math.max(0, (h * 0.85 - r.top) / (r.height + h * 0.35)))
      const lit = p * (n + 4)
      if (Math.abs(lit - last) < 0.02) return
      last = lit
      spans.forEach((span, i) => {
        const v = Math.min(1, Math.max(0, lit - i))
        span.style.setProperty('--o', (0.2 + 0.8 * v).toFixed(3))
        span.toggleAttribute('data-on', v > 0.6)
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
      spans.forEach((span) => {
        span.style.removeProperty('--o')
        span.removeAttribute('data-on')
      })
    }
  }, [words])

  return (
    <p ref={ref} className={cn('read', className)}>
      {words.map((word, i) => (
        <Fragment key={i}>
          {i > 0 ? ' ' : null}
          <span
            className="read-w"
            data-key={/[0-9۰-۹]/.test(word) || keySet.has(clean(word)) ? '' : undefined}
          >
            {word}
          </span>
        </Fragment>
      ))}
    </p>
  )
}
