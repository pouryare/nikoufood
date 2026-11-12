'use client'

import { useEffect, useRef, useState } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { HolidayLook } from '@/lib/holidays'
import './holiday.css'

type Props = {
  name: string
  greeting: string
  look: HolidayLook
  link?: { label?: string | null; href?: string | null } | null
  closeLabel: string
}

type Bit = { x: number; y: number; vy: number; vx: number; rot: number; vr: number; s: number; sway: number }

/**
 * Holiday mode. On the days of an occasion, a short greeting slides in under the header and pomegranate
 * seeds (Yalda), blossom petals (Nowruz) or gold dust fall softly over the first screen, with a warm glow
 * in the occasion's colour. Both step aside as the visitor scrolls on; the greeting can be closed and stays
 * closed on that device for the rest of the occasion.
 */
export function Holiday({ name, greeting, look, link, closeLabel }: Props) {
  const [show, setShow] = useState(false)
  const skyRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const noteRef = useRef<HTMLDivElement>(null)
  const key = `nk-holiday-${name}-${new Date().getFullYear()}`

  useEffect(() => {
    let closed = false
    try {
      closed = window.localStorage.getItem(key) === 'closed'
    } catch {}
    if (closed) return
    const t = window.setTimeout(() => setShow(true), 1200)
    return () => window.clearTimeout(t)
  }, [key])

  useEffect(() => {
    const sky = skyRef.current
    const cv = canvasRef.current
    if (!sky || !cv) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let w = 0
    let h = 0
    let bits: Bit[] = []
    let frame = 0
    let last = performance.now()
    let fade = 1
    const spawn = (top: boolean): Bit => ({
      x: Math.random() * w,
      y: top ? -20 : Math.random() * h,
      vy: 20 + Math.random() * 34,
      vx: (Math.random() - 0.5) * 14,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 2.2,
      s: 0.65 + Math.random() * 0.7,
      sway: Math.random() * 6,
    })
    const size = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = window.innerWidth
      h = window.innerHeight
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bits = still ? [] : Array.from({ length: w < 640 ? 16 : 30 }, () => spawn(false))
    }
    const seed = () => {
      const g = ctx.createRadialGradient(-2, -3, 1, 0, 0, 9)
      g.addColorStop(0, '#ff8fa3')
      g.addColorStop(0.5, '#c8102e')
      g.addColorStop(1, '#6d0015')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, -9)
      ctx.bezierCurveTo(7, -6, 7, 6, 0, 8)
      ctx.bezierCurveTo(-7, 6, -7, -6, 0, -9)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.beginPath()
      ctx.ellipse(-2, -3, 1.6, 2.6, -0.4, 0, Math.PI * 2)
      ctx.fill()
    }
    const petal = () => {
      const g = ctx.createLinearGradient(0, -9, 0, 9)
      g.addColorStop(0, '#fff4f7')
      g.addColorStop(1, '#f6a9c4')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, -10)
      ctx.bezierCurveTo(8, -6, 6, 6, 0, 9)
      ctx.bezierCurveTo(-6, 6, -8, -6, 0, -10)
      ctx.fill()
    }
    const dust = () => {
      const g = ctx.createLinearGradient(-5, -3, 5, 3)
      g.addColorStop(0, '#fff3cc')
      g.addColorStop(0.5, '#e3b04b')
      g.addColorStop(1, '#a8741f')
      ctx.fillStyle = g
      ctx.fillRect(-5, -2.5, 10, 5)
    }
    const draw = (now: number) => {
      frame = 0
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      ctx.clearRect(0, 0, w, h)
      for (const b of bits) {
        b.y += b.vy * dt
        b.x += (b.vx + Math.sin(now / 760 + b.sway) * 14) * dt
        b.rot += b.vr * dt
        if (b.y > h + 20) Object.assign(b, spawn(true))
        ctx.save()
        ctx.translate(b.x, b.y)
        ctx.rotate(b.rot)
        ctx.scale(b.s, look === 'gold' ? b.s * Math.abs(Math.cos(b.rot * 1.7)) + 0.15 : b.s)
        if (look === 'yalda') seed()
        else if (look === 'nowruz') petal()
        else dust()
        ctx.restore()
      }
      if (fade > 0 && bits.length) frame = requestAnimationFrame(draw)
    }
    // Everything fades out over the first screen of scrolling and stops drawing when gone.
    const onScroll = () => {
      fade = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.9))
      sky.style.opacity = fade.toFixed(3)
      // The greeting steps aside once the visitor has scrolled past the first screen, and comes back at the top.
      noteRef.current?.toggleAttribute('data-away', window.scrollY > window.innerHeight * 0.5)
      if (fade > 0 && !frame && bits.length) {
        last = performance.now()
        frame = requestAnimationFrame(draw)
      }
    }
    size()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', size)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', size)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [look])

  const close = () => {
    setShow(false)
    try {
      window.localStorage.setItem(key, 'closed')
    } catch {}
  }

  return (
    <>
      <div ref={skyRef} aria-hidden className="holiday-sky" data-look={look}>
        <canvas ref={canvasRef} />
      </div>
      <div ref={noteRef} className="holiday-note" data-look={look} data-show={show ? '' : undefined} role="status">
        <Icon name="sparkle" size={18} />
        <p>{greeting}</p>
        {link?.href && link.label ? (
          <ButtonLink href={link.href} size="sm" variant="outline" icon={false}>
            {link.label}
          </ButtonLink>
        ) : null}
        <button type="button" onClick={close} aria-label={closeLabel} className="holiday-close">
          <Icon name="close" size={16} />
        </button>
      </div>
    </>
  )
}
