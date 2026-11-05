import type { CertificateFields, Motif } from './certificate-model'
import { PhotoThumb } from './PhotoPicker'

function Group({ title, motifs }: { title: string; motifs: Motif[] }) {
  return <section className="summary-motif-group"><h3>{title}</h3>{motifs.map(motif =>
    <article key={motif.id} className="summary-motif">
      <strong>{motif.name || 'Greca sin nombre'}</strong>
      <p>{motif.meaning || 'Interpretación pendiente'}</p>
      {motif.photos.length > 0 && <div className="summary-photos">{motif.photos.map(photo =>
        <PhotoThumb key={photo.id} photo={photo}/>
      )}</div>}
    </article>)}</section>
}

export function IconographySummary({ value }: { value: CertificateFields }) {
  const featured = value.motifs.filter(item => item.placement === 'principal')
  const secondary = value.motifs.filter(item => item.placement === 'anexo')
  return <section className="iconography-summary">
    <div className="summary-title"><span>REGISTRO DE ICONOGRAFÍA</span><strong>{value.motifs.length} símbolos</strong></div>
    <div className="summary-detail"><span>Orientación</span><strong>{value.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}</strong></div>
    <div className="summary-detail"><span>Anexo</span><strong>{value.overflow === 'automatico' ? 'Automático' : value.overflow === 'siempre' ? 'Siempre' : 'Consultar'}</strong></div>
    <div className="summary-detail"><span>Fotos de la pieza</span><strong>{value.piecePhotos.length}</strong></div>
    {value.piecePhotos.length > 0 && <div className="summary-photos">{value.piecePhotos.map(photo =>
      <PhotoThumb key={photo.id} photo={photo}/>
    )}</div>}
    {featured.length > 0 && <Group title="Destacadas en la primera página" motifs={featured}/>}
    {secondary.length > 0 && <Group title="Candidatas para el anexo" motifs={secondary}/>}
    {value.motifs.length === 0 && <p>Aún no registraste símbolos. Puedes añadirlos desde el formulario.</p>}
    <p className="summary-footnote">Este resumen no es todavía el diseño final del PDF. No se descarta ninguna greca automáticamente.</p>
  </section>
}
