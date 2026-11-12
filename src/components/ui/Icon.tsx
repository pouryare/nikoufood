import type { SVGProps } from 'react'

/** A small hand-drawn icon set (24px grid, 1.6 stroke) so the site needs no icon library. */
const PATHS = {
  arrowLeft: 'M19 12H5m6-6-6 6 6 6',
  arrowUpLeft: 'M17 17 7 7m0 8V7h8',
  chevronLeft: 'm15 6-6 6 6 6',
  chevronDown: 'm6 9 6 6 6-6',
  menu: 'M4 7h16M4 12h16M10 17h10',
  close: 'M6 6l12 12M18 6 6 18',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  pin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z',
  send: 'M21 4 3 11l6 2.5M21 4l-4 16-8-6.5M21 4 9 13.5',
  truck: 'M3 6h11v10H3zM14 9h4l3 3.5V16h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  shield: 'M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Zm-3 9 2.2 2.2L15.5 10',
  award: 'M12 14a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm-3-.8L7.5 21l4.5-2.5 4.5 2.5-1.5-7.8',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0M16.5 4.3a3.5 3.5 0 0 1 0 6.4M18 14.5a6 6 0 0 1 3 5.5',
  headset:
    'M4 13v-1a8 8 0 0 1 16 0v1M4 13a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2Zm16 0a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2Zm-2 4v1a3 3 0 0 1-3 3h-2',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9.5 9 5 9-5M3 17l9 5 9-5',
  box: 'M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8',
  building: 'M4 21V5l8-2v18M12 9h8v12M8 8v.01M8 12v.01M8 16v.01M16 13v.01M16 17v.01M2 21h20',
  instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17.2 6.8v.01',
  plus: 'M12 5v14M5 12h14',
  soundOn: 'M4 9.5h3.5L12 6v12l-4.5-3.5H4v-5ZM15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11',
  soundOff: 'M4 9.5h3.5L12 6v12l-4.5-3.5H4v-5ZM16 10l4 4m0-4-4 4',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  map: 'M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5L9 4Zm0 0v13.5m6-11V20',
  leaf: 'M5 19c0-9 5-14 15-14 0 10-5 15-14 15m-1-1 8-8',
  drop: 'M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11Z',
  utensils: 'M7 3v7a2 2 0 0 0 2 2v9M5 3v6m4-6v6M17 3c-2 1.5-3 4-3 7h3v11',
  alert: 'M12 8v5m0 3.5v.01M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z',
} as const

export type IconName = keyof typeof PATHS

/** Turns a value saved in the CMS into an icon name, or null when it is empty, «none» or unknown. */
export const iconName = (value: unknown): IconName | null => (typeof value === 'string' && value in PATHS ? (value as IconName) : null)

type Props = SVGProps<SVGSVGElement> & { name: IconName; size?: number }

export function Icon({ name, size = 20, strokeWidth = 1.6, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
