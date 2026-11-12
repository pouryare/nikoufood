import { GoldenThread } from '@/components/effects/GoldenThread'
import { BrandsSection } from '@/components/home/BrandsSection'
import { ButterJourney } from '@/components/home/ButterJourney'
import { FinderSection } from '@/components/home/FinderSection'
import { Hero } from '@/components/home/Hero'
import { IntroSection } from '@/components/home/IntroSection'
import { MeltStep } from '@/components/home/MeltStep'
import { NetworkSection } from '@/components/home/NetworkSection'
import { ProductsSection } from '@/components/home/ProductsSection'
import { SheetStack } from '@/components/home/SheetStack'
import { SizesSection } from '@/components/home/SizesSection'
import { TableSection } from '@/components/home/TableSection'
import { TrustSection } from '@/components/home/TrustSection'
import { isFilmArt } from '@/components/home/FilmArt'
import { OriginFilm, type FilmScene, type FilmSide } from '@/components/home/OriginFilm'
import { CtaBand } from '@/components/ui/CtaBand'
import { getHomePage, getSiteSettings, getTheme, getUi, mediaOf } from '@/lib/cms'
import { effectsOf } from '@/lib/effects'
import { BUTTER_STOPS, MELT_LINE, ROUTE_STEPS, TRUST_BIG_WORD } from '@/lib/home-defaults'
import { iconName } from '@/components/ui/Icon'
import { pageMetadata } from '@/lib/seo'
import { themeColors } from '@/lib/theme'

export async function generateMetadata() {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()])
  // The home page keeps the site-wide title ("brand | tagline") unless the editor writes a specific one.
  const meta = pageMetadata({ path: '/', meta: home.meta, description: settings.description })
  return home.meta?.title ? { ...meta, title: { absolute: home.meta.title } } : meta
}

export default async function HomePage() {
  const [home, settings, theme, ui] = await Promise.all([
    getHomePage(),
    getSiteSettings(),
    getTheme(),
    getUi(),
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

  const table = <TableSection table={home.table ?? {}} butterStop={stopAt('table')} />
  const brands = <BrandsSection head={home.brands ?? {}} />

  const afterFilm = (
    <>
      <IntroSection
        {...(home.intro ?? {})}
        wordLight={fx.wordLight}
        rollingNumbers={fx.rollingNumbers}
        butterStop={stopAt('intro')}
      />
      <SizesSection sizes={home.sizes ?? {}} butterStop={stopAt('sizes')} />
      <ProductsSection
        head={home.products ?? {}}
        ctaLabel={home.products?.ctaLabel}
        // The market finder below shows the same markets as a big list, so the moving band steps aside for it.
        showMarkets={home.products?.showMarkets !== false && !finderOn}
        showroom={fx.showroom}
      />
      <FinderSection finder={home.finder ?? {}} butterStop={stopAt('finder')} />
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
      <TrustSection
        head={home.trust ?? {}}
        items={home.trust?.items}
        bigWord={trustWord}
        bento={fx.bento}
      />
      <CtaBand
        title={home.finalCta?.title}
        text={home.finalCta?.text}
        actions={[home.finalCta?.primary, home.finalCta?.secondary, home.finalCta?.tertiary]}
      />
    </>
  )

  return (
    <>
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
    </>
  )
}
