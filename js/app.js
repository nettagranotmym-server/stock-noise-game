// =============================================
// app.js — Player screen logic
// =============================================

let S = {
  playerId:   null,
  playerName: null,
  alloc:      { nova: 34, prime: 33, fast: 33 },
  prevAlloc:  null,
  totalValue: STARTING_CASH,
  yearIndex:  0,
  done:       false,
  _poll:      null,
  history:    [],
};

function showSc(id) {
  document.querySelectorAll(".sc").forEach(s => s.classList.remove("on"));
  document.getElementById(id).classList.add("on");
  window.scrollTo(0, 0);
}

(function init() {
  renderPlayerGrid();
  document.getElementById("startBtn").addEventListener("click", goToIntro);
  document.getElementById("goGameBtn").addEventListener("click", joinGame);
  document.getElementById("refreshBtn").addEventListener("click", renderPlayerGrid);
  showSc("scrLogin");
})();

// ── Player grid ───────────────────────────────
async function renderPlayerGrid() {
  const grid = document.getElementById("playerGrid");
  grid.innerHTML = `<div style="text-align:center;padding:12px;color:var(--txt3);font-size:13px;">טוען...</div>`;
  let taken = {};
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

  // Poll for taken slots
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

function goToIntro() {
  if (!S.playerId) return;
  clearInterval(S._poll);
  showSc("scrIntro");
}

async function joinGame() {
  try {
    const res = await apiPost("/api/slots", { playerId: S.playerId, playerName: S.playerName });
    if (!res.ok) { alert("המספר הזה כבר נלקח! בחר/י מספר אחר."); showSc("scrLogin"); renderPlayerGrid(); return; }
  } catch(e) { alert("שגיאת חיבור לשרת"); return; }

  S.totalValue = STARTING_CASH;
  S.alloc      = { nova: 34, prime: 33, fast: 33 };
  S.prevAlloc  = null;
  S.history    = [];
  S.done       = false;

  showSc("scrGame");
  document.getElementById("gTeam").innerHTML =
    `<span>${PLAYER_EMOJIS[S.playerId - 1]}</span> שחקנ/ית ${S.playerId}`;
  document.getElementById("gBal").textContent = fmt(S.totalValue);
  waitForYear();
}

// ── Wait for admin ────────────────────────────
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
      clearInterval(S._poll); S.yearIndex = 0; showAllocScreen();
    } else if (state.openYear >= 1 && state.openYear <= 5) {
      clearInterval(S._poll); S.yearIndex = state.openYear; showAllocScreen();
    }
  }, 2500);
}

// ── Compact company row ───────────────────────
function buildCompanyRow(co, yr, prev) {
  const d = yr[co.id];
  let retHtml = "";
  if (prev) {
    const p   = prev[co.id].price;
    const pct = ((d.price - p) / p * 100).toFixed(1);
    const cls = pct > 0 ? "ret-up" : pct < 0 ? "ret-down" : "ret-flat";
    retHtml = `<span class="ret-badge ${cls}">${pct > 0 ? "+" : ""}${pct}%</span>`;
  }
  return `
    <div class="co-row">
      <div class="co-row-left">
        <span class="co-row-icon" style="background:${co.bg};color:${co.color}">${co.icon}</span>
        <div class="co-row-info">
          <div class="co-row-name">${co.name}</div>
          <div class="co-row-fins">
            <span class="co-fin-item">הכנסות <strong>${d.rev}</strong></span>
            <span class="co-fin-sep">·</span>
            <span class="co-fin-item ${d.profitClass}">רווח <strong>${d.profit}</strong></span>
          </div>
        </div>
      </div>
      <div class="co-row-right">
        <div class="co-row-price">₪${d.price.toLocaleString("he-IL")}</div>
        ${retHtml}
      </div>
    </div>`;
}

