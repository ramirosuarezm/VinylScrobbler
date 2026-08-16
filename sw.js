/* VinylScrobbler — service worker.
   Shell offline + caché de tapas de Discogs. Las llamadas a las APIs nunca se cachean. */
const VERSION = 'v2';
const SHELL = `vs-shell-${VERSION}`;
const IMGS = `vs-img-${VERSION}`;
const MAX_IMGS = 400;

const SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== SHELL && k !== IMGS).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // APIs: siempre a la red, sin cachear (datos y credenciales).
  if (url.hostname === 'api.discogs.com' || url.hostname === 'ws.audioscrobbler.com') return;

  // Tapas: cache-first, la imagen no cambia.
  if (/(^|\.)discogs\.com$/.test(url.hostname) && url.hostname !== 'api.discogs.com') {
    e.respondWith(cacheFirstImage(request));
    return;
  }

  // Navegación: servimos el shell desde caché (arranque instantáneo) y lo refrescamos atrás.
  if (request.mode === 'navigate') {
    e.respondWith(shellFirst(request));
    return;
  }

  // Resto del shell (css/js/iconos): caché primero, refresco en segundo plano.
  if (url.origin === self.location.origin) {
    e.respondWith(staleWhileRevalidate(request));
  }
});

async function shellFirst(request) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match('./index.html');
  const net = fetch(request)
    .then(res => { if (res.ok) cache.put('./index.html', res.clone()); return res; })
    .catch(() => hit || Response.error());
  if (!hit) return net;
  net.catch(() => {});              // refresco en segundo plano, sin bloquear
  return hit;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match(request);
  const net = fetch(request)
    .then(res => { if (res.ok) cache.put(request, res.clone()); return res; })
    .catch(() => hit || Response.error());
  if (!hit) return net;
  net.catch(() => {});
  return hit;
}

async function cacheFirstImage(request) {
  const cache = await caches.open(IMGS);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res.ok || res.type === 'opaque') {
      cache.put(request, res.clone());
      trim(cache, MAX_IMGS);
    }
    return res;
  } catch {
    return hit || Response.error();
  }
}

async function trim(cache, max) {
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map(k => cache.delete(k)));
}
