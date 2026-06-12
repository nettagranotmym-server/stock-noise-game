/* =============================================
   state.js — כל ה-state המשתנה של המשחק
   ============================================= */

/* ── Game phase ──────────────────────────────
   'intro'  → לפני שהADMIN מתחיל
   'trial'  → שנת ניסיון
   'game'   → שנות המשחק האמיתי (1–5)
   'end'    → המשחק הסתיים
   ─────────────────────────────────────────── */
let gamePhase = 'intro';

/* ── Year index ──────────────────────────────
   0 = trial
   1–5 = real game years
   ─────────────────────────────────────────── */
let currentYearIndex = 0;

/* ── Trial flag ── */
let isTrial = true;

/* ── Players map: { [id]: PlayerObject } ─────
   PlayerObject = {
     id:       number,
     avatar:   string (emoji),
     cash:     number,
     holdings: { nova: number, prime: number, fast: number },
     done:     boolean,   // finished trading this year
     history:  [],        // reserved for future analytics
   }
   ─────────────────────────────────────────── */
let players = {};

/* ── Currently logged-in player (player screen only) ── */
let currentPlayer = null;  // { id, avatar }

/* ── Login selections (player login screen) ── */
let selectedPlayerNum = null;
let selectedAvatar    = null;