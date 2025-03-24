const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const connections = new Map();

wss.on('connection', (ws, req) => {
  const userId = req.url.split('?id=')[1];
  connections.set(userId, ws);

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const targetUser = connections.get(data.targetId);

    if (targetUser) {
      targetUser.send(JSON.stringify(data));
    }
  });

  ws.on('close', () => {
    connections.delete(userId);
  });
});
