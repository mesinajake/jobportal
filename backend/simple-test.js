import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
});

server.listen(8888, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:8888/');
  console.log('Server address:', server.address());
  console.log('Server listening:', server.listening);
  console.log('Try: curl http://localhost:8888');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
