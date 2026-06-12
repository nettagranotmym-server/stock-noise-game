/* =============================================
   modal.js — מודל קנייה / מכירה
   ============================================= */

let modalState = {
  coId:   null,
  mode:   null,   // 'buy' | 'sell'
  qty:    1,
  maxQty: 0,
};

/* ─────────────────────────────────────────────
   פתיחת מודל
   ───────────────────────────────────────────── */
function openModal(coId, mode) {
  const p    = players[currentPlayer.id];
  const data = YEARS_DATA[currentYearIndex][coId];
  const co   = COMPANIES.find(c => c.id === coId);

  modalState = { coId, mode, qty: 1, maxQty: 0 };

  /* כותרות */
  document.getElementById('modalTitle').textContent =
    mode === 'buy' ? `קנייה – ${co.name}` : `מכירה – ${co.name}`;
  document.getElementById('modalSubtitle').textContent =
    mode === 'buy' ? 'כמה מניות ברצונך לקנות?' : 'כמה מניות ברצונך למכור?';
  document.getElementById('modalPriceLabel').textContent = `₪${data.price}`;

  /* מקסימום */
  const maxQty = mode === 'buy'
    ? Math.floor(p.cash / data.price)
    : (p.holdings[coId] || 0);
  modalState.maxQty = maxQty;

  /* זמינות */
  document.getElementById('modalAvailLabel').textContent =
    mode === 'buy'
      ? `מזומן זמין: ${fmt(p.cash)} | מקסימום: ${maxQty} מניות`
      : `בידך: ${p.holdings[coId] || 0} מניות`;

  /* תווית עלות */
  document.getElementById('modalCostLabel').textContent =
    mode === 'buy' ? 'עלות כוללת' : 'תקבולים';

  /* כפתור אישור */
  const confirmBtn = document.getElementById('modalConfirmBtn');
  confirmBtn.className = 'modal-confirm ' + mode;
  confirmBtn.textContent = mode === 'buy' ? 'קנה ✓' : 'מכור ✓';

  updateModalQty(1);
  document.getElementById('tradeModal').classList.add('visible');
}

/* ─────────────────────────────────────────────
   שינוי כמות
   ───────────────────────────────────────────── */
function changeModalQty(delta) {
  const newQty = Math.max(1, Math.min(modalState.maxQty, (modalState.qty || 1) + delta));
  updateModalQty(newQty);
}

function updateModalQty(q) {
  if (modalState.maxQty === 0) q = 0;
  modalState.qty = q;

  document.getElementById('modalQtyNum').textContent = q;

  const price = YEARS_DATA[currentYearIndex][modalState.coId].price;
  document.getElementById('modalCostValue').textContent = fmt(q * price);
  document.getElementById('modalConfirmBtn').disabled   = (q === 0);
}

/* ─────────────────────────────────────────────
   סגירה
   ───────────────────────────────────────────── */
function closeModal() {
  document.getElementById('tradeModal').classList.remove('visible');
}

/* ─────────────────────────────────────────────
   אישור עסקה
   ───────────────────────────────────────────── */
function confirmTrade() {
  const p     = players[currentPlayer.id];
  const { coId, mode, qty } = modalState;
  const price = YEARS_DATA[currentYearIndex][coId].price;
  const total = qty * price;
  const co    = COMPANIES.find(c => c.id === coId);

  if (mode === 'buy') {
    if (total > p.cash) { showToast('אין מספיק מזומן!'); return; }
    p.cash             -= total;
    p.holdings[coId]    = (p.holdings[coId] || 0) + qty;
    showToast(`קנית ${qty} מניות ${co.name} ✓`);
  } else {
    if (qty > (p.holdings[coId] || 0)) { showToast('אין מספיק מניות!'); return; }
    p.cash             += total;
    p.holdings[coId]    = (p.holdings[coId] || 0) - qty;
    showToast(`מכרת ${qty} מניות ${co.name} ✓`);
  }

  closeModal();
  refreshPlayerCard(coId);
  syncPushPlayerUpdate();
}