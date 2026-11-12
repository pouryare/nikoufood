import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { iconForHref } from '@/lib/icons'
import { Icon, type IconName } from './Icon'
import { SmartLink } from './SmartLink'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'group/btn relative inline-flex shrink-0 items-center justify-center gap-2.5 rounded-md font-bold whitespace-nowrap select-none ' +
  'transition-[transform,background-color,color,border-color,box-shadow] duration-200 ease-out-quart ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-gold text-bg shadow-[0_14px_40px_-14px_var(--nk-gold)] hover:bg-cream',
  outline: 'border border-line bg-white/[0.03] text-ink hover:border-gold/70 hover:text-gold',
  ghost: 'text-ink hover:text-gold',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-small',
  md: 'h-12 px-6 text-[0.98rem]',
  lg: 'h-14 px-8 text-[1.05rem]',
}

type Common = {
  variant?: Variant
  size?: Size
  icon?: IconName | false
  /** A small picture before the words, e.g. a box for «محصولات». Links pick one from where they go. */
  lead?: IconName | false | null
  className?: string
  children: ReactNode
}

/** The arrow points left because in a right-to-left page "forward" is to the left. */
function Content({ children, icon, lead }: { children: ReactNode; icon: IconName | false; lead?: IconName | false | null }) {
  return (
    <>
      {lead ? <Icon name={lead} size={18} className="btn-lead shrink-0 opacity-85" /> : null}
      <span>{children}</span>
      {icon ? (
        <Icon
          name={icon}
          size={18}
          className="btn-tail transition-transform duration-300 ease-out-expo group-hover/btn:-translate-x-1 motion-reduce:transition-none"
        />
      ) : null}
    </>
  )
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  icon = 'arrowLeft',
  lead,
  className,
  children,
  ...rest
}: Common & { href?: string | null } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>) {
  if (!children) return null
  return (
    <SmartLink href={href} className={cn(base, variants[variant], sizes[size], className)} data-magnetic="" {...rest}>
      <Content icon={icon} lead={lead === undefined ? iconForHref(href) : lead}>
        {children}
      </Content>
    </SmartLink>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon = false,
  lead,
  className,
  children,
  ...rest
}: Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} data-magnetic="" {...rest}>
      <Content icon={icon} lead={lead}>
        {children}
      </Content>
    </button>
  )
}
