'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'
import { toFa } from '@/lib/format'
import { prefersReducedMotion } from '@/lib/webgl'
import { FilmArt, type FilmArtName } from './FilmArt'

type Picture = { url: string; alt: string; focal?: string }

/** One picture area: a whole scene, or one half of a split scene. */
export type FilmSide = {
  title?: string | null
  text?: string | null
  image?: Picture | null
  imageMobile?: Picture | null
  video?: { url: string } | null
  art?: FilmArtName | null
}

export type FilmScene =
  | { layout: 'single'; kicker: string; side: FilmSide }
  | { layout: 'split'; kicker: string; plant: FilmSide; animal: FilmSide }

type Props = {
  eyebrow?: string | null
  title?: string | null
  intro?: string | null
  plantLabel?: string | null
  animalLabel?: string | null
  /** One finished film (optional): replaces the per-scene pictures. */
  film?: { url: string } | null
  filmMobile?: { url: string } | null
  scenes: FilmScene[]
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (v: number) => {
  const t = clamp(v)
  return t * t * (3 - 2 * t)
}
/** How much scrolling each scene gets, in screen heights. */
const SCENE_SCROLL = 0.85
/** The share of a scene's scroll spent changing over to the next one. */
const CHANGE = 0.26

type Enter = 'none' | 'fade' | 'open' | 'close' | 'slide'
/** How a scene arrives depends on what came before: a split "opens" from the middle, a whole view "closes" over a split. */
function enterOf(scenes: FilmScene[], i: number): Enter {
  if (i === 0) return 'none'
  const prev = scenes[i - 1].layout
  const cur = scenes[i].layout
  if (prev === 'single') return cur === 'single' ? 'fade' : 'open'
  return cur === 'single' ? 'close' : 'slide'
}

const hasPhoto = (side: FilmSide) => Boolean(side.video || side.image)

function SideMedia({ side, baked }: { side: FilmSide; baked: boolean }) {
  if (baked) return null
  return (
    <div className="film-media" data-media={hasPhoto(side) ? 'photo' : 'art'}>
      {side.video ? (
        <video src={side.video.url} muted playsInline preload="metadata" poster={side.image?.url} aria-hidden tabIndex={-1} />
      ) : side.image ? (
        <>
          <Image
            src={side.image.url}
            alt={side.image.alt}
            fill
            sizes="(min-width: 768px) 75vw, 100vw"
            style={{ objectPosition: side.image.focal }}
            className={cn('object-cover', side.imageMobile && 'max-md:hidden')}
          />
          {side.imageMobile ? (
            <Image src={side.imageMobile.url} alt={side.imageMobile.alt} fill sizes="100vw" style={{ objectPosition: side.imageMobile.focal }} className="object-cover md:hidden" />
          ) : null}
        </>
      ) : side.art ? (
        <FilmArt name={side.art} className="film-art" />
      ) : null}
    </div>
  )
}

/** The progress line: one strand for shared scenes, two strands (plant above, animal below) for split ones. */
function FilmPath({ scenes, current }: { scenes: FilmScene[]; current: number }) {
  const n = scenes.length
  const w = n * 100
  const x = (i: number) => w - 50 - i * 100 // right to left, like the page
  const y = (scene: FilmScene) => (scene.layout === 'split' ? [11, 29] : [20])
  const d: string[] = [`M${w} 20H${x(0)}`, `M${x(n - 1)} 20H0`]
  // first and last strands only make sense for whole scenes; split ends get short stubs to each strand
  if (scenes[0].layout === 'split') d[0] = `M${w} 20C${w - 25} 20 ${w - 25} 11 ${x(0)} 11M${w} 20C${w - 25} 20 ${w - 25} 29 ${x(0)} 29`
  if (scenes[n - 1].layout === 'split') d[1] = `M${x(n - 1)} 11C25 11 25 20 0 20M${x(n - 1)} 29C25 29 25 20 0 20`
  for (let i = 0; i < n - 1; i++) {
    const from = y(scenes[i])
    const to = y(scenes[i + 1])
    const a = x(i)
    const b = x(i + 1)
    const m = (a + b) / 2
    const pairs = from.length === to.length ? from.map((v, k) => [v, to[k]]) : from.length === 1 ? to.map((v) => [from[0], v]) : from.map((v) => [v, to[0]])
    for (const [y1, y2] of pairs) d.push(y1 === y2 ? `M${a} ${y1}H${b}` : `M${a} ${y1}C${m} ${y1} ${m} ${y2} ${b} ${y2}`)
  }
  const lines = (className: string) => (
    <svg viewBox={`0 0 ${w} 40`} preserveAspectRatio="none" className={className}>
      <path d={d.join('')} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  )
  return (
    <div className="film-path" aria-hidden>
      {lines('film-path-base')}
      {lines('film-path-fill')}
      {scenes.map((scene, i) => {
        const state = cn(i === current && 'is-current', i < current && 'is-done')
        const right = `${((i + 0.5) / n) * 100}%`
        const [first, second] = scene.kicker.split('|').map((s) => s.trim())
        return scene.layout === 'split' ? (
          <span key={i} className={cn('film-path-stop', state)} style={{ right }}>
            <i className="film-path-dot" style={{ top: '27.5%' }} />
            <i className="film-path-dot film-path-dot-b" style={{ top: '72.5%' }} />
            <span className="film-path-label film-path-label-top">{first}</span>
            <span className="film-path-label">{second ?? ''}</span>
          </span>
        ) : (
          <span key={i} className={cn('film-path-stop', state)} style={{ right }}>
            <i className="film-path-dot" style={{ top: '50%' }} />
            <span className="film-path-label">{scene.kicker}</span>
          </span>
        )
      })}
    </div>
  )
}

const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}

