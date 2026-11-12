'use client'

import { useEffect, useRef } from 'react'
import { emitSound } from '@/lib/sound'
import './butter-art.css'

type Rest = { hold: number; rot: number; spin: number }

/** How long the butter rests at each stop (in screen heights of scrolling), its tilt, and how it spins on the way in. */
const REST: Record<string, Rest> = {
  hero: { hold: 0.15, rot: -6, spin: 0 },
  intro: { hold: 0.5, rot: 14, spin: 1 },
  sizes: { hold: 0, rot: 0, spin: 0 },
  finder: { hold: 0.4, rot: -10, spin: -1 },
  table: { hold: 0, rot: 4, spin: 1 },
}

type Stop = {
  el: HTMLElement
  name: string
  pin: HTMLElement | null
  from: number
  to: number
  melt: boolean
  rest: Rest
  S: number
  D: number
  x: number
  y: number
  arrive: { x: number; y: number }
  leave: { x: number; y: number }
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/** A closed path through the points with every corner rounded by r (butter has no sharp corners). */
const roundPoly = (pts: [number, number][], r: number) => {
  const n = pts.length
  let d = ''
  for (let i = 0; i < n; i++) {
    const p = pts[i]
    const a = pts[(i + n - 1) % n]
    const b = pts[(i + 1) % n]
    const la = Math.hypot(a[0] - p[0], a[1] - p[1])
    const lb = Math.hypot(b[0] - p[0], b[1] - p[1])
    const ra = Math.min(r, la / 2) / la
    const rb = Math.min(r, lb / 2) / lb
    const f = (v: number) => v.toFixed(2)
    d += `${i ? 'L' : 'M'}${f(p[0] + (a[0] - p[0]) * ra)} ${f(p[1] + (a[1] - p[1]) * ra)}`
    d += `Q${f(p[0])} ${f(p[1])} ${f(p[0] + (b[0] - p[0]) * rb)} ${f(p[1] + (b[1] - p[1]) * rb)}`
  }
  return `${d}Z`
}
// The pat seen from above at an angle: its top, its whole outline, and the patch it stands on.
const PAT_TOP = roundPoly([[34, 3], [65, 18], [34, 33], [3, 18]], 6)
const PAT_BODY = roundPoly([[3, 18], [34, 3], [65, 18], [65, 31], [34, 46], [3, 31]], 5)
const PAT_FOOT = roundPoly([[34, 16], [65, 31], [34, 46], [3, 31]], 6)
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * One small piece of butter that travels down the home page as the visitor scrolls: it rests on the gold
 * word of the first screen, steps aside while the introduction is read, waits on the board while the big
 * block is cut, sits beside «کسب‌وکار شما چیست؟», and finally lands on the rice and melts into it
 * (with the sizzle, when sound is on). It hides while it is over the film or a section that covers it.
 * Stops are marked in the page with `data-butter-stop`; which ones are used is chosen in the CMS. Visitors who prefer less motion never see it.
 */
export function ButterJourney({ stops: enabled }: { stops: string[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tb = ref.current
    const inner = tb?.querySelector<HTMLElement>('.tb-in')
    if (!tb || !inner) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let stops: Stop[] = []
    let hides: HTMLElement[] = []
    const collect = () => {
      stops = Array.from(document.querySelectorAll<HTMLElement>('[data-butter-stop]'))
        .filter((el) => enabled.includes(el.dataset.butterStop ?? '') && el.offsetParent !== null)
        .map((el) => {
          const name = el.dataset.butterStop ?? ''
          return {
            el,
            name,
            pin: el.closest<HTMLElement>('[data-butter-pin]'),
            from: Number(el.dataset.from ?? 0),
            to: Number(el.dataset.to ?? 1),
            melt: name === 'table',
            rest: REST[name] ?? { hold: 0.3, rot: 0, spin: 0 },
            S: 0,
            D: 0,
            x: 0,
            y: 0,
            arrive: { x: 0, y: 0 },
            leave: { x: 0, y: 0 },
          }
        })
      hides = Array.from(document.querySelectorAll<HTMLElement>('[data-butter-hide]'))
      tb.toggleAttribute('data-off', stops.length === 0)
    }

    let frame = 0
    let lastKey = ''
    let lastS = 0
    let landed = false
    const place = () => {
      frame = 0
      if (!stops.length) return
      const s = window.scrollY
      const h = window.innerHeight
      const w = window.innerWidth
      const line = h * 0.55
      for (const st of stops) {
        const r = st.el.getBoundingClientRect()
        st.x = r.left
        st.y = r.top
        if (st.pin) {
          const pr = st.pin.getBoundingClientRect()
          const top = pr.top + s
          const span = Math.max(1, st.pin.offsetHeight - h)
          st.S = top + st.from * span
          st.D = top + st.to * span
          st.arrive = st.leave = { x: r.left, y: r.top - Math.min(0, pr.top) }
        } else {
          st.S = r.top + s - line
          st.D = st.S + st.rest.hold * h
          st.arrive = { x: r.left, y: line }
          st.leave = st.arrive
        }
      }
      // A stop is left early enough for the next leg to have room.
      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i]
        const b = stops[i + 1]
        if (!a.pin) {
          a.D = Math.min(a.D, Math.max(a.S, b.S - 0.3 * h))
          a.leave = { x: a.arrive.x, y: line - (a.D - a.S) }
        }
      }
      const first = stops[0]
      const last = stops[stops.length - 1]
      let x = first.x
      let y = first.y
      let rot = first.rest.rot
      let scale = 1
      let shadow = 1
      let key = 'r0'
      let melt = 0
      let sx = 1
      let sy = 1
      let op = 1
      const rest = (st: Stop, i: number) => {
        x = st.x
        y = st.y
        rot = st.rest.rot
        key = `r${i}`
      }
      if (s <= first.D) rest(first, 0)
      else if (s >= last.S) {
        rest(last, stops.length - 1)
        if (last.melt) {
          melt = clamp((s - last.S) / (0.3 * h))
          sy = 1 - 0.7 * melt
          sx = 1 + 0.45 * melt
          op = 1 - melt
        }
      } else {
        for (let i = 0; i < stops.length - 1; i++) {
          const a = stops[i]
          const b = stops[i + 1]
          if (s >= a.S && s <= a.D) {
            rest(a, i)
            break
          }
          if (s > a.D && s < b.S) {
            const t = (s - a.D) / (b.S - a.D)
            const te = ease(t)
            const arc = Math.min(0.2 * h, 150) * Math.sin(Math.PI * t)
            x = a.leave.x + (b.arrive.x - a.leave.x) * te
            y = a.leave.y + (b.arrive.y - a.leave.y) * te - arc
            rot = a.rest.rot + (b.rest.rot - a.rest.rot) * te + b.rest.spin * 360 * te
            scale = 1 + 0.18 * Math.sin(Math.PI * t)
            shadow = 1 - Math.sin(Math.PI * Math.min(1, t * 1.4))
            key = `t${i}`
            break
          }
        }
      }
      const half = (inner.offsetWidth || 60) / 2
      x = clamp(x, half + 8, w - half - 8)
      tb.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      inner.style.transform = `rotate(${rot.toFixed(2)}deg) scale(${(scale * sx).toFixed(3)}, ${(scale * sy).toFixed(3)})`
      inner.style.opacity = op.toFixed(3)
      tb.style.setProperty('--sh', clamp(shadow).toFixed(3))
      // Only for the look: the pat softens and turns glossy as it melts.
      tb.style.setProperty('--melt', melt.toFixed(3))
      if (last.melt) last.el.parentElement?.style.setProperty('--m', melt.toFixed(3))
      // It hides while it is over a film, a full-screen clip, the showroom or a sheet sliding over the table.
      const hidden = hides.some((el) => {
        const r = el.getBoundingClientRect()
        return r.top < y && r.bottom > y
      })
      tb.toggleAttribute('data-hidden', hidden)
      // A small squash each time it lands while scrolling down; the sizzle when it reaches the rice.
      if (key !== lastKey && key[0] === 'r' && lastKey[0] === 't' && s > lastS) {
        tb.removeAttribute('data-land')
        void tb.offsetWidth
        tb.setAttribute('data-land', '')
        if (key === `r${stops.length - 1}` && last.melt && !landed) {
          landed = true
          emitSound('sizzle')
        }
      }
      if (s < last.S - h) landed = false
      lastKey = key
      lastS = s
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place)
    }
    let timer = 0
    const refresh = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        collect()
        place()
      }, 150)
    }
    collect()
    place()
    tb.setAttribute('data-ready', '')
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', refresh)
    window.addEventListener('load', refresh)
    void document.fonts?.ready.then(refresh)
    const ro = new ResizeObserver(refresh)
    ro.observe(document.body)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', refresh)
      window.removeEventListener('load', refresh)
      ro.disconnect()
      window.clearTimeout(timer)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [enabled])

  return (
    <div ref={ref} aria-hidden className="tb">
      <div className="tb-in">
        <div className="tb-squash">
          <svg viewBox="0 0 68 50">
            <defs>
              <linearGradient id="tb-top" x1="0.1" y1="0.15" x2="0.9" y2="0.85">
                <stop offset="0" stopColor="#fff8d9" />
                <stop offset="0.5" stopColor="#fbe7a6" />
                <stop offset="1" stopColor="#f1d27c" />
              </linearGradient>
              {/* Across the two visible sides: lit left side, soft front corner, shaded right side. */}
              <linearGradient id="tb-side" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#dcaa48" />
                <stop offset="0.07" stopColor="#efc869" />
                <stop offset="0.42" stopColor="#eabf5d" />
                <stop offset="0.5" stopColor="#e2b450" />
                <stop offset="0.58" stopColor="#d19b3a" />
                <stop offset="0.93" stopColor="#c58e30" />
                <stop offset="1" stopColor="#ad7a24" />
              </linearGradient>
              <linearGradient id="tb-ao" gradientUnits="userSpaceOnUse" x1="0" y1="24" x2="0" y2="47">
                <stop offset="0" stopColor="#8a4f08" stopOpacity="0" />
                <stop offset="0.6" stopColor="#8a4f08" stopOpacity="0.1" />
                <stop offset="1" stopColor="#7a4204" stopOpacity="0.5" />
              </linearGradient>
              <radialGradient id="tb-spec" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#fffef6" stopOpacity="0.95" />
                <stop offset="1" stopColor="#fffef6" stopOpacity="0" />
              </radialGradient>
              <filter id="tb-soft" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="0.7" />
              </filter>
              <filter id="tb-blur" x="-40%" y="-80%" width="180%" height="260%">
                <feGaussianBlur stdDeviation="2.4" />
              </filter>
              <clipPath id="tb-clip-top">
                <path d={PAT_TOP} />
              </clipPath>
              <clipPath id="tb-clip-all">
                <path d={PAT_BODY} />
              </clipPath>
            </defs>
            {/* Contact shadow: the footprint, pushed a little away from the light. */}
            <g className="tb-shadow">
              <path d={PAT_FOOT} fill="#000" opacity="0.5" filter="url(#tb-blur)" transform="translate(3 3.5)" />
              <path d={PAT_FOOT} fill="#1c0d00" opacity="0.55" filter="url(#tb-soft)" transform="translate(0.8 1.2)" />
            </g>
            <g className="tb-body">
              <path d={PAT_BODY} fill="url(#tb-side)" />
              <path d={PAT_BODY} fill="url(#tb-ao)" />
              <g clipPath="url(#tb-clip-all)">
                {/* The rounded front corner and the rounded top edge catch the light. */}
                <path d="M34 33V46" stroke="#f8dc92" strokeWidth="2.6" opacity="0.4" filter="url(#tb-soft)" />
                <path d={PAT_TOP} fill="url(#tb-top)" />
                <path
                  d={PAT_TOP}
                  fill="none"
                  stroke="#fffbe6"
                  strokeWidth="2.6"
                  opacity="0.6"
                  filter="url(#tb-soft)"
                />
              </g>
              <g clipPath="url(#tb-clip-top)">
                {/* Soft marks left by the knife. */}
                <g fill="none" strokeLinecap="round">
                  <path
                    d="M15 14.6Q27 19.2 40.6 26.4M22.6 10.9Q36 16 48.4 22.7M30 7.4Q42 12.6 55.6 19.4"
                    stroke="#c9983a"
                    strokeWidth="0.8"
                    opacity="0.38"
                  />
                  <path
                    d="M14.6 15.5Q26.6 20.1 40.2 27.3M22.2 11.8Q35.6 16.9 48 23.6M29.6 8.3Q41.6 13.5 55.2 20.3"
                    stroke="#fffdf0"
                    strokeWidth="0.7"
                    opacity="0.7"
                  />
                </g>
                <ellipse cx="26" cy="14" rx="13" ry="5" fill="url(#tb-spec)" opacity="0.75" transform="rotate(25 26 14)" />
                <ellipse cx="21" cy="12.6" rx="3.4" ry="1" fill="#fff" opacity="0.8" transform="rotate(25 21 12.6)" filter="url(#tb-soft)" />
              </g>
              {/* The sheen that comes up as it melts. */}
              <g className="tb-wet" clipPath="url(#tb-clip-all)">
                <ellipse cx="38" cy="19" rx="17" ry="5" fill="url(#tb-spec)" transform="rotate(25 38 19)" />
                <path d="M9 24Q20 30 31 35.5" fill="none" stroke="#fffdf0" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" filter="url(#tb-soft)" />
                <path d="M38 36.5Q50 31 60 25.5" fill="none" stroke="#fff3c9" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" filter="url(#tb-soft)" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
