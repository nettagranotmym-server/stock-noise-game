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
  const showIntro = oy === 0;
  const showYear  = oy === -1 || (oy >= 1 && oy <= 5);
  const showEnd   = adminState.gamePhase === "end";

  const iv = document.getElementById("adminIntroView");
  const yv = document.getElementById("adminYearView");
  const ev = document.getElementById("adminEndView");

  iv.style.display = showIntro ? "flex" : "none";
  yv.style.display = showYear  ? "flex" : "none";
  ev.style.display = showEnd   ? "flex" : "none";

  // All views fill their parent
  [iv, yv, ev].forEach(el => { el.style.flex = "1"; el.style.flexDirection = "column"; el.style.minHeight = "0"; });

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
      <!-- שורה עליונה -->
      <div class="yr-top-strip">
        <div class="yr-name">${co.icon} ${co.name}</div>
        <div class="yr-strip-right">
          <div class="yr-fins-inline">
            <span class="yr-fin-item">הכנסות <strong>${d.rev}</strong></span>
            <span class="yr-fin-sep">·</span>
            <span class="yr-fin-item ${d.profitClass}">רווח <strong>${d.profit}</strong></span>
          </div>
          <div class="yr-price-inline">
            <span class="yr-price-lbl">מחיר מניה</span>
            <span class="yr-price">₪${co.startPrice.toLocaleString("he-IL")}</span>
          </div>
        </div>
      </div>
      <!-- מרכז: סיפור החברה על רקע כהה -->
      <div class="news-big">
        <div class="news-big-label">על החברה</div>
        <div class="news-big-headline">${co.name}</div>
        <div class="news-big-body">${co.story}</div>
        <div style="display:flex;gap:12px;margin-top:8px;flex-shrink:0">
          <div style="color:rgba(255,255,255,.6);font-size:13px">
            יתרון תחרותי: <span style="color:#f0c060;font-weight:800">${moatLabels[co.moat]}</span>
          </div>
          <div style="color:rgba(255,255,255,.6);font-size:13px">
            יציבות הנהלה: <span style="color:#f0c060;font-weight:800">${mgmtLabels[co.mgmt]}</span>
          </div>
          <div style="color:rgba(255,255,255,.6);font-size:13px">
            חוזים עתידיים: <span style="color:#f0c060;font-weight:800">${debtLabels[co.debt]}</span>
          </div>
        </div>
      </div>
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
        <!-- שורה עליונה: שם + מחיר + נתונים -->
        <div class="yr-top-strip">
          <div class="yr-name">${co.icon} ${co.name}</div>
          <div class="yr-strip-right">
            <div class="yr-fins-inline">
              <span class="yr-fin-item">הכנסות <strong>${d.rev}</strong></span>
              <span class="yr-fin-sep">·</span>
              <span class="yr-fin-item ${d.profitClass}">רווח <strong>${d.profit}</strong></span>
            </div>
            <div class="yr-price-inline">
              <span class="yr-price-lbl">מחיר מניה</span>
              <span class="yr-price">₪${d.price.toLocaleString("he-IL")}</span>
              ${retHtml}
            </div>
          </div>
        </div>
        <!-- ידיעה: מרכז המסך -->
        <div class="news-big">
          <div class="news-big-label">📰 ידיעה מהעיתונות</div>
          <div class="news-big-headline">${d.headline}</div>
          <div class="news-big-body">${d.body}</div>
        </div>
      </div>`;
  }).join("");
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

  // Filter only players who actually joined (have a totalValue)
  const active = players.filter(p => p && p.totalValue > 0);

  // Sort by totalValue descending
  const sorted = active.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));

  // Take top 3
  const top3   = sorted.slice(0, 3);
  const medals = ["🥇","🥈","🥉"];

  if (top3.length === 0) {
    document.getElementById("leaderboard").innerHTML = '<div style="color:var(--txt3);text-align:center;padding:20px">אין שחקנים עדיין</div>';
    return;
  }

  document.getElementById("leaderboard").innerHTML = top3.map((p, i) => {
    const val = p.totalValue || STARTING_CASH;
    const pct = ((val - STARTING_CASH) / STARTING_CASH * 100).toFixed(1);
    const pos = val >= STARTING_CASH;
    return `
      <div class="podium-card r${i+1}">
        <div class="podium-medal">${medals[i]}</div>
        <div class="podium-emoji">${PLAYER_EMOJIS[(p.id - 1) % PLAYER_EMOJIS.length]}</div>
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