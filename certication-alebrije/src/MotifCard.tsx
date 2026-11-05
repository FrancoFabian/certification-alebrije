import type { Motif } from './certificate-model'
import { PhotoPicker } from './PhotoPicker'

export function MotifCard({ motif, index, total, onEdit, onDelete, onMove }: {
  motif: Motif; index: number; total: number
  onEdit: (next: Motif) => void; onDelete: () => void; onMove: (offset: number) => void
}) {
  return <article className="motif-card">
    <div className="motif-card-head">
      <div><span>TIRA {String(index + 1).padStart(2, '0')}</span><strong>{motif.name || 'Patrón sin identificar'}</strong></div>
      <div className="motif-order">
        <button type="button" disabled={index === 0} aria-label="Subir tira" onClick={() => onMove(-1)}>↑</button>
        <button type="button" disabled={index === total - 1} aria-label="Bajar tira" onClick={() => onMove(1)}>↓</button>
        <button type="button" aria-label="Eliminar tira" onClick={onDelete}>×</button>
      </div>
    </div>
    <label className="motif-include"><input type="checkbox" checked={motif.included !== false}
      onChange={event => onEdit({ ...motif, included: event.target.checked })}/>
      <span><strong>Conservar esta tira</strong><small>Si la desmarcas, se conserva en el borrador pero no se usará en el certificado.</small></span>
    </label>
    <PhotoPicker title="Tira visual de la greca" help="Una imagen horizontal del patrón. En modo agente será el resultado del análisis; en manual puedes adjuntarla."
      photos={motif.strip ? [motif.strip] : []} limit={1}
      onChange={photos => onEdit({ ...motif, strip: photos[0] })}/>
    <label className="motif-input">Nombre o identificación (opcional)
      <input maxLength={140} value={motif.name} placeholder="Ej. Greca de caracol"
        onChange={e => onEdit({ ...motif, name: e.target.value })}/>
    </label>
    <label className="motif-input">¿Qué significa para el artesano? (opcional)
      <textarea rows={3} maxLength={1800} value={motif.meaning}
        placeholder="Descripción proporcionada por el artesano, sin inventar interpretaciones."
        onChange={e => onEdit({ ...motif, meaning: e.target.value })}/>
    </label>
    <fieldset className="motif-priority"><legend>¿Dónde colocar esta tira?</legend>
      <label className={motif.placement === 'principal' ? 'selected' : ''}>
        <input type="radio" name={'placement-' + motif.id} checked={motif.placement === 'principal'}
          onChange={() => onEdit({ ...motif, placement: 'principal' })}/>
        Destacar <small>Prioritaria en el certificado</small>
      </label>
      <label className={motif.placement === 'anexo' ? 'selected' : ''}>
        <input type="radio" name={'placement-' + motif.id} checked={motif.placement === 'anexo'}
          onChange={() => onEdit({ ...motif, placement: 'anexo' })}/>
        Segundo plano <small>Prioritaria para el anexo</small>
      </label>
    </fieldset>
    <PhotoPicker title="Otras fotografías de esta greca" help="Detalles de apoyo; no tienen que mostrarse en el certificado."
      photos={motif.photos} limit={4} onChange={photos => onEdit({ ...motif, photos })}/>
  </article>
}
