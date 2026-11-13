'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/webgl'

/** Where on the screen the thread's tip sits while scrolling (0 = top, 1 = bottom). */
const TIP = 0.64
const SAMPLES = 480

type Sample = { x: number; y: number; l: number }

/**
 * One thin line of melted gold that runs down the home page after the film and ties the sections
 * together. It runs in the side margin, dips into each section's small gold label (anything marked
 * `data-thread`) and lights it as it arrives, and ends in a drop under the last button
 * (`data-thread="end"`). The line draws itself as the visitor scrolls; on phones it stays close to the edge.
 */
export function GoldenThread({ children }: { children: ReactNode }) {
  const zoneRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const baseRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGPathElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const headRef = useRef<HTMLSpanElement>(null)
  const dropRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const zone = zoneRef.current
    const svg = svgRef.current
    const paths = [baseRef.current, glowRef.current, lineRef.current]
    const head = headRef.current
    const drop = dropRef.current
    if (!zone || !svg || paths.some((p) => !p) || !head || !drop) return
    const [base, glow, line] = paths as SVGPathElement[]
    const still = prefersReducedMotion()

    let samples: Sample[] = []
    let total = 0
    let anchors: { el: HTMLElement; y: number }[] = []
    let endY = Infinity
    let frame = 0
    let lastLen = -1

    const build = () => {
      const zr = zone.getBoundingClientRect()
      const w = zone.clientWidth
      const h = zone.offsetHeight
      if (!w || !h) return
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
      svg.style.height = `${h}px`

      const nodes = Array.from(zone.querySelectorAll<HTMLElement>('[data-thread]')).filter(
        (el) => el.offsetParent !== null,
      )
      const points = nodes
        .map((el) => {
          const r = el.getBoundingClientRect()
          const end = el.dataset.thread === 'end'
          return {
            el,
            end,
            x: end ? r.left + r.width / 2 - zr.left : r.right - zr.left,
            y: end ? r.bottom - zr.top + 26 : r.top - zr.top + r.height / 2,
          }
        })
        .sort((a, b) => a.y - b.y)
      const labels = points.filter((p) => !p.end)
      const finish = points.find((p) => p.end)

      // The side margin on the right (this is a right-to-left page): close to the text on phones,
      // a little further out on wide screens.
      const contentRight = labels.length ? Math.max(...labels.map((p) => p.x)) : w - 24
      const phone = w < 768
      const gutter = phone
        ? Math.min(w - 8, contentRight + 10)
        : Math.min(contentRight + 76, (contentRight + w) / 2)
      const dip = phone ? 34 : 70

      // It comes out of the middle, where the film's line was, and moves to the margin before any text starts.
      // (Phones have no room above the first label, so there it simply starts in the margin.)
      let d = phone
        ? `M${gutter.toFixed(1)} 0`
        : `M${(w / 2).toFixed(1)} 0C${(w / 2).toFixed(1)} 55 ${gutter.toFixed(1)} 55 ${gutter.toFixed(1)} 110`
      let y = phone ? 0 : 110
      anchors = []
      for (const p of labels) {
        // Only labels that sit at the right-hand edge of the text get a visit; centred ones are passed by.
        if (p.x < contentRight - 40 || p.y - dip < y) continue
        const ax = p.x + 2
        d += `L${gutter.toFixed(1)} ${(p.y - dip).toFixed(1)}`
        d += `C${gutter.toFixed(1)} ${(p.y - dip * 0.35).toFixed(1)} ${(ax + (gutter - ax) * 0.45).toFixed(1)} ${p.y.toFixed(1)} ${ax.toFixed(1)} ${p.y.toFixed(1)}`
        d += `C${(ax + (gutter - ax) * 0.45).toFixed(1)} ${p.y.toFixed(1)} ${gutter.toFixed(1)} ${(p.y + dip * 0.35).toFixed(1)} ${gutter.toFixed(1)} ${(p.y + dip).toFixed(1)}`
        y = p.y + dip
        anchors.push({ el: p.el, y: p.y })
      }
      if (finish && finish.y - 140 > y) {
        d += `L${gutter.toFixed(1)} ${(finish.y - 140).toFixed(1)}`
        d += `C${gutter.toFixed(1)} ${(finish.y - 20).toFixed(1)} ${(finish.x + Math.min(160, Math.abs(gutter - finish.x) * 0.6)).toFixed(1)} ${finish.y.toFixed(1)} ${finish.x.toFixed(1)} ${finish.y.toFixed(1)}`
        drop.setAttribute('cx', finish.x.toFixed(1))
        drop.setAttribute('cy', finish.y.toFixed(1))
        drop.style.display = ''
        anchors.push({ el: finish.el, y: finish.y })
        endY = finish.y
      } else {
        d += `L${gutter.toFixed(1)} ${(h - 40).toFixed(1)}`
        drop.style.display = 'none'
        endY = Infinity
      }
      for (const p of [base, glow, line]) p.setAttribute('d', d)
      total = line.getTotalLength()
      samples = []
      for (let i = 0; i <= SAMPLES; i++) {
        const l = (total * i) / SAMPLES
        const pt = line.getPointAtLength(l)
        samples.push({ x: pt.x, y: pt.y, l })
      }
      for (const p of [glow, line]) {
        p.style.strokeDasharray = `${total} ${total + 10}`
      }
      lastLen = -1
      update()
    }

    /** The point on the line at the given depth (the line only ever goes down, so a binary search works). */
    const at = (depth: number) => {
      if (!samples.length) return null
      if (depth <= samples[0].y) return samples[0]
      const last = samples[samples.length - 1]
      if (depth >= last.y) return last
      let lo = 0
      let hi = samples.length - 1
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1
        if (samples[mid].y <= depth) lo = mid
        else hi = mid
      }
      const a = samples[lo]
      const b = samples[hi]
      const k = b.y === a.y ? 1 : (depth - a.y) / (b.y - a.y)
      return { x: a.x + (b.x - a.x) * k, y: depth, l: a.l + (b.l - a.l) * k }
    }

    const update = () => {
      frame = 0
      const depth = still ? Infinity : window.innerHeight * TIP - zone.getBoundingClientRect().top
      const p = at(depth)
      if (!p) return
      const len = p.l
      if (Math.abs(len - lastLen) < 0.5) return
      lastLen = len
      for (const path of [glow, line]) path.style.strokeDashoffset = `${(total - len).toFixed(1)}`
      // The glowing dot is not part of the scrolling page: it is held at the same height of the screen and only
      // slides sideways along the line. (Inside the page it would be moved by the scroll first and put back by
      // the script a moment later, which showed as a jump up and down while scrolling.)
      head.style.transform = `translate3d(${(zone.getBoundingClientRect().left + p.x).toFixed(1)}px, ${(window.innerHeight * TIP).toFixed(1)}px, 0)`
      head.style.opacity = len > 4 && depth < endY ? '1' : '0'
      for (const a of anchors) a.el.toggleAttribute('data-thread-on', a.y <= depth)
      zone.toggleAttribute('data-thread-done', depth >= endY)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    let rebuild = 0
    const scheduleBuild = () => {
      window.clearTimeout(rebuild)
      rebuild = window.setTimeout(build, 120)
    }
    build()
    // Pictures, the map and fonts arrive later and change the page's height.
    const ro = new ResizeObserver(scheduleBuild)
    ro.observe(zone)
    void document.fonts?.ready.then(scheduleBuild)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', scheduleBuild)
    return () => {
      ro.disconnect()
      window.clearTimeout(rebuild)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', scheduleBuild)
      if (frame) cancelAnimationFrame(frame)
      for (const a of anchors) a.el.removeAttribute('data-thread-on')
    }
  }, [])

  return (
    <div ref={zoneRef} className="thread-zone">
      <svg ref={svgRef} aria-hidden className="thread-svg" preserveAspectRatio="none">
        <defs>
          <radialGradient id="thread-head-glow">
            <stop offset="0" stopColor="var(--nk-cream)" stopOpacity="0.9" />
            <stop offset="0.35" stopColor="var(--nk-gold)" stopOpacity="0.45" />
            <stop offset="1" stopColor="var(--nk-gold)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path ref={baseRef} className="thread-base" />
        <path ref={glowRef} className="thread-glow" />
        <path ref={lineRef} className="thread-line" />
        <circle ref={dropRef} className="thread-drop" r="5" style={{ display: 'none' }} />
      </svg>
      <span ref={headRef} aria-hidden className="thread-head" style={{ opacity: 0 }}>
        <svg viewBox="-16 -16 32 32" width="32" height="32">
          <circle r="16" fill="url(#thread-head-glow)" />
          <circle r="2.6" className="thread-head-core" />
        </svg>
      </span>
      {children}
    </div>
  )
}
