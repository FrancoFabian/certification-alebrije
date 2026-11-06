import { useState } from 'react'
import type { DimensionUnit, Dimensions, Duration, DurationUnit } from './certificate-model'
import {
  dimensionToCm, dimensionToDisplay, formatDimension, formatDimensions,
  formatDuration, validDimension,
} from './certificate-model'

const durationUnits: Array<{ key: DurationUnit; name: string }> = [
  { key: 'dias', name: 'Días' },
  { key: 'semanas', name: 'Semanas' },
  { key: 'meses', name: 'Meses' },
  { key: 'anios', name: 'Años' },
]

export function DurationPicker({ value, legacy, onChange }: {
  value: Duration
  legacy: string
  onChange: (next: Duration) => void
}) {
  const valueOrOne = value.quantity ?? 1
  function changeAmount(input: string) {
    if (input.trim() === '') { onChange({ ...value, quantity: null }); return }
    const parsed = Number(input)
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 9999) return
    onChange({ ...value, quantity: parsed })
  }
  return <section className="measure-card duration-card">
    <div className="measure-header">
      <div><span className="measure-eyebrow">TIEMPO DE ELABORACIÓN</span>
        <h3>¿Cuánto tardó en hacerse?</h3></div>
      <span className="measure-optional">Opcional</span>
    </div>
    <div className="duration-counter">
      <button type="button" className="counter-button" disabled={value.quantity === null || value.quantity <= 1}
        aria-label="Reducir tiempo" onClick={() => onChange({ ...value, quantity: Math.max(1, valueOrOne - 1) })}>−</button>
      <div className="counter-number">
        <input type="number" inputMode="numeric" min={1} max={9999} step={1}
          aria-label="Cantidad de tiempo de elaboración" placeholder="—"
          value={value.quantity ?? ''} onChange={event => changeAmount(event.target.value)} />
        <span>CANTIDAD</span>
      </div>
      <button type="button" className="counter-button" disabled={value.quantity === 9999}
        aria-label="Aumentar tiempo" onClick={() => onChange({ ...value, quantity: Math.min(9999, valueOrOne + (value.quantity === null ? 0 : 1)) })}>+</button>
    </div>
    <fieldset className="measure-unit-group duration-units">
      <legend>Unidad de tiempo</legend>
      <div>{durationUnits.map(unit => <label key={unit.key} className={value.unit === unit.key ? 'is-selected' : ''}>
        <input type="radio" name="duration-unit" checked={value.unit === unit.key}
          onChange={() => onChange({ ...value, unit: unit.key })}/>
        {unit.name}
      </label>)}</div>
    </fieldset>
    <div className="duration-presets">
      <span>TOQUES RÁPIDOS</span>
      <div>{[1, 3, 6, 12].map(n => <button type="button" key={n}
        className={value.quantity === n ? 'is-selected' : ''}
        onClick={() => onChange({ ...value, quantity: n })}>{n}</button>)}</div>
    </div>
    <div className="measure-summary" aria-live="polite">
      <span>Resultado</span>
      <strong>{formatDuration(value) || 'Sin especificar'}</strong>
    </div>
    {value.quantity === null && legacy.trim() && <p className="measure-legacy">
      Valor anterior: <strong>{legacy}</strong>. Selecciona una cantidad para sustituirlo.
    </p>}
  </section>
}

type DimensionKey = 'widthCm' | 'heightCm' | 'depthCm'
const dimensionFields: Array<{ key: DimensionKey; title: string; subtitle: string; axis: string }> = [
  { key: 'widthCm', title: 'Ancho', subtitle: 'De lado a lado', axis: 'A' },
  { key: 'heightCm', title: 'Alto', subtitle: 'De abajo hacia arriba', axis: 'B' },
  { key: 'depthCm', title: 'Profundidad', subtitle: 'De frente hacia atrás', axis: 'C' },
]
const lengthUnits: Array<{ key: DimensionUnit; name: string }> = [
  { key: 'cm', name: 'cm' }, { key: 'in', name: 'pulgadas' }, { key: 'm', name: 'metros' },
]

