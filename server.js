const express = require('express');

// Create express app
const app = express();
app.use(express.static(`${process.cwd()}/public`));

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const WebSocket = require('./web-socket');

// Hook up web sockets
WebSocket.setup(io);

// Start server
const port = process.env.PORT || 8000;
server.listen(port);
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  console.info(`[${new Date()}] Listening on ${bind}`); // eslint-disable-line no-console
});
