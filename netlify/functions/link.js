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
  const code = cleanVideoId(parts[1] || parts[0] || "");

  if (!code) {
    return html(404, "<h1>Link inválido</h1>");
  }

  const videoId = code;
  const title = "Assista à reflexão no YouTube";
  const description = "Link inteligente gerado pela Stellari LinkOps.";
  const image = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const youtubeWeb = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const youtubeApp = `vnd.youtube://${encodeURIComponent(videoId)}`;

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
  <meta property="og:url" content="${escapeHtml(event.rawUrl || "")}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">

  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background: #05070d;
      color: #fff;
      font-family: Arial, Helvetica, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
    }
    .box {
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
    }
    h1 {
      font-size: 24px;
      margin: 0 0 10px;
    }
    p {
      color: #cbd5e1;
      line-height: 1.5;
    }
    a {
      display: inline-block;
      margin-top: 18px;
      padding: 14px 20px;
      border-radius: 14px;
      background: #2563eb;
      color: white;
      text-decoration: none;
      font-weight: bold;
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
    <a href="${youtubeWeb}" target="_blank" rel="noopener">Abrir vídeo no YouTube</a>
    <div class="small">STELLARI PRODUÇÕES SOLUÇÕES DIGITAIS</div>
  </div>

  <script>
    setTimeout(function () {
      window.location.href = "${youtubeApp}";
    }, 400);

    setTimeout(function () {
      window.location.href = "${youtubeWeb}";
    }, 1800);
  </script>
</body>
</html>`;

  return html(200, page);
}
