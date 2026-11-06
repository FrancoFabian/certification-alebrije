import { describe, expect, it } from 'bun:test'
import { emptyFields, normalizeFields } from '../src/certificate-model'
import { normalizedName, suggestedArtisans, suggestedTags } from '../src/reuse-catalog'
import type { Certificate } from '../src/certificate-model'

function record(id: string, autor: string, materials: string[], techniques: string[]): Certificate {
  const value = emptyFields()
  return {
    ...value, id, updated: '2026-11-05T20:00:00.000Z', autor,
    materialItems: materials.map((name, index) => ({ id: 'm' + index, name, description: '' })),
    techniqueItems: techniques.map((name, index) => ({ id: 't' + index, name, description: '' })),
  }
}

describe('Saved certificate catalogs', () => {
  it('keeps legacy free-text material and technique values when loading older drafts', () => {
    const result = normalizeFields({ materiales: 'Madera de copal', tecnicas: 'Tallado tradicional' })
    expect(result.materialItems).toHaveLength(1)
    expect(result.materialItems[0].name).toBe('Madera de copal')
    expect(result.techniqueItems[0].name).toBe('Tallado tradicional')
    expect(result.materiales).toBe('Madera de copal')
  })

  it('keeps per-piece descriptions and synchronizes legacy summary strings', () => {
    const result = normalizeFields({
      materialItems: [
        { id: 'wood', name: 'Madera de copal', description: 'Pieza tallada manualmente' },
        { id: 'paint', name: 'Pintura acrílica', description: '' },
      ],
      techniqueItems: [{ id: 'tallado', name: 'Tallado a mano', description: 'Acabado fino' }],
      materiales: 'old unstructured text',
    })
    expect(result.materiales).toBe('Madera de copal, Pintura acrílica')
    expect(result.materialItems[0].description).toBe('Pieza tallada manualmente')
    expect(result.tecnicas).toBe('Tallado a mano')
  })

  it('deduplicates accents and case in imported tags', () => {
    const result = normalizeFields({
      materialItems: [
        { id: 'a', name: 'Acrílico', description: '' },
        { id: 'b', name: 'acrilico', description: '' },
      ],
    })
    expect(normalizedName('ACRÍLICO')).toBe(normalizedName('acrilico'))
    expect(result.materialItems).toHaveLength(1)
  })

  it('suggests the most recently saved artisan first and handles a new one', () => {
    const recent = record('1', 'Pedro Martínez', ['Madera de copal'], ['Tallado'])
    const older = record('2', 'Leticia Fabián', ['Pigmento mineral'], ['Pintura a mano'])
    const repeated = record('3', 'PEDRO MARTINEZ', [], [])
    expect(suggestedArtisans([recent, older, repeated])).toEqual(['Pedro Martínez', 'Leticia Fabián'])
  })

  it('prefers previously used materials and techniques to starter suggestions', () => {
    const recent = record('1', 'Pedro', ['Pigmento mineral', 'Copal local'], ['Tallado a mano'])
    expect(suggestedTags([recent], 'material').slice(0, 2)).toEqual(['Pigmento mineral', 'Copal local'])
    expect(suggestedTags([recent], 'technique')[0]).toBe('Tallado a mano')
  })
})
