'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/webgl'

/**
 * Mouse-wheel scrolling glides instead of jumping. The page still scrolls natively underneath
 * (pinned sections, sticky headers and anchors keep working); touch screens keep their own feel.
 * It pauses whenever something locks the page (the phone menu), and any box marked
 * `data-lenis-prevent` keeps its own inner scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname()
  const ref = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion())
      return
    gsap.registerPlugin(ScrollTrigger)
    const header = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    const lenis = new Lenis({
      lerp: 0.11,
      anchors: { offset: -header },
      autoRaf: false,
    })
    ref.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)

    const body = document.body
    const sync = () => (body.style.overflow === 'hidden' ? lenis.stop() : lenis.start())
    const mo = new MutationObserver(sync)
    mo.observe(body, { attributes: true, attributeFilter: ['style'] })

    return () => {
      mo.disconnect()
      gsap.ticker.remove(tick)
      lenis.destroy()
      ref.current = null
    }
  }, [])

  // A new page starts from wherever the browser put it, not from a glide left over from the last page.
  useEffect(() => {
    const lenis = ref.current
    if (!lenis || document.body.style.overflow === 'hidden') return
    lenis.stop()
    lenis.start()
  }, [pathname])

  return null
}
