import { FeatureRows, type FeatureRow } from '@/components/ui/FeatureRows'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getMarkets } from '@/lib/cms'
import { Bento } from './Bento'
import { GiantWord } from './GiantWord'

type Props = {
  head: { eyebrow?: string | null; title?: string | null; text?: string | null }
  items?: FeatureRow[] | null
  /** A word of the title that first fills the screen and then settles into it (empty = no effect). */
  bigWord?: string | null
  /** Reasons as living tiles instead of numbered rows (تنظیمات سایت › جلوه‌های ویژه). */
  bento?: boolean
}

/** Why the company can be trusted. */
export async function TrustSection({ head, items, bigWord, bento }: Props) {
  const rows = (items ?? []).filter((item) => item.title)
  if (rows.length === 0) return null
  const word = bigWord?.trim()
  const giant = Boolean(word && head.title?.includes(word))

  if (!bento) {
    return (
      <section className="section-y border-y border-line/50 bg-surface/40">
        {giant ? <GiantWord eyebrow={head.eyebrow} title={head.title!} word={word!} /> : null}
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)] lg:col-span-4 lg:self-start">
            <SectionHeading eyebrow={giant ? null : head.eyebrow} title={giant ? null : head.title} text={head.text} />
          </div>
          <div className="lg:col-span-8">
            <FeatureRows items={rows} />
          </div>
        </div>
      </section>
    )
  }

  const markets = (await getMarkets()).map((m) => m.name)
  return (
    <section className="trust pb-[clamp(4.5rem,10vw,9.5rem)]">
      {giant ? (
        <GiantWord eyebrow={head.eyebrow} title={head.title!} word={word!} />
      ) : (
        <div className="wrap section-y pb-0">
          <SectionHeading {...head} align="center" />
        </div>
      )}
      <div className="wrap">
        {giant && head.text ? (
          <p data-reveal className="rise-text mx-auto -mt-[12svh] mb-12 max-w-2xl text-center text-lead text-muted">
            {head.text}
          </p>
        ) : null}
        <div className={giant ? '' : 'mt-12'}>
          <Bento items={rows} markets={markets} />
        </div>
      </div>
    </section>
  )
}
