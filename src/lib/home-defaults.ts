/**
 * Starting content for the newer home page sections. The CMS always wins: these are shown only while
 * the matching CMS fields are still empty (for example on a site that was set up before these sections existed).
 */

/** The line under the melting butter, leading into the film. */
export const MELT_LINE = 'اما این طعم از کجا می‌آید؟'

/** The product every dish points to until the editor picks one per dish. */
export const TABLE_PRODUCT_SLUG = 'single-serve-form-seal'

export const TABLE_TEXTS = {
  eyebrow: 'سر سفره',
  title: 'هر غذا، کرهٔ خودش',
  text: 'روی هر غذا بزنید تا ببینید کدام کره کنارش می‌نشیند.',
  hint: 'روی هر غذا بزنید',
  pairLabel: 'کرهٔ مناسب این غذا',
}

/** The four dishes of the sample table picture (/home/sofreh-top.webp), placed in % of its width and height. */
export const TABLE_DISHES = [
  { name: 'چلوکباب کوبیده', x: 25.7, y: 24.4 },
  { name: 'جوجه‌کباب با چلو', x: 81.8, y: 26 },
  { name: 'ته‌دیگ', x: 28.3, y: 74.4 },
  { name: 'زرشک‌پلو', x: 75.8, y: 75 },
]

export const TABLE_IMAGE = {
  url: '/home/sofreh-top.webp',
  alt: 'سفرهٔ ایرانی از بالا: چلوکباب، جوجه‌کباب، ته‌دیگ و زرشک‌پلو',
  width: 1168,
  height: 880,
}

/** «فله‌ای یا تک‌نفره؟»: the pinned section where one big block of butter turns into single-serve pats. */
export const SIZES_TEXTS = {
  eyebrow: 'دو اندازه، برای دو نیاز',
  title: 'فله‌ای یا تک‌نفره؟',
  text: '',
  bulkLabel: 'فله‌ای',
  bulkText: 'بسته‌بندی‌های فله‌ای برای مراکز تهیهٔ غذا، کسب‌وکارهای غذایی و پخش‌کنندگان.',
  singleLabel: 'تک‌نفره',
  singleText: 'بسته‌های تک‌نفرهٔ فرم‌سیل برای رستوران‌ها، کترینگ‌ها، هتل‌ها و مراکز تهیهٔ غذا.',
}

/** «کسب‌وکار شما چیست؟»: the big list of markets, each showing the products made for it. */
export const FINDER_TEXTS = {
  eyebrow: 'مناسب برای',
  title: 'کسب‌وکار شما چیست؟',
  text: 'انتخاب کنید تا محصولات مناسب کار خود را ببینید.',
  emptyText: 'هنوز محصولی برای این بازار انتخاب نشده است. برای همکاری با ما تماس بگیرید.',
  cta: { label: 'همکاری با ما', href: '/partnership' },
}

/**
 * The four steps of the golden route, from packing to the kitchen. Steps 2 and 3 take their wording
 * from the two distribution cards in the CMS when those are filled in.
 */
export const ROUTE_STEPS = [
  { title: 'آماده در دو بسته‌بندی', text: 'تک‌نفرهٔ فرم‌سیل و فله‌ای.', short: 'بسته‌بندی', icon: 'boxes' },
  { title: 'تهران: پخش مستقیم', text: 'توزیع مستقیم محصولات در تهران از طریق شرکت طعمینو انجام می‌شود.', short: 'تهران · طعمینو', icon: 'truck' },
  { title: 'سایر استان‌ها: شبکهٔ نمایندگی', text: 'نمایندگان و پخش‌کنندگان منطقه‌ای، محصولات را در شهر و استان خود عرضه می‌کنند.', short: 'نمایندگان استان‌ها', icon: 'users' },
  { title: 'آشپزخانهٔ شما', text: 'رستوران‌ها، هتل‌ها، کترینگ‌ها و عمده‌فروشان.', short: 'آشپزخانه‌ها', icon: 'utensils' },
]

/** The giant word that fills the screen before «چرا نیکو اعتماد» and settles into its title. */
export const TRUST_BIG_WORD = 'اعتماد'

/** Where the travelling butter stops on the home page, in order. */
export const BUTTER_STOPS = ['hero', 'intro', 'sizes', 'finder', 'table'] as const
export type ButterStop = (typeof BUTTER_STOPS)[number]
