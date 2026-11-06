export type Placement = 'principal' | 'anexo'
export type Orientation = 'vertical' | 'horizontal'
export type OverflowPolicy = 'automatico' | 'siempre' | 'consultar'
export type IconographyMode = 'pendiente' | 'agente' | 'manual' | 'omitir'
export type CaptureAngle = 'frente' | 'derecha' | 'izquierda' | 'reverso' | 'superior' | 'detalle'

export type Photo = {
  id: string
  name: string
  type: string
  blob: Blob
  angle?: CaptureAngle
}
export type Motif = {
  id: string
  name: string
  meaning: string
  placement: Placement
  photos: Photo[]
  /** A horizontal motif strip, photographed manually or extracted with assistance. */
  strip?: Photo
  /** Original photos supporting the extraction. */
  sourcePhotoIds?: string[]
  origin?: 'manual' | 'agente'
  included?: boolean
}
export type CatalogDetail = { id: string; name: string; description: string }

export type DurationUnit = 'dias' | 'semanas' | 'meses' | 'anios'
export type Duration = { quantity: number | null; unit: DurationUnit }
export type DimensionUnit = 'cm' | 'in' | 'm'
/** Canonical length values are centimeters. Unit is only the display preference. */
export type Dimensions = {
  widthCm: number | null
  heightCm: number | null
  depthCm: number | null
  unit: DimensionUnit
}

export const emptyDuration = (): Duration => ({ quantity: null, unit: 'meses' })
export const emptyDimensions = (): Dimensions => ({
  widthCm: null, heightCm: null, depthCm: null, unit: 'cm',
})

export function validDimension(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 1_000_000
    ? value : null
}

export function formatDimension(value: number): string {
  return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 3 }).format(value)
}

export function formatDuration(value: Duration): string {
  const count = value.quantity
  if (count === null || !Number.isInteger(count) || count < 1) return ''
  const singular = { dias: 'día', semanas: 'semana', meses: 'mes', anios: 'año' }
  const plural = { dias: 'días', semanas: 'semanas', meses: 'meses', anios: 'años' }
  return count + ' ' + (count === 1 ? singular[value.unit] : plural[value.unit])
}

export function dimensionToDisplay(cm: number, unit: DimensionUnit): number {
  return unit === 'cm' ? cm : unit === 'm' ? cm / 100 : cm / 2.54
}

export function dimensionToCm(value: number, unit: DimensionUnit): number {
  return unit === 'cm' ? value : unit === 'm' ? value * 100 : value * 2.54
}

export function formatDimensions(value: Dimensions): string {
  const labels = [
    ['Ancho', value.widthCm],
    ['Alto', value.heightCm],
    ['Prof.', value.depthCm],
  ] as const
  return labels
    .filter((item): item is readonly [string, number] => item[1] !== null)
    .map(([name, cm]) => name + ' ' + formatDimension(dimensionToDisplay(cm, value.unit)) + ' ' + value.unit)
    .join(' · ')
}

function normalizeDuration(value: unknown): Duration {
  const base = emptyDuration()
  if (!value || typeof value !== 'object') return base
  const input = value as Partial<Duration>
  base.unit = input.unit === 'dias' || input.unit === 'semanas' || input.unit === 'anios'
    ? input.unit : 'meses'
  base.quantity = typeof input.quantity === 'number' && Number.isInteger(input.quantity)
    && input.quantity >= 1 && input.quantity <= 9999 ? input.quantity : null
  return base
}

function normalizeDimensions(value: unknown): Dimensions {
  const base = emptyDimensions()
  if (!value || typeof value !== 'object') return base
  const input = value as Partial<Dimensions>
  base.unit = input.unit === 'm' || input.unit === 'in' ? input.unit : 'cm'
  base.widthCm = validDimension(input.widthCm)
  base.heightCm = validDimension(input.heightCm)
  base.depthCm = validDimension(input.depthCm)
  return base
}

export type CertificateFields = {
  obra: string
  autor: string
  materiales: string
  tecnicas: string
  materialItems: CatalogDetail[]
  techniqueItems: CatalogDetail[]
  medidas: string
  dimensions: Dimensions
  descripcion: string
  tiempoElaboracion: string
  duration: Duration
  origen: string
  piecePhotos: Photo[]
  motifs: Motif[]
  iconographyMode: IconographyMode
  orientation: Orientation
  overflow: OverflowPolicy
}
export type Certificate = CertificateFields & { id: string; updated: string }
export type TextField = 'obra' | 'autor' | 'materiales' | 'tecnicas' | 'medidas' | 'descripcion' | 'tiempoElaboracion' | 'origen'

