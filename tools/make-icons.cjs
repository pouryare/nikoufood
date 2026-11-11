// Builds the fallback icons and share image from public/brand/nikou-mark.png (used until the CMS has its own).
//   node tools/make-icons.cjs
const sharp = require('sharp')
const path = require('node:path')
const dir = path.join(__dirname, '..', 'public', 'brand')
const BG = { r: 6, g: 10, b: 20, alpha: 1 }
const mark = path.join(dir, 'nikou-mark.png')
const onNavy = async (size, markSize, out, fmt = 'png') => {
  const m = await sharp(mark).resize(markSize, markSize, { fit: 'inside' }).toBuffer()
  let img = sharp({ create: { width: size.w, height: size.h, channels: 4, background: BG } }).composite([{ input: m, gravity: 'centre' }])
  img = fmt === 'jpg' ? img.jpeg({ quality: 88 }) : img.png()
  await img.toFile(path.join(dir, out))
}
;(async () => {
  await onNavy({ w: 512, h: 512 }, 360, 'icon.png')
  await onNavy({ w: 180, h: 180 }, 120, 'apple-icon.png')
  await onNavy({ w: 1200, h: 630 }, 380, 'og-default.jpg', 'jpg')
  console.log('ok')
})()
