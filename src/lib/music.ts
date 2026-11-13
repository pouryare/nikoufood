import type { Mood } from './moods'

/**
 * The background music, made live in the browser (no song files to download): a slow, soft pad that changes
 * chord every few seconds, a drone underneath, and now and then a single plucked or bell-like note picked from
 * the mood's scale. Every mood has its own scale, speed, instrument and room; when the visitor reaches another
 * section the old mood fades out while the new one fades in. All notes belong to one family of keys around D,
 * so the crossfades sound like one piece changing colour rather than two songs clashing.
 *
 * The «table» mood uses a scale with a neutral second (a note between E flat and E), as in Persian music.
 * An editor can replace any mood with an uploaded song in the CMS; the engine then loops that file instead.
 */

type Pluck = 'soft' | 'bell' | 'wood' | 'tar'

type Spec = {
  /** The tonic in hertz (the D below middle C is 146.8). */
  root: number
  /** Steps of the scale in semitones above the tonic (quarter tones allowed: 1.5). */
  scale: number[]
  /** Chords for the pad, as scale degrees (0 is the tonic, 7 on a seven-note scale is the octave, negatives go below). */
  chords: number[][]
  /** Seconds each chord lasts. */
  chordSec: number
  /** Seconds between chances for a melody note, and the chance that one is played. */
  step: number
  chance: number
  /** The melody wanders between these scale degrees. */
  low: number
  high: number
  pluck: Pluck
  /** Loudness of the pad, the lowest note, and the amount that goes to the room (all 0 to 1). */
  pad: number
  drone: number
  room: number
  /** How bright the pad is (low-pass cutoff in hertz). */
  warm: number
}

const D = 146.83

