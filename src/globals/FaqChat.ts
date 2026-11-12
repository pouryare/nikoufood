import type { Field, GlobalConfig } from 'payload'
import { anyone, isStaff } from '../access'
import { checkbox, itemsField, linkGroup, text, textarea } from '../fields/helpers'
import { revalidateGlobalChange } from '../hooks/revalidate'

/** One question with its answer and an optional button under the answer. */
const turn = (): Field[] => [
  text('question', 'پرسش', { required: true }),
  textarea('answer', 'پاسخ', { required: true }),
  linkGroup('link', 'دکمه زیر پاسخ (اختیاری)'),
]

export const FaqChat: GlobalConfig = {
  slug: 'faq-chat',
  label: 'گفت‌وگوی پرسش و پاسخ',
  admin: {
    group: 'صفحه‌ها',
    description:
      'پرسش‌های پرتکرار به شکل یک گفت‌وگو: بازدیدکننده یک پرسش را انتخاب می‌کند، پاسخ را می‌خواند و بعد پرسش‌های بعدیِ همان موضوع را می‌بیند (تا سه سطح).',
  },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobalChange] },
  fields: [
    {
      type: 'row',
      fields: [
        checkbox('onHome', 'نمایش در صفحهٔ اصلی (پیش از جملهٔ پایانی)', true, { admin: { width: '50%' } }),
        checkbox('onNetwork', 'نمایش در صفحهٔ شبکهٔ توزیع (به‌جای فهرست ساده پرسش‌ها)', true, { admin: { width: '50%' } }),
      ],
    },
    text('eyebrow', 'عنوان کوچک'),
    text('title', 'تیتر'),
    textarea('text', 'متن کوتاه کنار گفت‌وگو'),
    textarea('greeting', 'اولین پیام گفت‌وگو'),
    itemsField(
      'topics',
      'پرسش‌های اصلی',
      [
        ...turn(),
        itemsField(
          'followUps',
          'پرسش‌های بعدی (سطح دوم)',
          // A different name on the third level keeps the database tables apart.
          [...turn(), itemsField('deeper', 'پرسش‌های بعدی (سطح سوم)', turn(), { admin: { initCollapsed: true } })],
          { admin: { initCollapsed: true } },
        ),
      ],
      {
        admin: {
          initCollapsed: true,
          description: 'تا وقتی این فهرست خالی است، گفت‌وگوی پیش‌فرض سایت نمایش داده می‌شود (همهٔ پاسخ‌هایش از متن‌های خود سایت است).',
        },
      },
    ),
  ],
}
