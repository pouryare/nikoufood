import type { CSSProperties } from 'react'
import { ChatSection } from '@/components/chat/ChatSection'
import { NetworkSection } from '@/components/home/NetworkSection'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaBand } from '@/components/ui/CtaBand'
import { FeatureRows } from '@/components/ui/FeatureRows'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getFaqChat, getNetworkPage, getUi } from '@/lib/cms'
import { faqLd } from '@/lib/jsonld'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const page = await getNetworkPage()
  return pageMetadata({ title: page.header?.title, description: page.header?.intro, path: '/network', meta: page.meta })
}

export default async function NetworkPage() {
  const [page, ui, chat] = await Promise.all([getNetworkPage(), getUi(), getFaqChat()])
  const header = page.header
  const steps = (page.steps ?? []).filter((s) => s.title)
  // The chat takes the place of the plain question list while it is switched on for this page.
  const chatOn = chat.onNetwork !== false
  const faq = chatOn ? [] : (page.faq ?? []).filter((f) => f.question && f.answer)

  return (
    <>
      <PageHeader
        eyebrow={header?.eyebrow}
        title={header?.title ?? ''}
        intro={header?.intro}
        homeLabel={ui.common.home}
        trail={[{ name: header?.eyebrow || header?.title || '', path: '/network' }]}
      />

      <NetworkSection head={page.map ?? {}} tehran={page.tehran ?? undefined} others={page.provinces ?? undefined} />

      {steps.length ? (
        <section className="section-y">
          <div className="wrap grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeading title={page.stepsTitle} />
            </div>
            <div className="lg:col-span-7">
              <FeatureRows items={steps.map((s) => ({ id: s.id, title: s.title!, text: s.text, icon: s.icon }))} />
            </div>
          </div>
        </section>
      ) : null}

      {faq.length ? (
        <section className="section-y">
          <JsonLd data={faqLd(faq.map((f) => ({ question: f.question, answer: f.answer })))} />
          <div className="wrap max-w-4xl">
            {page.faqTitle ? (
              <h2 data-reveal className="mb-8 text-h2">
                {page.faqTitle}
              </h2>
            ) : null}
            <ul className="faq">
              {faq.map((item, i) => (
                <li key={item.id ?? item.question} data-reveal style={{ '--i': i % 4 } as CSSProperties}>
                  <details>
                    <summary>
                      <span>{item.question}</span>
                      <Icon name="plus" size={20} />
                    </summary>
                    <p>{item.answer}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {chatOn ? <ChatSection place="network" /> : null}

      <CtaBand title={page.cta?.title} text={page.cta?.text} actions={[{ label: page.cta?.label, href: '/representation' }]} />
    </>
  )
}
