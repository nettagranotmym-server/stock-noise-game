// =============================================
// app.js — Player screen logic
// =============================================

// ── State ─────────────────────────────────────
let S = {
  playerId:   null,
  playerName: null,
  alloc:      { nova: 34, prime: 33, fast: 33 },
  totalValue: STARTING_CASH,
  yearIndex:  0,       // matches YEARS array
  done:       false,
  _poll:      null,
};

// ── Screen helper ─────────────────────────────
function showSc(id) {
  document.querySelectorAll(".sc").forEach(s => s.classList.remove("on"));
  document.getElementById(id).classList.add("on");
  window.scrollTo(0, 0);
}

// ── Init ──────────────────────────────────────
(function init() {
  renderPlayerGrid();
  document.getElementById("startBtn").addEventListener("click", joinGame);
  showSc("scrLogin");
})();

// ── Player grid ───────────────────────────────
async function renderPlayerGrid() {
  const grid  = document.getElementById("playerGrid");
  let taken   = {};
  try { taken = await apiGet("/api/slots"); } catch(e) {}

  grid.innerHTML = "";
  for (let i = 1; i <= MAX_PLAYERS; i++) {
    const isTaken = !!taken[i];
    const emoji   = PLAYER_EMOJIS[i - 1];
    const btn     = document.createElement("button");
    btn.className = "tb" + (isTaken ? " tb-taken" : "");
    btn.disabled  = isTaken;
    btn.innerHTML = `<span class="te">${isTaken ? "🔒" : emoji}</span><span class="tn">${i}</span>`;
    if (!isTaken) btn.addEventListener("click", () => selectPlayer(i, btn));
    grid.appendChild(btn);
  }

  // Poll for changes every 3s while on login screen
  clearInterval(S._poll);
  S._poll = setInterval(async () => {
    const sc = document.getElementById("scrLogin");
    if (!sc || !sc.classList.contains("on")) { clearInterval(S._poll); return; }
    let t = {};
    try { t = await apiGet("/api/slots"); } catch(e) {}
    for (let i = 1; i <= MAX_PLAYERS; i++) {
      if (t[i]) {
        const btn = grid.querySelector(`.tb:nth-child(${i})`);
        if (btn && !btn.classList.contains("tb-taken") && !btn.classList.contains("sel")) {
          btn.classList.add("tb-taken");
          btn.disabled = true;
          const teEl = btn.querySelector(".te");
          if (teEl) teEl.textContent = "🔒";
        }
      }
    }
  }, 3000);
}

function selectPlayer(id, btn) {
  S.playerId   = id;
  S.playerName = `שחקנ/ית ${id}`;
  document.querySelectorAll(".tb").forEach(b => b.classList.remove("sel"));
  btn.classList.add("sel");
  document.getElementById("startBtn").classList.add("en");
}

async function joinGame() {
  if (!S.playerId) return;
  clearInterval(S._poll);

  try {
    const res = await apiPost("/api/slots", {
      playerId: S.playerId, playerName: S.playerName,
    });
    if (!res.ok) { alert("המספר הזה כבר נלקח! בחר/י מספר אחר."); renderPlayerGrid(); return; }
  } catch(e) { alert("שגיאת חיבור לשרת"); return; }

  S.totalValue = STARTING_CASH;
  S.alloc      = { nova: 34, prime: 33, fast: 33 };
  S.done       = false;

  showSc("scrGame");
  document.getElementById("gTeam").innerHTML =
    `<span>${PLAYER_EMOJIS[S.playerId - 1]}</span> שחקנ/ית ${S.playerId}`;
  document.getElementById("gBal").textContent = fmt(S.totalValue);

  waitForYear();
}

// ── Wait for admin to open a year ─────────────
function waitForYear() {
  document.getElementById("gContent").innerHTML = `
    <div class="wait-screen">
      <div class="wait-avatar">${PLAYER_EMOJIS[S.playerId - 1]}</div>
      <div class="wait-title">ממתינים למנהלת...</div>
      <div class="wait-sub">המנהלת תפתח את המשחק בקרוב</div>
      <div class="dots-loader" id="waitDots">●</div>
    </div>`;

  let dots = 0;
  S._poll = setInterval(async () => {
    dots = (dots + 1) % 4;
    const el = document.getElementById("waitDots");
    if (el) el.textContent = "●".repeat(dots + 1);

    let state = { openYear: 0 };
    try { state = await apiGet("/api/year"); } catch(e) {}

    if (state.openYear === -1) {
      // Trial opened
      clearInterval(S._poll);
      S.yearIndex = 0;
      showAllocScreen();
    } else if (state.openYear >= 1 && state.openYear <= 5) {
      // Real year opened
      clearInterval(S._poll);
      S.yearIndex = state.openYear;
      showAllocScreen();
    }
  }, 2500);
}

