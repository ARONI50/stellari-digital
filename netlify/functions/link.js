function html(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300"
    },
    body
  };
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanVideoId(value) {
  return String(value || "")
    .trim()
    .split("?")[0]
    .split("&")[0]
    .replace(/[^A-Za-z0-9_-]/g, "");
}

export async function handler(event) {
  const rawPath = event.path || "";
  const parts = rawPath.split("/").filter(Boolean);

  // Esperado: /l/ID_DO_VIDEO
  const videoId = cleanVideoId(parts[1] || "");

  if (!videoId) {
    return html(404, `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Link inválido</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 30px;">
  <h1>Link inválido</h1>
  <p>Não foi possível identificar o vídeo.</p>
</body>
</html>`);
  }

  const title = "Assista à reflexão no YouTube";
  const description = "Link inteligente gerado pela Stellari LinkOps.";
  const image = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const youtubeWeb = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const youtubeApp = `vnd.youtube://${encodeURIComponent(videoId)}`;
  const currentUrl = event.rawUrl || `https://${event.headers.host}${event.path}`;

  const page = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${escapeHtml(currentUrl)}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">

  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background: #05070d;
      color: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
    }

    .box {
      width: 100%;
      max-width: 480px;
      background: #0b1220;
      border: 1px solid #1e3a5f;
      border-radius: 22px;
      padding: 28px;
      box-shadow: 0 0 35px rgba(59, 130, 246, 0.18);
    }

    img {
      width: 100%;
      border-radius: 16px;
      margin-bottom: 18px;
      display: block;
    }

    h1 {
      font-size: 24px;
      margin: 0 0 10px;
    }

    p {
      color: #cbd5e1;
      line-height: 1.5;
      margin: 0;
    }

    a.video-link {
      display: block;
      margin-top: 18px;
      padding: 15px 20px;
      border-radius: 14px;
      background: #2563eb;
      color: #ffffff;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
    }

    a.raw-link {
      display: block;
      margin-top: 16px;
      color: #38bdf8;
      font-size: 14px;
      word-break: break-all;
      text-decoration: underline;
    }

    .small {
      margin-top: 18px;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>

<body>
  <div class="box">
    <img src="${image}" alt="Thumbnail do vídeo">

    <h1>Abrindo no YouTube...</h1>

    <p>Se o vídeo não abrir automaticamente, toque no botão abaixo.</p>

    <a class="video-link" href="${youtubeWeb}" target="_blank" rel="noopener">
      Abrir vídeo no YouTube
    </a>

    <a class="raw-link" href="${youtubeWeb}" target="_blank" rel="noopener">
      ${youtubeWeb}
    </a>

    <div class="small">
      STELLARI PRODUÇÕES SOLUÇÕES DIGITAIS
    </div>
  </div>

  <script>
    let saiuDaPagina = false;

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        saiuDaPagina = true;
      }
    });

    setTimeout(function () {
      window.location.href = "${youtubeApp}";
    }, 120);

    setTimeout(function () {
      if (!saiuDaPagina) {
        window.location.href = "${youtubeWeb}";
      }
    }, 900);
  </script>
</body>
</html>`;

  return html(200, page);
}
