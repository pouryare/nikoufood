import type { CollectionConfig } from 'payload'
import { anyone, isStaff } from '../access'
import { orderField, slugField, text, textarea } from '../fields/helpers'
import { revalidateCollectionChange, revalidateCollectionDelete } from '../hooks/revalidate'

const taxonomy = (slug: string, singular: string, plural: string, group = 'محصولات'): CollectionConfig => ({
  slug,
  labels: { singular, plural },
  admin: { group, useAsTitle: 'name', defaultColumns: ['name', 'slug', 'order'] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateCollectionChange], afterDelete: [revalidateCollectionDelete] },
  defaultSort: 'order',
  fields: [text('name', 'نام', { required: true }), slugField(), orderField, textarea('description', 'توضیح کوتاه')],
})

/** e.g. «تک‌نفره»، «فله‌ای» — new product groups can be added at any time. */
export const ProductCategories = taxonomy('product-categories', 'دسته‌بندی محصول', 'دسته‌بندی‌های محصول')

/** e.g. «گیاهی»، «حیوانی»، «مخلوط». */
export const FatTypes = taxonomy('fat-types', 'نوع چربی', 'انواع چربی')

/** Target industries: restaurants, hotels, catering… */
export const Markets = taxonomy('markets', 'بازار هدف', 'بازارهای هدف')
