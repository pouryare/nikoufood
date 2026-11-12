'use client'

import { useEffect, useRef } from 'react'
import { ExplodedPack, type ExplodedPackHandle, type ExplodedPackLabels } from './pack/ExplodedPack'
import './pack-showcase.css'

type Props = { labels: ExplodedPackLabels; className?: string }

/**
 * The single-serve pack comes apart as it scrolls up the screen: closed when it enters at the bottom,
 * lid, butter and tray fully apart (and named) once it reaches the middle. Scrolling back closes it again.
 * The scroll writes straight to the 3D scene, so the page never re-renders while scrolling.
 */
export function PackScroll({ labels, className }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const pack = useRef<ExplodedPackHandle>(null)

  useEffect(() => {
    const el = box.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const h = window.innerHeight
      const r = el.getBoundingClientRect()
      // From "top edge at 90% of the screen" to "centre at 45% of the screen".
      const start = h * 0.9
      const end = h * 0.45 - r.height / 2
      const p = (start - r.top) / Math.max(1, start - end)
      pack.current?.setProgress(Math.min(1, Math.max(0, p)))
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

  return (
    <div ref={box} className={className}>
      <ExplodedPack ref={pack} progress={0} labels={labels} />
    </div>
  )
}
