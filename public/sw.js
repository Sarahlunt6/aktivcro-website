// Service Worker for Progressive Enhancement
// Provides basic caching and offline functionality

const CACHE_NAME = 'aktivcro-v1';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;

// Files to cache immediately (critical assets)
const STATIC_ASSETS = [
  '/',
  '/about/',
  '/contact/',
  '/manifest.json',
  '/favicon.svg',
  // Add critical CSS and JS files here when they're built
];

// Files to cache on first visit
const DYNAMIC_ASSETS = [
  '/calculator/',
  '/demos/',
  '/case-studies/',
  '/blog/',
  '/resources/'
];

// API endpoints that should work offline (with stale-while-revalidate)
const API_ENDPOINTS = [
  '/api/lead-capture',
  '/api/newsletter-signup',
  '/api/generate-demo'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Delete old caches
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticAsset(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: API request failed, trying cache');
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for critical endpoints
    if (API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'You are currently offline. Please check your connection and try again.',
          offline: true
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Handle page navigation with cache-first strategy
async function handleNavigation(request) {
  try {
    // Try cache first for faster loading
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Update cache in background
      fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, networkResponse);
          });
        }
      }).catch(() => {
        // Network failed, cache is still valid
      });
      
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Navigation failed, showing offline page');
    
    // Return a basic offline page
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - AktivCRO</title>
        <style>
          body {
            font-family: 'Poppins', system-ui, sans-serif;
            text-align: center;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
          }
          .container {
            max-width: 500px;
          }
          h1 { font-size: 2.5rem; margin-bottom: 1rem; }
          p { font-size: 1.125rem; margin-bottom: 2rem; line-height: 1.6; }
          button {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            color: white;
            padding: 1rem 2rem;
            font-size: 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          button:hover {
            background: white;
            color: #667eea;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔌 You're Offline</h1>
          <p>
            It looks like you've lost your internet connection. 
            Don't worry - some features of AktivCRO are still available offline!
          </p>
          <button onclick="window.location.reload()">
            Try Again
          </button>
        </div>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // For critical assets, try to return something
    if (request.url.includes('.css')) {
      return new Response('/* Offline - CSS unavailable */', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
    
    if (request.url.includes('.js')) {
      return new Response('console.log("Offline - JS unavailable");', {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    throw error;
  }
}

// Background sync for form submissions (if supported)
self.addEventListener('sync', event => {
  if (event.tag === 'background-form-sync') {
    event.waitUntil(syncFormSubmissions());
  }
});

async function syncFormSubmissions() {
  console.log('Service Worker: Syncing offline form submissions');
  
  try {
    // Get offline form data from IndexedDB or cache
    const formData = await getOfflineFormData();
    
    for (const submission of formData) {
      try {
        const response = await fetch(submission.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineFormData(submission.id);
          console.log('Service Worker: Form submission synced successfully');
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync form submission', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Placeholder functions for offline form storage
// These would need to be implemented with IndexedDB for full functionality
async function getOfflineFormData() {
  return [];
}

async function removeOfflineFormData(id) {
  // Implementation needed
}

// Handle push notifications (if needed in future)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const options = {
    body: event.data.text(),
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('AktivCRO Update', options)
  );
});

// Clean up old caches periodically
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});