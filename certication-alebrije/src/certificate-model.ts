export type Placement = 'principal' | 'anexo'
export type Orientation = 'vertical' | 'horizontal'
export type OverflowPolicy = 'automatico' | 'siempre' | 'consultar'

export type Photo = {
  id: string
  name: string
  type: string
  blob: Blob
}

export type Motif = {
  id: string
  name: string
  meaning: string
  placement: Placement
  photos: Photo[]
}

export type CertificateFields = {
  obra: string
  autor: string
  materiales: string
  tecnicas: string
  medidas: string
  descripcion: string
  origen: string
  piecePhotos: Photo[]
  motifs: Motif[]
  orientation: Orientation
  overflow: OverflowPolicy
}

export type Certificate = CertificateFields & {
  id: string
  updated: string
}

export type TextField = 'obra' | 'autor' | 'materiales' | 'tecnicas' | 'medidas' | 'descripcion' | 'origen'

export function emptyFields(): CertificateFields {
  return {
    obra: '', autor: '', materiales: '', tecnicas: '', medidas: '',
    descripcion: '', origen: 'San Martín Tilcajete, Oaxaca',
    piecePhotos: [], motifs: [], orientation: 'vertical', overflow: 'automatico',
  }
}

export function normalizeFields(input: Partial<CertificateFields>): CertificateFields {
  const base = emptyFields()
  const textKeys: TextField[] = ['obra', 'autor', 'materiales', 'tecnicas', 'medidas', 'descripcion', 'origen']
  for (const key of textKeys) {
    if (typeof input[key] === 'string') base[key] = input[key]
  }
  base.orientation = input.orientation === 'horizontal' ? 'horizontal' : 'vertical'
  base.overflow = input.overflow === 'siempre' || input.overflow === 'consultar' ? input.overflow : 'automatico'
  base.piecePhotos = Array.isArray(input.piecePhotos) ? input.piecePhotos.filter(isPhoto) : []
  base.motifs = Array.isArray(input.motifs)
    ? input.motifs.filter((item): item is Motif => Boolean(item && typeof item.id === 'string'))
      .map(item => ({
        id: item.id, name: typeof item.name === 'string' ? item.name : '',
        meaning: typeof item.meaning === 'string' ? item.meaning : '',
        placement: item.placement === 'anexo' ? 'anexo' : 'principal',
        photos: Array.isArray(item.photos) ? item.photos.filter(isPhoto) : [],
      }))
    : []
  return base
}

function isPhoto(item: unknown): item is Photo {
  if (!item || typeof item !== 'object') return false
  const photo = item as Partial<Photo>
  return typeof photo.id === 'string' && typeof photo.name === 'string' && photo.blob instanceof Blob
}
