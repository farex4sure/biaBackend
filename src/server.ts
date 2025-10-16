import http from 'http';
import app from './app';

const PORT = process.env.PORT || 8080;

// Create HTTP Server
const server = http.createServer(app);

// Start Server
server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
