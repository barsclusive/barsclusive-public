// =============================================
// CONFIG
// =============================================
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzQv_aEnFWV0TAPKyvBeuiJfQnPynUU7ptfj87x-HXJnUanh6s15V_WIXoBBTIbOp8nCQ/exec';

// =============================================
// i18n
// =============================================
const TRANSLATIONS = {
  de: {
    logout:'Ausloggen', loginBtn:'Einloggen',
    tabOrders:'Bestellungen', tabVouchers:'Gutscheine', tabBars:'Bars',
    tabDeals:'Deals', tabStats:'Statistik',
    activate:'Freischalten', deactivate:'Sperren', delete:'🗑️',
    markPaid:'✓ Bezahlt', markPayout:'✓ Ausgezahlt', refundBtn:'↩️ Erstatten',
    activateDeal:'Aktivieren', deactivateDeal:'Deaktivieren',
    commissionSave:'Speichern',
    noOrders:'Keine Bestellungen', noVouchers:'Keine Gutscheine',
    noBars:'Keine Bars', noDeals:'Keine Deals',
  },
  en: {
    logout:'Logout', loginBtn:'Login',
    tabOrders:'Orders', tabVouchers:'Vouchers', tabBars:'Bars',
    tabDeals:'Deals', tabStats:'Statistics',
    activate:'Activate', deactivate:'Block', delete:'🗑️',
    markPaid:'✓ Paid', markPayout:'✓ Payout done', refundBtn:'↩️ Refund',
    activateDeal:'Activate', deactivateDeal:'Deactivate',
    commissionSave:'Save',
    noOrders:'No orders', noVouchers:'No vouchers',
    noBars:'No bars', noDeals:'No deals',
  }
};
let currentLang = 'de';
function t(key) { return TRANSLATIONS[currentLang][key] || TRANSLATIONS.de[key] || key; }
function setLang(lang) {
  console.log('[Admin] Switching language to:', lang);
  currentLang = lang;
  const btnDE = document.getElementById('langDE');
  const btnEN = document.getElementById('langEN');
  if (btnDE) {
    btnDE.classList.remove('active');
    if (lang === 'de') btnDE.classList.add('active');
  }
  if (btnEN) {
    btnEN.classList.remove('active');
    if (lang === 'en') btnEN.classList.add('active');
  }
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) btnLogout.textContent = t('logout');
  console.log('[Admin] Language switched to:', lang);
}

// =============================================
// SESSION — in-memory only
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
// XSS
// =============================================
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
  btn.disabled = true; btn.textContent = '...';
  try {
    const r = await api({ action: 'adminLogin', password: pass });
    if (r.success) {
      setSession(r.token);
      document.getElementById('adminPass').value = '';
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('dashboard').style.display   = 'block';
      loadOrders();
    } else {
      err.textContent = 'Ungültige Zugangsdaten.';
      document.getElementById('adminPass').value = '';
    }
  } catch (e) { err.textContent = 'Verbindungsfehler. Bitte erneut versuchen.'; }
  finally { btn.disabled = false; btn.textContent = t('loginBtn'); }
}

