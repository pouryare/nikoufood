import { ChatSection } from '@/components/chat/ChatSection'
import { GoldenThread } from '@/components/effects/GoldenThread'
import { BrandsSection } from '@/components/home/BrandsSection'
import { ButterJourney } from '@/components/home/ButterJourney'
import { FinderSection } from '@/components/home/FinderSection'
import { Hero } from '@/components/home/Hero'
import { IntroSection } from '@/components/home/IntroSection'
import { KitchenDaySection } from '@/components/home/KitchenDaySection'
import { MeltStep } from '@/components/home/MeltStep'
import { NetworkSection } from '@/components/home/NetworkSection'
import { ProductsSection } from '@/components/home/ProductsSection'
import { MapMark, SectionMap } from '@/components/home/SectionMap'
import { SheetStack } from '@/components/home/SheetStack'
import { SizesSection } from '@/components/home/SizesSection'
import { TableSection } from '@/components/home/TableSection'
import { TrustSection } from '@/components/home/TrustSection'
import { isFilmArt } from '@/components/home/FilmArt'
import { OriginFilm, type FilmScene, type FilmSide } from '@/components/home/OriginFilm'
import { CtaBand } from '@/components/ui/CtaBand'
import { getFaqChat, getHomePage, getSiteSettings, getTheme, getUi, mediaOf } from '@/lib/cms'
import { effectsOf } from '@/lib/effects'
import { BUTTER_STOPS, FINDER_TEXTS, KITCHEN_TEXTS, MELT_LINE, ROUTE_STEPS, SIZES_TEXTS, TABLE_TEXTS, TRUST_BIG_WORD } from '@/lib/home-defaults'
import { CHAT_TEXTS } from '@/lib/chat-defaults'
import { iconName, type IconName } from '@/components/ui/Icon'
import { pageMetadata } from '@/lib/seo'
import { themeColors } from '@/lib/theme'

export async function generateMetadata() {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()])
  // The home page keeps the site-wide title ("brand | tagline") unless the editor writes a specific one.
  const meta = pageMetadata({ path: '/', meta: home.meta, description: settings.description })
  return home.meta?.title ? { ...meta, title: { absolute: home.meta.title } } : meta
}