function displayNumber(cm: number | null, unit: DimensionUnit): string {
  if (cm === null) return ''
  return String(Number(dimensionToDisplay(cm, unit).toFixed(4)))
}

function DimensionDiagram({ value, active }: { value: Dimensions; active: DimensionKey }) {
  const widths = [value.widthCm, value.heightCm, value.depthCm]
  const reference = Math.max(1, ...widths.filter((n): n is number => n !== null))
  const ratio = (n: number | null) => n === null ? 0.52 : Math.max(0.08, Math.min(1, n / reference))
  const w = 34 + ratio(value.widthCm) * 128
  const h = 34 + ratio(value.heightCm) * 120
  const dx = 15 + ratio(value.depthCm) * 72
  const dy = dx * 0.56
  const x = (360 - w - dx) / 2
  const y = 225
  const A = [x, y], B = [x + w, y], C = [x + w + dx, y - dy], D = [x + dx, y - dy]
  const AT = [x, y - h], BT = [x + w, y - h]
  const CT = [x + w + dx, y - h - dy], DT = [x + dx, y - h - dy]
  const points = (...ps: number[][]) => ps.map(p => p.join(',')).join(' ')
  const accent = '#719d36', ink = '#28352b', muted = '#97a495'
  const color = (key: DimensionKey) => active === key ? accent : muted
  const axisValue = (v: number | null) => v === null ? '—' : formatDimension(dimensionToDisplay(v, value.unit))
  const label = (key: DimensionKey, v: number | null) =>
    (key === 'widthCm' ? 'Ancho' : key === 'heightCm' ? 'Alto' : 'Prof.') + ': ' + axisValue(v) + ' ' + value.unit
  return <svg viewBox="0 0 360 292" className="dimension-svg" role="img"
    aria-label={'Volumen esquemático. ' +
      dimensionFields.map(item => label(item.key, value[item.key])).join('; ')}
    xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="diagram-dots" width="18" height="18" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="#d5dfd0"/>
      </pattern>
    </defs>
    <rect width="360" height="292" rx="18" fill="#f5f8f1"/>
    <rect width="360" height="292" rx="18" fill="url(#diagram-dots)"/>
    <ellipse cx="180" cy="250" rx="106" ry="13" fill="#d7e4d3" opacity=".7"/>
    <g stroke={ink} strokeLinejoin="round" strokeWidth="1.75">
      <polygon points={points(A,B,BT,AT)} fill="#f8fcf3"/>
      <polygon points={points(B,C,CT,BT)} fill="#bfdca8"/>
      <polygon points={points(AT,BT,CT,DT)} fill="#e2efcf"/>
    </g>
    <g stroke={muted} strokeWidth="1" strokeDasharray="5 4" fill="none" opacity=".6">
      <path d={'M '+D.join(' ')+' L '+A.join(' ')+' M '+D.join(' ')+' L '+DT.join(' ')}/>
    </g>
    <g strokeWidth="2.5" fill="none" strokeLinecap="round">
      <path d={'M '+x+' '+(y+22)+' H '+(x+w)} stroke={color('widthCm')}/>
      <path d={'M '+(x-23)+' '+y+' V '+(y-h)} stroke={color('heightCm')}/>
      <path d={'M '+(B[0]+15)+' '+(B[1]+12)+' L '+(C[0]+15)+' '+(C[1]+12)} stroke={color('depthCm')}/>
    </g>
    <g fill={ink} textAnchor="middle" fontSize="11" fontWeight="700">
      <text x={x+w/2} y={y+40} fill={color('widthCm')}>{'ANCHO '+axisValue(value.widthCm)}</text>
      <text x={x-38} y={y-h/2} fill={color('heightCm')}
        transform={'rotate(-90 '+(x-38)+' '+(y-h/2)+')'}>{'ALTO '+axisValue(value.heightCm)}</text>
      <text x={x+w+dx/2+24} y={y-dy/2+27} fill={color('depthCm')} fontSize="10">
        {'PROF. '+axisValue(value.depthCm)}
      </text>
    </g>
    <text x="180" y="280" textAnchor="middle" fill="#7c8976" fontSize="9" letterSpacing="1.4">
      VISTA ISOMÉTRICA · ESQUEMA DE DIMENSIONES
    </text>
  </svg>
}

