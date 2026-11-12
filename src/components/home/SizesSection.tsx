import { getCategories } from '@/lib/cms'
import { SIZES_TEXTS } from '@/lib/home-defaults'
import type { HomePage } from '@/payload-types'
import { SizesPin } from './SizesPin'

type Props = { sizes: NonNullable<HomePage['sizes']>; butterStop?: boolean }

/** «فله‌ای یا تک‌نفره؟». Empty CMS fields fall back to the starter wording and the product groups' own descriptions. */
export async function SizesSection({ sizes, butterStop }: Props) {
  if (sizes.enabled === false) return null
  const categories = await getCategories()
  const describe = (slug: string) => categories.find((c) => c.slug === slug)?.description
  const empty = !sizes.eyebrow && !sizes.title && !sizes.text
  const bulk = {
    label: sizes.bulkLabel || SIZES_TEXTS.bulkLabel,
    text: sizes.bulkText || describe('bulk') || SIZES_TEXTS.bulkText,
  }
  const single = {
    label: sizes.singleLabel || SIZES_TEXTS.singleLabel,
    text: sizes.singleText || describe('single-serve') || SIZES_TEXTS.singleText,
  }
  return (
    <SizesPin
      eyebrow={empty ? SIZES_TEXTS.eyebrow : sizes.eyebrow}
      title={empty ? SIZES_TEXTS.title : sizes.title}
      text={empty ? SIZES_TEXTS.text : sizes.text}
      bulk={bulk}
      single={single}
      butterStop={butterStop}
      pictureLabel="یک قالب بزرگ کره که برش می‌خورد و به بسته‌های کوچک تک‌نفره تبدیل می‌شود"
    />
  )
}
