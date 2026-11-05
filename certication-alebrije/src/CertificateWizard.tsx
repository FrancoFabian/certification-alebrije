import { useState } from 'react'
import type { Dispatch, SetStateAction, FormEvent } from 'react'
import type { CertificateFields, TextField, Orientation, OverflowPolicy } from './certificate-model'
import { StudioIcon as Icon } from './StudioIcon'
import { CertificatePaper } from './CertificatePaper'
import { IconographyCapture } from './IconographyCapture'
import { IconographySelection } from './IconographySelection'
import { IconographySummary } from './IconographySummary'

const stages = ['Identidad', 'Elaboración', 'Grecas', 'Selección', 'Documento']
const identity: Array<{ key: TextField; label: string; hint: string; required?: boolean }> = [
  { key: 'obra', label: 'Nombre de la obra', hint: 'Ej. Fusión toro-caracol', required: true },
  { key: 'autor', label: 'Artesano o taller responsable', hint: 'Nombre del autor o del taller', required: true },
  { key: 'origen', label: 'Lugar de origen', hint: 'Ej. San Martín Tilcajete, Oaxaca' },
]
const process: Array<{ key: TextField; label: string; hint: string; multiline?: boolean }> = [
  { key: 'materiales', label: 'Materiales', hint: 'Ej. Madera de copal y pigmentos', multiline: true },
  { key: 'tecnicas', label: 'Técnicas de elaboración', hint: 'Ej. Tallado y pintura a mano', multiline: true },
  { key: 'tiempoElaboracion', label: 'Tiempo de elaboración', hint: 'Ej. 11 meses' },
  { key: 'medidas', label: 'Dimensiones', hint: 'Ej. 30 × 18 × 12 cm' },
  { key: 'descripcion', label: 'Descripción general', hint: 'Características de la pieza...', multiline: true },
]
const orientations: Array<{ id: Orientation; name: string; hint: string }> = [
  { id: 'vertical', name: 'Vertical', hint: 'Retrato' },
  { id: 'horizontal', name: 'Horizontal', hint: 'Apaisado' },
]
const annex: Array<{ id: OverflowPolicy; name: string; hint: string }> = [
  { id: 'automatico', name: 'Automático', hint: 'Llevar el sobrante a una segunda hoja.' },
  { id: 'consultar', name: 'Preguntarme', hint: 'Confirmar antes de crear un anexo.' },
  { id: 'siempre', name: 'Siempre con anexo', hint: 'Reservar segunda hoja para los símbolos secundarios.' },
]
function Field({ item, value, onChange }: {
  item: { key: TextField; label: string; hint: string; multiline?: boolean; required?: boolean }
  value: string; onChange: (value: string) => void
}) {
  return <label className="field-card"><span>{item.label}{item.required && <b> *</b>}</span>
    {item.multiline ? <textarea rows={item.key === 'descripcion' ? 4 : 3} value={value}
      maxLength={2500} placeholder={item.hint} onChange={event => onChange(event.target.value)}/> :
      <input required={item.required} value={value} maxLength={180}
        placeholder={item.hint} onChange={event => onChange(event.target.value)}/>}
  </label>
}
const lead = [
  { top: 'PASO 01 · LO ESENCIAL', a: 'Primero, la', b: 'obra.', note: '¿Qué pieza estamos certificando y quién la realizó?' },
  { top: 'PASO 02 · EL PROCESO', a: 'Cómo nació', b: 'la pieza.', note: 'Materiales, técnica y detalles que la distinguen.' },
  { top: '', a: '', b: '', note: '' },
  { top: '', a: '', b: '', note: '' },
  { top: 'PASO 05 · EL FORMATO', a: 'Ya casi está', b: 'listo.', note: 'Elige el formato y revisa antes de finalizar.' },
]

