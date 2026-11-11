'use client'

import { AnimatePresence, m } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { Channel } from '@/lib/channels'

type Props = { channels: Channel[]; label: string; closeLabel: string }

/**
 * One quiet floating button that opens the direct-contact channels (WhatsApp, Telegram, Bale, Eitaa, phone).
 * No pop-ups, no auto-opening: it only reacts when the visitor asks.
 */
export function MessengerDock({ channels, label, closeLabel }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  if (channels.length === 0) return null

  return (
    <div ref={rootRef} className="fixed end-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:end-6 sm:bottom-6">
      <AnimatePresence>
        {open ? (
          <m.ul
            key="list"
            id="messenger-dock"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            style={{ transformOrigin: 'bottom left' }}
            className="panel min-w-56 overflow-hidden p-2 shadow-float"
          >
            {channels.map((c) => (
              <li key={c.key}>
                <a
                  href={c.href}
                  {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-small font-bold text-ink transition-colors duration-150 hover:bg-white/[0.06] hover:text-gold"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-full border border-line text-gold">
                    <Icon name={c.icon} size={18} />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span>{c.label}</span>
                    <span dir="ltr" className="text-micro font-normal text-muted">
                      {c.display}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </m.ul>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="messenger-dock"
        aria-label={open ? closeLabel : label}
        className="inline-flex size-14 items-center justify-center rounded-full bg-gold text-bg shadow-[0_18px_40px_-12px_var(--nk-gold)] transition-transform duration-200 ease-out-quart hover:scale-105 active:scale-95"
      >
        <Icon name={open ? 'close' : 'chat'} size={24} strokeWidth={1.8} />
      </button>
    </div>
  )
}
