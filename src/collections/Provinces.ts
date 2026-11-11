import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isStaff } from '../access'
import { slugField, text, number } from '../fields/helpers'
import { revalidateCollectionChange, revalidateCollectionDelete } from '../hooks/revalidate'

export const COVERAGE_OPTIONS = [
  { label: 'پخش مستقیم', value: 'direct' },
  { label: 'تحت پوشش نماینده', value: 'covered' },
  { label: 'پذیرش درخواست نمایندگی', value: 'open' },
  { label: 'به‌زودی', value: 'soon' },
] as const

/** The 31 provinces. Their coverage status drives the network map. */
export const Provinces: CollectionConfig = {
  slug: 'provinces',
  labels: { singular: 'استان', plural: 'استان‌ها و پوشش' },
  admin: { group: 'شبکه توزیع', useAsTitle: 'name', defaultColumns: ['name', 'coverage', 'publicNote'] },
  access: { read: anyone, create: isAdmin, update: isStaff, delete: isAdmin },
  hooks: { afterChange: [revalidateCollectionChange], afterDelete: [revalidateCollectionDelete] },
  defaultSort: 'name',
  fields: [
    text('name', 'نام استان', { required: true }),
    slugField('نشانی انگلیسی استان (تغییر ندهید)'),
    {
      name: 'coverage',
      label: 'وضعیت پوشش',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [...COVERAGE_OPTIONS],
      admin: { position: 'sidebar', description: 'این وضعیت روی نقشه ایران نمایش داده می‌شود.' },
    },
    text('publicNote', 'توضیح عمومی', { admin: { description: 'مثلاً «به‌زودی» یا «نماینده فعال». بدون نام و شماره افراد.' } }),
    {
      type: 'row',
      fields: [
        number('lat', 'عرض جغرافیایی', { admin: { width: '50%' } }),
        number('lng', 'طول جغرافیایی', { admin: { width: '50%' } }),
      ],
    },
  ],
}