export function CertificateWizard({ page, values, setValues, onBack, onPreview, onSave, saving, feedback, editing }: {
  page: 'crear' | 'vista'
  values: CertificateFields
  setValues: Dispatch<SetStateAction<CertificateFields>>
  onBack: () => void
  onPreview: () => void
  onSave: () => void
  saving: boolean
  feedback: string
  editing: boolean
}) {
  const [step, setStep] = useState(0)
  const [hint, setHint] = useState('')
  function setField(field: TextField, value: string) {
    setValues(previous => ({ ...previous, [field]: value }))
    setHint('')
  }
  function jump(next: number) {
    setStep(next)
    setHint('')
    window.scrollTo(0, 0)
  }
  function backward() {
    if (page === 'vista') { onBack(); return }
    if (step > 0) jump(step - 1)
    else onBack()
  }
  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (step === 0 && (!values.obra.trim() || !values.autor.trim())) {
      setHint('Completa el nombre de la obra y del artesano o taller.')
      return
    }
    if (step === 2 && values.iconographyMode === 'pendiente') {
      setHint('Selecciona cómo quieres registrar las grecas.')
      return
    }
    if (step === 2 && values.iconographyMode === 'agente' &&
      !values.piecePhotos.some(photo => photo.angle === 'frente')) {
      setHint('Para el modo agente añade por lo menos una fotografía frontal.')
      return
    }
    if (step === 4) onPreview()
    else jump(step + 1)
  }
  const included = values.motifs.filter(m => m.included !== false)
  const primary = included.filter(m => m.placement === 'principal').length
  const secondary = included.filter(m => m.placement === 'anexo').length
  return <>
    <header className="subhead">
      <button type="button" aria-label="Volver" onClick={backward}><Icon name="back"/></button>
      <div><small>{page === 'vista' ? 'DOCUMENTO / VISTA' : 'CERTIFICADO / CAPTURA'}</small>
        <h1>{page === 'vista' ? 'Vista previa' : editing ? 'Editar obra' : 'Nueva obra'}</h1></div>
      <span>{page === 'vista' ? 'VISTA' : (step + 1) + ' / 5'}</span>
    </header>
    {page === 'crear' ? <>
      <div className="wizard-progress" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1}
        aria-label={'Paso ' + (step + 1) + ' de 5'}>
        {stages.map((item, index) => <span key={item}
          className={index === step ? 'current' : index < step ? 'done' : ''} title={item}/>)}
      </div>
      <div className="wizard-step-label"><span>{stages[step]}</span><span>{step + 1} DE 5</span></div>
      <form className="field-list wizard-form" onSubmit={next} noValidate>
        {(step === 0 || step === 1 || step === 4) &&
          <div className="step-intro">
            <span className="eyebrow">{lead[step].top}</span>
            <h2>{lead[step].a}<br/><em>{lead[step].b}</em></h2>
            <p>{lead[step].note}</p>
          </div>}
        {step === 0 && <>
          {identity.map(item => <Field key={item.key} item={item} value={values[item.key]}
            onChange={value => setField(item.key, value)}/>)}
          <p className="flow-muted-note">Solo lo fundamental para identificar la pieza. Después registraremos sus detalles.</p>
        </>}
        {step === 1 && process.map(item => <Field key={item.key} item={item} value={values[item.key]}
          onChange={value => setField(item.key, value)}/>)}
        {step === 2 && <IconographyCapture value={values} onUpdate={setValues}/>}
        {step === 3 && <IconographySelection value={values} onUpdate={setValues} onGoCapture={() => jump(2)}/>}
        {step === 4 && <>
          <section className="flow-panel">
            <fieldset className="format-fieldset"><legend>Orientación del certificado</legend>
              <div className="orientation-grid">{orientations.map(option =>
                <label key={option.id} className={'orientation-tile' + (values.orientation === option.id ? ' selected' : '')}>
                  <input type="radio" name="orientation" checked={values.orientation === option.id}
                    onChange={() => setValues(prev => ({ ...prev, orientation: option.id }))}/>
                  <span className={'orientation-shape ' + option.id} aria-hidden="true"/>
                  <strong>{option.name}</strong><small>{option.hint}</small>
                </label>)}</div>
            </fieldset>
            {values.iconographyMode !== 'omitir' && <fieldset className="format-fieldset overflow-fieldset">
              <legend>Si el contenido supera una página</legend>
              {annex.map(option => <label key={option.id}
                className={'overflow-row' + (values.overflow === option.id ? ' selected' : '')}>
                <input type="radio" name="overflow" checked={values.overflow === option.id}
                  onChange={() => setValues(prev => ({ ...prev, overflow: option.id }))}/>
                <span><strong>{option.name}</strong><small>{option.hint}</small></span>
              </label>)}
            </fieldset>}
          </section>
          <section className="review-facts">
            <div><span>Obra</span><strong>{values.obra}</strong></div>
            <div><span>Autor</span><strong>{values.autor}</strong></div>
            <div><span>Iconografía</span><strong>{values.iconographyMode === 'omitir' ? 'Omitida' :
              values.iconographyMode === 'agente' && included.length === 0 ? 'Análisis pendiente' :
              included.length + ' tiras'}</strong></div>
            {values.iconographyMode !== 'omitir' &&
              <div><span>Prioridad</span><strong>{primary} principales · {secondary} al anexo</strong></div>}
          </section>
          <p className="flow-muted-note">Las preferencias se guardan, pero la paginación PDF todavía no está implementada.</p>
        </>}
        {(hint || feedback) && <p className="feedback" role="status">{hint || feedback}</p>}
        <div className="form-footer wizard-footer">
          <button type="button" className="ghost-action" disabled={saving} onClick={onSave}>
            <Icon name="file" size={18}/>{saving ? 'Guardando…' : 'Guardar'}
          </button>
          <button type="submit" className="solid-action">
            {step === 4 ? 'Vista previa' : 'Continuar'} <Icon name="arrow" size={19}/>
          </button>
        </div>
      </form>
    </> : <>
      <div className="preview-copy"><h2>Una historia<br/><em>que permanece.</em></h2>
        <p>Maqueta y resumen de las grecas elegidas. La extracción de tiras por IA y el PDF final aún no están conectados.</p></div>
      <section className={'paper-stage preview-' + values.orientation}>
        <CertificatePaper values={values}/>
      </section>
      <IconographySummary value={values}/>
      {feedback && <p className="feedback" role="status">{feedback}</p>}
      <div className="form-footer preview-footer">
        <button type="button" className="ghost-action" onClick={onBack}><Icon name="edit" size={18}/> Editar</button>
        <button type="button" className="solid-action" disabled={saving} onClick={onSave}>
          <Icon name="check" size={18}/>{saving ? 'Guardando…' : 'Guardar borrador'}
        </button>
      </div>
    </>}
  </>
}
