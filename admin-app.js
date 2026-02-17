// =============================================
// CONFIG
// =============================================
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbztRaubL2hd-Z9yE2M-_Pc_BBn9u5p0xOalAZyMm13uc2wNN1WMZ2gZKYos87otUCN-gw/exec';

// =============================================
// SESSION — in-memory only (same rationale as shop)
// =============================================
let _token = null;
let _sessionExpiry = 0;

function hasSession() {
  if (!_token || Date.now() > _sessionExpiry) { _token = null; return false; }
  return true;
}

function setSession(token) {
  _token = token;
  _sessionExpiry = Date.now() + 90 * 60 * 1000;
}

// =============================================
// XSS — escape all untrusted output
// =============================================
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function td(val) {
  const cell = document.createElement('td');
  cell.textContent = String(val ?? '');
  return cell;
}

// =============================================
// LOGIN
// =============================================
async function doAdminLogin() {
  const pass = document.getElementById('adminPass').value;
  const btn  = document.getElementById('btnLogin');
  const err  = document.getElementById('loginErr');

  err.textContent = '';
  if (!pass) { err.textContent = 'Passwort eingeben'; return; }

  btn.disabled    = true;
  btn.textContent = '...';

  try {
    const r = await api({ action: 'adminLogin', password: pass });
    if (r.success) {
      setSession(r.token);
      document.getElementById('adminPass').value = '';
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('dashboard').style.display   = 'block';
      loadOrders();
    } else {
      // Same message regardless of reason — no info leak
      err.textContent = 'Ungültige Zugangsdaten.';
      document.getElementById('adminPass').value = '';
    }
  } catch (e) {
    err.textContent = 'Verbindungsfehler. Bitte erneut versuchen.';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Einloggen';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('adminPass')
    .addEventListener('keydown', e => { if (e.key === 'Enter') doAdminLogin(); });
});

async function doLogout() {
  if (_token) {
    try { await api({ action: 'logout', token: _token }); } catch (e) {}
  }
  _token = null;
  document.getElementById('dashboard').style.display   = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}

// =============================================
// TABS
// =============================================
function switchTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.getElementById('tab' + name.charAt(0).toUpperCase() + name.slice(1))
          .classList.add('active');
  btn.classList.add('active');

  const loaders = { orders: loadOrders, vouchers: loadVouchers, bars: loadBars, stats: loadStats };
  if (loaders[name]) loaders[name]();
}

// =============================================
// ORDERS
// =============================================
async function loadOrders() {
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'getOrders', token: _token });
    if (!r.success) { showToast(r.error, true); return; }
    renderOrders(r.orders);
  } catch (e) { showToast('Ladefehler', true); }
}

function renderOrders(orders) {
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = '';

  if (!orders.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 8; td.className = 'no-data'; td.textContent = 'Keine Bestellungen';
    tr.appendChild(td); tbody.appendChild(tr);
    return;
  }

  orders.forEach(o => {
    const tr = document.createElement('tr');
    if (o.refund_status === 'requested') tr.classList.add('refund-row');

    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + (o.status === 'paid' ? 'b-paid' : 'b-pending');
    statusBadge.textContent = o.status === 'paid' ? 'Bezahlt' : 'Ausstehend';

    const statusTd = document.createElement('td');
    statusTd.appendChild(statusBadge);

    const refundTd = document.createElement('td');
    if (o.refund_status === 'requested') {
      refundTd.textContent = '⚠️ Angefordert';
      refundTd.style.color = '#FFC107';
    } else if (o.refund_status === 'completed') {
      refundTd.textContent = '↩️ Erstattet';
      refundTd.style.color = '#4CAF50';
    } else {
      refundTd.textContent = '–';
    }

    const actionTd = document.createElement('td');
    if (o.status === 'pending') {
      const btn = document.createElement('button');
      btn.className   = 'btn-sm btn-green';
      btn.textContent = '✓ Bezahlt';
      btn.addEventListener('click', () => markPaid(o.id));
      actionTd.appendChild(btn);
    }
    if (o.refund_status === 'requested') {
      const btn = document.createElement('button');
      btn.className   = 'btn-sm btn-red';
      btn.style.marginLeft = '6px';
      btn.textContent = '↩️ Erstatten';
      btn.addEventListener('click', () => processRefund(o.id));
      actionTd.appendChild(btn);
    }

    tr.append(
      td(new Date(o.created_at).toLocaleString('de-CH')),
      td(o.deal_title), td(o.bar_name), td(o.buyer_name),
      td(Number(o.price).toFixed(2) + ' CHF'),
      statusTd, refundTd, actionTd
    );
    tbody.appendChild(tr);
  });
}

async function markPaid(orderId) {
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'markOrderPaid', token: _token, order_id: orderId });
    if (r.success) { showToast('✅ Als bezahlt markiert'); loadOrders(); }
    else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

async function processRefund(orderId) {
  if (!confirm('Rückerstattung als durchgeführt markieren?')) return;
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'processRefund', token: _token, order_id: orderId });
    if (r.success) { showToast('✅ Rückerstattung abgeschlossen'); loadOrders(); }
    else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// =============================================
// VOUCHERS
// =============================================
async function loadVouchers() {
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'getVouchers', token: _token });
    if (!r.success) { showToast(r.error, true); return; }
    renderVouchers(r.vouchers);
  } catch (e) { showToast('Ladefehler', true); }
}

