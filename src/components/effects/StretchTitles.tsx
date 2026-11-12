'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import './touches.css'

type Spring = { el: HTMLElement; x: number; v: number; k: number; amount: number }

/**
 * Big titles marked `data-stretch` are soft: a fast scroll stretches them a little in the direction of
 * travel, and they spring back like soft butter when the page stops. A normal, slow scroll leaves them
 * alone. Only titles on screen are moved. The value of `data-stretch` sets the strength (default 1).
 */
export function StretchTitles() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const springs = new Map<HTMLElement, Spring>()
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement
        if (entry.isIntersecting) {
          if (!springs.has(el)) {
            const amount = Number(el.dataset.stretch) || 1
            // Titles further down the list answer a touch later, so a group of words ripples.
            springs.set(el, { el, x: 0, v: 0, k: 0.15 - Math.min(0.06, springs.size * 0.02), amount })
          }
        } else {
          const s = springs.get(el)
          if (s) s.el.style.transform = ''
          springs.delete(el)
        }
      }
    })
    const watch = () => document.querySelectorAll<HTMLElement>('[data-stretch]').forEach((el) => io.observe(el))
    watch()
    // Pinned sections and late content can add titles after the first look.
    const late = window.setTimeout(watch, 1500)

    let impulse = 0
    let lastY = window.scrollY
    let lastT = performance.now()
    let frame = 0
    const tick = () => {
      let moving = Math.abs(impulse) > 0.002
      for (const s of springs.values()) {
        s.v += (impulse * s.amount - s.x) * s.k
        s.v *= 0.72
        s.x += s.v
        if (Math.abs(s.x) > 0.001 || Math.abs(s.v) > 0.001) moving = true
        const a = s.x
        s.el.style.transform = moving
          ? `scaleY(${(1 + Math.abs(a) * 0.32).toFixed(3)}) scaleX(${(1 - Math.abs(a) * 0.06).toFixed(3)}) skewX(${(a * -9).toFixed(2)}deg)`
          : ''
      }
      impulse *= 0.86
      if (Math.abs(impulse) < 0.002) impulse = 0
      frame = moving ? requestAnimationFrame(tick) : 0
    }
    const onScroll = () => {
      const now = performance.now()
      const dy = window.scrollY - lastY
      const dt = Math.max(8, now - lastT)
      lastY = window.scrollY
      lastT = now
      const speed = (dy / dt) * 1000
      if (Math.abs(speed) > 900) impulse = Math.max(-1, Math.min(1, speed / 4200))
      if (impulse && !frame && springs.size) frame = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(late)
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
      io.disconnect()
      for (const s of springs.values()) s.el.style.transform = ''
    }
  }, [pathname])

  return null
}
