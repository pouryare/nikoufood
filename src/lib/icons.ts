import { iconName, type IconName } from '../components/ui/Icon'

/**
 * Icons for the markets that the site started with, used until the editor picks one in the CMS
 * (بازارهای هدف › آیکون). Any market without either gets the plain building.
 */
export const MARKET_ICONS: Record<string, IconName> = {
  restaurants: 'utensils',
  catering: 'cloche',
  hotels: 'bed',
  'food-centers': 'pot',
  'food-businesses': 'store',
  'chain-stores': 'cart',
  wholesalers: 'boxes',
}

/** Icons for the product groups and fat types the site started with, until the editor picks one in the CMS. */
export const TAXONOMY_ICONS: Record<string, IconName> = {
  'single-serve': 'grid',
  bulk: 'boxes',
  plant: 'leaf',
  animal: 'drop',
  blend: 'layers',
}

/** The icon saved in the CMS for a market, product group or fat type, else the starter one for its slug. */
export function taxonomyIcon(
  doc: { slug?: string | null; icon?: string | null } | null | undefined,
  fallback: Record<string, IconName> = TAXONOMY_ICONS,
): IconName | null {
  if (!doc) return null
  const chosen = iconName(doc.icon)
  if (chosen) return chosen
  return (doc.slug && fallback[doc.slug]) || null
}

/** The icon that suits a link, judged by where it goes; used on buttons and footer links. */
export function iconForHref(href?: string | null): IconName | null {
  if (!href) return null
  if (href.startsWith('tel:')) return 'phone'
  if (href.startsWith('mailto:')) return 'mail'
  const path = href.replace(/^https?:\/\/[^/]+/, '')
  const rules: [RegExp, IconName][] = [
    [/^\/representation/, 'handshake'],
    [/^\/partnership/, 'building'],
    [/^\/contact/, 'chat'],
    [/^\/products/, 'box'],
    [/^\/brands/, 'award'],
    [/^\/network/, 'map'],
    [/^\/about/, 'sparkle'],
    [/^\/articles/, 'layers'],
  ]
  return rules.find(([re]) => re.test(path))?.[1] ?? null
}

/** Picks the first number in a sentence and the word after it, e.g. «حدود ۱۵ سال تجربه» → ۱۵ and «سال». */
export function leadingFigure(text?: string | null): { value: string; unit: string } | null {
  const m = (text ?? '').match(/([0-9۰-۹]+(?:[.,٫][0-9۰-۹]+)?)\s*([^\s،.]+)?/)
  return m ? { value: m[1], unit: m[2] ?? '' } : null
}
