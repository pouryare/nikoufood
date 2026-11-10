import type { GlobalConfig } from 'payload'
import { anyone, isStaff } from '../access'
import { checkbox, image, itemsField, number, text, textarea } from '../fields/helpers'
import { revalidateGlobalChange } from '../hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'تنظیمات سایت',
  admin: { group: 'تنظیمات' },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobalChange] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'برند',
          fields: [
            text('brandName', 'نام برند', { required: true, defaultValue: 'نیکو اعتماد' }),
            text('brandNameLatin', 'نام لاتین', { defaultValue: 'NIKOU' }),
            text('legalName', 'نام رسمی حقوقی', { defaultValue: 'شرکت نیکو اعتماد پارس پیام' }),
            text('tagline', 'شعار کوتاه'),
            textarea('description', 'توضیح کوتاه شرکت (برای گوگل و فوتر)'),
            image('logoMark', 'نماد لوگو (N)', { admin: { description: 'PNG یا SVG با پس‌زمینه شفاف' } }),
            image('logoWordmark', 'لوگوی متنی (NIKOU | Trading & Manufacturing)'),
            {
              type: 'row',
              fields: [
                number('yearsOfExperience', 'سال‌های سابقه', { defaultValue: 15, admin: { width: '50%' } }),
                text('rebrandYear', 'سال ری‌برند', { defaultValue: '۱۴۰۴', admin: { width: '50%' } }),
              ],
            },
          ],
        },
        {
          label: 'تماس',
          fields: [
            {
              type: 'row',
              fields: [
                text('phone', 'شماره تماس', { admin: { width: '50%', description: 'مثلاً 02100000000' } }),
                text('whatsappNumber', 'شماره واتساپ', { admin: { width: '50%', description: 'با کد کشور، مثلاً 989120000000' } }),
              ],
            },
            text('email', 'ایمیل'),
            textarea('address', 'نشانی دفتر مرکزی'),
            text('workingHours', 'ساعت کاری'),
            {
              type: 'row',
              fields: [
                number('mapLat', 'عرض جغرافیایی دفتر', { admin: { width: '50%' } }),
                number('mapLng', 'طول جغرافیایی دفتر', { admin: { width: '50%' } }),
              ],
            },
          ],
        },
        {
          label: 'پیام‌رسان‌ها',
          fields: [
            text('telegramUrl', 'تلگرام', { admin: { description: 'نشانی کامل، مثل https://t.me/username' } }),
            text('baleUrl', 'بله', { admin: { description: 'مثل https://ble.ir/username' } }),
            text('eitaaUrl', 'ایتا', { admin: { description: 'مثل https://eitaa.com/username' } }),
            text('instagramUrl', 'اینستاگرام (اختیاری)'),
          ],
        },
        {
          label: 'اطلاع‌رسانی',
          fields: [
            text('notifyEmails', 'ایمیل دریافت درخواست‌ها', {
              admin: { description: 'با ویرگول جدا کنید. هر درخواست جدید به این نشانی‌ها ایمیل می‌شود.' },
            }),
            text('notifyFrom', 'ایمیل فرستنده', { admin: { description: 'اگر خالی باشد از تنظیمات سرور (SMTP_FROM) استفاده می‌شود.' } }),
          ],
        },
        {
          label: 'امکانات',
          fields: [
            {
              name: 'articlesVisibility',
              label: 'بخش مقالات و اخبار',
              type: 'select',
              defaultValue: 'auto',
              options: [
                { label: 'خودکار: بعد از انتشار اولین مقاله نمایش داده شود', value: 'auto' },
                { label: 'همیشه نمایش داده شود', value: 'show' },
                { label: 'مخفی', value: 'hide' },
              ],
            },
            checkbox('enable3D', 'فعال بودن صحنه‌های سه‌بعدی', true, { admin: { description: 'در گوشی‌های ضعیف و برای کاربرانی که انیمیشن را خاموش کرده‌اند، خودکار تصویر ساده نمایش داده می‌شود.' } }),
            checkbox('showWhatsappButton', 'دکمه شناور واتساپ', true),
          ],
        },
        {
          label: 'فوتر',
          fields: [
            textarea('footerText', 'متن فوتر'),
            text('copyright', 'متن کپی‌رایت'),
            itemsField('trustBadges', 'نمادهای اعتماد (اینماد و …)', [
              image('image', 'تصویر نماد', { required: true }),
              text('label', 'عنوان'),
              text('href', 'پیوند'),
            ]),
          ],
        },
      ],
    },
  ],
}
