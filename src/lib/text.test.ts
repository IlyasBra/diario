import { describe, expect, it } from 'vitest'

import { matchesQuery, normalizeText } from './text'

describe('normalizeText', () => {
  it('removes accents and lowercases, keeping ñ distinct from n only by NFD rules', () => {
    expect(normalizeText('Médico ÁÉÍÓÚ Ü')).toBe('medico aeiou u')
  })
})

describe('matchesQuery', () => {
  it('ignores case and accents', () => {
    expect(matchesQuery('Cita con el MÉDICO', 'medico')).toBe(true)
    expect(matchesQuery('Cita con el medico', 'MÉDICO')).toBe(true)
  })

  it('requires every word, in any order', () => {
    expect(matchesQuery('Comprar pan integral', 'integral pan')).toBe(true)
    expect(matchesQuery('Comprar pan integral', 'pan leche')).toBe(false)
  })

  it('matches everything for an empty query', () => {
    expect(matchesQuery('lo que sea', '   ')).toBe(true)
  })
})
