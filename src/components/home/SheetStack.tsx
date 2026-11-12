'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Two sections laid like sheets of paper: the first one stays where it is while the second slides up
 * over it; the one underneath shrinks a little and gets darker as it is covered. Used for the table
 * and the brands. With only one of them on the page, or with reduced motion, they simply follow each other.
 */
export function SheetStack({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = ref.current
    if (!box || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const [under, over] = Array.from(box.children) as HTMLElement[]
    if (!under || !over) return
    box.setAttribute('data-on', '')
    // The travelling butter tucks away once the sliding sheet covers it.
    over.setAttribute('data-butter-hide', '')
    let frame = 0
    const update = () => {
      frame = 0
      const h = window.innerHeight
      const cover = Math.min(1, Math.max(0, (h - over.getBoundingClientRect().top) / h))
      under.style.setProperty('--cover', cover.toFixed(3))
    }
    const measure = () => {
      under.style.setProperty(
        '--sheet-top',
        `${Math.min(0, window.innerHeight - under.offsetHeight)}px`,
      )
      update()
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(under)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      if (frame) cancelAnimationFrame(frame)
      box.removeAttribute('data-on')
      over.removeAttribute('data-butter-hide')
    }
  }, [])

  return (
    <div ref={ref} className="sheets">
      {children}
    </div>
  )
}
