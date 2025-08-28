#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;
const DOCS_DIR = path.join(__dirname, '../docs');

const mimeTypes = {
  '.html': 'text/html',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'text/plain';
}

const server = http.createServer((req, res) => {
  let filePath = path.join(DOCS_DIR, req.url === '/' ? 'index.html' : req.url);

  // Security check - prevent directory traversal
  if (!filePath.startsWith(DOCS_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }

    const mimeType = getMimeType(filePath);
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`🏥 Rimac API Documentation Server running at:`);
  console.log(`📖 Swagger UI: http://localhost:${PORT}`);
  console.log(`📄 OpenAPI Spec: http://localhost:${PORT}/api.yaml`);
  console.log(`\n🚀 Opening browser...`);

  // Open browser automatically
  const url = `http://localhost:${PORT}`;
  const platform = process.platform;

  if (platform === 'win32') {
    exec(`start ${url}`);
  } else if (platform === 'darwin') {
    exec(`open ${url}`);
  } else {
    exec(`xdg-open ${url}`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please close other applications or use a different port.`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down documentation server...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});
