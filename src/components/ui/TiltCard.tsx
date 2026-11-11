'use client'

import { m, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = { children: ReactNode; className?: string; innerClassName?: string; max?: number }

/**
 * A card that leans toward the mouse like a physical object, with a soft light following the cursor.
 * Only reacts to a real mouse: touch screens and reduced-motion visitors get a still card.
 */
export function TiltCard({ children, className, innerClassName, max = 6 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const springX = useSpring(rx, { stiffness: 170, damping: 18, mass: 0.5 })
  const springY = useSpring(ry, { stiffness: 170, damping: 18, mass: 0.5 })

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * max * 2)
    rx.set(-py * max * 2)
    ref.current.style.setProperty('--gx', `${(px + 0.5) * 100}%`)
    ref.current.style.setProperty('--gy', `${(py + 0.5) * 100}%`)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <div className={cn('group/tilt [perspective:1200px]', className)}>
      <m.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
        className={cn('relative h-full', innerClassName)}
      >
        {children}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100"
          style={{
            background:
              'radial-gradient(460px circle at var(--gx, 50%) var(--gy, 50%), color-mix(in oklab, var(--nk-cream) 14%, transparent), transparent 62%)',
          }}
        />
      </m.div>
    </div>
  )
}
