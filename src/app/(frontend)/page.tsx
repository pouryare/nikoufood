import { Hero } from '@/components/home/Hero'
import { getHomePage, getSiteSettings, getTheme, getUi, mediaOf } from '@/lib/cms'
import { themeColors } from '@/lib/theme'

export default async function HomePage() {
  const [home, settings, theme, ui] = await Promise.all([getHomePage(), getSiteSettings(), getTheme(), getUi()])
  const colors = themeColors(theme)
  const hero = home.hero ?? {}

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
    </>
  )
}
