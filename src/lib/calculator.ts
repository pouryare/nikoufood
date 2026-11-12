import type { Product } from '@/payload-types'
import { related } from './cms'

/** Default heading of the needs calculator, used while its CMS fields (همکاری با ما › محاسبه‌گر نیاز) are empty. */
export const CALC_TEXTS = {
  eyebrow: 'محاسبه‌گر نیاز',
  title: 'چقدر کره لازم دارید؟',
  text: 'بگویید روزی چند بشقاب سرو می‌کنید تا ببینید در ماه چقدر کره لازم دارید.',
}

/** The calculator heading: the editor's own, or the default as a whole (never a mix of the two). */
export function calcHeading(saved: { eyebrow?: string | null; title?: string | null; text?: string | null } | null | undefined) {
  return saved && (saved.eyebrow || saved.title || saved.text) ? saved : CALC_TEXTS
}

/** A product the needs calculator can work out: single-serve packs per plate, or grams of bulk butter per plate. */
export type CalcProduct = {
  slug: string
  name: string
  brand?: string | null
  mode: 'packs' | 'weight'
  /** packs mode: packs per plate (one, unless the editor says otherwise). */
  perPlate: number
  /** weight mode: grams of butter per plate. */
  grams: number
  packsPerCarton?: number | null
  packageKg?: number | null
}

/**
 * Which products go into the calculator. Single-serve butter counts one pack per plate unless the CMS says
 * otherwise; bulk butter joins only once the editor has entered how many grams one plate takes, so the
 * calculator never guesses an amount.
 */
export function calcProduct(p: Product): CalcProduct | null {
  const calc = p.calculator ?? {}
  const single = related(p.category)?.slug === 'single-serve'
  const base = { slug: p.slug, name: p.name, brand: related(p.brand)?.name, packsPerCarton: calc.packsPerCarton, packageKg: calc.packageKg }
  if (single || (calc.perPlate ?? 0) > 0) return { ...base, mode: 'packs', perPlate: calc.perPlate || 1, grams: 0 }
  if ((calc.gramsPerPlate ?? 0) > 0) return { ...base, mode: 'weight', perPlate: 0, grams: calc.gramsPerPlate! }
  return null
}

export const calcProducts = (products: Product[]) => products.map(calcProduct).filter((p): p is CalcProduct => p !== null)
