// =============================================
// CONFIG
// =============================================
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbz1zkTHlVpnFgbMlscbjgGHXDRwhoAqYQeasInpWUDzn6dzC2aFC_DEykj_itklCHILRA/exec';

// =============================================
// i18n
// =============================================
const TRANSLATIONS = {
  de: {
    logout:'Ausloggen', loginBtn:'Einloggen',
    tabOrders:'Bestellungen', tabVouchers:'Gutscheine', tabBars:'Bars',
    tabCustomers:'Kund:innen', tabDeals:'Deals', tabStats:'Statistik',
    activate:'Freischalten', deactivate:'Sperren', delete:'🗑️',
    markPaid:'✓ Bezahlt', markPayout:'✓ Ausgezahlt', refundBtn:'↩️ Erstatten',
    activateDeal:'Aktivieren', deactivateDeal:'Deaktivieren',
    commissionSave:'Speichern',
    noOrders:'Keine Bestellungen', noVouchers:'Keine Gutscheine',
    noBars:'Keine Bars', noDeals:'Keine Deals', noCustomers:'Keine Kund:innen',
    searchPlaceholder:'Suchen...',
    sOrders:'Bestellungen', sVouchers:'Gutscheine', sBars:'Bars',
    sRevenue:'Umsatz', sCommission:'Provision', sPending:'Ausstehend',
    sRedeemed:'Eingelöst', sCustomers:'Kund:innen',
  },
  en: {
    logout:'Logout', loginBtn:'Login',
    tabOrders:'Orders', tabVouchers:'Vouchers', tabBars:'Bars',
    tabCustomers:'Customers', tabDeals:'Deals', tabStats:'Statistics',
    activate:'Activate', deactivate:'Block', delete:'🗑️',
    markPaid:'✓ Paid', markPayout:'✓ Payout done', refundBtn:'↩️ Refund',
    activateDeal:'Activate', deactivateDeal:'Deactivate',
    commissionSave:'Save',
    noOrders:'No orders', noVouchers:'No vouchers',
    noBars:'No bars', noDeals:'No deals', noCustomers:'No customers',
    searchPlaceholder:'Search...',
    sOrders:'Orders', sVouchers:'Vouchers', sBars:'Bars',
    sRevenue:'Revenue', sCommission:'Commission', sPending:'Pending',
    sRedeemed:'Redeemed', sCustomers:'Customers',
  },
  it: {
    logout:'Disconnettersi', loginBtn:'Accedere',
    tabOrders:'Ordini', tabVouchers:'Buoni', tabBars:'Bar',
    tabCustomers:'Clienti', tabDeals:'Offerte', tabStats:'Statistiche',
    activate:'Attivare', deactivate:'Bloccare', delete:'🗑️',
    markPaid:'✓ Pagato', markPayout:'✓ Pagamento', refundBtn:'↩️ Rimborso',
    activateDeal:'Attivare', deactivateDeal:'Disattivare',
    commissionSave:'Salvare',
    noOrders:'Nessun ordine', noVouchers:'Nessun buono',
    noBars:'Nessun bar', noDeals:'Nessuna offerta', noCustomers:'Nessun cliente',
    searchPlaceholder:'Cercare...',
    sOrders:'Ordini', sVouchers:'Buoni', sBars:'Bar',
    sRevenue:'Fatturato', sCommission:'Commissione', sPending:'In sospeso',
    sRedeemed:'Riscattato', sCustomers:'Clienti',
  },
  fr: {
    logout:'Déconnexion', loginBtn:'Connexion',
    tabOrders:'Commandes', tabVouchers:'Bons', tabBars:'Bars',
    tabCustomers:'Clients', tabDeals:'Offres', tabStats:'Statistiques',
    activate:'Activer', deactivate:'Bloquer', delete:'🗑️',
    markPaid:'✓ Payé', markPayout:'✓ Versé', refundBtn:'↩️ Rembourser',
    activateDeal:'Activer', deactivateDeal:'Désactiver',
    commissionSave:'Sauvegarder',
    noOrders:'Aucune commande', noVouchers:'Aucun bon',
    noBars:'Aucun bar', noDeals:'Aucune offre', noCustomers:'Aucun client',
    searchPlaceholder:'Rechercher...',
    sOrders:'Commandes', sVouchers:'Bons', sBars:'Bars',
    sRevenue:'Chiffre d\'affaires', sCommission:'Commission', sPending:'En attente',
    sRedeemed:'Échangé', sCustomers:'Clients',
  }
};
let currentLang = 'de';
function t(key) { return TRANSLATIONS[currentLang][key] || TRANSLATIONS.de[key] || key; }
function setLang(lang) {
  console.log('[Admin] Switching language to:', lang);
  currentLang = lang;
  ['DE','EN','IT','FR'].forEach(function(l) {
    var btn = document.getElementById('lang' + l);
    if (btn) {
      btn.classList.remove('active');
      if (lang === l.toLowerCase()) btn.classList.add('active');
    }
  });
  var btnLogout = document.getElementById('btnLogout');
  if (btnLogout) btnLogout.textContent = t('logout');
  // Update tab labels
  document.querySelectorAll('.tab').forEach(function(tab) {
    var key = tab.getAttribute('data-tab');
    var map = {orders:'tabOrders',vouchers:'tabVouchers',bars:'tabBars',customers:'tabCustomers',deals:'tabDeals',stats:'tabStats'};
    var icon = tab.textContent.split(' ')[0]; // preserve emoji
    if (map[key]) tab.textContent = icon + ' ' + t(map[key]);
  });
  // Update search placeholder
  var cs = document.getElementById('customerSearch');
  if (cs) cs.placeholder = t('searchPlaceholder');
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
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
  const loaders = { orders: loadOrders, vouchers: loadVouchers, bars: loadBars, customers: loadCustomers, deals: loadDeals, stats: loadStats };
  if (loaders[name]) loaders[name]();
}

