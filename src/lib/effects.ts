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
  /** Sound starts on (after the visitor's first click or tap) unless they turned it off before. */
  soundOnAtStart: boolean
  titleRise: boolean
  wordLight: boolean
  rollingNumbers: boolean
  foilCards: boolean
  showroom: boolean
  bento: boolean
  stickyChapters: boolean
  kineticCta: boolean
  footerName: boolean
  sheetStack: boolean
  travellingButter: boolean
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
    soundOnAtStart: on(e.soundOnAtStart),
    titleRise: on(e.titleRise),
    wordLight: on(e.wordLight),
    rollingNumbers: on(e.rollingNumbers),
    foilCards: on(e.foilCards),
    showroom: on(e.showroom),
    bento: on(e.bento),
    stickyChapters: on(e.stickyChapters),
    kineticCta: on(e.kineticCta),
    footerName: on(e.footerName),
    sheetStack: on(e.sheetStack),
    travellingButter: on(e.travellingButter),
  }
}

export type SoundName = 'sizzle' | 'farm' | 'milk' | 'click'
export type SoundFiles = Partial<Record<SoundName, string>>

/**
 * Built-in recordings, used until the editor uploads their own. All are free to use without credit (CC0 or public domain):
 * - farm: birdsong and a light breeze in an open field ("Park ambiences" by Thimras, CC0) with a few nearer birds
 *   ("Ambient Bird Sounds" by isaiah658, CC0), both from OpenGameArt.org; mixed into a soft 24-second loop
 * - milk: a steady pour ("Boiling water being poured into a mug for tea" by cori, public domain, Wikimedia Commons);
 *   a 4.5-second loop
 * The numbers in the file names change whenever a file changes, because browsers keep these files for 30 days.
 * The sizzle and the click have no file: the browser makes a soft version of them itself.
 */
export const BUILT_IN_SOUNDS: SoundFiles = { farm: '/sounds/farm-1.mp3', milk: '/sounds/milk-1.mp3' }

/** The sound files by name: an uploaded file wins, otherwise the built-in one (if there is one). */
export function soundFilesOf(settings: Pick<SiteSetting, 'sounds'>): SoundFiles {
  const s = settings.sounds ?? {}
  const out: SoundFiles = { ...BUILT_IN_SOUNDS }
  for (const name of ['sizzle', 'farm', 'milk', 'click'] as const) {
    const url = mediaOf(s[name])?.url
    if (url) out[name] = url
  }
  return out
}
