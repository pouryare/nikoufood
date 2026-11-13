import type { SoundName } from './sound-names'

export type SoundAction = 'play' | 'start' | 'stop'
export type SoundRequest = { name: SoundName; action: SoundAction }

export const SOUND_EVENT = 'nk-sound'

/**
 * Ask for a sound from anywhere on the page. Nothing plays while sound is off (the CMS decides whether
 * it starts on, and the speaker button lets the visitor change it); `start`/`stop` fade a looping sound in and out.
 */
export function emitSound(name: SoundName, action: SoundAction = 'play') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<SoundRequest>(SOUND_EVENT, { detail: { name, action } }))
}
