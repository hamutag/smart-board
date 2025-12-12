/*
  Simple Service Worker (no Workbox) for:
  - caching static assets (JS/CSS/fonts)
  - caching runtime assets (images + API JSON)
  - giving the board a much faster "second load"

  Notes:
  - For opaque (no-cors) responses (e.g., some image CDNs), we still cache them,
    but we can't read headers/body. That's OK.
  - We store fetch timestamps in a separate "meta" cache so we can implement
    a 2-hour TTL for API JSON.
*/

const VERSION = 'v1';

const STATIC_CACHE = `smartboard-static-${VERSION}`;
const RUNTIME_CACHE = `smartboard-runtime-${VERSION}`;
const META_CACHE = `smartboard-meta-${VERSION}`;

// User request: refresh content every ~2 hours
const API_MAX_AGE_MS = 2 * 60 * 60 * 1000;

// Keep images longer (images are the heavy part; no need to re-download often)
const IMAGE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Static assets can be cached longer; the "VERSION" bump will invalidate.
const STATIC_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function isHttp(url) {
  return url.protocol === 'http:' || url.protocol === 'https:';
}

async function metaGet(url) {
  const meta = await caches.open(META_CACHE);
  const res = await meta.match(url);
  if (!res) return null;
  const txt = await res.text();
  const ts = Number(txt);
  return Number.isFinite(ts) ? ts : null;
}

async function metaSet(url, ts) {
  const meta = await caches.open(META_CACHE);
  await meta.put(url, new Response(String(ts)));
}

async function cachePutWithMeta(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  try {
    await metaSet(request.url, Date.now());
  } catch {
    // ignore
  }
}

async function matchFresh(cacheName, request, maxAgeMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (!cached) return null;

  const ts = await metaGet(request.url);
  if (!ts) {
    // If no metadata, treat as fresh.
    return cached;
  }

  const age = Date.now() - ts;
  if (age <= maxAgeMs) return cached;

  return null;
}

async function cacheFirst(request, cacheName, maxAgeMs) {
  const fresh = await matchFresh(cacheName, request, maxAgeMs);
  if (fresh) return fresh;

  const cached = await (await caches.open(cacheName)).match(request);
  if (cached) {
    // Serve stale while we revalidate
    eventWaitUntil(fetchAndCache(request, cacheName));
    return cached;
  }

  return fetchAndCache(request, cacheName);
}

async function networkFirst(request, cacheName, maxAgeMs) {
  try {
    const res = await fetch(request);
    // Only cache successful-ish responses
    if (res && (res.status === 200 || res.type === 'opaque')) {
      await cachePutWithMeta(cacheName, request, res.clone());
    }
    return res;
  } catch {
    // Offline / failed
    const cached = await (await caches.open(cacheName)).match(request);
    if (cached) return cached;
    throw new Error('Network failed and no cache');
  }
}

async function staleWhileRevalidate(request, cacheName, maxAgeMs) {
  const fresh = await matchFresh(cacheName, request, maxAgeMs);
  if (fresh) return fresh;

  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetchAndCache(request, cacheName);

  if (cached) {
    eventWaitUntil(fetchPromise);
    return cached;
  }

  return fetchPromise;
}

// `event.waitUntil(...)` is only available inside the fetch handler.
// We'll store a function reference so helpers can call it.
let eventWaitUntil = () => {};

async function fetchAndCache(request, cacheName) {
  const res = await fetch(request);
  if (res && (res.status === 200 || res.type === 'opaque')) {
    await cachePutWithMeta(cacheName, request, res.clone());
  }
  return res;
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    self.skipWaiting();

    // Best-effort: cache the app shell routes.
    // Vite output files are hashed, so we rely mostly on runtime caching.
    const cache = await caches.open(STATIC_CACHE);
    try {
      await cache.addAll(['/', '/index.html']);
    } catch {
      // Some hosts don't serve /index.html directly; ignore.
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Remove old cache versions
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith('smartboard-') && !k.endsWith(VERSION))
        .map((k) => caches.delete(k))
    );

    await clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data && data.type === 'CLEAR_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('smartboard-')).map((k) => caches.delete(k)));
    })());
  }
});

self.addEventListener('fetch', (event) => {
  eventWaitUntil = (p) => event.waitUntil(p);

  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (!isHttp(url)) return;

  // SPA navigations
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.status === 200) {
          await cachePutWithMeta(STATIC_CACHE, req, res.clone());
        }
        return res;
      } catch {
        // Offline fallback
        const cache = await caches.open(STATIC_CACHE);
        return (await cache.match('/')) || (await cache.match('/index.html'));
      }
    })());
    return;
  }

  const dest = req.destination; // script/style/image/font/etc
  const accept = req.headers.get('accept') || '';

  // Images are usually the heaviest payload.
  if (dest === 'image') {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE, IMAGE_MAX_AGE_MS));
    return;
  }

  // Static assets
  if (dest === 'script' || dest === 'style' || dest === 'font') {
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE, STATIC_MAX_AGE_MS));
    return;
  }

  // JSON/API requests
  // Use Stale-While-Revalidate with a 2h TTL:
  // - Within 2 hours: served from cache (no data usage)
  // - After 2 hours: serve cached immediately + refresh in the background
  if (dest === 'fetch' || accept.includes('application/json')) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE, API_MAX_AGE_MS));
    return;
  }

  // Default: try cache, then network
  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE, API_MAX_AGE_MS));
});