// ── Allocation screen ─────────────────────────
function showAllocScreen() {
  const yr = YEARS[S.yearIndex];
  document.getElementById("gBal").textContent = fmt(S.totalValue);

  const stepLabel = yr.isTrial
    ? `<div class="year-label">🎯 שנת ניסיון — לא נספרת</div>`
    : `<div class="year-label">${yr.label}</div>`;

  const practiceBanner = yr.isTrial
    ? `<div class="practice-badge">🎯 שנת ניסיון — לתרגול בלבד, לא נספרת לתוצאות</div>`
    : "";

  let slidersHtml = COMPANIES.map(co => `
    <div class="sr">
      <div class="sh">
        <div class="sl">
          <span class="sli" style="background:${co.bg};color:${co.color}">${co.icon}</span>
          ${co.name}
        </div>
        <div>
          <span class="sv" id="pct_${co.id}">${S.alloc[co.id]}%</span>
          <span class="sm" id="amt_${co.id}">${fmt(S.totalValue * S.alloc[co.id] / 100)}</span>
        </div>
      </div>
      <input type="range" class="alloc-slider" id="sl_${co.id}"
        min="0" max="100" step="5" value="${S.alloc[co.id]}" />
    </div>`).join("");

  document.getElementById("gContent").innerHTML = `
    ${stepLabel}
    ${practiceBanner}
    <div class="alc">
      <div class="alc-t">📊 בחרי את התמהיל שלך</div>
      ${slidersHtml}
      <div class="aw" id="allocWarn">⚠️ הסכום חייב להסתכם ל-100%</div>
    </div>
    <button class="cbtn" id="allocBtn" disabled>אשרי ועברי לשנה הבאה ✓</button>`;

  COMPANIES.forEach(co => {
    document.getElementById(`sl_${co.id}`).addEventListener("input", () => {
      S.alloc[co.id] = parseInt(document.getElementById(`sl_${co.id}`).value);
      updateSliders();
    });
  });

  document.getElementById("allocBtn").addEventListener("click", confirmAlloc);
  updateSliders();
}

function updateSliders() {
  COMPANIES.forEach(co => {
    const pct = S.alloc[co.id] || 0;
    document.getElementById(`pct_${co.id}`).textContent = pct + "%";
    document.getElementById(`amt_${co.id}`).textContent = fmt(S.totalValue * pct / 100);
  });
  checkTotal();
}

function checkTotal() {
  const sum  = COMPANIES.reduce((s, co) => s + (S.alloc[co.id] || 0), 0);
  const warn = document.getElementById("allocWarn");
  const btn  = document.getElementById("allocBtn");
  if (sum !== 100) {
    warn.classList.add("sh2");
    warn.textContent = sum > 100
      ? `⚠️ חרגת! ${sum}% — צריך להוריד ${sum - 100}%`
      : `⚠️ חסר! רק ${sum}% — צריך להוסיף עוד ${100 - sum}%`;
    btn.disabled = true;
  } else {
    warn.classList.remove("sh2");
    btn.disabled = false;
  }
}

// ── Confirm allocation ────────────────────────
async function confirmAlloc() {
  const sum = COMPANIES.reduce((s, co) => s + (S.alloc[co.id] || 0), 0);
  if (sum !== 100) return;

  S.done = true;

  // Save progress to server
  try {
    await apiPost("/api/progress", {
      id:         S.playerId,
      name:       S.playerName,
      alloc:      S.alloc,
      totalValue: S.totalValue,
      yearIndex:  S.yearIndex,
      done:       true,
    });
  } catch(e) {}

  // If trial, wait for admin to start real game
  if (YEARS[S.yearIndex].isTrial) {
    showWaitingScreen(true);
    waitForRealGame();
  } else if (S.yearIndex >= 5) {
    showResults();
  } else {
    showWaitingScreen(false);
    waitForNextYear();
  }
}

