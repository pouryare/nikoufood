'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/webgl'

type Props = { lamp: boolean; pattern: boolean; grain: boolean }

/** How far behind the pointer the lamp trails (0–1 per frame; smaller is softer). */
const FOLLOW = 0.16

/**
 * The room the site sits in: a warm lamp that follows the mouse (a slow drift on phones),
 * a faint Persian pattern that only shows where that light falls, and a fine film grain.
 * Cards marked `data-lit` catch the same light on their edges.
 * Everything here moves with transforms only, so the browser never has to repaint the page for it.
 */
export function Ambience({ lamp, pattern, grain }: Props) {
  const lampRef = useRef<HTMLDivElement>(null)
  const patternRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const litRef = useRef<{ visible: Set<HTMLElement>; io: IntersectionObserver | null }>({
    visible: new Set(),
    io: null,
  })

  useEffect(() => {
    const el = lampRef.current
    if (!lamp || !el) return
    const root = document.documentElement
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const still = prefersReducedMotion()
    const size = () => el.offsetWidth || 1

    let x = window.innerWidth * 0.72
    let y = window.innerHeight * 0.3
    let tx = x
    let ty = y
    let frame = 0
    let lastInput = -1e9
    let litDirty = true

    const place = () => {
      const half = size() / 2
      el.style.transform = `translate3d(${(x - half).toFixed(1)}px, ${(y - half).toFixed(1)}px, 0)`
      if (patternRef.current)
        patternRef.current.style.transform = `translate3d(${(half - x).toFixed(1)}px, ${(half - y).toFixed(1)}px, 0)`
    }
    const paintLit = () => {
      litDirty = false
      if (!fine) return
      for (const node of litRef.current.visible) {
        const r = node.getBoundingClientRect()
        node.style.setProperty('--lx', `${(x - r.left).toFixed(0)}px`)
        node.style.setProperty('--ly', `${(y - r.top).toFixed(0)}px`)
      }
    }

    const tick = (now: number) => {
      frame = 0
      if (!fine && now - lastInput > 2600) {
        // Phones and tablets: the lamp wanders slowly by itself between touches.
        const s = now / 1000
        tx = window.innerWidth * (0.5 + 0.34 * Math.sin(s * 0.21))
        ty = window.innerHeight * (0.45 + 0.3 * Math.sin(s * 0.17 + 1.3))
      }
      const dx = tx - x
      const dy = ty - y
      const moving = Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4
      if (moving) {
        x += dx * FOLLOW
        y += dy * FOLLOW
        place()
        litDirty = true
      }
      if (litDirty) paintLit()
      if (moving || !fine) frame = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    place()
    if (still) {
      paintLit()
      return
    }

    const onMove = (e: PointerEvent) => {
      if (fine && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      tx = e.clientX
      ty = e.clientY
      lastInput = performance.now()
      wake()
    }
    const onScroll = () => {
      litDirty = true
      wake()
    }
    if (fine) root.setAttribute('data-lamp', '')
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    wake()
    return () => {
      root.removeAttribute('data-lamp')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [lamp])

  // Keep track of the lit cards that are on screen, page by page.
  useEffect(() => {
    if (!lamp || !('IntersectionObserver' in window)) return
    const state = litRef.current
    state.visible.clear()
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const node = entry.target as HTMLElement
        if (entry.isIntersecting) state.visible.add(node)
        else state.visible.delete(node)
      }
      window.dispatchEvent(new Event('scroll'))
    })
    state.io = io
    const scan = () =>
      document.querySelectorAll<HTMLElement>('[data-lit]').forEach((node) => io.observe(node))
    scan()
    const late = window.setTimeout(scan, 800)
    return () => {
      window.clearTimeout(late)
      io.disconnect()
      state.visible.clear()
    }
  }, [lamp, pathname])

  if (!lamp && !grain) return null
  return (
    <>
      {lamp ? (
        <div aria-hidden className="ambience">
          <div ref={lampRef} className="ambience-lamp">
            {pattern ? (
              <div className="ambience-window">
                <div ref={patternRef} className="ambience-pattern" />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {grain ? <div aria-hidden className="ambience-grain" /> : null}
    </>
  )
}
