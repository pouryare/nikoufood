'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { emitSound } from '@/lib/sound'
import { ButterRice } from './ButterRice'
import './butter-rice-toy.css'

type Props = {
  title?: string | null
  hint: string
  doneText: string
  progressLabel: string
  againLabel: string
  /** "band": text beside the plate (table section); "stack": text under the plate (page not found). */
  layout?: 'band' | 'stack'
}

/**
 * The little game around the buttered rice: a title and hint, a gold bar that fills as the rice takes
 * butter, «نوش جان!» when it is done, and a button for a fresh plate.
 */
export function ButterRiceToy({ title, hint, doneText, progressLabel, againLabel, layout = 'band' }: Props) {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)
  const [round, setRound] = useState(0)
  const fa = (n: number) => Math.round(n).toLocaleString('fa-IR')

  return (
    <div className="brt" data-layout={layout} data-done={done ? '' : undefined}>
      <div className="brt-copy">
        {title ? <h3 className="brt-title">{title}</h3> : null}
        <p className="brt-hint">
          <Icon name="sparkle" size={16} />
          {hint}
        </p>
        <div className="brt-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={progressLabel}>
          <span style={{ transform: `scaleX(${Math.min(1, pct / 70).toFixed(3)})` }} />
        </div>
        <p className="brt-status" aria-live="polite">
          {done ? <strong>{doneText}</strong> : `${fa(Math.min(100, (pct / 70) * 100))}٪ ${progressLabel}`}
        </p>
        <button
          type="button"
          className="brt-again"
          onClick={() => {
            setDone(false)
            setPct(0)
            setRound((r) => r + 1)
          }}
        >
          <Icon name="restart" size={16} />
          {againLabel}
        </button>
      </div>
      <div className="brt-plate" data-cursor="none">
        <ButterRice
          resetKey={round}
          label={hint}
          onProgress={setPct}
          onDone={() => {
            setDone(true)
            emitSound('sizzle')
          }}
        />
      </div>
    </div>
  )
}
