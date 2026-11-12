'use client'

import { useEffect } from 'react'

/**
 * At the very end of every page, the page lifts like a lid and shows the footer waiting underneath,
 * with the brand's name set as large as the screen allows. Only when the footer fits on the screen;
 * a taller footer (most phones) simply follows the page as usual.
 */
export function FooterLift() {
  useEffect(() => {
    const root = document.documentElement
    const footer = document.querySelector<HTMLElement>('.site-footer')
    const name = footer?.querySelector<HTMLElement>('.footer-name')
    const word = name?.querySelector<HTMLElement>('span')
    if (!footer) return
    let frame = 0

    const fit = () => {
      if (!name || !word) return
      word.style.fontSize = '100px'
      const width = word.scrollWidth
      // The space inside the side padding, with a little room for letters that reach past their box.
      const cs = getComputedStyle(name)
      const room = name.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      if (width > 0)
        word.style.fontSize = `${Math.min(320, (room / width) * 100 * 0.96).toFixed(1)}px`
    }
    const update = () => {
      frame = 0
      const r = footer.getBoundingClientRect()
      const h = window.innerHeight
      const p = Math.min(1, Math.max(0, (h - r.top) / Math.max(1, r.height)))
      footer.style.setProperty('--fp', p.toFixed(3))
    }
    const measure = () => {
      fit()
      root.toggleAttribute('data-lift', footer.offsetHeight < window.innerHeight * 0.9)
      update()
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    measure()
    void document.fonts?.ready.then(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(footer)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      if (frame) cancelAnimationFrame(frame)
      root.removeAttribute('data-lift')
    }
  }, [])
  return null
}
