'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { SoundFiles, SoundName } from '@/lib/effects'
import { SOUND_EVENT, type SoundRequest } from '@/lib/sound'

const STORE_KEY = 'nk-sound'
/** Everything is quiet on purpose: the loudest sound peaks well below full volume and always fades in. */
const MASTER = 0.55
const LEVEL: Record<SoundName, number> = { sizzle: 0.5, farm: 0.35, milk: 0.45, click: 0.18 }

type Engine = {
  ctx: AudioContext
  master: GainNode
  buffers: Partial<Record<SoundName, AudioBuffer | null>>
  loops: Partial<Record<SoundName, { src: AudioBufferSourceNode; gain: GainNode }>>
  lastClick: number
}

/** The visitor's own choice on this device: on, off, or null when they never pressed the button. */
const readPref = (): boolean | null => {
  try {
    const v = window.localStorage.getItem(STORE_KEY)
    return v === '1' ? true : v === '0' ? false : null
  } catch {
    return null
  }
}
const writePref = (on: boolean) => {
  try {
    window.localStorage.setItem(STORE_KEY, on ? '1' : '0')
  } catch {
    /* private mode: the choice just isn't remembered */
  }
}

function noise(ctx: AudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

/** A soft sizzle made in the browser: it swells in slowly, crackles quietly, and fades away. */
function synthSizzle(e: Engine) {
  const { ctx } = e
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
  const peak = 0.09 * LEVEL.sizzle * 2
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(peak, now + 0.8)
  g.gain.setValueAtTime(peak, now + 1.8)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  src.connect(hp).connect(shelf).connect(g).connect(e.master)
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
    const amp = Math.max(
      0.0002,
      (0.012 + Math.random() * 0.03) * Math.min(1, into / 0.25) * (1 - into),
    )
    pg.gain.setValueAtTime(0.0001, t)
    pg.gain.exponentialRampToValueAtTime(amp, t + 0.003)
    pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.012 + Math.random() * 0.025)
    pop.connect(bp).connect(pg).connect(e.master)
    pop.start(t, Math.random() * dur, 0.05)
  }
}

/** A tiny wooden tick for buttons. */
function synthClick(e: Engine) {
  const { ctx } = e
  const now = ctx.currentTime
  const o = ctx.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(1250, now)
  o.frequency.exponentialRampToValueAtTime(760, now + 0.045)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.03 * LEVEL.click * 5, now + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07)
  o.connect(g).connect(e.master)
  o.start(now)
  o.stop(now + 0.09)
}

async function load(e: Engine, name: SoundName, url: string | undefined) {
  if (!url || name in e.buffers) return
  e.buffers[name] = null
  try {
    const res = await fetch(url)
    e.buffers[name] = await e.ctx.decodeAudioData(await res.arrayBuffer())
  } catch {
    e.buffers[name] = null
  }
}

function playFile(e: Engine, name: SoundName, loop: boolean) {
  const buffer = e.buffers[name]
  if (!buffer) return null
  const { ctx } = e
  const now = ctx.currentTime
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = loop
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(LEVEL[name], now + (loop ? 1.4 : 0.25))
  src.connect(gain).connect(e.master)
  src.start(now)
  if (!loop) {
    const end = now + buffer.duration
    gain.gain.setValueAtTime(LEVEL[name], Math.max(now + 0.3, end - 0.6))
    gain.gain.exponentialRampToValueAtTime(0.0001, end)
  }
  return { src, gain }
}

type Props = {
  files: SoundFiles
  labels: { on: string; off: string }
  /** Sound is on for visitors who never pressed the button (set in the CMS). */
  startOn: boolean
}

/** Browsers let a page make sound only after one of these: the first one starts the sound. */
const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'] as const

/**
 * The speaker button and the small sound engine behind it. Whether sound starts on comes from
 * the CMS, and the visitor's own choice (remembered on that device) wins over it. Browsers stay
 * silent until the visitor's first click, tap or key press, so that is when the sound fades in.
 * Other parts of the page ask for sounds with `emitSound()`; while sound is off they are ignored,
 * except that the page remembers which looping sound belongs where the visitor is, so it can
 * start that one as soon as sound comes on.
 */
