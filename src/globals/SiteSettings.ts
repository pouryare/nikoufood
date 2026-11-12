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
            checkbox('useUploadedLogo', 'نمایش تصویر آپلودشده به‌جای نماد متحرک داخلی', false, {
              admin: { description: 'به‌صورت پیش‌فرض، نماد N به‌صورت برداری و با انیمیشن «رسم شدن» نمایش داده می‌شود. اگر لوگو تغییر کرد، این گزینه را فعال کنید.' },
            }),
            image('logoWordmark', 'لوگوی متنی (NIKOU | Trading & Manufacturing)', {
              admin: { description: 'فایل SVG باید «outline» شده باشد (بدون وابستگی به فونت). اگر خالی باشد، متن با فونت جایگزین نمایش داده می‌شود.' },
            }),
            text('latinTagline', 'زیرنویس لاتین لوگو', { defaultValue: 'Trading & Manufacturing' }),
            image('defaultProductImage', 'تصویر پیش‌فرض محصول (کره بدون بسته‌بندی)', {
              admin: { description: 'تا زمانی که محصولی تصویر اختصاصی ندارد، این تصویر به‌همراه نام برند نمایش داده می‌شود.' },
            }),
            image('defaultShareImage', 'تصویر پیش‌فرض اشتراک‌گذاری (۱۲۰۰×۶۳۰)', {
              admin: { description: 'وقتی نشانی سایت در پیام‌رسان‌ها یا شبکه‌های اجتماعی فرستاده می‌شود، این تصویر نمایش داده می‌شود.' },
            }),
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
            {
              name: 'effects',
              label: 'جلوه‌های ویژه',
              type: 'group',
              admin: { description: 'برای کسانی که در تنظیمات دستگاهشان «کاهش حرکت» را روشن کرده‌اند، جلوه‌های متحرک خودکار خاموش می‌شوند.' },
              fields: [
                checkbox('lamp', 'نور گرمی که دنبال ماوس می‌آید (چراغ)', true),
                checkbox('pattern', 'نقش ایرانی کم‌رنگ زیر نور چراغ', true),
                checkbox('grain', 'دانهٔ ریز فیلم روی صفحه', true),
                checkbox('pourTitles', 'پر شدن تیترهای کلیدی با کرهٔ آب‌شده', true),
                checkbox('goldenThread', 'رشتهٔ طلایی در صفحهٔ اصلی', true),
                checkbox('pageTransition', 'جاری شدن طلا هنگام رفتن به صفحهٔ دیگر', true),
                checkbox('magneticButtons', 'دکمه‌هایی که کمی به سمت ماوس می‌آیند', true),
                checkbox('smoothScroll', 'اسکرول نرم با چرخ ماوس', true),
                checkbox('sound', 'دکمهٔ صدا', true),
                checkbox('soundOnAtStart', 'صدا از ابتدا روشن باشد', true, {
                  admin: {
                    description:
                      'مرورگرها اجازه نمی‌دهند سایت پیش از اولین کلیک، لمس یا فشردن کلید صدایی پخش کند؛ پس صدا با اولین کلیک یا لمس بازدیدکننده، آرام شروع می‌شود. بازدیدکننده هر وقت بخواهد با دکمهٔ صدا آن را خاموش می‌کند و انتخابش روی همان دستگاه به خاطر می‌ماند.',
                  },
                }),
              ],
            },
            {
              name: 'sounds',
              label: 'صداها (اختیاری)',
              type: 'group',
              admin: {
                description:
                  'فایل کوتاه mp3. هر صدایی که خالی بماند، نسخهٔ خود سایت پخش می‌شود (مزرعه و ریختن شیر صدای ضبط‌شدهٔ آزاد هستند؛ جلز و کلیک در خود مرورگر ساخته می‌شوند).',
              },
              fields: [
                { name: 'sizzle', label: 'جلز کره روی برنج داغ', type: 'upload', relationTo: 'media' },
                { name: 'farm', label: 'مزرعه (باد و پرنده‌ها، قابل تکرار)', type: 'upload', relationTo: 'media' },
                { name: 'milk', label: 'ریختن شیر', type: 'upload', relationTo: 'media' },
                { name: 'click', label: 'کلیک دکمه‌ها', type: 'upload', relationTo: 'media' },
              ],
            },
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
