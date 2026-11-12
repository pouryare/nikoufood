import type { CSSProperties } from 'react'
import { toEnDigits } from '@/lib/format'

const FA = '۰۱۲۳۴۵۶۷۸۹'
const EN = '0123456789'
/** Each column spins through two full rounds before it settles, so short numbers still roll properly. */
const ROUNDS = 2

/**
 * A figure whose digits spin like an old counter and stop on the right number, the last digit last.
 * It plays when its parent `[data-reveal]` block enters the screen (pure CSS, no script).
 * Wording that is not a number (for example «سراسر ایران») gets a gold line drawn under it instead.
 */
export function RollingNumber({ value }: { value: string }) {
  const latin = toEnDigits(value).trim()
  if (!/^\d{1,6}$/.test(latin)) {
    return <span className="roll-word">{value}</span>
  }
  const digits = /[0-9]/.test(value) ? EN : FA
  const strip = Array.from({ length: ROUNDS * 10 + 10 }, (_, k) => digits[k % 10])
  return (
    <span className="roll">
      <span className="sr-only">{value}</span>
      <span aria-hidden className="roll-cols">
        {latin.split('').map((d, i) => (
          <span key={i} className="roll-col">
            <span className="roll-size">{digits[Number(d)]}</span>
            <span
              className="roll-strip"
              style={{ '--to': ROUNDS * 10 + Number(d), '--d': i } as CSSProperties}
            >
              {strip.map((ch, k) => (
                <span key={k}>{ch}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
}
