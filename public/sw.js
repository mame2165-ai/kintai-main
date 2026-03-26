const CACHE_NAME = 'kintai-v1';

// インストール時：何もキャッシュしない
self.addEventListener('install', event => {
    self.skipWaiting();
});

// アクティベート時：古いキャッシュを全削除
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => caches.delete(key)))
        ).then(() => self.clients.claim())
    );
});

// フェッチ：常にネットワーク優先、失敗時のみキャッシュ
self.addEventListener('fetch', event => {
    // Firebase や外部APIはスキップ
    if (event.request.url.includes('firebase') ||
        event.request.url.includes('gstatic') ||
        event.request.url.includes('googleapis')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // HTMLファイルはキャッシュに保存（オフライン用）
                if (event.request.destination === 'document') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