// =============================================
// ORDERS
// =============================================
async function loadOrders() {
  if (!hasSession()) { doLogout(); return; }
  try {
    const [ordersRes, vouchersRes] = await Promise.all([
      api({ action: 'getOrders', token: _token }),
      api({ action: 'getVouchers', token: _token })
    ]);
    if (!ordersRes.success) { showToast(ordersRes.error, true); return; }
    // Build voucher lookup by ID for quick cross-reference
    const voucherMap = {};
    if (vouchersRes.success && vouchersRes.vouchers) {
      vouchersRes.vouchers.forEach(v => { voucherMap[v.id] = v; });
    }
    renderOrders(ordersRes.orders, voucherMap);
  } catch (e) { showToast('Ladefehler', true); }
}

function renderOrders(orders, voucherMap) {
  voucherMap = voucherMap || {};
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = '';
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="no-data">' + t('noOrders') + '</td></tr>'; return;
  }
  // Sort: newest first
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  orders.forEach(o => {
    const tr = document.createElement('tr');
    if (o.refund_status === 'requested') tr.classList.add('refund-row');

    // Payment status (automatic via Stripe)
    const statusBadge = document.createElement('span');
    if (o.status === 'paid') { statusBadge.className = 'badge b-paid'; statusBadge.textContent = '✓ Bezahlt'; }
    else if (o.status === 'pending_payment') { statusBadge.className = 'badge b-pending'; statusBadge.textContent = '⏳ Ausstehend'; }
    else { statusBadge.className = 'badge b-inactive'; statusBadge.textContent = o.status; }
    const statusTd = document.createElement('td'); statusTd.appendChild(statusBadge);

    // Voucher/Gutschein status column
    const voucherTd = document.createElement('td');
    const voucher = o.voucher_id ? voucherMap[o.voucher_id] : null;
    if (voucher) {
      const vBadge = document.createElement('span');
      if (voucher.status === 'redeemed') {
        vBadge.className = 'badge b-paid'; vBadge.textContent = '✓ Eingelöst';
      } else if (voucher.status === 'sent' || voucher.status === 'issued') {
        vBadge.className = 'badge b-active'; vBadge.textContent = '⏳ Offen';
      } else {
        vBadge.className = 'badge b-inactive'; vBadge.textContent = voucher.status;
      }
      voucherTd.appendChild(vBadge);
    } else if (o.status === 'paid') {
      voucherTd.textContent = '–';
    } else {
      voucherTd.textContent = '–';
    }

    // Refund column
    const refundTd = document.createElement('td');
    if (o.refund_status === 'requested') {
      refundTd.textContent = '⚠️ Angefordert'; refundTd.style.color = '#FFC107';
    } else if (o.refund_status === 'completed') {
      refundTd.textContent = '↩️ Erstattet'; refundTd.style.color = '#4CAF50';
    } else { refundTd.textContent = '–'; }

    // Action: only refund button
    const actionTd = document.createElement('td');
    if (o.refund_status === 'requested') {
      const btn = document.createElement('button');
      btn.className = 'btn-sm btn-red';
      btn.textContent = t('refundBtn');
      btn.addEventListener('click', () => processRefund(o.id));
      actionTd.appendChild(btn);
    }

    tr.append(
      td(new Date(o.created_at).toLocaleString('de-CH')),
      td(o.deal_title), td(o.bar_name), td(o.buyer_name), td(o.buyer_email || '-'),
      td(Number(o.price).toFixed(2) + ' CHF'),
      statusTd, voucherTd, refundTd, actionTd
    );
    tbody.appendChild(tr);
  });
}

