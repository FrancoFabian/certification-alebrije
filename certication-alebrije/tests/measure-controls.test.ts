import { describe, expect, it } from 'bun:test'
import {
  emptyDimensions, emptyDuration, dimensionToCm, dimensionToDisplay,
  formatDimensions, formatDuration, normalizeFields,
} from '../src/certificate-model'

describe('Duration input', () => {
  it('formats human-friendly plural and singular periods', () => {
    expect(formatDuration({ quantity: 1, unit: 'meses' })).toBe('1 mes')
    expect(formatDuration({ quantity: 11, unit: 'meses' })).toBe('11 meses')
    expect(formatDuration({ quantity: 1, unit: 'anios' })).toBe('1 año')
    expect(formatDuration({ quantity: null, unit: 'semanas' })).toBe('')
  })

  it('keeps unstructured time from older documents', () => {
    const old = normalizeFields({ tiempoElaboracion: '11 meses' })
    expect(old.tiempoElaboracion).toBe('11 meses')
    expect(old.duration).toEqual(emptyDuration())
  })

  it('uses typed time once defined', () => {
    const newer = normalizeFields({
      tiempoElaboracion: 'Old',
      duration: { quantity: 11, unit: 'meses' },
    })
    expect(newer.tiempoElaboracion).toBe('11 meses')
  })

  it('rejects invalid persisted values', () => {
    expect(normalizeFields({ duration: { quantity: -9, unit: 'meses' } }).duration.quantity).toBe(null)
    expect(normalizeFields({ duration: { quantity: 1.5, unit: 'meses' } }).duration.quantity).toBe(null)
  })
})

describe('Dimensions and physical units', () => {
  it('keeps old unstructured text instead of guessing width/height order', () => {
    const old = normalizeFields({ medidas: '30 × 18 × 12 cm' })
    expect(old.medidas).toBe('30 × 18 × 12 cm')
    expect(old.dimensions).toEqual(emptyDimensions())
  })

  it('converts inches to centimeters exactly at storage boundary', () => {
    expect(dimensionToCm(1, 'in')).toBe(2.54)
    expect(dimensionToDisplay(2.54, 'in')).toBe(1)
    expect(dimensionToCm(1, 'm')).toBe(100)
    expect(dimensionToDisplay(100, 'm')).toBe(1)
  })

  it('formats numeric measures without filling missing axes', () => {
    const dimensions = { ...emptyDimensions(), widthCm: 30, heightCm: 18, depthCm: null }
    const output = formatDimensions(dimensions)
    expect(output).toContain('Ancho 30 cm')
    expect(output).toContain('Alto 18 cm')
    expect(output).not.toContain('Prof.')
  })

  it('uses structured data to replace the legacy string when present', () => {
    const record = normalizeFields({
      medidas: '50 x 30',
      dimensions: { widthCm: 30, heightCm: 50, depthCm: 20, unit: 'cm' },
    })
    expect(record.medidas).toBe('Ancho 30 cm · Alto 50 cm · Prof. 20 cm')
    expect(record.dimensions.heightCm).toBe(50)
  })

  it('does not accept NaN and negative physical dimensions from storage', () => {
    const record = normalizeFields({
      dimensions: { widthCm: Number.NaN, heightCm: -1, depthCm: 20, unit: 'cm' },
    })
    expect(record.dimensions.widthCm).toBe(null)
    expect(record.dimensions.heightCm).toBe(null)
    expect(record.dimensions.depthCm).toBe(20)
  })
})
