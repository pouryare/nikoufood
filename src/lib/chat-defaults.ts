/**
 * The question-and-answer chat. Every answer can lead to follow-up questions, up to three levels deep.
 * This is the starting conversation, shown while the CMS list is empty. Every answer repeats wording
 * that already appears elsewhere on the site, so the chat states no new facts.
 */

export type ChatLink = { label?: string | null; href?: string | null }
export type ChatNode = { question: string; answer: string; link?: ChatLink | null; followUps?: ChatNode[] }

export const CHAT_TEXTS = {
  eyebrow: 'پرسش و پاسخ',
  title: 'بپرسید؛ جوابش همین‌جاست',
  text: 'پرسش خود را انتخاب کنید. بعد از هر پاسخ، پرسش‌های بعدی هم پیشنهاد می‌شود.',
  greeting: 'سلام! دربارهٔ چه چیزی می‌خواهید بدانید؟',
}

export const CHAT_TOPICS: ChatNode[] = [
  {
    question: 'چطور نماینده شوم؟',
    answer: 'اشخاص و شرکت‌هایی که توان فروش و توزیع محصولات را در منطقهٔ خود دارند، می‌توانند درخواست نمایندگی ثبت کنند.',
    followUps: [
      {
        question: 'چه شرایطی لازم است؟',
        answer: 'توان فروش و توزیع در منطقه، امکان نگهداری و حمل مناسب محصول، و تمایل به همکاری پایدار و توسعهٔ بازار منطقه.',
        followUps: [
          {
            question: 'فرم درخواست چه چیزهایی می‌خواهد؟',
            answer: 'فرم عمداً کوتاه است؛ فقط نام، شماره موبایل و استان.',
            link: { label: 'درخواست نمایندگی', href: '/representation' },
          },
        ],
      },
      {
        question: 'پس از ثبت درخواست چه می‌شود؟',
        answer: 'اطلاعات شما بررسی می‌شود و در صورت نیاز، کارشناسان نیکو اعتماد با شما تماس می‌گیرند.',
        followUps: [
          {
            question: 'مراحل همکاری کدام‌اند؟',
            answer: 'چهار گام: ثبت درخواست، بررسی، گفت‌وگو و آغاز همکاری. پس از تأیید، همکاری رسمی آغاز می‌شود.',
            link: { label: 'درخواست نمایندگی', href: '/representation' },
          },
        ],
      },
      {
        question: 'آیا استان من نماینده دارد؟',
        answer: 'وضعیت هر استان روی نقشهٔ ایران پیداست: پخش مستقیم، تحت پوشش نماینده، پذیرش درخواست نمایندگی یا به‌زودی.',
        link: { label: 'مشاهدهٔ نقشه', href: '/network' },
      },
    ],
  },
  {
    question: 'در تهران محصولات را از کجا تهیه کنم؟',
    answer: 'در تهران، محصولات نیکو اعتماد به‌صورت مستقیم و از طریق شرکت طعمینو توزیع می‌شوند.',
    followUps: [
      {
        question: 'در شهرهای دیگر چطور؟',
        answer: 'در سایر استان‌ها، نمایندگان و پخش‌کنندگان منطقه‌ای مسئول فروش و توزیع محصولات در منطقهٔ خود هستند.',
        link: { label: 'شبکهٔ توزیع', href: '/network' },
      },
    ],
  },
  {
    question: 'چه محصولاتی دارید؟',
    answer: 'کره و چربی‌های خوراکی در دو اندازه: بستهٔ تک‌نفرهٔ فرم‌سیل، و بستهٔ فله‌ای در سه نوع گیاهی، حیوانی و مخلوط.',
    link: { label: 'همهٔ محصولات', href: '/products' },
    followUps: [
      {
        question: 'برای رستوران کدام مناسب است؟',
        answer: 'بسته‌های تک‌نفرهٔ فرم‌سیل برای رستوران‌ها، کترینگ‌ها، هتل‌ها و مراکز تهیهٔ غذا ساخته شده‌اند.',
        link: { label: 'محصولات تک‌نفره', href: '/products?category=single-serve' },
        followUps: [
          {
            question: 'برای هر بشقاب چند بسته لازم است؟',
            answer: 'یک بستهٔ تک‌نفره برای هر بشقاب. با محاسبه‌گر نیاز ببینید در ماه چند بسته لازم دارید.',
            link: { label: 'محاسبهٔ نیاز', href: '/partnership#calculator' },
          },
        ],
      },
      {
        question: 'برای مراکز تهیهٔ غذا و عمده‌فروشی چطور؟',
        answer: 'بسته‌بندی‌های فله‌ای برای مراکز تهیهٔ غذا، کسب‌وکارهای غذایی و پخش‌کنندگان.',
        link: { label: 'محصولات فله‌ای', href: '/products?category=bulk' },
      },
      {
        question: 'برندهای شما کدام‌اند؟',
        answer: 'آلانیک و پاک‌خواه، برندهای متعلق به مجموعهٔ نیکو اعتماد هستند.',
        link: { label: 'آشنایی با برندها', href: '/brands' },
      },
    ],
  },
  {
    question: 'قیمت و شرایط خرید چطور است؟',
    answer: 'شرایط تأمین و همکاری به‌صورت اختصاصی اعلام می‌شود.',
    link: { label: 'درخواست همکاری', href: '/partnership' },
    followUps: [
      {
        question: 'چه کسب‌وکارهایی می‌توانند همکاری کنند؟',
        answer: 'عمده‌فروشان، فروشگاه‌های زنجیره‌ای، هتل‌ها، رستوران‌ها، کترینگ‌ها و مراکز تهیهٔ غذا.',
        link: { label: 'همکاری با ما', href: '/partnership' },
      },
    ],
  },
  {
    question: 'نیکو اعتماد کیست؟',
    answer: 'نیکو اعتماد حدود ۱۵ سال است در صنعت محصولات غذایی فعالیت می‌کند و در سال ۱۴۰۴ هویت و ساختار جدید خود را معرفی کرد.',
    link: { label: 'دربارهٔ ما', href: '/about' },
    followUps: [
      {
        question: 'چطور با شما تماس بگیرم؟',
        answer: 'پیام خود را در صفحهٔ تماس بنویسید یا از راه‌های ارتباطی همان صفحه استفاده کنید.',
        link: { label: 'تماس با ما', href: '/contact' },
      },
    ],
  },
]

type SavedNode = {
  question?: string | null
  answer?: string | null
  link?: ChatLink | null
  followUps?: SavedNode[] | null
  /** The third level is stored under its own name. */
  deeper?: SavedNode[] | null
}

/** The CMS conversation without half-filled rows; the starting conversation while the CMS has none. */
export function chatTopics(saved: SavedNode[] | null | undefined): ChatNode[] {
  const clean = (rows: SavedNode[] | null | undefined): ChatNode[] =>
    (rows ?? [])
      .filter((row) => row.question?.trim() && row.answer?.trim())
      .map((row) => ({
        question: row.question!.trim(),
        answer: row.answer!.trim(),
        link: row.link?.label && row.link.href ? { label: row.link.label, href: row.link.href } : null,
        followUps: clean(row.followUps ?? row.deeper),
      }))
  const own = clean(saved)
  return own.length ? own : CHAT_TOPICS
}

/** Every question and answer in the tree, for the search-engine FAQ data. */
export function flattenChat(nodes: ChatNode[]): { question: string; answer: string }[] {
  return nodes.flatMap((n) => [{ question: n.question, answer: n.answer }, ...flattenChat(n.followUps ?? [])])
}
