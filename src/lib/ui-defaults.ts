/**
 * Every small piece of interface text (button labels, form labels, empty states…).
 * These are only the defaults: each one is editable in the admin panel under
 * «تنظیمات ← متن‌های رابط کاربری», and the site always reads the CMS value first.
 */
export const UI_DEFAULTS = {
  common: {
    home: 'خانه',
    skipToContent: 'رفتن به محتوای اصلی',
    menu: 'منو',
    close: 'بستن',
    all: 'همه',
    viewAll: 'مشاهدهٔ همه',
    learnMore: 'بیشتر بدانید',
    scrollHint: 'برای دیدن داستان، اسکرول کنید',
    comingSoon: 'به‌زودی',
  },
  products: {
    view: 'مشاهدهٔ محصول',
    brand: 'برند',
    category: 'دسته‌بندی',
    type: 'نوع',
    weight: 'وزن',
    packaging: 'بسته‌بندی',
    variants: 'وزن‌ها و بسته‌بندی‌ها',
    features: 'ویژگی‌ها',
    specs: 'مشخصات',
    applications: 'کاربردها',
    markets: 'مناسب برای',
    related: 'محصولات دیگر',
    empty: 'محصولی با این مشخصات پیدا نشد.',
    clearFilters: 'حذف فیلترها',
    imageSoon: 'تصویر محصول به‌زودی',
    brandProducts: 'محصولات این برند',
    viewBrand: 'آشنایی با برند',
    filtersLabel: 'فیلتر محصولات',
    countLabel: 'محصول',
  },
  network: {
    direct: 'پخش مستقیم',
    covered: 'تحت پوشش نماینده',
    open: 'پذیرش درخواست نمایندگی',
    soon: 'به‌زودی',
    selectProvince: 'یک استان را انتخاب کنید',
    applyForProvince: 'درخواست نمایندگی در این استان',
    provinceList: 'فهرست استان‌ها',
    representatives: 'نمایندگان این استان',
    hub: 'مرکز پخش',
    mapHint: 'برای دیدن وضعیت هر استان، روی آن بروید یا لمس کنید.',
    mapLabel: 'نقشهٔ پوشش استان‌های ایران',
    directBy: 'پخش مستقیم توسط',
    sisterCompany: 'شرکت هم‌گروه نیکو اعتماد',
    visitWebsite: 'مشاهدهٔ وب‌سایت',
  },
  forms: {
    fullName: 'نام و نام خانوادگی',
    mobile: 'شماره موبایل',
    phone: 'شماره تلفن ثابت',
    province: 'استان',
    provincePlaceholder: 'انتخاب استان',
    company: 'نام شرکت یا کسب‌وکار',
    businessType: 'نوع کسب‌وکار',
    businessTypePlaceholder: 'انتخاب کنید',
    email: 'ایمیل',
    message: 'پیام',
    optional: 'اختیاری',
    sending: 'در حال ارسال…',
    sendAnother: 'ثبت درخواست دیگر',
    fixErrors: 'لطفاً موارد مشخص‌شده را اصلاح کنید.',
  },
  contact: {
    phone: 'تلفن',
    whatsapp: 'واتساپ',
    telegram: 'تلگرام',
    bale: 'بله',
    eitaa: 'ایتا',
    instagram: 'اینستاگرام',
    email: 'ایمیل',
    address: 'نشانی',
    hours: 'ساعت کاری',
    messengers: 'پیام‌رسان‌ها',
    dockLabel: 'راه‌های ارتباطی',
    showOnMap: 'نمایش روی نقشه',
    headOffice: 'دفتر مرکزی',
  },
  articles: {
    readMore: 'ادامهٔ مطلب',
    empty: 'هنوز مطلبی منتشر نشده است.',
    backToList: 'بازگشت به مقالات',
  },
  errors: {
    notFoundTitle: 'صفحه پیدا نشد',
    notFoundText: 'صفحه‌ای که دنبالش بودید وجود ندارد یا جابه‌جا شده است.',
    backHome: 'بازگشت به صفحهٔ اصلی',
    errorTitle: 'مشکلی پیش آمد',
    errorText: 'لطفاً چند لحظهٔ دیگر دوباره تلاش کنید.',
    retry: 'تلاش دوباره',
  },
} as const

type Widen<T> = { -readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> }
export type UiTexts = Widen<typeof UI_DEFAULTS>

export const UI_GROUP_LABELS: Record<keyof typeof UI_DEFAULTS, string> = {
  common: 'عمومی',
  products: 'محصولات',
  network: 'شبکهٔ توزیع و نقشه',
  forms: 'فرم‌ها',
  contact: 'تماس و پیام‌رسان‌ها',
  articles: 'مقالات',
  errors: 'خطاها',
}

/** CMS values win; anything left empty falls back to the default above. */
export function mergeUi(saved: unknown): UiTexts {
  const out = JSON.parse(JSON.stringify(UI_DEFAULTS)) as Record<string, Record<string, string>>
  const src = (saved ?? {}) as Record<string, Record<string, unknown> | undefined>
  for (const group of Object.keys(out)) {
    for (const key of Object.keys(out[group])) {
      const value = src[group]?.[key]
      if (typeof value === 'string' && value.trim()) out[group][key] = value
    }
  }
  return out as unknown as UiTexts
}
