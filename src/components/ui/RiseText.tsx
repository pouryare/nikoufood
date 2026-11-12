import { Fragment, type CSSProperties } from 'react'
import { splitWords } from '@/lib/split-words'

/**
 * A title whose words rise one after another from behind an invisible line when it scrolls into view.
 * Put it inside an element that has `data-reveal` and the class `rise`. The words stay ordinary text,
 * so screen readers and search engines read the title as usual; with the effect switched off
 * (تنظیمات سایت › جلوه‌های ویژه) nothing moves.
 */
export function RiseText({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <>
      {splitWords(text).map((word, i) => (
        <Fragment key={i}>
          {i > 0 ? ' ' : null}
          <span className="rise-w">
            <span style={{ '--wi': i + offset } as CSSProperties}>{word}</span>
          </span>
        </Fragment>
      ))}
    </>
  )
}