export function SoundToggle({ files, labels, startOn }: Props) {
  const [on, setOn] = useState(false)
  const [tucked, setTucked] = useState(false)
  const engine = useRef<Engine | null>(null)
  const onRef = useRef(false)
  /** The looping sounds the page is asking for right now (e.g. the farm while its scene is on screen). */
  const wanted = useRef(new Set<SoundName>())

  const startLoop = (e: Engine, name: SoundName) => {
    if (e.loops[name] || e.ctx.state !== 'running') return
    const loop = playFile(e, name, true)
    if (loop) e.loops[name] = loop
  }

  const stopLoop = (e: Engine, name: SoundName) => {
    const loop = e.loops[name]
    if (!loop) return
    const now = e.ctx.currentTime
    loop.gain.gain.cancelScheduledValues(now)
    loop.gain.gain.setValueAtTime(Math.max(0.0001, loop.gain.gain.value), now)
    loop.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9)
    loop.src.stop(now + 1)
    delete e.loops[name]
  }

  const ensure = () => {
    if (engine.current) return engine.current
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    const ctx = new Ctor()
    const master = ctx.createGain()
    master.gain.value = 0.0001
    master.connect(ctx.destination)
    const e: Engine = { ctx, master, buffers: {}, loops: {}, lastClick: 0 }
    engine.current = e
    for (const name of Object.keys(files) as SoundName[])
      void load(e, name, files[name]).then(() => {
        if (onRef.current && wanted.current.has(name)) startLoop(e, name)
      })
    return e
  }

  /** Fades everything in once the browser lets the page play sound, then starts the loops that belong here. */
  const wake = (e: Engine) =>
    e.ctx.resume().then(() => {
      if (!onRef.current || e.ctx.state !== 'running') return
      const now = e.ctx.currentTime
      e.master.gain.cancelScheduledValues(now)
      e.master.gain.setValueAtTime(Math.max(0.0001, e.master.gain.value), now)
      e.master.gain.exponentialRampToValueAtTime(MASTER, now + 0.9)
      for (const name of wanted.current) startLoop(e, name)
    })

  /** The visitor pressed the speaker button. */
  const setEnabled = (next: boolean) => {
    onRef.current = next
    setOn(next)
    writePref(next)
    const e = next ? ensure() : engine.current
    if (!e) return
    if (next) {
      void wake(e)
      return
    }
    const now = e.ctx.currentTime
    e.master.gain.cancelScheduledValues(now)
    e.master.gain.setValueAtTime(Math.max(0.0001, e.master.gain.value), now)
    e.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
    for (const name of Object.keys(e.loops) as SoundName[]) stopLoop(e, name)
  }

  // On phones the button waits until the visitor scrolls past the first screen, so it never sits on the hero buttons.
  useEffect(() => {
    const phone = window.matchMedia('(max-width: 639px)')
    const update = () => setTucked(phone.matches && window.scrollY < window.innerHeight * 0.7)
    update()
    window.addEventListener('scroll', update, { passive: true })
    phone.addEventListener('change', update)
    return () => {
      window.removeEventListener('scroll', update)
      phone.removeEventListener('change', update)
    }
  }, [])

  // Sound that starts on (from the CMS, or because the visitor left it on) begins with their first click, tap or key.
  useEffect(() => {
    const begin = () => {
      onRef.current = true
      setOn(true)
    }
    if (!(readPref() ?? startOn)) return
    begin()
    const stop = () => GESTURES.forEach((name) => window.removeEventListener(name, unlock, true))
    const unlock = () => {
      if (!onRef.current) return stop()
      const e = ensure()
      if (!e) return stop()
      void wake(e).then(() => {
        if (e.ctx.state === 'running') stop()
      })
    }
    GESTURES.forEach((name) => window.addEventListener(name, unlock, true))
    return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startOn])

  useEffect(() => {
    const onRequest = (event: Event) => {
      const { name, action } = (event as CustomEvent<SoundRequest>).detail
      const e = engine.current
      if (action === 'stop') {
        wanted.current.delete(name)
        if (e) stopLoop(e, name)
        return
      }
      if (action === 'start') wanted.current.add(name)
      if (!onRef.current || !e || e.ctx.state !== 'running') return
      if (action === 'start') {
        startLoop(e, name)
        return
      }
      if (playFile(e, name, false)) return
      if (name === 'sizzle') synthSizzle(e)
      else if (name === 'click') synthClick(e)
    }
    // Buttons and links tick softly while sound is on.
    const onPress = (event: PointerEvent) => {
      const e = engine.current
      if (!onRef.current || !e || e.ctx.state !== 'running' || event.button !== 0) return
      if (!(event.target as Element | null)?.closest?.('a[href], button')) return
      const now = performance.now()
      if (now - e.lastClick < 90) return
      e.lastClick = now
      if (!playFile(e, 'click', false)) synthClick(e)
    }
    window.addEventListener(SOUND_EVENT, onRequest)
    document.addEventListener('pointerdown', onPress, true)
    return () => {
      window.removeEventListener(SOUND_EVENT, onRequest)
      document.removeEventListener('pointerdown', onPress, true)
    }
  }, [])

  return (
    <button
      type="button"
      className="sound-toggle"
      aria-pressed={on}
      aria-label={on ? labels.off : labels.on}
      title={on ? labels.off : labels.on}
      onClick={() => setEnabled(!on)}
      data-on={on ? '' : undefined}
      data-tucked={tucked ? '' : undefined}
    >
      <Icon name={on ? 'soundOn' : 'soundOff'} size={20} />
      <span aria-hidden className="sound-toggle-bars">
        <i />
        <i />
        <i />
      </span>
    </button>
  )
}
