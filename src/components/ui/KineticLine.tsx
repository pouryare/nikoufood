'use client'

import { useEffect, useRef } from 'react'

/**
 * The closing sentence, huge, outlined in thin gold and drifting slowly across the screen. Wherever the
 * mouse (or a finger) goes, the letters fill with solid gold like a lamp held over them; when nobody
 * points at it, the light wanders by itself. Decorative: the real title sits next to it for screen readers.
 */
export function KineticLine({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = ref.current
    if (!stage) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let held = false
    let frame = 0
    let visible = false
    const t0 = performance.now()
    const set = (x: number, y: number) => {
      stage.style.setProperty('--mx', `${x.toFixed(0)}px`)
      stage.style.setProperty('--my', `${y.toFixed(0)}px`)
    }
    const wander = (now: number) => {
      frame = 0
      if (!held) {
        const s = (now - t0) / 1000
        set(
          stage.clientWidth * (0.5 + 0.38 * Math.sin(s * 0.5)),
          stage.clientHeight * (0.5 + 0.28 * Math.sin(s * 1.2)),
        )
      }
      if (visible && !still) frame = requestAnimationFrame(wander)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !frame) frame = requestAnimationFrame(wander)
    })
    io.observe(stage)
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      held = true
      set(e.clientX - r.left, e.clientY - r.top)
    }
    const onLeave = () => {
      held = false
      if (still) set(stage.clientWidth / 2, stage.clientHeight / 2)
    }
    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerleave', onLeave)
    set(stage.clientWidth / 2, stage.clientHeight / 2)
    return () => {
      io.disconnect()
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const copies = [0, 1, 2, 3]
  return (
    <div ref={ref} aria-hidden className="kinetic-stage">
      <div className="kinetic-track kinetic-outline">
        {copies.map((i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
      <div className="kinetic-fill">
        <div className="kinetic-track">
          {copies.map((i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
