/* Offline app shell for the built Vite application. User documents remain in IndexedDB. */
const CACHE_NAME = 'anqm-static-v2'
const APP_SHELL = [
  '/', '/manifest.webmanifest', '/brand-icon.svg',
  '/icon-180.png', '/icon-192.png', '/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const response = await fetch('/', { cache: 'reload' })
    if (!response.ok) throw new Error('Application shell could not be fetched')
    const html = await response.text()
    // Vite injects hashed JS and CSS resources into the production index.html.
    const assets = Array.from(
      html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g),
      match => match[1],
    )
    const cache = await caches.open(CACHE_NAME)
    await cache.put('/', new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }))
    await cache.addAll([...new Set([...APP_SHELL.slice(1), ...assets])])
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    // Avoid deleting unrelated caches from the same origin.
    await Promise.all(keys.filter(key => key.startsWith('anqm-static-') && key !== CACHE_NAME)
      .map(key => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try { return await fetch(request) }
      catch { return await caches.match('/') || Response.error() }
    })())
    return
  }

  const path = new URL(request.url).pathname
  if (!path.startsWith('/assets/') && !APP_SHELL.includes(path)) return

  event.respondWith((async () => {
    const cached = await caches.match(request)
    if (cached) return cached
    try {
      const response = await fetch(request)
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME)
        await cache.put(request, response.clone())
      }
      return response
    } catch { return Response.error() }
  })())
})
