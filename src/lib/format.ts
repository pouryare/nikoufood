const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

/** 15 → ۱۵ */
export const toFa = (value: string | number): string => String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)])

/** ۰۹۱۲… and ٠٩١٢… → 0912… (used before validating form input) */
export const toEnDigits = (value: string): string =>
  value
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))

/** Jalali (Persian) calendar date, e.g. «۱۹ آبان ۱۴۰۴» */
export function formatJalali(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long', day: 'numeric' }).format(d)
}

/** Keep only the characters a dialable number can contain. */
export const dialable = (value: string): string => toEnDigits(value).replace(/[^\d+]/g, '')

/** Escape text before putting it into an HTML email. */
export const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
