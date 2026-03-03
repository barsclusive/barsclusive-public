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
      td(o.deal_title), td(o.bar_name), td(o.buyer_name),
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

async function loadBarStatsAdmin(barId) {
  const el = document.getElementById('barStats_' + barId);
  if (!el) return;
  try {
    const r = await api({ action: 'getBarStats', token: _token, bar_id: barId });
    if (r.success && r.stats) {
      const s = r.stats;
      const pending = Number(s.pending_payout||0);
      const paid = Number(s.paid_out||0);
      const comm = Number(s.our_commission||0);
      var html = '<strong style="color:#FF3366">Statistik</strong>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px">'
        + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Verkauft</div><div style="color:#fff;font-size:18px;font-weight:700">' + (s.vouchers_sold||0) + '</div></div>'
        + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Eingelöst</div><div style="color:#fff;font-size:18px;font-weight:700">' + (s.vouchers_redeemed||0) + '</div></div>'
        + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Offen</div><div style="color:#fff;font-size:18px;font-weight:700">' + (s.vouchers_not_redeemed||0) + '</div></div>'
        + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Unsere Provision</div><div style="color:#22c55e;font-size:18px;font-weight:700">' + comm.toFixed(2) + ' CHF</div></div>'
        + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Schuld an Bar</div><div style="color:' + (pending > 0 ? '#ef4444' : '#22c55e') + ';font-size:18px;font-weight:700">' + pending.toFixed(2) + ' CHF</div></div>'
        + '<div style="background:#1a1a1a;padding:10px;border-radius:8px"><div style="color:#999;font-size:11px">Ausgezahlt</div><div style="color:#3b82f6;font-size:18px;font-weight:700">' + paid.toFixed(2) + ' CHF</div></div>'
        + '</div>';
      if (pending > 0) {
        html += '<button id="payBtn_' + barId + '" style="margin-top:12px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;width:100%">💸 Auszahlung: ' + pending.toFixed(2) + ' CHF</button>';
      }
      el.innerHTML = html;
      var payBtn = document.getElementById('payBtn_' + barId);
      if (payBtn) payBtn.addEventListener('click', function() { payoutBar(barId); });
    }
  } catch(e) { el.innerHTML = '<p style="color:#ef4444">Fehler</p>'; }
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
  var stats = [
    ['Bestellungen', s.total_orders],
    ['Bezahlt', s.paid_orders],
    ['Umsatz', Number(s.total_revenue || 0).toFixed(2) + ' CHF'],
    ['Provision (Einnahmen)', Number(s.total_fees || 0).toFixed(2) + ' CHF'],
    ['Schuld an Bars', Number(s.pending_payout || 0).toFixed(2) + ' CHF'],
    ['Ausgezahlt an Bars', Number(s.total_paid_out || 0).toFixed(2) + ' CHF'],
    ['Aktive Bars', s.active_bars],
    ['Aktive Deals', s.active_deals],
    ['Gutscheine eingelöst', s.redeemed_vouchers],
    ['Kund:innen', s.total_customers],
    ['Rückerstattungen', Number(s.total_refunds || 0).toFixed(2) + ' CHF'],
  ];
  stats.forEach(function([label, val]) {
    if (val === undefined || val === null) return;
    var card = document.createElement('div'); card.className = 'stat-card';
    var lEl = document.createElement('div'); lEl.className = 'stat-label'; lEl.textContent = label;
    var vEl = document.createElement('div'); vEl.className = 'stat-value'; vEl.textContent = String(val);
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
