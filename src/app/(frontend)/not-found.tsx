import { ButterRiceToy } from '@/components/fun/ButterRiceToy'
import { ButtonLink } from '@/components/ui/Button'
import { getUi } from '@/lib/cms'

export const metadata = { title: 'صفحه پیدا نشد', robots: { index: false } }

export default async function NotFound() {
  const ui = await getUi()
  return (
    <section className="section-y">
      <div className="wrap mx-auto max-w-2xl text-center">
        <p aria-hidden className="text-hero text-gold/90">
          <span data-stretch="">۴۰۴</span>
        </p>
        <h1 className="mt-4 text-h2">{ui.errors.notFoundTitle}</h1>
        <p className="mt-5 text-lead text-muted">{ui.errors.notFoundText}</p>
        <div className="mt-10 flex justify-center">
          <ButtonLink href="/" size="lg" icon="arrowLeft">
            {ui.errors.backHome}
          </ButtonLink>
        </div>
        {/* A small consolation while the page is missing: butter the rice. */}
        <div className="mt-16">
          <ButterRiceToy
            layout="stack"
            hint={ui.errors.notFoundToy}
            doneText={ui.toys.riceDone}
            steps={[ui.toys.riceStep1, ui.toys.riceStep2, ui.toys.riceStep3]}
            progressLabel={ui.toys.riceProgress}
            againLabel={ui.toys.again}
            guideLabel={ui.toys.riceGuide}
            startLabel={ui.toys.riceStart}
            closeLabel={ui.toys.riceClose}
          />
        </div>
      </div>
    </section>
  )
}
