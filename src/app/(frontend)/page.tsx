import { GoldenThread } from '@/components/effects/GoldenThread'
import { BrandsSection } from '@/components/home/BrandsSection'
import { Hero } from '@/components/home/Hero'
import { IntroSection } from '@/components/home/IntroSection'
import { MeltStep } from '@/components/home/MeltStep'
import { NetworkSection } from '@/components/home/NetworkSection'
import { ProductsSection } from '@/components/home/ProductsSection'
import { TableSection } from '@/components/home/TableSection'
import { TrustSection } from '@/components/home/TrustSection'
import { isFilmArt } from '@/components/home/FilmArt'
import { OriginFilm, type FilmScene, type FilmSide } from '@/components/home/OriginFilm'
import { CtaBand } from '@/components/ui/CtaBand'
import { getHomePage, getSiteSettings, getTheme, getUi, mediaOf } from '@/lib/cms'
import { effectsOf } from '@/lib/effects'
import { MELT_LINE } from '@/lib/home-defaults'
import { pageMetadata } from '@/lib/seo'
import { themeColors } from '@/lib/theme'

export async function generateMetadata() {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()])
  // The home page keeps the site-wide title ("brand | tagline") unless the editor writes a specific one.
  const meta = pageMetadata({ path: '/', meta: home.meta, description: settings.description })
  return home.meta?.title ? { ...meta, title: { absolute: home.meta.title } } : meta
}

export default async function HomePage() {
  const [home, settings, theme, ui] = await Promise.all([getHomePage(), getSiteSettings(), getTheme(), getUi()])
  const colors = themeColors(theme)
  const hero = home.hero ?? {}
  const film = home.film ?? {}

  const side = (value: NonNullable<NonNullable<typeof film.scenes>[number]['single']> | undefined): FilmSide => {
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
      ? { layout: 'split', kicker: scene.kicker, sound, plant: side(scene.plant), animal: side(scene.animal) }
      : { layout: 'single', kicker: scene.kicker, sound, side: side(scene.single) }
  })
  const filmVideo = mediaOf(film.video)
  const filmVideoMobile = mediaOf(film.videoMobile)
  const melt = home.melt ?? {}
  const meltVideo = mediaOf(melt.video) ?? mediaOf(melt.videoMobile)
  const meltVideoMobile = mediaOf(melt.videoMobile)
  const fx = effectsOf(settings)

  const afterFilm = (
    <>
      <IntroSection {...(home.intro ?? {})} />
      <ProductsSection head={home.products ?? {}} ctaLabel={home.products?.ctaLabel} showMarkets={home.products?.showMarkets !== false} />
      <TableSection table={home.table ?? {}} />
      <BrandsSection head={home.brands ?? {}} />
      <NetworkSection
        head={home.distribution ?? {}}
        tehran={{ title: home.distribution?.tehranTitle, text: home.distribution?.tehranText }}
        others={{ title: home.distribution?.provincesTitle, text: home.distribution?.provincesText }}
        cta={{ label: home.map?.ctaLabel, href: '/network' }}
      />
      <TrustSection head={home.trust ?? {}} items={home.trust?.items} />
      <CtaBand title={home.finalCta?.title} text={home.finalCta?.text} actions={[home.finalCta?.primary, home.finalCta?.secondary, home.finalCta?.tertiary]} />
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
      />
      {/* The melt shows only once its clip has been uploaded in the CMS. */}
      {melt.enabled !== false && meltVideo ? (
        <MeltStep video={{ url: meltVideo.url }} videoMobile={meltVideoMobile && meltVideoMobile.url !== meltVideo.url ? { url: meltVideoMobile.url } : null} line={melt.line ?? MELT_LINE} />
      ) : null}
      {film.enabled !== false && scenes.length > 0 ? (
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
      ) : null}
      {fx.goldenThread ? <GoldenThread>{afterFilm}</GoldenThread> : afterFilm}
    </>
  )
}
