/**
 * KX Autonomous AI — PWA Service Worker (Offline Cache & Native App Wrapper)
 */

const CACHE_NAME = 'kx-ai-cache-v0.4.0'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/kx_master_ui.html',
  '/manifest.json',
  '/favicon.svg',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching core PWA shell assets')
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  // Network first for API endpoints, Cache first for PWA UI shell
  if (event.request.url.includes('/v1/')) {
    return
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request)
    })
  )
})
