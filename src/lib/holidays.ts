/**
 * Holiday mode: on the days of an occasion (Yalda, Nowruz, …) the site shows a short greeting and a soft
 * fall of pomegranate seeds, blossom petals or gold dust. Dates are in the Persian calendar, so they repeat
 * every year without anyone editing them.
 */

export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const

export type HolidayLook = 'yalda' | 'nowruz' | 'gold'

export type Holiday = {
  name: string
  greeting: string
  look: HolidayLook
  fromMonth: number
  fromDay: number
  toMonth: number
  toDay: number
  link?: { label?: string | null; href?: string | null } | null
}

/** Shown while the CMS list is empty. Yalda night is the night of 30 Azar; Nowruz holidays end on 13 Farvardin. */
export const DEFAULT_HOLIDAYS: Holiday[] = [
  { name: 'یلدا', greeting: 'شب یلدا مبارک؛ بلندترین شب سال، گرم و شیرین کنار هم.', look: 'yalda', fromMonth: 9, fromDay: 28, toMonth: 10, toDay: 1 },
  { name: 'نوروز', greeting: 'نوروزتان پیروز؛ سالی پربرکت برای سفره‌هایتان.', look: 'nowruz', fromMonth: 12, fromDay: 25, toMonth: 1, toDay: 13 },
]

type SavedHoliday = {
  name?: string | null
  greeting?: string | null
  look?: string | null
  fromMonth?: string | number | null
  fromDay?: number | null
  toMonth?: string | number | null
  toDay?: number | null
  link?: { label?: string | null; href?: string | null } | null
}

const LOOKS: HolidayLook[] = ['yalda', 'nowruz', 'gold']

/** Today's month and day in the Persian calendar, in Tehran. */
export function persianToday(now = new Date()): { month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { timeZone: 'Asia/Tehran', month: 'numeric', day: 'numeric' }).formatToParts(now)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return { month: get('month'), day: get('day') }
}

/** The occasion running today, if any. A range may wrap past the end of the year (Esfand to Farvardin). */
export function activeHoliday(saved: SavedHoliday[] | null | undefined, now = new Date()): Holiday | null {
  const list: Holiday[] = (saved ?? [])
    .filter((h) => h.greeting && h.fromMonth && h.fromDay && h.toMonth && h.toDay)
    .map((h) => ({
      name: h.name ?? '',
      greeting: h.greeting!,
      look: LOOKS.includes(h.look as HolidayLook) ? (h.look as HolidayLook) : 'gold',
      fromMonth: Number(h.fromMonth),
      fromDay: h.fromDay!,
      toMonth: Number(h.toMonth),
      toDay: h.toDay!,
      link: h.link,
    }))
  const occasions = saved?.length ? list : DEFAULT_HOLIDAYS
  const { month, day } = persianToday(now)
  const today = month * 100 + day
  return (
    occasions.find((h) => {
      const from = h.fromMonth * 100 + h.fromDay
      const to = h.toMonth * 100 + h.toDay
      return from <= to ? today >= from && today <= to : today >= from || today <= to
    }) ?? null
  )
}
