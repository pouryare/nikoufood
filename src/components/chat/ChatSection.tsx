import { JsonLd } from '@/components/seo/JsonLd'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CHAT_TEXTS, chatTopics, flattenChat } from '@/lib/chat-defaults'
import { getFaqChat, getSiteSettings, getUi } from '@/lib/cms'
import { faqLd } from '@/lib/jsonld'
import { FaqChat } from './FaqChat'

/** The chat with its heading beside it. Returns nothing when the chat is switched off for this page. */
export async function ChatSection({ place }: { place: 'home' | 'network' }) {
  const [chat, settings, ui] = await Promise.all([getFaqChat(), getSiteSettings(), getUi()])
  const on = place === 'home' ? chat.onHome !== false : chat.onNetwork !== false
  if (!on) return null
  const topics = chatTopics(chat.topics)
  // The heading and greeting fall back together, so an editor's own title never sits beside the default text.
  const own = Boolean(chat.title || chat.eyebrow || chat.text)
  const head = own ? { eyebrow: chat.eyebrow, title: chat.title, text: chat.text } : CHAT_TEXTS

  return (
    <section className="section-y">
      {place === 'network' ? <JsonLd data={faqLd(flattenChat(topics))} /> : null}
      <div className="wrap grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow={head.eyebrow} title={head.title} text={head.text} />
        </div>
        <div className="lg:col-span-7" data-reveal>
          <FaqChat topics={topics} greeting={chat.greeting || CHAT_TEXTS.greeting} botName={settings.brandName} labels={ui.chat} />
        </div>
      </div>
    </section>
  )
}
