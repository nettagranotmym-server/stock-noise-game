/* =============================================
   admin.js — לוגיקת מסך ADMIN
   ============================================= */

/* ── Entry point ── */
function goAdmin() {
  showScreen('screen-admin');
  buildAdminIntro();
  buildAdminPlayersGrid();
}

/* ─────────────────────────────────────────────
   INTRO — כרטיסי חברות
   ───────────────────────────────────────────── */
function buildAdminIntro() {
  const container = document.getElementById('adminIntroCards');
  container.innerHTML = '';

  COMPANIES.forEach(co => {
    const moatLabel  = ['','בינוני','טוב','חזק מאוד'][co.moat]  || '';
    const mgmtLabel  = ['','בינונית','טובה','גבוהה'][co.mgmt]   || '';
    const debtLabel  = ['','גבוה','בינוני','נמוך'][co.debt]     || '';
    const moatDots   = renderDots(co.moat, 3, 'var(--purple-mid)');
    const mgmtDots   = renderDots(co.mgmt, 3, 'var(--green)');
    const debtDots   = renderDots(co.debt, 3, 'var(--gold)');

    container.innerHTML += `
      <div class="company-card-admin ${co.cardClass}">
        <div class="company-tag ${co.tagClass}">${co.tag}</div>
        <div class="company-name-admin">${co.name}</div>
        <div class="company-story">${co.story}</div>
        <div class="company-stats-row">
          <div class="stat-pill">
            <span class="stat-label">חפיר תחרותי</span>
            ${moatDots}
            <span style="font-size:12px;color:var(--gray-dark);margin-right:6px">${moatLabel}</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">יציבות הנהלה</span>
            ${mgmtDots}
            <span style="font-size:12px;color:var(--gray-dark);margin-right:6px">${mgmtLabel}</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">מבנה חוב</span>
            ${debtDots}
            <span style="font-size:12px;color:var(--gray-dark);margin-right:6px">${debtLabel}</span>
          </div>
        </div>
        <div class="price-badge">מחיר מניה: ₪${co.startPrice}</div>
      </div>`;
  });
}

/* ─────────────────────────────────────────────
   PLAYERS GRID
   ───────────────────────────────────────────── */
function buildAdminPlayersGrid() {
  const grid = document.getElementById('adminPlayersGrid');
  grid.innerHTML = '';

  for (let i = 1; i <= MAX_PLAYERS; i++) {
    const tile = document.createElement('div');
    tile.id        = 'ptile-' + i;
    tile.className = 'player-tile not-joined';
    tile.innerHTML = `
      <div class="tile-avatar">○</div>
      <div class="tile-num">${i}</div>
      <div class="tile-value"></div>
      <div class="waiting-indicator"></div>`;
    grid.appendChild(tile);
  }
  updateAdminGrid();
}

function updateAdminGrid() {
  for (let i = 1; i <= MAX_PLAYERS; i++) {
    const tile = document.getElementById('ptile-' + i);
    if (!tile) continue;
    const p = players[i];

    tile.className = 'player-tile ' + (!p ? 'not-joined' : p.done ? 'waiting' : '');
    tile.querySelector('.tile-avatar').textContent = p ? p.avatar : '○';
    tile.querySelector('.tile-value').textContent  = p ? fmt(getPortfolioValue(i)) : '';
  }
  updateReadyCount();
}

function updateReadyCount() {
  const joined = Object.keys(players).length;
  const ready  = Object.values(players).filter(p => p.done).length;
  document.getElementById('readyCount').textContent = `${ready} / ${joined} סיימו לסחור`;

  if (joined > 0 && ready === joined) {
    const sec = document.getElementById('playersSection');
    sec.classList.add('all-ready-glow');
    setTimeout(() => sec.classList.remove('all-ready-glow'), 3100);
  }
}

/* ─────────────────────────────────────────────
   YEAR VIEW
   ───────────────────────────────────────────── */
