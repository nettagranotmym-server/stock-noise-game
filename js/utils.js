/* =============================================
   utils.js — פונקציות עזר משותפות
   ============================================= */

/** פרמוט מספר לשקלים */
function fmt(n) {
  if (Math.abs(n) >= 1_000_000) return '₪' + (n / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(n) >= 1_000)     return '₪' + Math.round(n).toLocaleString('he');
  return '₪' + Math.round(n).toLocaleString('he');
}

/** הצגת מסך לפי id */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/** Toast קצר בתחתית המסך */
function showToast(msg, dur = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  setTimeout(() => t.classList.remove('visible'), dur);
}

/** מחיר מניה לפי חברה ושנה */
function getPriceForCompany(companyId, yearIndex) {
  return YEARS_DATA[yearIndex][companyId].price;
}

/** שווי תיק כולל (מניות + מזומן) */
function getPortfolioValue(pid) {
  const p = players[pid];
  if (!p) return 100_000;
  let val = p.cash;
  for (const cid of ['nova', 'prime', 'fast']) {
    val += (p.holdings[cid] || 0) * getPriceForCompany(cid, currentYearIndex);
  }
  return val;
}

/** יצירת HTML של נקודות דירוג */
function renderDots(filled, total, color) {
  let html = '<div class="rating-dots">';
  for (let i = 0; i < total; i++) {
    const style = i < filled ? `background:${color}` : '';
    html += `<div class="dot${i < filled ? ' filled' : ''}" style="${style}"></div>`;
  }
  html += '</div>';
  return html;
}