'use client'

import { useEffect, useRef } from 'react'
import './touches.css'

type Labels = { view: string; drag: string }

const TARGETS = 'a, button, [role="button"], summary, label, select, [data-cursor]'
const TEXT = 'input, textarea, select, [contenteditable="true"]'

/**
 * On computers the mouse becomes a small gold dot with a ring that follows a little behind. Over links and
 * buttons the ring grows; over anything marked `data-cursor` ("view" for a product card, "drag" for a toy,
 * or any short word) it fills with gold and shows that word. Typing fields keep the normal cursor.
 * Phones, tablets and visitors who prefer less motion keep their own pointer.
 */
export function GoldCursor({ labels }: { labels: Labels }) {
  const dotRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    const text = textRef.current
    if (!dot || !ring || !text) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!fine.matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    let x = -100
    let y = -100
    let rx = -100
    let ry = -100
    let frame = 0
    let started = false
    let lastTarget: Element | null = null

    const follow = () => {
      rx += (x - rx) * 0.2
      ry += (y - ry) * 0.2
      ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`
      frame = Math.abs(x - rx) + Math.abs(y - ry) > 0.3 ? requestAnimationFrame(follow) : 0
    }

    const describe = (el: Element | null) => {
      if (el === lastTarget) return
      lastTarget = el
      // Typing fields, and toys that draw their own pointer (data-cursor="none"), hide the gold cursor.
      const typing = el?.closest(TEXT) || el?.closest('[data-cursor="none"]')
      if (typing) root.setAttribute('data-gc-text', '')
      else root.removeAttribute('data-gc-text')
      const hit = el?.closest(TARGETS) ?? null
      const word = hit?.closest('[data-cursor]')?.getAttribute('data-cursor')
      if (word) {
        text.textContent = word === 'view' ? labels.view : word === 'drag' ? labels.drag : word
        ring.dataset.state = 'label'
      } else if (hit) {
        ring.dataset.state = 'hover'
      } else {
        delete ring.dataset.state
      }
    }

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      if (!started) {
        started = true
        rx = x
        ry = y
        root.setAttribute('data-gold-cursor', '')
      }
      root.removeAttribute('data-gc-away')
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      describe(e.target as Element | null)
      if (!frame) frame = requestAnimationFrame(follow)
    }
    const leave = (e: MouseEvent) => {
      if (!e.relatedTarget) root.setAttribute('data-gc-away', '')
    }
    const down = () => root.setAttribute('data-gc-down', '')
    const up = () => root.removeAttribute('data-gc-down')
    // Content that changes under a still mouse (a menu opening) is re-checked on scroll.
    const recheck = () => {
      lastTarget = null
      if (started) describe(document.elementFromPoint(x, y))
    }

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('mouseout', leave)
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('scroll', recheck, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('mouseout', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('scroll', recheck)
      if (frame) cancelAnimationFrame(frame)
      for (const name of ['data-gold-cursor', 'data-gc-away', 'data-gc-text', 'data-gc-down']) root.removeAttribute(name)
    }
  }, [labels.view, labels.drag])

  return (
    <>
      <span ref={ringRef} aria-hidden className="gc-ring">
        <span ref={textRef} />
      </span>
      <span ref={dotRef} aria-hidden className="gc-dot" />
    </>
  )
}
