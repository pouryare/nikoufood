import { ButterRiceToy } from '@/components/fun/ButterRiceToy'
import { SectionHeading } from '@/components/ui/SectionHeading'
import {
  getProduct,
  getSiteSettings,
  getUi,
  mediaOf,
  productPicture,
  related,
  type Product,
} from '@/lib/cms'
import { NOOSH_JAN, TABLE_DISHES, TABLE_IMAGE, TABLE_PRODUCT_SLUG, TABLE_TEXTS } from '@/lib/home-defaults'
import type { HomePage } from '@/payload-types'
import { NooshJan } from './NooshJan'
import { SofrehTable, type SofrehDish } from './SofrehTable'

type Props = { table: NonNullable<HomePage['table']>; butterStop?: boolean; nooshJan?: boolean }

/** «سفرهٔ ایرانی»: the dishes people love, each with the butter that suits it. Everything here comes from the CMS. */
export async function TableSection({ table, butterStop, nooshJan }: Props) {
  if (table.enabled === false) return null
  const [settings, ui] = await Promise.all([getSiteSettings(), getUi()])

  const toProduct = (product: Product | null): SofrehDish['product'] =>
    product
      ? { name: product.name, slug: product.slug, image: productPicture(product, settings).media }
      : null

  let dishes: SofrehDish[] = (table.dishes ?? [])
    .filter((d) => d.name && typeof d.x === 'number' && typeof d.y === 'number')
    .map((d) => ({
      name: d.name,
      x: d.x as number,
      y: d.y as number,
      note: d.note,
      product: toProduct(related(d.product)),
    }))
  // A site set up before this section existed shows the sample table until the editor fills it in.
  const ownImage = mediaOf(table.image)
  if (dishes.length === 0 && !ownImage) {
    const product = toProduct(await getProduct(TABLE_PRODUCT_SLUG))
    dishes = TABLE_DISHES.map((d) => ({ ...d, product }))
  }
  if (dishes.length === 0) return null

  const empty = !table.eyebrow && !table.title && !table.text
  return (
    <section className="section-y">
      <div className="wrap">
        <SectionHeading
          eyebrow={empty ? TABLE_TEXTS.eyebrow : table.eyebrow}
          title={empty ? TABLE_TEXTS.title : table.title}
          text={empty ? TABLE_TEXTS.text : table.text}
        />
        <div data-reveal className="mt-12">
          <SofrehTable
            image={ownImage ?? TABLE_IMAGE}
            dishes={dishes}
            hint={table.hint || (empty ? TABLE_TEXTS.hint : null)}
            pairLabel={table.pairLabel || TABLE_TEXTS.pairLabel}
            viewLabel={ui.products.view}
            butterDish={butterStop ? Math.min(dishes.length, Math.max(1, table.butterDish ?? 1)) - 1 : null}
            overlay={nooshJan ? <NooshJan text={table.nooshJan || NOOSH_JAN} /> : null}
          />
        </div>
        {table.toy?.enabled !== false ? (
          <div data-reveal className="mt-10">
            <ButterRiceToy
              title={table.toy?.title || ui.toys.riceTitle}
              hint={table.toy?.hint || ui.toys.riceHint}
              doneText={table.toy?.doneText || ui.toys.riceDone}
              progressLabel={ui.toys.riceProgress}
              againLabel={ui.toys.again}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
