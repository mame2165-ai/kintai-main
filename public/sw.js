// Service Worker - キャッシュ戦略: ネットワーク優先
const CACHE_NAME = 'kintai-v2';
const urlsToCache = [
    '/',
    '/employee.html',
    '/manifest.json'
];

// インストール時
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache).catch(() => {
                // キャッシュに失敗してもインストールは続行
                console.log('キャッシュ失敗（無視）');
            });
        })
    );
});

// アクティベート時（古いキャッシュを削除）
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// フェッチ時: ネットワーク優先、失敗時はキャッシュ
self.addEventListener('fetch', (event) => {
    // GETリクエストのみ処理
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // ネットワークから取得成功したらキャッシュに保存して返す
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // ネットワーク失敗時はキャッシュを返す
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        // ナビゲーションリクエストの場合、employee.html を返す
                        if (event.request.mode === 'navigate') {
                            return caches.match('/employee.html');
                        }
                        return new Response('オフラインです', { status: 503 });
                    });
            })
    );
});
