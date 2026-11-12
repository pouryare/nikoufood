'use client'

import { useEffect, useRef, useState } from 'react'
import './noosh-jan.css'

/**
 * «نوش جان» written in gold over the table picture: once the travelling butter has melted on the rice,
 * the words draw themselves in a thin gold line, then fill with gold under a little steam. Without the
 * travelling butter it plays when the table is well in view. It plays once; the words come from the CMS.
 */
export function NooshJan({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [play, setPlay] = useState(false)

  useEffect(() => {
    const box = ref.current
    if (!box) return
    // With less motion the CSS shows the finished words straight away.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const stop = document.querySelector<HTMLElement>('[data-butter-stop="table"]')
    const frame = stop?.parentElement
    // The travelling butter writes its melt (0 to 1) into --m on the table; the words follow the melt.
    if (frame && document.querySelector('.tb')) {
      const check = () => {
        if (parseFloat(frame.style.getPropertyValue('--m') || '0') > 0.9) {
          setPlay(true)
          mo.disconnect()
        }
      }
      const mo = new MutationObserver(check)
      mo.observe(frame, { attributes: true, attributeFilter: ['style'] })
      const first = requestAnimationFrame(check)
      return () => {
        mo.disconnect()
        cancelAnimationFrame(first)
      }
    }
    let timer = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer)
        if (entry.isIntersecting) timer = window.setTimeout(() => setPlay(true), 900)
      },
      { threshold: 0.65 },
    )
    io.observe(box)
    return () => {
      io.disconnect()
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div ref={ref} aria-hidden className="noosh" data-play={play ? '' : undefined}>
      <svg viewBox="0 0 600 240">
        <defs>
          <linearGradient id="noosh-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3cc" />
            <stop offset="0.55" stopColor="#e3b04b" />
            <stop offset="1" stopColor="#a8741f" />
          </linearGradient>
        </defs>
        <g className="noosh-steam">
          <path d="M250 58 q-10 -14 0 -28 q10 -14 0 -28" />
          <path d="M300 52 q-10 -14 0 -28 q10 -14 0 -28" />
          <path d="M350 58 q-10 -14 0 -28 q10 -14 0 -28" />
        </g>
        <text className="noosh-ink" x="300" y="168" textAnchor="middle" direction="rtl">
          {text}
        </text>
        <path className="noosh-flourish" d="M150 206 C 230 226, 370 226, 450 204" />
      </svg>
    </div>
  )
}
