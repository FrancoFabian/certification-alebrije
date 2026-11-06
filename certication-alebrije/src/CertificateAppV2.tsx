import { useEffect, useState } from 'react'
import { emptyFields, normalizeFields } from './certificate-model'
import type { Certificate, CertificateFields } from './certificate-model'
import { listDrafts, saveDraft, deleteDraft } from './draft-storage'
import { StudioIcon as Icon } from './StudioIcon'
import { CertificateWizard } from './CertificateWizard'
import { InstallPwa } from './InstallPwa'
import './mobile.css'
import './iconography.css'
import './wizard.css'

type Page = 'inicio' | 'crear' | 'vista' | 'archivo'
function displayDate(iso: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? 'Sin fecha' :
    date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CertificateAppV2() {
  const [page, setPage] = useState<Page>('inicio')
  const [drafts, setDrafts] = useState<Certificate[]>([])
  const [values, setValues] = useState<CertificateFields>(emptyFields)
  const [editing, setEditing] = useState<string | null>(null)
  const [term, setTerm] = useState('')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [wizardRevision, setWizardRevision] = useState(0)

  useEffect(() => {
    let active = true
    void listDrafts().then(records => { if (active) setDrafts(records) })
      .catch(() => { if (active) setFeedback('No pudimos recuperar los borradores locales.') })
    return () => { active = false }
  }, [])

  function go(next: Page) {
    setPage(next)
    setFeedback('')
    window.scrollTo(0, 0)
  }
  function start() { setValues(emptyFields()); setEditing(null); setWizardRevision(value => value + 1); go('crear') }
  function open(item: Certificate) {
    setValues(normalizeFields(item))
    setEditing(item.id)
    setWizardRevision(value => value + 1)
    go('crear')
  }
  async function save() {
    if (saving) return
    if (!values.obra.trim()) {
      setFeedback('Primero escribe el nombre de la obra.')
      return
    }
    const id = editing || crypto.randomUUID()
    const item: Certificate = { ...values, obra: values.obra.trim(), id, updated: new Date().toISOString() }
    setSaving(true)
    try {
      await saveDraft(item)
      setDrafts(previous => [item, ...previous.filter(draft => draft.id !== id)])
      setEditing(id)
      setFeedback('Borrador e imágenes guardados en este dispositivo.')
    } catch {
      setFeedback('Error al guardar. Revisa el espacio disponible y los permisos de este navegador.')
    } finally { setSaving(false) }
  }
  async function remove(id: string) {
    if (!window.confirm('¿Eliminar este borrador y todas sus fotografías?')) return
    try {
      await deleteDraft(id)
      setDrafts(previous => previous.filter(item => item.id !== id))
    } catch { setFeedback('No pudimos eliminar el borrador.') }
  }
  const latest = drafts[0]
  const filtered = drafts.filter(item =>
    (item.obra + ' ' + item.autor).toLocaleLowerCase('es').includes(term.toLocaleLowerCase('es')))

  return <div className="studio-shell">
    <main className={'studio-main page-' + page}>
      {page === 'inicio' && <>
        <section className="studio-light">
          <header className="brand-bar"><div className="brand-name">
            <span className="brand-symbol">✳</span><span>árbol que<br/><b>nunca muere.</b></span>
          </div><small>ESTUDIO / 01</small></header>
          <div className="hero-copy"><span className="eyebrow"><i/> TALLER DE ALEBRIJES</span>
            <h1>Cada pieza<br/>tiene <em>historia.</em></h1>
            <p>Documenta su origen. Conserva la esencia de tu trabajo.</p></div>
          <button type="button" className="hero-cta" onClick={start}>
            <span><small>EMPEZAR AHORA</small><b>Crear certificado</b></span>
            <span className="cta-arrow"><Icon name="arrow"/></span>
          </button>
          <div className="stat-strip">
            <div><strong>{String(drafts.length).padStart(2, '0')}</strong><span>Borradores guardados</span></div>
            <div><strong>01</strong><span>Plantilla del taller</span></div>
          </div>
        </section>
        <section className="studio-dark">
          <div className="dark-header"><div><small>TU ESPACIO</small><h2>Actividad reciente</h2></div>
            <button type="button" aria-label="Ir al archivo" onClick={() => go('archivo')}><Icon name="arrow"/></button>
          </div>
          {latest ? <button type="button" className="recent-item" onClick={() => open(latest)}>
            <span className="recent-file"><Icon name="file" size={28}/></span>
            <span><small>ÚLTIMO BORRADOR</small><b>{latest.obra}</b><small>{displayDate(latest.updated)}</small></span>
            <Icon name="arrow" size={18}/>
          </button> : <div className="empty-recent"><span>✳</span>
            <h3>Todo empieza<br/>con una obra.</h3>
            <p>Tus certificados aparecerán aquí cuando guardes el primero.</p>
          </div>}
          <button type="button" className="text-action" onClick={() => go('archivo')}>
            Ver archivo completo <Icon name="arrow" size={18}/>
          </button>
          <InstallPwa/>
          {feedback && <p className="feedback" role="status">{feedback}</p>}
        </section>
      </>}
      {(page === 'crear' || page === 'vista') && <CertificateWizard key={wizardRevision}
        page={page} values={values} setValues={setValues} editing={editing !== null}
        onBack={() => go(page === 'crear' ? 'inicio' : 'crear')}
        onPreview={() => go('vista')} onSave={() => void save()}
        saving={saving} feedback={feedback}/>}
      {page === 'archivo' && <>
        <header className="subhead">
          <button type="button" aria-label="Volver" onClick={() => go('inicio')}><Icon name="back"/></button>
          <div><small>COLECCIÓN</small><h1>Archivo</h1></div>
          <span>{String(drafts.length).padStart(2, '0')}</span>
        </header>
        <div className="page-heading"><h2>Obras que<br/><em>permanecen.</em></h2>
          <p>Consulta los borradores y las fotografías guardadas en este teléfono.</p></div>
        <label className="archive-search"><Icon name="search" size={20}/>
          <input type="search" value={term} onChange={event => setTerm(event.target.value)}
            placeholder="Buscar obra o artesano"/>
        </label>
        <div className="archive-results">
          <div className="results-header"><span>BORRADORES</span><span>{filtered.length} RESULTADOS</span></div>
          {filtered.length ? filtered.map(item =>
            <div className="draft-row" key={item.id}>
              <span className="draft-icon"><Icon name="file" size={25}/></span>
              <div className="draft-copy">
                <b>{item.obra}</b><span>{item.autor || 'Autor pendiente'}</span>
                <small>{item.motifs.length} grecas · {item.piecePhotos.length} fotos · {displayDate(item.updated)}</small>
              </div>
              <div className="draft-actions">
                <button type="button" aria-label={'Editar ' + item.obra} onClick={() => open(item)}><Icon name="edit" size={19}/></button>
                <button type="button" aria-label={'Eliminar ' + item.obra} onClick={() => void remove(item.id)}><Icon name="trash" size={18}/></button>
              </div>
            </div>) : <div className="archive-empty"><Icon name="archive" size={36}/>
              <h3>{term ? 'Sin resultados.' : 'Aún no hay borradores.'}</h3>
              <p>{term ? 'Prueba con otro nombre.' : 'Registra tu primera obra para comenzar.'}</p>
            </div>}
        </div>
        <button className="archive-create" type="button" onClick={start}><Icon name="add" size={22}/> Nueva obra</button>
        {feedback && <p role="status" className="feedback">{feedback}</p>}
      </>}
    </main>
    <nav className="mobile-nav" aria-label="Navegación principal">
      <button type="button" className={page === 'inicio' ? 'is-active' : ''}
        aria-current={page === 'inicio' ? 'page' : undefined} onClick={() => go('inicio')}>
        <Icon name="home"/><span>Inicio</span></button>
      <button type="button" className={page === 'crear' || page === 'vista' ? 'is-active' : ''}
        aria-current={page === 'crear' || page === 'vista' ? 'page' : undefined} onClick={start}>
        <Icon name="add"/><span>Crear</span></button>
      <button type="button" className={page === 'archivo' ? 'is-active' : ''}
        aria-current={page === 'archivo' ? 'page' : undefined} onClick={() => go('archivo')}>
        <Icon name="archive"/><span>Archivo</span></button>
    </nav>
  </div>
}
