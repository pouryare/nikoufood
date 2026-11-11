import { useId } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { BRAND_MARK_PATH, BRAND_MARK_VIEWBOX } from '@/data/brand-mark'

type Action = { label?: string | null; href?: string | null } | null | undefined
type Props = { title?: string | null; text?: string | null; actions: Action[]; as?: 'h1' | 'h2' }

const VARIANTS = ['primary', 'outline', 'ghost'] as const

/**
 * The closing invitation of a page: one sentence, up to three buttons, on a stage where
 * the outline of the brand's N draws itself in the logo colours (a hairline, never a fill).
 */
export function CtaBand({ title, text, actions, as: Tag = 'h2' }: Props) {
  const id = useId()
  const shown = actions.filter((action) => action?.label)
  if (!title && shown.length === 0) return null
  const v = BRAND_MARK_VIEWBOX
  return (
    <section className="section-y">
      <div className="wrap">
        <div className="cta-band grain" data-reveal>
          <svg aria-hidden viewBox={`-8 -8 ${v + 16} ${v + 16}`} className="cta-band-mark">
            <defs>
              <linearGradient id={id} x1="28" y1="0" x2="481" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="var(--nk-logo-from)" />
                <stop offset="1" stopColor="var(--nk-logo-to)" />
              </linearGradient>
            </defs>
            <path d={BRAND_MARK_PATH} pathLength={1} stroke={`url(#${id})`} />
          </svg>
          <div className="relative mx-auto max-w-3xl text-center">
            {title ? <Tag className="text-h1">{title}</Tag> : null}
            {text ? <p className="mx-auto mt-6 max-w-2xl text-lead text-muted">{text}</p> : null}
            {shown.length ? (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {shown.map((action, i) => (
                  <ButtonLink key={`${action!.href}-${i}`} href={action!.href} variant={VARIANTS[Math.min(i, 2)]} size="lg" icon={i === 0 ? 'arrowLeft' : false} className="max-sm:w-full">
                    {action!.label}
                  </ButtonLink>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
