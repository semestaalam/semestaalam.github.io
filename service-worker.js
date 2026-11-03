const CACHE_NAME = "alam-ai-cache-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        if (response && response.ok) {
          const responseCopy = response.clone();

          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseCopy);
          });
        }

        return response;
      })
      .catch(function() {
        return caches.match(event.request).then(function(cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }

          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
      })
  );
});
