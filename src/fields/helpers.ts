import type { Field, TextField, TextareaField } from 'payload'

/** Small field builders so the CMS definitions stay short and consistent. */

export const text = (name: string, label: string, extra: Partial<TextField> = {}): TextField =>
  ({ name, label, type: 'text', ...extra }) as TextField

export const textarea = (name: string, label: string, extra: Partial<TextareaField> = {}): TextareaField =>
  ({ name, label, type: 'textarea', ...extra }) as TextareaField

export const richText = (name: string, label: string, extra: Record<string, unknown> = {}): Field =>
  ({ name, label, type: 'richText', ...extra }) as Field

export const image = (name: string, label: string, extra: Record<string, unknown> = {}): Field =>
  ({ name, label, type: 'upload', relationTo: 'media', ...extra }) as Field

export const checkbox = (name: string, label: string, defaultValue = false, extra: Record<string, unknown> = {}): Field =>
  ({ name, label, type: 'checkbox', defaultValue, ...extra }) as Field

export const number = (name: string, label: string, extra: Record<string, unknown> = {}): Field =>
  ({ name, label, type: 'number', ...extra }) as Field

/** URL slug: English letters, digits and dashes (Persian URLs turn into %D9%85... when shared). */
export const slugField = (description = 'نشانی صفحه به انگلیسی، مثلاً alanik یا butter-5kg'): Field => ({
  name: 'slug',
  label: 'نشانی (Slug)',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: { position: 'sidebar', description },
  validate: (value: unknown) => {
    if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return 'فقط حروف کوچک انگلیسی، عدد و خط تیره (مثال: pak-khah)'
    }
    return true
  },
})

export const orderField: Field = {
  name: 'order',
  label: 'ترتیب نمایش',
  type: 'number',
  defaultValue: 100,
  admin: { position: 'sidebar', description: 'عدد کوچک‌تر، زودتر نمایش داده می‌شود' },
}

/** A button / link with a label and a destination. */
export const linkGroup = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    { name: 'label', label: 'متن', type: 'text' },
    {
      name: 'href',
      label: 'نشانی',
      type: 'text',
      admin: { description: 'مثلاً /representation یا https://… یا tel:+98…' },
    },
  ],
})

/** The standard header block every inner page starts with. */
export const pageHeaderField: Field = {
  name: 'header',
  label: 'سربرگ صفحه',
  type: 'group',
  fields: [
    { name: 'eyebrow', label: 'عنوان کوچک بالای تیتر', type: 'text' },
    { name: 'title', label: 'تیتر اصلی', type: 'text', required: true },
    { name: 'intro', label: 'معرفی کوتاه', type: 'textarea' },
  ],
}

export const itemsField = (
  name: string,
  label: string,
  fields: Field[],
  extra: Record<string, unknown> = {},
): Field => ({ name, label, type: 'array', fields, ...extra }) as Field

/** Copy for a public form: heading, intro, button and the message shown after sending. */
export const formCopyField = (name = 'form', label = 'متن فرم'): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    { name: 'title', label: 'عنوان فرم', type: 'text' },
    { name: 'intro', label: 'توضیح بالای فرم', type: 'textarea' },
    { name: 'submitLabel', label: 'متن دکمه ارسال', type: 'text' },
    { name: 'successTitle', label: 'عنوان پیام موفقیت', type: 'text' },
    { name: 'successMessage', label: 'پیام موفقیت', type: 'textarea' },
    { name: 'privacyNote', label: 'یادداشت حریم خصوصی زیر فرم', type: 'textarea' },
  ],
})

/** Icons an editor can put next to a card or a list row (they match the site's own icon set). */
export const ICON_CHOICES = [
  { label: 'بدون آیکون (شماره نمایش داده می‌شود)', value: 'none' },
  { label: 'نشان (سابقه، افتخار)', value: 'award' },
  { label: 'کامیون (پخش و توزیع)', value: 'truck' },
  { label: 'سپر (کیفیت، اطمینان)', value: 'shield' },
  { label: 'هدست (پشتیبانی)', value: 'headset' },
  { label: 'افراد (نمایندگان، همکاران)', value: 'users' },
  { label: 'ساختمان (کسب‌وکار)', value: 'building' },
  { label: 'بسته (محصول)', value: 'box' },
  { label: 'لایه‌ها (تنوع)', value: 'layers' },
  { label: 'برگ (گیاهی)', value: 'leaf' },
  { label: 'قطره (شیر، روغن)', value: 'drop' },
  { label: 'نقشه (گستره)', value: 'map' },
  { label: 'قاشق و چنگال (رستوران)', value: 'utensils' },
  { label: 'گفت‌وگو', value: 'chat' },
  { label: 'تیک', value: 'check' },
] as const

export const iconField = (name = 'icon', label = 'آیکون'): Field => ({
  name,
  label,
  type: 'select',
  defaultValue: 'none',
  options: ICON_CHOICES.map((choice) => ({ ...choice })),
})

/** A titled block that is a short list of title + text cards. */
export const cardsField = (name: string, label: string): Field => ({
  name,
  label,
  type: 'array',
  fields: [
    { name: 'title', label: 'عنوان', type: 'text', required: true },
    { name: 'text', label: 'توضیح', type: 'textarea' },
    iconField(),
  ],
})

export const sectionHeadField = (name: string, label: string, extra: Field[] = []): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    { name: 'eyebrow', label: 'عنوان کوچک', type: 'text' },
    { name: 'title', label: 'تیتر', type: 'text' },
    { name: 'text', label: 'متن', type: 'textarea' },
    ...extra,
  ],
})
