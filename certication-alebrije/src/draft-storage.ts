import { emptyFields, normalizeFields } from './certificate-model'
import type { Certificate } from './certificate-model'

const DB_NAME = 'certification-alebrije'
const STORE = 'certificate-drafts'
const LEGACY_KEY = 'certification-alebrije:drafts:v1'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('No se pudo abrir IndexedDB.'))
    request.onblocked = () => reject(new Error('La base local está abierta en otra pestaña.'))
  })
}

export async function saveDraft(record: Certificate): Promise<void> {
  const db = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite')
      transaction.objectStore(STORE).put(record)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error || new Error('Error al guardar el borrador.'))
      transaction.onabort = () => reject(transaction.error || new Error('Guardado cancelado.'))
    })
  } finally {
    db.close()
  }
}

async function listFromDatabase(): Promise<Certificate[]> {
  const db = await openDatabase()
  try {
    return await new Promise<Certificate[]>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readonly')
      const request = transaction.objectStore(STORE).getAll()
      request.onsuccess = () => resolve((request.result as Certificate[])
        .map(item => ({ ...normalizeFields(item), id: item.id, updated: item.updated })))
      request.onerror = () => reject(request.error || new Error('Error al recuperar los borradores.'))
    })
  } finally {
    db.close()
  }
}

function legacyDrafts(): Certificate[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is Certificate => Boolean(item && typeof item === 'object' &&
      typeof item.id === 'string' && typeof item.obra === 'string' && typeof item.updated === 'string'))
      .map(item => ({ ...emptyFields(), ...normalizeFields(item), id: item.id, updated: item.updated }))
  } catch {
    return []
  }
}

export async function listDrafts(): Promise<Certificate[]> {
  const records = await listFromDatabase()
  const existingIds = new Set(records.map(item => item.id))
  const toMigrate = legacyDrafts().filter(item => !existingIds.has(item.id))
  if (toMigrate.length) {
    for (const record of toMigrate) {
      await saveDraft(record)
      records.push(record)
    }
  }
  // Retain legacy data until a successful migration. No files were stored there.
  if (toMigrate.length || records.length) {
    try { localStorage.removeItem(LEGACY_KEY) } catch { /* optional cleanup */ }
  }
  return records.sort((a, b) => b.updated.localeCompare(a.updated))
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite')
      transaction.objectStore(STORE).delete(id)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error || new Error('Error al borrar el borrador.'))
      transaction.onabort = () => reject(transaction.error || new Error('El borrado fue cancelado.'))
    })
  } finally {
    db.close()
  }
}
