'use client'

import { useMemo, useState } from 'react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { CalcProduct } from '@/lib/calculator'
import './calculator.css'

type Labels = {
  product: string
  plates: string
  days: string
  perDay: string
  perMonth: string
  packs: string
  cartons: string
  kilos: string
  packages: string
  plateUnit: string
  dayUnit: string
  note: string
  send: string
  messageIntro: string
}

type Props = {
  products: CalcProduct[]
  labels: Labels
  /** "form": fill the request form on this page; otherwise the address of the page that has the form. */
  sendTo: 'form' | string
  /** The form's message box, when sendTo is "form". */
  messageField?: string
}

const fa = (n: number, digits = 0) => n.toLocaleString('fa-IR', { maximumFractionDigits: digits })
// The plates slider is gentle at the small end and quick at the big end: 10 to 3,000 plates a day.
const MIN = 10
const MAX = 3000
const toPlates = (v: number) => {
  const raw = MIN * Math.pow(MAX / MIN, v / 100)
  const step = raw < 100 ? 5 : raw < 500 ? 10 : raw < 1500 ? 50 : 100
  return Math.round(raw / step) * step
}
const toSlider = (plates: number) => (100 * Math.log(plates / MIN)) / Math.log(MAX / MIN)
/** A round number of packs per square: 1, 2 or 5 times a power of ten. */
const niceStep = (n: number) => {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(1, n))))
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= n) ?? p * 10
}

/**
 * «چقدر کره لازم دارید؟» The visitor chooses a butter, how many plates they serve a day and how many days
 * a month they work; the calculator shows the packs (or kilos) a day and a month, drawn as a tray of little
 * butter pats where each pat stands for a round number. The estimate can be sent with the request form.
 */
export function NeedsCalculator({ products, labels, sendTo, messageField = 'partnership-message' }: Props) {
  const [slug, setSlug] = useState(products[0]?.slug)
  const [slider, setSlider] = useState(toSlider(120))
  const [days, setDays] = useState(30)
  const product = products.find((p) => p.slug === slug) ?? products[0]
  const plates = toPlates(slider)

  const result = useMemo(() => {
    if (!product) return null
    if (product.mode === 'packs') {
      const day = plates * product.perPlate
      const month = day * days
      const cartons = product.packsPerCarton ? Math.ceil(month / product.packsPerCarton) : null
      return { day, month, unit: labels.packs, extra: cartons ? `${fa(cartons)} ${labels.cartons}` : null }
    }
    const day = (plates * product.grams) / 1000
    const month = day * days
    const packages = product.packageKg ? Math.ceil(month / product.packageKg) : null
    return { day, month, unit: labels.kilos, extra: packages ? `${fa(packages)} ${labels.packages}` : null }
  }, [product, plates, days, labels])

  if (!product || !result) return null
  const step = niceStep(result.month / 48)
  const cells = Math.min(60, Math.max(1, Math.ceil(result.month / step)))
  const digits = product.mode === 'weight' ? 1 : 0
  const summary = `${labels.messageIntro}: ${product.name}${product.brand ? ` (${product.brand})` : ''}، ${fa(plates)} ${labels.plateUnit} ${labels.perDay}، ${fa(days)} ${labels.dayUnit} ${labels.perMonth}؛ حدود ${fa(result.month, digits)} ${result.unit} ${labels.perMonth}${result.extra ? ` (${result.extra})` : ''}.`

  const send = () => {
    const box = document.getElementById(messageField) as HTMLTextAreaElement | null
    if (!box) return
    box.value = box.value.trim() ? `${box.value.trim()}\n${summary}` : summary
    box.dispatchEvent(new Event('input', { bubbles: true }))
    box.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    window.setTimeout(() => box.focus({ preventScroll: true }), 500)
  }

  return (
    <div className="calc">
      <div className="calc-inputs">
        {products.length > 1 ? (
          <fieldset className="calc-field">
            <legend>{labels.product}</legend>
            <div className="calc-chips">
              {products.map((p) => (
                <button key={p.slug} type="button" aria-pressed={p.slug === product.slug} onClick={() => setSlug(p.slug)}>
                  <Icon name={p.mode === 'packs' ? 'grid' : 'boxes'} size={15} />
                  {p.name}
                </button>
              ))}
            </div>
          </fieldset>
        ) : (
          <p className="calc-one">
            <Icon name={product.mode === 'packs' ? 'grid' : 'boxes'} size={16} />
            {product.name}
          </p>
        )}

        <label className="calc-field">
          <span className="calc-label">
            {labels.plates}
            <b>
              {fa(plates)} <small>{labels.plateUnit}</small>
            </b>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={slider}
            onChange={(e) => setSlider(Number(e.target.value))}
            aria-valuetext={`${fa(plates)} ${labels.plateUnit}`}
            style={{ '--fill': `${slider}%` } as React.CSSProperties}
          />
        </label>

        <label className="calc-field">
          <span className="calc-label">
            {labels.days}
            <b>
              {fa(days)} <small>{labels.dayUnit}</small>
            </b>
          </span>
          <input
            type="range"
            min={1}
            max={31}
            step={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            aria-valuetext={`${fa(days)} ${labels.dayUnit}`}
            style={{ '--fill': `${((days - 1) / 30) * 100}%` } as React.CSSProperties}
          />
        </label>
      </div>

      <div className="calc-out" aria-live="polite">
        <div className="calc-numbers">
          <p>
            <small>{labels.perMonth}</small>
            <strong>{fa(result.month, digits)}</strong>
            <span>{result.unit}</span>
          </p>
          <p className="calc-day">
            <small>{labels.perDay}</small>
            <strong>{fa(result.day, digits)}</strong>
            <span>{result.unit}</span>
          </p>
        </div>
        {result.extra ? <p className="calc-extra">≈ {result.extra}</p> : null}
        <div className="calc-tray" aria-hidden>
          {Array.from({ length: cells }, (_, i) => (
            <i key={i} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>
        <p className="calc-legend" aria-hidden>
          <i /> = {fa(step, digits)} {result.unit}
        </p>
        <p className="calc-note">{labels.note}</p>
        {sendTo === 'form' ? (
          <Button type="button" onClick={send} icon="arrowLeft" lead="send">
            {labels.send}
          </Button>
        ) : (
          <ButtonLink href={`${sendTo}?estimate=${encodeURIComponent(summary)}#form`} icon="arrowLeft" lead="send">
            {labels.send}
          </ButtonLink>
        )}
      </div>
    </div>
  )
}
