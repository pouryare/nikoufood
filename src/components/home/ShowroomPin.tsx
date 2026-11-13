'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { toFa } from '@/lib/format'

type Props = { children: ReactNode; total: number; className?: string }

const clamp = (v: number) => Math.min(1, Math.max(0, v))

/**
 * The products as a showroom: the section holds still while the visitor keeps scrolling down, and the cards
 * glide sideways past them (on phones too: the page scrolls down, the row moves across); a thin gold line
 * and a counter show how far along they are. When all cards fit on the screen, or with reduced motion,
 * nothing is pinned and the cards sit in a plain row.
 */
export function ShowroomPin({ children, total, className }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const sec = ref.current
    const stage = sec?.querySelector<HTMLElement>('.showroom-stage')
    const track = sec?.querySelector<HTMLElement>('.showroom-track')
    const now = sec?.querySelector<HTMLElement>('[data-show-now]')
    if (!sec || !stage || !track) return
    const phone = window.matchMedia('(max-width: 47.99rem)')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let room = 0
    let span = 0
    let frame = 0
    let lastIndex = -1

    const update = () => {
      frame = 0
      if (!room) return
      const h = window.innerHeight
      const top = Math.min(0, h - stage.offsetHeight)
      const p = clamp((top - sec.getBoundingClientRect().top) / span)
      // Right-to-left: the row starts at the right edge and travels to the right to show the cards on the left.
      track.style.transform = `translate3d(${(p * room).toFixed(1)}px, 0, 0)`
      sec.style.setProperty('--p', p.toFixed(4))
      const index = Math.min(total, 1 + Math.round(p * (total - 1)))
      if (now && index !== lastIndex) {
        lastIndex = index
        now.textContent = toFa(index)
      }
    }
    const measure = () => {
      track.style.transform = ''
      sec.style.height = ''
      const extra = !still
        ? Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth ?? track.scrollWidth))
        : 0
      room = extra > 48 ? extra : 0
      sec.toggleAttribute('data-pinned', room > 0)
      if (room) {
        stage.style.top = `${Math.min(0, window.innerHeight - stage.offsetHeight)}px`
        // The scroll it takes to cross the row: longer on phones, so a flick cannot rush the cards past.
        span = room * (phone.matches ? 1.9 : 1.25)
        sec.style.height = `${stage.offsetHeight + span}px`
      } else {
        stage.style.top = ''
        sec.style.removeProperty('--p')
      }
      update()
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    let timer = 0
    const remeasure = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(measure, 120)
    }
    measure()
    void document.fonts?.ready.then(remeasure)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', remeasure)
    phone.addEventListener('change', remeasure)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', remeasure)
      phone.removeEventListener('change', remeasure)
      window.clearTimeout(timer)
      if (frame) cancelAnimationFrame(frame)
      track.style.transform = ''
      sec.style.height = ''
    }
  }, [total])

  return (
    <section ref={ref} className={className} data-butter-hide="" data-mood="products">
      {children}
    </section>
  )
}
