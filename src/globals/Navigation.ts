import type { GlobalConfig } from 'payload'
import { anyone, isStaff } from '../access'
import { itemsField, linkGroup, text } from '../fields/helpers'
import { revalidateGlobalChange } from '../hooks/revalidate'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'منوها',
  admin: { group: 'تنظیمات' },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobalChange] },
  fields: [
    itemsField('header', 'منوی بالای سایت', [text('label', 'عنوان', { required: true }), text('href', 'نشانی', { required: true })], {
      admin: { description: 'لینک «مقالات» تا زمانی که مقاله‌ای منتشر نشده باشد خودکار پنهان می‌ماند.' },
    }),
    linkGroup('headerCta', 'دکمه اصلی منو'),
    itemsField('footerColumns', 'ستون‌های فوتر', [
      text('title', 'عنوان ستون', { required: true }),
      itemsField('links', 'لینک‌ها', [text('label', 'عنوان', { required: true }), text('href', 'نشانی', { required: true })]),
    ]),
  ],
}
