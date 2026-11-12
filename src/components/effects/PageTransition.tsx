'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/webgl'

type Drip = { cx: number; hw: number; len: number }

const COVER_MS = 620
/** How long the logo stays on the gold at least. */
const HOLD_MS = 440
const REVEAL_MS = 720
/** If the new page takes longer than this, the curtain opens anyway. */
const GIVE_UP_MS = 8000

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** A curtain of melted butter: a straight top edge far above, and drops hanging from its lower edge. */
function curtain(w: number, h: number, drips: Drip[], base: number, stretch: number) {
  let d = `M-8 ${-h}L${w + 8} ${-h}L${w + 8} ${base}`
  for (const { cx, hw, len } of drips) {
    const tip = base + len * stretch
    d += `L${cx + hw} ${base}C${cx + hw * 0.25} ${base} ${cx + hw * 1.05} ${tip} ${cx} ${tip}C${cx - hw * 1.05} ${tip} ${cx - hw * 0.25} ${base} ${cx - hw} ${base}`
  }
  return `${d}L-8 ${base}Z`
}

function makeDrips(w: number): Drip[] {
  const count = Math.max(7, Math.round(w / 90))
  const slot = w / count
  return Array.from({ length: count }, (_, i) => ({
    cx: w - (i + 0.15 + Math.random() * 0.7) * slot,
    hw: 12 + Math.random() * 22,
    len: 40 + Math.random() * 150,
  }))
}

const isPlainClick = (e: MouseEvent) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

/**
 * Between pages, melted gold pours down over the screen, the N logo shows for a moment,
 * and the gold flows away to reveal the new page. Only plain clicks on links to another page
 * of this site start it; new tabs, downloads, the admin panel and same-page links behave as usual.
 */
export function PageTransition({ children }: { children?: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [busy, setBusy] = useState(false)
  const [logo, setLogo] = useState(false)
  const run = useRef<{
    from: string
    covered: boolean
    arrived: boolean
    drips: Drip[]
    w: number
    h: number
    giveUp: number
  } | null>(null)

  const reveal = () => {
    const state = run.current
    const svg = svgRef.current
    const path = pathRef.current
    if (!state || !svg || !path) return
    window.clearTimeout(state.giveUp)
    setLogo(false)
    const start = performance.now()
    const step = (now: number) => {
      const k = ease(clamp01((now - start) / REVEAL_MS))
      path.setAttribute('transform', `translate(0 ${((state.h + 200) * k).toFixed(1)})`)
      if (k < 1) requestAnimationFrame(step)
      else {
        path.setAttribute('d', '')
        path.removeAttribute('transform')
        run.current = null
        setBusy(false)
      }
    }
    // Two frames so the new page has painted under the curtain first.
    requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(step)))
  }

  // The new page is here: open the curtain once it has fully closed.
  useEffect(() => {
    const state = run.current
    if (!state || pathname === state.from) return
    state.arrived = true
    if (state.covered) reveal()
  }, [pathname])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || !isPlainClick(e)) return
      const a = (e.target as Element | null)?.closest?.('a')
      if (!a || !a.href) return
      if (
        (a.target && a.target !== '_self') ||
        a.hasAttribute('download') ||
        a.hasAttribute('data-no-transition')
      )
        return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) return
      if (url.pathname === window.location.pathname) return
      if (prefersReducedMotion()) return
      e.preventDefault()
      if (run.current) return

      const svg = svgRef.current
      const path = pathRef.current
      if (!svg || !path) {
        router.push(url.pathname + url.search + url.hash)
        return
      }
      const w = window.innerWidth
      const h = window.innerHeight
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      const drips = makeDrips(w)
      const state = {
        from: window.location.pathname,
        covered: false,
        arrived: false,
        drips,
        w,
        h,
        giveUp: window.setTimeout(() => {
          if (run.current && !run.current.arrived) {
            run.current.arrived = true
            if (run.current.covered) reveal()
          }
        }, GIVE_UP_MS),
      }
      run.current = state
      setBusy(true)
      router.prefetch(url.pathname)
      const maxLen = 200
      const start = performance.now()
      const step = (now: number) => {
        const t = now - start
        const k = ease(clamp01(t / COVER_MS))
        path.setAttribute(
          'd',
          curtain(w, h, drips, -maxLen + (h + maxLen + 12) * k, clamp01(t / (COVER_MS * 0.5))),
        )
        if (t < COVER_MS) {
          requestAnimationFrame(step)
          return
        }
        setLogo(true)
        router.push(url.pathname + url.search + url.hash)
        window.setTimeout(() => {
          if (!run.current) return
          run.current.covered = true
          if (run.current.arrived) reveal()
        }, HOLD_MS)
      }
      requestAnimationFrame(step)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
    // `reveal` only reads refs, so the listener does not need to change with it.
  }, [router])

  return (
    <div aria-hidden className="page-curtain" data-busy={busy ? '' : undefined}>
      <svg ref={svgRef} className="page-curtain-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="page-curtain-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--nk-gold)" />
            <stop offset="0.72" stopColor="var(--nk-gold)" />
            <stop offset="0.9" stopColor="var(--nk-cream)" />
            <stop offset="1" stopColor="color-mix(in oklab, var(--nk-gold) 70%, #6b3f0c)" />
          </linearGradient>
        </defs>
        <path ref={pathRef} fill="url(#page-curtain-gold)" />
      </svg>
      <div className="page-curtain-logo" data-on={logo ? '' : undefined}>
        {children}
      </div>
    </div>
  )
}
