import type { CSSProperties } from 'react'
import { THEME_COLOR_DEFAULTS } from '@/globals/Theme'
import type { Theme } from '@/payload-types'

const HEX = /^#[0-9a-fA-F]{6}$/

const VARS: Record<keyof typeof THEME_COLOR_DEFAULTS, string> = {
  background: '--nk-bg',
  surface: '--nk-surface',
  surfaceRaised: '--nk-raised',
  textPrimary: '--nk-text',
  textSecondary: '--nk-muted',
  border: '--nk-line',
  primary: '--nk-gold',
  secondary: '--nk-cream',
  accent: '--nk-accent',
  logoFrom: '--nk-logo-from',
  logoTo: '--nk-logo-to',
  success: '--nk-success',
  error: '--nk-danger',
}

export type ThemeColors = Record<keyof typeof THEME_COLOR_DEFAULTS, string>

/** Colours from the CMS, each checked to be a real hex code (anything else falls back to the default). */
export function themeColors(theme: Theme | null | undefined): ThemeColors {
  const saved = (theme?.colors ?? {}) as Record<string, unknown>
  const out = { ...THEME_COLOR_DEFAULTS } as ThemeColors
  for (const key of Object.keys(out) as Array<keyof ThemeColors>) {
    const value = saved[key]
    if (typeof value === 'string' && HEX.test(value)) out[key] = value
  }
  return out
}

type FontDoc = { url?: string | null; family?: string | null; weight?: string | null; mimeType?: string | null }
const fontDoc = (value: unknown): FontDoc | null => (value && typeof value === 'object' && (value as FontDoc).url ? (value as FontDoc) : null)
const safeUrl = (url: string) => url.replace(/["'()\\\s<>]/g, '')
const safeWeight = (weight: string | null | undefined, fallback: string) => (weight && /^\d{3}( \d{3})?$/.test(weight.trim()) ? weight.trim() : fallback)
const format = (doc: FontDoc) => (doc.url?.endsWith('.woff') ? 'woff' : 'woff2')

/**
 * Turns the «پوسته» settings into what the page needs:
 *  - `style`: CSS variables for <html>
 *  - `css`: @font-face rules, only when an editor uploaded replacement fonts
 */
export function themeToCss(theme: Theme | null | undefined): { style: CSSProperties; css: string; colors: ThemeColors } {
  const colors = themeColors(theme)
  const style: Record<string, string> = {}
  for (const key of Object.keys(colors) as Array<keyof ThemeColors>) style[VARS[key]] = colors[key]

  const faces: string[] = []
  const body = fontDoc(theme?.fonts?.bodyFont)
  const bodyBold = fontDoc(theme?.fonts?.bodyFontBold)
  const display = fontDoc(theme?.fonts?.displayFont)
  if (body) {
    faces.push(`@font-face{font-family:"NK Body CMS";src:url("${safeUrl(body.url!)}") format("${format(body)}");font-weight:${safeWeight(body.weight, '400')};font-display:swap}`)
    if (bodyBold) {
      faces.push(`@font-face{font-family:"NK Body CMS";src:url("${safeUrl(bodyBold.url!)}") format("${format(bodyBold)}");font-weight:${safeWeight(bodyBold.weight, '700')};font-display:swap}`)
    }
    style['--nk-font-body'] = '"NK Body CMS"'
  }
  if (display) {
    faces.push(`@font-face{font-family:"NK Display CMS";src:url("${safeUrl(display.url!)}") format("${format(display)}");font-weight:${safeWeight(display.weight, '100 950')};font-display:swap}`)
    style['--nk-font-display'] = '"NK Display CMS"'
  }
  return { style: style as CSSProperties, css: faces.join(''), colors }
}
