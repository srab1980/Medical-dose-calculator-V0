// Simple service worker for offline functionality
const CACHE_NAME = "pediatric-dose-calculator-v1"
const urlsToCache = ["/", "/static/js/bundle.js", "/static/css/main.css"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-calculations") {
    event.waitUntil(syncCalculations())
  }
})

async function syncCalculations() {
  try {
    const calculations = await getUnsyncedCalculations()
    // Implement the logic to send calculations to the server
    // and update the local storage after successful sync
    console.log("Syncing calculations:", calculations)
  } catch (error) {
    console.error("Error syncing calculations:", error)
  }
}

async function getUnsyncedCalculations() {
  // This would typically get data from IndexedDB or localStorage
  return []
}
