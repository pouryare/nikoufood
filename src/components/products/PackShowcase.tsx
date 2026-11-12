'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { emitSound } from '@/lib/sound'
import { PackScroll } from './PackScroll'
import { PeelLid } from './pack/PeelLid'

type Labels = {
  packTitle: string
  packLid: string
  packButter: string
  packTray: string
  peelTitle: string
  peelHint: string
  peelDone: string
  again: string
}

/**
 * The single-serve pack up close, on its product page: on one side the pack comes apart as you scroll and
 * its three parts are named; on the other, the visitor pulls the corner tab and peels the foil lid off the
 * butter themselves. «دوباره» puts the lid back on.
 */
export function PackShowcase({ labels }: { labels: Labels }) {
  const [open, setOpen] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  return (
    <div className="packshow">
      <figure className="packshow-card">
        <PackScroll
          className="packshow-stage"
          labels={{ lid: labels.packLid, butter: labels.packButter, tray: labels.packTray }}
        />
        <figcaption>
          <Icon name="box" size={16} />
          {labels.packTitle}
        </figcaption>
      </figure>

      <figure className="packshow-card">
        <div className="packshow-stage">
          <PeelLid
            hint={labels.peelHint}
            resetKey={resetKey}
            onDone={() => {
              setOpen(true)
              emitSound('click')
            }}
          />
        </div>
        {/* Once the lid is off, the caption cheers and offers to seal the pack again. */}
        <figcaption aria-live="polite">
          <Icon name="sparkle" size={16} />
          {open ? (
            <>
              <strong className="packshow-done">{labels.peelDone}</strong>
              <button
                type="button"
                className="packshow-again"
                onClick={() => {
                  setOpen(false)
                  setResetKey((k) => k + 1)
                }}
              >
                <Icon name="restart" size={15} />
                {labels.again}
              </button>
            </>
          ) : (
            labels.peelTitle
          )}
        </figcaption>
      </figure>
    </div>
  )
}
