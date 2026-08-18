// ============================================================================
// Service Worker
// ============================================================================

/**
 * Service Worker for the Parking Management System
 * Provides offline support, caching, and background sync
 */

const CACHE_NAME = 'parking-system-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  
  // CSS
  '/css/main.css',
  '/css/theme.css',
  
  // JS
  '/js/main.js',
  '/js/vendor.js',
  
  // Images
  '/images/logo.svg',
  '/images/logo-dark.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only',
};

// ============================================================================
// Installation
// ============================================================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================================================
// Activation
// ============================================================================

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// ============================================================================
// Fetch Handling
// ============================================================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Determine cache strategy based on request type
  const strategy = getCacheStrategy(event.request);
  
  event.respondWith(handleRequest(event.request, strategy));
});

// ============================================================================
// Cache Strategy
// ============================================================================

function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // API calls - Network First
  if (url.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Static assets - Cache First
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // HTML pages - Stale While Revalidate
  if (url.pathname.match(/\.(html|htm)$/)) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // Images - Stale While Revalidate
  if (url.pathname.match(/\/images\//)) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // Default - Network First
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// ============================================================================
// Request Handler
// ============================================================================

async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return handleCacheFirst(request);
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return handleNetworkFirst(request);
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return handleStaleWhileRevalidate(request);
    case CACHE_STRATEGIES.CACHE_ONLY:
      return handleCacheOnly(request);
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return handleNetworkOnly(request);
    default:
      return handleNetworkFirst(request);
  }
}

// ============================================================================
// Cache Strategies
// ============================================================================

async function handleCacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function handleStaleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function handleCacheOnly(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  return new Response('Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  });
}

async function handleNetworkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// ============================================================================
// Background Sync
// ============================================================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
  
  if (event.tag === 'sync-parking') {
    event.waitUntil(syncParking());
  }
});

async function syncBookings() {
  // Sync bookings data
  console.log('Syncing bookings...');
}

async function syncParking() {
  // Sync parking data
  console.log('Syncing parking...');
}

// ============================================================================
// Push Notifications
// ============================================================================

self.addEventListener('push', (event) => {
  let data = { title: 'Parking Update', body: 'New parking update available', icon: '/images/logo-192x192.png' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: 'Parking Update', body: event.data.text() };
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/images/logo-192x192.png',
    badge: '/images/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'view',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================================================
// Notification Click
// ============================================================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  } else if (event.action === 'close') {
    // Close notification
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// ============================================================================
// Message Handling
// ============================================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================================================
// Version Information
// ============================================================================

console.log('Service Worker version 1.0.0 loaded');