// markPaid removed — Stripe auto-confirms payments via confirmStripePayment()

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
    if (v.status === 'sent' || v.status === 'issued') {
      const refBtn = document.createElement('button');
      refBtn.className = 'btn-sm btn-red'; refBtn.style.marginLeft = '4px';
      refBtn.textContent = t('refundBtn');
      refBtn.addEventListener('click', () => refundVoucher(v.id, v.code));
      actionTd.appendChild(refBtn);
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

async function refundVoucher(voucherId, code) {
  if (!confirm('Gutschein ' + (code||'') + ' erstatten? Kunde wird per Email benachrichtigt.')) return;
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'refundVoucher', token: _token, voucher_id: voucherId });
    if (r.success) { showToast('Gutschein erstattet'); loadVouchers(); loadOrders(); }
    else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}
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
    tr.style.cursor = 'pointer';
    const statusBadge = document.createElement('span');
    statusBadge.className = 'badge ' + (b.status === 'active' ? 'b-paid' : 'b-pending');
    statusBadge.textContent = b.status;
    const statusTd = document.createElement('td'); statusTd.appendChild(statusBadge);
    const commTd = document.createElement('td');
    const commWrap = document.createElement('div');
    commWrap.style.cssText = 'display:flex;align-items:center;gap:6px';
    const commInput = document.createElement('input');
    commInput.type = 'number'; commInput.className = 'comm-input';
    commInput.value = b.commission_rate || 10; commInput.min = '0'; commInput.max = '100'; commInput.step = '1';
    commInput.style.cssText = 'width:60px;padding:5px 8px;background:#2a2a2a;border:1px solid #3a3a3a;border-radius:6px;color:#fff;font-size:13px';
    commInput.addEventListener('click', e => e.stopPropagation());
    const commBtn = document.createElement('button');
    commBtn.className = 'btn-sm btn-blue'; commBtn.textContent = t('commissionSave');
    commBtn.addEventListener('click', (e) => { e.stopPropagation(); updateCommission(b.id, commInput.value); });
    commWrap.append(commInput, commBtn); commTd.appendChild(commWrap);
    const actionTd = document.createElement('td');
    if (b.status !== 'active') {
      const btnA = document.createElement('button');
      btnA.className = 'btn-sm btn-green'; btnA.textContent = t('activate');
      btnA.addEventListener('click', (e) => { e.stopPropagation(); updateBarStatus(b.id, 'active'); });
      actionTd.appendChild(btnA);
    } else {
      const btnD = document.createElement('button');
      btnD.className = 'btn-sm btn-red'; btnD.textContent = t('deactivate');
      btnD.addEventListener('click', (e) => { e.stopPropagation(); updateBarStatus(b.id, 'inactive'); });
      actionTd.appendChild(btnD);
    }
    const btnDel = document.createElement('button');
    btnDel.className = 'btn-sm btn-red'; btnDel.style.marginLeft = '6px';
    btnDel.textContent = t('delete');
    btnDel.addEventListener('click', (e) => { e.stopPropagation(); deleteBar(b.id, b.name); });
    actionTd.appendChild(btnDel);
    tr.append(td(b.name), td(b.city), td(b.email), statusTd, td(b.deals_count || 0), commTd, actionTd);
    tbody.appendChild(tr);
    // Expandable detail row
    const detailTr = document.createElement('tr');
    detailTr.style.display = 'none';
    const detailTd = document.createElement('td');
    detailTd.colSpan = 7;
    detailTd.style.cssText = 'padding:16px;background:#111;border-top:none';
    const addr = (b.address || '-') + ', ' + (b.zip || '') + ' ' + (b.city || '');
    detailTd.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:13px">'
      + '<div><strong style="color:#FF3366">Details</strong>'
      + '<p style="margin:6px 0;color:#ccc">Adresse: ' + addr + '</p>'
      + '<p style="margin:6px 0;color:#ccc">Tel: ' + (b.phone || '-') + '</p>'
      + '<p style="margin:6px 0;color:#ccc">IBAN: <strong>' + (b.iban || '-') + '</strong></p>'
      + '<p style="margin:6px 0;color:#ccc">Twint: ' + (b.twint || '-') + '</p>'
      + '</div>'
      + '<div id="barStats_' + b.id + '"><strong style="color:#FF3366">Statistik</strong><p style="color:#999">Klicke um zu laden...</p></div>'
      + '</div>';
    detailTr.appendChild(detailTd);
    tbody.appendChild(detailTr);
    tr.addEventListener('click', () => {
      const vis = detailTr.style.display !== 'none';
      detailTr.style.display = vis ? 'none' : 'table-row';
      if (!vis) loadBarStatsAdmin(b.id);
    });
  });
}