export const SPECS: Record<Mood, Spec> = {
  // morning light: a wide major pentatonic, a bell now and then
  hero: { root: D, scale: [0, 2, 4, 7, 9], chords: [[0, 2, 3], [-1, 0, 2], [1, 3, 5], [-1, 1, 3]], chordSec: 9, step: 1.7, chance: 0.55, low: 5, high: 12, pluck: 'bell', pad: 0.6, drone: 0.5, room: 0.55, warm: 1100 },
  // warm and slow, like butter softening: lydian, a soft pluck
  melt: { root: D, scale: [0, 2, 4, 6, 7, 9, 11], chords: [[0, 2, 4], [1, 3, 5], [5, 7, 9], [0, 2, 4]], chordSec: 10, step: 2.3, chance: 0.45, low: 7, high: 13, pluck: 'soft', pad: 0.75, drone: 0.6, room: 0.5, warm: 900 },
  // a pasture: a plain major scale, a quick wooden pluck, a little walking pace
  film: { root: D, scale: [0, 2, 4, 5, 7, 9, 11], chords: [[0, 2, 4], [3, 5, 7], [4, 6, 8], [5, 7, 9]], chordSec: 8, step: 1.05, chance: 0.6, low: 7, high: 14, pluck: 'wood', pad: 0.5, drone: 0.4, room: 0.4, warm: 1200 },
  // calm and clear: dorian
  intro: { root: D, scale: [0, 2, 3, 5, 7, 9, 10], chords: [[0, 2, 4], [3, 5, 7], [4, 6, 8], [6, 8, 10]], chordSec: 9, step: 1.9, chance: 0.5, low: 7, high: 13, pluck: 'soft', pad: 0.6, drone: 0.5, room: 0.5, warm: 1000 },
  // tidy and a little busier, like counting things into boxes
  sizes: { root: D, scale: [0, 2, 4, 7, 9], chords: [[0, 2, 3], [1, 3, 5], [-1, 1, 3], [0, 2, 3]], chordSec: 6.6, step: 0.55, chance: 0.5, low: 5, high: 11, pluck: 'wood', pad: 0.4, drone: 0.4, room: 0.35, warm: 1400 },
  // a shop window: bright lydian bells at a steady pace
  products: { root: D, scale: [0, 2, 4, 6, 7, 9, 11], chords: [[0, 2, 4], [4, 6, 8], [1, 3, 5], [0, 2, 4]], chordSec: 7.5, step: 0.85, chance: 0.55, low: 7, high: 14, pluck: 'bell', pad: 0.5, drone: 0.4, room: 0.5, warm: 1500 },
  // airy and high, with a lot of room
  finder: { root: D * 2, scale: [0, 2, 4, 7, 9], chords: [[0, 2, 3], [-1, 1, 3], [1, 3, 5], [0, 2, 3]], chordSec: 10, step: 1.5, chance: 0.4, low: 4, high: 10, pluck: 'bell', pad: 0.5, drone: 0.25, room: 0.75, warm: 1700 },
  // a kitchen in the afternoon: mixolydian, wooden and friendly
  kitchen: { root: D, scale: [0, 2, 4, 5, 7, 9, 10], chords: [[0, 2, 4], [-1, 1, 3], [3, 5, 7], [0, 2, 4]], chordSec: 8.5, step: 0.95, chance: 0.5, low: 7, high: 13, pluck: 'wood', pad: 0.55, drone: 0.45, room: 0.4, warm: 1100 },
  // the Persian table: a scale with a neutral second, a plucked string, a deep drone
  table: { root: D, scale: [0, 1.5, 3, 5, 7, 8, 10], chords: [[0, 2, 4], [5, 7, 9], [3, 5, 7], [0, 2, 4]], chordSec: 9, step: 1.05, chance: 0.5, low: 7, high: 13, pluck: 'tar', pad: 0.4, drone: 0.7, room: 0.45, warm: 900 },
  // travelling: a minor pentatonic, long chords, a long echo
  network: { root: D, scale: [0, 3, 5, 7, 10], chords: [[0, 1, 3], [2, 4, 5], [-2, 0, 2], [1, 3, 5]], chordSec: 11, step: 1.6, chance: 0.45, low: 5, high: 11, pluck: 'bell', pad: 0.6, drone: 0.5, room: 0.7, warm: 1000 },
  // settled and warm: pentatonic again, few notes
  trust: { root: D, scale: [0, 2, 4, 7, 9], chords: [[0, 2, 3], [-1, 0, 2], [1, 3, 5], [0, 2, 3]], chordSec: 12, step: 2.4, chance: 0.35, low: 3, high: 9, pluck: 'soft', pad: 0.8, drone: 0.6, room: 0.5, warm: 800 },
}

/** The tones of one plucked note: [wave, multiple of the pitch, loudness, how long it rings compared to the base]. */
const PLUCKS: Record<Pluck, { parts: [OscillatorType, number, number, number][]; ring: number; bright: number }> = {
  soft: { parts: [['triangle', 1, 1, 1], ['sine', 2, 0.25, 0.6]], ring: 2.4, bright: 5 },
  bell: { parts: [['sine', 1, 1, 1], ['sine', 2.76, 0.2, 0.35], ['sine', 5.4, 0.06, 0.15]], ring: 3.6, bright: 10 },
  wood: { parts: [['sine', 1, 1, 1], ['sine', 4, 0.3, 0.25]], ring: 0.8, bright: 8 },
  tar: { parts: [['triangle', 1, 1, 1], ['sawtooth', 1.003, 0.16, 0.7]], ring: 1.3, bright: 7 },
}

/** The pitch of a scale degree: degree 0 is the tonic, a full turn of the scale is one octave up. */
export function degreeHz(spec: Pick<Spec, 'root' | 'scale'>, degree: number) {
  const n = spec.scale.length
  const octave = Math.floor(degree / n)
  const step = spec.scale[((degree % n) + n) % n]
  return spec.root * 2 ** ((step + 12 * octave) / 12)
}

/** A room: noise that fades away over a couple of seconds, left and right slightly different. */
function room(ctx: BaseAudioContext, seconds = 2.8, decay = 2.6) {
  const length = Math.ceil(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay
  }
  return buffer
}

type Bus = { gain: GainNode; stop: () => void }

