import path from 'path'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import * as c from './content'
import { PROVINCES } from './provinces'

/**
 * Fills a fresh database with starter content so the site is not empty.
 * Safe to run on every deploy: it does nothing when provinces already exist (unless SEED_FORCE=1).
 */
async function main() {
  const payload = await getPayload({ config })
  const existing = await payload.count({ collection: 'provinces' })
  if (existing.totalDocs > 0 && process.env.SEED_FORCE !== '1') {
    payload.logger.info('Seed skipped: the database already has content (set SEED_FORCE=1 to overwrite).')
    process.exit(0)
  }

  payload.logger.info('Seeding starter content…')

  /* logos */
  const upload = async (file: string, alt: string, focal?: readonly number[]) => {
    const existingMedia = await payload.find({ collection: 'media', where: { filename: { equals: path.basename(file) } }, limit: 1 })
    if (existingMedia.docs[0]) return existingMedia.docs[0].id
    const data = focal?.length === 2 ? { alt, focalX: focal[0], focalY: focal[1] } : { alt }
    const doc = await payload.create({ collection: 'media', data, filePath: path.resolve(process.cwd(), file) })
    return doc.id
  }
  const logoMark = await upload('public/brand/nikou-mark.png', 'نماد لوگوی نیکو اعتماد')
  // The butter still doubles as the picture of every product until real product photos are uploaded.
  const defaultProductImage = await upload('public/brand/butter-curl.webp', 'کرهٔ طلایی بدون بسته‌بندی')

  /* simple upsert by slug */
  const upsert = async (collection: 'brands' | 'product-categories' | 'fat-types' | 'markets' | 'products' | 'provinces', slug: string, data: Record<string, unknown>) => {
    const found = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    const withStatus = collection === 'brands' || collection === 'products' ? { ...data, _status: 'published' } : data
    if (found.docs[0]) {
      return payload.update({ collection, id: found.docs[0].id, data: withStatus as never })
    }
    return payload.create({ collection, data: withStatus as never })
  }

  const idBySlug: Record<string, number> = {}
  // Each product group has a stand-in picture of unpackaged butter for products that have no photo yet.
  for (const { picture, ...row } of c.categories) {
    const image = picture ? await upload(`src/seed/assets/products/${picture.file}`, picture.alt) : undefined
    idBySlug[`product-categories:${row.slug}`] = (await upsert('product-categories', row.slug, { ...row, image })).id as number
  }
  for (const [collection, rows] of [
    ['fat-types', c.fatTypes],
    ['markets', c.markets],
  ] as const) {
    for (const row of rows) idBySlug[`${collection}:${row.slug}`] = (await upsert(collection, row.slug, row)).id as number
  }

  for (const b of c.brands) idBySlug[`brands:${b.slug}`] = (await upsert('brands', b.slug, { ...b, featured: true })).id as number

  for (const p of PROVINCES) {
    await upsert('provinces', p.slug, { ...p, coverage: p.slug === 'tehran' ? 'direct' : 'open', publicNote: p.slug === 'tehran' ? 'پخش مستقیم از طریق طعمینو' : '' })
  }

  for (const p of c.products) {
    await upsert('products', p.slug, {
      name: p.name,
      slug: p.slug,
      order: p.order,
      featured: p.featured,
      shortDescription: p.shortDescription,
      brand: idBySlug[`brands:${p.brand}`],
      category: idBySlug[`product-categories:${p.category}`],
      fatType: p.fatType ? idBySlug[`fat-types:${p.fatType}`] : undefined,
      variants: p.variants,
      applications: p.applications,
      markets: p.markets.map((m) => idBySlug[`markets:${m}`]),
    })
  }

  /* globals */
  await payload.updateGlobal({ slug: 'site-settings', data: { ...c.siteSettings, logoMark, defaultProductImage } })
  await payload.updateGlobal({ slug: 'navigation', data: c.navigation })

  // Film scenes name their starter pictures by file; the CMS stores the uploaded media ids.
  type SeedPicture = { file: string; alt: string; focal?: readonly number[] }
  type SeedSide = { picture?: SeedPicture; pictureMobile?: SeedPicture } & Record<string, unknown>
  const filmSide = async (side?: SeedSide) => {
    if (!side) return undefined
    const { picture, pictureMobile, ...rest } = side
    const put = (pic?: SeedPicture) => (pic ? upload(`src/seed/assets/film/${pic.file}`, pic.alt, pic.focal) : undefined)
    return { ...rest, image: await put(picture), imageMobile: await put(pictureMobile) }
  }
  const scenes = []
  for (const scene of c.homePage.film.scenes as Array<{ single?: SeedSide; plant?: SeedSide; animal?: SeedSide } & Record<string, unknown>>) {
    scenes.push({ ...scene, single: await filmSide(scene.single), plant: await filmSide(scene.plant), animal: await filmSide(scene.animal) })
  }
  await payload.updateGlobal({ slug: 'home-page', data: { ...c.homePage, film: { ...c.homePage.film, scenes } } as never })
  await payload.updateGlobal({ slug: 'about-page', data: c.aboutPage as never })
  await payload.updateGlobal({ slug: 'network-page', data: c.networkPage as never })
  await payload.updateGlobal({ slug: 'representation-page', data: c.representationPage as never })
  await payload.updateGlobal({ slug: 'partnership-page', data: c.partnershipPage as never })
  await payload.updateGlobal({ slug: 'contact-page', data: c.contactPage as never })
  await payload.updateGlobal({ slug: 'listing-pages', data: c.listingPages as never })

  await maybeCreateDevAdmin(payload)
  payload.logger.info('Seed finished.')
  process.exit(0)
}

/** Optional: SEED_ADMIN_EMAIL + SEED_ADMIN_PASSWORD create the first admin account without using the browser. */
async function maybeCreateDevAdmin(payload: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) return
  const users = await payload.count({ collection: 'users' })
  if (users.totalDocs > 0) return
  await payload.create({ collection: 'users', data: { email, password, name: 'مدیر', role: 'admin' } })
  payload.logger.info(`Admin account created: ${email}`)
}

// Top-level await: `payload run` exits as soon as the module finishes loading.
try {
  await main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
