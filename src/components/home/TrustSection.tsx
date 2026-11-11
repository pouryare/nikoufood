import { FeatureRows, type FeatureRow } from '@/components/ui/FeatureRows'
import { SectionHeading } from '@/components/ui/SectionHeading'

type Props = {
  head: { eyebrow?: string | null; title?: string | null; text?: string | null }
  items?: FeatureRow[] | null
}

/** Why the company can be trusted: the heading stays in view while the reasons scroll past it. */
export function TrustSection({ head, items }: Props) {
  const rows = (items ?? []).filter((item) => item.title)
  if (rows.length === 0) return null
  return (
    <section className="section-y border-y border-line/50 bg-surface/40">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+3rem)] lg:col-span-4 lg:self-start">
          <SectionHeading {...head} />
        </div>
        <div className="lg:col-span-8">
          <FeatureRows items={rows} />
        </div>
      </div>
    </section>
  )
}
