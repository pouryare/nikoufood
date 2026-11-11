'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { toEnDigits } from '@/lib/format'
import { leadSchemas, type FormState, type LeadType } from '@/lib/forms'
import { hashIp, isRecentDuplicate, LIMITS, notifyAdmins, tooManySubmissions } from '@/lib/leads'
import { SITE_URL } from '@/lib/site'

const GENERIC_ERROR = 'ارسال با مشکل روبه‌رو شد. لطفاً چند دقیقه دیگر دوباره تلاش کنید یا با ما تماس بگیرید.'

/**
 * One server action for every public form. Everything is validated again here:
 * the browser is never trusted, even though the form also validates for convenience.
 */
export async function submitLead(type: LeadType, _prev: FormState, formData: FormData): Promise<FormState> {
  const schema = leadSchemas[type]
  if (!schema) return { status: 'error', message: GENERIC_ERROR }

  // Keep what the visitor typed so a failed submit does not wipe the form.
  const raw: Record<string, string> = {}
  for (const [key, value] of formData.entries()) if (typeof value === 'string' && !key.startsWith('$ACTION')) raw[key] = value
  const { website, startedAt, sourcePage, ...fields } = raw

  // Spam traps: a hidden field only bots fill in, and a form that was "filled" faster than a human can.
  const elapsed = Date.now() - Number(startedAt || 0)
  if (website || !Number.isFinite(elapsed) || elapsed < LIMITS.minFillMs || elapsed > LIMITS.maxFillMs) {
    // Pretend success so bots learn nothing.
    return website ? { status: 'success' } : { status: 'error', message: 'لطفاً چند لحظه صبر کنید و دوباره ارسال کنید.', values: fields }
  }

  const parsed = schema.safeParse(fields)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '')
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { status: 'error', fieldErrors, values: fields }
  }
  const data = parsed.data as Record<string, string>

  try {
    const payload = await getPayload({ config })
    const h = await headers()
    const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown'
    const ipHash = hashIp(ip)

    if (await tooManySubmissions(payload, ipHash)) {
      return { status: 'error', message: 'تعداد درخواست‌های شما از حد مجاز گذشته است. لطفاً بعداً دوباره تلاش کنید.', values: fields }
    }
    if (await isRecentDuplicate(payload, type, data.mobile)) return { status: 'success' }

    // The province must be a real one: never trust the id the browser sends.
    let provinceId: number | undefined
    let provinceName = ''
    if (data.province) {
      const found = await payload.find({ collection: 'provinces', where: { slug: { equals: data.province } }, limit: 1, depth: 0 })
      const province = found.docs[0]
      if (!province) return { status: 'error', fieldErrors: { province: 'استان انتخاب‌شده معتبر نیست.' }, values: fields }
      provinceId = province.id
      provinceName = province.name
    }

    const lead = await payload.create({
      collection: 'leads',
      data: {
        type,
        status: 'new',
        fullName: data.fullName,
        mobile: data.mobile,
        province: provinceId,
        company: data.company || undefined,
        businessType: data.businessType || undefined,
        email: data.email || undefined,
        message: data.message || undefined,
        sourcePage: (sourcePage || '').slice(0, 200),
        ipHash,
      },
    })

    try {
      await notifyAdmins(
        payload,
        type,
        [
          { label: 'نام', value: data.fullName },
          { label: 'موبایل', value: toEnDigits(data.mobile) },
          { label: 'استان', value: provinceName },
          { label: 'شرکت', value: data.company ?? '' },
          { label: 'نوع کسب‌وکار', value: data.businessType ?? '' },
          { label: 'ایمیل', value: data.email ?? '' },
          { label: 'پیام', value: data.message ?? '' },
        ],
        `${SITE_URL}/admin/collections/leads/${lead.id}`,
      )
    } catch (error) {
      // The request is saved; a mail problem must not make the visitor think it failed.
      payload.logger.error({ err: error }, 'Lead saved but the notification email failed')
    }
    return { status: 'success' }
  } catch (error) {
    console.error('submitLead failed', error)
    return { status: 'error', message: GENERIC_ERROR, values: fields }
  }
}