function buildAdminYearView(yi) {
  const row  = document.getElementById('adminYearCards');
  row.innerHTML = '';
  const yd   = YEARS_DATA[yi];
  const prev = yi > 0 ? YEARS_DATA[yi - 1] : null;

  COMPANIES.forEach(co => {
    const data = yd[co.id];
    let changeHtml = '';

    if (prev) {
      const prevPrice = prev[co.id].price;
      const pct = ((data.price - prevPrice) / prevPrice * 100).toFixed(1);
      const cls  = pct > 0 ? 'change-up' : pct < 0 ? 'change-down' : 'change-same';
      const sign = pct > 0 ? '+' : '';
      changeHtml = `<span class="price-change-badge ${cls}">${sign}${pct}%</span>`;
    }

    row.innerHTML += `
      <div class="year-company-card">
        <div class="year-company-header">
          <div>
            <div class="company-tag ${co.tagClass}" style="margin-bottom:6px">${co.tag}</div>
            <div class="company-name-admin">${co.name}</div>
          </div>
          <div class="year-price-change">
            <div class="price-now">₪${data.price}</div>
            ${changeHtml}
          </div>
        </div>
        <div class="news-headline">📰 ${data.news}</div>
        <div class="financials-row">
          <div class="fin-box">
            <div class="fin-label">הכנסות</div>
            <div class="fin-value">${data.rev}</div>
          </div>
          <div class="fin-box">
            <div class="fin-label">רווח</div>
            <div class="fin-value ${data.profitClass}">${data.profit}</div>
          </div>
        </div>
      </div>`;
  });
}

/* ─────────────────────────────────────────────
   GAME CONTROL BUTTONS
   ───────────────────────────────────────────── */
function adminStartGame() {
  gamePhase        = 'trial';
  isTrial          = true;
  currentYearIndex = 0;

  document.getElementById('adminIntroView').classList.add('hidden');
  document.getElementById('adminYearView').classList.add('visible');
  document.getElementById('adminYearBadge').textContent   = 'שנת ניסיון';
  document.getElementById('adminPilot').style.display     = 'inline-block';
  document.getElementById('btnAdminNext').disabled        = false;
  document.getElementById('btnAdminStart').textContent    = '↺ אפס ניסיון';

  Object.values(players).forEach(p => { p.done = false; });
  buildAdminYearView(0);
  updateAdminGrid();
  syncPushToPlayers();
}

function adminNextYear() {
  Object.values(players).forEach(p => { p.done = false; });

  if (isTrial) {
    /* ── End trial: reset portfolios & start real game ── */
    isTrial          = false;
    currentYearIndex = 1;
    gamePhase        = 'game';

    Object.values(players).forEach(p => {
      p.cash     = 100_000;
      p.holdings = { nova: 0, prime: 0, fast: 0 };
      p.history  = [];
    });

    document.getElementById('adminPilot').style.display = 'none';
  } else {
    currentYearIndex++;
  }

  if (currentYearIndex > 5) {
    adminShowEnd();
    return;
  }

  const yd = YEARS_DATA[currentYearIndex];
  document.getElementById('adminYearBadge').textContent = yd.label;

  if (currentYearIndex === 5) {
    document.getElementById('btnAdminNext').textContent = 'סיום ←';
  }

  buildAdminYearView(currentYearIndex);
  updateAdminGrid();
  syncPushToPlayers();
}

/* ─────────────────────────────────────────────
   END / LEADERBOARD
   ───────────────────────────────────────────── */
function adminShowEnd() {
  gamePhase = 'end';

  document.getElementById('adminYearView').classList.remove('visible');
  document.getElementById('adminEndView').classList.add('visible');
  document.getElementById('btnAdminNext').disabled        = true;
  document.getElementById('btnAdminEnd').style.display   = 'none';
  document.getElementById('adminYearBadge').textContent  = 'סיום המשחק 🏁';

  buildLeaderboard();
  syncPushEnd();
}

function buildLeaderboard() {
  const sorted = Object.values(players)
    .sort((a, b) => getPortfolioValue(b.id) - getPortfolioValue(a.id));

  const lb     = document.getElementById('adminLeaderboard');
  lb.innerHTML = '';
  const medals = ['🥇','🥈','🥉'];

  sorted.forEach((p, i) => {
    const val  = getPortfolioValue(p.id);
    const pct  = ((val - 100_000) / 100_000 * 100).toFixed(1);
    const sign = pct >= 0 ? '+' : '';
    const cls  = i < 3 ? `rank-${i + 1}` : '';

    lb.innerHTML += `
      <div class="lb-card ${cls}">
        <div class="lb-rank">${medals[i] || '#' + (i + 1)}</div>
        <div class="lb-avatar">${p.avatar}</div>
        <div class="lb-name">שחקנ/ית ${p.id}</div>
        <div class="lb-value">${fmt(val)}</div>
        <div class="lb-change ${pct >= 0 ? 'change-positive' : 'change-negative'}">${sign}${pct}%</div>
      </div>`;
  });
}