import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '../access'
import { checkbox, image, orderField, richText, slugField, text, textarea } from '../fields/helpers'
import { revalidateCollectionChange, revalidateCollectionDelete } from '../hooks/revalidate'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'برند', plural: 'برندها' },
  admin: { group: 'محصولات', useAsTitle: 'name', defaultColumns: ['name', 'slug', '_status', 'updatedAt'] },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: { autosave: false } },
  hooks: { afterChange: [revalidateCollectionChange], afterDelete: [revalidateCollectionDelete] },
  defaultSort: 'order',
  fields: [
    text('name', 'نام برند', { required: true }),
    slugField(),
    orderField,
    text('tagline', 'شعار کوتاه برند'),
    textarea('description', 'توضیح کوتاه'),
    richText('story', 'داستان و توضیح کامل برند'),
    image('logo', 'لوگو'),
    image('heroImage', 'تصویر شاخص برند'),
    {
      type: 'row',
      fields: [
        text('brandColor', 'رنگ اصلی برند', { admin: { description: 'کد رنگ مثل #C8963E (اختیاری)', width: '50%' } }),
        checkbox('featured', 'نمایش در صفحه اصلی', true, { admin: { width: '50%' } }),
      ],
    },
  ],
}
