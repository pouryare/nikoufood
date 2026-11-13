'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { MusicFiles, SoundFiles } from '@/lib/effects'
import { isMood, moodOfPath, type Mood } from '@/lib/moods'
import { Music } from '@/lib/music'
import { FILE_LEVEL, MIN_GAP, SYNTHS } from '@/lib/sfx'
import { SOUND_EVENT, emitSound, type SoundRequest } from '@/lib/sound'
import { MICRO_SOUNDS, type SoundName } from '@/lib/sound-names'

const STORE_KEY = 'nk-sound'
/** Everything is quiet on purpose: the loudest sound peaks well below full volume and always fades in. */
const MASTER = 0.55

type Engine = {
  ctx: AudioContext
  master: GainNode
  /** The small sounds and the looping scenes (farm, milk) go through here: the CMS sets how loud. */
  sfx: GainNode
  /** The background music (null while it is switched off in the CMS). */
  music: Music | null
  buffers: Partial<Record<SoundName, AudioBuffer | null>>
  loops: Partial<Record<SoundName, { src: AudioBufferSourceNode; gain: GainNode }>>
  lastAt: Partial<Record<SoundName, number>>
  /** The moods whose uploaded song has been asked for already. */
  songs: Set<Mood>
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
  gain.gain.exponentialRampToValueAtTime(FILE_LEVEL[name], now + (loop ? 1.4 : 0.25))
  src.connect(gain).connect(e.sfx)
  src.start(now)
  if (!loop) {
    const end = now + buffer.duration
    gain.gain.setValueAtTime(FILE_LEVEL[name], Math.max(now + 0.3, end - 0.6))
    gain.gain.exponentialRampToValueAtTime(0.0001, end)
  }
  return { src, gain }
}

/** Fetches the song an editor uploaded for a mood, once, and hands it to the music. */
function loadSong(e: Engine, mood: Mood, songs: MusicFiles) {
  const url = songs[mood]
  if (!url || !e.music || e.songs.has(mood)) return
  e.songs.add(mood)
  fetch(url)
    .then((res) => res.arrayBuffer())
    .then((data) => e.ctx.decodeAudioData(data))
    .then((buffer) => e.music?.setFile(mood, buffer))
    .catch(() => e.songs.delete(mood))
}

type Props = {
  files: SoundFiles
  /** Songs the editor uploaded for a part of the page; a part without one gets the generated music. */
  musicFiles: MusicFiles
  labels: { on: string; off: string }
  /** Sound is on for visitors who never pressed the button (set in the CMS). */
  startOn: boolean
  /** Background music that follows the section on screen (CMS switch). */
  music: boolean
  /** The small sound for each interaction (CMS switch). */
  micro: boolean
  /** 0 to 100, from the CMS. */
  musicVolume: number
  sfxVolume: number
}

/** Browsers let a page make sound only after one of these: the first one starts the sound. */
const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'] as const
/** What counts as something to touch: links, buttons and the like. */
const TOUCHABLE = 'a[href], button, [role="button"], summary'

/**
 * The speaker button and the small sound engine behind it. Whether sound starts on comes from
 * the CMS, and the visitor's own choice (remembered on that device) wins over it. Browsers stay
 * silent until the visitor's first click, tap or key press, so that is when the sound fades in.
 *
 * Three kinds of sound live here:
 * - the background music, which follows the section in the middle of the screen (sections carry
 *   `data-mood`; a page without any gets the mood of its address) and changes by crossfading;
 * - the small sounds for little interactions: touching a link or button, the mouse reaching one, a slider,
 *   a menu or sheet opening and closing (whenever the page is locked from scrolling), moving to another page;
 * - the scenes other parts of the page ask for with `emitSound()` (a looping farm, the sizzle, a success …).
 * While sound is off all of them are ignored, except that the page remembers which looping sound belongs
 * where the visitor is, so it can start that one as soon as sound comes on.
 */
