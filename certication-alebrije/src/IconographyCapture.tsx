import type { Dispatch, SetStateAction } from 'react'
import type { CaptureAngle, CertificateFields, IconographyMode, Photo } from './certificate-model'
import { PhotoPicker } from './PhotoPicker'

const captureAngles: Array<{ id: CaptureAngle; title: string; description: string; required: boolean }> = [
  { id: 'frente', title: 'Frente', description: 'Vista general completa', required: true },
  { id: 'derecha', title: 'Lateral derecho', description: 'Patrones de este costado', required: false },
  { id: 'izquierda', title: 'Lateral izquierdo', description: 'Otros patrones laterales', required: false },
  { id: 'reverso', title: 'Parte posterior', description: 'Grecas de atrás', required: false },
  { id: 'superior', title: 'Vista superior', description: 'Solo si tiene decoración arriba', required: false },
  { id: 'detalle', title: 'Acercamientos', description: 'Grecas pequeñas o poco visibles', required: false },
]
const modes: Array<{ mode: Exclude<IconographyMode, 'pendiente'>; title: string; detail: string; hint: string }> = [
  { mode: 'agente', title: 'Asistido por IA', detail: 'Fotografiar, detectar grecas y generar tiras para revisar.', hint: 'Flujo preparado; análisis aún no conectado' },
  { mode: 'manual', title: 'Hacerlo manualmente', detail: 'El artesano sube sus grecas y escribe lo que representan.', hint: 'Disponible ahora' },
  { mode: 'omitir', title: 'Omitir iconografía', detail: 'Generar el certificado solo con los datos de la obra.', hint: 'Sin grecas' },
]

export function IconographyCapture({ value, onUpdate }: {
  value: CertificateFields
  onUpdate: Dispatch<SetStateAction<CertificateFields>>
}) {
  function chooseMode(mode: Exclude<IconographyMode, 'pendiente'>) {
    onUpdate(previous => ({ ...previous, iconographyMode: mode }))
  }
  function updatePhotos(angle: CaptureAngle, next: Photo[]) {
    // Preserve files captured for other angles. Every photo keeps its source angle.
    onUpdate(previous => ({
      ...previous,
      piecePhotos: [
        ...previous.piecePhotos.filter(photo => photo.angle !== angle),
        ...next.map(photo => ({ ...photo, angle })),
      ],
    }))
  }
  const filled = captureAngles.filter(angle => value.piecePhotos.some(photo => photo.angle === angle.id))
  const next = captureAngles.find(angle => !value.piecePhotos.some(photo => photo.angle === angle.id))
  return <div className="flow-stack">
    <fieldset className="flow-mode-fieldset">
      <legend>Selecciona un modo</legend>
      {modes.map(option => <label key={option.mode} className={'mode-tile' + (value.iconographyMode === option.mode ? ' selected' : '')}>
        <input type="radio" name="iconography-mode" checked={value.iconographyMode === option.mode}
          onChange={() => chooseMode(option.mode)}/>
        <span className="mode-copy"><strong>{option.title}</strong><span>{option.detail}</span><small>{option.hint}</small></span>
        <span className="mode-check" aria-hidden="true">✓</span>
      </label>)}
    </fieldset>
    {value.iconographyMode === 'agente' && <section className="flow-panel">
      <div className="flow-panel-head"><span className="eyebrow">CAPTURA GUIADA</span><strong>{filled.length} de {captureAngles.length} ángulos</strong></div>
      <p className="flow-explainer">Para detectar las grecas necesitamos fotografías claras. Comenzamos por estas vistas; cuando esté conectado, el agente podrá solicitar acercamientos adicionales.</p>
      {next && <div className="angle-next"><span>PRÓXIMA TOMA SUGERIDA</span><strong>{next.title}</strong><small>{next.description}</small></div>}
      <div className="angle-list">{captureAngles.map(angle => {
        const photos = value.piecePhotos.filter(photo => photo.angle === angle.id)
        return <details key={angle.id} className="angle-item" open={angle.id === 'frente' && photos.length === 0}>
          <summary><span className={'angle-status' + (photos.length ? ' complete' : '')}>{photos.length ? '✓' : '+'}</span>
            <span><strong>{angle.title}</strong><small>{angle.description}</small></span>
            <span className="angle-count">{photos.length}/3</span>
          </summary>
          <PhotoPicker title={'Imágenes: ' + angle.title.toLowerCase()} help="Desde cámara o galería, con la greca bien enfocada."
            photos={photos} limit={3} onChange={nextPhotos => updatePhotos(angle.id, nextPhotos)}/>
        </details>
      })}</div>
      <div className="agent-pending">
        <strong>Identificación y extracción de tiras</strong>
        <p>El agente analizará las vistas, señalará grecas visibles y preparará una tira de cada patrón. Después podrás aceptar, descartar y priorizar las capturas.</p>
        <button type="button" disabled title="Se necesita conectar un servicio de análisis multimodal en el backend">Analizar imágenes con IA · pendiente</button>
        <small>Sin API configurada: no se generan resultados ni se envían fotos a un tercero.</small>
      </div>
    </section>}
    {value.iconographyMode === 'manual' && <section className="flow-panel">
      <span className="eyebrow">CAPTURA MANUAL</span>
      <h3>Las grecas, a tu manera.</h3>
      <p className="flow-explainer">En el siguiente paso podrás añadir tiras o fotos, ponerles un nombre y describir lo que representan. No tienes que completar ningún análisis automático.</p>
      <PhotoPicker title="Fotografías generales (opcional)" help="Útiles como referencia de la pieza."
        photos={value.piecePhotos} limit={12}
        onChange={piecePhotos => onUpdate(previous => ({ ...previous, piecePhotos }))}/>
    </section>}
    {value.iconographyMode === 'omitir' && <section className="flow-panel">
      <h3>Sin sección de grecas.</h3>
      <p className="flow-explainer">El certificado utilizará los datos generales de la obra. Podrás cambiar de modo más adelante sin perder lo que hayas capturado.</p>
    </section>}
  </div>
}
