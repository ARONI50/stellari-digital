import { getStore } from '@netlify/blobs';

const alphabet = 'abcdefghijkmnopqrstuvwxyz23456789';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function makeCode(length = 5) {
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function getYouTubeId(input) {
  if (!input) return '';
  const raw = String(input).trim();

  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || '';
    if (host.includes('youtube.com')) {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const parts = u.pathname.split('/').filter(Boolean);
      const shortsIndex = parts.indexOf('shorts');
      if (shortsIndex >= 0 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
    }
  } catch (_) {}

  return raw
    .replace('https://youtu.be/', '')
    .replace('http://youtu.be/', '')
    .replace('https://www.youtube.com/watch?v=', '')
    .replace('http://www.youtube.com/watch?v=', '')
    .split('&')[0]
    .split('?')[0]
    .replace(/[^A-Za-z0-9_-]/g, '')
    .trim();
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Use POST.' });

  let payload = {};
  try { payload = JSON.parse(event.body || '{}'); } catch { return json(400, { error: 'JSON inválido.' }); }

  const inputUrl = payload.url || payload.link || '';
  const title = (payload.title || 'Assista no YouTube').toString().slice(0, 120);
  const description = (payload.description || 'Link inteligente gerado pela Stellari LinkOps.').toString().slice(0, 180);
  const project = (payload.project || 'CRE').toString().slice(0, 40);
  const videoId = getYouTubeId(inputUrl);

  if (!videoId || videoId.length < 5) return json(400, { error: 'Não consegui identificar o ID do vídeo do YouTube.' });

  const store = getStore('stellari-linkops-links');
  let code = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    code = makeCode(5);
    const exists = await store.get(code, { type: 'json' }).catch(() => null);
    if (!exists) break;
  }

  const record = {
    code,
    platform: 'youtube',
    videoId,
    originalUrl: inputUrl,
    title,
    description,
    project,
    createdAt: new Date().toISOString()
  };

  await store.setJSON(code, record);

  const base = `${event.headers['x-forwarded-proto'] || 'https'}://${event.headers.host}`;
  return json(200, {
    ok: true,
    code,
    videoId,
    shortUrl: `${base}/l/${code}`,
    previewImage: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    record
  });
}
