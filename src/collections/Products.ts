import type { CollectionConfig } from 'payload'
import { isStaff, publishedOrStaff } from '../access'
import { checkbox, image, itemsField, orderField, richText, slugField, text, textarea } from '../fields/helpers'
import { revalidateCollectionChange, revalidateCollectionDelete } from '../hooks/revalidate'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'محصول', plural: 'محصولات' },
  admin: {
    group: 'محصولات',
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'category', 'fatType', '_status', 'updatedAt'],
  },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  versions: { drafts: { autosave: false } },
  hooks: { afterChange: [revalidateCollectionChange], afterDelete: [revalidateCollectionDelete] },
  defaultSort: 'order',
  fields: [
    text('name', 'نام محصول', { required: true }),
    slugField(),
    orderField,
    { name: 'brand', label: 'برند', type: 'relationship', relationTo: 'brands', required: true, admin: { position: 'sidebar' } },
    { name: 'category', label: 'دسته‌بندی', type: 'relationship', relationTo: 'product-categories', required: true, admin: { position: 'sidebar' } },
    { name: 'fatType', label: 'نوع (گیاهی / حیوانی / مخلوط)', type: 'relationship', relationTo: 'fat-types', admin: { position: 'sidebar' } },
    checkbox('featured', 'نمایش در صفحه اصلی', false, { admin: { position: 'sidebar' } }),
    textarea('shortDescription', 'توضیح کوتاه'),
    richText('description', 'توضیح کامل'),
    itemsField(
      'images',
      'تصاویر محصول',
      [image('image', 'تصویر', { required: true })],
      { admin: { description: 'تا زمانی که تصویر نگذارید، تصویر پیش‌فرض کره نمایش داده می‌شود.' } },
    ),
    itemsField(
      'variants',
      'وزن‌ها و بسته‌بندی‌ها',
      [
        text('label', 'عنوان', { required: true, admin: { description: 'مثلاً «تک‌نفره ۱۰ گرمی» یا «سطل ۵ کیلویی»' } }),
        { type: 'row', fields: [text('weight', 'وزن', { admin: { width: '50%' } }), text('packaging', 'نوع بسته‌بندی', { admin: { width: '50%' } })] },
      ],
      { admin: { description: 'هر محصول می‌تواند چند وزن یا بسته‌بندی داشته باشد.' } },
    ),
    itemsField('features', 'ویژگی‌ها', [text('text', 'ویژگی', { required: true })]),
    itemsField('specs', 'مشخصات فنی', [text('label', 'عنوان', { required: true }), text('value', 'مقدار', { required: true })]),
    itemsField('applications', 'کاربردها', [text('title', 'کاربرد', { required: true }), text('description', 'توضیح کوتاه')], {
      admin: { description: 'مثلاً: کباب، جوجه، پلو' },
    }),
    { name: 'markets', label: 'بازارهای هدف', type: 'relationship', relationTo: 'markets', hasMany: true },
  ],
}