var _barVouchersCache = {};

async function loadBarStatsAdmin(barId, period) {
  const el = document.getElementById('barStats_' + barId);
  if (!el) return;
  period = period || 'all';

  // Fetch only once, then filter client-side
  if (!_barVouchersCache[barId]) {
    el.innerHTML = '<p style="color:#999">Laden...</p>';
    try {
      var vRes = await api({ action: 'getBarVouchers', token: _token, bar_id: barId });
      _barVouchersCache[barId] = (vRes.success && vRes.vouchers) ? vRes.vouchers : [];
    } catch(e) { el.innerHTML = '<p style="color:#ef4444">Fehler</p>'; return; }
  }

  var allV = _barVouchersCache[barId];
  var cutoff = getFilterDate(period);
  var vouchers = cutoff ? allV.filter(function(v) { return new Date(v.created_at) >= cutoff; }) : allV;

  // Compute stats from filtered vouchers
  var sold = vouchers.length, redeemed = 0, pendingAmt = 0, paidAmt = 0, commAmt = 0;
  vouchers.forEach(function(v) {
    commAmt += Number(v.platform_fee) || 0;
    if (v.status === 'redeemed') redeemed++;
    if (v.status === 'redeemed' && v.payout_status === 'pending') pendingAmt += Number(v.bar_payout) || 0;
    if (v.payout_status === 'paid') paidAmt += Number(v.bar_payout) || 0;
  });
  // Total pending (unfiltered) for payout button
  var totalPending = 0;
  allV.forEach(function(v) { if (v.status === 'redeemed' && v.payout_status === 'pending') totalPending += Number(v.bar_payout) || 0; });

  // Time filter buttons
  var html = '<div style="display:flex;gap:4px;margin-bottom:10px;flex-wrap:wrap">';
  [['day','Heute'],['week','Woche'],['month','Monat'],['year','Jahr'],['all','Alle']].forEach(function(f) {
    var act = period === f[0] ? 'background:#FF3366;color:#fff;border-color:#FF3366' : 'background:#222;color:#ccc;border-color:#333';
    html += '<button class="bsf_' + barId + '" data-p="' + f[0] + '" style="' + act + ';border:1px solid;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px;font-weight:600">' + f[1] + '</button>';
  });
  html += '</div>';

  html += '<strong style="color:#FF3366;font-size:16px">Statistik</strong>'
    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px">'
    + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Verkauft</div><div style="color:#fff;font-size:18px;font-weight:700">' + sold + '</div></div>'
    + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Eingeloest</div><div style="color:#22c55e;font-size:18px;font-weight:700">' + redeemed + '</div></div>'
    + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Offen</div><div style="color:#f59e0b;font-size:18px;font-weight:700">' + (sold - redeemed) + '</div></div>'
    + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Unsere Provision</div><div style="color:#22c55e;font-size:18px;font-weight:700">' + commAmt.toFixed(2) + ' CHF</div></div>'
    + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Schuld an Bar</div><div style="color:' + (pendingAmt > 0 ? '#ef4444' : '#22c55e') + ';font-size:18px;font-weight:700">' + pendingAmt.toFixed(2) + ' CHF</div></div>'
    + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Ausgezahlt</div><div style="color:#3b82f6;font-size:18px;font-weight:700">' + paidAmt.toFixed(2) + ' CHF</div></div>'
    + '</div>';

  if (totalPending > 0) {
    html += '<button id="payBtn_' + barId + '" style="margin-top:12px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;width:100%">Auszahlung: ' + totalPending.toFixed(2) + ' CHF an Bar ueberweisen</button>';
  }

  // Voucher detail table
  if (vouchers.length > 0) {
    html += '<div style="margin-top:16px"><strong style="color:#FF3366;font-size:14px">Gutscheine (' + vouchers.length + ')</strong>';
    html += '<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:12px">';
    html += '<tr style="border-bottom:1px solid #333"><th style="text-align:left;padding:6px;color:#999">Datum</th><th style="text-align:left;padding:6px;color:#999">Code</th><th style="text-align:left;padding:6px;color:#999">Deal</th><th style="text-align:right;padding:6px;color:#999">Preis</th><th style="text-align:right;padding:6px;color:#999">Provision</th><th style="text-align:right;padding:6px;color:#999">Bar-Anteil</th><th style="text-align:center;padding:6px;color:#999">Status</th><th style="text-align:center;padding:6px;color:#999">Auszahlung</th><th style="text-align:center;padding:6px;color:#999">Aktion</th></tr>';
    vouchers.forEach(function(v) {
      var sc = v.status === 'redeemed' ? '#22c55e' : '#f59e0b';
      var st2 = v.status === 'redeemed' ? 'Eingeloest' : 'Offen';
      var pc = v.payout_status === 'paid' ? '#3b82f6' : '#ef4444';
      var pt = v.payout_status === 'paid' ? 'Bezahlt' : 'Ausstehend';
      var ds = v.created_at ? new Date(v.created_at).toLocaleDateString('de-CH') : '-';
      html += '<tr style="border-bottom:1px solid #222">';
      html += '<td style="padding:6px;color:#888;font-size:11px">' + ds + '</td>';
      html += '<td style="padding:6px;color:#ccc;font-family:monospace">' + (v.code||'-') + '</td>';
      html += '<td style="padding:6px;color:#ccc">' + (v.deal_title||'-') + '</td>';
      html += '<td style="padding:6px;color:#ccc;text-align:right">' + Number(v.price_paid||0).toFixed(2) + '</td>';
      html += '<td style="padding:6px;color:#ccc;text-align:right">' + Number(v.platform_fee||0).toFixed(2) + '</td>';
      html += '<td style="padding:6px;color:#ccc;text-align:right">' + Number(v.bar_payout||0).toFixed(2) + '</td>';
      html += '<td style="padding:6px;text-align:center"><span style="color:' + sc + ';font-weight:600">' + st2 + '</span></td>';
      html += '<td style="padding:6px;text-align:center"><span style="color:' + pc + ';font-weight:600">' + pt + '</span></td>';
      html += '<td style="padding:6px;text-align:center">';
      if (v.status === 'sent' || v.status === 'issued') {
        html += '<button class="btn-sm btn-red" style="font-size:11px;padding:3px 8px" data-refund-vid="' + v.id + '" data-refund-code="' + v.code + '">Erstatten</button>';
      }
      html += '</td></tr>';
    });
    html += '</table></div>';
  }

  el.innerHTML = html;

  // Attach filter buttons
  el.querySelectorAll('.bsf_' + barId).forEach(function(btn) {
    btn.addEventListener('click', function() { loadBarStatsAdmin(barId, this.getAttribute('data-p')); });
  });
  // Attach payout button
  var payBtn = document.getElementById('payBtn_' + barId);
  if (payBtn) payBtn.addEventListener('click', function() { _barVouchersCache[barId] = null; payoutBar(barId); });
  // Attach refund buttons
  el.querySelectorAll('[data-refund-vid]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      _barVouchersCache[barId] = null;
      refundVoucher(this.getAttribute('data-refund-vid'), this.getAttribute('data-refund-code'));
    });
  });
}

