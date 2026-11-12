'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitLead } from '@/app/actions/submit-lead'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import type { FormState, LeadType } from '@/lib/forms'

export type LeadFormProps = {
  type: LeadType
  /** Fields in the order they appear. */
  fields: ('fullName' | 'mobile' | 'province' | 'company' | 'businessType' | 'email' | 'message')[]
  provinces?: { slug: string; name: string }[]
  defaultProvince?: string
  businessTypes?: string[]
  sourcePage: string
  labels: {
    fullName: string
    mobile: string
    province: string
    provincePlaceholder: string
    company: string
    businessType: string
    businessTypePlaceholder: string
    email: string
    message: string
    optional: string
    sending: string
    sendAnother: string
    fixErrors: string
  }
  copy: { title?: string | null; intro?: string | null; submitLabel?: string | null; successTitle?: string | null; successMessage?: string | null; privacyNote?: string | null }
  /** Text the message box starts with, e.g. an estimate from the needs calculator. */
  initialMessage?: string
}

const OPTIONAL: LeadFormProps['fields'] = ['company', 'businessType', 'email']
const idle: FormState = { status: 'idle' }

/** One form for the three public requests. The server checks everything again; this only makes mistakes easy to fix. */
export function LeadForm(props: LeadFormProps) {
  const [round, setRound] = useState(0)
  return <Form key={round} {...props} onAgain={() => setRound((n) => n + 1)} />
}

function Form({ type, fields, provinces = [], defaultProvince, businessTypes = [], sourcePage, labels, copy, initialMessage, onAgain }: LeadFormProps & { onAgain: () => void }) {
  const [state, formAction, pending] = useActionState(submitLead.bind(null, type), idle)
  const startedAt = useRef(0)
  // The page is rendered on the server, so the moment the visitor can actually start typing is noted here.
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])
  // The timestamp is added when sending, because React empties uncontrolled hidden inputs after each submit.
  const send = (formData: FormData) => {
    formData.set('startedAt', String(startedAt.current))
    return formAction(formData)
  }

  if (state.status === 'success') {
    return (
      <div role="status" className="panel flex flex-col items-center gap-5 px-6 py-14 text-center">
        <span className="grid size-14 place-items-center rounded-full border border-gold/50 text-gold">
          <Icon name="check" size={26} />
        </span>
        <h2 className="text-h3">{copy.successTitle}</h2>
        <p className="max-w-md text-muted">{copy.successMessage}</p>
        <button type="button" onClick={onAgain} className="text-gold underline underline-offset-4">
          {labels.sendAnother}
        </button>
      </div>
    )
  }

  const errors = state.status === 'error' ? (state.fieldErrors ?? {}) : {}
  const values = state.status === 'error' ? (state.values ?? {}) : {}
  const labelOf = (name: string) => labels[name as keyof typeof labels] as string

  return (
    <form action={send} noValidate className="panel grid gap-6 p-6 md:p-10">
      {copy.title ? <h2 className="text-h3">{copy.title}</h2> : null}
      {copy.intro ? <p className="-mt-3 text-muted">{copy.intro}</p> : null}

      <input type="hidden" name="sourcePage" value={sourcePage} />
      {/* A field only robots fill in. */}
      <div aria-hidden className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label>
          website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {fields.map((name) => {
        const error = errors[name]
        const id = `${type}-${name}`
        const common = { id, name, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? `${id}-err` : undefined, className: cn('field', error && 'field-error') }
        return (
          <div key={name} className="grid gap-2">
            <label htmlFor={id} className="text-small font-bold">
              {labelOf(name)}
              {OPTIONAL.includes(name) ? <span className="ms-2 font-normal text-muted">({labels.optional})</span> : null}
            </label>
            {name === 'message' ? (
              <textarea {...common} rows={5} defaultValue={values[name] ?? initialMessage ?? ''} />
            ) : name === 'province' ? (
              <select {...common} defaultValue={values[name] ?? defaultProvince ?? ''}>
                <option value="">{labels.provincePlaceholder}</option>
                {provinces.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : name === 'businessType' ? (
              <select {...common} defaultValue={values[name] ?? ''}>
                <option value="">{labels.businessTypePlaceholder}</option>
                {businessTypes.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            ) : (
              <input
                {...common}
                type={name === 'email' ? 'email' : name === 'mobile' ? 'tel' : 'text'}
                inputMode={name === 'mobile' ? 'numeric' : name === 'email' ? 'email' : undefined}
                autoComplete={name === 'fullName' ? 'name' : name === 'mobile' ? 'tel' : name === 'email' ? 'email' : name === 'company' ? 'organization' : 'off'}
                dir={name === 'mobile' || name === 'email' ? 'ltr' : undefined}
                defaultValue={values[name] ?? ''}
                placeholder={name === 'mobile' ? '۰۹۱۲۳۴۵۶۷۸۹' : undefined}
                className={cn(common.className, (name === 'mobile' || name === 'email') && 'text-start')}
              />
            )}
            {error ? (
              <p id={`${id}-err`} className="text-small text-[#ff8a8a]">
                {error}
              </p>
            ) : null}
          </div>
        )
      })}

      {state.status === 'error' && (state.message || Object.keys(errors).length) ? (
        <p role="alert" className="rounded-md border border-[#ff8a8a]/40 bg-[#ff8a8a]/10 px-4 py-3 text-small text-[#ffb3b3]">
          {state.message ?? labels.fixErrors}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="form-submit">
        {pending ? labels.sending : copy.submitLabel}
        {!pending ? <Icon name="arrowLeft" size={18} /> : null}
      </button>
      {copy.privacyNote ? <p className="text-center text-small text-muted">{copy.privacyNote}</p> : null}
    </form>
  )
}
