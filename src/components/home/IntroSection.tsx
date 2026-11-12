import type { CSSProperties } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { CountUp } from '@/components/ui/CountUp'
import { ReadingText } from '@/components/ui/ReadingText'
import { RiseText } from '@/components/ui/RiseText'
import { RollingNumber } from '@/components/ui/RollingNumber'

type Props = {
  eyebrow?: string | null
  title?: string | null
  text?: string | null
  highlights?: { id?: string | null; value: string; label: string }[] | null
  cta?: { label?: string | null; href?: string | null } | null
  /** Words light up one by one as the visitor scrolls (تنظیمات سایت › جلوه‌های ویژه). */
  wordLight?: boolean
  /** Figures spin like a counter instead of filling with melted gold. */
  rollingNumbers?: boolean
  /** Marks the place beside the text where the travelling butter rests. */
  butterStop?: boolean
}

/** Who the company is, in one calm block: a statement on one side, the text on the other, real figures underneath. */
export function IntroSection({ eyebrow, title, text, highlights, cta, wordLight, rollingNumbers, butterStop }: Props) {
  const stats = (highlights ?? []).filter((h) => h.value && h.label)
  if (!title && !text && stats.length === 0) return null
  return (
    <section className="section-y">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-16">
          <div className={wordLight ? 'lg:col-span-5' : 'lg:col-span-6'}>
            {eyebrow ? (
              <p data-reveal data-thread className="eyebrow">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 data-reveal style={{ '--i': 1 } as CSSProperties} className="rise mt-5 text-h2">
                <RiseText text={title} />
              </h2>
            ) : null}
          </div>
          <div className={wordLight ? 'relative lg:col-span-7 lg:pt-12' : 'relative lg:col-span-6 lg:pt-12'}>
            {text ? (
              wordLight ? (
                <ReadingText text={text} keys={stats.map((s) => s.value)} className="intro-read" />
              ) : (
                <p data-reveal style={{ '--i': 2 } as CSSProperties} className="rise-text text-lead text-muted">
                  {text}
                </p>
              )
            ) : null}
            {cta?.label ? (
              <div data-reveal style={{ '--i': 3 } as CSSProperties} className="mt-8">
                <ButtonLink href={cta.href} variant="outline">
                  {cta.label}
                </ButtonLink>
              </div>
            ) : null}
            {butterStop ? <span aria-hidden data-butter-stop="intro" className="butter-stop" style={{ left: '-1.5rem', top: '62%' }} /> : null}
          </div>
        </div>

        {stats.length ? (
          <dl className="stat-row mt-[clamp(3rem,7vw,6rem)]">
            {stats.map((stat, i) => (
              <div key={stat.id ?? stat.label} data-reveal style={{ '--i': i } as CSSProperties} className="stat">
                <dt className="stat-label">{stat.label}</dt>
                {/* Short figures are set very large; longer wording gets a calmer size so it stays on one line. */}
                <dd className="stat-value" data-long={stat.value.trim().length > 5 ? '' : undefined}>
                  {rollingNumbers ? <RollingNumber value={stat.value} /> : <CountUp value={stat.value} className="text-gold-sheen pour" />}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  )
}
