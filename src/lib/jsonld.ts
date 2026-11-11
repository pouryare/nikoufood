import type { SiteSetting } from '@/payload-types'
import { mediaOf } from './cms'
import { dialable } from './format'
import { absoluteUrl, SITE_URL } from './site'

type Json = Record<string, unknown>

const clean = (obj: Json): Json => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)))

/** Who the company is, for search engines. Only facts that are filled in the CMS are included. */
export function organizationLd(settings: SiteSetting): Json {
  const logo = mediaOf(settings.logoMark)
  const sameAs = [settings.instagramUrl, settings.telegramUrl, settings.baleUrl, settings.eitaaUrl].filter(Boolean)
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: settings.brandName,
    alternateName: settings.brandNameLatin,
    legalName: settings.legalName,
    description: settings.description,
    url: SITE_URL,
    logo: absoluteUrl(logo?.url ?? '/brand/nikou-mark.png'),
    email: settings.email,
    telephone: settings.phone ? dialable(settings.phone) : undefined,
    address: settings.address ? { '@type': 'PostalAddress', streetAddress: settings.address, addressCountry: 'IR' } : undefined,
    sameAs,
  })
}

export function websiteLd(settings: SiteSetting): Json {
  return clean({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: settings.brandName,
    inLanguage: 'fa-IR',
    publisher: { '@id': `${SITE_URL}/#organization` },
  })
}

export function breadcrumbLd(items: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absoluteUrl(item.path) })),
  }
}

/** A product without price or offer: this is a corporate catalogue, not a shop. */
export function productLd(input: { name: string; description?: string | null; path: string; image?: string | null; brand?: string | null; category?: string | null }): Json {
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    image: input.image ? absoluteUrl(input.image) : undefined,
    category: input.category,
    brand: input.brand ? { '@type': 'Brand', name: input.brand } : undefined,
    manufacturer: { '@id': `${SITE_URL}/#organization` },
  })
}

export function articleLd(input: { title: string; description?: string | null; path: string; image?: string | null; publishedAt?: string | null; updatedAt?: string | null }): Json {
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    image: input.image ? absoluteUrl(input.image) : undefined,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    inLanguage: 'fa-IR',
    author: { '@id': `${SITE_URL}/#organization` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  })
}

export function faqLd(items: { question: string; answer: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  }
}
