// Renders the still image of the butter curl (transparent background).
// It is the instant fallback behind the live 3D hero and the default product picture.
//   node tools/render/butter.mjs [outFile] [size]
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { dataUrlToBuffer, openScene, root } from './browser.mjs'

const require = createRequire(import.meta.url)
const sharp = require('sharp')
const out = path.resolve(root, process.argv[2] || 'public/brand/butter-curl.webp')
const size = Number(process.argv[3] || 1400)

const { browser, page } = await openScene('tools/render/butter-entry.ts', { width: size, height: size })
const png = dataUrlToBuffer(await page.evaluate((s) => window.renderButter(s), size))
await browser.close()
await fs.mkdir(path.dirname(out), { recursive: true })
if (out.endsWith('.png')) await fs.writeFile(out, png)
else await sharp(png).webp({ quality: 90, alphaQuality: 95 }).toFile(out)
console.log('wrote', path.relative(root, out), `${size}px`)
