import { z } from 'zod'
import { toEnDigits } from './format'

export const MOBILE_RE = /^09\d{9}$/

const clean = (s: string) => s.replace(/\s+/g, ' ').trim()

const name = z
  .string()
  .transform(clean)
  .pipe(z.string().min(3, 'نام و نام خانوادگی را کامل وارد کنید.').max(80, 'نام بیش از حد طولانی است.'))

const mobile = z
  .string()
  .transform((v) => toEnDigits(v).replace(/[\s-]/g, ''))
  .pipe(z.string().regex(MOBILE_RE, 'شماره موبایل را به شکل ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.'))

const optionalText = (max: number) =>
  z
    .string()
    .optional()
    .transform((v) => clean(v ?? ''))
    .pipe(z.string().max(max, 'متن بیش از حد طولانی است.'))

const email = z
  .string()
  .optional()
  .transform((v) => clean(v ?? ''))
  .pipe(z.union([z.literal(''), z.email('ایمیل معتبر نیست.')]))

/** Representative application: deliberately short (name, mobile, province). */
export const representativeSchema = z.object({
  fullName: name,
  mobile,
  province: z.string().min(1, 'استان را انتخاب کنید.'),
})

export const partnershipSchema = z.object({
  fullName: name,
  mobile,
  company: optionalText(120),
  businessType: optionalText(80),
  email,
  message: optionalText(1500),
})

export const contactSchema = z.object({
  fullName: name,
  mobile,
  email,
  message: clean_message(),
})

function clean_message() {
  return z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().min(5, 'پیام خود را بنویسید.').max(2000, 'پیام بیش از حد طولانی است.'))
}

export type LeadType = 'representative' | 'partnership' | 'contact'

export const leadSchemas = {
  representative: representativeSchema,
  partnership: partnershipSchema,
  contact: contactSchema,
} as const

export type FormState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> }