/** False on the server and during hydration (so the page starts as a plain list), then true wherever motion is welcome. */
const useMotionAllowed = () =>
  useSyncExternalStore(
    subscribeMotion,
    () => !prefersReducedMotion(),
    () => false,
  )

/**
 * «از مزرعه تا سفره»: one pinned stage; scrolling moves through the scenes.
 * A scene is a whole view (a step both butters share) or split in two (plant | animal).
 * Without JavaScript, or when the visitor asks for less motion, the same content is a plain list.
 */
export function OriginFilm({ eyebrow, title, intro, plantLabel, animalLabel, film, filmMobile, scenes }: Props) {
  const rootRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const bakedRef = useRef<HTMLVideoElement>(null)
  const sceneRefs = useRef<(HTMLLIElement | null)[]>([])
  const pinned = useMotionAllowed()
  const [current, setCurrent] = useState(0)
  const count = scenes.length
  const baked = Boolean(film || filmMobile)

  // One finished film: pick the upright version on phones when there is one.
  useEffect(() => {
    const video = bakedRef.current
    if (!video || !pinned) return
    const phone = window.matchMedia('(max-width: 767px)').matches
    const src = (phone ? filmMobile?.url : film?.url) ?? film?.url ?? filmMobile?.url
    if (src && video.getAttribute('src') !== src) video.src = src
  }, [pinned, film, filmMobile])

  const render = useCallback(
    (p: number) => {
      const x = p * count
      const scrub = (video: HTMLVideoElement, k: number) => {
        if (video.preload !== 'auto') video.preload = 'auto'
        if (video.readyState < 1 || !Number.isFinite(video.duration)) return
        const target = k * Math.max(0, video.duration - 0.05)
        if (Math.abs(video.currentTime - target) > 0.03) video.currentTime = target
      }
      for (let i = 0; i < count; i++) {
        const el = sceneRefs.current[i]
        if (!el) continue
        const enter = i === 0 ? 1 : smooth((x - (i - CHANGE)) / CHANGE)
        const exit = i === count - 1 ? 0 : smooth((x - (i + 1 - CHANGE)) / CHANGE)
        const k = clamp(x - i)
        el.style.setProperty('--in', enter.toFixed(4))
        el.style.setProperty('--out', exit.toFixed(4))
        el.style.setProperty('--k', k.toFixed(3))
        el.toggleAttribute('data-covered', exit > 0.999)
        if (Math.abs(x - i - 0.5) < 1.5) el.querySelectorAll('video').forEach((video) => scrub(video, k))
      }
      if (bakedRef.current) scrub(bakedRef.current, p)
      rootRef.current?.style.setProperty('--path', Math.min(1, (x + 0.5) / count).toFixed(4))
      setCurrent((prev) => {
        const next = Math.min(count - 1, Math.max(0, Math.floor(x + CHANGE / 2)))
        return next === prev ? prev : next
      })
    },
    [count],
  )

  useGSAP(
    () => {
      if (!pinned || !trackRef.current || count === 0) return
      gsap.registerPlugin(ScrollTrigger)
      const proxy = { p: 0 }
      const tween = gsap.to(proxy, {
        p: 1,
        ease: 'none',
        scrollTrigger: { trigger: trackRef.current, start: 'top top', end: 'bottom bottom', scrub: 0.45 },
        onUpdate: () => render(proxy.p),
      })
      render(tween.scrollTrigger?.progress ?? 0)
      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    },
    { dependencies: [pinned, count, render], scope: rootRef },
  )

  if (count === 0) return null

  const copy = (side: FilmSide, tag?: string | null) => (
    <>
      {tag ? <span className="film-tag">{tag}</span> : null}
      {side.title ? <h3 className="film-title">{side.title}</h3> : null}
      {side.text ? <p className="film-text">{side.text}</p> : null}
    </>
  )

  return (
    <section
      ref={rootRef}
      className="film"
      data-mode={pinned ? 'pinned' : 'list'}
      data-baked={baked ? '' : undefined}
      aria-labelledby="film-title"
      style={{ '--scenes': count } as CSSProperties}
    >
      <div className="wrap pt-[clamp(4.5rem,10vw,9rem)] pb-[clamp(2.5rem,5vw,4rem)]">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p data-reveal className="eyebrow">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 id="film-title" data-reveal style={{ '--i': 1 } as CSSProperties} className="mt-5 text-h2">
              {title}
            </h2>
          ) : null}
          {intro ? (
            <p data-reveal style={{ '--i': 2 } as CSSProperties} className="mt-6 text-lead text-muted">
              {intro}
            </p>
          ) : null}
        </div>
      </div>

      <div ref={trackRef} className="film-track" style={pinned ? { height: `calc(${count * SCENE_SCROLL} * 100svh + 100svh)` } : undefined}>
        <div className="film-stage">
          {baked ? <video ref={bakedRef} className="film-baked" muted playsInline preload="auto" controls={!pinned} src={pinned ? undefined : (film?.url ?? filmMobile?.url)} aria-hidden={pinned} tabIndex={pinned ? -1 : undefined} /> : null}
          <ol className="film-scenes">
            {scenes.map((scene, i) => {
              const enter = baked ? (i === 0 ? 'none' : 'fade') : enterOf(scenes, i)
              const exit = !baked && i < count - 1 && enterOf(scenes, i + 1) === 'slide' ? 'slide' : 'cover'
              return (
                <li
                  key={i}
                  ref={(el) => {
                    sceneRefs.current[i] = el
                  }}
                  className="film-scene"
                  data-layout={scene.layout}
                  data-photo={scene.layout === 'single' && !baked && hasPhoto(scene.side) ? '' : undefined}
                  data-enter={enter}
                  data-exit={exit}
                >
                  {scene.layout === 'single' ? (
                    <>
                      <SideMedia side={scene.side} baked={baked} />
                      <div className="film-copy wrap">
                        <div className="film-copy-in">
                          <p className="film-number" aria-hidden>
                            {toFa(String(i + 1).padStart(2, '0'))}
                          </p>
                          <p className="eyebrow">{scene.kicker}</p>
                          {copy(scene.side)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {(['plant', 'animal'] as const).map((key) => (
                        <div key={key} className={`film-half film-half-${key}`}>
                          <div className="film-half-in">
                            <SideMedia side={scene[key]} baked={baked} />
                            <div className="film-half-copy">{copy(scene[key], key === 'plant' ? plantLabel : animalLabel)}</div>
                          </div>
                        </div>
                      ))}
                      <span className="film-divider" aria-hidden />
                    </>
                  )}
                </li>
              )
            })}
          </ol>
          {pinned ? <FilmPath scenes={scenes} current={current} /> : null}
        </div>
      </div>
    </section>
  )
}
