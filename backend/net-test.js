import net from 'net';

const server = net.createServer((socket) => {
  socket.write('Hello!\r\n');
  socket.end();
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  console.error('Code:', err.code);
  console.error('Message:', err.message);
});

server.listen(5000, '127.0.0.1', () => {
  console.log('✅ TCP server listening on port 5000');
  console.log('Address:', server.address());
  
  // Keep alive
  setTimeout(() => {
    console.log('Still alive after 10 seconds');
  }, 10000);
});

console.log('Starting TCP server...');
