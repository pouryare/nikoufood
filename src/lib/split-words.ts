/**
 * Splits a sentence into words for the word-by-word effects. Runs of Latin words stay together,
 * because each piece is laid out as its own box and two Latin words in a right-to-left line would
 * otherwise swap places.
 */
export function splitWords(text: string): string[] {
  const parts = text.trim().split(/\s+/).filter(Boolean)
  const out: string[] = []
  for (const part of parts) {
    const latin = /[A-Za-z]/.test(part)
    const prev = out[out.length - 1]
    if (latin && prev && /[A-Za-z]/.test(prev)) out[out.length - 1] = `${prev} ${part}`
    else out.push(part)
  }
  return out
}