async function payoutBar(barId) {
  if (!confirm('Auszahlung an diese Bar durchführen? Die Bar erhält eine Bestätigungs-Email.')) return;
  try {
    const r = await api({ action: 'payoutBar', token: _token, bar_id: barId });
    if (r.success) {
      showToast('✅ ' + r.message);
      loadBarStatsAdmin(barId);
      loadStats();
    } else {
      showToast(r.error || 'Fehler', true);
    }
  } catch(e) { showToast('Verbindungsfehler', true); }
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
    actionTd.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap';
    const btnToggle = document.createElement('button');
    btnToggle.className = 'btn-sm ' + (d.active ? 'btn-orange' : 'btn-green');
    btnToggle.textContent = d.active ? t('deactivateDeal') : t('activateDeal');
    btnToggle.addEventListener('click', () => adminToggleDeal(d.id, !d.active));
    actionTd.appendChild(btnToggle);
    const btnDel = document.createElement('button');
    btnDel.className = 'btn-sm btn-red'; btnDel.textContent = t('delete');
    btnDel.addEventListener('click', () => adminDeleteDeal(d.id, d.title));
    actionTd.appendChild(btnDel);

    tr.append(
      td(d.bar_name), td(d.title),
      td(Number(d.deal_price).toFixed(2) + ' CHF'),
      td(d.sold_count || 0),
      statusTd, actionTd
    );
    tbody.appendChild(tr);
  });
}

