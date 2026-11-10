'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'], '/styles.css': ['styles.css', 'text/css'], '/app.js': ['app.js', 'text/javascript'], '/template-options.json': ['template-options.json', 'application/json'] };
const server = http.createServer((req, res) => {
  const entry = files[req.url];
  if (req.method !== 'GET' || !entry) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': entry[1] + '; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self'; img-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'" });
  res.end(fs.readFileSync(path.join(__dirname, entry[0])));
});
if (require.main === module) server.listen(4173, '127.0.0.1', () => console.log('Consult Note: http://127.0.0.1:4173'));
module.exports = server;
