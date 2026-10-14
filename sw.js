const CACHE = 'aristoteles-v1.20.0';
const CORE = [
  './', './index.html', './guia-professor.html', './plano-aula.html', './sobre.html',
  './css/base.css', './css/theme.css', './css/layout.css', './css/components.css', './css/mobile.css',
  './js/main.js', './js/router.js', './js/state.js', './js/ui.js', './js/accessibility.js', './js/editorial.js',
  './engine/argument-engine.js', './engine/feedback-engine.js', './engine/reading-engine.js', './engine/graph-engine.js',
  './engine/logic-engine.js', './engine/hint-system.js', './engine/comparison-engine.js', './engine/timeline-engine.js',
  './data/modules.json', './data/lessons.json', './data/authors.json', './data/schools.json', './data/concepts.json',
  './data/texts.json', './data/exercises.json', './data/arguments.json', './data/timeline.json', './data/essays.json', './data/editorial.json',
  './assets/manifest.json', './assets/icons/icon.svg', './assets/icons/maskable.svg'
];

self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => hit)));
});
