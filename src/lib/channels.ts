import type { IconName } from '@/components/ui/Icon'
import type { SiteSetting } from '@/payload-types'
import { dialable } from './format'
import type { UiTexts } from './ui-defaults'

export type Channel = {
  key: 'phone' | 'whatsapp' | 'telegram' | 'bale' | 'eitaa' | 'instagram' | 'email'
  label: string
  href: string
  /** What the visitor reads (a number, a handle…). */
  display: string
  icon: IconName
  messenger: boolean
}

const handle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

/** Contact channels that are actually filled in the CMS, in a fixed, sensible order. */
export function getChannels(settings: SiteSetting, ui: UiTexts): Channel[] {
  const out: Channel[] = []
  const t = ui.contact
  if (settings.phone) {
    out.push({ key: 'phone', label: t.phone, href: `tel:${dialable(settings.phone)}`, display: settings.phone, icon: 'phone', messenger: false })
  }
  if (settings.whatsappNumber) {
    const n = dialable(settings.whatsappNumber).replace(/^\+/, '')
    out.push({ key: 'whatsapp', label: t.whatsapp, href: `https://wa.me/${n}`, display: `+${n}`, icon: 'chat', messenger: true })
  }
  if (settings.telegramUrl) {
    out.push({ key: 'telegram', label: t.telegram, href: settings.telegramUrl, display: handle(settings.telegramUrl), icon: 'send', messenger: true })
  }
  if (settings.baleUrl) {
    out.push({ key: 'bale', label: t.bale, href: settings.baleUrl, display: handle(settings.baleUrl), icon: 'chat', messenger: true })
  }
  if (settings.eitaaUrl) {
    out.push({ key: 'eitaa', label: t.eitaa, href: settings.eitaaUrl, display: handle(settings.eitaaUrl), icon: 'chat', messenger: true })
  }
  if (settings.instagramUrl) {
    out.push({ key: 'instagram', label: t.instagram, href: settings.instagramUrl, display: handle(settings.instagramUrl), icon: 'instagram', messenger: false })
  }
  if (settings.email) {
    out.push({ key: 'email', label: t.email, href: `mailto:${settings.email}`, display: settings.email, icon: 'mail', messenger: false })
  }
  return out
}
