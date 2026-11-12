'use client'

import { useCallback, useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import { EXPLODED_STILL, explodedPadding, hasWebGL, placeStill } from './packLayout'
import type { ExplodedAnchors, ExplodedStage } from './packStage'
import stillClosed from './still-closed.webp'
import './pack.css'

export type ExplodedPackLabels = { lid: string; butter: string; tray: string }

/** For callers that drive the pack from a scroll handler and want to skip React entirely. */
export type ExplodedPackHandle = { setProgress: (progress: number) => void }

type Props = {
  /** 0 = closed pack, 1 = lid, butter and tray fully apart. */
  progress: number
  labels?: ExplodedPackLabels
  className?: string
  ref?: Ref<ExplodedPackHandle>
}

const DEFAULT_LABELS: ExplodedPackLabels = { lid: 'درِ فویلی', butter: 'کره', tray: 'ظرف فرم‌سیل' }
const PARTS = ['lid', 'butter', 'tray'] as const

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** A single-serve pack that comes apart as `progress` goes from 0 to 1, with the three parts named. */
export function ExplodedPack({ progress, labels = DEFAULT_LABELS, className, ref }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const still = useRef<HTMLImageElement>(null)
  const labelEls = useRef<Record<(typeof PARTS)[number], HTMLDivElement | null>>({ lid: null, butter: null, tray: null })
  const stage = useRef<ExplodedStage | null>(null)
  const current = useRef(progress)
  const width = useRef(0)

  // Everything that follows progress is written straight to the DOM and the scene: no React state.
  const apply = useCallback((p: number) => {
    p = clamp01(Number.isFinite(p) ? p : 0)
    current.current = p
    const shown = clamp01((p - 0.55) / 0.25)
    for (const part of PARTS) {
      const el = labelEls.current[part]
      if (el) el.style.opacity = String(shown)
    }
    stage.current?.setProgress(p)
  }, [])

  useImperativeHandle(ref, () => ({ setProgress: apply }), [apply])

  useEffect(() => {
    apply(progress)
  }, [progress, apply])

  useEffect(() => {
    const host = root.current
    const cv = canvas.current
    if (!host || !cv) return
    let live = true
    let made: ExplodedStage | null = null

    // One size handler for both layers: the still is placed first, the live scene once it exists.
    const size = () => {
      const rect = host.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return
      width.current = rect.width
      if (still.current) placeStill(still.current, rect.width, rect.height, explodedPadding(rect.width), EXPLODED_STILL)
      made?.resize(rect.width, rect.height)
    }
    size()
    const observer = new ResizeObserver(size)
    observer.observe(host)

    const place = (anchors: ExplodedAnchors) => {
      for (const part of PARTS) {
        const el = labelEls.current[part]
        if (!el) continue
        const [x, y] = anchors[part]
        // Leaders stay short on wide screens: the name sits near its part, not at the far edge.
        el.style.width = `${Math.max(40, Math.min(width.current - 12 - x, 250))}px`
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translateY(-50%)`
      }
    }

    const start = async () => {
      if (!hasWebGL()) return
      try {
        // three.js and the scene are fetched only now, when the pack is close to the screen.
        const { createExplodedStage } = await import('./packStage')
        if (!live) return
        made = createExplodedStage(cv, { onLayout: place, onFirstFrame: () => host.setAttribute('data-ready', 'true') })
        stage.current = made
        size()
        made.setProgress(current.current)
      } catch {
        // No WebGL: the closed still stays up, which is still a correct picture of the pack.
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
      stage.current?.dispose()
      stage.current = null
      host.removeAttribute('data-ready')
    }
  }, [])

  return (
    <div ref={root} className={className ? `pack-stage ${className}` : 'pack-stage'}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a plain image: it must be placed by hand to match the canvas */}
      <img ref={still} className="pack-still" src={stillClosed.src} width={stillClosed.width} height={stillClosed.height} alt="" decoding="async" />
      <canvas ref={canvas} aria-hidden />
      {PARTS.map((part) => (
        <div
          key={part}
          className="pack-label"
          ref={(el) => {
            labelEls.current[part] = el
          }}
        >
          <i className="pack-label-dot" />
          <i className="pack-label-line" />
          <span className="pack-label-text" lang="fa">
            {labels[part]}
          </span>
        </div>
      ))}
    </div>
  )
}

export default ExplodedPack
