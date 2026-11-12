'use client'

import { useEffect, useRef } from 'react'

type Props = { eyebrow?: string | null; title: string; word: string }

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * One word fills the whole screen, gold and huge. As the visitor scrolls, it shrinks and slides into
 * its place inside the section title, and the rest of the title appears around it.
 * Shown as a normal title when the word is not in the title or the visitor prefers less motion.
 */
export function GiantWord({ eyebrow, title, word }: Props) {
  const secRef = useRef<HTMLDivElement>(null)
  const wordRef = useRef<HTMLSpanElement>(null)
  const at = title.indexOf(word)

  useEffect(() => {
    const sec = secRef.current
    const gw = wordRef.current
    const stage = sec?.querySelector<HTMLElement>('.gw-stage')
    if (!sec || !gw || !stage) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sec.setAttribute('data-still', '')
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const h = window.innerHeight
      const q = clamp(-sec.getBoundingClientRect().top / Math.max(1, sec.offsetHeight - h))
      const e = ease(clamp(q / 0.72))
      // Where the word sits in the title, measured without the transform.
      let el: HTMLElement | null = gw
      let ox = 0
      let oy = 0
      while (el && el !== stage) {
        ox += el.offsetLeft
        oy += el.offsetTop
        el = el.offsetParent as HTMLElement | null
      }
      const big = Math.min(
        6,
        (stage.clientWidth * 0.86) / Math.max(1, gw.offsetWidth),
        (h * 0.5) / Math.max(1, gw.offsetHeight),
      )
      const dx = stage.clientWidth / 2 - (ox + gw.offsetWidth / 2)
      const dy = stage.clientHeight / 2 - (oy + gw.offsetHeight / 2)
      gw.style.transform = `translate3d(${(dx * (1 - e)).toFixed(1)}px, ${(dy * (1 - e)).toFixed(1)}px, 0) scale(${(big + (1 - big) * e).toFixed(3)})`
      sec.style.setProperty('--r', clamp((q - 0.6) / 0.25).toFixed(3))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    void document.fonts?.ready.then(schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
      gw.style.transform = ''
    }
  }, [])

  if (at < 0) return null
  return (
    <div ref={secRef} className="gw-pin">
      <div className="gw-stage">
        <div className="wrap text-center">
          {eyebrow ? <p className="eyebrow gw-eyebrow justify-center">{eyebrow}</p> : null}
          <h2 className="gw-title text-h1">
            {at > 0 ? <span className="gw-rest">{title.slice(0, at)}</span> : null}
            <span ref={wordRef} className="gw-word">
              {word}
            </span>
            {at + word.length < title.length ? (
              <span className="gw-rest">{title.slice(at + word.length)}</span>
            ) : null}
          </h2>
        </div>
      </div>
    </div>
  )
}
