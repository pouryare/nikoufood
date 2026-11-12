'use client'

import { useEffect, useRef } from 'react'
import { PEEL_STILL, peelPadding, hasWebGL, placeStill } from './packLayout'
import type { PeelStage } from './packStage'
import stillTop from './still-top.webp'
import './pack.css'

type Props = {
  /** Small word next to the tab that invites a drag. */
  hint?: string
  /** Called once the lid has come off and flown away. */
  onDone?: () => void
  /** Change this number to put the lid back on. */
  resetKey?: number
  className?: string
}

/** The pack seen from above: drag the corner tab and the foil lid peels back off the butter. */
export function PeelLid({ hint = 'بکشید', onDone, resetKey, className }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const still = useRef<HTMLImageElement>(null)
  const grab = useRef<HTMLButtonElement>(null)
  const hintEl = useRef<HTMLDivElement>(null)
  const stage = useRef<PeelStage | null>(null)
  const done = useRef(onDone)

  useEffect(() => {
    done.current = onDone
  }, [onDone])

  useEffect(() => {
    const host = root.current
    const cv = canvas.current
    const handle = grab.current
    if (!host || !cv || !handle) return
    let live = true
    let made: PeelStage | null = null

    const size = () => {
      const rect = host.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return
      if (still.current) placeStill(still.current, rect.width, rect.height, peelPadding(rect.width), PEEL_STILL)
      made?.resize(rect.width, rect.height)
    }
    size()
    const observer = new ResizeObserver(size)
    observer.observe(host)
    let onScreen: IntersectionObserver | null = null

    const start = async () => {
      if (!hasWebGL()) return
      try {
        const { createPeelStage } = await import('./packStage')
        if (!live) return
        const stageNow = createPeelStage(cv, {
          grab: handle,
          hint: hintEl.current,
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          onFirstFrame: () => host.setAttribute('data-ready', 'true'),
          onDone: () => {
            handle.hidden = true
            done.current?.()
          },
        })
        made = stageNow
        stage.current = stageNow
        size()
        onScreen = new IntersectionObserver((entries) => stageNow.setVisible(entries.some((e) => e.isIntersecting)))
        onScreen.observe(host)
      } catch {
        // No WebGL: the still of the sealed pack stays up.
      }
    }

    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        near.disconnect()
        void start()
      },
      { rootMargin: '500px 0px' },
    )
    near.observe(host)

    return () => {
      live = false
      near.disconnect()
      observer.disconnect()
      onScreen?.disconnect()
      stage.current?.dispose()
      stage.current = null
      host.removeAttribute('data-ready')
    }
  }, [])

  // Skip the first run: the lid starts sealed anyway.
  const firstKey = useRef(true)
  useEffect(() => {
    if (firstKey.current) {
      firstKey.current = false
      return
    }
    if (grab.current) grab.current.hidden = false
    stage.current?.reset()
  }, [resetKey])

  return (
    <div ref={root} className={className ? `pack-stage ${className}` : 'pack-stage'}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a plain image: it must be placed by hand to match the canvas */}
      <img ref={still} className="pack-still" src={stillTop.src} width={stillTop.width} height={stillTop.height} alt="" decoding="async" />
      <canvas ref={canvas} aria-hidden />
      <div ref={hintEl} className="pack-hint" lang="fa" aria-hidden>
        <span>{hint}</span>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 13 12.5 3.5M6 3.5h6.5V10" />
        </svg>
      </div>
      {/* A real button, so the lid can also be opened from the keyboard. */}
      <button
        ref={grab}
        type="button"
        className="pack-grab"
        data-cursor="drag"
        aria-label={hint}
        onClick={(e) => {
          if (e.detail === 0) stage.current?.peelNow()
        }}
      />
    </div>
  )
}

export default PeelLid
