import type { GlobalConfig } from 'payload'
import { anyone, isStaff } from '../access'
import {
  cardsField,
  checkbox,
  formCopyField,
  image,
  itemsField,
  linkGroup,
  pageHeaderField,
  sectionHeadField,
  text,
  textarea,
} from '../fields/helpers'
import { revalidateGlobalChange } from '../hooks/revalidate'

const page = (slug: string, label: string, fields: GlobalConfig['fields']): GlobalConfig => ({
  slug,
  label,
  admin: { group: 'صفحه‌ها' },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobalChange] },
  fields,
})

export const HomePage = page('home-page', 'صفحه اصلی', [
  {
    name: 'hero',
    label: 'بخش اول (Hero)',
    type: 'group',
    fields: [
      text('eyebrow', 'عنوان کوچک'),
      {
        type: 'row',
        fields: [
          text('wordTop', 'کلمه بالا', { admin: { width: '33%' } }),
          text('wordMiddle', 'کلمه وسط', { admin: { width: '33%' } }),
          text('wordBottom', 'کلمه پایین', { admin: { width: '33%' } }),
        ],
      },
      textarea('subtitle', 'متن زیر تیتر'),
      linkGroup('primaryCta', 'دکمه اصلی'),
      linkGroup('secondaryCta', 'دکمه دوم'),
      image('image', 'تصویر کره (PNG/WebP بدون پس‌زمینه)', {
        admin: { description: 'اگر خالی باشد، یک کره سه‌بعدی نمونه نمایش داده می‌شود. با آپلود تصویر واقعی، جایگزین می‌شود.' },
      }),
    ],
  },
  {
    name: 'film',
    label: 'فیلم اسکرولی (کره روی برنج)',
    type: 'group',
    fields: [
      checkbox('enabled', 'نمایش داده شود', true),
      text('title', 'عنوان بخش'),
      textarea('intro', 'متن کوتاه'),
      {
        name: 'video',
        label: 'ویدیو',
        type: 'upload',
        relationTo: 'media',
        admin: {
          description:
            'ویدیوی mp4 یا webm (افقی ۱۶:۹، حدود ۶ تا ۱۲ ثانیه، بدون صدا). پس از ذخیره، سرور خودکار آن را به فریم تبدیل می‌کند تا با اسکرول روان پخش شود.',
        },
      },
      {
        name: 'videoMobile',
        label: 'ویدیوی عمودی برای موبایل (اختیاری)',
        type: 'upload',
        relationTo: 'media',
        admin: { description: 'نسخهٔ عمودی (۹:۱۶) همان ویدیو. اگر خالی باشد، وسط ویدیوی اصلی در موبایل نمایش داده می‌شود.' },
      },
      image('poster', 'تصویر پیش‌نمایش ویدیو'),
      itemsField('chapters', 'فصل‌های داستان', [
        text('kicker', 'عنوان کوچک', { required: true }),
        text('title', 'عنوان', { required: true }),
        textarea('text', 'متن'),
      ]),
    ],
  },
  sectionHeadField('intro', 'معرفی شرکت', [
    itemsField('highlights', 'نکات برجسته (فقط اعداد واقعی)', [
      text('value', 'مقدار', { required: true }),
      text('label', 'عنوان', { required: true }),
    ]),
    linkGroup('cta', 'لینک'),
  ]),
  sectionHeadField('products', 'بخش محصولات', [text('ctaLabel', 'متن دکمه')]),
  sectionHeadField('brands', 'بخش برندها'),
  sectionHeadField('distribution', 'بخش شبکه توزیع', [
    text('tehranTitle', 'عنوان کارت تهران'),
    textarea('tehranText', 'متن کارت تهران'),
    text('provincesTitle', 'عنوان کارت شهرستان‌ها'),
    textarea('provincesText', 'متن کارت شهرستان‌ها'),
  ]),
  sectionHeadField('map', 'نقشه ایران', [text('ctaLabel', 'متن دکمه')]),
  sectionHeadField('trust', 'اعتمادسازی', [
    itemsField('items', 'موارد', [text('title', 'عنوان', { required: true }), textarea('text', 'توضیح')]),
  ]),
  {
    name: 'finalCta',
    label: 'دعوت به اقدام پایانی',
    type: 'group',
    fields: [text('title', 'تیتر'), textarea('text', 'متن'), linkGroup('primary', 'دکمه اول'), linkGroup('secondary', 'دکمه دوم'), linkGroup('tertiary', 'دکمه سوم')],
  },
])

