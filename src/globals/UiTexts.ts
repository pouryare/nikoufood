import type { Field, GlobalConfig } from 'payload'
import { anyone, isStaff } from '../access'
import { revalidateGlobalChange } from '../hooks/revalidate'
import { UI_DEFAULTS, UI_GROUP_LABELS } from '../lib/ui-defaults'

/** Built from the defaults dictionary, so adding a text there adds its field here. */
const groups: Field[] = (Object.keys(UI_DEFAULTS) as (keyof typeof UI_DEFAULTS)[]).map((group) => ({
  name: group,
  label: UI_GROUP_LABELS[group],
  type: 'group',
  fields: Object.entries(UI_DEFAULTS[group]).map(
    ([key, value]): Field => ({
      name: key,
      label: value,
      type: 'text',
      defaultValue: value,
      admin: { placeholder: value },
    }),
  ),
}))

export const UiTextsGlobal: GlobalConfig = {
  slug: 'ui-texts',
  label: 'متن‌های رابط کاربری',
  admin: {
    group: 'تنظیمات',
    description: 'متن دکمه‌ها، برچسب فرم‌ها و پیام‌های کوتاه سایت. هر فیلد خالی، متن پیش‌فرض را نشان می‌دهد.',
  },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobalChange] },
  fields: groups,
}
