import type { SoundName } from './effects'

export type SoundAction = 'play' | 'start' | 'stop'
export type SoundRequest = { name: SoundName; action: SoundAction }

export const SOUND_EVENT = 'nk-sound'

/**
 * Ask for a sound from anywhere on the page. Nothing plays unless the visitor
 * has turned sound on with the speaker button; then `start`/`stop` fade a looping sound in and out.
 */
export function emitSound(name: SoundName, action: SoundAction = 'play') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<SoundRequest>(SOUND_EVENT, { detail: { name, action } }))
}