async function doLogout() {
  if (_token) { try { await api({ action: 'logout', token: _token }); } catch (e) {} }
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
  document.getElementById('tab' + name.charAt(0).toUpperCase() + name.slice(1)).classList.add('active');
  btn.classList.add('active');
  const loaders = { orders: loadOrders, vouchers: loadVouchers, bars: loadBars, deals: loadDeals, stats: loadStats };
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
    tbody.innerHTML = '<tr><td colspan="8" class="no-data">' + t('noOrders') + '</td></tr>'; return;
  }
  orders.forEach(o => {
    const tr = document.createElement('tr');
    if (o.refund_status === 'requested') tr.classList.add('refund-row');

    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + (o.status === 'paid' ? 'b-paid' : 'b-pending');
    statusBadge.textContent = o.status === 'paid' ? 'Bezahlt' : 'Ausstehend';
    const statusTd = document.createElement('td'); statusTd.appendChild(statusBadge);

    const refundTd = document.createElement('td');
    if (o.refund_status === 'requested') {
      refundTd.textContent = '⚠️ Angefordert'; refundTd.style.color = '#FFC107';
    } else if (o.refund_status === 'completed') {
      refundTd.textContent = '↩️ Erstattet'; refundTd.style.color = '#4CAF50';
    } else { refundTd.textContent = '–'; }

    const actionTd = document.createElement('td');
    if (o.status === 'created') {
      const btn = document.createElement('button');
      btn.className = 'btn-sm btn-green'; btn.textContent = t('markPaid');
      btn.addEventListener('click', () => markPaid(o.id));
      actionTd.appendChild(btn);
    }
    if (o.refund_status === 'requested') {
      const btn = document.createElement('button');
      btn.className = 'btn-sm btn-red'; btn.style.marginLeft = '6px';
      btn.textContent = t('refundBtn');
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
    tbody.innerHTML = '<tr><td colspan="8" class="no-data">' + t('noVouchers') + '</td></tr>'; return;
  }
  vouchers.forEach(v => {
    const tr = document.createElement('tr');
    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + (v.status === 'sent' || v.status === 'issued' ? 'b-active' : v.status === 'redeemed' ? 'b-paid' : 'b-inactive');
    statusBadge.textContent = v.status;
    const statusTd = document.createElement('td'); statusTd.appendChild(statusBadge);

    const actionTd = document.createElement('td');
    if (v.payout_status === 'pending' && v.status === 'redeemed') {
      const btn = document.createElement('button');
      btn.className = 'btn-sm btn-blue'; btn.textContent = t('markPayout');
      btn.addEventListener('click', () => markVoucherPaid(v.id));
      actionTd.appendChild(btn);
    }

    tr.append(
      td(v.code), td(v.deal_title), td(v.bar_name),
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
// BARS — with commission rate editing
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
    tbody.innerHTML = '<tr><td colspan="7" class="no-data">' + t('noBars') + '</td></tr>'; return;
  }
  bars.forEach(b => {
    const tr = document.createElement('tr');

    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + (b.status === 'active' ? 'b-paid' : 'b-pending');
    statusBadge.textContent = b.status;
    const statusTd = document.createElement('td'); statusTd.appendChild(statusBadge);

    // Commission input
    const commTd = document.createElement('td');
    const commWrap = document.createElement('div');
    commWrap.style.display = 'flex'; commWrap.style.alignItems = 'center'; commWrap.style.gap = '6px';
    const commInput = document.createElement('input');
    commInput.type = 'number'; commInput.className = 'comm-input';
    commInput.value = b.commission_rate || 10; commInput.min = '0'; commInput.max = '100'; commInput.step = '1';
    commInput.style.width = '60px'; commInput.style.padding = '5px 8px'; commInput.style.background = '#2a2a2a';
    commInput.style.border = '1px solid #3a3a3a'; commInput.style.borderRadius = '6px';
    commInput.style.color = '#fff'; commInput.style.fontSize = '13px';
    const commBtn = document.createElement('button');
    commBtn.className = 'btn-sm btn-blue'; commBtn.textContent = t('commissionSave');
    commBtn.addEventListener('click', () => updateCommission(b.id, commInput.value));
    commWrap.append(commInput, commBtn);
    commTd.appendChild(commWrap);

    const actionTd = document.createElement('td');
    if (b.status !== 'active') {
      const btnA = document.createElement('button');
      btnA.className = 'btn-sm btn-green'; btnA.textContent = t('activate');
      btnA.addEventListener('click', () => updateBarStatus(b.id, 'active'));
      actionTd.appendChild(btnA);
    } else {
      const btnD = document.createElement('button');
      btnD.className = 'btn-sm btn-red'; btnD.textContent = t('deactivate');
      btnD.addEventListener('click', () => updateBarStatus(b.id, 'inactive'));
      actionTd.appendChild(btnD);
    }
    const btnDel = document.createElement('button');
    btnDel.className = 'btn-sm btn-red'; btnDel.style.marginLeft = '6px';
    btnDel.textContent = t('delete');
    btnDel.addEventListener('click', () => deleteBar(b.id, b.name));
    actionTd.appendChild(btnDel);

    tr.append(td(b.name), td(b.city), td(b.email), statusTd, td(b.deals_count || 0), commTd, actionTd);
    tbody.appendChild(tr);
  });
}

async function updateCommission(barId, rate) {
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'updateBarCommission', token: _token, bar_id: barId, commission_rate: rate });
    if (r.success) showToast('✅ Provision gespeichert');
    else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

async function updateBarStatus(barId, status) {
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'updateBarStatus', token: _token, bar_id: barId, status });
    if (r.success) { 
      showToast('✅ Status geändert'); 
      
      // Auto-Email wenn Bar freigeschaltet wird
      if (status === 'active') {
        try {
          await api({ action: 'sendBarActivationEmail', token: _token, bar_id: barId });
          showToast('📧 Freischaltungs-Email versendet');
        } catch (emailErr) {
          console.warn('Email konnte nicht versendet werden:', emailErr);
        }
      }
      
      loadBars(); 
    }
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
// DEALS MANAGEMENT
// =============================================
async function loadDeals() {
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'getAdminDeals', token: _token });
    if (!r.success) { showToast(r.error, true); return; }
    renderDeals(r.deals);
  } catch (e) { showToast('Ladefehler', true); }
}