export function emptyFields(): CertificateFields {
  return {
    obra: '', autor: '', materiales: '', tecnicas: '', materialItems: [], techniqueItems: [], medidas: '', dimensions: emptyDimensions(), descripcion: '', tiempoElaboracion: '', duration: emptyDuration(),
    origen: 'San Martín Tilcajete, Oaxaca', piecePhotos: [], motifs: [],
    iconographyMode: 'pendiente', orientation: 'vertical', overflow: 'automatico',
  }
}
function isPhoto(item: unknown): item is Photo {
  if (!item || typeof item !== 'object') return false
  const photo = item as Partial<Photo>
  return typeof photo.id === 'string' && typeof photo.name === 'string' &&
    typeof photo.type === 'string' && photo.blob instanceof Blob
}

function normalizeDetails(input: unknown, legacy: string, kind: string): CatalogDetail[] {
  if (!Array.isArray(input)) {
    return legacy.trim() ? [{ id: 'legacy-' + kind, name: legacy.trim(), description: '' }] : []
  }
  const seen = new Set<string>()
  return input.flatMap((candidate, index): CatalogDetail[] => {
    if (!candidate || typeof candidate !== 'object') return []
    const item = candidate as Partial<CatalogDetail>
    const name = typeof item.name === 'string' ? item.name.trim().slice(0, 140) : ''
    const dedup = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
    if (!name || seen.has(dedup)) return []
    seen.add(dedup)
    return [{
      id: typeof item.id === 'string' && item.id ? item.id : kind + '-' + index,
      name,
      description: typeof item.description === 'string' ? item.description.slice(0, 1200) : '',
    }]
  })
}

export function normalizeFields(input: Partial<CertificateFields>): CertificateFields {
  const base = emptyFields()
  const textKeys: TextField[] = ['obra', 'autor', 'materiales', 'tecnicas', 'medidas', 'descripcion', 'tiempoElaboracion', 'origen']
  for (const key of textKeys) if (typeof input[key] === 'string') base[key] = input[key]
  base.materialItems = normalizeDetails(input.materialItems, base.materiales, 'material')
  base.techniqueItems = normalizeDetails(input.techniqueItems, base.tecnicas, 'technique')
  base.materiales = base.materialItems.map(item => item.name).join(', ')
  base.tecnicas = base.techniqueItems.map(item => item.name).join(', ')
  base.duration = normalizeDuration(input.duration)
  base.dimensions = normalizeDimensions(input.dimensions)
  if (base.duration.quantity !== null) base.tiempoElaboracion = formatDuration(base.duration)
  if ([base.dimensions.widthCm, base.dimensions.heightCm, base.dimensions.depthCm].some(value => value !== null)) {
    base.medidas = formatDimensions(base.dimensions)
  }
  base.orientation = input.orientation === 'horizontal' ? 'horizontal' : 'vertical'
  base.overflow = input.overflow === 'siempre' || input.overflow === 'consultar' ? input.overflow : 'automatico'
  base.piecePhotos = Array.isArray(input.piecePhotos) ? input.piecePhotos.filter(isPhoto) : []
  base.motifs = Array.isArray(input.motifs)
    ? input.motifs.filter((item): item is Motif => Boolean(item && typeof item.id === 'string'))
      .map(item => ({
        id: item.id,
        name: typeof item.name === 'string' ? item.name : '',
        meaning: typeof item.meaning === 'string' ? item.meaning : '',
        placement: item.placement === 'anexo' ? 'anexo' : 'principal',
        photos: Array.isArray(item.photos) ? item.photos.filter(isPhoto) : [],
        ...(isPhoto(item.strip) ? { strip: item.strip } : {}),
        sourcePhotoIds: Array.isArray(item.sourcePhotoIds)
          ? item.sourcePhotoIds.filter(id => typeof id === 'string') : [],
        origin: item.origin === 'agente' ? 'agente' : 'manual',
        included: item.included !== false,
      })) : []
  if (input.iconographyMode === 'agente' || input.iconographyMode === 'manual' ||
      input.iconographyMode === 'omitir' || input.iconographyMode === 'pendiente') {
    base.iconographyMode = input.iconographyMode
  } else if (base.motifs.length || base.piecePhotos.length) {
    // Old local drafts had manually-entered iconography without an explicit mode.
    base.iconographyMode = 'manual'
  }
  return base
}
