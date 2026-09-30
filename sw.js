/* 家园沟通站 · Service Worker（离线管家）
 * 升级代码后必须把 CACHE_NAME 的版本号 +1（v1 → v2），
 * 否则用户手机拿到的还是旧缓存。 */
const CACHE_NAME = 'jiayuan-v3'
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
]

// 安装：逐个缓存，单个失败不拖垮整体
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(ASSETS.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  )
})

// 激活：清理旧版本缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// 拦截请求：缓存优先，缓存没有才上网（离线可用关键）
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => {
        const copy = res.clone()
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy))
        return res
      }).catch(() => caches.match('./index.html'))
    )
  )
})
