'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * One observer for the whole page: any element with `data-reveal` fades and rises into place
 * the first time it enters the viewport. Keeps the animated pages as plain server components.
 */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const reveal = (el: Element) => el.setAttribute('data-revealed', '')
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach(reveal)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target)
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    const scan = () => document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((el) => io.observe(el))
    scan()
    // Content that streams in later (or client-rendered lists) is picked up as well.
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
