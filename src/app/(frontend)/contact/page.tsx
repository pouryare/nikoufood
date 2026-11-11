import { LeadForm } from '@/components/forms/LeadForm'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { getChannels } from '@/lib/channels'
import { getContactPage, getSiteSettings, getUi } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  const page = await getContactPage()
  return pageMetadata({ title: page.header?.title, description: page.header?.intro, path: '/contact', meta: page.meta })
}

export default async function ContactPage() {
  const [page, settings, ui] = await Promise.all([getContactPage(), getSiteSettings(), getUi()])
  const header = page.header
  const channels = getChannels(settings, ui)
  const hasLocation = settings.address || settings.workingHours

  return (
    <>
      <PageHeader
        eyebrow={header?.eyebrow}
        title={header?.title ?? ''}
        intro={header?.intro}
        homeLabel={ui.common.home}
        trail={[{ name: header?.eyebrow || header?.title || '', path: '/contact' }]}
      />
      <section className="pb-24">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7" data-reveal>
            <LeadForm type="contact" fields={['fullName', 'mobile', 'email', 'message']} sourcePage="/contact" labels={ui.forms} copy={page.form ?? {}} />
          </div>
          <div className="grid content-start gap-4 lg:col-span-5">
            {channels.length ? (
              <ul className="grid gap-3" data-reveal>
                {channels.map((c) => (
                  <li key={c.key}>
                    <a href={c.href} {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="contact-row">
                      <span className="contact-row-icon">
                        <Icon name={c.icon} size={20} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-small text-muted">{c.label}</span>
                        <span className="block truncate font-bold" dir="ltr">
                          {c.display}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            {hasLocation ? (
              <div className="panel grid gap-4 p-6" data-reveal>
                {settings.address ? (
                  <div>
                    <p className="text-small text-muted">{ui.contact.address}</p>
                    <p className="mt-1 leading-8">{settings.address}</p>
                  </div>
                ) : null}
                {settings.workingHours ? (
                  <div>
                    <p className="text-small text-muted">{ui.contact.hours}</p>
                    <p className="mt-1">{settings.workingHours}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  )
}
