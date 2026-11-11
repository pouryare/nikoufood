import type { Field, GlobalConfig } from 'payload'
import { anyone, isStaff } from '../access'
import { revalidateGlobalChange } from '../hooks/revalidate'

export const THEME_COLOR_DEFAULTS = {
  background: '#070b16',
  surface: '#0e1526',
  surfaceRaised: '#151f38',
  textPrimary: '#f4eee0',
  textSecondary: '#a9b1c6',
  border: '#24304d',
  primary: '#e3b04b',
  secondary: '#f2e3b3',
  accent: '#8572ef',
  logoFrom: '#15d3df',
  logoTo: '#f412ff',
  success: '#3fb68b',
  error: '#f0616d',
} as const

const color = (name: keyof typeof THEME_COLOR_DEFAULTS, label: string): Field => ({
  name,
  label,
  type: 'text',
  defaultValue: THEME_COLOR_DEFAULTS[name],
  admin: { description: 'کد رنگ مثل #E3B04B', width: '33%' },
  validate: (v: unknown) => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? true : 'کد رنگ باید به شکل #RRGGBB باشد'),
})

export const Theme: GlobalConfig = {
  slug: 'theme',
  label: 'پوسته (رنگ و فونت)',
  admin: { group: 'تنظیمات' },
  access: { read: anyone, update: isStaff },
  hooks: { afterChange: [revalidateGlobalChange] },
  fields: [
    {
      name: 'colors',
      label: 'رنگ‌ها',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [color('background', 'پس‌زمینه'), color('surface', 'سطح کارت‌ها'), color('surfaceRaised', 'سطح برجسته')],
        },
        { type: 'row', fields: [color('textPrimary', 'متن اصلی'), color('textSecondary', 'متن ثانویه'), color('border', 'خطوط')] },
        { type: 'row', fields: [color('primary', 'رنگ اصلی (طلایی کره‌ای)'), color('secondary', 'رنگ دوم'), color('accent', 'رنگ تأکیدی')] },
        { type: 'row', fields: [color('logoFrom', 'گرادیان لوگو: شروع'), color('logoTo', 'گرادیان لوگو: پایان'), color('success', 'موفقیت')] },
        { type: 'row', fields: [color('error', 'خطا')] },
      ],
    },
    {
      name: 'fonts',
      label: 'فونت‌ها',
      type: 'group',
      admin: { description: 'به‌صورت پیش‌فرض ایران‌یکان و پیدا از خود پروژه بارگذاری می‌شوند. برای تغییر، فایل woff2 را در بخش «فونت‌ها» آپلود و اینجا انتخاب کنید.' },
      fields: [
        { name: 'bodyFont', label: 'فونت متن', type: 'relationship', relationTo: 'fonts' },
        { name: 'bodyFontBold', label: 'فونت متن (ضخیم)', type: 'relationship', relationTo: 'fonts' },
        { name: 'displayFont', label: 'فونت تیترهای بزرگ', type: 'relationship', relationTo: 'fonts' },
      ],
    },
  ],
}
