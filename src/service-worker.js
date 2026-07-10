// نکته حیاتی معماری: این Cache Storage فقط پوسته‌ی برنامه (index.html/manifest/آیکون) را
// نگه می‌دارد و هیچ‌وقت به localStorage/IndexedDB کاربر (کارت‌ها، تنظیمات و...) دست نمی‌زند.
// بنابراین تغییر CACHE_NAME یا حذف کش‌های قدیمی در activate هرگز باعث از دست رفتن
// داده کاربر نمی‌شود — کاملاً امن است که این نسخه هر بار که کد تغییر می‌کند بالا برود.
const CACHE_NAME = '219-v3.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
