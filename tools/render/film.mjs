// Renders the placeholder scroll film (see film-entry.ts) and encodes it as an mp4.
//   node tools/render/film.mjs [--portrait] [--frames 132] [--samples 6] [--test 0.1,0.5,0.9] [--size 1600x900]
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { dataUrlToBuffer, openScene, root } from './browser.mjs'

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : (args[i + 1] ?? true)
}
const portrait = args.includes('--portrait')
const [width, height] = String(flag('size', portrait ? '720x1280' : '1600x900')).split('x').map(Number)
const frames = Number(flag('frames', 132))
const samples = Number(flag('samples', 6))
const quality = Number(flag('quality', 1))
const test = flag('test', '')
const outFile = path.resolve(root, String(flag('out', `src/seed/assets/film-placeholder${portrait ? '-mobile' : ''}.mp4`)))
const tmp = path.resolve(root, `.film-tmp-${portrait ? 'p' : 'l'}`)

const { browser, page } = await openScene('tools/render/film-entry.ts', { width, height })
page.setDefaultTimeout(0)
await page.evaluate(([w, h, q]) => window.initFilm(w, h, q), [width, height, quality])
await fs.rm(tmp, { recursive: true, force: true })
await fs.mkdir(tmp, { recursive: true })

if (test) {
  for (const t of String(test).split(',').map(Number)) {
    const started = Date.now()
    const jpg = dataUrlToBuffer(await page.evaluate(([time, s]) => window.renderFilmFrame(time, s), [t, samples]))
    const file = path.join(path.dirname(outFile), `test-${portrait ? 'p' : 'l'}-${String(t).replace('.', '_')}.jpg`)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, jpg)
    console.log('test frame', t, `${Date.now() - started}ms`, file)
  }
  await browser.close()
  await fs.rm(tmp, { recursive: true, force: true })
  process.exit(0)
}

const started = Date.now()
for (let i = 0; i < frames; i++) {
  const t = i / (frames - 1)
  const jpg = dataUrlToBuffer(await page.evaluate(([time, s]) => window.renderFilmFrame(time, s), [t, samples]))
  await fs.writeFile(path.join(tmp, `${String(i + 1).padStart(4, '0')}.jpg`), jpg)
  if (i % 10 === 0) console.log(`frame ${i + 1}/${frames}`, `${Math.round((Date.now() - started) / 1000)}s`)
}
await browser.close()

await fs.mkdir(path.dirname(outFile), { recursive: true })
// 24 fps, every 6th frame a keyframe (so the plain-video fallback can also be scrubbed), no audio.
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '24', '-i', path.join(tmp, '%04d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-g', '6', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', outFile])
await fs.rm(tmp, { recursive: true, force: true })
console.log('wrote', path.relative(root, outFile), `${frames} frames`, `${Math.round((Date.now() - started) / 1000)}s`)
