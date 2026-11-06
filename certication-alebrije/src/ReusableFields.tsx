import { useRef, useState } from 'react'
import type { CatalogDetail } from './certificate-model'
import { normalizedName } from './reuse-catalog'

export function ArtisanCombobox({ value, suggestions, onChange }: {
  value: string
  suggestions: string[]
  onChange: (name: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const matching = suggestions.filter(name => {
    const term = normalizedName(value)
    return !term || normalizedName(name).includes(term)
  }).slice(0, 5)
  function choose(name: string) { onChange(name); setExpanded(false) }
  function addNew() {
    onChange('')
    setExpanded(false)
    input.current?.focus()
  }
  return <section className="artisan-field">
    <label className="catalog-label" htmlFor="artist-input">Artesano o taller responsable <span>*</span></label>
    <input ref={input} id="artist-input" value={value} maxLength={180} autoComplete="off"
      placeholder="Elige un artesano o escribe uno nuevo"
      aria-describedby="artist-help"
      onChange={event => { onChange(event.target.value); setExpanded(true) }}
      onFocus={() => setExpanded(true)} />
    <p id="artist-help">Los nombres que hayas guardado aparecerán aquí para reutilizarlos.</p>
    {expanded && matching.length > 0 && <div className="artisan-suggestions">
      <span className="catalog-kicker">ARTESANOS RECIENTES</span>
      {matching.map((name, index) =>
        <button type="button" key={normalizedName(name)} onClick={() => choose(name)}>
          <span className="suggestion-avatar">{name.trim().slice(0, 1).toLocaleUpperCase('es')}</span>
          <span>{name}</span>{index === 0 && !value.trim() && <small>Último usado</small>}
        </button>)}
    </div>}
    {suggestions.length > 0 && <div className="artisan-actions">
      <button type="button" onClick={() => setExpanded(open => !open)}>
        {expanded ? 'Ocultar sugerencias' : 'Ver artesanos guardados'}
      </button>
      <button type="button" onClick={addNew}>+ Nuevo artesano</button>
    </div>}
  </section>
}

export function TagInput({ title, hint, items, suggestions, onChange }: {
  title: string
  hint: string
  items: CatalogDetail[]
  suggestions: string[]
  onChange: (items: CatalogDetail[]) => void
}) {
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const selected = new Set(items.map(item => normalizedName(item.name)))
  const available = suggestions.filter(name => !selected.has(normalizedName(name)) &&
    normalizedName(name).includes(normalizedName(query))).slice(0, 6)

  function add(value: string) {
    const name = value.trim().replace(/\s+/g, ' ').slice(0, 140)
    if (!name) return
    if (!selected.has(normalizedName(name))) {
      onChange([...items, { id: crypto.randomUUID(), name, description: '' }])
    }
    setQuery('')
    input.current?.focus()
  }
  function remove(id: string) { onChange(items.filter(item => item.id !== id)) }
  return <section className="tag-editor">
    <div className="tag-editor-heading"><strong>{title}</strong><span>{items.length} seleccionados</span></div>
    <p>{hint}</p>
    {items.length > 0 && <div className="selected-tags">
      {items.map(item => <span className="selected-tag" key={item.id}>
        <span>{item.name}</span>
        <button type="button" onClick={() => remove(item.id)} aria-label={'Quitar ' + item.name}>×</button>
      </span>)}
    </div>}
    <div className="tag-entry">
      <input ref={input} value={query} maxLength={140}
        placeholder="Escribe o busca una opción"
        aria-label={'Agregar ' + title.toLocaleLowerCase('es')}
        onChange={event => setQuery(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') { event.preventDefault(); add(query) }
        }}/>
      <button type="button" disabled={!query.trim()} onClick={() => add(query)}>Agregar</button>
    </div>
    {available.length > 0 && <div className="tag-suggestions">
      <span className="catalog-kicker">{query.trim() ? 'COINCIDENCIAS' : 'SUGERENCIAS · TOCA PARA AGREGAR'}</span>
      <div>{available.map(name => <button key={normalizedName(name)} type="button" onClick={() => add(name)}>+ {name}</button>)}</div>
    </div>}
    {items.length === 0 && suggestions.length === 0 && <small className="catalog-empty">Agrega el primero para empezar tu catálogo.</small>}
  </section>
}

export function CatalogDescriptions({ materials, techniques, onMaterials, onTechniques }: {
  materials: CatalogDetail[]
  techniques: CatalogDetail[]
  onMaterials: (items: CatalogDetail[]) => void
  onTechniques: (items: CatalogDetail[]) => void
}) {
  const all = [
    { title: 'Materiales', prefix: 'material', entries: materials, onChange: onMaterials },
    { title: 'Técnicas', prefix: 'technique', entries: techniques, onChange: onTechniques },
  ]
  return <section className="catalog-descriptions">
    <div className="catalog-descriptions-header">
      <span className="catalog-kicker">DETALLES DE ELABORACIÓN</span>
      <h3>Describe cada elemento</h3>
      <p>Opcional. Explica cómo se utilizó un material o cómo se aplicó una técnica en esta obra.</p>
    </div>
    {all.map(group => <div key={group.prefix} className="detail-group">
      <h4>{group.title}</h4>
      {group.entries.length === 0 ? <p className="detail-empty">Añade etiquetas arriba para describirlas aquí.</p> :
        group.entries.map(entry => <details className="detail-item" key={entry.id}>
          <summary><span>{entry.name}</span><span className="detail-status">
            {entry.description.trim() ? 'Con descripción' : 'Añadir detalle'} <span aria-hidden="true">⌄</span>
          </span></summary>
          <label htmlFor={group.prefix + '-' + entry.id}>Descripción en esta pieza</label>
          <textarea id={group.prefix + '-' + entry.id} rows={3} value={entry.description} maxLength={1200}
            placeholder={group.prefix === 'material' ? 'Ej. Se utilizó en las zonas talladas...' : 'Ej. Se aplicó para definir los patrones...'}
            onChange={event => group.onChange(group.entries.map(item => item.id === entry.id ?
              { ...item, description: event.target.value } : item))}/>
        </details>)}
    </div>)}
  </section>
}
