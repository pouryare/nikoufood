// Renders the stand-in pictures of unpackaged butter that product cards show until real product photos exist:
// a pile of single-serve pats and a bulk block (transparent background, same studio and material as the hero curl).
//   node tools/render/shapes.mjs [outDir] [size]
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { dataUrlToBuffer, openScene, root } from './browser.mjs'

const require = createRequire(import.meta.url)
const sharp = require('sharp')
const outDir = path.resolve(root, process.argv[2] || 'src/seed/assets/products')
const size = Number(process.argv[3] || 1400)

const { browser, page } = await openScene('tools/render/shapes-entry.ts', { width: size, height: size })
await fs.mkdir(outDir, { recursive: true })
for (const shape of ['pats', 'block']) {
  const png = dataUrlToBuffer(await page.evaluate(([s, px]) => window.renderShape(s, px), [shape, size]))
  const file = path.join(outDir, `butter-${shape}.webp`)
  // Trim the empty margin and centre the butter on a square with a small even border, so every stand-in fills its card the same way.
  const trimmed = await sharp(png).trim({ threshold: 2 }).toBuffer()
  const { width, height } = await sharp(trimmed).metadata()
  const side = Math.round(Math.max(width, height) * 1.1)
  const [padX, padY] = [side - width, side - height]
  // sharp always resizes before it extends, so the border is added in a first pass and the resize happens in a second.
  const padded = await sharp(trimmed)
    .extend({ left: Math.floor(padX / 2), right: Math.ceil(padX / 2), top: Math.floor(padY / 2), bottom: Math.ceil(padY / 2), background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
  await sharp(padded).resize(1000, 1000).webp({ quality: 88, alphaQuality: 92 }).toFile(file)
  console.log('wrote', path.relative(root, file))
}
await browser.close()