function renderDeals(deals) {
  const tbody = document.getElementById('dealsBody');
  tbody.innerHTML = '';
  if (!deals.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">' + t('noDeals') + '</td></tr>'; return;
  }
  deals.forEach(d => {
    const tr = document.createElement('tr');
    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + (d.active ? 'b-paid' : 'b-inactive');
    statusBadge.textContent = d.active ? 'Aktiv' : 'Inaktiv';
    const statusTd = document.createElement('td'); statusTd.appendChild(statusBadge);

    const actionTd = document.createElement('td');
    const btnToggle = document.createElement('button');
    btnToggle.className = 'btn-sm ' + (d.active ? 'btn-orange' : 'btn-green');
    btnToggle.textContent = d.active ? t('deactivateDeal') : t('activateDeal');
    btnToggle.addEventListener('click', () => adminToggleDeal(d.id, !d.active));
    actionTd.appendChild(btnToggle);

    tr.append(
      td(d.bar_name), td(d.title),
      td(Number(d.deal_price).toFixed(2) + ' CHF'),
      td(d.sold_count || 0),
      statusTd, actionTd
    );
    tbody.appendChild(tr);
  });
}

async function adminToggleDeal(dealId, active) {
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'updateDealStatus', token: _token, deal_id: dealId, active });
    if (r.success) { showToast(active ? '✅ Aktiviert' : '⏸ Deaktiviert'); loadDeals(); }
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
  [
    ['Bestellungen', s.total_orders],
    ['Bezahlt', s.paid_orders],
    ['Umsatz', Number(s.total_revenue).toFixed(2) + ' CHF'],
    ['Provision', Number(s.total_fees).toFixed(2) + ' CHF'],
    ['Ausstehend', Number(s.pending_payout).toFixed(2) + ' CHF'],
  ].forEach(([label, val]) => {
    const card = document.createElement('div'); card.className = 'stat-card';
    const lEl = document.createElement('div'); lEl.className = 'stat-label'; lEl.textContent = label;
    const vEl = document.createElement('div'); vEl.className = 'stat-value'; vEl.textContent = String(val);
    card.append(lEl, vEl); grid.appendChild(card);
  });
}

// =============================================
// API / TOAST
// =============================================
async function api(body) {
  const r = await fetch(BACKEND_URL, { method: 'POST', body: JSON.stringify(body) });
  return r.json();
}

let _toastTimer = null;
function showToast(msg, isError) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + (isError ? 'toast-err' : 'toast-ok');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  const btnLogin = document.getElementById('btnLogin');
  if (btnLogin) btnLogin.addEventListener('click', doAdminLogin);

  document.getElementById('adminPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') doAdminLogin();
  });

  document.getElementById('btnLogout').addEventListener('click', doLogout);

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', function() { switchTab(this.dataset.tab, this); });
  });

  const langDE = document.getElementById('langDE');
  const langEN = document.getElementById('langEN');
  if (langDE) {
    langDE.addEventListener('click', function() {
      console.log('[Admin] DE clicked');
      setLang('de');
    });
  }
  if (langEN) {
    langEN.addEventListener('click', function() {
      console.log('[Admin] EN clicked');
      setLang('en');
    });
  }
});
