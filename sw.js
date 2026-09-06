/*
 * sw.js - Service Worker for FAST Registry
 * ==========================================
 * Caches the app shell and WHO reference tables so the app opens and
 * works fully offline after the first successful load. This is what
 * makes "Add to Home Screen" behave like a real installed app rather
 * than just a bookmark.
 *
 * IMPORTANT: update CACHE_NAME (e.g. 'fast-v2') any time you change
 * registry.html or any cached file, so returning users get the new
 * version instead of a stale cached copy.
 */

const CACHE_NAME = 'fast-registry-v1';

const FILES_TO_CACHE = [
  './registry.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './who_lms_wfa_boys.js',
  './who_lms_wfa_girls.js',
  './who_lms_wfh_boys.js',
  './who_lms_wfh_girls.js',
  './who_lms_wfl_boys.js',
  './who_lms_wfl_girls.js',
  './who_lms_lhfa_boys.js',
  './who_lms_lhfa_girls.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(() => {
        // Offline and not cached - for navigation requests, fall back
        // to the main app shell rather than showing a browser error page
        if (event.request.mode === 'navigate') {
          return caches.match('./registry.html');
        }
      });
    })
  );
});
