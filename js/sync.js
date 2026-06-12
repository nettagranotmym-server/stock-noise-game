/* =============================================
   sync.js — סנכרון בין ADMIN לשחקנים
               דרך WebSocket (אמיתי, בין מכשירים)
   ============================================= */

const WS_URL = `wss://${window.location.host}`;
let ws = null;
let wsReady = false;

function connectWebSocket() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    wsReady = true;
    console.log('WebSocket connected');
  };

  ws.onclose = () => {
    wsReady = false;
    console.log('WebSocket disconnected — reconnecting in 2s...');
    setTimeout(connectWebSocket, 2000);
  };

  ws.onerror = (err) => {
    console.error('WebSocket error:', err);
  };

  ws.onmessage = (event) => {
    let msg;
    try { msg = JSON.parse(event.data); } catch { return; }

    if (msg.type === 'gameState') {
      handleGameStateFromServer(msg.payload);
    } else if (msg.type === 'playerUpdate') {
      handlePlayerUpdateFromServer(msg.payload);
    }
  };
}

/* ─────────────────────────────────────────────
   ADMIN → שחקנים
   ───────────────────────────────────────────── */
function syncPushToPlayers() {
  sendWS({
    type: 'gameState',
    payload: {
      phase:      gamePhase,
      yearIndex:  currentYearIndex,
      isTrial,
      playerData: players,
      ts:         Date.now(),
    }
  });
}

function syncPushEnd() {
  sendWS({
    type: 'gameState',
    payload: {
      phase:      'end',
      yearIndex:  currentYearIndex,
      isTrial:    false,
      playerData: players,
      ts:         Date.now(),
    }
  });
}

/* ─────────────────────────────────────────────
   שחקן → ADMIN
   ───────────────────────────────────────────── */
function syncPushPlayerUpdate() {
  if (!currentPlayer) return;
  sendWS({
    type:    'playerUpdate',
    payload: players[currentPlayer.id],
  });
}

/* ─────────────────────────────────────────────
   קבלת עדכונים מהשרת
   ───────────────────────────────────────────── */
function handleGameStateFromServer(gs) {
  if (!currentPlayer) return;  // not a player tab

  const onWaiting = document.getElementById('screen-player-waiting')
    ?.classList.contains('active');
  const onLogin = document.getElementById('screen-player-login')
    ?.classList.contains('active');

  if (onWaiting || onLogin) {
    if (gs.phase === 'end') {
      if (gs.playerData && gs.playerData[currentPlayer.id]) {
        Object.assign(players[currentPlayer.id], gs.playerData[currentPlayer.id]);
      }
      showPlayerEnd();
      return;
    }

    if (gs.yearIndex !== currentYearIndex) {
      currentYearIndex = gs.yearIndex;
      isTrial          = gs.isTrial;
      if (gs.playerData) Object.assign(players, gs.playerData);
      openPlayerGame();
    }
  }
}

function handlePlayerUpdateFromServer(player) {
  if (!player) return;
  // only admin tab processes this
  const isAdminTab = document.getElementById('screen-admin') !== null
    && document.getElementById('screen-player-login') === null;
  if (!isAdminTab) return;

  players[player.id] = player;
  updateAdminGrid();
}

/* ─────────────────────────────────────────────
   שליחה בטוחה
   ───────────────────────────────────────────── */
function sendWS(msg) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  } else {
    console.warn('WebSocket not ready, message dropped:', msg.type);
  }
}

/* ─────────────────────────────────────────────
   התחברות בטעינת הדף
   ───────────────────────────────────────────── */
connectWebSocket();