function renderVouchers(vouchers) {
  const tbody = document.getElementById('vouchersBody');
  tbody.innerHTML = '';

  if (!vouchers.length) {
    const tr = document.createElement('tr');
    const tdEl = document.createElement('td');
    tdEl.colSpan = 9; tdEl.className = 'no-data'; tdEl.textContent = 'Keine Gutscheine';
    tr.appendChild(tdEl); tbody.appendChild(tr);
    return;
  }

  vouchers.forEach(v => {
    const tr = document.createElement('tr');

    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + (v.status === 'active' ? 'b-active' : 'b-inactive');
    statusBadge.textContent = v.status;
    const statusTd = document.createElement('td');
    statusTd.appendChild(statusBadge);

    const actionTd = document.createElement('td');
    if (v.payout_status === 'pending' && v.status === 'redeemed') {
      const btn = document.createElement('button');
      btn.className   = 'btn-sm btn-blue';
      btn.textContent = '✓ Ausgezahlt';
      btn.addEventListener('click', () => markVoucherPaid(v.id));
      actionTd.appendChild(btn);
    }

    tr.append(
      td(v.code), td(v.deal_title), td(v.bar_name), td(v.buyer_name),
      td(Number(v.price_paid).toFixed(2) + ' CHF'),
      td(Number(v.platform_fee).toFixed(2) + ' CHF'),
      td(Number(v.bar_payout).toFixed(2) + ' CHF'),
      statusTd, actionTd
    );
    tbody.appendChild(tr);
  });
}

async function markVoucherPaid(voucherId) {
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'markVoucherPaid', token: _token, voucher_id: voucherId });
    if (r.success) { showToast('✅ Auszahlung markiert'); loadVouchers(); }
    else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// =============================================
// BARS
// =============================================
async function loadBars() {
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'getBars', token: _token });
    if (!r.success) { showToast(r.error, true); return; }
    renderBars(r.bars);
  } catch (e) { showToast('Ladefehler', true); }
}

function renderBars(bars) {
  const tbody = document.getElementById('barsBody');
  tbody.innerHTML = '';

  if (!bars.length) {
    const tr = document.createElement('tr');
    const tdEl = document.createElement('td');
    tdEl.colSpan = 6; tdEl.className = 'no-data'; tdEl.textContent = 'Keine Bars';
    tr.appendChild(tdEl); tbody.appendChild(tr);
    return;
  }

  bars.forEach(b => {
    const tr = document.createElement('tr');

    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + (b.status === 'active' ? 'b-paid' : 'b-pending');
    statusBadge.textContent = b.status;
    const statusTd = document.createElement('td');
    statusTd.appendChild(statusBadge);

    const actionTd = document.createElement('td');
    if (b.status !== 'active') {
      const btnA = document.createElement('button');
      btnA.className   = 'btn-sm btn-green';
      btnA.textContent = 'Freischalten';
      btnA.addEventListener('click', () => updateBarStatus(b.id, 'active'));
      actionTd.appendChild(btnA);
    } else {
      const btnD = document.createElement('button');
      btnD.className   = 'btn-sm btn-red';
      btnD.textContent = 'Sperren';
      btnD.addEventListener('click', () => updateBarStatus(b.id, 'inactive'));
      actionTd.appendChild(btnD);
    }
    const btnDel = document.createElement('button');
    btnDel.className   = 'btn-sm btn-red';
    btnDel.style.marginLeft = '6px';
    btnDel.textContent = '🗑️';
    btnDel.addEventListener('click', () => deleteBar(b.id, b.name));
    actionTd.appendChild(btnDel);

    tr.append(td(b.name), td(b.city), td(b.email), statusTd, td(b.deals_count || 0), actionTd);
    tbody.appendChild(tr);
  });
}

async function updateBarStatus(barId, status) {
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'updateBarStatus', token: _token, bar_id: barId, status });
    if (r.success) { showToast('✅ Status geändert'); loadBars(); }
    else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

async function deleteBar(barId, barName) {
  if (!confirm('Bar "' + barName + '" wirklich löschen?')) return;
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'deleteBar', token: _token, bar_id: barId });
    if (r.success) { showToast('✅ Bar gelöscht'); loadBars(); }
    else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// =============================================
// STATS
// =============================================
async function loadStats() {
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'getStats', token: _token });
    if (!r.success) { showToast(r.error, true); return; }
    renderStats(r);
  } catch (e) { showToast('Ladefehler', true); }
}

function renderStats(s) {
  const grid = document.getElementById('statsGrid');
  grid.innerHTML = '';
  const items = [
    ['Bestellungen', s.total_orders],
    ['Bezahlt', s.paid_orders],
    ['Umsatz', Number(s.total_revenue).toFixed(2) + ' CHF'],
    ['Provision', Number(s.total_fees).toFixed(2) + ' CHF'],
    ['Ausstehend', Number(s.pending_payout).toFixed(2) + ' CHF'],
  ];
  items.forEach(([label, val]) => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    const lEl = document.createElement('div');
    lEl.className = 'stat-label';
    lEl.textContent = label;
    const vEl = document.createElement('div');
    vEl.className = 'stat-value';
    vEl.textContent = String(val);
    card.append(lEl, vEl);
    grid.appendChild(card);
  });
}

// =============================================
// API HELPER
// =============================================
async function api(body) {
  const r = await fetch(BACKEND_URL, { method: 'POST', body: JSON.stringify(body) });
  return r.json();
}

// =============================================
// TOAST
// =============================================
let _toastTimer = null;
function showToast(msg, isError) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = 'toast show ' + (isError ? 'toast-err' : 'toast-ok');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);

// =============================================
// BIND ALL INLINE EVENT HANDLERS
// Required for CSP: script-src 'self'
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  const btnLogin = document.getElementById('btnLogin');
  if (btnLogin) btnLogin.addEventListener('click', doAdminLogin);

  document.querySelectorAll('.btn-logout').forEach(b => b.addEventListener('click', doLogout));

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', function() { switchTab(this.dataset.tab, this); });
  });
});
