/*
 * Framing numbers shared by the live scene and the still pictures, kept free of three.js so the
 * components can place the still before the scene has loaded. With the same numbers on both sides,
 * the still and the first live frame land on the same pixels and the swap is invisible.
 */

export type Padding = { top: number; right: number; bottom: number; left: number }

/** Free space around the exploded pack; the right side is kept for the part names. */
export const explodedPadding = (width: number): Padding => {
  const edge = width < 420 ? 8 : 16
  return { top: edge, right: width < 420 ? 112 : 158, bottom: edge + 4, left: edge }
}

/** Free space around the pack seen from above; the bottom leaves room for the hint. */
export const peelPadding = (width: number): Padding => {
  const edge = width < 420 ? 14 : 22
  return { top: edge, right: edge + 8, bottom: edge + 26, left: edge + 8 }
}

/** How a still was shot: the framed subject's width/height, and where that frame sits in the picture. */
export type StillFrame = { aspect: number; top: number; height: number }
export const EXPLODED_STILL: StillFrame = { aspect: 1.07, top: 16 / 600, height: 564 / 600 }
export const PEEL_STILL: StillFrame = { aspect: 1.53, top: 22 / 600, height: 530 / 600 }

/** Sizes and moves a still so its subject fills the padded area exactly like the live camera does. */
export const placeStill = (img: HTMLImageElement, width: number, height: number, pad: Padding, frame: StillFrame) => {
  const availW = Math.max(40, width - pad.left - pad.right)
  const availH = Math.max(40, height - pad.top - pad.bottom)
  const boxH = Math.min(availH, availW / frame.aspect)
  const imgH = boxH / frame.height
  // Read the picture's own proportions from its attributes; the live width changes as we resize it.
  const imgW = (imgH * Number(img.getAttribute('width'))) / Math.max(1, Number(img.getAttribute('height')))
  img.style.height = `${imgH}px`
  img.style.width = `${imgW}px`
  img.style.left = `${pad.left + availW / 2 - imgW / 2}px`
  img.style.top = `${pad.top + (availH - boxH) / 2 - frame.top * imgH}px`
}

/** Asked on a throwaway canvas first, so a browser without WebGL keeps the still and logs no error. */
export const hasWebGL = () => {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'))
  } catch {
    return false
  }
}
