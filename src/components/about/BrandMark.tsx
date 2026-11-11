'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { LogoMark } from '@/components/brand/LogoMark'
import { cn } from '@/lib/cn'
import { hasWebGL, isLowPower, prefersReducedMotion, wantsLessData, whenIdle } from '@/lib/webgl'

const BrandMarkScene = dynamic(() => import('@/components/three/BrandMarkScene'), { ssr: false })

type Props = { accentFrom: string; accentTo: string; enable3D: boolean; title: string }

/** The logo, large. Capable desktops get it as a solid that turns with the pointer; everyone else gets the flat vector. */
export function BrandMark({ accentFrom, accentTo, enable3D, title }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const [mount3D, setMount3D] = useState(false)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (!enable3D || prefersReducedMotion() || wantsLessData() || !hasWebGL() || isLowPower()) return
    return whenIdle(() => setMount3D(true), 900)
  }, [enable3D])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '10% 0px' })
    io.observe(el)
    return () => {
      window.removeEventListener('pointermove', onMove)
      io.disconnect()
    }
  }, [])

  return (
    <div ref={rootRef} role="img" aria-label={title} className="about-mark">
      <span aria-hidden className="about-mark-halo" />
      <LogoMark size={320} animate className={cn('about-mark-flat transition-opacity duration-700', ready && 'opacity-0')} />
      {mount3D ? (
        <div className={cn('absolute inset-0 transition-opacity duration-700', ready ? 'opacity-100' : 'opacity-0')}>
          <BrandMarkScene pointer={pointer} accentFrom={accentFrom} accentTo={accentTo} active={active} onReady={() => setReady(true)} />
        </div>
      ) : null}
    </div>
  )
}
