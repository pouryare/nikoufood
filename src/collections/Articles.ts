import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '../access'
import { image, richText, slugField, text, textarea } from '../fields/helpers'
import { revalidateCollectionChange, revalidateCollectionDelete } from '../hooks/revalidate'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'مقاله / خبر', plural: 'مقالات و اخبار' },
  admin: { group: 'محتوا', useAsTitle: 'title', defaultColumns: ['title', 'publishedAt', '_status'] },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: { autosave: false } },
  hooks: { afterChange: [revalidateCollectionChange], afterDelete: [revalidateCollectionDelete] },
  defaultSort: '-publishedAt',
  fields: [
    text('title', 'عنوان', { required: true }),
    slugField(),
    {
      name: 'publishedAt',
      label: 'تاریخ انتشار',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
      hooks: {
        beforeChange: [({ value, siblingData }) => (!value && siblingData?._status === 'published' ? new Date().toISOString() : value)],
      },
    },
    image('coverImage', 'تصویر اصلی'),
    textarea('excerpt', 'خلاصه'),
    richText('content', 'متن'),
  ],
}
