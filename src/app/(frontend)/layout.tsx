import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { LogoMark } from '@/components/brand/LogoMark'
import { Ambience } from '@/components/effects/Ambience'
import { GoldCursor } from '@/components/effects/GoldCursor'
import { Holiday } from '@/components/effects/Holiday'
import { MoltenButtons } from '@/components/effects/MoltenButtons'
import { StretchTitles } from '@/components/effects/StretchTitles'
import { Magnetic } from '@/components/effects/Magnetic'
import { PageTransition } from '@/components/effects/PageTransition'
import { SmoothScroll } from '@/components/effects/SmoothScroll'
import { SoundToggle } from '@/components/effects/Sound'
import { Footer } from '@/components/layout/Footer'
import { Header, type NavItem } from '@/components/layout/Header'
import { MessengerDock } from '@/components/layout/MessengerDock'
import { JsonLd } from '@/components/seo/JsonLd'
import { CmsImage } from '@/components/ui/CmsImage'
import { MotionProvider } from '@/components/ui/MotionProvider'
import { RevealObserver } from '@/components/ui/RevealObserver'
import { BRAND_MARK_PATH, BRAND_MARK_VIEWBOX } from '@/data/brand-mark'
import { getChannels } from '@/lib/channels'
import { effectsOf, soundFilesOf } from '@/lib/effects'
import { activeHoliday } from '@/lib/holidays'
import { articlesEnabled, getNavigation, getSiteSettings, getTheme, getUi, mediaOf } from '@/lib/cms'
import { organizationLd, websiteLd } from '@/lib/jsonld'
import { SITE_URL } from '@/lib/site'
import { themeToCss } from '@/lib/theme'
import { bodyFont, displayFont } from './fonts'
import './globals.css'

// Pages are rendered on the server at request time and read the CMS through a cache that is cleared on every save.
// (Nothing needs the database while the Docker image is being built.)
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const name = settings.brandName
  const share = mediaOf(settings.defaultShareImage)
  const icon = settings.useUploadedLogo ? mediaOf(settings.logoMark) : null
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: settings.tagline ? `${name} | ${settings.tagline}` : name, template: `%s | ${name}` },
    description: settings.description ?? undefined,
    applicationName: name,
    formatDetection: { telephone: false, address: false, email: false },
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      siteName: name,
      images: [{ url: share?.url ?? '/brand/og-default.jpg', width: share?.width ?? 1200, height: share?.height ?? 630, alt: name }],
    },
    twitter: { card: 'summary_large_image' },
    icons: icon ? { icon: icon.url, apple: icon.url } : { icon: [{ url: '/brand/icon.png', type: 'image/png' }], apple: '/brand/apple-icon.png' },
  }
}

export async function generateViewport(): Promise<Viewport> {
  const { colors } = themeToCss(await getTheme())
  return { themeColor: colors.background, colorScheme: 'dark', width: 'device-width', initialScale: 1 }
}

export default async function FrontendLayout({ children }: { children: ReactNode }) {
  const [settings, theme, navigation, ui, showArticles] = await Promise.all([
    getSiteSettings(),
    getTheme(),
    getNavigation(),
    getUi(),
    articlesEnabled(),
  ])
  const { style, css } = themeToCss(theme)
  const channels = getChannels(settings, ui)
  const phone = channels.find((c) => c.key === 'phone')

  // The articles section stays out of every menu until it has something to show.
  const visible = (item: { href?: string | null }) => showArticles || !(item.href ?? '').startsWith('/articles')
  const links: NavItem[] = (navigation.header ?? []).filter((l) => l.label && l.href && visible(l)).map((l) => ({ label: l.label!, href: l.href! }))
  const columns = (navigation.footerColumns ?? [])
    .map((col) => ({ ...col, links: (col.links ?? []).filter(visible) }))
    .filter((col) => (col.links ?? []).length > 0)

  const dockChannels = channels.filter((c) => c.messenger || c.key === 'phone').filter((c) => settings.showWhatsappButton !== false || c.key !== 'whatsapp')
  const uploadedLogo = settings.useUploadedLogo && mediaOf(settings.logoMark)
  const fx = effectsOf(settings)
  // Pages are rendered per request, so the occasion is checked against today's date in Tehran.
  const holiday = settings.holidaysEnabled !== false ? activeHoliday(settings.holidays) : null

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${bodyFont.variable} ${displayFont.variable}`}
      style={style}
      data-fx-pour={fx.pourTitles ? '' : undefined}
      data-fx-thread={fx.goldenThread ? '' : undefined}
      data-fx-rise={fx.titleRise ? '' : undefined}
      data-fx-foil={fx.foilCards ? '' : undefined}
      data-fx-molten={fx.moltenButtons ? '' : undefined}
    >
      <body className="flex min-h-svh flex-col">
        {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
        <a href="#main" className="skip-link">
          {ui.common.skipToContent}
        </a>
        <MotionProvider>
          <Header
            brandName={settings.brandName}
            latinName={settings.brandNameLatin}
            logo={uploadedLogo ? <CmsImage media={settings.logoMark} alt="" sizes="44px" className="size-10 object-contain" priority /> : <LogoMark size={40} animate />}
            links={links}
            cta={navigation.headerCta}
            labels={{ menu: ui.common.menu, close: ui.common.close }}
            phone={phone ? { href: phone.href, display: phone.display } : null}
          />
          <main id="main" className="flex-1">
            {/* The room's light lives inside the page, so the page can lift off the footer and still carry its light. */}
            <Ambience lamp={fx.lamp} pattern={fx.pattern} grain={fx.grain} />
            {children}
          </main>
          <Footer settings={settings} columns={columns} channels={channels} ui={ui} />
          <MessengerDock channels={dockChannels} label={ui.contact.dockLabel} closeLabel={ui.common.close} />
          {fx.sound ? <SoundToggle files={soundFilesOf(settings)} labels={{ on: ui.common.soundOn, off: ui.common.soundOff }} startOn={fx.soundOnAtStart} /> : null}
        </MotionProvider>
        {fx.pageTransition ? (
          <PageTransition>
            {uploadedLogo ? (
              <CmsImage media={settings.logoMark} alt="" sizes="80px" className="size-20 object-contain" />
            ) : (
              <svg viewBox={`-8 -8 ${BRAND_MARK_VIEWBOX + 16} ${BRAND_MARK_VIEWBOX + 16}`} width={76} height={76} aria-hidden>
                <path d={BRAND_MARK_PATH} fill="currentColor" />
              </svg>
            )}
          </PageTransition>
        ) : null}
        {holiday ? (
          <Holiday name={holiday.name} greeting={holiday.greeting} look={holiday.look} link={holiday.link} closeLabel={ui.touches.holidayClose} />
        ) : null}
        {fx.magneticButtons ? <Magnetic /> : null}
        {fx.moltenButtons ? <MoltenButtons /> : null}
        {fx.goldCursor ? <GoldCursor labels={{ view: ui.touches.cursorView, drag: ui.touches.cursorDrag }} /> : null}
        {fx.stretchyTitles ? <StretchTitles /> : null}
        {fx.smoothScroll ? <SmoothScroll /> : null}
        <RevealObserver />
        <JsonLd data={[organizationLd(settings), websiteLd(settings)]} />
      </body>
    </html>
  )
}
