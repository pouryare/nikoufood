import { LogoMark } from '@/components/brand/LogoMark'
import { CmsImage } from '@/components/ui/CmsImage'
import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import type { Channel } from '@/lib/channels'
import { mediaOf } from '@/lib/cms'
import type { UiTexts } from '@/lib/ui-defaults'
import type { Navigation, SiteSetting } from '@/payload-types'

type Props = {
  settings: SiteSetting
  columns: NonNullable<Navigation['footerColumns']>
  channels: Channel[]
  ui: UiTexts
}

export function Footer({ settings, columns, channels, ui }: Props) {
  const messengers = channels.filter((c) => c.messenger || c.key === 'instagram')
  const direct = channels.filter((c) => c.key === 'phone' || c.key === 'email')
  const wordmark = mediaOf(settings.logoWordmark)

  return (
    <footer className="relative mt-auto bg-surface/50">
      <div className="hairline-brand" />
      <div className="wrap grid gap-14 py-16 lg:grid-cols-12 lg:gap-10 lg:py-20">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <LogoMark size={44} />
            <div className="flex flex-col leading-none">
              <span className="font-display text-[1.5rem] font-extrabold">{settings.brandName}</span>
              {settings.legalName ? <span className="mt-2 text-micro text-muted">{settings.legalName}</span> : null}
            </div>
          </div>
          {settings.footerText ? <p className="mt-6 max-w-sm text-small text-muted">{settings.footerText}</p> : null}
          {messengers.length > 0 ? (
            <ul className="mt-7 flex flex-wrap gap-2" aria-label={ui.contact.messengers}>
              {messengers.map((c) => (
                <li key={c.key}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-micro font-bold text-ink/90 transition-colors duration-200 hover:border-gold/60 hover:text-gold"
                  >
                    <Icon name={c.icon} size={16} />
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav aria-label={settings.brandName} className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-5">
          {columns.map((col) => (
            <div key={col.id ?? col.title}>
              <h2 className="font-sans text-small font-bold text-ink">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {(col.links ?? []).map((link) => (
                  <li key={link.id ?? link.href}>
                    <SmartLink href={link.href} className="text-small text-muted transition-colors duration-200 hover:text-gold">
                      {link.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="lg:col-span-3">
          <h2 className="font-sans text-small font-bold text-ink">{ui.contact.headOffice}</h2>
          <ul className="mt-4 space-y-3 text-small text-muted">
            {settings.address ? (
              <li className="flex gap-3">
                <Icon name="pin" size={18} className="mt-1.5 shrink-0 text-gold" />
                <span>{settings.address}</span>
              </li>
            ) : null}
            {direct.map((c) => (
              <li key={c.key} className="flex gap-3">
                <Icon name={c.icon} size={18} className="mt-1.5 shrink-0 text-gold" />
                <a href={c.href} dir="ltr" className="transition-colors duration-200 hover:text-gold">
                  {c.display}
                </a>
              </li>
            ))}
            {settings.workingHours ? (
              <li className="flex gap-3">
                <Icon name="clock" size={18} className="mt-1.5 shrink-0 text-gold" />
                <span>{settings.workingHours}</span>
              </li>
            ) : null}
          </ul>
          {(settings.trustBadges ?? []).length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-3">
              {(settings.trustBadges ?? []).map((badge) => (
                <li key={badge.id}>
                  <SmartLink href={badge.href || '#'} className="block rounded-md border border-line bg-white p-2">
                    <CmsImage media={badge.image} alt={badge.label ?? ''} sizes="80px" className="h-16 w-auto" />
                  </SmartLink>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="border-t border-line/60">
        <div className="wrap flex flex-col items-center justify-between gap-4 py-6 text-micro text-muted sm:flex-row">
          <p>{settings.copyright}</p>
          {wordmark ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={wordmark.url} alt={wordmark.alt} className="h-4 w-auto opacity-80" loading="lazy" />
          ) : (
            <p dir="ltr" className="font-latin text-[0.72rem] tracking-[0.34em] uppercase">
              <span className="font-bold text-ink/90">{(settings.brandNameLatin ?? '').split('').join(' ')}</span>
              {settings.latinTagline ? <span className="ms-3 border-s border-line ps-3">{settings.latinTagline}</span> : null}
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
