import type { CatalogDetail, Certificate } from './certificate-model'

export type CatalogKind = 'material' | 'technique'

export const MATERIAL_STARTERS = ['Madera de copal', 'Pigmento mineral', 'Pintura acrílica']
export const TECHNIQUE_STARTERS = ['Tallado a mano', 'Pintura a mano']

export function normalizedName(value: string): string {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
}

/** Most recently used names first, deduplicated across drafts. */
export function suggestedArtisans(records: Certificate[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const record of records) {
    const name = record.autor.trim()
    const key = normalizedName(name)
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(name)
  }
  return result
}

export function suggestedTags(records: Certificate[], kind: CatalogKind): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  const add = (value: string) => {
    const name = value.trim()
    const key = normalizedName(name)
    if (!key || seen.has(key)) return
    seen.add(key)
    result.push(name)
  }
  for (const record of records) {
    const entries: CatalogDetail[] = kind === 'material' ? record.materialItems : record.techniqueItems
    for (const entry of entries || []) add(entry.name)
  }
  for (const starter of kind === 'material' ? MATERIAL_STARTERS : TECHNIQUE_STARTERS) add(starter)
  return result
}
