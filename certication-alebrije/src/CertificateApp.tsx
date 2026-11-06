import { useState } from 'react'
import './mobile.css'

type Page = 'inicio' | 'crear' | 'vista' | 'archivo'
type Fields = { obra: string; autor: string; materiales: string; tecnicas: string; medidas: string; descripcion: string; origen: string }
type Certificate = Fields & { id: string; updated: string }
const key = 'certification-alebrije:drafts:v1'
const blank: Fields = { obra: '', autor: '', materiales: '', tecnicas: '', medidas: '', descripcion: '', origen: 'San Martín Tilcajete, Oaxaca' }
const shapes = {
  add: 'M12 5v14M5 12h14',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'm15 18-6-6 6-6',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  archive: 'M3 4h18v4H3zM5 8v12h14V8m-10 4h6',
  edit: 'm16 4 4 4M4 20l4.8-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.8 16z',
  file: 'M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm7 0v6h5M9 14h6',
  search: 'm21 21-5-5m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
  check: 'm5 12 5 5L20 7',
}
type IconKey = keyof typeof shapes
function Icon({ name, size = 22 }: { name: IconKey; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={shapes[name]}/></svg>
}
function readDrafts(): Certificate[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(key) || '[]')
    if (!Array.isArray(data)) return []
    return data.filter((item): item is Certificate => item !== null && typeof item === 'object' && typeof item.id === 'string' && typeof item.obra === 'string' && typeof item.updated === 'string')
  } catch { return [] }
}
function date(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}
function Paper({ values }: { values: Fields }) {
  return <article className="certificate-paper" aria-label="Vista preliminar del certificado">
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
const initial: Page = 'inicio'
export default function CertificateApp() {
  const [page, setPage] = useState<Page>(initial)
  const [drafts, setDrafts] = useState<Certificate[]>(readDrafts)
  const [values, setValues] = useState<Fields>({ ...blank })
  const [editing, setEditing] = useState<string | null>(null)
  const [term, setTerm] = useState('')
  const [feedback, setFeedback] = useState('')
  const latest = drafts[0]
  const filtered = drafts.filter(item => (item.obra + ' ' + item.autor).toLocaleLowerCase('es').includes(term.toLocaleLowerCase('es')))
  function go(next: Page) {
    setPage(next)
    setFeedback('')
    window.scrollTo(0, 0)
  }
  function start() { setValues({ ...blank }); setEditing(null); go('crear') }
  function open(item: Certificate) {
    setEditing(item.id)
    setValues({ obra: item.obra, autor: item.autor, materiales: item.materiales, tecnicas: item.tecnicas, medidas: item.medidas, descripcion: item.descripcion, origen: item.origen })
    go('crear')
  }
  function setField(field: keyof Fields, value: string) {
    setValues(previous => ({ ...previous, [field]: value }))
    setFeedback('')
  }
  function save() {
    if (!values.obra.trim()) { setFeedback('Indica primero el nombre de la obra.'); return }
    const id = editing || crypto.randomUUID()
    const item: Certificate = { ...values, obra: values.obra.trim(), id, updated: new Date().toISOString() }
    const next = [item, ...drafts.filter(draft => draft.id !== id)]
    try {
      localStorage.setItem(key, JSON.stringify(next))
      setDrafts(next); setEditing(id); setFeedback('Borrador guardado en este dispositivo.')
    } catch { setFeedback('No se pudo guardar. Comprueba el espacio del navegador.') }
  }
  function remove(id: string) {
    if (!window.confirm('¿Eliminar este borrador del dispositivo?')) return
    const next = drafts.filter(item => item.id !== id)
    try { localStorage.setItem(key, JSON.stringify(next)); setDrafts(next) }
    catch { setFeedback('No se pudo eliminar el borrador.') }
  }
  const formInputs: Array<{ label: string; name: keyof Fields; placeholder: string; multiline?: boolean }> = [
    { label: 'Nombre de la obra', name: 'obra', placeholder: 'Ej. Espíritu del monte' },
    { label: 'Artesano o autor', name: 'autor', placeholder: 'Nombre del artesano' },
    { label: 'Dimensiones', name: 'medidas', placeholder: 'Ej. 30 × 18 × 12 cm' },
    { label: 'Materiales', name: 'materiales', placeholder: 'Madera, pigmentos, acabados...', multiline: true },
    { label: 'Técnicas', name: 'tecnicas', placeholder: 'Tallado, pintura, hoja de oro...', multiline: true },
    { label: 'Descripción e iconografía', name: 'descripcion', placeholder: 'Historia, símbolos y elementos de la pieza...', multiline: true },
    { label: 'Lugar de origen', name: 'origen', placeholder: 'Localidad de origen' },
  ]
  return <div className="studio-shell">
    <main className={'studio-main page-' + page}>
      {page === 'inicio' && <>
        <section className="studio-light">
          <header className="brand-bar"><div className="brand-name"><span className="brand-symbol">✳</span><span>árbol que<br/><b>nunca muere.</b></span></div><small>ESTUDIO / 01</small></header>
          <div className="hero-copy"><span className="eyebrow"><i/> TALLER DE ALEBRIJES</span><h1>Cada pieza<br/>tiene <em>historia.</em></h1><p>Documenta su origen. Conserva la esencia de tu trabajo.</p></div>
          <button type="button" className="hero-cta" onClick={start}><span><small>EMPEZAR AHORA</small><b>Crear certificado</b></span><span className="cta-arrow"><Icon name="arrow"/></span></button>
          <div className="stat-strip"><div><strong>{String(drafts.length).padStart(2, '0')}</strong><span>Borradores guardados</span></div><div><strong>01</strong><span>Plantilla del taller</span></div></div>
        </section>
        <section className="studio-dark">
          <div className="dark-header"><div><small>TU ESPACIO</small><h2>Actividad reciente</h2></div><button type="button" aria-label="Ir al archivo" onClick={() => go('archivo')}><Icon name="arrow"/></button></div>
          {latest ? <button type="button" className="recent-item" onClick={() => open(latest)}><span className="recent-file"><Icon name="file" size={28}/></span><span><small>ÚLTIMO BORRADOR</small><b>{latest.obra}</b><small>{date(latest.updated)}</small></span><Icon name="arrow" size={18}/></button> :
          <div className="empty-recent"><span>✳</span><h3>Todo empieza<br/>con una obra.</h3><p>Tus certificados aparecerán aquí cuando guardes el primero.</p></div>}
          <button type="button" className="text-action" onClick={() => go('archivo')}>Ver archivo completo <Icon name="arrow" size={18}/></button>
        </section>
      </>}
      {page === 'crear' && <>
        <header className="subhead"><button type="button" aria-label="Volver" onClick={() => go('inicio')}><Icon name="back"/></button><div><small>CAPTURA / 01</small><h1>{editing ? 'Editar obra' : 'Nueva obra'}</h1></div><span>01 / 02</span></header>
        <div className="page-heading"><h2>Cuéntanos<br/><em>sobre la pieza.</em></h2><p>Los datos se colocan en la plantilla del taller. El diseño base no cambia.</p></div>
        <form className="field-list" onSubmit={event => { event.preventDefault(); if (values.obra.trim()) go('vista') }}>
          <div className="form-caption">01 <span>INFORMACIÓN DE LA OBRA</span></div>
          {formInputs.map((item, index) => <label className="field-card" key={item.name}><span>{item.label}{index === 0 && <b> *</b>}</span>{item.multiline ?
            <textarea rows={item.name === 'descripcion' ? 4 : 3} value={values[item.name]} maxLength={2500} placeholder={item.placeholder} onChange={event => setField(item.name, event.target.value)} /> :
            <input required={index === 0} value={values[item.name]} maxLength={160} placeholder={item.placeholder} onChange={event => setField(item.name, event.target.value)}/>}</label>)}
          {feedback && <p className="feedback" role="status">{feedback}</p>}
          <div className="form-footer"><button type="button" className="ghost-action" onClick={save}><Icon name="file" size={19}/> Guardar</button><button type="submit" className="solid-action" disabled={!values.obra.trim()}>Vista previa <Icon name="arrow" size={20}/></button></div>
        </form>
      </>}
      {page === 'vista' && <>
        <header className="subhead"><button type="button" aria-label="Volver a editar" onClick={() => go('crear')}><Icon name="back"/></button><div><small>DOCUMENTO / 02</small><h1>Vista previa</h1></div><span>02 / 02</span></header>
        <div className="preview-copy"><h2>Una historia<br/><em>que permanece.</em></h2><p>Maqueta de composición. La edición por capas y el PDF definitivo pertenecen a las próximas iteraciones.</p></div>
        <section className="paper-stage"><Paper values={values}/></section>
        {feedback && <p className="feedback" role="status">{feedback}</p>}
        <div className="form-footer preview-footer"><button type="button" className="ghost-action" onClick={() => go('crear')}><Icon name="edit" size={18}/> Editar</button><button type="button" className="solid-action" onClick={save}><Icon name="check" size={19}/> Guardar borrador</button></div>
      </>}
      {page === 'archivo' && <>
        <header className="subhead"><button type="button" aria-label="Volver" onClick={() => go('inicio')}><Icon name="back"/></button><div><small>COLECCIÓN</small><h1>Archivo</h1></div><span>{String(drafts.length).padStart(2, '0')}</span></header>
        <div className="page-heading"><h2>Obras que<br/><em>permanecen.</em></h2><p>Consulta los borradores guardados en este teléfono.</p></div>
        <label className="archive-search"><Icon name="search" size={20}/><input type="search" value={term} onChange={event => setTerm(event.target.value)} placeholder="Buscar obra o artesano"/></label>
        <div className="archive-results"><div className="results-header"><span>BORRADORES</span><span>{filtered.length} RESULTADOS</span></div>
          {filtered.length ? filtered.map(item => <div className="draft-row" key={item.id}><span className="draft-icon"><Icon name="file" size={25}/></span><div className="draft-copy"><b>{item.obra}</b><span>{item.autor || 'Autor pendiente'}</span><small>{date(item.updated)}</small></div><div className="draft-actions"><button type="button" aria-label={'Editar ' + item.obra} onClick={() => open(item)}><Icon name="edit" size={19}/></button><button type="button" aria-label={'Eliminar ' + item.obra} onClick={() => remove(item.id)}><Icon name="trash" size={18}/></button></div></div>) :
          <div className="archive-empty"><Icon name="archive" size={36}/><h3>{term ? 'Sin resultados.' : 'Aún no hay borradores.'}</h3><p>{term ? 'Prueba con otro nombre.' : 'Registra tu primera obra para comenzar.'}</p></div>}
        </div>
        <button className="archive-create" type="button" onClick={start}><Icon name="add" size={22}/> Nueva obra</button>
        {feedback && <p className="feedback" role="status">{feedback}</p>}
      </>}
    </main>
    <nav className="mobile-nav" aria-label="Navegación principal">
      <button type="button" className={page === 'inicio' ? 'is-active' : ''} aria-current={page === 'inicio' ? 'page' : undefined} onClick={() => go('inicio')}><Icon name="home"/><span>Inicio</span></button>
      <button type="button" className={page === 'crear' || page === 'vista' ? 'is-active' : ''} aria-current={page === 'crear' || page === 'vista' ? 'page' : undefined} onClick={start}><Icon name="add"/><span>Crear</span></button>
      <button type="button" className={page === 'archivo' ? 'is-active' : ''} aria-current={page === 'archivo' ? 'page' : undefined} onClick={() => go('archivo')}><Icon name="archive"/><span>Archivo</span></button>
    </nav>
  </div>
}
