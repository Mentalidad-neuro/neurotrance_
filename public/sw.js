// Service worker de NeuroTrance: guarda la app y los audios en el teléfono
// para que funcione sin internet después de la primera visita.
const CACHE = 'neurotrance-v2';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './manifest.json'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // El aviso de versión nueva siempre se consulta en internet.
  if (new URL(req.url).pathname.endsWith('/version.json')) return;
  // Los audios piden rangos de bytes: si el audio ya está guardado se responde el trozo pedido;
  // si no, se responde desde la red y se guarda el archivo completo para la próxima vez.
  if (req.headers.has('range')) {
    e.respondWith(
      caches.match(req.url).then((hit) => {
        if (hit) return sliceRange(hit, req.headers.get('range'));
        e.waitUntil(
          fetch(req.url).then((full) => full.ok && full.status === 200 && caches.open(CACHE).then((c) => c.put(req.url, full))).catch(() => {}),
        );
        return fetch(req);
      }),
    );
    return;
  }
  const isPage = req.mode === 'navigate';
  if (isPage) {
    // Página: primero la red (para recibir actualizaciones), si no hay internet, la copia guardada.
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./')),
    );
    return;
  }
  // Código, fuentes, imágenes y audios: primero lo guardado; si no está, se descarga y se guarda.
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});

async function sliceRange(res, range) {
  const blob = await res.blob();
  const m = /bytes=(\d*)-(\d*)/.exec(range || '');
  let start = m && m[1] ? parseInt(m[1], 10) : 0;
  let end = m && m[2] ? parseInt(m[2], 10) : blob.size - 1;
  if (m && !m[1] && m[2]) {
    start = Math.max(0, blob.size - parseInt(m[2], 10));
    end = blob.size - 1;
  }
  end = Math.min(end, blob.size - 1);
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${blob.size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}
