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

export type CertificateFields = {
  obra: string
  autor: string
  materiales: string
  tecnicas: string
  materialItems: CatalogDetail[]
  techniqueItems: CatalogDetail[]
  medidas: string
  descripcion: string
  tiempoElaboracion: string
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
    obra: '', autor: '', materiales: '', tecnicas: '', materialItems: [], techniqueItems: [], medidas: '', descripcion: '', tiempoElaboracion: '',
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
