const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Normalize URL and remove query strings/hashes
  const parsedUrl = req.url.split('?');
  let reqPath = decodeURI(parsedUrl[0]);
  const query = parsedUrl[1] ? '?' + parsedUrl[1] : '';

  // 1. Clean URL redirect: If user accesses any .html file directly, redirect to clean URL
  if (reqPath.endsWith('.html')) {
    let clean = reqPath.slice(0, -5);
    if (clean === '/index') clean = '/';
    res.writeHead(301, { 'Location': clean + query });
    res.end();
    return;
  }

  // 2. Redirect alias routes (e.g. /contact-us -> /contact, /about-us -> /about)
  if (reqPath === '/contact-us' || reqPath === '/contact-us/') {
    res.writeHead(301, { 'Location': '/contact' + query });
    res.end();
    return;
  }
  if (reqPath === '/about-us' || reqPath === '/about-us/') {
    res.writeHead(301, { 'Location': '/about' + query });
    res.end();
    return;
  }

  // 3. Resolve target file
  let candidateFiles = [];
  if (reqPath === '/' || reqPath === '' || reqPath === '/home' || reqPath === '/home/') {
    candidateFiles.push(path.join(ROOT, 'index.html'));
  } else {
    const trimmed = reqPath.endsWith('/') ? reqPath.slice(0, -1) : reqPath;
    candidateFiles.push(
      path.join(ROOT, trimmed + '.html'),
      path.join(ROOT, trimmed, 'index.html'),
      path.join(ROOT, reqPath)
    );
  }

  // Security: prevent directory traversal
  for (const f of candidateFiles) {
    if (!f.startsWith(ROOT)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }
  }

  function tryNextFile(index) {
    if (index >= candidateFiles.length) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const currentFile = candidateFiles[index];
    fs.stat(currentFile, (err, stats) => {
      if (err) {
        return tryNextFile(index + 1);
      }

      let fileToRead = currentFile;
      if (stats.isDirectory()) {
        fileToRead = path.join(currentFile, 'index.html');
      }

      fs.readFile(fileToRead, (readErr, data) => {
        if (readErr) {
          return tryNextFile(index + 1);
        }

        const ext = path.extname(fileToRead).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(data);
      });
    });
  }

  tryNextFile(0);
});

server.listen(PORT, () => {
  console.log(`Zyrox Media Local Server running at http://localhost:${PORT}/ (Clean URLs enabled)`);
});
