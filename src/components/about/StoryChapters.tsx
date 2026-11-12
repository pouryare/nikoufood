'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { RiseText } from '@/components/ui/RiseText'
import { toFa } from '@/lib/format'

export type StoryChapter = {
  id: string
  kicker?: string | null
  title: string
  text?: string | null
  image?: ReactNode
}

/**
 * The company's story with a title that stays put: on a computer a large gold word sits beside the
 * chapters and changes as each chapter passes the middle of the screen, with a «۲ از ۴» counter;
 * on a phone the same word and counter ride in a slim bar at the top. The chapter being read is lit.
 */
export function StoryChapters({
  chapters,
  label,
}: {
  chapters: StoryChapter[]
  label?: string | null
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const box = ref.current
    if (!box) return
    const items = Array.from(box.querySelectorAll<HTMLElement>('.chapter'))
    let frame = 0
    const update = () => {
      frame = 0
      const mid = window.innerHeight * 0.5
      let next = 0
      items.forEach((item, i) => {
        if (item.getBoundingClientRect().top < mid) next = i
      })
      setIndex(next)
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
    }
  }, [])

  const count = (
    <p className="chapters-count">
      <b>{toFa(index + 1)}</b> / {toFa(chapters.length)}
    </p>
  )
  const kickers = (
    <div aria-hidden className="chapters-k">
      {chapters.map((c, i) => (
        <span key={c.id} data-state={i === index ? 'on' : i < index ? 'past' : undefined}>
          {c.kicker || toFa(String(i + 1).padStart(2, '0'))}
        </span>
      ))}
    </div>
  )

  return (
    <div ref={ref} className="chapters">
      <div className="chapters-bar">
        {kickers}
        {count}
      </div>
      <div className="chapters-pin">
        {label ? <p className="eyebrow">{label}</p> : null}
        {kickers}
        <div
          className="chapters-progress"
          style={{ '--p': (index + 1) / chapters.length } as CSSProperties}
        >
          <i />
        </div>
        {count}
      </div>
      <ol className="chapters-list">
        {chapters.map((c, i) => (
          <li key={c.id} className="chapter" data-on={i === index ? '' : undefined}>
            {c.kicker ? <p className="eyebrow chapter-kicker">{c.kicker}</p> : null}
            <h2 data-reveal className="rise text-h2">
              <RiseText text={c.title} />
            </h2>
            {c.text ? <p className="mt-6 max-w-2xl text-lead text-muted">{c.text}</p> : null}
            {c.image ? <div className="story-image">{c.image}</div> : null}
          </li>
        ))}
      </ol>
    </div>
  )
}