export class Music {
  /** Everything the music plays goes through here (its volume and its fades). */
  readonly out: GainNode
  private readonly ctx: BaseAudioContext
  private readonly verb: ConvolverNode
  private bus: Bus | null = null
  private mood: Mood | null = null
  private running = false
  private timer: ReturnType<typeof setInterval> | null = null
  private nextChord = 0
  private nextStep = 0
  private chordAt = 0
  private last = -1
  private level = 0.7
  private files: Partial<Record<Mood, AudioBuffer>> = {}
  /** True while a song file (not the generated music) is playing for the current mood. */
  private fileMode = false

  constructor(ctx: BaseAudioContext, destination: AudioNode) {
    this.ctx = ctx
    this.out = ctx.createGain()
    this.out.gain.value = 0.0001
    this.verb = ctx.createConvolver()
    this.verb.buffer = room(ctx)
    const wet = ctx.createGain()
    wet.gain.value = 0.9
    this.verb.connect(wet).connect(this.out)
    this.out.connect(destination)
  }

  /** The loudness of the whole music, 0 to about 1. */
  setLevel(level: number) {
    this.level = Math.max(0, level)
    if (this.running) this.fade(this.level, 0.4)
  }

  /** A song for one mood (from the CMS): it is looped instead of the generated music. */
  setFile(mood: Mood, buffer: AudioBuffer) {
    this.files[mood] = buffer
    if (this.mood === mood) this.switchTo(mood)
  }

  /** Fades the music in and starts playing the current mood. */
  start() {
    if (this.running) return
    this.running = true
    this.fade(this.level, 2.2)
    if (this.mood) this.switchTo(this.mood)
    this.timer ??= setInterval(this.tick, 180)
  }

  /** Fades the music out (the sound button, or the tab going to the background). */
  stop() {
    if (!this.running) return
    this.running = false
    this.fade(0.0001, 0.7)
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  /** The visitor reached another part of the page. */
  setMood(mood: Mood) {
    if (mood === this.mood) return
    this.mood = mood
    if (this.running) this.switchTo(mood)
  }

  private fade(to: number, seconds: number) {
    const { currentTime: now } = this.ctx
    const g = this.out.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(Math.max(0.0001, g.value), now)
    g.linearRampToValueAtTime(Math.max(0.0001, to), now + seconds)
  }

  /** Fades the old mood out and a fresh one in over a few seconds. */
  private switchTo(mood: Mood) {
    const { ctx } = this
    const now = ctx.currentTime
    const old = this.bus
    if (old) {
      old.gain.gain.cancelScheduledValues(now)
      old.gain.gain.setValueAtTime(Math.max(0.0001, old.gain.gain.value), now)
      old.gain.gain.linearRampToValueAtTime(0.0001, now + 3.2)
      setTimeout(old.stop, 7000)
    }
    const spec = SPECS[mood]
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(1, now + 3.2)
    const send = ctx.createGain()
    send.gain.value = spec.room
    gain.connect(this.out)
    gain.connect(send).connect(this.verb)
    let stopFile = () => {}
    const file = this.files[mood]
    if (file) {
      const src = ctx.createBufferSource()
      src.buffer = file
      src.loop = true
      src.connect(gain)
      src.start()
      stopFile = () => src.stop()
    }
    this.bus = {
      gain,
      stop: () => {
        stopFile()
        gain.disconnect()
        send.disconnect()
      },
    }
    // The first chord starts now; the first melody note a little later.
    this.nextChord = now + 0.1
    this.nextStep = now + 1.2 + Math.random()
    this.chordAt = Math.floor(Math.random() * spec.chords.length)
    this.last = -1
    this.fileMode = !!file
  }

  /** Looks a little ahead and schedules the notes that fall in that time. */
  private tick = () => {
    if (this.running) this.scheduleUntil(this.ctx.currentTime + 0.9)
  }

  /** Schedules every chord and note that begins before `horizon` (a time on the audio clock). */
  scheduleUntil(horizon: number) {
    const { mood, bus } = this
    if (!mood || !bus || this.fileMode) return
    const spec = SPECS[mood]
    while (this.nextChord < horizon) {
      this.chord(spec, bus, this.nextChord)
      this.nextChord += spec.chordSec
    }
    while (this.nextStep < horizon) {
      if (Math.random() < spec.chance) this.note(spec, bus, this.nextStep)
      this.nextStep += spec.step * (0.88 + Math.random() * 0.24)
    }
  }

  /** The pad: each chord tone is a triangle plus a faint shimmer an octave up, swelling in and out, with a drone below. */
  private chord(spec: Spec, bus: Bus, at: number) {
    const { ctx } = this
    const tones = spec.chords[this.chordAt++ % spec.chords.length]
    const hold = spec.chordSec
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = spec.warm
    lp.Q.value = 0.4
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, at)
    env.gain.linearRampToValueAtTime(spec.pad * 0.07, at + Math.min(3.2, hold * 0.4))
    env.gain.setValueAtTime(spec.pad * 0.07, at + hold)
    env.gain.linearRampToValueAtTime(0.0001, at + hold + 4)
    lp.connect(env).connect(bus.gain)
    const end = at + hold + 4.2
    const tone = (type: OscillatorType, hz: number, level: number, detune: number) => {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = hz
      o.detune.value = detune
      const g = ctx.createGain()
      g.gain.value = level
      o.connect(g).connect(lp)
      o.start(at)
      o.stop(end)
    }
    for (const d of tones) {
      const hz = degreeHz(spec, d)
      tone('triangle', hz, 1, -5)
      tone('sine', hz * 2, 0.3, 6)
    }
    // the drone: the tonic and (quieter) the fifth, two octaves under the melody
    const drone = ctx.createGain()
    drone.gain.setValueAtTime(0.0001, at)
    drone.gain.linearRampToValueAtTime(spec.drone * 0.07, at + Math.min(3.2, hold * 0.4))
    drone.gain.setValueAtTime(spec.drone * 0.07, at + hold)
    drone.gain.linearRampToValueAtTime(0.0001, at + hold + 4)
    drone.connect(bus.gain)
    for (const [hz, level] of [[spec.root / 2, 1], [spec.root * 0.75, 0.35]] as const) {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = hz
      const g = ctx.createGain()
      g.gain.value = level
      o.connect(g).connect(drone)
      o.start(at)
      o.stop(end)
    }
  }

