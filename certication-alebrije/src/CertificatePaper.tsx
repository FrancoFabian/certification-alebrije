import type { CertificateFields } from './certificate-model'
export function CertificatePaper({ values }: { values: CertificateFields }) {
  return <article className="certificate-paper" aria-label="Maqueta del certificado">
    <div className="paper-brand"><span className="paper-mark">✳</span><span><b>Árbol que nunca muere</b><small>TALLER DE MÁSCARAS Y ALEBRIJES</small></span></div>
    <div className="paper-rule"/>
    <small className="paper-overline">SAN MARTÍN TILCAJETE · OAXACA</small>
    <h2>Certificado<br/><em>de autenticidad</em></h2>
    <p className="paper-intro">Se hace constar que la siguiente obra es una creación artesanal original, elaborada en nuestro taller.</p>
    <div className="paper-feature"><small>OBRA</small><strong>{values.obra || 'Nombre de la obra'}</strong></div>
    <div className="paper-columns"><div><small>ARTESANO</small><p>{values.autor || '—'}</p></div><div><small>DIMENSIONES</small><p>{values.medidas || '—'}</p></div></div>
    <div className="paper-row"><small>MATERIALES</small><p>{values.materiales || '—'}</p></div>
    <div className="paper-row"><small>TÉCNICAS</small><p>{values.tecnicas || '—'}</p></div>
    <div className="paper-row"><small>DESCRIPCIÓN E ICONOGRAFÍA</small><p>{values.descripcion || '—'}</p></div>
    <div className="paper-signature"><span><small>LUGAR DE ORIGEN</small><b>{values.origen || '—'}</b></span><span><i/><small>FIRMA DEL ARTESANO</small></span></div>
    <div className="paper-end">ÁRBOL QUE NUNCA MUERE <span>✳</span> OAXACA, MÉXICO</div>
  </article>
}
