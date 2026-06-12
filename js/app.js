/* =============================================
   app.js — אתחול לפי הדף הנוכחי
   ============================================= */

const isAdminPage  = document.getElementById('screen-admin')  !== null;
const isPlayerPage = document.getElementById('screen-player-login') !== null;

if (isAdminPage)  buildAdminPlayersGrid();
if (isPlayerPage) { /* index.html — ממתין לבחירת משתמש */ }