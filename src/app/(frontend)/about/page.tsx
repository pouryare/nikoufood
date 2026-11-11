import type { CSSProperties } from 'react'
import { BrandMark } from '@/components/about/BrandMark'
import { CmsImage } from '@/components/ui/CmsImage'
import { CtaBand } from '@/components/ui/CtaBand'
import { Icon, iconName } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { TiltCard } from '@/components/ui/TiltCard'
import { getAboutPage, getSiteSettings, getTheme, getUi } from '@/lib/cms'
import { toFa } from '@/lib/format'
import { pageMetadata } from '@/lib/seo'
import { themeColors } from '@/lib/theme'

export async function generateMetadata() {
  const about = await getAboutPage()
  return pageMetadata({ title: about.header?.title, description: about.header?.intro, path: '/about', meta: about.meta })
}

export default async function AboutPage() {
  const [about, settings, theme, ui] = await Promise.all([getAboutPage(), getSiteSettings(), getTheme(), getUi()])
  const colors = themeColors(theme)
  const header = about.header
  const chapters = (about.chapters ?? []).filter((chapter) => chapter.title)
  const milestones = (about.milestones ?? []).filter((milestone) => milestone.title)
  const values = (about.values ?? []).filter((value) => value.title)

  return (
    <>
      <PageHeader
        eyebrow={header?.eyebrow}
        title={header?.title ?? settings.brandName}
        intro={header?.intro}
        homeLabel={ui.common.home}
        trail={[{ name: header?.eyebrow || settings.brandName, path: '/about' }]}
        visual={<BrandMark accentFrom={colors.logoFrom} accentTo={colors.logoTo} enable3D={settings.enable3D !== false} title={settings.brandName} />}
      />

      {chapters.length ? (
        <section className="section-y">
          <div className="wrap">
            <ol className="story">
              {chapters.map((chapter, i) => (
                <li key={chapter.id ?? chapter.title} className="story-chapter">
                  <div className="story-side">
                    <span aria-hidden data-reveal className="story-num">
                      {toFa(String(i + 1).padStart(2, '0'))}
                    </span>
                    {chapter.kicker ? (
                      <p data-reveal style={{ '--i': 1 } as CSSProperties} className="eyebrow">
                        {chapter.kicker}
                      </p>
                    ) : null}
                  </div>
                  <div className="story-body">
                    <h2 data-reveal style={{ '--i': 1 } as CSSProperties} className="text-h2">
                      {chapter.title}
                    </h2>
                    {chapter.text ? (
                      <p data-reveal style={{ '--i': 2 } as CSSProperties} className="mt-6 max-w-2xl text-lead text-muted">
                        {chapter.text}
                      </p>
                    ) : null}
                    {chapter.image ? (
                      <div data-reveal style={{ '--i': 3 } as CSSProperties} className="story-image">
                        <CmsImage media={chapter.image} sizes="(max-width: 1023px) 100vw, 48rem" className="size-full object-cover" />
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {milestones.length ? (
        <section className="border-y border-line/50 bg-surface/40 py-[clamp(3.5rem,8vw,7rem)]">
          <div className="wrap">
            <ol className="milestones">
              {milestones.map((milestone, i) => (
                <li key={milestone.id ?? milestone.title} data-reveal style={{ '--i': i } as CSSProperties} className="milestone">
                  <span aria-hidden className="milestone-dot" />
                  <p className="milestone-year">{milestone.year}</p>
                  <h3 className="mt-3 text-h3">{milestone.title}</h3>
                  {milestone.text ? <p className="mt-2 text-muted">{milestone.text}</p> : null}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {about.vision?.title || about.vision?.text ? (
        <section className="section-y">
          <div className="wrap-narrow text-center">
            {about.vision.title ? (
              <p data-reveal className="eyebrow">
                {about.vision.title}
              </p>
            ) : null}
            {about.vision.text ? (
              <blockquote data-reveal style={{ '--i': 1 } as CSSProperties} className="vision-quote">
                {about.vision.text}
              </blockquote>
            ) : null}
          </div>
        </section>
      ) : null}

      {values.length ? (
        <section className="pb-[clamp(4.5rem,10vw,9.5rem)]">
          <div className="wrap">
            <ul className="grid gap-5 md:grid-cols-3">
              {values.map((value, i) => {
                const icon = iconName(value.icon)
                return (
                  <li key={value.id ?? value.title} data-reveal style={{ '--i': i } as CSSProperties}>
                    <TiltCard className="h-full" innerClassName="rounded-lg">
                      <div className="panel h-full p-7 md:p-9">
                        {icon ? (
                          <span className="grid size-12 place-items-center rounded-full border border-gold/40 text-gold">
                            <Icon name={icon} size={22} />
                          </span>
                        ) : null}
                        <h3 className="mt-6 text-h3">{value.title}</h3>
                        {value.text ? <p className="mt-3 text-muted">{value.text}</p> : null}
                      </div>
                    </TiltCard>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}

      <CtaBand title={about.cta?.title} text={about.cta?.text} actions={[about.cta?.primary]} />
    </>
  )
}
