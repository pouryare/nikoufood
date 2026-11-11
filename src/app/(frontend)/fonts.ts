import localFont from 'next/font/local'

/** Body text: IRANYekanX (Persian-digit build), Regular + Bold. */
export const bodyFont = localFont({
  src: [
    { path: '../../fonts/iranyekanx/IRANYekanXFaNum-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/iranyekanx/IRANYekanXFaNum-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--nk-font-body',
  display: 'swap',
  fallback: ['Segoe UI', 'Tahoma', 'sans-serif'],
})

/** Headlines: Peyda variable (one file, every weight from 100 to 950). */
export const displayFont = localFont({
  src: '../../fonts/peyda/PeydaWebVF.woff2',
  weight: '100 950',
  variable: '--nk-font-display',
  display: 'swap',
  fallback: ['Segoe UI', 'Tahoma', 'sans-serif'],
})
