import type { CollectionConfig } from 'payload'
import path from 'path'
import { anyone, isAdmin } from '../access'
import { revalidateCollectionChange, revalidateCollectionDelete } from '../hooks/revalidate'

/** Optional font overrides: upload a woff2 file here and pick it in «پوسته» to replace the bundled font. */
export const Fonts: CollectionConfig = {
  slug: 'fonts',
  labels: { singular: 'فایل فونت', plural: 'فونت‌ها' },
  admin: { group: 'سیستم', useAsTitle: 'family' },
  access: { read: anyone, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: { afterChange: [revalidateCollectionChange], afterDelete: [revalidateCollectionDelete] },
  upload: {
    staticDir: path.resolve(process.cwd(), process.env.FONTS_DIR || 'media/fonts'),
    mimeTypes: ['font/woff2', 'font/woff', 'application/font-woff2', 'application/font-woff', 'application/octet-stream'],
  },
  fields: [
    { name: 'family', label: 'نام فونت', type: 'text', required: true },
    {
      name: 'weight',
      label: 'وزن',
      type: 'text',
      defaultValue: '400',
      admin: { description: 'مثلاً 400 یا 700. برای فونت متغیر: 100 900' },
    },
  ],
}
