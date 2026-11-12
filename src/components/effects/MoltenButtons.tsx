'use client'

import { useEffect } from 'react'
import './touches.css'

/**
 * Molten gold buttons: with the mouse over a button, gold pours down inside it with a few heavy drops.
 * The goo filter below melts the drops into the gold. On phones a tap pours the gold once.
 */
export function MoltenButtons() {
  useEffect(() => {
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      const btn = (e.target as Element | null)?.closest<HTMLElement>('.btn-molten')
      if (!btn) return
      btn.setAttribute('data-pour', '')
      window.setTimeout(() => btn.removeAttribute('data-pour'), 1400)
    }
    window.addEventListener('pointerdown', down, { passive: true })
    return () => window.removeEventListener('pointerdown', down)
  }, [])

  return (
    <svg aria-hidden width="0" height="0" style={{ position: 'absolute' }}>
      <filter id="nk-goo" x="-10%" y="-40%" width="120%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </svg>
  )
}
