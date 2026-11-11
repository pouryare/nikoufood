'use client'

import Link from 'next/link'
import { UI_DEFAULTS } from '@/lib/ui-defaults'

/** Shown when a page fails to render. It cannot read the CMS (that may be what failed), so it uses the built-in texts. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = UI_DEFAULTS.errors
  return (
    <section className="section-y">
      <div className="wrap mx-auto max-w-2xl text-center">
        <h1 className="text-h2">{t.errorTitle}</h1>
        <p className="mt-5 text-lead text-muted">{t.errorText}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="form-submit px-8">
            {t.retry}
          </button>
          <Link href="/" className="inline-flex h-14 items-center rounded-md border border-line px-8 font-bold hover:border-gold/70 hover:text-gold">
            {t.backHome}
          </Link>
        </div>
      </div>
    </section>
  )
}
