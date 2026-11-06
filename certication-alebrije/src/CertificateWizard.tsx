import { useState } from 'react'
import type { Dispatch, SetStateAction, FormEvent } from 'react'
import type { Certificate, CertificateFields, CatalogDetail, TextField, Orientation, OverflowPolicy } from './certificate-model'
import { formatDuration, formatDimensions } from './certificate-model'
import type { Duration, Dimensions } from './certificate-model'
import { DurationPicker, DimensionPicker } from './MeasureControls'
import { suggestedArtisans, suggestedTags } from './reuse-catalog'
import { ArtisanCombobox, TagInput, CatalogDescriptions } from './ReusableFields'
import { StudioIcon as Icon } from './StudioIcon'
import { CertificatePaper } from './CertificatePaper'
import { IconographyCapture } from './IconographyCapture'
import { IconographySelection } from './IconographySelection'
import { IconographySummary } from './IconographySummary'

const stages = ['Datos de la obra', 'Elaboración', 'Captura de grecas', 'Selección de tiras', 'Formato del certificado']
const identity: Array<{ key: TextField; label: string; hint: string; required?: boolean }> = [
  { key: 'obra', label: 'Nombre de la obra', hint: 'Ej. Fusión toro-caracol', required: true },
  { key: 'origen', label: 'Lugar de origen', hint: 'Ej. San Martín Tilcajete, Oaxaca' },
]
const process: Array<{ key: TextField; label: string; hint: string; multiline?: boolean }> = [
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
const stepHelp = [
  'Identifica la pieza y a su artesano.',
  'Materiales y técnicas utilizadas.',
  'Elige cómo documentar las grecas.',
  'Decide qué tiras se muestran.',
  'Configura la orientación y las páginas.',
] as const

export function CertificateWizard({ page, values, setValues, history, onBack, onPreview, onSave, saving, feedback, editing }: {
  page: 'crear' | 'vista'
  values: CertificateFields
  history: Certificate[]
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
  const artisans = suggestedArtisans(history)
  const materialSuggestions = suggestedTags(history, 'material')
  const techniqueSuggestions = suggestedTags(history, 'technique')
  function updateCatalog(kind: 'material' | 'technique', items: CatalogDetail[]) {
    const names = items.map(item => item.name).join(', ')
    setValues(previous => kind === 'material'
      ? { ...previous, materialItems: items, materiales: names }
      : { ...previous, techniqueItems: items, tecnicas: names })
  }
  function updateDuration(next: Duration) {
    setValues(previous => ({
      ...previous,
      duration: next,
      tiempoElaboracion: formatDuration(next) || (
        previous.duration.quantity === null ? previous.tiempoElaboracion : ''
      ),
    }))
  }
  function updateDimensions(next: Dimensions) {
    setValues(previous => {
      const text = formatDimensions(next)
      const wasLegacy = [previous.dimensions.widthCm, previous.dimensions.heightCm, previous.dimensions.depthCm]
        .every(v => v === null)
      return {
        ...previous, dimensions: next,
        medidas: text || (wasLegacy ? previous.medidas : ''),
      }
    })
  }
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
      <span>{page === 'vista' ? 'VISTA' : 'BORRADOR'}</span>
    </header>
    {page === 'crear' ? <>
      <div className="wizard-progress" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1}
        aria-label={'Paso ' + (step + 1) + ' de 5'}>
        {stages.map((item, index) => <span key={item}
          className={index === step ? 'current' : index < step ? 'done' : ''} title={item}/>)}
      </div>
      <div className="wizard-step-label">
        <div><h2>{stages[step]}</h2><p>{stepHelp[step]}</p></div>
        <span>{step + 1} de 5</span>
      </div>
      <form className="field-list wizard-form" onSubmit={next} noValidate>
        {step === 0 && <>
          <Field item={identity[0]} value={values.obra} onChange={value => setField('obra', value)}/>
          <ArtisanCombobox value={values.autor} suggestions={artisans}
            onChange={name => setField('autor', name)}/>
          <Field item={identity[1]} value={values.origen} onChange={value => setField('origen', value)}/>
          <p className="flow-muted-note">Los artesanos guardados aparecerán como sugerencias para las próximas piezas.</p>
        </>}
        {step === 1 && <>
          <TagInput title="Materiales" hint="Selecciona los materiales que se usaron o añade uno nuevo."
            items={values.materialItems} suggestions={materialSuggestions}
            onChange={items => updateCatalog('material', items)}/>
          <TagInput title="Técnicas de elaboración" hint="Puedes reutilizar técnicas de otras piezas."
            items={values.techniqueItems} suggestions={techniqueSuggestions}
            onChange={items => updateCatalog('technique', items)}/>
          <DurationPicker value={values.duration} legacy={values.tiempoElaboracion} onChange={updateDuration}/>
          <DimensionPicker value={values.dimensions} legacy={values.medidas} onChange={updateDimensions}/>
          {process.map(item => <Field key={item.key} item={item} value={values[item.key]}
            onChange={value => setField(item.key, value)}/>)}
          <CatalogDescriptions materials={values.materialItems} techniques={values.techniqueItems}
            onMaterials={items => updateCatalog('material', items)}
            onTechniques={items => updateCatalog('technique', items)}/>
        </>}
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
