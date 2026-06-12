const express = require('express');
const { WebSocketServer } = require('ws');
const path = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Serve all static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ── WebSocket server ──────────────────────────
const wss = new WebSocketServer({ server });

// Keep track of all connected clients
const clients = new Set();

// Last known game state (so late joiners get it immediately)
let lastGameState   = null;
let lastPlayerState = {};   // { [playerId]: playerObject }

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`Client connected. Total: ${clients.size}`);

  // Send current state to new connection immediately
  if (lastGameState) {
    ws.send(JSON.stringify({ type: 'gameState', payload: lastGameState }));
  }

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'gameState') {
      // ADMIN broadcasting a new year / end
      lastGameState = msg.payload;
      broadcast({ type: 'gameState', payload: msg.payload }, ws);

    } else if (msg.type === 'playerUpdate') {
      // Player sending their portfolio update
      const player = msg.payload;
      lastPlayerState[player.id] = player;
      broadcast({ type: 'playerUpdate', payload: player }, ws);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total: ${clients.size}`);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
    clients.delete(ws);
  });
});

// Broadcast to all clients except the sender
function broadcast(msg, sender) {
  const data = JSON.stringify(msg);
  for (const client of clients) {
    if (client !== sender && client.readyState === 1) {
      client.send(data);
    }
  }
}