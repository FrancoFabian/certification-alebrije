/* Lightweight app-shell cache for the static Bun/Vite build.
   Draft data is stored separately in the browser, not in Cache Storage. */
const CACHE_NAME = 'anqm-static-v1'
const APP_SHELL = ['/', '/manifest.webmanifest', '/brand-icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    const response = await fetch('/', { cache: 'reload' })
    if (!response.ok) throw new Error('Could not cache the application shell')
    await cache.put('/', response.clone())
    const html = await response.text()
    const assets = Array.from(html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g), match => match[1])
    await cache.addAll([...APP_SHELL.slice(1), ...assets])
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try { return await fetch(request) }
      catch {
        const cached = await caches.match('/')
        return cached || Response.error()
      }
    })())
    return
  }
  if (!new URL(request.url).pathname.startsWith('/assets/')) return
  event.respondWith((async () => {
    const cached = await caches.match(request)
    if (cached) return cached
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  })())
})
