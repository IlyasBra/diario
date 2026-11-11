/** Lowercase without accents: "Médico" → "medico". For searching. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/**
 * Whether `text` contains every word of `query`, ignoring case and accents.
 * An empty query matches everything.
 */
export function matchesQuery(text: string, query: string): boolean {
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  const haystack = normalizeText(text)
  return words.every((word) => haystack.includes(word))
}
