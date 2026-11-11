import type { CollectionConfig } from 'payload'
import path from 'path'
import { anyone, isStaff } from '../access'
import { revalidateCollectionChange, revalidateCollectionDelete } from '../hooks/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'تصویر یا ویدیو', plural: 'رسانه‌ها' },
  admin: { group: 'محتوا', useAsTitle: 'alt', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateCollectionChange], afterDelete: [revalidateCollectionDelete] },
  upload: {
    staticDir: path.resolve(process.cwd(), process.env.MEDIA_DIR || 'media'),
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 400, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'card', width: 960, formatOptions: { format: 'webp', options: { quality: 82 } } },
      { name: 'hero', width: 1920, formatOptions: { format: 'webp', options: { quality: 82 } } },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    {
      name: 'alt',
      label: 'متن جایگزین (Alt)',
      type: 'text',
      required: true,
      admin: { description: 'توضیح کوتاه تصویر برای نابینایان و گوگل' },
    },
    { name: 'caption', label: 'توضیح زیر تصویر', type: 'text' },
  ],
}
