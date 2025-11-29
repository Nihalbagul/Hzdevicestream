// Live SSE simulator
// Usage: `node live_sse_server.js` then GET http://localhost:8080/stream
const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'device_stream_20min.jsonl');
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const lines = fs.readFileSync(DATA_PATH, 'utf-8').trim().split('\n');

const server = http.createServer((req, res) => {
  // CORS headers for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  if (req.url === '/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      ...corsHeaders
    });
    
    let i = 0;
    const send = () => {
      res.write(`data: ${lines[i]}\n\n`);
      i = (i + 1) % lines.length;
    };
    
    send();
    const t = setInterval(send, 1000);
    req.on('close', () => clearInterval(t));
  } else {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      ...corsHeaders
    });
    res.end('OK. Use /stream for SSE.');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`SSE server running at http://${HOST}:${PORT}/stream`);
});