export const AboutPage = page('about-page', 'درباره ما', [
  pageHeaderField,
  itemsField('chapters', 'فصل‌های داستان', [
    text('kicker', 'عنوان کوچک'),
    text('title', 'عنوان', { required: true }),
    textarea('text', 'متن'),
    image('image', 'تصویر'),
  ]),
  itemsField('milestones', 'مسیر شرکت (فقط رویدادهای واقعی)', [
    text('year', 'سال', { required: true }),
    text('title', 'عنوان', { required: true }),
    textarea('text', 'توضیح'),
  ]),
  { name: 'vision', label: 'چشم‌انداز', type: 'group', fields: [text('title', 'تیتر'), textarea('text', 'متن')] },
  cardsField('values', 'ارزش‌ها'),
  { name: 'cta', label: 'دعوت به اقدام', type: 'group', fields: [text('title', 'تیتر'), textarea('text', 'متن'), linkGroup('primary', 'دکمه')] },
])

export const NetworkPage = page('network-page', 'شبکه توزیع و نمایندگی', [
  pageHeaderField,
  {
    name: 'tehran',
    label: 'تهران: پخش مستقیم',
    type: 'group',
    fields: [
      text('title', 'عنوان'),
      textarea('text', 'متن'),
      text('partnerName', 'نام شرکت پخش', { defaultValue: 'طعمینو' }),
      image('partnerLogo', 'لوگوی شرکت پخش'),
      text('partnerUrl', 'نشانی وب‌سایت'),
    ],
  },
  { name: 'provinces', label: 'سایر استان‌ها', type: 'group', fields: [text('title', 'عنوان'), textarea('text', 'متن')] },
  sectionHeadField('map', 'نقشه'),
  itemsField('legend', 'راهنمای نقشه', [text('status', 'وضعیت (direct / covered / open / soon)', { required: true }), text('label', 'متن راهنما', { required: true })]),
  cardsField('steps', 'مراحل همکاری به‌عنوان نماینده'),
  itemsField('faq', 'پرسش‌های پرتکرار', [text('question', 'پرسش', { required: true }), textarea('answer', 'پاسخ', { required: true })]),
  { name: 'cta', label: 'دعوت به اقدام', type: 'group', fields: [text('title', 'تیتر'), textarea('text', 'متن'), text('label', 'متن دکمه')] },
])

export const PartnershipPage = page('partnership-page', 'همکاری با ما', [
  pageHeaderField,
  cardsField('audiences', 'مخاطبان همکاری'),
  cardsField('benefits', 'مزایای همکاری'),
  itemsField('businessTypes', 'گزینه‌های نوع کسب‌وکار در فرم', [text('label', 'عنوان', { required: true })]),
  formCopyField(),
])

export const RepresentationPage = page('representation-page', 'جذب نمایندگی', [
  pageHeaderField,
  cardsField('requirements', 'شرایط نمایندگی'),
  cardsField('process', 'مراحل بررسی درخواست'),
  formCopyField(),
])

export const ContactPage = page('contact-page', 'تماس با ما', [pageHeaderField, formCopyField()])

export const ListingPages = page('listing-pages', 'سربرگ صفحه‌های فهرست', [
  { name: 'products', label: 'صفحه محصولات', type: 'group', fields: [pageHeaderField] },
  { name: 'brands', label: 'صفحه برندها', type: 'group', fields: [pageHeaderField] },
  { name: 'articles', label: 'صفحه مقالات', type: 'group', fields: [pageHeaderField] },
  {
    name: 'productCta',
    label: 'دعوت به اقدام پایین صفحه محصول',
    type: 'group',
    fields: [text('title', 'تیتر'), textarea('text', 'متن'), linkGroup('primary', 'دکمه اول'), linkGroup('secondary', 'دکمه دوم')],
  },
])
