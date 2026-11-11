import { Hero } from '@/components/home/Hero'
import { NetworkSection } from '@/components/home/NetworkSection'
import { isFilmArt } from '@/components/home/FilmArt'
import { OriginFilm, type FilmScene, type FilmSide } from '@/components/home/OriginFilm'
import { getHomePage, getSiteSettings, getTheme, getUi, mediaOf } from '@/lib/cms'
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
    return {
      title: value?.title,
      text: value?.text,
      image: mediaOf(value?.image),
      imageMobile: mediaOf(value?.imageMobile),
      video: video ? { url: video.url } : null,
      art: isFilmArt(value?.art) ? value.art : null,
    }
  }
  const scenes: FilmScene[] = (film.scenes ?? []).map((scene) =>
    scene.layout === 'split'
      ? { layout: 'split', kicker: scene.kicker, plant: side(scene.plant), animal: side(scene.animal) }
      : { layout: 'single', kicker: scene.kicker, side: side(scene.single) },
  )
  const filmVideo = mediaOf(film.video)
  const filmVideoMobile = mediaOf(film.videoMobile)

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
      <NetworkSection
        head={home.distribution ?? {}}
        tehran={{ title: home.distribution?.tehranTitle, text: home.distribution?.tehranText }}
        others={{ title: home.distribution?.provincesTitle, text: home.distribution?.provincesText }}
        cta={{ label: home.map?.ctaLabel, href: '/network' }}
      />
    </>
  )
}
