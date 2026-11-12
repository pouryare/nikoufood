import type { GlobalConfig } from 'payload'
import { anyone, isStaff } from '../access'
import {
  cardsField,
  checkbox,
  formCopyField,
  iconField,
  image,
  itemsField,
  linkGroup,
  number,
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


/** One picture area of a film scene: its text, picture(s), optional video and a gold drawing used until media exists. */
function filmSideFields(): GlobalConfig['fields'] {
  return [
    text('title', 'عنوان'),
    textarea('text', 'متن'),
    image('image', 'تصویر (افقی برای تک‌تصویر، عمودی/مربعی برای دو‌نیمه)'),
    image('imageMobile', 'تصویر عمودی برای موبایل (اختیاری)'),
    {
      name: 'video',
      label: 'ویدیو (اختیاری)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'ویدیوی کوتاه mp4 یا webm بدون صدا؛ با اسکرول جلو و عقب می‌رود.' },
    },
    {
      name: 'videoMobile',
      label: 'ویدیوی عمودی برای موبایل (اختیاری)',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'اگر خالی باشد، در موبایل وسطِ همان ویدیوی بالا نمایش داده می‌شود.' },
    },
    {
      name: 'art',
      label: 'طرح خطی جایگزین',
      type: 'select',
      defaultValue: 'none',
      admin: { description: 'تا وقتی تصویر یا ویدیو نیست، این طرح طلایی نمایش داده می‌شود.' },
      options: [
        { label: 'بدون طرح', value: 'none' },
        { label: 'مزرعه و گاو', value: 'farm' },
        { label: 'دانه (آفتابگردان)', value: 'seed' },
        { label: 'شیر', value: 'milk' },
        { label: 'روغن', value: 'oil' },
        { label: 'خامه', value: 'cream' },
        { label: 'کره', value: 'butter' },
        { label: 'سفره', value: 'table' },
      ],
    },
  ] as GlobalConfig['fields']
}

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
    name: 'melt',
    label: 'ذوب شدن کره روی برنج (بعد از بخش اول)',
    type: 'group',
    admin: {
      description:
        'کرهٔ بخش اول روی برنج داغ می‌افتد و آب می‌شود؛ ویدیو با اسکرول جلو و عقب می‌رود. این بخش فقط وقتی نمایش داده می‌شود که ویدیو آپلود شده باشد.',
    },
    fields: [
      checkbox('enabled', 'نمایش داده شود', true),
      { name: 'video', label: 'ویدیوی افقی (۱۶:۹)', type: 'upload', relationTo: 'media' },
      { name: 'videoMobile', label: 'ویدیوی عمودی برای موبایل (۹:۱۶)', type: 'upload', relationTo: 'media' },
      text('line', 'جمله‌ای که در پایان ظاهر می‌شود'),
    ],
  },
  {
    name: 'film',
    label: 'فیلم اسکرولی (از مزرعه تا سفره)',
    type: 'group',
    admin: {
      description:
        'یک فیلم با چند صحنه که با اسکرول جلو می‌رود. جایی که مراحل تولید کرهٔ گیاهی و حیوانی یکی است، صحنه «تک‌تصویر» است؛ جایی که فرق دارند، «دو‌نیمه» است (گیاهی سمت راست، حیوانی سمت چپ؛ در موبایل بالا و پایین).',
    },
    fields: [
      checkbox('enabled', 'نمایش داده شود', true),
      text('eyebrow', 'عنوان کوچک'),
      text('title', 'عنوان بخش'),
      textarea('intro', 'متن کوتاه'),
      {
        type: 'row',
        fields: [
          text('plantLabel', 'برچسب سمت گیاهی', { admin: { width: '50%' } }),
          text('animalLabel', 'برچسب سمت حیوانی', { admin: { width: '50%' } }),
        ],
      },
      {
        name: 'video',
        label: 'ویدیوی کامل فیلم (اختیاری)',
        type: 'upload',
        relationTo: 'media',
        admin: { description: 'اگر یک ویدیوی آماده (حتی با تقسیم صفحه در خود ویدیو) آپلود شود، همین ویدیو با اسکرول جلو و عقب می‌رود و متن صحنه‌ها روی آن می‌نشیند.' },
      },
      {
        name: 'videoMobile',
        label: 'ویدیوی عمودی برای موبایل (اختیاری)',
        type: 'upload',
        relationTo: 'media',
      },
      itemsField(
        'scenes',
        'صحنه‌ها',
        [
          {
            name: 'layout',
            label: 'نوع صحنه',
            type: 'select',
            defaultValue: 'single',
            required: true,
            options: [
              { label: 'تک‌تصویر (مرحلهٔ مشترک)', value: 'single' },
              { label: 'دو‌نیمه (گیاهی | حیوانی)', value: 'split' },
            ],
          },
          text('kicker', 'عنوان کوتاه صحنه (در نوار پیشرفت)', { required: true }),
          {
            name: 'sound',
            label: 'صدای صحنه (وقتی بازدیدکننده صدا را روشن کرده باشد)',
            type: 'select',
            defaultValue: 'none',
            options: [
              { label: 'بی‌صدا', value: 'none' },
              { label: 'مزرعه (باد و پرنده‌ها)', value: 'farm' },
              { label: 'ریختن شیر', value: 'milk' },
              { label: 'جلز کره روی برنج داغ', value: 'sizzle' },
            ],
            admin: { description: 'فایل صداها در «تنظیمات سایت ← امکانات ← صداها» گذاشته می‌شود.' },
          },
          { name: 'single', label: 'تک‌تصویر', type: 'group', admin: { condition: (_d: unknown, sibling: { layout?: string }) => sibling?.layout !== 'split' }, fields: filmSideFields() },
          { name: 'plant', label: 'سمت گیاهی', type: 'group', admin: { condition: (_d: unknown, sibling: { layout?: string }) => sibling?.layout === 'split' }, fields: filmSideFields() },
          { name: 'animal', label: 'سمت حیوانی', type: 'group', admin: { condition: (_d: unknown, sibling: { layout?: string }) => sibling?.layout === 'split' }, fields: filmSideFields() },
        ],
        { admin: { initCollapsed: true } },
      ),
    ],
  },
  sectionHeadField('intro', 'معرفی شرکت', [
    itemsField('highlights', 'نکات برجسته (فقط اعداد واقعی)', [
      text('value', 'مقدار', { required: true }),
      text('label', 'عنوان', { required: true }),
    ]),
    linkGroup('cta', 'لینک'),
  ]),
  sectionHeadField('sizes', 'فله‌ای یا تک‌نفره (بخش ثابتی که قالب بزرگ کره به بسته‌های کوچک تبدیل می‌شود)', [
    checkbox('enabled', 'نمایش داده شود', true),
    text('bulkLabel', 'نام اندازهٔ بزرگ (مثلاً «فله‌ای»)'),
    textarea('bulkText', 'توضیح اندازهٔ بزرگ'),
    text('singleLabel', 'نام اندازهٔ کوچک (مثلاً «تک‌نفره»)'),
    textarea('singleText', 'توضیح اندازهٔ کوچک'),
  ]),
  sectionHeadField('products', 'بخش محصولات', [
    text('ctaLabel', 'متن دکمه'),
    checkbox('showMarkets', 'نمایش نوار متحرک «مناسب برای» (از فهرست بازارهای هدف)', true),
  ]),
  sectionHeadField('finder', 'کسب‌وکار شما چیست؟ (فهرست بزرگ بازارها و محصولات مناسب هر کدام)', [
    checkbox('enabled', 'نمایش داده شود', true),
    textarea('emptyText', 'متن وقتی برای یک بازار محصولی انتخاب نشده'),
    linkGroup('cta', 'دکمه'),
  ]),
  sectionHeadField('table', 'سفرهٔ ایرانی (هر غذا و کرهٔ مناسبش)', [
    checkbox('enabled', 'نمایش داده شود', true),
    image('image', 'تصویر سفره از بالا', {
      admin: { description: 'اگر خالی باشد، تصویر نمونهٔ خود سایت نمایش داده می‌شود.' },
    }),
    text('hint', 'راهنمای کوتاه (مثلاً «روی هر غذا بزنید»)'),
    text('pairLabel', 'عنوان کارت کره (مثلاً «کرهٔ مناسب این غذا»)'),
    number('butterDish', 'کرهٔ مسافر روی کدام غذا فرود بیاید (شمارهٔ غذا در فهرست، از ۱)', { min: 1, admin: { description: 'اگر خالی باشد، روی غذای اول.' } }),
    itemsField(
      'dishes',
      'غذاها',
      [
        text('name', 'نام غذا', { required: true }),
        {
          type: 'row',
          fields: [
            number('x', 'جای افقی روی تصویر (٪ از چپ)', { required: true, min: 0, max: 100, admin: { width: '50%' } }),
            number('y', 'جای عمودی روی تصویر (٪ از بالا)', { required: true, min: 0, max: 100, admin: { width: '50%' } }),
          ],
        },
        { name: 'product', label: 'کرهٔ مناسب این غذا', type: 'relationship', relationTo: 'products' },
        text('note', 'توضیح کوتاه (اختیاری)'),
      ],
      { admin: { description: 'اگر خالی باشد، چهار غذای تصویر نمونه نمایش داده می‌شوند.' } },
    ),
  ]),
  sectionHeadField('brands', 'بخش برندها'),
  sectionHeadField('distribution', 'بخش شبکه توزیع', [
    text('tehranTitle', 'عنوان کارت تهران'),
    textarea('tehranText', 'متن کارت تهران'),
    text('provincesTitle', 'عنوان کارت شهرستان‌ها'),
    textarea('provincesText', 'متن کارت شهرستان‌ها'),
    checkbox('routeEnabled', 'به جای دو کارت، مسیر طلایی مرحله‌به‌مرحله نمایش داده شود', true),
    itemsField(
      'steps',
      'مراحل مسیر (از بسته‌بندی تا آشپزخانه)',
      [
        text('title', 'عنوان', { required: true }),
        textarea('text', 'توضیح'),
        text('short', 'نام کوتاه روی تصویر مسیر (مثلاً «تهران · طعمینو»)'),
        iconField(),
      ],
      { maxRows: 4, admin: { description: 'چهار مرحله: بسته‌بندی، مرکز پخش، استان‌ها، آشپزخانه‌ها. اگر خالی باشد، چهار مرحلهٔ پیش‌فرض نمایش داده می‌شوند.' } },
    ),
  ]),
  sectionHeadField('map', 'نقشه ایران', [text('ctaLabel', 'متن دکمه')]),
  sectionHeadField('trust', 'اعتمادسازی', [
    text('bigWord', 'کلمهٔ بزرگی که پیش از این بخش صفحه را پر می‌کند و در تیتر جا می‌گیرد (مثلاً «اعتماد»)', {
      admin: { description: 'بهتر است این کلمه در خود تیتر هم باشد. خالی بگذارید تا این جلوه نمایش داده نشود.' },
    }),
    itemsField('items', 'موارد', [text('title', 'عنوان', { required: true }), textarea('text', 'توضیح'), iconField()]),
  ]),
  {
    name: 'butter',
    label: 'کرهٔ مسافر (یک تکه کره که با اسکرول از بخشی به بخش دیگر می‌رود)',
    type: 'group',
    admin: { description: 'روشن و خاموش کردن کلی آن در تنظیمات سایت › جلوه‌های ویژه است.' },
    fields: [
      {
        name: 'stops',
        label: 'جاهای توقف',
        type: 'select',
        hasMany: true,
        defaultValue: ['hero', 'intro', 'sizes', 'finder', 'table'],
        options: [
          { label: 'روی کلمهٔ طلایی بخش اول', value: 'hero' },
          { label: 'کنار متن معرفی', value: 'intro' },
          { label: 'کنار قالب بزرگ (فله‌ای یا تک‌نفره)', value: 'sizes' },
          { label: 'کنار تیتر «کسب‌وکار شما چیست؟»', value: 'finder' },
          { label: 'روی برنج سفره (آنجا ذوب می‌شود)', value: 'table' },
        ],
      },
    ],
  },
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
  text('stepsTitle', 'عنوان بخش مراحل'),
  cardsField('steps', 'مراحل همکاری به‌عنوان نماینده'),
  text('faqTitle', 'عنوان بخش پرسش‌های پرتکرار'),
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
