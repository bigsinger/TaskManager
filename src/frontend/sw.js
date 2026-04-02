/**
 * Service Worker - 缓存策略
 * 实现离线访问和性能优化
 */

const CACHE_NAME = 'taskmanager-v1.3.0';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/auth.css',
    '/authService.js',
    '/csrfService.js',
    '/login.html',
    '/login.js',
    '/register.html',
    '/register.js'
];

const API_CACHE_NAME = 'taskmanager-api-v1';
const API_ROUTES = [
    '/api/tasks',
    '/api/tags'
];

// 安装 - 缓存静态资源
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活 - 清理旧缓存
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                console.log('Current caches:', cacheNames);
                return Promise.all(
                    cacheNames
                        .filter(name => {
                            const shouldDelete = name !== CACHE_NAME && name !== API_CACHE_NAME;
                            if (shouldDelete) {
                                console.log('Deleting old cache:', name);
                            }
                            return shouldDelete;
                        })
                        .map(name => caches.delete(name))
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// 拦截请求 - 缓存策略
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // OAuth回调页面 - 直接网络请求，不缓存
    if (url.pathname.includes('oauth-callback.html') || url.search.includes('token=')) {
        event.respondWith(fetch(request).catch(() => {
            return new Response('Network error', { status: 503 });
        }));
        return;
    }
    
    // API请求 - 网络优先，缓存回退
    if (API_ROUTES.some(route => url.pathname.includes(route))) {
        event.respondWith(networkFirst(request));
    }
    // 静态资源 - 缓存优先，网络回退
    else if (STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(cacheFirst(request));
    }
    // 其他请求 - 网络优先
    else {
        event.respondWith(networkFirst(request));
    }
});

/**
 * 缓存优先策略
 * @param {Request} request 
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
        // 后台更新缓存
        fetch(request)
            .then(response => {
                if (response.ok) {
                    cache.put(request, response.clone());
                }
            })
            .catch(() => {});
        
        return cached;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('Offline', { status: 503 });
    }
}

/**
 * 网络优先策略
 * @param {Request} request 
 */
async function networkFirst(request) {
    const cache = await caches.open(API_CACHE_NAME);
    
    try {
        const networkResponse = await fetch(request);
        // 只缓存GET请求，不缓存POST/PUT/DELETE等
        if (networkResponse.ok && request.method === 'GET') {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // 只对GET请求使用缓存回退
        if (request.method === 'GET') {
            const cached = await cache.match(request);
            if (cached) {
                return cached;
            }
        }
        throw error;
    }
}

/**
 * 后台同步
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
    }
});

async function syncTasks() {
    // 同步离线操作
    const db = await openDB('taskmanager-offline', 1);
    const pendingOperations = await db.getAll('pending');
    
    for (const operation of pendingOperations) {
        try {
            await fetch(operation.url, {
                method: operation.method,
                headers: operation.headers,
                body: JSON.stringify(operation.body)
            });
            await db.delete('pending', operation.id);
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
}

/**
 * 推送通知
 */
self.addEventListener('push', (event) => {
    const data = event.data.json();
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon.png',
            badge: '/badge.png',
            data: data.data
        })
    );
});

/**
 * 通知点击
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
