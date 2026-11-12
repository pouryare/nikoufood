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
