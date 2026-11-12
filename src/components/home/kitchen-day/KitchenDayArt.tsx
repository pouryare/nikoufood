'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { createKitchenScene, type KitchenScene } from './kitchen-day-scene'
import './kitchen-day.css'

export type KitchenDayHandle = { setTime: (t: number) => void } // t: 0 = 7:00 morning, 1 = 21:00 night

type Props = { initialTime?: number; className?: string; label?: string }

export const KitchenDayArt = forwardRef<KitchenDayHandle, Props>(function KitchenDayArt(
  { initialTime = 0.2, className, label = 'نمای پنجرهٔ آشپزخانه رو به تهران، از صبح تا شب' },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // everything the frame loop needs lives in refs so a new time never re-renders React
  const live = useRef<{ scene: KitchenScene | null; t: number; visible: boolean; still: boolean }>({
    scene: null,
    t: initialTime,
    visible: true,
    still: false,
  })

  useImperativeHandle(
    ref,
    () => ({
      setTime(t: number) {
        const s = live.current
        s.t = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0
        // off screen: remember the time, skip the drawing
        if (s.scene && s.visible) s.scene.draw(s.t, s.still ? 0 : performance.now())
      },
    }),
    [],
  )

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const s = live.current
    const scene = createKitchenScene(canvas)
    s.scene = scene
    // steam is the only thing that moves by the clock; hold it still when motion is unwanted
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    s.still = mq.matches
    const onMq = () => {
      s.still = mq.matches
    }
    mq.addEventListener('change', onMq)

    let raf = 0
    const fit = () => {
      raf = 0
      const r = wrap.getBoundingClientRect()
      scene.resize(r.width, r.height, window.devicePixelRatio || 1)
      scene.draw(s.t, s.still ? 0 : performance.now())
    }
    fit()
    const ro = new ResizeObserver(() => {
      if (!raf) raf = requestAnimationFrame(fit)
    })
    ro.observe(wrap)
    const io = new IntersectionObserver(
      ([entry]) => {
        s.visible = entry.isIntersecting
        if (s.visible) scene.draw(s.t, s.still ? 0 : performance.now())
      },
      { rootMargin: '120px' },
    )
    io.observe(wrap)
    return () => {
      mq.removeEventListener('change', onMq)
      ro.disconnect()
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
      s.scene = null
    }
  }, [])

  return (
    <div ref={wrapRef} className={className ? `kitchen-day-art ${className}` : 'kitchen-day-art'} role="img" aria-label={label}>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  )
})
