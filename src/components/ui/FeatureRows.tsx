import type { CSSProperties } from 'react'
import { Icon, iconName } from '@/components/ui/Icon'
import { toFa } from '@/lib/format'

export type FeatureRow = { id?: string | null; title: string; text?: string | null; icon?: string | null }

/** A numbered list of short statements, one per line, each with an optional icon chosen in the CMS. */
export function FeatureRows({ items }: { items: FeatureRow[] }) {
  if (items.length === 0) return null
  return (
    <ol className="feature-rows">
      {items.map((item, i) => {
        const icon = iconName(item.icon)
        return (
          <li key={item.id ?? item.title} data-reveal style={{ '--i': i % 6 } as CSSProperties} className="feature-row">
            <span aria-hidden className="feature-row-num">
              {toFa(String(i + 1).padStart(2, '0'))}
            </span>
            <div className="min-w-0">
              <h3 className="feature-row-title">{item.title}</h3>
              {item.text ? <p className="feature-row-text">{item.text}</p> : null}
            </div>
            {icon ? (
              <span aria-hidden className="feature-row-icon">
                <Icon name={icon} size={22} />
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
