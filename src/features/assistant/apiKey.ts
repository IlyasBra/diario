const STORAGE_KEY = 'diario:ai-key'

/**
 * The key lives only in this browser's localStorage and is sent only to the
 * AI provider. There is no server of ours in between.
 */
export function loadApiKey(): string | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value && value.trim() !== '' ? value : null
  } catch {
    return null
  }
}

export function saveApiKey(key: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, key.trim())
  } catch (error) {
    console.warn('The API key could not be saved.', error)
  }
}

export function clearApiKey(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('The API key could not be removed.', error)
  }
}

/** Anthropic keys start with "sk-ant-"; this only catches obvious typos, the API decides. */
export function looksLikeApiKey(value: string): boolean {
  return /^sk-ant-[\w-]{20,}$/.test(value.trim())
}
