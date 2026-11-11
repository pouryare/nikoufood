import { ButtonLink } from '@/components/ui/Button'
import { getUi } from '@/lib/cms'

export const metadata = { title: 'صفحه پیدا نشد', robots: { index: false } }

export default async function NotFound() {
  const ui = await getUi()
  return (
    <section className="section-y">
      <div className="wrap mx-auto max-w-2xl text-center">
        <p aria-hidden className="text-hero text-gold/90">۴۰۴</p>
        <h1 className="mt-4 text-h2">{ui.errors.notFoundTitle}</h1>
        <p className="mt-5 text-lead text-muted">{ui.errors.notFoundText}</p>
        <div className="mt-10 flex justify-center">
          <ButtonLink href="/" size="lg" icon="arrowLeft">
            {ui.errors.backHome}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
