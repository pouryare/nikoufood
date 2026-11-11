import { cn } from '@/lib/cn'

type Props = { items: string[]; label?: string | null; className?: string }

/**
 * A slow band of big words that drifts across the page (pure CSS, pauses under the pointer).
 * Screen readers get the same words once, as a normal sentence; the moving copy is decorative.
 */
export function Marquee({ items, label, className }: Props) {
  const words = items.filter(Boolean)
  if (words.length < 2) return null
  // The list is repeated until one group is wider than any screen, otherwise the loop would show a gap.
  const group = Array.from({ length: Math.ceil(14 / words.length) }, () => words)
  return (
    <div className={cn('marquee', className)}>
      <p className="sr-only">
        {label ? `${label}: ` : ''}
        {words.join('، ')}
      </p>
      <div className="marquee-track" aria-hidden>
        {[0, 1].map((copy) => (
          <ul key={copy} className="marquee-group">
            {group.map((list, round) => [
              label ? (
                <li key={`${round}-label`} className="marquee-label">
                  {label}
                </li>
              ) : null,
              ...list.map((word) => <li key={`${round}-${word}`}>{word}</li>),
            ])}
          </ul>
        ))}
      </div>
    </div>
  )
}
