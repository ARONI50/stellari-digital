import { getStore } from '@netlify/blobs';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function html(statusCode, body, cache = 'public, max-age=60') {
  return {
    statusCode,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': cache
    },
    body
  };
}

export async function handler(event) {
  const rawCode = (event.path.split('/').filter(Boolean).pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!rawCode) return html(404, '<h1>Link não encontrado</h1>');

  const store = getStore('stellari-linkops-links');
  const data = await store.get(rawCode, { type: 'json' }).catch(() => null);

  if (!data || !data.videoId) {
    return html(404, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Link não encontrado</title></head><body style="font-family:Arial;background:#06080d;color:#fff;padding:40px"><h1>Link não encontrado</h1><p>Este código ainda não existe na Stellari LinkOps.</p><a style="color:#60a5fa" href="/">Voltar</a></body></html>`, 'no-store');
  }

  const videoId = data.videoId;
  const title = escapeHtml(data.title || 'Assista no YouTube');
  const description = escapeHtml(data.description || 'Link inteligente gerado pela Stellari LinkOps.');
  const base = `${event.headers['x-forwarded-proto'] || 'https'}://${event.headers.host}`;
  const canonical = `${base}/l/${rawCode}`;
  const image = `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
  const youtubeWeb = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const youtubeApp = `vnd.youtube://${encodeURIComponent(videoId)}`;

  return html(200, `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <style>
    body{margin:0;min-height:100vh;background:#06080d;color:#fff;font-family:Inter,Arial,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;padding:22px}
    .card{max-width:520px;background:linear-gradient(145deg,#101828,#06080d);border:1px solid rgba(96,165,250,.25);border-radius:24px;padding:24px;box-shadow:0 25px 70px rgba(0,0,0,.45)}
    img{width:100%;border-radius:18px;margin-bottom:18px;background:#111827}
    h1{font-size:24px;margin:0 0 10px}.muted{color:#b8c4d6;line-height:1.45}.btn{display:inline-block;margin-top:18px;background:#ff0033;color:#fff;padding:14px 20px;border-radius:14px;text-decoration:none;font-weight:800}.brand{margin-top:18px;color:#6ea8ff;font-size:12px;letter-spacing:.18em;text-transform:uppercase}
  </style>
</head>
<body>
  <main class="card">
    <img src="${image}" alt="Prévia do vídeo">
    <h1>${title}</h1>
    <p class="muted">Abrindo no YouTube. Se não abrir automaticamente, toque no botão abaixo.</p>
    <a class="btn" href="${youtubeWeb}" target="_blank" rel="noopener">Abrir no YouTube</a>
    <div class="brand">STELLARI LINKOPS</div>
  </main>
  <script>
    const app = ${JSON.stringify(youtubeApp)};
    const web = ${JSON.stringify(youtubeWeb)};
    setTimeout(() => { window.location.href = app; }, 250);
    setTimeout(() => { window.location.href = web; }, 1800);
  </script>
</body>
</html>`);
}
