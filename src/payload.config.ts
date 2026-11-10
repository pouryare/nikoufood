import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { en } from '@payloadcms/translations/languages/en'
import { fa } from '@payloadcms/translations/languages/fa'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Brands } from './collections/Brands'
import { Fonts } from './collections/Fonts'
import { Leads } from './collections/Leads'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Provinces } from './collections/Provinces'
import { Representatives } from './collections/Representatives'
import { FatTypes, Markets, ProductCategories } from './collections/Taxonomies'
import { Users } from './collections/Users'
import { Navigation } from './globals/Navigation'
import {
  AboutPage,
  ContactPage,
  HomePage,
  ListingPages,
  NetworkPage,
  PartnershipPage,
  RepresentationPage,
} from './globals/Pages'
import { SiteSettings } from './globals/SiteSettings'
import { Theme } from './globals/Theme'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const smtpConfigured = Boolean(process.env.SMTP_HOST)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' | پنل مدیریت نیکو اعتماد' },
  },
  collections: [
    Products,
    Brands,
    ProductCategories,
    FatTypes,
    Markets,
    Leads,
    Representatives,
    Provinces,
    Articles,
    Media,
    Fonts,
    Users,
  ],
  globals: [
    SiteSettings,
    Theme,
    Navigation,
    HomePage,
    AboutPage,
    NetworkPage,
    RepresentationPage,
    PartnershipPage,
    ContactPage,
    ListingPages,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    // Schema is managed with migrations in production; `push` keeps local development friction-free.
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  email: smtpConfigured
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || 'no-reply@localhost',
        defaultFromName: 'نیکو اعتماد',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        },
      })
    : undefined,
  i18n: { supportedLanguages: { fa, en }, fallbackLanguage: 'fa' },
  sharp,
  plugins: [
    seoPlugin({
      collections: ['products', 'brands', 'articles'],
      globals: ['home-page', 'about-page', 'network-page', 'representation-page', 'partnership-page', 'contact-page'],
      uploadsCollection: 'media',
      tabbedUI: false,
      generateTitle: ({ doc }) => {
        const d = doc as { name?: string; title?: string; header?: { title?: string } }
        return d.name || d.title || d.header?.title || ''
      },
      generateDescription: ({ doc }) => {
        const d = doc as { shortDescription?: string; description?: string; excerpt?: string; header?: { intro?: string } }
        return d.shortDescription || d.excerpt || d.header?.intro || (typeof d.description === 'string' ? d.description : '')
      },
    }),
  ],
})
