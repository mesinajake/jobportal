// Minimal Express server to test if port binding works at all
import express from 'express';

const app = express();
const PORT = 5001; // Try different port

app.get('/test', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal test server listening on port ${PORT}`);
  console.log(`🔍 Server address:`, server.address());
  console.log(`🔍 Server listening:`, server.listening);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
