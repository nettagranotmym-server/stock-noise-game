/* =============================================
   player.js — לוגיקת מסך השחקן
   ============================================= */

/* ─────────────────────────────────────────────
   LOGIN
   ───────────────────────────────────────────── */
function goPlayerLogin() {
  showScreen('screen-player-login');
  buildPlayerGrid();
  buildAvatarGrid();
}

function buildPlayerGrid() {
  const grid = document.getElementById('playerGrid');
  grid.innerHTML = '';

  for (let i = 1; i <= MAX_PLAYERS; i++) {
    const joined = !!players[i];
    const btn    = document.createElement('button');
    btn.className = 'player-btn' + (joined ? ' selected' : '');
    btn.innerHTML = `
      <div class="p-num">${i}</div>
      <div class="p-label">${joined ? players[i].avatar : 'פנוי'}</div>`;
    if (!joined) btn.onclick = () => selectPlayerNum(i);
    grid.appendChild(btn);
  }
}

function selectPlayerNum(num) {
  selectedPlayerNum = num;
  document.querySelectorAll('.player-btn').forEach((b, i) => {
    b.classList.toggle('selected', i + 1 === num);
  });
  document.getElementById('avatarSection').classList.add('visible');
  checkJoinReady();
}

function buildAvatarGrid() {
  const grid = document.getElementById('avatarGrid');
  grid.innerHTML = '';
  ALL_AVATARS.forEach(a => {
    const btn    = document.createElement('button');
    btn.className = 'avatar-btn';
    btn.textContent = a;
    btn.onclick  = () => selectAvatar(a, btn);
    grid.appendChild(btn);
  });
}

function selectAvatar(avatar, btn) {
  selectedAvatar = avatar;
  document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  checkJoinReady();
}

function checkJoinReady() {
  document.getElementById('joinBtn').disabled = !(selectedPlayerNum && selectedAvatar);
}

function joinGame() {
  if (!selectedPlayerNum || !selectedAvatar) return;

  players[selectedPlayerNum] = {
    id:       selectedPlayerNum,
    avatar:   selectedAvatar,
    cash:     100_000,
    holdings: { nova: 0, prime: 0, fast: 0 },
    done:     false,
    history:  [],
  };

  currentPlayer = { id: selectedPlayerNum, avatar: selectedAvatar };
  syncPushPlayerUpdate();
  updateAdminGrid();

  if (gamePhase === 'intro') {
    showWaiting('ממתינים לADMIN שיתחיל את המשחק...', false);
  } else {
    openPlayerGame();
  }
}

/* ─────────────────────────────────────────────
   GAME SCREEN
   ───────────────────────────────────────────── */
function openPlayerGame() {
  if (!currentPlayer) return;
  const p = players[currentPlayer.id];
  if (!p) return;

  p.done = false;
  showScreen('screen-player-game');

  const yd = YEARS_DATA[currentYearIndex];
  document.getElementById('phAvatar').textContent = p.avatar;
  document.getElementById('phName').textContent   = `שחקנ/ית ${p.id}`;
  document.getElementById('phYear').textContent   = isTrial ? 'שנת ניסיון' : yd.label;

  refreshPlayerHeader();
  buildPlayerCards();
}

function refreshPlayerHeader() {
  document.getElementById('phPortfolio').textContent =
    fmt(getPortfolioValue(currentPlayer.id));
}

function buildPlayerCards() {
  const body = document.getElementById('playerBody');
  const p    = players[currentPlayer.id];
  body.innerHTML = '';

  /* Cash bar */
  body.innerHTML += `
    <div class="cash-bar">
      <span class="cash-label">💵 מזומן זמין</span>
      <span class="cash-amount" id="cashDisplay">${fmt(p.cash)}</span>
    </div>`;

  /* Company cards */
  COMPANIES.forEach(co => {
    const data     = YEARS_DATA[currentYearIndex][co.id];
    const held     = p.holdings[co.id] || 0;
    const holdVal  = held * data.price;

    body.innerHTML += `
      <div class="trading-card ${co.cardClass}" id="card-${co.id}">
        <div class="tc-header">
          <div>
            <div class="company-tag ${co.tagClass}">${co.tag}</div>
            <div class="tc-company-name">${co.name}</div>
          </div>
          <div class="tc-price-block">
            <div class="tc-price">₪${data.price}</div>
            <div class="tc-price-change" style="color:var(--gray-dark)">למניה</div>
          </div>
        </div>
        <div class="tc-holdings">
          <div class="holding-pill">מניות: <span id="held-${co.id}">${held}</span></div>
          <div class="holding-pill">שווי: <span id="heldval-${co.id}">${fmt(holdVal)}</span></div>
        </div>
        <div class="tc-trade">
          <button class="trade-btn btn-sell"
            id="sellbtn-${co.id}"
            onclick="openModal('${co.id}','sell')"
            ${held === 0 ? 'disabled' : ''}>
            מכור ▾
          </button>
          <button class="trade-btn btn-buy"
            id="buybtn-${co.id}"
            onclick="openModal('${co.id}','buy')">
            קנה ▴
          </button>
        </div>
      </div>`;
  });
}

