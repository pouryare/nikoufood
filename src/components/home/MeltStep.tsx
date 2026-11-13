'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { emitSound } from '@/lib/sound'
import { prefersReducedMotion } from '@/lib/webgl'

type Props = {
  video: { url: string }
  videoMobile?: { url: string } | null
  /** A short line that appears as the butter melts, e.g. «اما این طعم از کجا می‌آید؟» */
  line?: string | null
}

/** The share of the scroll at which the butter touches the rice (the sizzle plays here). */
const TOUCH = 0.22

const subscribe = (notify: () => void) => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}
const useMotion = () =>
  useSyncExternalStore(
    subscribe,
    () => !prefersReducedMotion(),
    () => false,
  )

/**
 * Between the hero and the film: the butter lands on hot rice and melts, frame by frame as the visitor
 * scrolls, with a question that leads into the film. The clip is loaded only when the visitor gets near.
 * Visitors who prefer less motion get the same clip as a normal (muted) video with controls.
 */
export function MeltStep({ video, videoMobile, line }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const motion = useMotion()
  const [near, setNear] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), {
      rootMargin: '120% 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const root = rootRef.current
    const clip = videoRef.current
    if (!motion || !near || !root || !clip) return
    let frame = 0
    let touched = false
    const update = () => {
      frame = 0
      const r = root.getBoundingClientRect()
      const span = Math.max(1, r.height - window.innerHeight)
      const p = Math.min(1, Math.max(0, -r.top / span))
      root.style.setProperty('--m', p.toFixed(4))
      if (clip.readyState >= 1 && Number.isFinite(clip.duration)) {
        const target = p * Math.max(0, clip.duration - 0.05)
        if (Math.abs(clip.currentTime - target) > 0.03) clip.currentTime = target
      }
      // The sizzle plays once each time the butter reaches the rice on the way down.
      if (!touched && p >= TOUCH && p < TOUCH + 0.25) {
        touched = true
        emitSound('sizzle')
      } else if (p < TOUCH - 0.08) touched = false
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    clip.addEventListener('loadedmetadata', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      clip.removeEventListener('loadedmetadata', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [motion, near])

  const sources = near ? (
    <>
      <source src={video.url} media={videoMobile ? '(min-width: 768px)' : undefined} />
      {videoMobile ? <source src={videoMobile.url} /> : null}
    </>
  ) : null

  if (!motion) {
    return (
      <section ref={rootRef} className="melt" data-mode="still" data-mood="melt">
        <div className="wrap section-y">
          <video className="melt-plain" muted playsInline controls preload="metadata">
            {sources}
          </video>
          {line ? <p className="melt-line mt-8">{line}</p> : null}
        </div>
      </section>
    )
  }

  return (
    <section
      ref={rootRef}
      className="melt"
      data-mode="scrub"
      data-mood="melt"
      style={{ '--m': 0 } as React.CSSProperties}
    >
      <div className="melt-stage">
        {/* `key` makes the browser pick up the sources once they are added. */}
        <video
          key={near ? 'on' : 'off'}
          ref={videoRef}
          className="melt-video"
          muted
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
        >
          {sources}
        </video>
        <span aria-hidden className="melt-steam" />
        <span aria-hidden className="melt-fade" />
        {line ? <p className="melt-line melt-line-float">{line}</p> : null}
      </div>
    </section>
  )
}
