// Shared helper for the offline renderers: bundles a browser entry with esbuild and opens it in headless Chromium.
// These tools only produce placeholder artwork (posters, the placeholder film). They are not part of the website build.
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const require = createRequire(import.meta.url)
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export async function openScene(entry, { width, height, deviceScaleFactor = 1 }) {
  const result = await build({
    entryPoints: [path.resolve(root, entry)],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: 'es2022',
    alias: { '@': path.resolve(root, 'src') },
    logLevel: 'warning',
  })
  const code = result.outputFiles[0].text
  const { chromium } = require('playwright')
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] })
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor })
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && console.log(`[page ${m.type()}]`, m.text()))
  page.on('pageerror', (e) => console.log('[page error]', e.message))
  await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent"><canvas id="c"></canvas></body></html>`)
  await page.addScriptTag({ content: code })
  return { browser, page }
}

export const dataUrlToBuffer = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64')
