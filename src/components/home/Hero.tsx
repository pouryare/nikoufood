'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { hasWebGL, isLowPower, prefersReducedMotion, wantsLessData, whenIdle } from '@/lib/webgl'

const ButterHeroScene = dynamic(() => import('@/components/three/ButterHeroScene'), { ssr: false })

type Cta = { label?: string | null; href?: string | null } | null | undefined

export type HeroProps = {
  brandName: string
  eyebrow?: string | null
  /** Three big words; the butter sits between them. */
  words: [string, string, string]
  subtitle?: string | null
  primaryCta?: Cta
  secondaryCta?: Cta
  /** A real photo from the CMS replaces the 3D curl when it is set. */
  image?: { url: string; alt: string; width?: number; height?: number } | null
  enable3D: boolean
  scrollHint: string
  accentFrom: string
  accentTo: string
  /** Marks the gold word as the travelling butter's first resting place. */
  butterStop?: boolean
}

const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` })

export function Hero({ brandName, eyebrow, words, subtitle, primaryCta, secondaryCta, image, enable3D, scrollHint, accentFrom, accentTo, butterStop }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const progress = useRef(0)
  const [mount3D, setMount3D] = useState(false)
  const [ready3D, setReady3D] = useState(false)
  const [lowPower, setLowPower] = useState(false)
  const [active, setActive] = useState(true)

  // Decide, after the page is interactive, whether this device gets the live 3D curl.
  useEffect(() => {
    if (!enable3D || image) return
    if (prefersReducedMotion() || wantsLessData() || !hasWebGL()) return
    return whenIdle(() => {
      setLowPower(isLowPower())
      setMount3D(true)
    })
  }, [enable3D, image])

  // Mouse and scroll feed both the 3D scene (through refs) and the words (through CSS variables).
  useEffect(() => {
    const el = sectionRef.current
    if (!el || prefersReducedMotion()) return
    let frame = 0
    const apply = () => {
      frame = 0
      el.style.setProperty('--mx', pointer.current.x.toFixed(3))
      el.style.setProperty('--my', pointer.current.y.toFixed(3))
      el.style.setProperty('--p', progress.current.toFixed(3))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
      schedule()
    }
    const onScroll = () => {
      progress.current = Math.min(1, Math.max(0, window.scrollY / Math.max(1, el.offsetHeight)))
      schedule()
    }
    onScroll()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '10% 0px' })
    io.observe(el)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const [top, middle, bottom] = words

  return (
    <section
      ref={sectionRef}
      data-mood="hero"
      className="relative isolate flex min-h-svh flex-col overflow-clip pt-(--header-h)"
      style={{ '--mx': 0, '--my': 0, '--p': 0 } as CSSProperties}
    >
      {/* Atmosphere: a warm halo where the butter sits, and two thin orbit lines in the logo colours. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[47%] left-1/2 size-[min(135vw,112svh)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--nk-gold)_24%,transparent),transparent_72%)]" />
        <div className="absolute top-[47%] left-1/2 size-[min(108vw,88svh)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" />
        <div className="hero-orbit absolute top-[47%] left-1/2 size-[min(150vw,124svh)] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </div>

      <div className="wrap relative flex flex-1 flex-col">
        {eyebrow ? (
          <p className="eyebrow animate-fade-up mt-6 self-center text-center sm:mt-8" style={delay(250)}>
            {eyebrow}
          </p>
        ) : null}

        <div className="relative flex flex-1 items-center py-4 lg:pb-24">
          <h1 className="hero-words w-full font-display font-black select-none">
            <span className="sr-only">{brandName}: </span>
            <span className="hero-word hero-word-top animate-fade-up relative z-0 block text-ink" style={delay(80)}>
              <span className="hero-shift block" style={{ '--sx': 26, '--sy': 10, '--px': 9, '--py': -6 } as CSSProperties}>
                <span data-stretch="">{top}</span>
              </span>
            </span>
            {/* The middle word is the only one in front of the butter, so the butter really sits between the words. */}
            <span className="hero-word hero-word-middle animate-fade-up relative z-20 block text-ink" style={delay(200)}>
              <span className="hero-shift hero-front block" style={{ '--sx': -34, '--sy': -8, '--px': -11, '--py': 0 } as CSSProperties}>
                <span data-stretch="">{middle}</span>
              </span>
            </span>
            <span className="hero-word hero-word-bottom animate-fade-up relative z-0 block" style={delay(320)}>
              <span className="hero-shift block" style={{ '--sx': 18, '--sy': -12, '--px': 7, '--py': 8 } as CSSProperties}>
                <span className="relative inline-block" data-stretch="">
                  <span className="text-gold-sheen pour">{bottom}</span>
                  {butterStop ? <span aria-hidden data-butter-stop="hero" className="butter-stop" style={{ right: '20%', top: '16%' }} /> : null}
                </span>
              </span>
            </span>
          </h1>

          {/* The butter: a still image first (instant), then the live 3D curl fades in over it. */}
          <div className="hero-stage pointer-events-none absolute top-1/2 left-1/2 z-10 aspect-square -translate-x-1/2 -translate-y-1/2">
            <div className="hero-stage-in absolute inset-0">
              <div aria-hidden className="absolute inset-x-[18%] bottom-[9%] h-[9%] rounded-[100%] bg-black/55 blur-2xl" />
              {image ? (
                <div className="hero-photo absolute inset-[6%]">
                  <Image src={image.url} alt={image.alt} fill priority sizes="(max-width: 768px) 80vw, 60svh" className="object-contain drop-shadow-[0_40px_60px_rgb(0_0_0/0.55)]" />
                </div>
              ) : (
                <>
                  <Image
                    src="/brand/butter-curl.webp"
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 768px) 80vw, 62svh"
                    className={cn('object-contain transition-opacity duration-700 ease-out', ready3D ? 'opacity-0' : 'opacity-100', !mount3D && 'animate-float-slow')}
                  />
                  {mount3D ? (
                    <div className={cn('absolute inset-0 transition-opacity duration-700 ease-out', ready3D ? 'opacity-100' : 'opacity-0')}>
                      <ButterHeroScene
                        pointer={pointer}
                        progress={progress}
                        active={active}
                        lowPower={lowPower}
                        accentFrom={accentFrom}
                        accentTo={accentTo}
                        onReady={() => setReady3D(true)}
                      />
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>

        {/* On wide screens the text and buttons sit in the two free corners under the words. */}
        <div className="relative z-20 flex flex-col gap-5 pb-8 sm:gap-7 sm:pb-14 lg:absolute lg:inset-x-[clamp(1.25rem,5vw,4rem)] lg:bottom-12 lg:flex-row lg:items-end lg:justify-between lg:pb-0">
          {subtitle ? (
            <p className="animate-fade-up max-w-[23rem] text-body text-ink/85 lg:text-[1.06rem]" style={delay(520)}>
              {subtitle}
            </p>
          ) : null}
          <div className="hero-ctas animate-fade-up flex flex-wrap items-center gap-3" style={delay(640)}>
            {primaryCta?.label ? (
              <ButtonLink href={primaryCta.href} size="lg" className="max-sm:h-12 max-sm:flex-1 max-sm:px-4 max-sm:text-small">
                {primaryCta.label}
              </ButtonLink>
            ) : null}
            {secondaryCta?.label ? (
              <ButtonLink href={secondaryCta.href} variant="outline" size="lg" icon={false} className="max-sm:h-12 max-sm:flex-1 max-sm:px-4 max-sm:text-small">
                {secondaryCta.label}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>

      {/* The start of the golden thread: a line of gold runs down from under the butter as the visitor scrolls on. */}
      <span aria-hidden className="hero-thread" />

      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 hidden flex-col items-center gap-2 lg:flex" aria-hidden>
        <span className="hidden text-micro text-muted 2xl:block">{scrollHint}</span>
        <span className="relative block h-9 w-px overflow-hidden bg-line">
          <span className="animate-scroll-hint absolute inset-0 bg-gold" />
        </span>
      </div>
    </section>
  )
}
