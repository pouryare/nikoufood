'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/webgl'

/**
 * The page scrolls at a controlled pace. With a mouse the wheel glides instead of jumping; on a phone the
 * finger still moves the page one-to-one, but a hard flick can no longer throw it through several sections
 * at once: how far a flick may carry on is capped to part of a screen, so the animations tied to scrolling
 * are never skipped in a blink. The page still scrolls natively underneath (sticky sections and anchors keep
 * working). It pauses whenever something locks the page (the phone menu or the butter game), and any box
 * marked `data-lenis-prevent` keeps its own inner scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname()
  const ref = useRef<Lenis | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    // Phones and tablets are driven by touch; everything else by a wheel or a trackpad.
    const touch = window.matchMedia('(pointer: coarse)').matches
    gsap.registerPlugin(ScrollTrigger)
    const header = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    const lenis = new Lenis({
      lerp: touch ? 0.09 : 0.11,
      syncTouch: touch,
      // After the finger lifts the page coasts a short way and settles, instead of flying on.
      syncTouchLerp: 0.07,
      // Lists and fields that scroll inside themselves (the chat, a text box) keep doing so.
      allowNestedScroll: true,
      anchors: { offset: -header },
      autoRaf: false,
    })
    // The speed limit: a scroll the visitor starts (finger flick, wheel spin) may run ahead of the page by
    // at most part of a screen. Scrolls started by the site itself (the page map) are left alone.
    const reach = () => window.innerHeight * (touch ? 0.7 : 1)
    const scrollTo = lenis.scrollTo.bind(lenis) as (target: unknown, options?: Record<string, unknown>) => void
    ;(lenis as unknown as { scrollTo: typeof scrollTo }).scrollTo = (target, options) => {
      if (options?.programmatic === false && typeof target === 'number') {
        const from = lenis.animatedScroll
        const room = reach()
        target = Math.min(from + room, Math.max(from - room, target))
      }
      scrollTo(target, options)
    }
    // On a phone the page coasts a little after the finger lifts, by our own measure: how fast the finger was
    // moving at the end decides how far, and never more than part of a screen (the speed limit above).
    if (touch) {
      let moves: { at: number; dy: number }[] = []
      // The time stamp the phone put on each touch (not the time the page got round to it), so a busy frame
      // never changes how fast the finger seems to have moved.
      lenis.on('virtual-scroll', ({ deltaY, event }: { deltaY: number; event: Event }) => {
        const now = event.timeStamp
        if (event.type === 'touchstart') moves = []
        else if (event.type === 'touchmove') moves = [...moves.filter((m) => now - m.at < 140), { at: now, dy: deltaY }]
        else if (event.type === 'touchend') {
          const last = moves[moves.length - 1]
          const recent = moves.filter((m) => now - m.at < 140)
          moves = []
          // A finger that stopped before lifting leaves the page where it is.
          if (!last || now - last.at > 100 || recent.length < 2) return
          const first = recent[0]
          // px per ms over the last stretch (the first move only marks where the stretch begins).
          const speed = recent.slice(1).reduce((sum, m) => sum + m.dy, 0) / Math.max(24, last.at - first.at)
          if (Math.abs(speed) < 0.25) return
          // Lenis settles its own end-of-touch first; ours follows on the next frame.
          requestAnimationFrame(() => lenis.scrollTo(lenis.targetScroll + speed * 170, { programmatic: false, lerp: 0.07 }))
        }
      })
    }
    ref.current = lenis
    // Other parts of the site (the page map) glide through the same scroller instead of fighting it.
    ;(window as Window & { nkLenis?: Lenis }).nkLenis = lenis
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
      delete (window as Window & { nkLenis?: Lenis }).nkLenis
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
