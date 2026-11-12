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

const readPref = () => {
  try {
    return window.localStorage.getItem(STORE_KEY) === '1'
  } catch {
    return false
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

type Props = { files: SoundFiles; labels: { on: string; off: string } }

/**
 * The speaker button and the small sound engine behind it. Sound is off until the visitor
 * presses the button (the choice is remembered on that device). Other parts of the page ask
 * for sounds with `emitSound()`; those requests are simply ignored while sound is off.
 */
export function SoundToggle({ files, labels }: Props) {
  const [on, setOn] = useState(false)
  const [tucked, setTucked] = useState(false)
  const engine = useRef<Engine | null>(null)
  const onRef = useRef(false)

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
    engine.current = { ctx, master, buffers: {}, loops: {}, lastClick: 0 }
    for (const name of Object.keys(files) as SoundName[])
      void load(engine.current, name, files[name])
    return engine.current
  }

  const setEnabled = (next: boolean) => {
    onRef.current = next
    setOn(next)
    writePref(next)
    const e = next ? ensure() : engine.current
    if (!e) return
    const now = e.ctx.currentTime
    if (next) void e.ctx.resume()
    e.master.gain.cancelScheduledValues(now)
    e.master.gain.setValueAtTime(Math.max(0.0001, e.master.gain.value), now)
    e.master.gain.exponentialRampToValueAtTime(next ? MASTER : 0.0001, now + (next ? 0.9 : 0.4))
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

  // A visitor who turned sound on before gets it back after their first tap or click on the page.
  useEffect(() => {
    if (!readPref()) return
    const resume = () => setEnabled(true)
    window.addEventListener('pointerdown', resume, { once: true })
    return () => window.removeEventListener('pointerdown', resume)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onRequest = (event: Event) => {
      const { name, action } = (event as CustomEvent<SoundRequest>).detail
      const e = engine.current
      if (!onRef.current || !e) return
      if (action === 'stop') {
        const loop = e.loops[name]
        if (!loop) return
        const now = e.ctx.currentTime
        loop.gain.gain.cancelScheduledValues(now)
        loop.gain.gain.setValueAtTime(Math.max(0.0001, loop.gain.gain.value), now)
        loop.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9)
        loop.src.stop(now + 1)
        delete e.loops[name]
        return
      }
      if (action === 'start') {
        if (e.loops[name]) return
        const loop = playFile(e, name, true)
        if (loop) e.loops[name] = loop
        return
      }
      if (playFile(e, name, false)) return
      if (name === 'sizzle') synthSizzle(e)
      else if (name === 'click') synthClick(e)
    }
    // Buttons and links tick softly while sound is on.
    const onPress = (event: PointerEvent) => {
      const e = engine.current
      if (!onRef.current || !e || event.button !== 0) return
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
