// =============================================
// admin.js — Admin screen logic
// =============================================

const ADMIN_PASS = "8114";

let adminState = {
  openYear:  0,
  gamePhase: "intro",
  _poll:     null,
};

(async function initAdmin() {
  bindButtons();
  await refreshAll();
  adminState._poll = setInterval(refreshPlayers, 5000);
})();

function bindButtons() {
  document.getElementById("btnStart").addEventListener("click",   openTrial);
  document.getElementById("btnNext").addEventListener("click",    openNextYear);
  document.getElementById("btnEnd").addEventListener("click",     showEndView);
  document.getElementById("btnReset").addEventListener("click",   resetGame);
  document.getElementById("btnRefresh").addEventListener("click", refreshAll);
}

async function refreshAll() {
  await refreshYearState();
  refreshAdminView();
  await refreshPlayers();
}

async function refreshYearState() {
  try {
    const s = await apiGet("/api/year");
    adminState.openYear  = s.openYear  ?? 0;
    adminState.gamePhase = s.gamePhase ?? "intro";
  } catch(e) {}
  updateYearBadge();
  updateButtons();
}

function updateYearBadge() {
  const oy = adminState.openYear;
  let label = "שלב מבוא";
  if (oy === -1)               label = "שנת ניסיון";
  else if (oy >= 1 && oy <= 5) label = YEARS[oy].label;
  else if (adminState.gamePhase === "end") label = "סיום המשחק 🏁";
  document.getElementById("yearBadge").textContent = label;
  const pilot = document.getElementById("pilotBadge");
  pilot.style.display = oy === -1 ? "inline-block" : "none";
}

function updateButtons() {
  const oy = adminState.openYear;
  const ph = adminState.gamePhase;
  document.getElementById("btnStart").disabled  = oy !== 0;
  document.getElementById("btnNext").disabled   = oy === 0 || ph === "end";
  document.getElementById("btnEnd").style.display = oy === 5 ? "inline-block" : "none";
  document.getElementById("btnNext").textContent = oy === 5 ? "סיום ←" : "שנה הבאה ←";
}

function refreshAdminView() {
  const oy = adminState.openYear;
  document.getElementById("adminIntroView").style.display = oy === 0 ? "block" : "none";
  document.getElementById("adminYearView").style.display  = (oy === -1 || (oy >= 1 && oy <= 5)) ? "block" : "none";
  document.getElementById("adminEndView").style.display   = adminState.gamePhase === "end" ? "block" : "none";

  if (oy === 0)                buildIntroCards();
  if (oy === -1)               buildYearCards(0);
  if (oy >= 1 && oy <= 5)      buildYearCards(oy);
}

// ── Intro cards ───────────────────────────────
function buildIntroCards() {
  const c = document.getElementById("introCards");
  const moatLabels = ["","בינוני","טוב","גבוה מאוד"];
  const mgmtLabels = ["","בינונית","טובה","גבוהה"];
  const debtLabels = ["","בינוני","טוב","מצוין"];
  const yr0 = YEARS[0]; // trial year data for initial financials

  c.innerHTML = COMPANIES.map(co => {
    const d = yr0[co.id];
    return `
    <div class="co-card ${co.cardClass}">
      <div class="co-name">${co.icon} ${co.name}</div>
      <div class="co-story">${co.story}</div>
      <div class="co-fins-intro">
        <div class="fin-box"><div class="fin-lbl">הכנסות</div><div class="fin-val">${d.rev}</div></div>
        <div class="fin-box"><div class="fin-lbl">רווח</div><div class="fin-val ${d.profitClass}">${d.profit}</div></div>
      </div>
      <div class="co-stats" style="margin-top:10px">
        <div class="co-stat">
          <span class="co-stat-label">יתרון תחרותי</span>
          ${dots(co.moat, 3, "var(--primary)")}
          <span style="font-size:11px;color:var(--txt3)">${moatLabels[co.moat]}</span>
        </div>
        <div class="co-stat">
          <span class="co-stat-label">יציבות הנהלה</span>
          ${dots(co.mgmt, 3, "var(--green)")}
          <span style="font-size:11px;color:var(--txt3)">${mgmtLabels[co.mgmt]}</span>
        </div>
        <div class="co-stat">
          <span class="co-stat-label">חוזים עתידיים</span>
          ${dots(co.debt, 3, "var(--gold)")}
          <span style="font-size:11px;color:var(--txt3)">${debtLabels[co.debt]}</span>
        </div>
      </div>
      <div class="co-price">מחיר מניה: ₪${co.startPrice.toLocaleString("he-IL")}</div>
    </div>`}).join("");
}

function dots(filled, total, color) {
  let h = '<div class="rating-dots">';
  for (let i = 0; i < total; i++)
    h += `<div class="dot${i < filled ? " filled" : ""}" style="${i < filled ? "background:" + color : ""}"></div>`;
  return h + "</div>";
}

