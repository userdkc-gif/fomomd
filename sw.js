/* =====================================================================
   FOMOMD — sw.js (service worker)
   Makes the app work offline after the first visit.
   When you publish changed files, bump CACHE_VERSION so visitors get
   the new version (e.g. "fomomd-v1.2").
   Only runs on http/https — not when index.html is opened as a file.
   ===================================================================== */
var CACHE_VERSION = "fomomd-v1.9-2026-09-24";
var APP_SHELL = ["./", "index.html", "styles.css", "data.js", "app.js"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) { return cache.addAll(APP_SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Network-first for same-origin files: online visitors always get the
// latest content (important after a content fix); offline visitors get the
// cached copy. Everything else (e.g. the optional analytics script) is left
// to the browser, uncached.
self.addEventListener("fetch", function (event) {
  var req = event.request;
  var url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin || url.pathname.indexOf("/dev/") !== -1) return;

  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE_VERSION).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.open(CACHE_VERSION).then(function (cache) {
        return cache.match(req, { ignoreSearch: true }).then(function (cached) {
          return cached || (req.mode === "navigate" ? cache.match("index.html") : Response.error());
        });
      });
    })
  );
});
