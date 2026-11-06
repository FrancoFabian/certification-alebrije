import type { Dispatch, SetStateAction } from 'react'
import type { CertificateFields, Motif, Orientation, OverflowPolicy } from './certificate-model'
import { PhotoPicker } from './PhotoPicker'
import { MotifCard } from './MotifCard'

export function IconographyForm({ value, onUpdate }: {
  value: CertificateFields
  onUpdate: Dispatch<SetStateAction<CertificateFields>>
}) {
  function edit(id: string, next: Motif) {
    onUpdate(previous => ({ ...previous, motifs: previous.motifs.map(motif => motif.id === id ? next : motif) }))
  }
  function move(index: number, offset: number) {
    onUpdate(previous => {
      const motifs = [...previous.motifs]
      const dest = index + offset
      if (dest < 0 || dest >= motifs.length) return previous
      ;[motifs[index], motifs[dest]] = [motifs[dest], motifs[index]]
      return { ...previous, motifs }
    })
  }
  function add() {
    onUpdate(previous => ({ ...previous, motifs: [...previous.motifs, {
      id: crypto.randomUUID(), name: '', meaning: '', placement: 'principal', photos: [],
    }] }))
  }
  const orientations: Array<{ id: Orientation; title: string; info: string }> = [
    { id: 'vertical', title: 'Vertical', info: 'Formato retrato' },
    { id: 'horizontal', title: 'Horizontal', info: 'Formato apaisado' },
  ]
  const overflowOptions: Array<{ id: OverflowPolicy; title: string; info: string }> = [
    { id: 'automatico', title: 'Automático', info: 'Crear anexo cuando no quepa el contenido.' },
    { id: 'siempre', title: 'Siempre con anexo', info: 'Reservar una segunda hoja para los símbolos complementarios.' },
    { id: 'consultar', title: 'Preguntarme', info: 'Solicitar confirmación antes de crear un anexo.' },
  ]
  return <>
    <div className="form-caption">02 <span>FOTOGRAFÍAS DE LA PIEZA</span></div>
    <div className="form-section-panel">
      <p className="form-section-lead">Registra la obra de frente, por detrás, en sus laterales y detalles. Estas imágenes documentan los motivos que no se aprecian desde un solo ángulo.</p>
      <PhotoPicker title="Vistas de la obra" help="Los originales se conservan en el borrador local."
        photos={value.piecePhotos} limit={12}
        onChange={piecePhotos => onUpdate(previous => ({ ...previous, piecePhotos }))}/>
    </div>
    <div className="form-caption">03 <span>GRECAS E ICONOGRAFÍA</span></div>
    <div className="form-section-panel">
      <div className="motif-intro"><strong>Los símbolos cuentan otra historia.</strong>
        <p>Agrega cada greca con una descripción, su significado y las fotos que muestran dónde aparece.</p></div>
      {value.motifs.map((motif, index) => <MotifCard key={motif.id} motif={motif} index={index} total={value.motifs.length}
        onEdit={next => edit(motif.id, next)}
        onDelete={() => onUpdate(previous => ({ ...previous, motifs: previous.motifs.filter(item => item.id !== motif.id) }))}
        onMove={offset => move(index, offset)}/>)}
      <button type="button" className="motif-add" onClick={add}>+ Agregar greca o símbolo</button>
      <div className="ai-future"><span className="ai-future-icon">✳</span><div>
        <strong>Análisis asistido por IA — próxima fase</strong>
        <p>En el futuro podrá sugerir regiones y símbolos a partir de varias fotos. Pedro confirmará su identificación y significado; por ahora el registro es manual.</p>
      </div></div>
    </div>
    <div className="form-caption">04 <span>FORMATO DEL CERTIFICADO</span></div>
    <div className="form-section-panel">
      <fieldset className="format-fieldset"><legend>Orientación del documento</legend>
        <div className="orientation-grid">{orientations.map(option =>
          <label key={option.id} className={'orientation-tile' + (value.orientation === option.id ? ' selected' : '')}>
            <input type="radio" name="orientation" checked={value.orientation === option.id}
              onChange={() => onUpdate(previous => ({ ...previous, orientation: option.id }))}/>
            <span className={'orientation-shape ' + option.id} aria-hidden="true"/>
            <strong>{option.title}</strong><small>{option.info}</small>
          </label>
        )}</div>
      </fieldset>
      <fieldset className="format-fieldset overflow-fieldset"><legend>Cuando el contenido supere una página</legend>
        {overflowOptions.map(option =>
          <label key={option.id} className={'overflow-row' + (value.overflow === option.id ? ' selected' : '')}>
            <input type="radio" name="overflow" checked={value.overflow === option.id}
              onChange={() => onUpdate(previous => ({ ...previous, overflow: option.id }))}/>
            <span><strong>{option.title}</strong><small>{option.info}</small></span>
          </label>
        )}
      </fieldset>
      <p className="format-disclaimer">Estas preferencias ya se guardan, pero el cálculo real de páginas del PDF se implementará con el editor definitivo.</p>
    </div>
  </>
}
