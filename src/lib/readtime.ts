/** Recursively pulls text out of a lexical richText JSON tree. */
function extractText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { text?: string; children?: unknown[] }
  let text = typeof n.text === 'string' ? n.text : ''
  if (Array.isArray(n.children)) {
    text += ' ' + n.children.map(extractText).join(' ')
  }
  return text
}

/** Word count / 200wpm, minimum 1 minute (ui-improvements Phase H). */
export function readTimeMinutes(body: unknown): number {
  const root = (body as { root?: unknown } | null)?.root
  const text = extractText(root)
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
