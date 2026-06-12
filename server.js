const express = require("express");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || "8114";

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── In-memory state ──────────────────────────
let openYear   = 0;       // 0=nothing, -1=trial, 1-5=real years
let takenSlots = {};      // { [playerId]: playerName }
let progress   = {};      // { [playerId]: { id, name, alloc, totalValue, done } }
let gamePhase  = "intro"; // intro | trial | game | end

// ── Health ───────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", openYear, gamePhase });
});

// ── Year control (admin) ─────────────────────
app.get("/api/year", (req, res) => {
  res.json({ openYear, gamePhase });
});

app.post("/api/year", (req, res) => {
  if (req.query.pass !== ADMIN_PASS)
    return res.status(401).json({ error: "Unauthorized" });
  const { year, phase } = req.body;
  if (typeof year === "number") openYear = year;
  if (phase) gamePhase = phase;
  // Mark all players as not done when year advances
  Object.values(progress).forEach(p => { p.done = false; });
  res.json({ ok: true, openYear, gamePhase });
});

// ── Player slots ─────────────────────────────
app.get("/api/slots", (req, res) => {
  res.json(takenSlots);
});

app.post("/api/slots", (req, res) => {
  const { playerId, playerName } = req.body;
  if (!playerId) return res.status(400).json({ error: "Invalid playerId" });
  if (takenSlots[playerId]) return res.status(409).json({ error: "Slot taken" });
  takenSlots[playerId] = playerName || `שחקנ/ית ${playerId}`;
  // Init player progress
  progress[playerId] = {
    id:         playerId,
    name:       takenSlots[playerId],
    alloc:      { nova: 34, prime: 33, fast: 33 },
    totalValue: 10000,
    done:       false,
  };
  res.json({ ok: true });
});

// ── Player progress ───────────────────────────
app.get("/api/progress", (req, res) => {
  if (req.query.pass !== ADMIN_PASS)
    return res.status(401).json({ error: "Unauthorized" });
  res.json(Object.values(progress));
});

app.post("/api/progress", (req, res) => {
  const p = req.body;
  if (!p || !p.id) return res.status(400).json({ error: "Invalid" });
  progress[p.id] = { ...progress[p.id], ...p };
  res.json({ ok: true });
});

// ── Admin: all players summary (no password needed for live display) ──
app.get("/api/players", (req, res) => {
  res.json(Object.values(progress));
});

// ── Reset ─────────────────────────────────────
app.delete("/api/reset", (req, res) => {
  if (req.query.pass !== ADMIN_PASS)
    return res.status(401).json({ error: "Unauthorized" });
  openYear   = 0;
  takenSlots = {};
  progress   = {};
  gamePhase  = "intro";
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Stock game server on port ${PORT}`));