/* רענון כרטיס בודד אחרי עסקה */
function refreshPlayerCard(coId) {
  const p    = players[currentPlayer.id];
  const data = YEARS_DATA[currentYearIndex][coId];
  const held = p.holdings[coId] || 0;

  document.getElementById('held-'    + coId).textContent = held;
  document.getElementById('heldval-' + coId).textContent = fmt(held * data.price);
  document.getElementById('sellbtn-' + coId).disabled    = (held === 0);
  document.getElementById('cashDisplay').textContent      = fmt(p.cash);
  refreshPlayerHeader();
}

/* ─────────────────────────────────────────────
   DONE — שחקן סיים לסחור
   ───────────────────────────────────────────── */
function playerDone() {
  const p = players[currentPlayer.id];
  p.done  = true;
  syncPushPlayerUpdate();
  showWaiting(null, true);
}

/* ─────────────────────────────────────────────
   WAITING SCREEN
   ───────────────────────────────────────────── */
function showWaiting(customMsg, showSummary) {
  document.getElementById('waitingAvatar').textContent = currentPlayer.avatar;

  if (customMsg) {
    document.getElementById('waitingSub').textContent = customMsg;
  }

  if (showSummary) {
    const p        = players[currentPlayer.id];
    const totalVal = getPortfolioValue(currentPlayer.id);
    const yd       = YEARS_DATA[currentYearIndex];
    let html       = '';

    COMPANIES.forEach(co => {
      const held = p.holdings[co.id] || 0;
      if (held > 0) {
        html += `
          <div class="summary-row">
            <span class="summary-label">${co.name} × ${held}</span>
            <span class="summary-value">${fmt(held * yd[co.id].price)}</span>
          </div>`;
      }
    });

    html += `
      <div class="summary-row">
        <span class="summary-label">💵 מזומן</span>
        <span class="summary-value">${fmt(p.cash)}</span>
      </div>
      <div class="summary-row summary-total">
        <span class="summary-label" style="color:white;font-weight:700">שווי תיק</span>
        <span class="summary-value">${fmt(totalVal)}</span>
      </div>`;

    document.getElementById('waitingSummary').innerHTML = html;
  }

  showScreen('screen-player-waiting');
}

/* ─────────────────────────────────────────────
   END SCREEN
   ───────────────────────────────────────────── */
function showPlayerEnd() {
  if (!currentPlayer) return;
  const p        = players[currentPlayer.id];
  const finalVal = getPortfolioValue(currentPlayer.id);
  const pct      = ((finalVal - 100_000) / 100_000 * 100).toFixed(1);
  const isGood   = finalVal >= 100_000;

  const trophy =
    finalVal >= 150_000 ? '🏆' :
    finalVal >= 120_000 ? '🥈' :
    finalVal >= 100_000 ? '🌱' : '📉';

  document.getElementById('endTrophy').textContent    = trophy;
  document.getElementById('endPlayerName').textContent =
    `${p.avatar} שחקנ/ית ${p.id}`;

  let html = `
    <div class="end-value-card">
      <div class="end-value-label">שווי תיק סופי</div>
      <div class="end-value-num">${fmt(finalVal)}</div>
      <div class="end-value-change ${isGood ? 'change-positive' : 'change-negative'}">
        ${isGood ? '+' : ''}${pct}% מההשקעה הראשונית
      </div>
    </div>
    <div class="end-holdings-card">
      <div class="end-card-title">תיק ההשקעות שלי</div>`;

  COMPANIES.forEach(co => {
    const held = p.holdings[co.id] || 0;
    const val  = held * YEARS_DATA[5][co.id].price;
    html += `
      <div class="end-holding-row">
        <span class="end-holding-name">${co.name}${held > 0 ? ' × ' + held : ''}</span>
        <span class="end-holding-perf"
          style="color:${held > 0 ? 'white' : 'rgba(255,255,255,0.4)'}">
          ${held > 0 ? fmt(val) : '—'}
        </span>
      </div>`;
  });

  html += `
    </div>
    <div class="insight-card">
      <div class="insight-icon">💡</div>
      <div class="insight-text">
        חדשות יכולות להפחיד או להלהיב – אבל הן לא תמיד משקפות את איכות העסק.
        משקיעה טובה לומדת להבדיל בין רעש לבין שינוי אמיתי.
      </div>
    </div>
    <button class="btn-new-game" onclick="resetGame()">משחק חדש ↺</button>`;

  document.getElementById('endBody').innerHTML = html;
  showScreen('screen-player-end');
}

function resetGame() {
  currentPlayer     = null;
  selectedPlayerNum = null;
  selectedAvatar    = null;
  showScreen('screen-role');
}