import type { CertificateFields, Motif } from './certificate-model'
import { PhotoThumb } from './PhotoPicker'

function Group({ title, motifs }: { title: string; motifs: Motif[] }) {
  return <section className="summary-motif-group"><h3>{title}</h3>
    {motifs.map(motif => <article key={motif.id} className="summary-motif">
      <strong>{motif.name || 'Patrón visual sin nombre'}</strong>
      {motif.strip && <div className="summary-strip"><PhotoThumb photo={motif.strip}/></div>}
      {motif.meaning && <p>{motif.meaning}</p>}
      {!motif.strip && motif.photos.length > 0 && <div className="summary-photos">
        {motif.photos.map(photo => <PhotoThumb key={photo.id} photo={photo}/>)}
      </div>}
    </article>)}
  </section>
}

export function IconographySummary({ value }: { value: CertificateFields }) {
  if (value.iconographyMode === 'omitir') return <section className="iconography-summary">
    <div className="summary-title"><span>ICONOGRAFÍA</span><strong>Omitida</strong></div>
    <p>Esta obra no llevará una sección de grecas en el certificado.</p>
  </section>

  const selected = value.motifs.filter(motif => motif.included !== false)
  const primary = selected.filter(motif => motif.placement === 'principal')
  const secondary = selected.filter(motif => motif.placement === 'anexo')
  return <section className="iconography-summary">
    <div className="summary-title"><span>TIRAS SELECCIONADAS</span>
      <strong>{selected.length} de {value.motifs.length}</strong></div>
    <div className="summary-detail"><span>Modo</span>
      <strong>{value.iconographyMode === 'agente' ? 'Agente (pendiente)' : 'Manual'}</strong></div>
    <div className="summary-detail"><span>Orientación</span>
      <strong>{value.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}</strong></div>
    <div className="summary-detail"><span>Política de anexo</span>
      <strong>{value.overflow === 'automatico' ? 'Automática' :
        value.overflow === 'siempre' ? 'Siempre' : 'Consultar'}</strong></div>
    <div className="summary-detail"><span>Fotos de la pieza</span><strong>{value.piecePhotos.length}</strong></div>
    {value.piecePhotos.length > 0 && <div className="summary-photos">
      {value.piecePhotos.map(photo => <PhotoThumb key={photo.id} photo={photo}/>)}
    </div>}
    {primary.length > 0 && <Group title="Para destacar en el certificado" motifs={primary}/>}
    {secondary.length > 0 && <Group title="En segundo plano / anexo" motifs={secondary}/>}
    {!selected.length && <p>Todavía no hay tiras seleccionadas. Puedes regresar al cuarto paso para añadirlas.</p>}
    <p className="summary-footnote">Esta es la selección, no la distribución definitiva del PDF. Las fotografías descartadas siguen en el borrador.</p>
  </section>
}
