'use client'

import { useEffect } from 'react'
import { prefersReducedMotion } from '@/lib/webgl'

/** How strongly a button leans toward the cursor, and the furthest it may move. */
const PULL = 0.3
const MAX = 10
const EASE = 0.2

type State = { x: number; y: number; tx: number; ty: number }

/**
 * Buttons (anything marked `data-magnetic`) lean a little toward the mouse and spring back when it leaves.
 * Mouse only: touch screens and visitors who prefer less motion keep still buttons.
 * Uses the separate `translate` property, so the buttons' own hover and press effects stay untouched.
 */
export function Magnetic() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion())
      return
    const items = new Map<HTMLElement, State>()
    let active: HTMLElement | null = null
    let frame = 0

    const tick = () => {
      frame = 0
      for (const [el, s] of items) {
        s.x += (s.tx - s.x) * EASE
        s.y += (s.ty - s.y) * EASE
        const settled = Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05
        if (settled && s.tx === 0 && s.ty === 0 && el !== active) {
          el.style.removeProperty('translate')
          items.delete(el)
          continue
        }
        el.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`
      }
      if (items.size) frame = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-magnetic]') ?? null
      if (el !== active && active) {
        const prev = items.get(active)
        if (prev) prev.tx = prev.ty = 0
      }
      active = el
      if (el) {
        let s = items.get(el)
        if (!s) items.set(el, (s = { x: 0, y: 0, tx: 0, ty: 0 }))
        const r = el.getBoundingClientRect()
        // The box already includes the current lean, so measure from where it would sit at rest.
        const cx = r.left + r.width / 2 - s.x
        const cy = r.top + r.height / 2 - s.y
        s.tx = Math.max(-MAX, Math.min(MAX, (e.clientX - cx) * PULL))
        s.ty = Math.max(-MAX, Math.min(MAX, (e.clientY - cy) * PULL))
      }
      if (items.size) wake()
    }
    const onLeave = () => {
      if (active) {
        const s = items.get(active)
        if (s) s.tx = s.ty = 0
        active = null
        wake()
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
      for (const el of items.keys()) el.style.removeProperty('translate')
    }
  }, [])

  return null
}
