import type { SiteSetting } from '@/payload-types'
import { mediaOf } from './cms'
import { MOODS, type Mood } from './moods'
import type { SoundName } from './sound-names'
import { SOUNDS } from './sound-names'

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
  /** Background music that changes with the section on screen. */
  music: boolean
  /** A small sound for each little interaction (touching a button, opening the menu, a success …). */
  microSounds: boolean
  /** How loud the music and the small sounds are, 0 to 100. */
  musicVolume: number
  sfxVolume: number
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
  /** The travelling butter stays visible over every section, the film, the showroom and the brand sheet too. */
  butterEverywhere: boolean
  nooshJan: boolean
  goldCursor: boolean
  moltenButtons: boolean
  sectionMap: boolean
  stretchyTitles: boolean
}

/** A volume from the CMS: 0 to 100, or the default while it was never set. */
const volume = (v: number | null | undefined, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : fallback

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
    music: on(e.music),
    microSounds: on(e.microSounds),
    musicVolume: volume(e.musicVolume, 60),
    sfxVolume: volume(e.sfxVolume, 70),
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
    butterEverywhere: on(e.butterEverywhere),
    nooshJan: on(e.nooshJan),
    goldCursor: on(e.goldCursor),
    moltenButtons: on(e.moltenButtons),
    sectionMap: on(e.sectionMap),
    stretchyTitles: on(e.stretchyTitles),
  }
}

export { MICRO_SOUNDS, SOUNDS, type SoundName } from './sound-names'
export type SoundFiles = Partial<Record<SoundName, string>>
export type MusicFiles = Partial<Record<Mood, string>>

/**
 * Built-in recordings, used until the editor uploads their own. All are free to use without credit (CC0 or public domain):
 * - farm: birdsong and a light breeze in an open field ("Park ambiences" by Thimras, CC0) with a few nearer birds
 *   ("Ambient Bird Sounds" by isaiah658, CC0), both from OpenGameArt.org; mixed into a soft 24-second loop
 * - milk: a steady pour ("Boiling water being poured into a mug for tea" by cori, public domain, Wikimedia Commons);
 *   a 4.5-second loop
 * The numbers in the file names change whenever a file changes, because browsers keep these files for 30 days.
 * The other sounds have no file: the browser makes a soft version of each itself.
 */
export const BUILT_IN_SOUNDS: SoundFiles = { farm: '/sounds/farm-1.mp3', milk: '/sounds/milk-1.mp3' }

/** The sound files by name: an uploaded file wins, otherwise the built-in one (if there is one). */
export function soundFilesOf(settings: Pick<SiteSetting, 'sounds'>): SoundFiles {
  const s = settings.sounds ?? {}
  const out: SoundFiles = { ...BUILT_IN_SOUNDS }
  for (const { id } of SOUNDS) {
    const url = mediaOf(s[id])?.url
    if (url) out[id] = url
  }
  return out
}

/** The songs the editor uploaded, by mood. A mood without one is played by the browser's own generated music. */
export function musicFilesOf(settings: Pick<SiteSetting, 'musicFiles'>): MusicFiles {
  const m = settings.musicFiles ?? {}
  const out: MusicFiles = {}
  for (const { id } of MOODS) {
    const url = mediaOf(m[id])?.url
    if (url) out[id] = url
  }
  return out
}