// ── Waiting screen (after confirming alloc) ───
function showWaitingScreen(isTrial) {
  const tv = S.totalValue;
  let summaryHtml = COMPANIES.map(co => {
    const pct = S.alloc[co.id] || 0;
    return pct > 0 ? `
      <div class="sum-row">
        <span>${co.icon} ${co.name} — ${pct}%</span>
        <span class="sum-total">${fmt(tv * pct / 100)}</span>
      </div>` : "";
  }).join("");

  summaryHtml += `
    <div class="sum-row" style="margin-top:4px;padding-top:8px;border-top:2px solid var(--brd2)">
      <span style="font-weight:700">💰 שווי תיק</span>
      <span class="sum-total">${fmt(tv)}</span>
    </div>`;

  document.getElementById("gContent").innerHTML = `
    <div class="wait-screen">
      <div class="wait-avatar">${PLAYER_EMOJIS[S.playerId - 1]}</div>
      <div class="wait-title">ממתינים לשנה הבאה ✓</div>
      <div class="wait-sub">${isTrial ? "המנהלת תאפס ותפתח את המשחק האמיתי" : "המנהלת תפתח את השנה הבאה בקרוב"}</div>
      <div class="wait-summary">${summaryHtml}</div>
      <div class="dots-loader" id="waitDots">●</div>
    </div>`;
}

// ── Poll for real game start (after trial) ────
function waitForRealGame() {
  let dots = 0;
  S._poll = setInterval(async () => {
    dots = (dots + 1) % 4;
    const el = document.getElementById("waitDots");
    if (el) el.textContent = "●".repeat(dots + 1);

    let state = { openYear: 0 };
    try { state = await apiGet("/api/year"); } catch(e) {}

    if (state.openYear >= 1) {
      clearInterval(S._poll);
      // Reset for real game
      S.totalValue = STARTING_CASH;
      S.alloc      = { nova: 34, prime: 33, fast: 33 };
      S.yearIndex  = state.openYear;
      S.done       = false;
      document.getElementById("gBal").textContent = fmt(S.totalValue);
      showAllocScreen();
    }
  }, 2500);
}

// ── Poll for next year ────────────────────────
function waitForNextYear() {
  const currentYearIdx = S.yearIndex;
  let dots = 0;
  S._poll = setInterval(async () => {
    dots = (dots + 1) % 4;
    const el = document.getElementById("waitDots");
    if (el) el.textContent = "●".repeat(dots + 1);

    let state = { openYear: 0 };
    try { state = await apiGet("/api/year"); } catch(e) {}

    const nextIdx = currentYearIdx + 1;
    if (state.openYear >= nextIdx) {
      clearInterval(S._poll);
      // Calculate new portfolio value
      S.totalValue = calcNewValue(S.totalValue, S.alloc, currentYearIdx, nextIdx);
      S.yearIndex  = nextIdx;
      S.done       = false;
      document.getElementById("gBal").textContent = fmt(S.totalValue);
      if (S.yearIndex > 5) { showResults(); return; }
      showAllocScreen();
    }
  }, 2500);
}

// ── Results ───────────────────────────────────
function showResults() {
  showSc("scrResults");

  const pct    = ((S.totalValue - STARTING_CASH) / STARTING_CASH * 100).toFixed(1);
  const isPos  = S.totalValue >= STARTING_CASH;
  const trophy = S.totalValue >= STARTING_CASH * 1.8 ? "🏆" :
                 S.totalValue >= STARTING_CASH * 1.3 ? "🥈" :
                 S.totalValue >= STARTING_CASH        ? "🌱" : "📉";

  document.getElementById("rTeam").textContent =
    `${PLAYER_EMOJIS[S.playerId - 1]} שחקנ/ית ${S.playerId}`;
  document.getElementById("rAmount").textContent = fmt(S.totalValue);

  const rr = document.getElementById("rReturn");
  rr.textContent = `${isPos ? "+" : ""}${pct}% תשואה כוללת`;
  rr.className   = `fr ${isPos ? "pos" : "neg"}`;

  document.getElementById("rTrophy").textContent = trophy;

  // Holdings breakdown
  let det = `<div class="det-t">תמהיל סופי</div>`;
  COMPANIES.forEach(co => {
    const pctAlloc = S.alloc[co.id] || 0;
    det += `<div class="det-r">
      <span>${co.icon} ${co.name}</span>
      <span style="font-weight:700;color:var(--primary)">${pctAlloc}%</span>
    </div>`;
  });
  document.getElementById("rDetails").innerHTML = det;

  document.getElementById("restartBtn").addEventListener("click", restart);
}

function restart() {
  clearInterval(S._poll);
  S = {
    playerId: null, playerName: null,
    alloc: { nova: 34, prime: 33, fast: 33 },
    totalValue: STARTING_CASH,
    yearIndex: 0, done: false, _poll: null,
  };
  document.querySelectorAll(".tb").forEach(b => b.classList.remove("sel"));
  document.getElementById("startBtn").classList.remove("en");
  renderPlayerGrid();
  showSc("scrLogin");
}