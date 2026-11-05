import type { Motif } from './certificate-model'
import { PhotoPicker } from './PhotoPicker'

export function MotifCard({ motif, index, total, onEdit, onDelete, onMove }: {
  motif: Motif; index: number; total: number
  onEdit: (next: Motif) => void; onDelete: () => void; onMove: (offset: number) => void
}) {
  return <article className="motif-card">
    <div className="motif-card-head">
      <div><span>GRECA {String(index + 1).padStart(2, '0')}</span><strong>{motif.name || 'Sin nombre todavía'}</strong></div>
      <div className="motif-order">
        <button type="button" disabled={index === 0} aria-label="Mover arriba" onClick={() => onMove(-1)}>↑</button>
        <button type="button" disabled={index === total - 1} aria-label="Mover abajo" onClick={() => onMove(1)}>↓</button>
        <button type="button" aria-label="Quitar greca" onClick={onDelete}>×</button>
      </div>
    </div>
    <label className="motif-input">Nombre de la greca o símbolo
      <input maxLength={140} value={motif.name} placeholder="Ej. Greca del caracol"
        onChange={e => onEdit({ ...motif, name: e.target.value })}/>
    </label>
    <label className="motif-input">Significado / interpretación del artesano
      <textarea rows={3} maxLength={1800} value={motif.meaning} placeholder="¿Qué representa este símbolo?"
        onChange={e => onEdit({ ...motif, meaning: e.target.value })}/>
    </label>
    <fieldset className="motif-priority"><legend>Prioridad de este símbolo</legend>
      <label className={motif.placement === 'principal' ? 'selected' : ''}>
        <input type="radio" name={'placement-' + motif.id} checked={motif.placement === 'principal'}
          onChange={() => onEdit({ ...motif, placement: 'principal' })}/>
        Principal <small>Prioridad en la primera hoja</small>
      </label>
      <label className={motif.placement === 'anexo' ? 'selected' : ''}>
        <input type="radio" name={'placement-' + motif.id} checked={motif.placement === 'anexo'}
          onChange={() => onEdit({ ...motif, placement: 'anexo' })}/>
        Complementaria <small>Prioridad para el anexo</small>
      </label>
    </fieldset>
    <PhotoPicker title="Fotografías de esta greca" help="Fotografías de detalle del símbolo."
      photos={motif.photos} limit={4} onChange={photos => onEdit({ ...motif, photos })}/>
  </article>
}
