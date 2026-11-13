import type { SoundName } from './sound-names'

/**
 * The small sounds the browser makes by itself (no files to download). Each one is a few oscillators or a burst
 * of filtered noise with a quick fade, kept very quiet: the loudest peaks well below full volume.
 * `out` is the sound-effects volume knob; `ctx` is the page's audio context.
 */
export type Synth = (ctx: AudioContext, out: AudioNode) => void

/** How loud an uploaded file for each sound is played (the built-in sounds set their own loudness below). */
export const FILE_LEVEL: Record<SoundName, number> = {
  sizzle: 0.5,
  farm: 0.35,
  milk: 0.45,
  click: 0.18,
  hover: 0.1,
  tick: 0.15,
  pop: 0.25,
  open: 0.3,
  close: 0.25,
  success: 0.35,
  whoosh: 0.3,
  scrape: 0.2,
  peel: 0.3,
}

/** The least time between two plays of the same sound (milliseconds), so a busy page never machine-guns. */
export const MIN_GAP: Partial<Record<SoundName, number>> = {
  hover: 90,
  tick: 50,
  scrape: 130,
  click: 90,
  pop: 120,
  whoosh: 600,
}

export function noise(ctx: AudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

/** One soft tone that slides from `f0` to `f1`, with a fast attack and a smooth fade. */
function blip(ctx: AudioContext, out: AudioNode, at: number, f0: number, f1: number, dur: number, peak: number, type: OscillatorType = 'sine') {
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(f0, at)
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + dur * 0.8)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(peak, at + Math.min(0.006, dur / 4))
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  o.connect(g).connect(out)
  o.start(at)
  o.stop(at + dur + 0.03)
}

/** A bell-like note: a pure tone plus a quieter inharmonic partial, ringing out slowly. */
function bell(ctx: AudioContext, out: AudioNode, at: number, hz: number, peak: number, ring: number) {
  blip(ctx, out, at, hz, hz, ring, peak)
  blip(ctx, out, at, hz * 2.76, hz * 2.76, ring * 0.35, peak * 0.22)
}

/** A short burst of filtered noise. */
function burst(ctx: AudioContext, out: AudioNode, at: number, dur: number, peak: number, type: BiquadFilterType, from: number, to: number, q = 0.9) {
  const src = ctx.createBufferSource()
  src.buffer = noise(ctx, dur + 0.05)
  const f = ctx.createBiquadFilter()
  f.type = type
  f.Q.value = q
  f.frequency.setValueAtTime(from, at)
  if (to !== from) f.frequency.exponentialRampToValueAtTime(to, at + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(peak, at + dur * 0.25)
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
  src.connect(f).connect(g).connect(out)
  src.start(at)
  src.stop(at + dur + 0.05)
}

/** A soft sizzle: it swells in slowly, crackles quietly, and fades away. */
const sizzle: Synth = (ctx, out) => {
  const now = ctx.currentTime
  const dur = 3.4
  const buf = noise(ctx, dur + 0.3)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 2300
  const shelf = ctx.createBiquadFilter()
  shelf.type = 'highshelf'
  shelf.frequency.value = 7000
  shelf.gain.value = -6
  const g = ctx.createGain()
  const peak = 0.09
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(peak, now + 0.8)
  g.gain.setValueAtTime(peak, now + 1.8)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  src.connect(hp).connect(shelf).connect(g).connect(out)
  src.start(now)
  src.stop(now + dur + 0.1)
  for (let i = 0; i < 90; i++) {
    const t = now + 0.15 + Math.random() * (dur - 0.5)
    const into = (t - now) / dur
    const pop = ctx.createBufferSource()
    pop.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2600 + Math.random() * 4200
    const pg = ctx.createGain()
    const amp = Math.max(0.0002, (0.012 + Math.random() * 0.03) * Math.min(1, into / 0.25) * (1 - into))
    pg.gain.setValueAtTime(0.0001, t)
    pg.gain.exponentialRampToValueAtTime(amp, t + 0.003)
    pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.012 + Math.random() * 0.025)
    pop.connect(bp).connect(pg).connect(out)
    pop.start(t, Math.random() * dur, 0.05)
  }
}

/**
 * The small sounds sit on top of the background music, which is a quiet bed, so they are played a good deal
 * louder than their own peaks suggest (these peaks were measured by rendering each sound offline).
 */
const BOOST = 2.6
const louder = (synth: Synth): Synth => (ctx, out) => {
  const g = ctx.createGain()
  g.gain.value = BOOST
  g.connect(out)
  synth(ctx, g)
}

const SMALL: Partial<Record<SoundName, Synth>> = {
  // a tiny wooden tick for buttons and links
  click: (ctx, out) => blip(ctx, out, ctx.currentTime, 1250, 760, 0.07, 0.027),
  // a very quiet high tick when the mouse reaches a button
  hover: (ctx, out) => blip(ctx, out, ctx.currentTime, 2300, 2600, 0.045, 0.011),
  // a dry little tick for sliders and tick boxes
  tick: (ctx, out) => blip(ctx, out, ctx.currentTime, 1700, 1500, 0.035, 0.03, 'triangle'),
  // a round bubble: a new message, a new step
  pop: (ctx, out) => {
    const at = ctx.currentTime
    blip(ctx, out, at, 330, 640, 0.1, 0.085)
    blip(ctx, out, at + 0.012, 660, 1280, 0.06, 0.02)
  },
  // a menu or a sheet opens: two soft notes going up
  open: (ctx, out) => {
    const at = ctx.currentTime
    blip(ctx, out, at, 520, 560, 0.16, 0.06)
    blip(ctx, out, at + 0.07, 780, 830, 0.2, 0.05)
  },
  // ...and closes: two soft notes going down
  close: (ctx, out) => {
    const at = ctx.currentTime
    blip(ctx, out, at, 700, 660, 0.14, 0.05)
    blip(ctx, out, at + 0.07, 470, 440, 0.18, 0.045)
  },
  // something worked: three bell notes climbing (D, F sharp, A)
  success: (ctx, out) => {
    const at = ctx.currentTime
    bell(ctx, out, at, 587.3, 0.07, 1.1)
    bell(ctx, out, at + 0.11, 740, 0.065, 1.2)
    bell(ctx, out, at + 0.22, 880, 0.06, 1.6)
  },
  // moving on to another page: air passing
  whoosh: (ctx, out) => burst(ctx, out, ctx.currentTime, 0.55, 0.07, 'bandpass', 380, 2000, 0.7),
  // a few grains of rice under the butter
  scrape: (ctx, out) => burst(ctx, out, ctx.currentTime, 0.1, 0.045, 'bandpass', 1900 + Math.random() * 1500, 3600, 1.2),
  // foil coming away: a short ripping crackle
  peel: (ctx, out) => {
    const at = ctx.currentTime
    for (let i = 0; i < 12; i++) burst(ctx, out, at + i * 0.028 + Math.random() * 0.012, 0.03, 0.03 + Math.random() * 0.03, 'highpass', 2800 + Math.random() * 2500, 2800 + Math.random() * 2500, 0.6)
  },
}

/** The small sounds, by name. «farm» and «milk» are recordings only, so they are not here. */
export const SYNTHS: Partial<Record<SoundName, Synth>> = {
  sizzle,
  ...Object.fromEntries(Object.entries(SMALL).map(([name, synth]) => [name, louder(synth)])),
}
