import Link from 'next/link'
import { cn } from '@/lib/cn'

type Key = 'category' | 'brand' | 'type'
type Group = { key: Key; label: string; options: { slug: string; name: string }[] }
type Props = { groups: Group[]; active: Record<Key, string | undefined>; allLabel: string; label: string }

/** Filters are plain links, so they work without JavaScript and every result has its own address. */
export function ProductFilters({ groups, active, allLabel, label }: Props) {
  if (groups.length === 0) return null
  const href = (key: Key, slug?: string) => {
    const next = new URLSearchParams()
    for (const g of groups) {
      const value = g.key === key ? slug : active[g.key]
      if (value) next.set(g.key, value)
    }
    const qs = next.toString()
    return qs ? `/products?${qs}` : '/products'
  }
  return (
    <div role="group" aria-label={label} className="filters">
      {groups.map((group) => (
        <div key={group.key} className="filter-row">
          <span className="filter-label">{group.label}</span>
          <ul className="filter-chips">
            {[{ slug: undefined, name: allLabel }, ...group.options].map((option) => {
              const on = (active[group.key] ?? undefined) === option.slug
              return (
                <li key={option.slug ?? 'all'}>
                  <Link href={href(group.key, option.slug)} scroll={false} aria-current={on ? 'true' : undefined} className={cn('chip', on && 'chip-on')}>
                    {option.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