export default async function HomePage() {
  const [home, settings, theme, ui, chat] = await Promise.all([
    getHomePage(),
    getSiteSettings(),
    getTheme(),
    getUi(),
    getFaqChat(),
  ])
  const colors = themeColors(theme)
  const hero = home.hero ?? {}
  const film = home.film ?? {}

  const side = (
    value: NonNullable<NonNullable<typeof film.scenes>[number]['single']> | undefined,
  ): FilmSide => {
    const video = mediaOf(value?.video)
    const videoMobile = mediaOf(value?.videoMobile)
    return {
      title: value?.title,
      text: value?.text,
      image: mediaOf(value?.image),
      imageMobile: mediaOf(value?.imageMobile),
      video: video ? { url: video.url } : null,
      videoMobile: videoMobile ? { url: videoMobile.url } : null,
      art: isFilmArt(value?.art) ? value.art : null,
    }
  }
  const scenes: FilmScene[] = (film.scenes ?? []).map((scene) => {
    const sound = scene.sound && scene.sound !== 'none' ? scene.sound : null
    return scene.layout === 'split'
      ? {
          layout: 'split',
          kicker: scene.kicker,
          sound,
          plant: side(scene.plant),
          animal: side(scene.animal),
        }
      : { layout: 'single', kicker: scene.kicker, sound, side: side(scene.single) }
  })
  const filmVideo = mediaOf(film.video)
  const filmVideoMobile = mediaOf(film.videoMobile)
  const melt = home.melt ?? {}
  const meltVideo = mediaOf(melt.video) ?? mediaOf(melt.videoMobile)
  const meltVideoMobile = mediaOf(melt.videoMobile)
  const fx = effectsOf(settings)

  // The travelling butter: which stops are used (all of them until the editor chooses), in page order.
  const chosenStops = home.butter?.stops?.length ? home.butter.stops : [...BUTTER_STOPS]
  const butterStops = fx.travellingButter
    ? BUTTER_STOPS.filter((stop) => chosenStops.includes(stop))
    : []
  const stopAt = (name: (typeof BUTTER_STOPS)[number]) => butterStops.includes(name)

  // The golden route takes its middle steps from the two distribution cards until its own steps are filled in.
  const dist = home.distribution ?? {}
  const ownSteps = (dist.steps ?? []).filter((step) => step.title)
  const routeSteps = (
    ownSteps.length
      ? ownSteps
      : ROUTE_STEPS.map((step, i) =>
          i === 1 && dist.tehranTitle
            ? { ...step, title: dist.tehranTitle, text: dist.tehranText }
            : i === 2 && dist.provincesTitle
              ? { ...step, title: dist.provincesTitle, text: dist.provincesText }
              : step,
        )
  ).map((step) => ({
    title: step.title,
    text: step.text,
    short: step.short,
    icon: iconName(step.icon),
  }))
  const finderOn = home.finder?.enabled !== false
  const trustWord =
    home.trust?.bigWord ?? (home.trust?.title?.includes(TRUST_BIG_WORD) ? TRUST_BIG_WORD : null)

  // The page map: a mark where each section starts, named after the section's small title.
  const mark = (label: string | null | undefined, icon: IconName) =>
    fx.sectionMap ? <MapMark label={label} icon={icon} /> : null
  const tableOn = home.table?.enabled !== false
  const table = <TableSection table={home.table ?? {}} butterStop={stopAt('table')} nooshJan={fx.nooshJan} />
  const brands = <BrandsSection head={home.brands ?? {}} mark={mark(home.brands?.eyebrow || home.brands?.title, 'award')} />

  const afterFilm = (
    <>
      {mark(home.intro?.eyebrow || home.intro?.title, 'sparkle')}
      <IntroSection
        {...(home.intro ?? {})}
        wordLight={fx.wordLight}
        rollingNumbers={fx.rollingNumbers}
        butterStop={stopAt('intro')}
      />
      {home.sizes?.enabled !== false ? mark(home.sizes?.title || SIZES_TEXTS.title, 'grid') : null}
      <SizesSection sizes={home.sizes ?? {}} butterStop={stopAt('sizes')} />
      {mark(home.products?.eyebrow || home.products?.title, 'box')}
      <ProductsSection
        head={home.products ?? {}}
        ctaLabel={home.products?.ctaLabel}
        // The market finder below shows the same markets as a big list, so the moving band steps aside for it.
        showMarkets={home.products?.showMarkets !== false && !finderOn}
        showroom={fx.showroom}
      />
      {finderOn ? mark(home.finder?.title || FINDER_TEXTS.title, 'store') : null}
      <FinderSection finder={home.finder ?? {}} butterStop={stopAt('finder')} />
      {home.kitchenDay?.enabled !== false ? mark(home.kitchenDay?.eyebrow || KITCHEN_TEXTS.eyebrow, 'sun') : null}
      <KitchenDaySection day={home.kitchenDay ?? {}} />
      {tableOn ? mark(home.table?.eyebrow || TABLE_TEXTS.eyebrow, 'utensils') : null}
      {fx.sheetStack ? (
        <SheetStack>
          {table}
          {brands}
        </SheetStack>
      ) : (
        <>
          {table}
          {brands}
        </>
      )}
      {mark(dist.eyebrow || dist.title, 'truck')}
      <NetworkSection
        head={dist}
        tehran={{ title: dist.tehranTitle, text: dist.tehranText }}
        others={{ title: dist.provincesTitle, text: dist.provincesText }}
        cta={{ label: home.map?.ctaLabel, href: '/network' }}
        route={
          dist.routeEnabled !== false
            ? {
                steps: routeSteps,
                label: dist.title || ROUTE_STEPS.map((step) => step.short).join('، '),
              }
            : null
        }
      />
      {mark(home.trust?.eyebrow || home.trust?.title, 'shield')}
      <TrustSection
        head={home.trust ?? {}}
        items={home.trust?.items}
        bigWord={trustWord}
        bento={fx.bento}
      />
      {chat.onHome !== false ? mark(chat.eyebrow || CHAT_TEXTS.eyebrow, 'chat') : null}
      <ChatSection place="home" />
      <CtaBand
        title={home.finalCta?.title}
        text={home.finalCta?.text}
        actions={[home.finalCta?.primary, home.finalCta?.secondary, home.finalCta?.tertiary]}
      />
    </>
  )

  return (
    <>
      {mark(ui.touches.mapStart, 'home')}
      <Hero
        brandName={settings.brandName}
        eyebrow={hero.eyebrow}
        words={[hero.wordTop || '', hero.wordMiddle || '', hero.wordBottom || '']}
        subtitle={hero.subtitle}
        primaryCta={hero.primaryCta}
        secondaryCta={hero.secondaryCta}
        image={mediaOf(hero.image)}
        enable3D={settings.enable3D !== false}
        scrollHint={ui.common.scrollHint}
        accentFrom={colors.logoFrom}
        accentTo={colors.logoTo}
        butterStop={stopAt('hero')}
      />
      {/* The melt shows only once its clip has been uploaded in the CMS. */}
      {melt.enabled !== false && meltVideo ? (
        <div data-butter-hide="">
          <MeltStep
            video={{ url: meltVideo.url }}
            videoMobile={
              meltVideoMobile && meltVideoMobile.url !== meltVideo.url
                ? { url: meltVideoMobile.url }
                : null
            }
            line={melt.line ?? MELT_LINE}
          />
        </div>
      ) : null}
      {film.enabled !== false && scenes.length > 0 ? (
        <div data-butter-hide="">
          {mark(film.eyebrow || film.title, 'leaf')}
          <OriginFilm
            eyebrow={film.eyebrow}
            title={film.title}
            intro={film.intro}
            plantLabel={film.plantLabel}
            animalLabel={film.animalLabel}
            film={filmVideo ? { url: filmVideo.url } : null}
            filmMobile={filmVideoMobile ? { url: filmVideoMobile.url } : null}
            scenes={scenes}
          />
        </div>
      ) : null}
      {fx.goldenThread ? <GoldenThread>{afterFilm}</GoldenThread> : afterFilm}
      {butterStops.length ? <ButterJourney stops={butterStops} /> : null}
      {fx.sectionMap ? <SectionMap labels={{ mapLabel: ui.touches.mapLabel }} /> : null}
    </>
  )
}
