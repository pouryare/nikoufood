'use client'

import { AnimatePresence, m } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { SmartLink } from '@/components/ui/SmartLink'
import { cn } from '@/lib/cn'

export type NavItem = { label: string; href: string }

type Props = {
  brandName: string
  latinName?: string | null
  /** The logo is rendered on the server and passed in, so it can be the animated vector or a CMS image. */
  logo: ReactNode
  links: NavItem[]
  cta?: { label?: string | null; href?: string | null } | null
  labels: { menu: string; close: string }
  /** Optional quick contact shown at the bottom of the mobile menu. */
  phone?: { href: string; display: string } | null
}

const isActive = (pathname: string, href: string) => href !== '/' && (pathname === href || pathname.startsWith(`${href}/`))

export function Header({ brandName, latinName, logo, links, cta, labels, phone }: Props) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Solid background once the page moves; slide away while reading down, return on the way up.
  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    const update = () => {
      const y = window.scrollY
      setScrolled(y > 16)
      if (y > 480 && y > last + 6) setHidden(true)
      else if (y < last - 6 || y <= 480) setHidden(false)
      last = y
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname])

  // While the menu is open: lock page scroll, close on Escape, keep keyboard focus inside.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = [toggleRef.current, ...panelRef.current.querySelectorAll<HTMLElement>('a[href], button')].filter(
        Boolean,
      ) as HTMLElement[]
      const first = focusables[0]
      const lastEl = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[transform,background-color,border-color] duration-500 ease-out-expo',
          hidden && !open ? '-translate-y-full' : 'translate-y-0',
          scrolled || open ? 'border-line/70 bg-bg/90 backdrop-blur-md' : 'border-transparent bg-transparent',
        )}
      >
        <div className="wrap flex h-(--header-h) items-center justify-between gap-6">
          <Link href="/" aria-label={brandName} className="flex items-center gap-3">
            {logo}
            <span className="flex flex-col leading-none">
              <span className="font-display text-[1.32rem] font-extrabold whitespace-nowrap text-ink">{brandName}</span>
              {latinName ? (
                <span dir="ltr" className="mt-1.5 font-latin text-[0.6rem] font-bold tracking-[0.46em] text-muted uppercase">
                  {latinName}
                </span>
              ) : null}
            </span>
          </Link>

          <nav aria-label={labels.menu} className="hidden xl:block">
            <ul className="flex items-center gap-8">
              {links.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <li key={item.href}>
                    <SmartLink
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'nav-link text-[0.96rem] font-bold transition-colors duration-200',
                        active ? 'text-gold' : 'text-ink/85 hover:text-ink',
                      )}
                    >
                      {item.label}
                    </SmartLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {cta?.label ? (
              <div className="hidden sm:block">
                <ButtonLink href={cta.href} size="sm" icon={false}>
                  {cta.label}
                </ButtonLink>
              </div>
            ) : null}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? labels.close : labels.menu}
              className="inline-flex size-11 items-center justify-center rounded-md border border-line bg-white/[0.03] text-ink transition-colors duration-200 hover:border-gold/60 hover:text-gold active:scale-95 xl:hidden"
            >
              <Icon name={open ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <m.div
            key="mobile-menu"
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={labels.menu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-40 overflow-y-auto bg-bg xl:hidden"
          >
            <div className="wrap flex min-h-full flex-col pt-[calc(var(--header-h)+1.5rem)] pb-10">
              <nav aria-label={labels.menu}>
                <ul>
                  {links.map((item, i) => {
                    const active = isActive(pathname, item.href)
                    return (
                      <m.li
                        key={item.href}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.05 + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                        className="border-b border-line/60"
                      >
                        <SmartLink
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'flex items-center justify-between py-4 font-display text-[1.6rem] font-extrabold',
                            active ? 'text-gold' : 'text-ink',
                          )}
                        >
                          <span>{item.label}</span>
                          <Icon name="arrowLeft" size={22} className="text-muted" />
                        </SmartLink>
                      </m.li>
                    )
                  })}
                </ul>
              </nav>
              <m.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + links.length * 0.045, ease: [0.16, 1, 0.3, 1] }}
                className="mt-auto flex flex-col gap-3 pt-10"
              >
                {cta?.label ? (
                  <ButtonLink href={cta.href} size="lg" className="w-full">
                    {cta.label}
                  </ButtonLink>
                ) : null}
                {phone ? (
                  <ButtonLink href={phone.href} variant="outline" size="lg" icon="phone" className="w-full">
                    <span dir="ltr">{phone.display}</span>
                  </ButtonLink>
                ) : null}
              </m.div>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