// ── Year cards ────────────────────────────────
function buildYearCards(yi) {
  const container = document.getElementById("yearCards");
  const yr   = YEARS[yi];
  const prev = yi > 0 ? YEARS[yi - 1] : null;

  container.innerHTML = COMPANIES.map(co => {
    const d = yr[co.id];
    let retHtml = "";
    if (prev) {
      const p   = prev[co.id].price;
      const pct = ((d.price - p) / p * 100).toFixed(1);
      const cls = pct > 0 ? "ret-up" : pct < 0 ? "ret-down" : "ret-flat";
      retHtml = `<span class="ret-badge ${cls}">${pct > 0 ? "+" : ""}${pct}%</span>`;
    }
    return `
      <div class="admin-co-block">
        <div class="co-row" style="border-radius:10px 10px 0 0;border-bottom:none">
          <div class="co-row-left">
            <span class="co-row-icon" style="background:${co.bg};color:${co.color};width:36px;height:36px;font-size:18px">${co.icon}</span>
            <div class="co-row-info">
              <div class="co-row-name" style="font-size:16px">${co.name}</div>
              <div class="co-row-fins">
                <span class="co-fin-item">הכנסות <strong>${d.rev}</strong></span>
                <span class="co-fin-sep">·</span>
                <span class="co-fin-item ${d.profitClass}">רווח <strong>${d.profit}</strong></span>
              </div>
            </div>
          </div>
          <div class="co-row-right">
            <div class="co-row-price">&#x20AA;${d.price.toLocaleString("he-IL")}</div>
            ${retHtml}
          </div>
        </div>
        <div class="admin-news-row">
          <span class="news-tag">ידיעה מהעיתונות</span>
          📰 ${d.news}
        </div>
      </div>`;
  }).join("");
}

// ── Players grid ──────────────────────────────
async function refreshPlayers() {
  let players = [];
  try { players = await apiGet("/api/players"); } catch(e) {}

  for (let i = 1; i <= MAX_PLAYERS; i++) {
    const tile = document.getElementById(`ptile-${i}`);
    if (!tile) continue;
    const p = players.find(x => x.id === i);
    if (!p) {
      tile.className = "p-tile empty";
      tile.querySelector(".p-emoji").textContent = "○";
      tile.querySelector(".p-val").textContent   = "";
      continue;
    }
    tile.className = `p-tile ${p.done ? "waiting" : "active"}`;
    tile.querySelector(".p-emoji").textContent = PLAYER_EMOJIS[i - 1];
    tile.querySelector(".p-val").textContent   = fmt(p.totalValue || STARTING_CASH);
  }
}

// ── Controls ──────────────────────────────────
async function openTrial() {
  await apiPost(`/api/year?pass=${ADMIN_PASS}`, { year: -1, phase: "trial" });
  adminState.openYear = -1; adminState.gamePhase = "trial";
  updateYearBadge(); updateButtons(); refreshAdminView();
}

async function openNextYear() {
  const oy = adminState.openYear;
  let nextYear, phase;
  if (oy === -1)          { nextYear = 1; phase = "game"; }
  else if (oy >= 1 && oy < 5) { nextYear = oy + 1; phase = "game"; }
  else if (oy === 5)      { showEndView(); return; }
  else return;

  await apiPost(`/api/year?pass=${ADMIN_PASS}`, { year: nextYear, phase });
  adminState.openYear = nextYear; adminState.gamePhase = phase;
  updateYearBadge(); updateButtons(); refreshAdminView();
  await refreshPlayers();
}

async function showEndView() {
  await apiPost(`/api/year?pass=${ADMIN_PASS}`, { year: 5, phase: "end" });
  adminState.gamePhase = "end";
  document.getElementById("adminIntroView").style.display = "none";
  document.getElementById("adminYearView").style.display  = "none";
  document.getElementById("adminEndView").style.display   = "block";
  document.getElementById("yearBadge").textContent        = "סיום המשחק 🏁";
  document.getElementById("btnNext").disabled             = true;
  document.getElementById("btnEnd").style.display         = "none";
  await buildLeaderboard();
}

async function buildLeaderboard() {
  let players = [];
  try { players = await apiGet("/api/players"); } catch(e) {}
  const sorted = players.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
  const medals = ["🥇","🥈","🥉"];
  document.getElementById("leaderboard").innerHTML = sorted.map((p, i) => {
    const val = p.totalValue || STARTING_CASH;
    const pct = ((val - STARTING_CASH) / STARTING_CASH * 100).toFixed(1);
    const pos = val >= STARTING_CASH;
    return `
      <div class="lb-card ${i < 3 ? "r" + (i + 1) : ""}">
        <div class="lb-rank">${medals[i] || "#" + (i + 1)}</div>
        <div class="lb-emoji">${PLAYER_EMOJIS[p.id - 1]}</div>
        <div class="lb-name">שחקנ/ית ${p.id}</div>
        <div class="lb-value">${fmt(val)}</div>
        <div class="lb-pct ${pos ? "pos" : "neg"}">${pos ? "+" : ""}${pct}%</div>
      </div>`;
  }).join("");
}

async function resetGame() {
  if (!confirm("לאפס את כל המשחק?")) return;
  try {
    await apiDelete(`/api/reset?pass=${ADMIN_PASS}`);
    adminState = { openYear: 0, gamePhase: "intro", _poll: adminState._poll };
    updateYearBadge(); updateButtons(); refreshAdminView(); await refreshPlayers();
  } catch(e) { alert("שגיאה באיפוס"); }
}