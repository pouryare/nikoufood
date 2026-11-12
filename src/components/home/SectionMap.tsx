'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon, iconName, type IconName } from '@/components/ui/Icon'
import '@/components/effects/touches.css'

type Item = { label: string; icon: IconName; el: HTMLElement }
type Labels = { mapLabel: string }

/** Marks where a section of the home page starts; the page map reads these in page order. */
export function MapMark({ label, icon }: { label?: string | null; icon: IconName }) {
  if (!label) return null
  return <span aria-hidden className="map-mark" data-map-mark={label} data-map-icon={icon} />
}

const RING = 2 * Math.PI * 14

type Lenisish = { scrollTo: (target: number, opts?: { duration?: number }) => void }

/**
 * A small map of the home page. On computers, a slim rail of icons on the side: the current section is
 * gold, a hover shows its name, a click glides there. On phones, a pill at the bottom says where you are
 * («۴ از ۱۲ · محصولات») with a ring that fills as you go; a tap opens the list of sections.
 * It stays out of the way on the first screen and over the footer.
 */
export function SectionMap({ labels }: { labels: Labels }) {
  const [items, setItems] = useState<Item[]>([])
  const [current, setCurrent] = useState(0)
  const [hidden, setHidden] = useState(true)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const arcRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const marks = Array.from(document.querySelectorAll<HTMLElement>('[data-map-mark]'))
    const list = marks.map((el) => ({
      label: el.dataset.mapMark ?? '',
      icon: iconName(el.dataset.mapIcon) ?? 'sparkle',
      el,
    }))
    const shown = requestAnimationFrame(() => setItems(list))
    if (list.length < 3) return () => cancelAnimationFrame(shown)
    // The footer can sit fixed behind the page, so "near the end" is measured from the page itself.
    const main = document.getElementById('main')
    let frame = 0
    const update = () => {
      frame = 0
      const h = window.innerHeight
      const line = h * 0.42
      let idx = 0
      list.forEach((item, i) => {
        if (item.el.getBoundingClientRect().top <= line) idx = i
      })
      setCurrent(idx)
      const max = document.documentElement.scrollHeight - h
      // The ring is drawn straight onto the SVG, so scrolling does not re-render the map.
      const arc = arcRef.current
      if (arc) arc.style.strokeDashoffset = (RING * (1 - (max > 0 ? Math.min(1, window.scrollY / max) : 0))).toFixed(1)
      const end = main ? main.getBoundingClientRect().bottom < h * 0.85 : false
      setHidden(window.scrollY < h * 0.6 || end)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(shown)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // The list closes on a tap outside it or on Escape.
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', away)
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('pointerdown', away)
      window.removeEventListener('keydown', key)
    }
  }, [open])

  if (items.length < 3) return null

  const go = (i: number) => {
    setOpen(false)
    const header = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    const y = items[i].el.getBoundingClientRect().top + window.scrollY - (i === 0 ? 0 : header)
    const lenis = (window as Window & { nkLenis?: Lenisish }).nkLenis
    if (lenis) lenis.scrollTo(y, { duration: 1.4 })
    else
      window.scrollTo({
        top: y,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
  }
  const fa = (n: number) => n.toLocaleString('fa-IR')
  const now = items[current] ?? items[0]

  return (
    <>
      <nav className="smap-rail" aria-label={labels.mapLabel} data-hidden={hidden ? '' : undefined}>
        {items.map((item, i) => (
          <button
            key={`${item.label}-${i}`}
            type="button"
            onClick={() => go(i)}
            aria-current={i === current ? 'true' : undefined}
            aria-label={item.label}
            tabIndex={hidden ? -1 : undefined}
          >
            <Icon name={item.icon} size={16} />
            <span aria-hidden>{item.label}</span>
          </button>
        ))}
      </nav>

      <div ref={wrapRef} className="smap-pill-wrap" data-hidden={hidden && !open ? '' : undefined}>
        {open ? (
          <div className="smap-list" role="menu" aria-label={labels.mapLabel} data-lenis-prevent="">
            {items.map((item, i) => (
              <button
                key={`${item.label}-${i}`}
                type="button"
                role="menuitem"
                onClick={() => go(i)}
                aria-current={i === current ? 'true' : undefined}
              >
                <Icon name={item.icon} size={17} />
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          className="smap-pill"
          aria-expanded={open}
          aria-label={`${labels.mapLabel}: ${now.label}`}
          tabIndex={hidden ? -1 : undefined}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="smap-ring" aria-hidden>
            <svg className="smap-arc" viewBox="0 0 32 32" width="32" height="32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="var(--nk-line)" strokeWidth="2" />
              <circle
                ref={arcRef}
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="var(--nk-gold)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={RING}
                strokeDashoffset={RING}
              />
            </svg>
            <Icon name={now.icon} size={14} />
          </span>
          <small>
            {fa(current + 1)} از {fa(items.length)}
          </small>
          <b>{now.label}</b>
          <Icon name="chevronDown" size={15} className={open ? 'rotate-180' : undefined} />
        </button>
      </div>
    </>
  )
}
