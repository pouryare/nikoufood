import type { CSSProperties } from 'react'
import { LeadForm } from '@/components/forms/LeadForm'
import { FeatureRows } from '@/components/ui/FeatureRows'
import { Icon, iconName } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { getPartnershipPage, getUi } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const page = await getPartnershipPage()
  return pageMetadata({ title: page.header?.title, description: page.header?.intro, path: '/partnership', meta: page.meta })
}

export default async function PartnershipPage() {
  const [page, ui] = await Promise.all([getPartnershipPage(), getUi()])
  const header = page.header
  const audiences = (page.audiences ?? []).filter((a) => a.title)
  const benefits = (page.benefits ?? []).filter((b) => b.title)
  const types = (page.businessTypes ?? []).map((t) => t.label).filter(Boolean)

  return (
    <>
      <PageHeader
        eyebrow={header?.eyebrow}
        title={header?.title ?? ''}
        intro={header?.intro}
        homeLabel={ui.common.home}
        trail={[{ name: header?.eyebrow || header?.title || '', path: '/partnership' }]}
      />

      {audiences.length ? (
        <section className="pb-16">
          <div className="wrap">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map((a, i) => (
                <li key={a.id ?? a.title} data-reveal style={{ '--i': i } as CSSProperties} className="panel p-6">
                  <span className="grid size-11 place-items-center rounded-full border border-gold/40 text-gold">
                    <Icon name={iconName(a.icon) ?? 'building'} size={20} />
                  </span>
                  <h3 className="mt-5 text-[1.15rem] font-bold">{a.title}</h3>
                  {a.text ? <p className="mt-2 text-small text-muted">{a.text}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="pb-24">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <LeadForm
              type="partnership"
              fields={['fullName', 'mobile', 'company', 'businessType', 'email', 'message']}
              businessTypes={types as string[]}
              sourcePage="/partnership"
              labels={ui.forms}
              copy={page.form ?? {}}
            />
          </div>
          <div className="lg:col-span-5">
            <FeatureRows items={benefits.map((b) => ({ id: b.id, title: b.title!, text: b.text, icon: b.icon }))} />
          </div>
        </div>
      </section>
    </>
  )
}