  /** One melody note: a random step from the last one, kept inside the mood's range. */
  private note(spec: Spec, bus: Bus, at: number) {
    const moves = [-2, -1, -1, 1, 1, 2]
    this.last =
      this.last < 0
        ? spec.low + Math.floor(Math.random() * (spec.high - spec.low))
        : Math.min(spec.high, Math.max(spec.low, this.last + moves[Math.floor(Math.random() * moves.length)]))
    this.pluck(spec, bus, at, degreeHz(spec, this.last), 0.55 + Math.random() * 0.45)
    // now and then a quieter second note follows, like an echo of the thought
    if (Math.random() < 0.22) this.pluck(spec, bus, at + 0.32 + Math.random() * 0.2, degreeHz(spec, this.last + (Math.random() < 0.5 ? 1 : -1)), 0.35)
  }

  private pluck(spec: Spec, bus: Bus, at: number, hz: number, velocity: number) {
    const { ctx } = this
    const kind = PLUCKS[spec.pluck]
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.setValueAtTime(Math.min(9000, hz * kind.bright), at)
    f.frequency.exponentialRampToValueAtTime(Math.max(400, hz * 1.5), at + kind.ring)
    const pan = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null
    if (pan) pan.pan.value = Math.random() * 1.2 - 0.6
    const chainEnd = pan ? f.connect(pan) : f
    chainEnd.connect(bus.gain)
    for (const [type, ratio, level, ringMul] of kind.parts) {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = hz * ratio
      const g = ctx.createGain()
      const peak = 0.11 * level * velocity
      const ring = kind.ring * ringMul
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(peak, at + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0001, at + ring)
      o.connect(g).connect(f)
      o.start(at)
      o.stop(at + ring + 0.05)
    }
  }
}
