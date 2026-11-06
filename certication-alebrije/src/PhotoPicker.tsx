import { useEffect, useId, useState } from 'react'
import type { Photo } from './certificate-model'

export function PhotoThumb({ photo, onRemove }: { photo: Photo; onRemove?: () => void }) {
  const [url, setUrl] = useState('')
  const [broken, setBroken] = useState(false)
  useEffect(() => {
    const objectUrl = URL.createObjectURL(photo.blob)
    setUrl(objectUrl)
    setBroken(false)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo.blob])
  return <div className="photo-thumb">
    {url && !broken ? <img src={url} alt={photo.name} onError={() => setBroken(true)} /> : <span className="photo-fallback">Imagen adjunta</span>}
    {onRemove && <button type="button" className="photo-remove" aria-label={'Quitar ' + photo.name} onClick={onRemove}>×</button>}
    <small title={photo.name}>{photo.name}</small>
  </div>
}

export function PhotoPicker({ title, help, photos, limit, onChange }: {
  title: string; help: string; photos: Photo[]; limit: number; onChange: (photos: Photo[]) => void
}) {
  const id = useId()
  const [warning, setWarning] = useState('')
  const full = photos.length >= limit
  function add(files: FileList | null) {
    if (!files) return
    const selected = Array.from(files)
    const valid = selected.filter(file => file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|avif)$/i.test(file.name))
    const sized = valid.filter(file => file.size <= 15 * 1024 * 1024)
    const remaining = Math.max(limit - photos.length, 0)
    const additions = sized.slice(0, remaining).map(file => ({
      id: crypto.randomUUID(), name: file.name, type: file.type || 'application/octet-stream', blob: file as Blob,
    }))
    if (additions.length) onChange([...photos, ...additions])
    setWarning(valid.length !== selected.length ? 'Solo se aceptan imágenes.' :
      valid.length !== sized.length ? 'Cada imagen debe pesar máximo 15 MB.' :
      sized.length > remaining ? 'Alcanzaste el límite de imágenes.' : '')
  }
  return <section className="photo-picker" aria-label={title}>
    <div className="picker-heading"><strong>{title}</strong><span>{photos.length}/{limit}</span></div>
    <p>{help}</p>
    {photos.length > 0 && <div className="photo-grid">{photos.map(photo =>
      <PhotoThumb key={photo.id} photo={photo} onRemove={() => onChange(photos.filter(item => item.id !== photo.id))}/>
    )}</div>}
    <label className={'photo-upload' + (full ? ' is-full' : '')} htmlFor={id}>
      <span className="upload-plus">+</span><span>{full ? 'Límite alcanzado' : photos.length ? 'Añadir fotografías' : 'Tomar foto o elegir de la galería'}</span>
      <input id={id} type="file" accept="image/*" multiple disabled={full}
        onChange={event => { add(event.currentTarget.files); event.currentTarget.value = '' }}/>
    </label>
    {warning && <p className="picker-warning" role="status">{warning}</p>}
  </section>
}
