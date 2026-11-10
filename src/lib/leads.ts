import { createHash } from 'crypto'
import type { Payload } from 'payload'
import { LEAD_STATUS, LEAD_TYPES } from '@/collections/Leads'
import { escapeHtml } from './format'
import type { LeadType } from './forms'

const typeLabel = (type: LeadType) => LEAD_TYPES.find((t) => t.value === type)?.label ?? type
const statusLabel = (s: string) => LEAD_STATUS.find((t) => t.value === s)?.label ?? s

/** One-way hash of the visitor's IP so we can rate-limit without storing the address itself. */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || process.env.PAYLOAD_SECRET || 'nikou'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 24)
}

export const LIMITS = {
  /** Same visitor: at most this many submissions in the window. */
  perVisitor: 5,
  windowMs: 60 * 60 * 1000,
  /** Form must stay open at least this long (bots submit instantly). */
  minFillMs: 2500,
  maxFillMs: 6 * 60 * 60 * 1000,
} as const

export async function tooManySubmissions(payload: Payload, ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - LIMITS.windowMs).toISOString()
  const { totalDocs } = await payload.count({
    collection: 'leads',
    where: { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since } }] },
  })
  return totalDocs >= LIMITS.perVisitor
}

/** Same person sending the same form again within a day: acknowledge, but do not create a duplicate. */
export async function isRecentDuplicate(payload: Payload, type: LeadType, mobile: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { totalDocs } = await payload.count({
    collection: 'leads',
    where: { and: [{ type: { equals: type } }, { mobile: { equals: mobile } }, { createdAt: { greater_than: since } }] },
  })
  return totalDocs > 0
}

type LeadRow = { label: string; value: string }

export async function notifyAdmins(payload: Payload, type: LeadType, rows: LeadRow[], adminUrl: string) {
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const to = (settings.notifyEmails || process.env.NOTIFY_EMAILS || '')
    .split(/[,،;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (to.length === 0) {
    payload.logger.warn(`New ${type} lead saved, but no notification email is set (تنظیمات سایت ← اطلاع‌رسانی).`)
    return
  }
  const title = `${typeLabel(type)} جدید`
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9;color:#1a1f2e">
  <h2 style="margin:0 0 12px">${escapeHtml(title)}</h2>
  <table style="border-collapse:collapse;min-width:320px">
    ${rows
      .filter((r) => r.value)
      .map(
        (r) =>
          `<tr><td style="padding:6px 12px;border:1px solid #e3e6ee;background:#f6f7fb">${escapeHtml(r.label)}</td><td style="padding:6px 12px;border:1px solid #e3e6ee">${escapeHtml(r.value)}</td></tr>`,
      )
      .join('')}
  </table>
  <p style="margin-top:16px"><a href="${escapeHtml(adminUrl)}">مشاهده در پنل مدیریت</a></p>
  <p style="color:#7b8497;font-size:12px">وضعیت اولیه: ${escapeHtml(statusLabel('new'))}</p>
</div>`
  await payload.sendEmail({
    to,
    from: settings.notifyFrom || undefined,
    subject: `${title} | ${settings.brandName ?? 'نیکو اعتماد'}`,
    html,
  })
}
