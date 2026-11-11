import Link from 'next/link'
import './(frontend)/globals.css'
import { bodyFont, displayFont } from './(frontend)/fonts'
import { UI_DEFAULTS } from '@/lib/ui-defaults'

export const metadata = { title: UI_DEFAULTS.errors.notFoundTitle, robots: { index: false } }

/** For addresses that match no page at all. It uses the built-in texts because it has no access to the layout. */
export default function GlobalNotFound() {
  const t = UI_DEFAULTS.errors
  return (
    <html lang="fa" dir="rtl" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="grid min-h-svh place-items-center px-6 text-center">
        <div className="max-w-xl">
          <p aria-hidden className="text-hero text-gold/90">۴۰۴</p>
          <h1 className="mt-4 text-h2">{t.notFoundTitle}</h1>
          <p className="mt-5 text-lead text-muted">{t.notFoundText}</p>
          <Link href="/" className="form-submit mt-10 inline-flex px-8">
            {t.backHome}
          </Link>
        </div>
      </body>
    </html>
  )
}
