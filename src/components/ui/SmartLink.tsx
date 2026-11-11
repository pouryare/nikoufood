import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href?: string | null; children: ReactNode }

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//')

/** Internal paths use the Next.js router; everything else (https, tel:, mailto:) is a normal link. */
export function SmartLink({ href, children, ...rest }: Props) {
  const target = href || '#'
  if (isInternal(target)) {
    return (
      <Link href={target} {...rest}>
        {children}
      </Link>
    )
  }
  const external = /^https?:\/\//.test(target)
  return (
    <a href={target} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
    </a>
  )
}
