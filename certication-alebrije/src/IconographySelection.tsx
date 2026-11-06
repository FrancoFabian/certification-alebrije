import type { Dispatch, SetStateAction } from 'react'
import type { CertificateFields, Motif } from './certificate-model'
import { MotifCard } from './MotifCard'

export function IconographySelection({ value, onUpdate, onGoCapture }: {
  value: CertificateFields
  onUpdate: Dispatch<SetStateAction<CertificateFields>>
  onGoCapture: () => void
}) {
  function update(id: string, next: Motif) {
    onUpdate(previous => ({
      ...previous,
      motifs: previous.motifs.map(motif => motif.id === id ? next : motif),
    }))
  }
  function add() {
    onUpdate(previous => ({ ...previous, motifs: [...previous.motifs, {
      id: crypto.randomUUID(), name: '', meaning: '', placement: 'principal',
      included: true, origin: 'manual', photos: [],
    }] }))
  }
  function move(index: number, delta: number) {
    onUpdate(previous => {
      const motifs = [...previous.motifs]
      const next = index + delta
      if (next < 0 || next >= motifs.length) return previous
      ;[motifs[index], motifs[next]] = [motifs[next], motifs[index]]
      return { ...previous, motifs }
    })
  }
  const selected = value.motifs.filter(motif => motif.included !== false)
  const primary = selected.filter(motif => motif.placement === 'principal')
  const secondary = selected.filter(motif => motif.placement === 'anexo')

  if (value.iconographyMode === 'omitir') return <div className="flow-stack">
    <p className="flow-step-help">Se omitirán las grecas del certificado. La información capturada se conservará si cambias de modo.</p>

    <button type="button" className="flow-secondary-link" onClick={onGoCapture}>Cambiar modo de captura</button>
  </div>

  return <div className="flow-stack">
    <div className="selection-stats">
      <div><strong>{selected.length}</strong><span>Conservadas</span></div>
      <div><strong>{primary.length}</strong><span>Principales</span></div>
      <div><strong>{secondary.length}</strong><span>Anexo</span></div>
    </div>
    {value.iconographyMode === 'agente' && value.motifs.length === 0 &&
      <div className="flow-panel agent-pending"><strong>Falta obtener las tiras del análisis</strong>
        <p>Las fotos están guardadas, pero todavía no hay un proveedor de visión conectado. No mostraremos detecciones inventadas. Cuando exista la API, aquí se verán las tiras extraídas para aceptarlas o descartarlas.</p>
        <button type="button" disabled>Analizar grecas — integración pendiente</button>
        <button type="button" className="flow-secondary-link" onClick={onGoCapture}>Volver a fotografías</button>
      </div>}
    {value.motifs.length > 0 && <div className="flow-panel">
      <div className="motif-intro">
        <strong>Selecciona y ordena.</strong>
        <p>La primera tira conservada tiene mayor prioridad. Puedes moverlas, excluirlas o cambiar entre primera página y anexo.</p>
      </div>
      {value.motifs.map((motif, index) => <MotifCard key={motif.id} motif={motif}
        index={index} total={value.motifs.length} onEdit={next => update(motif.id, next)}
        onDelete={() => onUpdate(previous => ({ ...previous, motifs: previous.motifs.filter(item => item.id !== motif.id) }))}
        onMove={delta => move(index, delta)}/>)}
    </div>}
    {value.iconographyMode === 'manual' &&
      <button type="button" className="motif-add flow-add-motif" onClick={add}>+ Añadir tira o greca manualmente</button>}
    {value.iconographyMode === 'manual' && value.motifs.length === 0 &&
      <p className="flow-muted-note">Puedes continuar sin grecas o añadir una tira fotografiada por el artesano.</p>}
    <p className="flow-muted-note">La prioridad queda guardada; el ajuste automático entre hojas se implementará con el generador PDF.</p>
  </div>
}
