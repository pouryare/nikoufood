import { LeadForm } from '@/components/forms/LeadForm'
import { FeatureRows } from '@/components/ui/FeatureRows'
import { PageHeader } from '@/components/ui/PageHeader'
import { getProvinces, getRepresentationPage, getUi } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const page = await getRepresentationPage()
  return pageMetadata({ title: page.header?.title, description: page.header?.intro, path: '/representation', meta: page.meta })
}

export default async function RepresentationPage({ searchParams }: { searchParams: Promise<{ province?: string }> }) {
  const [page, ui, provinces, params] = await Promise.all([getRepresentationPage(), getUi(), getProvinces(), searchParams])
  const header = page.header
  const requirements = (page.requirements ?? []).filter((r) => r.title)
  const process = (page.process ?? []).filter((r) => r.title)
  const wanted = provinces.find((p) => p.slug === params.province)?.slug

  return (
    <>
      <PageHeader
        eyebrow={header?.eyebrow}
        title={header?.title ?? ''}
        intro={header?.intro}
        homeLabel={ui.common.home}
        trail={[{ name: header?.eyebrow || header?.title || '', path: '/representation' }]}
      />
      <section className="pb-24">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <LeadForm
              type="representative"
              fields={['fullName', 'mobile', 'province']}
              provinces={provinces.map((p) => ({ slug: p.slug, name: p.name }))}
              defaultProvince={wanted}
              sourcePage="/representation"
              labels={ui.forms}
              copy={page.form ?? {}}
            />
          </div>
          <div className="grid content-start gap-12 lg:col-span-5">
            {requirements.length ? (
              <div>
                <h2 className="text-h3" data-reveal>
                  {ui.products.features}
                </h2>
                <div className="mt-4">
                  <FeatureRows items={requirements.map((r) => ({ id: r.id, title: r.title!, text: r.text, icon: r.icon }))} />
                </div>
              </div>
            ) : null}
            {process.length ? (
              <div>
                <FeatureRows items={process.map((r) => ({ id: r.id, title: r.title!, text: r.text, icon: r.icon }))} />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  )
}
