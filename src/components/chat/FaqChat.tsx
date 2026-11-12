'use client'

import { useEffect, useRef, useState } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { BRAND_MARK_PATH, BRAND_MARK_VIEWBOX } from '@/data/brand-mark'
import type { ChatLink, ChatNode } from '@/lib/chat-defaults'
import { emitSound } from '@/lib/sound'
import './chat.css'

type Labels = { log: string; ask: string; topics: string; restart: string; typing: string; you: string }

type Message = { id: number; from: 'bot' | 'you'; text: string; link?: ChatLink | null }


type Props = { topics: ChatNode[]; greeting: string; botName: string; labels: Labels }

/**
 * The frequent questions as a small chat. The visitor picks a question, the answer arrives after a short
 * "typing…" pause, and the follow-up questions of that answer are offered next, so a conversation can go
 * three levels deep. Questions already asked drop out of the offer. Everything stays inside the chat box:
 * the page itself never jumps.
 */
export function FaqChat({ topics, greeting, botName, labels }: Props) {
  const first: Message = { id: 0, from: 'bot', text: greeting }
  const [messages, setMessages] = useState<Message[]>([first])
  // The levels the visitor has walked down, from the main questions to the deepest follow-ups.
  const [levels, setLevels] = useState<ChatNode[][]>([topics])
  const [asked, setAsked] = useState<ReadonlySet<string>>(() => new Set())
  const [typing, setTyping] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const nextId = useRef(1)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Keep the newest message in view inside the box (never scroll the page itself).
  useEffect(() => {
    const log = logRef.current
    if (!log || messages.length < 2) return
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    log.scrollTo({ top: log.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }, [messages, typing])

  const ask = (node: ChatNode) => {
    if (typing) return
    const now = new Set(asked).add(node.question)
    setAsked(now)
    setMessages((list) => [...list, { id: nextId.current++, from: 'you', text: node.question }])
    setTyping(true)
    emitSound('click')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // A longer answer "takes" a little longer to write, within reason.
    const wait = still ? 0 : Math.min(1500, 520 + node.answer.length * 9)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setTyping(false)
      setMessages((list) => [...list, { id: nextId.current++, from: 'bot', text: node.answer, link: node.link }])
      // Go deeper when the answer has follow-ups. When a level runs out, step back up to the nearest level
      // that still has questions; when everything has been asked, offer the main questions again.
      const follow = (node.followUps ?? []).filter((n) => !now.has(n.question))
      setLevels((stack) => {
        if (follow.length) return [...stack, node.followUps ?? []]
        const next = [...stack]
        while (next.length > 1 && !next[next.length - 1].some((n) => !now.has(n.question))) next.pop()
        return next
      })
    }, wait)
  }

  const restart = () => {
    window.clearTimeout(timer.current)
    setTyping(false)
    setAsked(new Set())
    setMessages([first])
    setLevels([topics])
  }

  const level = levels[levels.length - 1]
  const open = level.filter((n) => !asked.has(n.question))
  // Everything asked: the main questions come back, so the chat never ends empty.
  const options = open.length ? open : levels.length === 1 ? topics : open
  const showTopicsChip = levels.length > 1

  return (
    <div className="chat-box">
      <div className="chat-bar">
        <span className="chat-av" aria-hidden>
          <Mark />
        </span>
        <span className="chat-who">
          <strong>{botName}</strong>
          <small>
            <i aria-hidden /> {labels.log}
          </small>
        </span>
        <button type="button" className="chat-restart" onClick={restart} disabled={messages.length < 2}>
          <Icon name="restart" size={16} />
          {labels.restart}
        </button>
      </div>

      <div ref={logRef} className="chat-log" role="log" aria-live="polite" aria-label={labels.log} data-lenis-prevent="">
        {messages.map((m) =>
          m.from === 'bot' ? (
            <div key={m.id} className="chat-msg chat-bot">
              <span className="chat-av" aria-hidden>
                <Mark />
              </span>
              <div className="chat-bubble">
                <p>{m.text}</p>
                {m.link?.href && m.link.label ? (
                  <ButtonLink href={m.link.href} size="sm" className="chat-link">
                    {m.link.label}
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          ) : (
            <div key={m.id} className="chat-msg chat-you">
              <span className="sr-only">{labels.you}: </span>
              <div className="chat-bubble">
                <p>{m.text}</p>
              </div>
            </div>
          ),
        )}
        {typing ? (
          <div className="chat-msg chat-bot">
            <span className="chat-av" aria-hidden>
              <Mark />
            </span>
            <div className="chat-typing">
              <i />
              <i />
              <i />
              <span className="sr-only">{labels.typing}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="chat-ask" role="group" aria-label={labels.ask}>
        {options.map((node, i) => (
          <button
            key={node.question}
            type="button"
            className="chat-chip"
            onClick={() => ask(node)}
            disabled={typing}
            style={{ '--i': i } as React.CSSProperties}
          >
            <Icon name={node.followUps?.length ? 'chat' : 'sparkle'} size={15} />
            {node.question}
          </button>
        ))}
        {showTopicsChip ? (
          <button
            type="button"
            className="chat-chip chat-chip-back"
            disabled={typing}
            onClick={() => setLevels([topics])}
          >
            <Icon name="grid" size={15} />
            {labels.topics}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function Mark() {
  return (
    <svg viewBox={`-40 -40 ${BRAND_MARK_VIEWBOX + 80} ${BRAND_MARK_VIEWBOX + 80}`} width={16} height={16}>
      <path d={BRAND_MARK_PATH} fill="currentColor" />
    </svg>
  )
}