export function SoundToggle({ files, musicFiles, labels, startOn, music, micro, musicVolume, sfxVolume }: Props) {
  const pathname = usePathname()
  const [on, setOn] = useState(false)
  const [tucked, setTucked] = useState(false)
  const engine = useRef<Engine | null>(null)
  const onRef = useRef(false)
  /** The looping sounds the page is asking for right now (e.g. the farm while its scene is on screen). */
  const wanted = useRef(new Set<SoundName>())
  /** The mood of the part of the page the visitor is on. */
  const moodRef = useRef<Mood>(moodOfPath(pathname))

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

  /** Plays one short sound: an uploaded file if there is one, otherwise the one the browser makes. */
  const playSfx = (e: Engine, name: SoundName) => {
    if (!micro && MICRO_SOUNDS.includes(name)) return
    const now = performance.now()
    if (now - (e.lastAt[name] ?? -1e9) < (MIN_GAP[name] ?? 0)) return
    e.lastAt[name] = now
    if (playFile(e, name, false)) return
    SYNTHS[name]?.(e.ctx, e.sfx)
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
    const sfx = ctx.createGain()
    sfx.gain.value = sfxVolume / 70
    sfx.connect(master)
    const bed = music ? new Music(ctx, master) : null
    bed?.setLevel((musicVolume / 100) * 1.15)
    bed?.setMood(moodRef.current)
    const e: Engine = { ctx, master, sfx, music: bed, buffers: {}, loops: {}, lastAt: {}, songs: new Set() }
    engine.current = e
    loadSong(e, moodRef.current, musicFiles)
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
      if (!document.hidden) e.music?.start()
    })

  /** The visitor pressed the speaker button. */
  const setEnabled = (next: boolean) => {
    onRef.current = next
    setOn(next)
    writePref(next)
    const e = next ? ensure() : engine.current
    if (!e) return
    if (next) {
      // a small "on" blip so they know it worked
      void wake(e).then(() => onRef.current && e.ctx.state === 'running' && playSfx(e, 'pop'))
      return
    }
    const now = e.ctx.currentTime
    e.master.gain.cancelScheduledValues(now)
    e.master.gain.setValueAtTime(Math.max(0.0001, e.master.gain.value), now)
    e.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
    e.music?.stop()
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

  // The scenes and small sounds other parts of the page ask for, and the little sounds of touching things.
  useEffect(() => {
    const running = () => {
      const e = engine.current
      return onRef.current && e && e.ctx.state === 'running' ? e : null
    }
    const onRequest = (event: Event) => {
      const { name, action } = (event as CustomEvent<SoundRequest>).detail
      const e = engine.current
      if (action === 'stop') {
        wanted.current.delete(name)
        if (e) stopLoop(e, name)
        return
      }
      if (action === 'start') wanted.current.add(name)
      const live = running()
      if (!live) return
      if (action === 'start') startLoop(live, name)
      else playSfx(live, name)
    }
    // Buttons and links tick softly while sound is on.
    const onPress = (event: PointerEvent) => {
      const e = running()
      if (!e || event.button !== 0 || !(event.target as Element | null)?.closest?.(TOUCHABLE)) return
      playSfx(e, 'click')
    }
    // The mouse arriving at a button or link (never with a finger: it has no "arriving").
    let over: Element | null = null
    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const target = (event.target as Element | null)?.closest?.(TOUCHABLE) ?? null
      if (target === over) return
      over = target
      const e = running()
      if (e && target && !target.matches('[disabled], [aria-disabled="true"]')) playSfx(e, 'hover')
    }
    // Sliders, tick boxes, choice lists.
    const onTick = (event: Event) => {
      const input = event.target as HTMLInputElement | null
      if (!input?.matches?.('input[type="range"], input[type="checkbox"], input[type="radio"], select')) return
      if (event.type === 'input' && input.type !== 'range') return
      const e = running()
      if (e) playSfx(e, 'tick')
    }
    // A menu or a game sheet locks the page from scrolling: that is when it opens, and when it closes.
    let locked = document.body.style.overflow === 'hidden'
    const watch = new MutationObserver(() => {
      const now = document.body.style.overflow === 'hidden'
      if (now === locked) return
      locked = now
      emitSound(now ? 'open' : 'close')
    })
    watch.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    window.addEventListener(SOUND_EVENT, onRequest)
    document.addEventListener('pointerdown', onPress, true)
    document.addEventListener('pointerover', onOver, true)
    document.addEventListener('input', onTick, true)
    document.addEventListener('change', onTick, true)
    return () => {
      watch.disconnect()
      window.removeEventListener(SOUND_EVENT, onRequest)
      document.removeEventListener('pointerdown', onPress, true)
      document.removeEventListener('pointerover', onOver, true)
      document.removeEventListener('input', onTick, true)
      document.removeEventListener('change', onTick, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micro, sfxVolume])

  // Moving to another page: air passing (not on the first page the visitor lands on).
  const lastPath = useRef(pathname)
  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    emitSound('whoosh')
  }, [pathname])

  // The music follows the part of the page in the middle of the screen.
  useEffect(() => {
    if (!music) return
    document.documentElement.dataset.soundMood = moodRef.current
    let frame = 0
    let seen = false
    const probe = () => {
      frame = 0
      const middle = window.innerHeight * 0.5
      let found: Mood | null = null
      // Later elements are inside or after earlier ones, so the last match is the most specific one.
      for (const el of document.querySelectorAll<HTMLElement>('[data-mood]')) {
        const box = el.getBoundingClientRect()
        const id = el.dataset.mood
        if (box.top <= middle && box.bottom > middle && isMood(id)) found = id
      }
      // Below the last section (the footer) the music simply stays as it was; a page with no tagged section at
      // all takes its mood from its address.
      if (found) seen = true
      const mood = found ?? (seen ? moodRef.current : moodOfPath(pathname))
      if (mood === moodRef.current) return
      moodRef.current = mood
      document.documentElement.dataset.soundMood = mood
      const e = engine.current
      if (!e) return
      e.music?.setMood(mood)
      loadSong(e, mood, musicFiles)
    }
    const ask = () => {
      if (!frame) frame = requestAnimationFrame(probe)
    }
    ask()
    // A page can grow after it loads (images, fonts), so look again every so often too.
    const again = window.setInterval(ask, 800)
    window.addEventListener('scroll', ask, { passive: true })
    window.addEventListener('resize', ask)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.clearInterval(again)
      window.removeEventListener('scroll', ask)
      window.removeEventListener('resize', ask)
    }
  }, [music, pathname, musicFiles])

  // A tab in the background goes quiet and comes back when the visitor does.
  useEffect(() => {
    const change = () => {
      const e = engine.current
      if (!e?.music || !onRef.current || e.ctx.state !== 'running') return
      if (document.hidden) e.music.stop()
      else e.music.start()
    }
    document.addEventListener('visibilitychange', change)
    return () => document.removeEventListener('visibilitychange', change)
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
