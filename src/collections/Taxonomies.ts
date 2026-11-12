import type { CollectionConfig, Field } from 'payload'
import { anyone, isStaff } from '../access'
import { iconField, image, orderField, slugField, text, textarea } from '../fields/helpers'
import { revalidateCollectionChange, revalidateCollectionDelete } from '../hooks/revalidate'

const taxonomy = (slug: string, singular: string, plural: string, extra: Field[] = [], group = 'محصولات'): CollectionConfig => ({
  slug,
  labels: { singular, plural },
  admin: { group, useAsTitle: 'name', defaultColumns: ['name', 'slug', 'order'] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  hooks: { afterChange: [revalidateCollectionChange], afterDelete: [revalidateCollectionDelete] },
  defaultSort: 'order',
  fields: [text('name', 'نام', { required: true }), slugField(), orderField, textarea('description', 'توضیح کوتاه'), ...extra],
})

/** e.g. «تک‌نفره»، «فله‌ای» — new product groups can be added at any time. */
export const ProductCategories = taxonomy('product-categories', 'دسته‌بندی محصول', 'دسته‌بندی‌های محصول', [
  image('image', 'تصویر پیش‌فرض محصولات این دسته', {
    admin: { description: 'محصولی که تصویر اختصاصی ندارد، این تصویر را نشان می‌دهد. اگر این هم خالی باشد، تصویر پیش‌فرض سایت (در تنظیمات) نمایش داده می‌شود.' },
  }),
  iconField('icon', 'آیکون (کنار نام دسته روی کارت محصول)'),
])

/** e.g. «گیاهی»، «حیوانی»، «مخلوط». */
export const FatTypes = taxonomy('fat-types', 'نوع چربی', 'انواع چربی', [iconField('icon', 'آیکون (کنار نوع چربی روی کارت محصول)')])

/** Target industries: restaurants, hotels, catering… */
export const Markets = taxonomy('markets', 'بازار هدف', 'بازارهای هدف', [iconField('icon', 'آیکون (در فهرست «کسب‌وکار شما چیست؟» و کاشی‌ها)')])
