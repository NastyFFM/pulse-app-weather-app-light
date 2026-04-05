const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3100;
const APP_ID = 'weather-app-light';
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

http.createServer((req, res) => {
  // Data API
  if (req.url.startsWith(`/app/${APP_ID}/api/`)) {
    const file = req.url.split('/api/')[1].replace(/[^a-z0-9-]/g, '');
    const fp = path.join(__dirname, 'data', file + '.json');
    if (req.method === 'GET') {
      try { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(fs.readFileSync(fp)); }
      catch { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{}'); }
      return;
    }
    if (req.method === 'PUT') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try { fs.writeFileSync(fp, body); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}'); }
        catch (e) { res.writeHead(500); res.end('{"error":"write failed"}'); }
      });
      return;
    }
  }

  // Static files
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const fp = path.join(__dirname, urlPath);

  try {
    const data = fs.readFileSync(fp);
    const ext = path.extname(fp);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(PORT, () => console.log(`Weather app running on port ${PORT}`));
