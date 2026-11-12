import type { ProductCardTag } from '@/components/products/ProductCard'
import { related, type Product } from '@/lib/cms'
import { taxonomyIcon } from '@/lib/icons'

/** The two small tags on a product card (its group and its fat type), each with its icon. */
export function productTags(product: Product): ProductCardTag[] {
  const category = related(product.category) as {
    name?: string
    slug?: string
    icon?: string | null
  } | null
  const fat = related(product.fatType) as {
    name?: string
    slug?: string
    icon?: string | null
  } | null
  return [category, fat]
    .filter((t): t is { name: string; slug?: string; icon?: string | null } => Boolean(t?.name))
    .map((t) => ({ label: t.name, icon: taxonomyIcon(t) }))
}
