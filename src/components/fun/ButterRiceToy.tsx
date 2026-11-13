'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@/components/ui/Icon'
import { emitSound } from '@/lib/sound'
import { ButterRice } from './ButterRice'
import './butter-rice-toy.css'

type Props = {
  title?: string | null
  hint: string
  /** The three short steps shown beside the plate («بزنید و نگه دارید» › «بکشید» › «نوش جان»). */
  steps: [string, string, string]
  doneText: string
  progressLabel: string
  againLabel: string
  /** The small label that points at where to start dragging. */
  guideLabel: string
  /** The button that opens the play sheet on phones. */
  startLabel: string
  closeLabel: string
  /** "band": text beside the plate (table section); "stack": text under the plate (page not found). */
  layout?: 'band' | 'stack'
}

const PHOTO = '/fun/chelow-kabab.webp'

/** True on phones and tablets (a finger, not a mouse). It is false while the page is built on the server. */
const useTouchScreen = () =>
  useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia('(pointer: coarse)')
      query.addEventListener('change', notify)
      return () => query.removeEventListener('change', notify)
    },
    () => window.matchMedia('(pointer: coarse)').matches,
    () => false,
  )

const noop = () => () => {}
/** False while the page is built on the server and during hydration, true afterwards in the browser. */
const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )

/**
 * The little game around the buttered rice: three short steps, a gold bar that fills as the rice takes
 * butter, «نوش جان!» when it is done, and a button for a fresh plate.
 *
 * With a mouse the plate sits right there on the page. With a finger it would swallow every swipe (the
 * plate fills the screen width, so the page could no longer be scrolled past it), so on phones the page
 * shows the plate with a «شروع کنید» button, and the game itself opens in its own full-screen sheet where
 * the page is held still, the plate is big and the butter is drawn just above the fingertip.
 */
export function ButterRiceToy({ title, hint, steps, doneText, progressLabel, againLabel, guideLabel, startLabel, closeLabel, layout = 'band' }: Props) {
  const touch = useTouchScreen()
  const hydrated = useHydrated()
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)
  const [round, setRound] = useState(0)
  const [started, setStarted] = useState(false)
  const [open, setOpen] = useState(false)
  const opener = useRef<HTMLButtonElement>(null)
  const closer = useRef<HTMLButtonElement>(null)
  const fa = (n: number) => Math.round(n).toLocaleString('fa-IR')
  const fill = Math.min(1, pct / 70)

  const fresh = useCallback(() => {
    setDone(false)
    setPct(0)
    setStarted(false)
    setRound((r) => r + 1)
  }, [])
  const openSheet = () => {
    fresh()
    setOpen(true)
  }
  const closeSheet = useCallback(() => {
    setOpen(false)
    opener.current?.focus({ preventScroll: true })
  }, [])

  // While the sheet is open the page is held still (the smooth scroller pauses when the body is locked),
  // and Escape closes it.
  useEffect(() => {
    if (!open) return
    const body = document.body
    const before = body.style.overflow
    body.style.overflow = 'hidden'
    closer.current?.focus({ preventScroll: true })
    const key = (e: KeyboardEvent) => e.key === 'Escape' && closeSheet()
    window.addEventListener('keydown', key)
    return () => {
      body.style.overflow = before
      window.removeEventListener('keydown', key)
    }
  }, [open, closeSheet])
  // Turning the phone, or leaving touch mode, never leaves the sheet stuck open.
  useEffect(() => {
    if (!touch && open) {
      const t = requestAnimationFrame(() => setOpen(false))
      return () => cancelAnimationFrame(t)
    }
  }, [touch, open])

  // Which of the three steps the visitor is on: touch the plate, then spread, then the bar fills up.
  const step = done ? 3 : pct >= 45 ? 2 : started ? 1 : 0

  const stepList = (compact?: boolean) => (
    <ol className="brt-steps" data-compact={compact ? '' : undefined}>
      {steps.map((text, i) => (
        <li key={i} data-state={i < step ? 'done' : i === step ? 'now' : undefined}>
          <b aria-hidden>{fa(i + 1)}</b>
          <span>{text}</span>
        </li>
      ))}
    </ol>
  )
  const meter = (
    <>
      <div className="brt-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(fill * 100)} aria-label={progressLabel}>
        <span style={{ transform: `scaleX(${fill.toFixed(3)})` }} />
      </div>
      <p className="brt-status" aria-live="polite">
        {done ? <strong>{doneText}</strong> : `${fa(fill * 100)}٪ ${progressLabel}`}
      </p>
    </>
  )
  const again = (
    <button type="button" className="brt-again" onClick={touch && !open ? openSheet : fresh}>
      <Icon name="restart" size={16} />
      {againLabel}
    </button>
  )
  const canvas = (
    <ButterRice
      resetKey={round}
      label={hint}
      guide={guideLabel}
      touch={touch}
      onStart={() => setStarted(true)}
      onProgress={setPct}
      onDone={() => {
        setDone(true)
        emitSound('success')
        emitSound('sizzle')
      }}
    />
  )

  return (
    <div className="brt" data-layout={layout} data-done={done ? '' : undefined}>
      <div className="brt-copy">
        {title ? <h3 className="brt-title">{title}</h3> : null}
        <p className="brt-hint">
          <Icon name="sparkle" size={16} />
          {hint}
        </p>
        {stepList()}
        {meter}
        {done || (touch && pct > 0) ? again : null}
      </div>

      {!hydrated ? (
        <div className="brt-plate" />
      ) : touch ? (
        <>
          {/* On a phone the page only shows the plate; a tap opens the game in its own sheet. */}
          <button ref={opener} type="button" className="brt-preview" onClick={openSheet} aria-label={`${startLabel}: ${hint}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a plain picture of the plate, nothing to optimise */}
            <img src={PHOTO} alt="" width={560} height={560} draggable={false} />
            <span className="brt-start">
              <Icon name="play" size={16} />
              {startLabel}
            </span>
          </button>
          {open
            ? createPortal(
                <div className="brt-sheet" role="dialog" aria-modal="true" aria-label={title || hint}>
                  <div className="brt-sheet-bar">
                    <strong>{title || hint}</strong>
                    <button ref={closer} type="button" className="brt-close" onClick={closeSheet} aria-label={closeLabel}>
                      <Icon name="close" size={20} />
                    </button>
                  </div>
                  {stepList(true)}
                  <div className="brt-sheet-plate" data-lenis-prevent="" data-cursor="none">
                    {canvas}
                  </div>
                  <div className="brt-sheet-foot">
                    {meter}
                    {done ? (
                      <div className="brt-sheet-actions">
                        {again}
                        <button type="button" className="brt-again" data-primary="" onClick={closeSheet}>
                          {closeLabel}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>,
                document.body,
              )
            : null}
        </>
      ) : (
        <div className="brt-plate" data-cursor="none">
          {hydrated ? canvas : null}
        </div>
      )}
    </div>
  )
}
