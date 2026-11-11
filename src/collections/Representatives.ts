import type { CollectionConfig } from 'payload'
import { isStaff, staffOnlyField } from '../access'
import { checkbox, text, textarea } from '../fields/helpers'
import { revalidateCollectionChange, revalidateCollectionDelete } from '../hooks/revalidate'

/**
 * Approved representatives. Nothing here is public unless «نمایش عمومی» is ticked,
 * and even then only the public* fields are readable by visitors.
 */
export const Representatives: CollectionConfig = {
  slug: 'representatives',
  labels: { singular: 'نماینده', plural: 'نمایندگان' },
  admin: { group: 'شبکه توزیع', useAsTitle: 'fullName', defaultColumns: ['fullName', 'province', 'city', 'showPublicly'] },
  access: {
    read: ({ req: { user } }) => (user ? true : { showPublicly: { equals: true } }),
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: { afterChange: [revalidateCollectionChange], afterDelete: [revalidateCollectionDelete] },
  fields: [
    {
      ...text('fullName', 'نام نماینده / شرکت', { required: true }),
      access: { read: staffOnlyField },
    },
    { name: 'province', label: 'استان', type: 'relationship', relationTo: 'provinces', required: true },
    text('city', 'شهر'),
    { ...text('mobile', 'موبایل'), access: { read: staffOnlyField } },
    { ...textarea('internalNotes', 'یادداشت داخلی'), access: { read: staffOnlyField } },
    {
      name: 'application',
      label: 'درخواست اولیه',
      type: 'relationship',
      relationTo: 'leads',
      access: { read: staffOnlyField },
    },
    {
      type: 'collapsible',
      label: 'اطلاعات قابل نمایش در سایت',
      admin: { initCollapsed: false },
      fields: [
        checkbox('showPublicly', 'نمایش عمومی', false, {
          admin: { description: 'تا تأیید نماینده، فعال نکنید. فقط فیلدهای زیر نمایش داده می‌شوند.' },
        }),
        text('publicName', 'نام قابل نمایش'),
        text('publicPhone', 'تلفن قابل نمایش'),
        text('publicAddress', 'آدرس قابل نمایش'),
      ],
    },
  ],
}
