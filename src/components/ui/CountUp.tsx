'use client'

import { useEffect, useRef } from 'react'
import { toEnDigits, toFa } from '@/lib/format'

type Props = { value: string; className?: string }

/**
 * A number that counts up the first time it scrolls into view. Anything that is not a plain number
 * (for example «سراسر ایران») is shown as it is. The real value is always in the HTML, so search
 * engines and visitors without JavaScript or with reduced motion see it right away.
 */
export function CountUp({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    const latin = toEnDigits(value).trim()
    if (!el || !/^\d{1,6}$/.test(latin)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return

    const target = Number(latin)
    const persian = /[۰-۹]/.test(value)
    const write = (n: number) => {
      el.textContent = persian ? toFa(n) : String(n)
    }
    // Years and other big numbers only roll through their last steps, so every count takes the same short time.
    const from = target > 100 ? target - 14 : 0
    let frame = 0
    write(from)

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1500)
          write(Math.round(from + (target - from) * (1 - Math.pow(1 - t, 4))))
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      el.textContent = value
    }
  }, [value])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
