import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff, nobody, staffOnlyField } from '../access'
import { text, textarea } from '../fields/helpers'

export const LEAD_STATUS = [
  { label: 'جدید', value: 'new' },
  { label: 'تماس گرفته شد', value: 'contacted' },
  { label: 'در حال بررسی', value: 'reviewing' },
  { label: 'تأیید شد', value: 'approved' },
  { label: 'رد شد', value: 'rejected' },
] as const

export const LEAD_TYPES = [
  { label: 'درخواست نمایندگی', value: 'representative' },
  { label: 'درخواست همکاری', value: 'partnership' },
  { label: 'پیام تماس', value: 'contact' },
] as const

/**
 * One inbox for every form on the site. Visitors cannot read or write it through the API:
 * forms go through server actions that validate everything on the server first.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'درخواست', plural: 'درخواست‌ها' },
  admin: {
    group: 'درخواست‌ها',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'type', 'mobile', 'province', 'status', 'createdAt'],
    listSearchableFields: ['fullName', 'mobile', 'company', 'city'],
  },
  access: { create: nobody, read: isStaff, update: isStaff, delete: isAdmin },
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    { name: 'type', label: 'نوع', type: 'select', required: true, options: [...LEAD_TYPES], index: true, admin: { position: 'sidebar' } },
    {
      name: 'status',
      label: 'وضعیت',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [...LEAD_STATUS],
      index: true,
      admin: { position: 'sidebar' },
    },
    text('fullName', 'نام و نام خانوادگی', { required: true }),
    text('mobile', 'موبایل', { required: true, index: true }),
    text('phone', 'تلفن ثابت'),
    { name: 'province', label: 'استان', type: 'relationship', relationTo: 'provinces' },
    text('city', 'شهر'),
    text('company', 'نام شرکت / کسب‌وکار'),
    text('businessType', 'نوع کسب‌وکار'),
    text('email', 'ایمیل'),
    textarea('message', 'پیام'),
    textarea('adminNotes', 'یادداشت داخلی'),
    { ...text('sourcePage', 'صفحه ثبت‌کننده'), admin: { readOnly: true, position: 'sidebar' } },
    { ...text('ipHash', 'شناسه ناشناس بازدیدکننده'), access: { read: staffOnlyField }, admin: { readOnly: true, position: 'sidebar' } },
  ],
}
