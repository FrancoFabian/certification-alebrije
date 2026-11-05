import type { Dispatch, SetStateAction } from 'react'
import type { CertificateFields, TextField } from './certificate-model'
import { StudioIcon as Icon } from './StudioIcon'
import { CertificatePaper } from './CertificatePaper'
import { IconographyForm } from './IconographyForm'
import { IconographySummary } from './IconographySummary'

const inputs: Array<{ label: string; name: TextField; placeholder: string; multiline?: boolean }> = [
  { label: 'Nombre de la obra', name: 'obra', placeholder: 'Ej. Espíritu del monte' },
  { label: 'Artesano o autor', name: 'autor', placeholder: 'Nombre del artesano' },
  { label: 'Dimensiones', name: 'medidas', placeholder: 'Ej. 30 × 18 × 12 cm' },
  { label: 'Materiales', name: 'materiales', placeholder: 'Madera, pigmentos, acabados...', multiline: true },
  { label: 'Técnicas', name: 'tecnicas', placeholder: 'Tallado, pintura, hoja de oro...', multiline: true },
  { label: 'Descripción de la pieza', name: 'descripcion', placeholder: 'Historia y características generales...', multiline: true },
  { label: 'Lugar de origen', name: 'origen', placeholder: 'Localidad de origen' },
]

export function CertificateEditor({ page, values, setValues, onBack, onPreview, onSave, saving, feedback, editing }: {
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
  function setField(field: TextField, value: string) {
    setValues(previous => ({ ...previous, [field]: value }))
  }
  return <>
    <header className="subhead">
      <button type="button" aria-label="Volver" onClick={onBack}><Icon name="back"/></button>
      <div><small>{page === 'crear' ? 'CAPTURA / 01' : 'DOCUMENTO / 02'}</small>
        <h1>{page === 'crear' ? editing ? 'Editar obra' : 'Nueva obra' : 'Vista previa'}</h1></div>
      <span>{page === 'crear' ? '01 / 02' : '02 / 02'}</span>
    </header>
    {page === 'crear' ? <>
      <div className="page-heading"><h2>Cuéntanos<br/><em>sobre la pieza.</em></h2>
        <p>Los datos, fotografías y grecas pertenecen a esta obra. La plantilla base no cambia.</p></div>
      <form className="field-list" onSubmit={event => { event.preventDefault(); if (values.obra.trim()) onPreview() }}>
        <div className="form-caption">01 <span>INFORMACIÓN DE LA OBRA</span></div>
        {inputs.map((input, index) => <label className="field-card" key={input.name}>
          <span>{input.label}{index === 0 && <b> *</b>}</span>
          {input.multiline ? <textarea rows={input.name === 'descripcion' ? 4 : 3}
            value={values[input.name]} maxLength={2500} placeholder={input.placeholder}
            onChange={event => setField(input.name, event.target.value)}/> :
            <input required={index === 0} maxLength={160} value={values[input.name]} placeholder={input.placeholder}
              onChange={event => setField(input.name, event.target.value)}/>}
        </label>)}
        <IconographyForm value={values} onUpdate={setValues}/>
        {feedback && <p className="feedback" role="status">{feedback}</p>}
        <div className="form-footer">
          <button type="button" className="ghost-action" disabled={saving} onClick={onSave}><Icon name="file" size={19}/>{saving ? 'Guardando…' : 'Guardar'}</button>
          <button type="submit" className="solid-action" disabled={!values.obra.trim()}>Vista previa <Icon name="arrow" size={20}/></button>
        </div>
      </form>
    </> : <>
      <div className="preview-copy"><h2>Una historia<br/><em>que permanece.</em></h2>
        <p>Maqueta de composición y resumen de grecas. La edición por capas y el PDF definitivo se añadirán más adelante.</p></div>
      <section className={'paper-stage preview-' + values.orientation}><CertificatePaper values={values}/></section>
      <IconographySummary value={values}/>
      {feedback && <p className="feedback" role="status">{feedback}</p>}
      <div className="form-footer preview-footer">
        <button type="button" className="ghost-action" onClick={onBack}><Icon name="edit" size={18}/> Editar</button>
        <button type="button" className="solid-action" disabled={saving} onClick={onSave}>
          <Icon name="check" size={19}/>{saving ? 'Guardando…' : 'Guardar borrador'}</button>
      </div>
    </>}
  </>
}
