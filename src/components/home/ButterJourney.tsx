'use client'

import { useEffect, useRef } from 'react'
import { emitSound } from '@/lib/sound'

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
              <linearGradient id="tb-top" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff6cf" />
                <stop offset="0.55" stopColor="#f9e19a" />
                <stop offset="1" stopColor="#f0cd6e" />
              </linearGradient>
              <linearGradient id="tb-left" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ecc25e" />
                <stop offset="1" stopColor="#d6a23d" />
              </linearGradient>
              <linearGradient id="tb-right" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#dcab45" />
                <stop offset="1" stopColor="#bf8a2a" />
              </linearGradient>
            </defs>
            <g strokeLinejoin="round" strokeWidth="3">
              <path d="M2 17L34 33V48L2 32Z" fill="url(#tb-left)" stroke="#d9a641" />
              <path d="M34 33L66 17V32L34 48Z" fill="url(#tb-right)" stroke="#c9952f" />
              <path d="M34 2L66 17L34 33L2 17Z" fill="url(#tb-top)" stroke="#f6dc8e" />
            </g>
            <path
              d="M12 16L34 5.5L48 12"
              fill="none"
              stroke="#fffbe9"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.8"
            />
            <ellipse cx="40" cy="19" rx="9" ry="3" fill="#fffdf2" opacity="0.35" />
          </svg>
          <span className="tb-shadow" />
        </div>
      </div>
    </div>
  )
}