async function adminDeleteDeal(dealId, title) {
  if (!confirm('Deal "' + (title||'') + '" wirklich loeschen?')) return;
  if (!hasSession()) { doLogout(); return; }
  try {
    const r = await api({ action: 'adminDeleteDeal', token: _token, deal_id: dealId });
    if (r.success) { showToast('Deal geloescht'); loadDeals(); }
    else showToast(r.error || 'Fehler', true);
  } catch(e) { showToast('Verbindungsfehler', true); }
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
var _statsFilter = 'all';
var _statsData = null;

async function loadStats() {
  if (!hasSession()) { doLogout(); return; }
  try {
    const [vRes, oRes, bRes, dRes] = await Promise.all([
      api({ action: 'getVouchers', token: _token }),
      api({ action: 'getOrders', token: _token }),
      api({ action: 'getBars', token: _token }),
      api({ action: 'getAdminDeals', token: _token })
    ]);
    _statsData = {
      vouchers: (vRes.success ? vRes.vouchers : []) || [],
      orders: (oRes.success ? oRes.orders : []) || [],
      bars: (bRes.success ? bRes.bars : []) || [],
      deals: (dRes.success ? dRes.deals : []) || []
    };
    try { _statsData.customers = Math.max(0, (await api({ action: 'getCustomers', token: _token })).customers.length); } catch(e) { _statsData.customers = 0; }
    renderStats(_statsFilter);
  } catch (e) { showToast('Ladefehler', true); }
}

function setStatsFilter(period) {
  _statsFilter = period;
  document.querySelectorAll('.stats-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  var btn = document.getElementById('sf_' + period);
  if (btn) btn.classList.add('active');
  if (_statsData) renderStats(period);
}

function getFilterDate(period) {
  var now = new Date();
  if (period === 'day') { var d = new Date(now); d.setHours(0,0,0,0); return d; }
  if (period === 'week') { var d = new Date(now); d.setDate(d.getDate() - 7); return d; }
  if (period === 'month') { var d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
  if (period === 'year') { var d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
  return null; // 'all'
}

function renderStats(period) {
  var container = document.getElementById('statsGrid');
  container.innerHTML = '';

  // Filter buttons
  var filterHtml = '<div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap">';
  [['day','Heute','Today'],['week','Woche','Week'],['month','Monat','Month'],['year','Jahr','Year'],['all','Alle','All']].forEach(function(f) {
    var active = period === f[0] ? 'background:#FF3366;color:#fff;border-color:#FF3366' : 'background:#222;color:#ccc;border-color:#333';
    filterHtml += '<button class="stats-filter-btn" id="sf_' + f[0] + '" onclick="setStatsFilter(\'' + f[0] + '\')" style="' + active + ';border:1px solid;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600">' + f[1] + '</button>';
  });
  filterHtml += '</div>';

  var filterDiv = document.createElement('div');
  filterDiv.innerHTML = filterHtml;
  container.appendChild(filterDiv);

  var cutoff = getFilterDate(period);
  var d = _statsData;

  // Filter vouchers and orders by date
  var filtV = cutoff ? d.vouchers.filter(function(v) { return new Date(v.created_at) >= cutoff; }) : d.vouchers;
  var filtO = cutoff ? d.orders.filter(function(o) { return new Date(o.created_at) >= cutoff; }) : d.orders;

  var totalRevenue = 0, totalFees = 0, pendingPayout = 0, totalPaidOut = 0, redeemed = 0, totalRefunds = 0;
  filtV.forEach(function(v) {
    totalRevenue += Number(v.price_paid) || 0;
    totalFees += Number(v.platform_fee) || 0;
    if (v.status === 'redeemed') {
      redeemed++;
      if (v.payout_status === 'pending') pendingPayout += Number(v.bar_payout) || 0;
    }
    if (v.payout_status === 'paid') totalPaidOut += Number(v.bar_payout) || 0;
  });
  var paidOrders = 0;
  filtO.forEach(function(o) {
    if (o.status === 'paid') paidOrders++;
    if (o.refund_status === 'completed') totalRefunds += Number(o.price) || 0;
  });
  var activeBars = 0;
  d.bars.forEach(function(b) { if (b.status === 'active') activeBars++; });
  var activeDeals = 0;
  d.deals.forEach(function(dl) { if (dl.active === true) activeDeals++; });

  var grid = document.createElement('div');
  grid.className = 'stats-grid';
  var stats = [
    ['Gutscheine vermittelt', filtV.length],
    ['Bestellungen', filtO.length],
    ['Bezahlt', paidOrders],
    ['Umsatz', Number(totalRevenue).toFixed(2) + ' CHF'],
    ['Provision (Einnahmen)', Number(totalFees).toFixed(2) + ' CHF'],
    ['Schuld an Bars', Number(pendingPayout).toFixed(2) + ' CHF'],
    ['Ausgezahlt an Bars', Number(totalPaidOut).toFixed(2) + ' CHF'],
    ['Aktive Bars', activeBars],
    ['Aktive Deals', activeDeals],
    ['Gutscheine eingelöst', redeemed],
    ['Kund:innen', d.customers || 0],
    ['Rückerstattungen', Number(totalRefunds).toFixed(2) + ' CHF'],
  ];
  stats.forEach(function(s) {
    if (s[1] === undefined || s[1] === null) return;
    var card = document.createElement('div'); card.className = 'stat-card';
    var lEl = document.createElement('div'); lEl.className = 'stat-label'; lEl.textContent = s[0];
    var vEl = document.createElement('div'); vEl.className = 'stat-value'; vEl.textContent = String(s[1]);
    card.append(lEl, vEl); grid.appendChild(card);
  });
  container.appendChild(grid);
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
  const langIT = document.getElementById('langIT');
  const langFR = document.getElementById('langFR');
  if (langDE) langDE.addEventListener('click', function() { setLang('de'); });
  if (langEN) langEN.addEventListener('click', function() { setLang('en'); });
  if (langIT) langIT.addEventListener('click', function() { setLang('it'); });
  if (langFR) langFR.addEventListener('click', function() { setLang('fr'); });
});


// =============================================
// CUSTOMERS
// =============================================
var _allCustomers = [];
async function loadCustomers() {
  if (!hasSession()) { doLogout(); return; }
  try {
    var r = await api({ action: 'getCustomers', token: _token });
    if (!r.success) { showToast(r.error, true); return; }
    _allCustomers = r.customers || [];
    renderCustomers(_allCustomers);
  } catch(e) { showToast('Ladefehler', true); }
}
function renderCustomers(customers) {
  var tbody = document.getElementById('customersBody');
  tbody.innerHTML = '';
  if (!customers.length) { tbody.innerHTML = '<tr><td colspan="3" class="no-data">Keine Kund:innen</td></tr>'; return; }
  customers.forEach(function(c) {
    var tr = document.createElement('tr');
    var d = c.created_at ? new Date(c.created_at) : null;
    tr.append(
      td(c.name || '-'),
      td(c.email),
      td(d ? d.toLocaleDateString('de-CH') : '-')
    );
    tbody.appendChild(tr);
  });
}
document.addEventListener('DOMContentLoaded', function() {
  var cs = document.getElementById('customerSearch');
  if (cs) cs.addEventListener('input', function() {
    var q = this.value.toLowerCase();
    renderCustomers(_allCustomers.filter(function(c) { return (c.name||'').toLowerCase().includes(q) || (c.email||'').toLowerCase().includes(q); }));
  });
});
