import type { Field, GlobalConfig } from 'payload'
import { anyone, isStaff } from '../access'
import { checkbox, image, itemsField, linkGroup, number, text, textarea } from '../fields/helpers'
import { PERSIAN_MONTHS } from '../lib/holidays'
import { MOODS } from '../lib/moods'
import { SOUNDS } from '../lib/sound-names'
import { revalidateGlobalChange } from '../hooks/revalidate'

const persianMonth = (name: string, label: string): Field => ({
  name,
  label,
  type: 'select',
  required: true,
  options: PERSIAN_MONTHS.map((month, i) => ({ label: month, value: String(i + 1) })),
  admin: { width: '25%' },
})

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
            checkbox('needsCalculator', 'محاسبه‌گر نیاز (چند بسته لازم دارم؟) در صفحهٔ همکاری و صفحهٔ محصولات', true, {
              admin: { description: 'برای کرهٔ تک‌نفره: یک بسته برای هر بشقاب. برای کرهٔ فله‌ای فقط وقتی نمایش داده می‌شود که در صفحهٔ آن محصول «گرم کره برای هر بشقاب» پر شده باشد.' },
            }),
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
                checkbox('titleRise', 'تیترها کلمه‌به‌کلمه از پشت یک خط بالا می‌آیند', true),
                checkbox('wordLight', 'کلمه‌های متن معرفی با اسکرول روشن می‌شوند', true),
                checkbox('rollingNumbers', 'عددها مثل شمارنده می‌چرخند و روی عدد درست می‌ایستند', true),
                checkbox('showroom', 'محصولات صفحهٔ اصلی در یک ردیف افقی که با اسکرول از جلوی چشم می‌گذرد (فقط کامپیوتر)', true),
                checkbox('foilCards', 'درخشش ورق طلا روی کارت محصولات', true),
                checkbox('bento', 'دلایل اعتماد به شکل کاشی‌های زنده در اندازه‌های مختلف', true),
                checkbox('stickyChapters', 'صفحهٔ درباره ما: عنوان فصل‌ها کنار متن ثابت می‌ماند و با اسکرول عوض می‌شود', true),
                checkbox('kineticCta', 'جملهٔ پایانی بزرگ و روان که زیر ماوس طلایی می‌شود', true),
                checkbox('footerName', 'نام بزرگ نیکو اعتماد زیر صفحه (فوتر)', true),
                checkbox('sheetStack', 'بخش برندها مثل یک برگه روی بخش سفره می‌لغزد', true),
                checkbox('travellingButter', 'کرهٔ مسافر در صفحهٔ اصلی (جاهای توقف در صفحهٔ اصلی انتخاب می‌شوند)', true),
                checkbox('butterEverywhere', 'کرهٔ مسافر روی همهٔ بخش‌ها دیده شود (روی فیلم، ویترین محصولات و برگهٔ برندها هم)؛ اگر خاموش باشد، روی آن‌ها پنهان می‌شود', true),
                checkbox('nooshJan', 'بعد از ذوب کره روی برنج، «نوش جان» با طلا نوشته شود (متنش در صفحهٔ اصلی › سفره)', true),
                checkbox('goldCursor', 'نشانگر طلایی موس که روی کارت‌ها و دکمه‌ها بزرگ می‌شود (فقط کامپیوتر)', true),
                checkbox('moltenButtons', 'طلای مذاب که با رفتن موس روی دکمه‌ها در آن‌ها جاری می‌شود', true),
                checkbox('sectionMap', 'نقشهٔ کوچک بخش‌های صفحهٔ اصلی (کنار صفحه در کامپیوتر، دکمهٔ پایین صفحه در گوشی)', true),
                checkbox('stretchyTitles', 'تیترهای بزرگ با اسکرول تند کمی کش می‌آیند و نرم برمی‌گردند', true),
                checkbox('sound', 'دکمهٔ صدا', true),
                checkbox('soundOnAtStart', 'صدا از ابتدا روشن باشد', true, {
                  admin: {
                    description:
                      'مرورگرها اجازه نمی‌دهند سایت پیش از اولین کلیک، لمس یا فشردن کلید صدایی پخش کند؛ پس صدا با اولین کلیک یا لمس بازدیدکننده، آرام شروع می‌شود. بازدیدکننده هر وقت بخواهد با دکمهٔ صدا آن را خاموش می‌کند و انتخابش روی همان دستگاه به خاطر می‌ماند.',
                  },
                }),
                checkbox('music', 'موسیقی پس‌زمینه که با هر بخش عوض می‌شود', true, {
                  admin: {
                    description:
                      'هر بخش صفحه حال‌وهوای موسیقی خودش را دارد و وقتی بازدیدکننده به آن بخش می‌رسد، موسیقی آرام در هم می‌رود. موسیقی را خود مرورگر می‌سازد؛ برای هر بخش می‌توانید پایین‌تر آهنگ خودتان را بگذارید. با دکمهٔ صدا خاموش می‌شود.',
                  },
                }),
                checkbox('microSounds', 'صدای کوچک برای هر تعامل (لمس دکمه، باز شدن منو، موفقیت و …)', true),
                number('musicVolume', 'بلندی موسیقی (۰ تا ۱۰۰)', {
                  defaultValue: 60,
                  min: 0,
                  max: 100,
                  admin: { description: 'پیشنهاد: ۶۰. صفر یعنی بی‌صدا.' },
                }),
                number('sfxVolume', 'بلندی صداهای کوچک (۰ تا ۱۰۰)', {
                  defaultValue: 70,
                  min: 0,
                  max: 100,
                  admin: { description: 'پیشنهاد: ۷۰. صفر یعنی بی‌صدا.' },
                }),
              ],
            },
            {
              name: 'sounds',
              label: 'صداها (اختیاری)',
              type: 'group',
              admin: {
                description:
                  'فایل کوتاه mp3. هر صدایی که خالی بماند، نسخهٔ خود سایت پخش می‌شود (مزرعه و ریختن شیر صدای ضبط‌شدهٔ آزاد هستند؛ جلز و صداهای کوچک دیگر در خود مرورگر ساخته می‌شوند).',
              },
              fields: SOUNDS.map(({ id, label }) => ({ name: id, label, type: 'upload', relationTo: 'media' }) as Field),
            },
            {
              name: 'musicFiles',
              label: 'آهنگ هر بخش (اختیاری)',
              type: 'group',
              admin: {
                description:
                  'فایل mp3 که بی‌وقفه تکرار می‌شود. هر بخشی که خالی بماند، موسیقی ساختهٔ خود سایت پخش می‌شود. فایل‌های سنگین دیرتر بار می‌شوند؛ بهتر است هر آهنگ زیر چند مگابایت باشد.',
              },
              fields: MOODS.map(({ id, label }) => ({ name: id, label, type: 'upload', relationTo: 'media' }) as Field),
            },
          ],
        },
        {
          label: 'مناسبت‌ها',
          fields: [
            checkbox('holidaysEnabled', 'حال‌وهوای مناسبت‌ها (یلدا، نوروز و …)', true, {
              admin: {
                description:
                  'در روزهای هر مناسبت، یک تبریک کوتاه بالای صفحه نمایش داده می‌شود و دانه‌های انار یا گلبرگ شکوفه آرام از بالای صفحه می‌بارد.',
              },
            }),
            itemsField(
              'holidays',
              'مناسبت‌ها',
              [
                text('name', 'نام مناسبت (فقط برای شما)', { required: true }),
                text('greeting', 'متن تبریک', { required: true }),
                {
                  name: 'look',
                  label: 'حال‌وهوا',
                  type: 'select',
                  defaultValue: 'gold',
                  options: [
                    { label: 'یلدا: دانهٔ انار و نور سرخ', value: 'yalda' },
                    { label: 'نوروز: گلبرگ شکوفه و نور سبز', value: 'nowruz' },
                    { label: 'جشن: ذره‌های طلایی', value: 'gold' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    persianMonth('fromMonth', 'از ماه'),
                    number('fromDay', 'روز', { required: true, min: 1, max: 31, admin: { width: '25%' } }),
                    persianMonth('toMonth', 'تا ماه'),
                    number('toDay', 'روز', { required: true, min: 1, max: 31, admin: { width: '25%' } }),
                  ],
                },
                linkGroup('link', 'دکمهٔ کنار تبریک (اختیاری)'),
              ],
              {
                admin: {
                  description:
                    'تاریخ‌ها خورشیدی‌اند و هر سال خودکار تکرار می‌شوند (به وقت تهران). تا وقتی این فهرست خالی است، یلدا (۲۸ آذر تا ۱ دی) و نوروز (۲۵ اسفند تا ۱۳ فروردین) نمایش داده می‌شوند.',
                },
              },
            ),
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
