// =============================================
// admin.js — Admin screen logic
// =============================================

const ADMIN_PASS = "8114";

let adminState = { openYear: 0, gamePhase: "intro", _poll: null };

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
  document.getElementById("pilotBadge").style.display = oy === -1 ? "inline-block" : "none";
}

function updateButtons() {
  const oy = adminState.openYear;
  const ph = adminState.gamePhase;
  document.getElementById("btnStart").disabled  = oy !== 0;
  document.getElementById("btnNext").disabled   = oy === 0 || oy === 5 || ph === "end";
  document.getElementById("btnEnd").style.display = (oy === 5 && ph !== "end") ? "inline-block" : "none";
  document.getElementById("btnNext").textContent = "שנה הבאה ←";
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
  const yr0 = YEARS[0];

  c.innerHTML = COMPANIES.map(co => {
    const d = yr0[co.id];
    return `
    <div class="co-card ${co.cardClass}">
      <div class="co-name">${co.icon} ${co.name}</div>
      <div class="co-story">${co.story}</div>
      <div class="co-fins">
        <div class="fin-box"><div class="fin-lbl">הכנסות</div><div class="fin-val">${d.rev}</div></div>
        <div class="fin-box"><div class="fin-lbl">רווח</div><div class="fin-val ${d.profitClass}">${d.profit}</div></div>
      </div>
      <div class="co-stats">
        <div class="co-stat"><span class="co-stat-label">יתרון תחרותי</span>${dots(co.moat,3,"var(--primary)")}<span style="font-size:12px;color:var(--txt3);margin-right:6px">${moatLabels[co.moat]}</span></div>
        <div class="co-stat"><span class="co-stat-label">יציבות הנהלה</span>${dots(co.mgmt,3,"var(--green)")}<span style="font-size:12px;color:var(--txt3);margin-right:6px">${mgmtLabels[co.mgmt]}</span></div>
        <div class="co-stat"><span class="co-stat-label">חוזים עתידיים</span>${dots(co.debt,3,"var(--gold)")}<span style="font-size:12px;color:var(--txt3);margin-right:6px">${debtLabels[co.debt]}</span></div>
      </div>
      <div class="co-price">מחיר מניה: ₪${co.startPrice.toLocaleString("he-IL")}</div>
    </div>`}).join("");
}

function dots(filled, total, color) {
  let h = '<div class="rating-dots">';
  for (let i = 0; i < total; i++)
    h += `<div class="dot${i < filled ? " filled" : ""}" style="${i < filled ? "background:"+color : ""}"></div>`;
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
      <div class="yr-card">
        <div class="yr-header">
          <div class="yr-name">${co.icon} ${co.name}</div>
          <div class="yr-price-block">
            <div class="yr-price-lbl">מחיר מניה</div>
            <div class="yr-price">₪${d.price.toLocaleString("he-IL")}</div>
            ${retHtml}
          </div>
        </div>
        <div>
          <div class="news-label">ידיעה מהעיתונות</div>
          <div class="news-bar">📰 ${d.news}</div>
        </div>
        <div class="co-fins">
          <div class="fin-box"><div class="fin-lbl">הכנסות</div><div class="fin-val">${d.rev}</div></div>
          <div class="fin-box"><div class="fin-lbl">רווח</div><div class="fin-val ${d.profitClass}">${d.profit}</div></div>
        </div>
      </div>`}).join("");
}

// ── Players ───────────────────────────────────
async function refreshPlayers() {
  let players = [];
  try { players = await apiGet("/api/players"); } catch(e) {}

  for (let i = 1; i <= MAX_PLAYERS; i++) {
    const tile = document.getElementById(`ptile-${i}`);
    if (!tile) continue;
    const p = players.find(x => x.id === i);
    if (!p) { tile.className = "ptile empty"; tile.querySelector(".pt-emoji").textContent = "○"; tile.querySelector(".pt-val").textContent = ""; continue; }
    tile.className = `ptile ${p.done ? "waiting" : "active"}`;
    tile.querySelector(".pt-emoji").textContent = PLAYER_EMOJIS[i - 1];
    tile.querySelector(".pt-val").textContent   = fmt(p.totalValue || STARTING_CASH);
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
  if (oy === -1)               { nextYear = 1; phase = "game"; }
  else if (oy >= 1 && oy <= 4) { nextYear = oy + 1; phase = "game"; }
  else return;

  await apiPost(`/api/year?pass=${ADMIN_PASS}`, { year: nextYear, phase });
  adminState.openYear = nextYear; adminState.gamePhase = phase;
  updateYearBadge(); updateButtons(); refreshAdminView();
  await refreshPlayers();
}

async function showEndView() {
  await apiPost(`/api/year?pass=${ADMIN_PASS}`, { year: 5, phase: "end" });
  adminState.gamePhase = "end";
  document.getElementById("adminYearView").style.display = "none";
  document.getElementById("adminEndView").style.display  = "block";
  document.getElementById("yearBadge").textContent       = "סיום המשחק 🏁";
  document.getElementById("btnNext").disabled            = true;
  document.getElementById("btnEnd").style.display        = "none";
  await buildLeaderboard();
}

async function buildLeaderboard() {
  let players = [];
  try { players = await apiGet("/api/players"); } catch(e) {}
  const sorted = players.sort((a,b) => (b.totalValue||0) - (a.totalValue||0));
  const top3   = sorted.slice(0, 3);
  const medals = ["🥇","🥈","🥉"];

  document.getElementById("leaderboard").innerHTML = top3.map((p, i) => {
    const val = p.totalValue || STARTING_CASH;
    const pct = ((val - STARTING_CASH) / STARTING_CASH * 100).toFixed(1);
    const pos = val >= STARTING_CASH;
    return `
      <div class="podium-card r${i+1}">
        <div class="podium-medal">${medals[i]}</div>
        <div class="podium-emoji">${PLAYER_EMOJIS[p.id - 1]}</div>
        <div class="podium-name">שחקנ/ית ${p.id}</div>
        <div class="podium-val">${fmt(val)}</div>
        <div class="podium-pct ${pos ? "pos" : "neg"}">${pos ? "+" : ""}${pct}%</div>
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