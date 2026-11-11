import { useId } from 'react'
import { BRAND_MARK_PATH, BRAND_MARK_VIEWBOX } from '@/data/brand-mark'
import { cn } from '@/lib/cn'

type Props = {
  size?: number
  /** Draw the outline first, then fill with the gradient (used once, in the header). */
  animate?: boolean
  title?: string
  className?: string
}

/** The Nikou "N" as a crisp vector, coloured with the logo gradient from the theme. */
export function LogoMark({ size = 40, animate = false, title, className }: Props) {
  const id = useId()
  const v = BRAND_MARK_VIEWBOX
  return (
    <svg
      viewBox={`-8 -8 ${v + 16} ${v + 16}`}
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-animate={animate ? '' : undefined}
      className={cn('logo-mark shrink-0', className)}
    >
      <defs>
        <linearGradient id={id} x1="28" y1="0" x2="481" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--nk-logo-from)" />
          <stop offset="1" stopColor="var(--nk-logo-to)" />
        </linearGradient>
      </defs>
      <path className="logo-fill" d={BRAND_MARK_PATH} fill={`url(#${id})`} />
      <path
        className="logo-stroke"
        d={BRAND_MARK_PATH}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="9"
        strokeLinejoin="round"
        pathLength={1}
      />
    </svg>
  )
}
