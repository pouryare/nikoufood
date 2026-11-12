import type { SiteSetting } from '@/payload-types'
import { mediaOf } from './cms'

/** Which special effects are on. A switch that was never saved (an older database) counts as on. */
export type Effects = {
  lamp: boolean
  pattern: boolean
  grain: boolean
  pourTitles: boolean
  goldenThread: boolean
  pageTransition: boolean
  magneticButtons: boolean
  smoothScroll: boolean
  sound: boolean
}

export function effectsOf(settings: Pick<SiteSetting, 'effects'>): Effects {
  const e = settings.effects ?? {}
  const on = (v: boolean | null | undefined) => v !== false
  return {
    lamp: on(e.lamp),
    pattern: on(e.pattern),
    grain: on(e.grain),
    pourTitles: on(e.pourTitles),
    goldenThread: on(e.goldenThread),
    pageTransition: on(e.pageTransition),
    magneticButtons: on(e.magneticButtons),
    smoothScroll: on(e.smoothScroll),
    sound: on(e.sound),
  }
}

export type SoundName = 'sizzle' | 'farm' | 'milk' | 'click'
export type SoundFiles = Partial<Record<SoundName, string>>

/** Uploaded sound files by name (only the ones that exist). */
export function soundFilesOf(settings: Pick<SiteSetting, 'sounds'>): SoundFiles {
  const s = settings.sounds ?? {}
  const out: SoundFiles = {}
  for (const name of ['sizzle', 'farm', 'milk', 'click'] as const) {
    const url = mediaOf(s[name])?.url
    if (url) out[name] = url
  }
  return out
}
