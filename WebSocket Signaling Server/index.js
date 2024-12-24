const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

const connections = new Map();

wss.on("connection", (ws, req) => {
  const userId = new URLSearchParams(req.url.split("?")[1]).get("id");
  if (!userId) {
    ws.close(1008, "Missing user ID");
    return;
  }

  console.log(`User connected: ${userId}`);
  connections.set(userId, ws);

  ws.on("message", message => {
    const data = JSON.parse(message);

    if (data.targetId) {
      const targetWs = connections.get(data.targetId);
      if (targetWs && targetWs.readyState === WebSocket.OPEN) {
        console.log(`Relaying message from ${userId} to ${data.targetId}`);
        targetWs.send(JSON.stringify({ ...data, senderId: userId }));
      } else {
        console.warn(`Target ${data.targetId} not connected.`);
      }
    }
  });

  ws.on("close", () => {
    console.log(`User disconnected: ${userId}`);
    connections.delete(userId);
  });

  ws.on("error", error => {
    console.error(`WebSocket error for user ${userId}:`, error);
  });
});
