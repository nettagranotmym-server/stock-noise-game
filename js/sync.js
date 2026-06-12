/* =============================================
   sync.js — סנכרון בין ADMIN לשחקנים
               דרך localStorage (ללא שרת)
   ============================================= */

/* ─────────────────────────────────────────────
   ADMIN → שחקנים
   ───────────────────────────────────────────── */

/** ADMIN שולח עדכון שנה חדשה */
function syncPushToPlayers() {
  localStorage.setItem('gameState', JSON.stringify({
    phase:       gamePhase,
    yearIndex:   currentYearIndex,
    isTrial,
    playerData:  players,
    ts:          Date.now(),
  }));
}

/** ADMIN שולח סיום משחק */
function syncPushEnd() {
  localStorage.setItem('gameState', JSON.stringify({
    phase:      'end',
    yearIndex:  currentYearIndex,
    isTrial:    false,
    playerData: players,
    ts:         Date.now(),
  }));
}

/* ─────────────────────────────────────────────
   שחקן → ADMIN
   ───────────────────────────────────────────── */

/** שחקן שולח עדכון תיק (אחרי כל עסקה / סיום) */
function syncPushPlayerUpdate() {
  if (!currentPlayer) return;
  localStorage.setItem('playerUpdate', JSON.stringify({
    player: players[currentPlayer.id],
    ts:     Date.now(),
  }));
}

/* ─────────────────────────────────────────────
   POLLING — שחקן מאזין לADMIN
   ───────────────────────────────────────────── */
setInterval(() => {
  if (!currentPlayer) return;                     // לא שחקן → מדלג
  const raw = localStorage.getItem('gameState');
  if (!raw) return;

  let gs;
  try { gs = JSON.parse(raw); } catch { return; }

  const onWaiting = document.getElementById('screen-player-waiting')
    .classList.contains('active');
  const onLogin   = document.getElementById('screen-player-login')
    .classList.contains('active');

  /* השחקן מחכה (כבר לחץ "סיימתי") או עדיין בלוגין */
  if (onWaiting || onLogin) {
    if (gs.phase === 'end') {
      // עדכן נתוני שחקן מהאחסון
      if (gs.playerData && gs.playerData[currentPlayer.id]) {
        Object.assign(players[currentPlayer.id], gs.playerData[currentPlayer.id]);
      }
      showPlayerEnd();
      return;
    }

    if (gs.yearIndex !== currentYearIndex) {
      currentYearIndex = gs.yearIndex;
      isTrial          = gs.isTrial;
      // עדכן state שחקנים מה-ADMIN
      if (gs.playerData) Object.assign(players, gs.playerData);
      openPlayerGame();
    }
  }
}, 1500);

/* ─────────────────────────────────────────────
   POLLING — ADMIN מאזין לשחקנים
   ───────────────────────────────────────────── */
setInterval(() => {
  const raw = localStorage.getItem('playerUpdate');
  if (!raw) return;

  let upd;
  try { upd = JSON.parse(raw); } catch { return; }

  if (upd && upd.player) {
    players[upd.player.id] = upd.player;
    updateAdminGrid();
    localStorage.removeItem('playerUpdate');
  }
}, 800);