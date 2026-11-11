/** Browser checks shared by the 3D scenes. Each one answers "should this device get the live 3D version?". */

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const wantsLessData = () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)

/** Phones and weak laptops still get 3D, but at a lower resolution and with lighter geometry. */
export const isLowPower = () =>
  window.matchMedia('(max-width: 767px), (pointer: coarse)').matches ||
  (navigator.hardwareConcurrency ?? 8) <= 4 ||
  ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4

/** Run something once the page has finished its important work. */
export function whenIdle(run: () => void, timeout = 1800): () => void {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(run, { timeout })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(run, 500)
  return () => clearTimeout(id)
}
