// No imports on purpose: the CMS settings file reads this, and it must not pull in the site code.

/** Every sound the page can ask for, with its name in the CMS. The first four are the long-standing ones. */
export const SOUNDS = [
  { id: 'sizzle', label: 'جلز کره روی برنج داغ' },
  { id: 'farm', label: 'مزرعه (باد و پرنده‌ها، قابل تکرار)' },
  { id: 'milk', label: 'ریختن شیر' },
  { id: 'click', label: 'لمس دکمه‌ها و پیوندها' },
  { id: 'hover', label: 'رفتن ماوس روی دکمه‌ها' },
  { id: 'tick', label: 'کشیدن لغزنده یا تیک زدن' },
  { id: 'pop', label: 'پیام یا مرحلهٔ تازه (چت، مراحل بسته‌بندی)' },
  { id: 'open', label: 'باز شدن منو یا صفحهٔ بازی' },
  { id: 'close', label: 'بسته شدن منو یا صفحهٔ بازی' },
  { id: 'success', label: 'موفقیت (تمام شدن بازی، کندن در فویل، تبریک)' },
  { id: 'whoosh', label: 'رفتن به صفحهٔ دیگر' },
  { id: 'scrape', label: 'کشیدن کره روی برنج' },
  { id: 'peel', label: 'کندن در فویل' },
] as const

export type SoundName = (typeof SOUNDS)[number]['id']
/** The small interaction sounds: they follow the "small sounds" switch, the rest follow the sound button only. */
export const MICRO_SOUNDS: readonly SoundName[] = ['click', 'hover', 'tick', 'pop', 'open', 'close', 'success', 'whoosh', 'scrape', 'peel']