export function DimensionPicker({ value, legacy, onChange }: {
  value: Dimensions
  legacy: string
  onChange: (next: Dimensions) => void
}) {
  const [active, setActive] = useState<DimensionKey>('widthCm')
  const [entry, setEntry] = useState<Record<DimensionKey, string>>(() => ({
    widthCm: displayNumber(value.widthCm, value.unit),
    heightCm: displayNumber(value.heightCm, value.unit),
    depthCm: displayNumber(value.depthCm, value.unit),
  }))
  const [inputErrors, setInputErrors] = useState<Partial<Record<DimensionKey, string>>>({})
  function change(key: DimensionKey, raw: string) {
    setEntry(old => ({ ...old, [key]: raw }))
    const numeric = Number(raw.replace(',', '.'))
    if (!raw.trim()) {
      onChange({ ...value, [key]: null })
      setInputErrors(prev => ({ ...prev, [key]: undefined }))
      return
    }
    const canonical = dimensionToCm(numeric, value.unit)
    const cm = validDimension(canonical)
    if (cm !== null) {
      onChange({ ...value, [key]: cm })
      setInputErrors(prev => ({ ...prev, [key]: undefined }))
    } else {
      onChange({ ...value, [key]: null })
      setInputErrors(prev => ({ ...prev, [key]: 'Introduce una medida positiva válida.' }))
    }
  }
  function switchUnit(unit: DimensionUnit) {
    setEntry({
      widthCm: displayNumber(value.widthCm, unit),
      heightCm: displayNumber(value.heightCm, unit),
      depthCm: displayNumber(value.depthCm, unit),
    })
    onChange({ ...value, unit })
  }
  const some = [value.widthCm, value.heightCm, value.depthCm].some(v => v !== null)
  return <section className="measure-card dimension-card">
    <div className="measure-header">
      <div><span className="measure-eyebrow">DIMENSIONES DE LA PIEZA</span>
        <h3>¿Cuánto mide?</h3></div>
      <span className="measure-optional">Opcional</span>
    </div>
    <p className="dimension-explainer">Completa una medida a la vez. La figura cambiará de tamaño y resaltará la dirección que estés editando.</p>
    <DimensionDiagram value={value} active={active}/>
    <fieldset className="measure-unit-group length-units">
      <legend>Unidad de medida</legend>
      <div>{lengthUnits.map(unit =>
        <label key={unit.key} className={value.unit === unit.key ? 'is-selected' : ''}>
          <input type="radio" name="dimension-unit" checked={value.unit === unit.key}
            onChange={() => switchUnit(unit.key)}/>
          {unit.name}
        </label>)}</div>
    </fieldset>
    <div className="dimension-fields">
      {dimensionFields.map(item => <label key={item.key} className={'dimension-input' + (active === item.key ? ' is-active' : '')}>
        <span className="dimension-axis">{item.axis}</span>
        <span className="dimension-input-label"><strong>{item.title}</strong><small>{item.subtitle}</small></span>
        <input inputMode="decimal" type="text" autoComplete="off" aria-label={item.title + ' en ' + value.unit}
          value={entry[item.key]} placeholder="—" onFocus={() => setActive(item.key)}
          onChange={event => change(item.key, event.target.value)}/>
        <span className="dimension-suffix">{value.unit}</span>
        {inputErrors[item.key] && <small className="dimension-error">{inputErrors[item.key]}</small>}
      </label>)}
    </div>
    <div className="measure-summary" aria-live="polite">
      <span>Medidas de la obra</span>
      <strong>{some ? formatDimensions(value) : 'Sin especificar'}</strong>
    </div>
    <p className="dimension-disclaimer">El bloque muestra ancho, alto y profundidad; no reproduce la forma real del alebrije ni garantiza una escala exacta.</p>
    {!some && legacy.trim() && <p className="measure-legacy">
      Medidas anteriores: <strong>{legacy}</strong>. Captúralas por separado para sustituirlas.
    </p>}
  </section>
}