// ── Allocation screen ─────────────────────────
function showAllocScreen() {
  const yr   = YEARS[S.yearIndex];
  const prev = S.yearIndex > 0 ? YEARS[S.yearIndex - 1] : null;
  document.getElementById("gBal").textContent = fmt(S.totalValue);

  const practiceBanner = yr.isTrial
    ? `<div class="practice-badge">🎯 שנת ניסיון — לתרגול בלבד</div>` : "";

  const companyRows = COMPANIES.map(co => buildCompanyRow(co, yr, prev)).join("");

  const slidersHtml = COMPANIES.map(co => `
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
        min="0" max="100" step="1" value="${S.alloc[co.id]}" />
    </div>`).join("");

  document.getElementById("gContent").innerHTML = `
    <div class="year-label">${yr.isTrial ? "🎯 שנת ניסיון" : yr.label}</div>
    ${practiceBanner}
    <div class="co-rows-wrap">${companyRows}</div>
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
      ? `⚠️ חרגת! ${sum}% — להוריד ${sum - 100}%`
      : `⚠️ חסר! ${sum}% — להוסיף ${100 - sum}%`;
    btn.disabled = true;
  } else {
    warn.classList.remove("sh2");
    btn.disabled = false;
  }
}

// ── Confirm ───────────────────────────────────
async function confirmAlloc() {
  const sum = COMPANIES.reduce((s, co) => s + (S.alloc[co.id] || 0), 0);
  if (sum !== 100) return;

  const transactions = {};
  COMPANIES.forEach(co => {
    const prevPct = S.prevAlloc ? (S.prevAlloc[co.id] || 0) : (S.alloc[co.id] || 0);
    const delta   = (S.alloc[co.id] || 0) - prevPct;
    transactions[co.id] = (delta / 100) * S.totalValue;
  });

  S.history.push({ yearIndex: S.yearIndex, alloc: { ...S.alloc }, totalValue: S.totalValue, transactions });
  S.prevAlloc = { ...S.alloc };
  S.done      = true;

  try {
    await apiPost("/api/progress", {
      id: S.playerId, name: S.playerName,
      alloc: S.alloc, totalValue: S.totalValue,
      yearIndex: S.yearIndex, done: true,
    });
  } catch(e) {}

  if (YEARS[S.yearIndex].isTrial) {
    showWaitingScreen(true); waitForRealGame();
  } else if (S.yearIndex >= 5) {
    // Year 5: wait for admin to click "end" before showing results
    showWaitingScreen(false); waitForEnd();
  } else {
    showWaitingScreen(false); waitForNextYear();
  }
}

// ── Waiting screen ────────────────────────────
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

  const isYear5 = S.yearIndex >= 5;
  document.getElementById("gContent").innerHTML = `
    <div class="wait-screen">
      <div class="wait-avatar">${PLAYER_EMOJIS[S.playerId - 1]}</div>
      <div class="wait-title">סיימתי! ממתינים... ✓</div>
      <div class="wait-sub">${isTrial ? "המנהלת תפתח את המשחק האמיתי בקרוב" : isYear5 ? "ממתינים לסיום המשחק על ידי המנהלת" : "המנהלת תפתח את השנה הבאה בקרוב"}</div>
      <div class="wait-summary">${summaryHtml}</div>
      <div class="dots-loader" id="waitDots">●</div>
    </div>`;
}

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
      S.totalValue = STARTING_CASH;
      S.alloc      = { nova: 34, prime: 33, fast: 33 };
      S.prevAlloc  = null;
      S.history    = [];
      S.yearIndex  = state.openYear;
      S.done       = false;
      document.getElementById("gBal").textContent = fmt(S.totalValue);
      showAllocScreen();
    }
  }, 2500);
}

function waitForNextYear() {
  const currentYearIdx = S.yearIndex;
  let dots = 0;
  S._poll = setInterval(async () => {
    dots = (dots + 1) % 4;
    const el = document.getElementById("waitDots");
    if (el) el.textContent = "●".repeat(dots + 1);
    let state = { openYear: 0, gamePhase: "" };
    try { state = await apiGet("/api/year"); } catch(e) {}

    // Admin clicked "end"
    if (state.gamePhase === "end") {
      clearInterval(S._poll);
      // Apply final year returns if not yet done
      if (currentYearIdx < 5) {
        S.totalValue = calcNewValue(S.totalValue, S.alloc, currentYearIdx, 5);
        S.yearIndex  = 5;
      }
      showResults();
      return;
    }

    const nextIdx = currentYearIdx + 1;
    if (state.openYear >= nextIdx) {
      clearInterval(S._poll);
      S.totalValue = calcNewValue(S.totalValue, S.alloc, currentYearIdx, nextIdx);
      S.yearIndex  = nextIdx;
      S.done       = false;
      document.getElementById("gBal").textContent = fmt(S.totalValue);
      // If admin already ended the game, go straight to results
      if (S.yearIndex > 5 || state.gamePhase === "end") { showResults(); return; }
      showAllocScreen();
    }
  }, 2500);
}


// ── Poll for game end (year 5) ────────────────
async function waitForEnd() {
  // Check immediately in case admin already ended
  try {
    const state = await apiGet("/api/year");
    if (state.gamePhase === "end") { showResults(); return; }
  } catch(e) {}

  let dots = 0;
  S._poll = setInterval(async () => {
    dots = (dots + 1) % 4;
    const el = document.getElementById("waitDots");
    if (el) el.textContent = "●".repeat(dots + 1);
    let state = { gamePhase: "" };
    try { state = await apiGet("/api/year"); } catch(e) {}
    if (state.gamePhase === "end") {
      clearInterval(S._poll);
      showResults();
    }
  }, 2500);
}

// ── Results ───────────────────────────────────
function showResults() {
  showSc("scrEnd");
  const gain   = S.totalValue - STARTING_CASH;
  const pct    = (gain / STARTING_CASH * 100).toFixed(1);
  const isPos  = gain >= 0;
  const trophy = S.totalValue >= STARTING_CASH * 1.8 ? "🏆" :
                 S.totalValue >= STARTING_CASH * 1.3 ? "🥈" :
                 S.totalValue >= STARTING_CASH        ? "🌱" : "📉";

  document.getElementById("endTeam").textContent   = `${PLAYER_EMOJIS[S.playerId - 1]} שחקנ/ית ${S.playerId}`;
  document.getElementById("endAmount").textContent = fmt(S.totalValue);
  document.getElementById("endTrophy").textContent = trophy;
  const rr = document.getElementById("endReturn");
  rr.textContent = `${isPos ? "+" : ""}${pct}% תשואה כוללת`;
  rr.className   = `fr ${isPos ? "pos" : "neg"}`;

  const coStats = {};
  COMPANIES.forEach(co => { coStats[co.id] = { invested: 0, received: 0 }; });
  S.history.forEach(h => {
    COMPANIES.forEach(co => {
      const tx = h.transactions[co.id] || 0;
      if (tx > 0) coStats[co.id].invested += tx;
      if (tx < 0) coStats[co.id].received += (-tx);
    });
  });
  COMPANIES.forEach(co => {
    coStats[co.id].received += S.totalValue * (S.alloc[co.id] || 0) / 100;
  });

  let det = `<div class="det-t">רווח / הפסד לפי חברה</div>`;
  COMPANIES.forEach(co => {
    const { invested, received } = coStats[co.id];
    if (invested === 0 && received === 0) return;
    const plVal = received - invested;
    const plPct = invested > 0 ? (plVal / invested * 100).toFixed(1) : "—";
    const isUp  = plVal >= 0;
    det += `
      <div class="det-r">
        <span>${co.icon} ${co.name}</span>
        <div style="text-align:left">
          <div style="font-family:'Rubik',sans-serif;font-weight:900;font-size:14px;color:${isUp ? "var(--green)" : "var(--red)"}">
            ${isUp ? "+" : ""}${fmt(plVal)}
          </div>
          <div style="font-size:11px;color:${isUp ? "var(--green)" : "var(--red)"}">
            ${isUp ? "+" : ""}${plPct}%
          </div>
        </div>
      </div>`;
  });
  document.getElementById("endDetails").innerHTML = det;
  document.getElementById("endRestartBtn").addEventListener("click", restart);
}

function restart() {
  clearInterval(S._poll);
  S = {
    playerId: null, playerName: null,
    alloc: { nova: 34, prime: 33, fast: 33 },
    prevAlloc: null, totalValue: STARTING_CASH,
    yearIndex: 0, done: false, history: [], _poll: null,
  };
  document.querySelectorAll(".tb").forEach(b => b.classList.remove("sel"));
  document.getElementById("startBtn").classList.remove("en");
  renderPlayerGrid();
  showSc("scrLogin");
}