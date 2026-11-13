/**
 * The background music has one "mood" for each part of the page. Sections carry `data-mood="…"`, and the music
 * follows whichever one is in the middle of the screen. Neighbours that belong together share a mood, so the
 * music never changes every few seconds. In the CMS each mood can be given an uploaded song of its own.
 */
export const MOODS = [
  { id: 'hero', label: 'بالای صفحهٔ اصلی (ورودی)' },
  { id: 'melt', label: 'ذوب شدن کره' },
  { id: 'film', label: 'فیلم از مزرعه تا سفره' },
  { id: 'intro', label: 'معرفی (و صفحهٔ درباره ما)' },
  { id: 'sizes', label: 'بسته‌بندی و اندازه‌ها' },
  { id: 'products', label: 'محصولات' },
  { id: 'finder', label: 'پیدا کردن نزدیک‌ترین فروشگاه' },
  { id: 'kitchen', label: 'یک روز در آشپزخانه (و مقاله‌ها)' },
  { id: 'table', label: 'سفره' },
  { id: 'network', label: 'شبکهٔ پخش' },
  { id: 'trust', label: 'اعتماد، برندها، پرسش‌ها و پایان صفحه' },
] as const

export type Mood = (typeof MOODS)[number]['id']

export const isMood = (value: unknown): value is Mood => MOODS.some((m) => m.id === value)

/** The mood of a page while nothing on screen carries its own. */
export function moodOfPath(path: string): Mood {
  if (path === '/') return 'hero'
  if (path.startsWith('/about')) return 'intro'
  if (path.startsWith('/products')) return 'products'
  if (path.startsWith('/network')) return 'network'
  if (path.startsWith('/articles')) return 'kitchen'
  return 'trust'
}
