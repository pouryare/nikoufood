'use client'

import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { Icon, type IconName } from '@/components/ui/Icon'
import { KitchenDayArt, type KitchenDayHandle } from './kitchen-day/KitchenDayArt'
import './kitchen-day.css'

export type KitchenMeal = {
  time: string
  title: string
  text?: string | null
  market: { name: string; icon: IconName } | null
  link?: { label?: string | null; href?: string | null } | null
}

type Props = { meals: KitchenMeal[]; seconds: number; labels: { play: string; pause: string } }

/** Where each meal starts on the day (0 = 7:00, 1 = 21:00) and the moment shown when a visitor picks it. */
const STARTS = [0, 0.34, 0.67]
const FIRST = 0.02
const PICKS = [0.16, 0.5, 0.86]
const mealAt = (t: number) => (t < STARTS[1] ? 0 : t < STARTS[2] ? 1 : 2)
const clock = (t: number) => {
  const minutes = Math.round(((7 + 14 * t) * 60) / 5) * 5
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${h.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}:${m.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}`
}

/**
 * A whole day passes by itself in about twenty seconds, then starts again: the sun crosses the sky over
 * Tehran, the city lights come on, and the counter changes from breakfast to lunch to dinner. Beside it,
 * a clock and the meal of the hour with the market it serves. It only plays while on screen, can be paused,
 * and visitors who prefer less motion pick the meal themselves.
 */
export function KitchenDay({ meals, seconds, labels }: Props) {
  const artRef = useRef<KitchenDayHandle>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const clockRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef(FIRST)
  const [meal, setMeal] = useState(0)
  const [playing, setPlaying] = useState(true)
  const still = Boolean(useReducedMotion())
  const playingRef = useRef(true)

  const paint = (t: number) => {
    timeRef.current = t
    artRef.current?.setTime(t)
    if (clockRef.current) clockRef.current.textContent = clock(t)
    if (barRef.current) barRef.current.style.transform = `scaleX(${t.toFixed(4)})`
    setMeal((m) => (m === mealAt(t) ? m : mealAt(t)))
  }

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    if (still) {
      // No autoplay: the morning stays until the visitor picks another meal.
      playingRef.current = false
      const first = requestAnimationFrame(() => paint(PICKS[0]))
      return () => cancelAnimationFrame(first)
    }
    let frame = 0
    let last = 0
    let visible = false
    let hold = 0
    const tick = (now: number) => {
      frame = 0
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0
      last = now
      if (playingRef.current) {
        let t = timeRef.current
        if (t >= 1) {
          // Night lingers a moment, the window dims, and a new morning begins.
          hold += dt
          if (hold > 1.4) box.setAttribute('data-dim', '')
          if (hold > 1.9) {
            hold = 0
            t = 0
            box.removeAttribute('data-dim')
          }
        } else {
          t = Math.min(1, t + dt / Math.max(6, seconds))
        }
        paint(t)
      }
      if (visible) frame = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      last = 0
      if (visible && !frame) frame = requestAnimationFrame(tick)
    })
    io.observe(box)
    return () => {
      io.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
    // paint only touches refs and a state setter, so the loop is set up once per length of day.
  }, [seconds, still])

  const toggle = () => {
    playingRef.current = !playingRef.current
    setPlaying(playingRef.current)
  }
  const pick = (i: number) => {
    boxRef.current?.removeAttribute('data-dim')
    paint(PICKS[i])
  }
  const now = meals[meal] ?? meals[0]
  if (!now) return null

  return (
    <div ref={boxRef} className="kday">
      <div className="kday-art">
        <KitchenDayArt ref={artRef} initialTime={FIRST} />
        <span className="kday-clock" aria-hidden>
          <Icon name={meal === 2 ? 'moon' : 'sun'} size={18} />
          <span ref={clockRef}>{clock(FIRST)}</span>
        </span>
      </div>

      <div className="kday-side">
        <div className="kday-card" key={meal} aria-live="polite">
          <p className="kday-time">{now.time}</p>
          <h3>{now.title}</h3>
          {now.text ? <p className="kday-text">{now.text}</p> : null}
          {now.market ? (
            <p className="kday-market">
              <Icon name={now.market.icon} size={16} />
              {now.market.name}
            </p>
          ) : null}
          {now.link?.href && now.link.label ? (
            <ButtonLink href={now.link.href} variant="outline" size="sm">
              {now.link.label}
            </ButtonLink>
          ) : null}
        </div>

        <div className="kday-controls">
          <div className="kday-track">
            <span ref={barRef} className="kday-fill" aria-hidden />
            {meals.map((m, i) => (
              <button
                key={`${m.title}-${i}`}
                type="button"
                aria-pressed={i === meal}
                onClick={() => pick(i)}
                style={{ insetInlineStart: `${STARTS[i] * 100}%`, width: `${((STARTS[i + 1] ?? 1) - STARTS[i]) * 100}%` }}
              >
                <span>{m.time}</span>
              </button>
            ))}
          </div>
          {still ? null : (
            <button type="button" className="kday-play" onClick={toggle} aria-label={playing ? labels.pause : labels.play}>
              <Icon name={playing ? 'pause' : 'play'} size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
