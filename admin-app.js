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
    tabOrders:'Bestellungen', tabVouchers:'Gutscheine', tabPayout:'Auszahlen',
    tabBars:'Bars', tabCustomers:'Kund:innen', tabDeals:'Deals', tabStats:'Statistik',
    activate:'Freischalten', deactivate:'Sperren', delete:'🗑️',
    markPaid:'✓ Bezahlt', markPayout:'✓ Ausgezahlt', refundBtn:'↩️ Erstatten',
    activateDeal:'Aktivieren', deactivateDeal:'Deaktivieren',
    commissionSave:'Speichern',
    noOrders:'Keine Bestellungen', noVouchers:'Keine Gutscheine',
    noBars:'Keine Bars', noDeals:'Keine Deals', noCustomers:'Keine Kund:innen',
    searchPlaceholder:'Suchen...',
  },
  en: {
    logout:'Logout', loginBtn:'Login',
    tabOrders:'Orders', tabVouchers:'Vouchers', tabPayout:'Payouts',
    tabBars:'Bars', tabCustomers:'Customers', tabDeals:'Deals', tabStats:'Statistics',
    activate:'Activate', deactivate:'Block', delete:'🗑️',
    markPaid:'✓ Paid', markPayout:'✓ Payout done', refundBtn:'↩️ Refund',
    activateDeal:'Activate', deactivateDeal:'Deactivate',
    commissionSave:'Save',
    noOrders:'No orders', noVouchers:'No vouchers',
    noBars:'No bars', noDeals:'No deals', noCustomers:'No customers',
    searchPlaceholder:'Search...',
  },
  it: {
    logout:'Disconnettersi', loginBtn:'Accedere',
    tabOrders:'Ordini', tabVouchers:'Buoni', tabPayout:'Pagamenti',
    tabBars:'Bar', tabCustomers:'Clienti', tabDeals:'Offerte', tabStats:'Statistiche',
    activate:'Attivare', deactivate:'Bloccare', delete:'🗑️',
    markPaid:'✓ Pagato', markPayout:'✓ Pagamento', refundBtn:'↩️ Rimborso',
    activateDeal:'Attivare', deactivateDeal:'Disattivare',
    commissionSave:'Salvare',
    noOrders:'Nessun ordine', noVouchers:'Nessun buono',
    noBars:'Nessun bar', noDeals:'Nessuna offerta', noCustomers:'Nessun cliente',
    searchPlaceholder:'Cercare...',
  },
  fr: {
    logout:'Déconnexion', loginBtn:'Connexion',
    tabOrders:'Commandes', tabVouchers:'Bons', tabPayout:'Paiements',
    tabBars:'Bars', tabCustomers:'Clients', tabDeals:'Offres', tabStats:'Statistiques',
    activate:'Activer', deactivate:'Bloquer', delete:'🗑️',
    markPaid:'✓ Payé', markPayout:'✓ Versé', refundBtn:'↩️ Rembourser',
    activateDeal:'Activer', deactivateDeal:'Désactiver',
    commissionSave:'Sauvegarder',
    noOrders:'Aucune commande', noVouchers:'Aucun bon',
    noBars:'Aucun bar', noDeals:'Aucune offre', noCustomers:'Aucun client',
    searchPlaceholder:'Rechercher...',
  }
};
let currentLang = 'de';
function t(key) { return (TRANSLATIONS[currentLang] || {})[key] || (TRANSLATIONS.de || {})[key] || key; }
function setLang(lang) {
  currentLang = lang;
  ['DE','EN','IT','FR'].forEach(function(l) {
    var btn = document.getElementById('lang' + l);
    if (btn) { btn.classList.remove('active'); if (lang === l.toLowerCase()) btn.classList.add('active'); }
  });
  var btnLogout = document.getElementById('btnLogout');
  if (btnLogout) btnLogout.textContent = t('logout');
  document.querySelectorAll('.tab').forEach(function(tab) {
    var key = tab.getAttribute('data-tab');
    var map = {orders:'tabOrders',vouchers:'tabVouchers',payout:'tabPayout',bars:'tabBars',customers:'tabCustomers',deals:'tabDeals',stats:'tabStats'};
    var icon = tab.textContent.split(' ')[0];
    if (map[key]) tab.textContent = icon + ' ' + t(map[key]);
  });
  var cs = document.getElementById('customerSearch');
  if (cs) cs.placeholder = t('searchPlaceholder');
}

// =============================================
// SESSION
// =============================================
let _token = null, _sessionExpiry = 0;
function hasSession() { if (!_token || Date.now() > _sessionExpiry) { _token = null; return false; } return true; }
function setSession(token) { _token = token; _sessionExpiry = Date.now() + 90 * 60 * 1000; }

// =============================================
// HELPERS
// =============================================
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function td(val) { var c = document.createElement('td'); c.textContent = String(val ?? ''); return c; }
function fmtDate(d) { if (!d) return '-'; var dt = new Date(d); return dt.toLocaleDateString('de-CH') + ' ' + dt.toLocaleTimeString('de-CH',{hour:'2-digit',minute:'2-digit'}); }
function fmtChf(n) { return Number(n||0).toFixed(2); }
function getFilterDate(period) {
  var now = new Date();
  if (period === 'day') { var d = new Date(now); d.setHours(0,0,0,0); return d; }
  if (period === 'week') { var d = new Date(now); d.setDate(d.getDate()-7); return d; }
  if (period === 'month') { var d = new Date(now); d.setMonth(d.getMonth()-1); return d; }
  if (period === 'year') { var d = new Date(now); d.setFullYear(d.getFullYear()-1); return d; }
  if (period === 'custom' && _customFrom) return new Date(_customFrom);
  return null;
}
function getFilterDateTo(period) {
  if (period === 'custom' && _customTo) { var d = new Date(_customTo); d.setHours(23,59,59,999); return d; }
  return null;
}

// =============================================
// LOGIN
// =============================================
async function doAdminLogin() {
  var pass = document.getElementById('adminPass').value;
  var btn = document.getElementById('btnLogin');
  var err = document.getElementById('loginErr');
  err.textContent = '';
  if (!pass) { err.textContent = 'Passwort eingeben'; return; }
  btn.disabled = true; btn.textContent = '...';
  try {
    var r = await api({ action:'adminLogin', password:pass });
    if (r.success) {
      setSession(r.token);
      document.getElementById('adminPass').value = '';
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      loadOrders();
    } else { err.textContent = 'Ungültige Zugangsdaten.'; document.getElementById('adminPass').value = ''; }
  } catch(e) { err.textContent = 'Verbindungsfehler.'; }
  finally { btn.disabled = false; btn.textContent = t('loginBtn'); }
}
async function doLogout() {
  if (_token) { try { await api({ action:'logout', token:_token }); } catch(e) {} }
  _token = null;
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}

// =============================================
// TABS
// =============================================
function switchTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.tab').forEach(function(el) { el.classList.remove('active'); });
  var tabEl = document.getElementById('tab' + name.charAt(0).toUpperCase() + name.slice(1));
  if (tabEl) tabEl.classList.add('active');
  btn.classList.add('active');
  var loaders = { orders:loadOrders, vouchers:loadVouchers, payout:loadPayout, bars:loadBars, customers:loadCustomers, deals:loadDeals, stats:loadStats };
  if (loaders[name]) loaders[name]();
}

// =============================================
// ADMIN DATA CACHE - skip reload if already loaded
// =============================================
var _adminLoaded = { orders:false, vouchers:false, bars:false, deals:false, customers:false, stats:false, payout:false };

// =============================================
// ORDERS
// =============================================
var _ordersData = [], _orderSort = { col:'created_at', dir:-1 }, _orderFilters = {};

async function loadOrders(force) {
  if (!hasSession()) { doLogout(); return; }
  if (!force && _adminLoaded.orders && _ordersData.length > 0) { renderOrders(); return; }
  try {
    var [oR, vR] = await Promise.all([api({action:'getOrders',token:_token}), api({action:'getVouchers',token:_token})]);
    if (!oR.success) { showToast(oR.error, true); return; }
    var vMap = {};
    var vouchersByOrder = {};
    if (vR.success && vR.vouchers) vR.vouchers.forEach(function(v) {
      vMap[v.id] = v;
      if (v.order_id) {
        if (!vouchersByOrder[v.order_id]) vouchersByOrder[v.order_id] = [];
        vouchersByOrder[v.order_id].push(v);
      }
    });
    _ordersData = (oR.orders||[]).map(function(o) {
      var linkedVouchers = vouchersByOrder[o.id] || [];
      var grossCommission = 0, barPayoutTotal = 0;
      linkedVouchers.forEach(function(v) {
        grossCommission += Number(v.platform_fee || 0);
        barPayoutTotal += Number(v.bar_payout || 0);
      });
      o._vouchers = linkedVouchers;
      o._voucher = linkedVouchers[0] || (o.voucher_id ? vMap[o.voucher_id] : null) || null;
      o._grossCommission = grossCommission;
      o._stripeFee = Number(o.stripe_fee || 0);
      o._platformNet = grossCommission - o._stripeFee;
      o._barPayoutTotal = barPayoutTotal;
      return o;
    });
    if (force) _orderFilters = {};
    _adminLoaded.orders = true;
    renderOrders();
  } catch(e) { showToast('Ladefehler', true); }
}

function getOrderFinancials(order, barId) {
  var vouchers = order && order._vouchers ? order._vouchers : [];
  var relevantVouchers = barId ? vouchers.filter(function(v) { return String(v.bar_id) === String(barId); }) : vouchers.slice();
  var voucherSales = 0, grossCommission = 0, barPayout = 0;
  relevantVouchers.forEach(function(v) {
    voucherSales += Number(v.price_paid || 0);
    grossCommission += Number(v.platform_fee || 0);
    barPayout += Number(v.bar_payout || 0);
  });
  var globalVoucherSales = 0;
  vouchers.forEach(function(v) { globalVoucherSales += Number(v.price_paid || 0); });
  var orderTotal = Number(order && order.price || 0);
  if (orderTotal <= 0) orderTotal = globalVoucherSales;
  if (!barId && voucherSales <= 0) voucherSales = orderTotal;
  if (barId && voucherSales <= 0 && String(order.bar_id) === String(barId) && !vouchers.length) voucherSales = orderTotal;
  var stripeFee = Number(order && order.stripe_fee || 0);
  var allocatedStripeFee = 0;
  if (barId) {
    var shareBase = voucherSales;
    var totalBase = globalVoucherSales > 0 ? globalVoucherSales : orderTotal;
    allocatedStripeFee = totalBase > 0 ? stripeFee * (shareBase / totalBase) : 0;
  } else {
    allocatedStripeFee = stripeFee;
  }
  var included = !barId ? true : (voucherSales > 0 || String(order.bar_id) === String(barId));
  return {
    included: included,
    sales: voucherSales,
    grossCommission: grossCommission,
    stripeFee: allocatedStripeFee,
    platformNet: grossCommission - allocatedStripeFee,
    barPayout: barPayout
  };
}

function renderOrders() {
  var data = _ordersData.slice();
  Object.keys(_orderFilters).forEach(function(k) {
    var f = (_orderFilters[k]||'').toLowerCase(); if (!f) return;
    data = data.filter(function(o) {
      var val = '';
      if (k==='date') val = fmtDate(o.created_at);
      else if (k==='deal') val = o.deal_title||'';
      else if (k==='bar') val = o.bar_name||'';
      else if (k==='buyer') val = o.buyer_name||'';
      else if (k==='email') val = o.buyer_email||'';
      else if (k==='price') val = fmtChf(o.price);
      else if (k==='gross_commission') val = fmtChf(o._grossCommission);
      else if (k==='stripe_fee') val = fmtChf(o._stripeFee);
      else if (k==='platform_net') val = fmtChf(o._platformNet);
      else if (k==='status') val = o.status||'';
      else if (k==='voucher') val = o._voucher ? o._voucher.status : '';
      else if (k==='refund') val = o.refund_status||'';
      return val.toLowerCase().indexOf(f) !== -1;
    });
  });
  var sc = _orderSort.col, sd = _orderSort.dir;
  data.sort(function(a,b) {
    var va, vb;
    if (sc==='created_at') { va = new Date(a.created_at||0); vb = new Date(b.created_at||0); }
    else if (sc==='price') { va = Number(a.price||0); vb = Number(b.price||0); }
    else if (sc==='gross_commission') { va = Number(a._grossCommission||0); vb = Number(b._grossCommission||0); }
    else if (sc==='stripe_fee') { va = Number(a._stripeFee||0); vb = Number(b._stripeFee||0); }
    else if (sc==='platform_net') { va = Number(a._platformNet||0); vb = Number(b._platformNet||0); }
    else if (sc==='deal') { va = (a.deal_title||'').toLowerCase(); vb = (b.deal_title||'').toLowerCase(); }
    else if (sc==='bar') { va = (a.bar_name||'').toLowerCase(); vb = (b.bar_name||'').toLowerCase(); }
    else if (sc==='buyer') { va = (a.buyer_name||'').toLowerCase(); vb = (b.buyer_name||'').toLowerCase(); }
    else { va = (a[sc]||'').toString(); vb = (b[sc]||'').toString(); }
    return va > vb ? sd : va < vb ? -sd : 0;
  });
  var tbody = document.getElementById('ordersBody');
  tbody.innerHTML = '';
  // Filter row
  var ftr = document.createElement('tr'); ftr.style.background = '#1a1a1a';
  ['date','deal','bar','buyer','email','price','gross_commission','stripe_fee','platform_net','status','voucher','refund',''].forEach(function(k) {
    var ftd = document.createElement('td'); ftd.style.padding = '4px';
    if (k) {
      var inp = document.createElement('input'); inp.type='text'; inp.placeholder='🔍';
      inp.value = _orderFilters[k]||'';
      inp.style.cssText = 'width:100%;background:#222;color:#ccc;border:1px solid #444;padding:3px 6px;font-size:11px;border-radius:4px;box-sizing:border-box';
      inp.addEventListener('input', function() { _orderFilters[k]=this.value; renderOrders(); });
      ftd.appendChild(inp);
    }
    ftr.appendChild(ftd);
  });
  tbody.appendChild(ftr);
  if (!data.length) { tbody.innerHTML += '<tr><td colspan="13" class="no-data">Keine Bestellungen</td></tr>'; return; }
  var totalPrice = 0, totalCommission = 0, totalStripe = 0, totalNet = 0;
  data.forEach(function(o) {
    totalPrice += Number(o.price||0);
    totalCommission += Number(o._grossCommission||0);
    totalStripe += Number(o._stripeFee||0);
    totalNet += Number(o._platformNet||0);
    var tr = document.createElement('tr');
    if (o.refund_status==='requested') tr.style.background='#2a2000';
    var sBadge = o.status==='paid' ? '<span class="badge b-paid">✓ Bezahlt</span>' : '<span class="badge b-pending">⏳</span>';
    var vBadge = o._voucher ? (o._voucher.status==='redeemed' ? '<span class="badge b-paid">✓ Eingelöst</span>' : '<span class="badge b-active">⏳ Offen</span>') : '-';
    var refTxt = o.refund_status==='requested' ? '<span style="color:#FFC107">⚠️ Angefordert</span>' : o.refund_status==='completed' ? '<span style="color:#4CAF50">↩️ Erstattet</span>' : '-';
    var aHtml = '';
    if (o.refund_status==='requested') aHtml += '<button class="btn-sm btn-red" data-refund-oid="'+o.id+'">Erstatten</button> ';
    aHtml += '<button class="btn-sm" style="background:#333;color:#999;font-size:10px" data-del-oid="'+o.id+'">🗑</button>';
    tr.innerHTML = '<td style="font-size:11px">'+fmtDate(o.created_at)+'</td><td>'+esc(o.deal_title||'-')+'</td><td>'+esc(o.bar_name||'-')+'</td><td>'+esc(o.buyer_name||'-')+'</td><td style="font-size:11px">'+esc(o.buyer_email||'-')+'</td><td style="text-align:right">'+fmtChf(o.price)+'</td><td style="text-align:right;color:#f59e0b">'+fmtChf(o._grossCommission)+'</td><td style="text-align:right;color:#ef4444">'+fmtChf(o._stripeFee)+'</td><td style="text-align:right;color:#22c55e">'+fmtChf(o._platformNet)+'</td><td>'+sBadge+'</td><td>'+vBadge+'</td><td>'+refTxt+'</td><td>'+aHtml+'</td>';
    tbody.appendChild(tr);
  });
  var sumTr = document.createElement('tr');
  sumTr.style.cssText='background:#1a1a1a;font-weight:700;border-top:2px solid #FF3366';
  sumTr.innerHTML='<td colspan="5" style="padding:8px;color:#FF3366">'+data.length+' Bestellungen</td><td style="text-align:right;padding:8px">'+totalPrice.toFixed(2)+' CHF</td><td style="text-align:right;padding:8px;color:#f59e0b">'+totalCommission.toFixed(2)+' CHF</td><td style="text-align:right;padding:8px;color:#ef4444">'+totalStripe.toFixed(2)+' CHF</td><td style="text-align:right;padding:8px;color:#22c55e">'+totalNet.toFixed(2)+' CHF</td><td colspan="4"></td>';
  tbody.appendChild(sumTr);
  tbody.querySelectorAll('[data-refund-oid]').forEach(function(b){b.addEventListener('click',function(){processRefund(this.getAttribute('data-refund-oid'));});});
  tbody.querySelectorAll('[data-del-oid]').forEach(function(b){b.addEventListener('click',function(){deleteOrder(this.getAttribute('data-del-oid'));});});
}
async function deleteOrder(id) { if(!confirm('Bestellung löschen?'))return; try{var r=await api({action:'deleteOrder',token:_token,order_id:id});if(r.success){showToast('Gelöscht');_adminLoaded.orders=false;_statsData=null;loadOrders(true);}else showToast(r.error,true);}catch(e){showToast('Fehler',true);} }
async function processRefund(id) { if(!confirm('Rückerstattung durchführen? Kunde erhält Email.'))return; try{var r=await api({action:'processRefund',token:_token,order_id:id});if(r.success){showToast('✅ Erstattet');_adminLoaded.orders=false;_adminLoaded.vouchers=false;_statsData=null;_payoutData=null;loadOrders(true);}else showToast(r.error,true);}catch(e){showToast('Fehler',true);} }

// =============================================
// VOUCHERS (with buyer_name + buyer_email)
// =============================================
var _vouchersData=[], _voucherSort={col:'created_at',dir:-1}, _voucherFilters={};

async function loadVouchers(force) {
  if (!hasSession()) { doLogout(); return; }
  if (!force && _adminLoaded.vouchers && _vouchersData.length > 0) { renderVouchers(); return; }
  try {
    var r = await api({action:'getVouchers',token:_token});
    if (!r.success) { showToast(r.error,true); return; }
    _vouchersData = r.vouchers||[];
    if (force) _voucherFilters = {};
    _adminLoaded.vouchers = true;
    renderVouchers();
  } catch(e) { showToast('Ladefehler',true); }
}

function renderVouchers() {
  var data = _vouchersData.slice();
  Object.keys(_voucherFilters).forEach(function(k) {
    var f = (_voucherFilters[k]||'').toLowerCase(); if (!f) return;
    data = data.filter(function(v) {
      var val = '';
      if (k==='date') val = fmtDate(v.created_at);
      else if (k==='code') val = v.code||'';
      else if (k==='deal') val = v.deal_title||'';
      else if (k==='bar') val = v.bar_name||'';
      else if (k==='buyer') val = v.buyer_name||'';
      else if (k==='buyer_email') val = v.buyer_email||'';
      else if (k==='price') val = fmtChf(v.price_paid);
      else if (k==='fee') val = fmtChf(v.platform_fee);
      else if (k==='payout') val = fmtChf(v.bar_payout);
      else if (k==='status') val = v.status||'';
      else if (k==='pay_status') val = v.payout_status||'';
      return val.toLowerCase().indexOf(f)!==-1;
    });
  });
  var sc=_voucherSort.col, sd=_voucherSort.dir;
  data.sort(function(a,b) {
    var va,vb;
    if (sc==='created_at'){va=new Date(a.created_at||0);vb=new Date(b.created_at||0);}
    else if (sc==='price'){va=Number(a.price_paid||0);vb=Number(b.price_paid||0);}
    else if (sc==='fee'){va=Number(a.platform_fee||0);vb=Number(b.platform_fee||0);}
    else if (sc==='payout'){va=Number(a.bar_payout||0);vb=Number(b.bar_payout||0);}
    else if (sc==='buyer_name'){va=(a.buyer_name||'').toLowerCase();vb=(b.buyer_name||'').toLowerCase();}
    else{va=(a[sc]||'').toString().toLowerCase();vb=(b[sc]||'').toString().toLowerCase();}
    return va>vb?sd:va<vb?-sd:0;
  });
  var tbody = document.getElementById('vouchersBody');
  tbody.innerHTML='';
  // Filter row - 12 columns now
  var ftr = document.createElement('tr'); ftr.style.background='#1a1a1a';
  ['date','code','deal','bar','buyer','buyer_email','price','fee','payout','status','pay_status',''].forEach(function(k){
    var ftd=document.createElement('td');ftd.style.padding='4px';
    if(k){var inp=document.createElement('input');inp.type='text';inp.placeholder='🔍';inp.value=_voucherFilters[k]||'';
      inp.style.cssText='width:100%;background:#222;color:#ccc;border:1px solid #444;padding:3px 6px;font-size:11px;border-radius:4px;box-sizing:border-box';
      inp.addEventListener('input',function(){_voucherFilters[k]=this.value;renderVouchers();});ftd.appendChild(inp);}
    ftr.appendChild(ftd);
  });
  tbody.appendChild(ftr);
  if(!data.length){tbody.innerHTML+='<tr><td colspan="12" class="no-data">Keine Gutscheine</td></tr>';return;}
  var tP=0,tF=0,tA=0;
  data.forEach(function(v){
    tP+=Number(v.price_paid||0);tF+=Number(v.platform_fee||0);tA+=Number(v.bar_payout||0);
    var stBadge = v.status==='redeemed' ? '<span class="badge b-paid">✓ Eingelöst</span>' : (v.status==='refunded') ? '<span class="badge" style="background:#EF4444;color:#fff">refunded</span>' : '<span class="badge b-active">'+esc(v.status||'-')+'</span>';
    var payBadge = v.payout_status==='paid' ? '<span style="color:#3b82f6;font-weight:600">Bezahlt</span>' : '<span style="color:#ef4444">Ausstehend</span>';
    var aHtml='';
    if(v.payout_status==='pending'&&v.status==='redeemed') aHtml+='<button class="btn-sm btn-blue" style="font-size:10px" data-markpaid-vid="'+v.id+'">💸</button> ';
    if(v.status==='sent'||v.status==='issued') aHtml+='<button class="btn-sm btn-red" style="font-size:10px" data-refund-vid="'+v.id+'" data-refund-code="'+(v.code||'')+'">↩️</button> ';
    aHtml+='<button class="btn-sm" style="background:#333;color:#999;font-size:10px" data-del-vid="'+v.id+'">🗑</button>';
    var tr=document.createElement('tr');
    tr.innerHTML='<td style="font-size:11px">'+fmtDate(v.created_at)+'</td>'
      +'<td style="font-family:monospace;font-size:11px">'+esc(v.code||'-')+'</td>'
      +'<td>'+esc(v.deal_title||'-')+'</td><td>'+esc(v.bar_name||'-')+'</td>'
      +'<td>'+esc(v.buyer_name||'-')+'</td><td style="font-size:11px">'+esc(v.buyer_email||'-')+'</td>'
      +'<td style="text-align:right">'+fmtChf(v.price_paid)+'</td>'
      +'<td style="text-align:right;color:#ef4444">'+fmtChf(v.platform_fee)+'</td>'
      +'<td style="text-align:right;color:#22c55e">'+fmtChf(v.bar_payout)+'</td>'
      +'<td>'+stBadge+'</td><td>'+payBadge+'</td><td>'+aHtml+'</td>';
    tbody.appendChild(tr);
  });
  var sumTr=document.createElement('tr');
  sumTr.style.cssText='background:#1a1a1a;font-weight:700;border-top:2px solid #FF3366';
  sumTr.innerHTML='<td colspan="6" style="padding:8px;color:#FF3366">'+data.length+' Gutscheine</td><td style="text-align:right;padding:8px">'+tP.toFixed(2)+'</td><td style="text-align:right;padding:8px;color:#ef4444">'+tF.toFixed(2)+'</td><td style="text-align:right;padding:8px;color:#22c55e">'+tA.toFixed(2)+'</td><td colspan="3"></td>';
  tbody.appendChild(sumTr);
  tbody.querySelectorAll('[data-markpaid-vid]').forEach(function(b){b.addEventListener('click',function(){markVoucherPaid(this.getAttribute('data-markpaid-vid'));});});
  tbody.querySelectorAll('[data-refund-vid]').forEach(function(b){b.addEventListener('click',function(){refundVoucher(this.getAttribute('data-refund-vid'),this.getAttribute('data-refund-code'));});});
  tbody.querySelectorAll('[data-del-vid]').forEach(function(b){b.addEventListener('click',function(){deleteVoucher(this.getAttribute('data-del-vid'));});});
}
async function markVoucherPaid(id){try{var r=await api({action:'markVoucherPaid',token:_token,voucher_id:id});if(r.success){showToast('✅ Markiert');_adminLoaded.vouchers=false;_statsData=null;_payoutData=null;loadVouchers(true);}else showToast(r.error,true);}catch(e){showToast('Fehler',true);}}
async function deleteVoucher(id){if(!confirm('Gutschein löschen?'))return;try{var r=await api({action:'deleteVoucher',token:_token,voucher_id:id});if(r.success){showToast('Gelöscht');_adminLoaded.vouchers=false;_statsData=null;_payoutData=null;loadVouchers(true);}else showToast(r.error,true);}catch(e){showToast('Fehler',true);}}
async function refundVoucher(id,code){if(!confirm('Gutschein '+(code||'')+' erstatten? Kunde wird per Email benachrichtigt.'))return;try{var r=await api({action:'refundVoucher',token:_token,voucher_id:id});if(r.success){showToast('✅ Erstattet');_adminLoaded.vouchers=false;_adminLoaded.orders=false;_statsData=null;_payoutData=null;loadVouchers(true);loadOrders(true);}else showToast(r.error,true);}catch(e){showToast('Fehler',true);}}

// =============================================
// PAYOUT TAB (NEW)
// =============================================
var _payoutData = null;
var _payoutTimeFilter = 'all';

async function loadPayout(force) {
  if (!hasSession()) { doLogout(); return; }
  if (!force && _payoutData) { renderPayout(); return; }
  try {
    var [vR, bR] = await Promise.all([
      api({action:'getVouchers',token:_token}),
      api({action:'getBars',token:_token})
    ]);
    _payoutData = {
      vouchers: (vR.success ? vR.vouchers : []) || [],
      bars: (bR.success ? bR.bars : []) || []
    };
    // Populate bar filter
    var sel = document.getElementById('payoutBarFilter');
    var currentVal = sel.value;
    sel.innerHTML = '<option value="">-- Alle Bars --</option>';
    var barIds = {};
    _payoutData.bars.forEach(function(b) { barIds[b.id] = b.name; sel.innerHTML += '<option value="'+b.id+'">'+esc(b.name)+'</option>'; });
    // Also add bars from vouchers that might not be in bars list
    _payoutData.vouchers.forEach(function(v) { if (v.bar_id && !barIds[v.bar_id]) { barIds[v.bar_id] = v.bar_name||'?'; sel.innerHTML += '<option value="'+v.bar_id+'">'+esc(v.bar_name||'?')+'</option>'; } });
    sel.value = currentVal || '';
    renderPayout();
  } catch(e) { showToast('Ladefehler',true); }
}

function renderPayout() {
  var content = document.getElementById('payoutContent');
  content.innerHTML = '';
  if (!_payoutData) return;
  var filterBar = document.getElementById('payoutBarFilter').value;
  
  // Add time filter if not exists
  var timeFilterEl = document.getElementById('payoutTimeFilter');
  if (!timeFilterEl) {
    var tf = document.createElement('div');
    tf.id = 'payoutTimeFilter';
    tf.style.cssText = 'display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap';
    [['all','Alle'],['day','Heute'],['week','Woche'],['month','Monat'],['year','Jahr']].forEach(function(f){
      var b = document.createElement('button');
      b.textContent = f[1];
      b.style.cssText = (_payoutTimeFilter===f[0]?'background:#FF3366;color:#fff;border-color:#FF3366':'background:#222;color:#ccc;border-color:#333')+';border:1px solid;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600';
      b.addEventListener('click', function() { _payoutTimeFilter=f[0]; renderPayout(); });
      tf.appendChild(b);
    });
    content.parentElement.insertBefore(tf, content);
  }
  
  var payoutCutoff = getFilterDate(_payoutTimeFilter || 'all');

  // Group vouchers by bar
  var barGroups = {};
  _payoutData.vouchers.forEach(function(v) {
    if (filterBar && String(v.bar_id) !== filterBar) return;
    if (payoutCutoff && new Date(v.created_at) < payoutCutoff) return;
    if (!barGroups[v.bar_id]) barGroups[v.bar_id] = { name: v.bar_name, vouchers: [] };
    barGroups[v.bar_id].vouchers.push(v);
  });

  var totalOwed = 0, totalPaid = 0;

  Object.keys(barGroups).forEach(function(barId) {
    var bg = barGroups[barId];
    var pending = bg.vouchers.filter(function(v) { return v.status==='redeemed' && v.payout_status==='pending'; });
    var paid = bg.vouchers.filter(function(v) { return v.payout_status==='paid'; });
    var refundable = bg.vouchers.filter(function(v) { return v.status==='sent'||v.status==='issued'; });
    var pendingAmt = 0; pending.forEach(function(v) { pendingAmt += Number(v.bar_payout||0); });
    var paidAmt = 0; paid.forEach(function(v) { paidAmt += Number(v.bar_payout||0); });
    totalOwed += pendingAmt;
    totalPaid += paidAmt;

    if (!pending.length && !refundable.length && !filterBar) return; // Skip bars with nothing to do

    var card = document.createElement('div');
    card.style.cssText = 'background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:20px;margin-bottom:16px';

    var header = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">'
      + '<div><strong style="color:#FF3366;font-size:16px">'+esc(bg.name)+'</strong>'
      + '<span style="color:#999;font-size:12px;margin-left:12px">Offen: <strong style="color:#ef4444">'+pendingAmt.toFixed(2)+' CHF</strong> | Bezahlt: <strong style="color:#3b82f6">'+paidAmt.toFixed(2)+' CHF</strong></span></div>';

    if (pending.length > 0) {
      header += '<div style="display:flex;gap:6px;align-items:center">'
        + '<label style="color:#999;font-size:11px;cursor:pointer"><input type="checkbox" class="paySelAll" data-barid="'+barId+'" style="margin-right:4px">Alle</label>'
        + '<button class="btn-sm btn-green payAllBtn" data-barid="'+barId+'" style="font-size:12px">💸 Ausgewählte auszahlen</button>'
        + '</div>';
    }
    header += '</div>';

    var table = '';
    if (pending.length > 0) {
      table += '<div style="margin-bottom:12px"><strong style="color:#f59e0b;font-size:13px">Offene Auszahlungen ('+pending.length+')</strong></div>';
      table += '<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="border-bottom:1px solid #333"><th style="width:28px"></th><th style="text-align:left;padding:6px;color:#999">Datum</th><th style="text-align:left;padding:6px;color:#999">Code</th><th style="text-align:left;padding:6px;color:#999">Deal</th><th style="text-align:left;padding:6px;color:#999">Kunde</th><th style="text-align:right;padding:6px;color:#999">Preis</th><th style="text-align:right;padding:6px;color:#999">Provision</th><th style="text-align:right;padding:6px;color:#999">Auszahlung</th></tr>';
      pending.forEach(function(v) {
        table += '<tr style="border-bottom:1px solid #222"><td style="padding:6px"><input type="checkbox" class="payCb" data-barid="'+barId+'" value="'+v.id+'" checked></td>'
          + '<td style="padding:6px;font-size:11px">'+fmtDate(v.created_at)+'</td>'
          + '<td style="padding:6px;font-family:monospace">'+esc(v.code||'-')+'</td>'
          + '<td style="padding:6px">'+esc(v.deal_title||'-')+'</td>'
          + '<td style="padding:6px">'+esc(v.buyer_name||'-')+'</td>'
          + '<td style="padding:6px;text-align:right">'+fmtChf(v.price_paid)+'</td>'
          + '<td style="padding:6px;text-align:right;color:#ef4444">'+fmtChf(v.platform_fee)+'</td>'
          + '<td style="padding:6px;text-align:right;color:#22c55e">'+fmtChf(v.bar_payout)+'</td></tr>';
      });
      table += '</table>';
    }

    if (refundable.length > 0) {
      table += '<div style="margin-top:16px;margin-bottom:8px"><strong style="color:#3b82f6;font-size:13px">Rückerstattbar ('+refundable.length+')</strong></div>';
      table += '<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="border-bottom:1px solid #333"><th style="text-align:left;padding:6px;color:#999">Datum</th><th style="text-align:left;padding:6px;color:#999">Code</th><th style="text-align:left;padding:6px;color:#999">Deal</th><th style="text-align:left;padding:6px;color:#999">Kunde</th><th style="text-align:left;padding:6px;color:#999">Email</th><th style="text-align:right;padding:6px;color:#999">Preis</th><th style="padding:6px">Aktion</th></tr>';
      refundable.forEach(function(v) {
        table += '<tr style="border-bottom:1px solid #222">'
          + '<td style="padding:6px;font-size:11px">'+fmtDate(v.created_at)+'</td>'
          + '<td style="padding:6px;font-family:monospace">'+esc(v.code||'-')+'</td>'
          + '<td style="padding:6px">'+esc(v.deal_title||'-')+'</td>'
          + '<td style="padding:6px">'+esc(v.buyer_name||'-')+'</td>'
          + '<td style="padding:6px;font-size:11px">'+esc(v.buyer_email||'-')+'</td>'
          + '<td style="padding:6px;text-align:right">'+fmtChf(v.price_paid)+'</td>'
          + '<td style="padding:6px"><button class="btn-sm btn-red refundBtn" data-vid="'+v.id+'" data-code="'+(v.code||'')+'" style="font-size:11px">↩️ Erstatten</button></td></tr>';
      });
      table += '</table>';
    }

    card.innerHTML = header + table;
    content.appendChild(card);
  });

  document.getElementById('payoutSummary').textContent = 'Gesamt offen: '+totalOwed.toFixed(2)+' CHF | Bereits bezahlt: '+totalPaid.toFixed(2)+' CHF';

  if (!content.children.length) {
    content.innerHTML = '<div class="no-data">Keine offenen Auszahlungen' + (filterBar ? ' für diese Bar' : '') + '</div>';
  }

  // Attach handlers
  content.querySelectorAll('.paySelAll').forEach(function(cb) {
    cb.addEventListener('change', function() {
      var bid = this.dataset.barid;
      content.querySelectorAll('.payCb[data-barid="'+bid+'"]').forEach(function(c) { c.checked = cb.checked; });
    });
  });
  content.querySelectorAll('.payAllBtn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var bid = this.dataset.barid;
      var ids = [];
      content.querySelectorAll('.payCb[data-barid="'+bid+'"]:checked').forEach(function(c) { ids.push(c.value); });
      if (!ids.length) { showToast('Keine Gutscheine ausgewählt', true); return; }
      payoutBar(bid, ids);
    });
  });
  content.querySelectorAll('.refundBtn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      refundVoucher(this.dataset.vid, this.dataset.code);
    });
  });
}

async function payoutBar(barId, voucherIds) {
  var msg = voucherIds.length + ' Gutscheine auszahlen? Die Bar erhält eine Quittung per Email.';
  if (!confirm(msg)) return;
  try {
    var body = { action:'payoutBar', token:_token, bar_id:barId };
    if (voucherIds) body.voucher_ids = voucherIds;
    var r = await api(body);
    if (r.success) { showToast('✅ '+r.message);_payoutData=null;_adminLoaded.vouchers=false;_statsData=null;loadPayout(true); }
    else showToast(r.error||'Fehler', true);
  } catch(e) { showToast('Fehler',true); }
}

// =============================================
// BARS
// =============================================
async function loadBars(force) {
  if (!hasSession()) { doLogout(); return; }
  if (!force && _adminLoaded.bars) { return; }
  try {
    var r = await api({action:'getBars',token:_token});
    if (!r.success) { showToast(r.error,true); return; }
    _adminLoaded.bars = true;
    renderBars(r.bars);
  } catch(e) { showToast('Ladefehler',true); }
}

function renderBars(bars) {
  var tbody = document.getElementById('barsBody');
  tbody.innerHTML = '';
  if (!bars.length) { tbody.innerHTML='<tr><td colspan="7" class="no-data">'+t('noBars')+'</td></tr>'; return; }
  bars.forEach(function(b) {
    var tr = document.createElement('tr'); tr.style.cursor='pointer';
    var statusBadge = document.createElement('span');
    statusBadge.className = 'badge '+(b.status==='active'?'b-paid':'b-pending');
    statusBadge.textContent = b.status;
    var statusTd = document.createElement('td'); statusTd.appendChild(statusBadge);
    var commTd = document.createElement('td');
    var commWrap = document.createElement('div'); commWrap.style.cssText='display:flex;align-items:center;gap:6px';
    var commInput = document.createElement('input'); commInput.type='number'; commInput.value=b.commission_rate||10; commInput.min='0'; commInput.max='100';
    commInput.style.cssText='width:60px;padding:5px 8px;background:#2a2a2a;border:1px solid #3a3a3a;border-radius:6px;color:#fff;font-size:13px';
    commInput.addEventListener('click',function(e){e.stopPropagation();});
    var commBtn = document.createElement('button'); commBtn.className='btn-sm btn-blue'; commBtn.textContent=t('commissionSave');
    commBtn.addEventListener('click',function(e){e.stopPropagation();updateCommission(b.id,commInput.value);});
    commWrap.append(commInput,commBtn); commTd.appendChild(commWrap);
    var actionTd = document.createElement('td');
    if (b.status!=='active') {
      var btnA=document.createElement('button');btnA.className='btn-sm btn-green';btnA.textContent=t('activate');
      btnA.addEventListener('click',function(e){e.stopPropagation();updateBarStatus(b.id,'active');});actionTd.appendChild(btnA);
    } else {
      var btnD=document.createElement('button');btnD.className='btn-sm btn-red';btnD.textContent=t('deactivate');
      btnD.addEventListener('click',function(e){e.stopPropagation();updateBarStatus(b.id,'inactive');});actionTd.appendChild(btnD);
    }
    var btnDel=document.createElement('button');btnDel.className='btn-sm btn-red';btnDel.style.marginLeft='6px';btnDel.textContent=t('delete');
    btnDel.addEventListener('click',function(e){e.stopPropagation();deleteBar(b.id,b.name);});actionTd.appendChild(btnDel);
    tr.append(td(b.name),td(b.city),td(b.email),statusTd,td(b.deals_count||0),commTd,actionTd);
    tbody.appendChild(tr);
    // Detail row
    var detailTr=document.createElement('tr');detailTr.style.display='none';
    var detailTd=document.createElement('td');detailTd.colSpan=7;
    detailTd.style.cssText='padding:16px;background:#111;border-top:none';
    detailTd.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:13px"><div><strong style="color:#FF3366">Details</strong><p style="margin:6px 0;color:#ccc">Adresse: '+(b.address||'-')+', '+(b.zip||'')+' '+(b.city||'')+'</p><p style="margin:6px 0;color:#ccc">Tel: '+(b.phone||'-')+'</p><p style="margin:6px 0;color:#ccc">IBAN: <strong>'+(b.iban||'-')+'</strong></p><p style="margin:6px 0;color:#ccc">Twint: '+(b.twint||'-')+'</p></div><div id="barStats_'+b.id+'"><strong style="color:#FF3366">Laden...</strong></div></div>';
    detailTr.appendChild(detailTd);tbody.appendChild(detailTr);
    tr.addEventListener('click',function(){var vis=detailTr.style.display!=='none';detailTr.style.display=vis?'none':'table-row';if(!vis)loadBarMiniStats(b.id);});
  });
}

async function loadBarMiniStats(barId) {
  var el=document.getElementById('barStats_'+barId); if(!el)return;
  el.innerHTML='<p style="color:#999">Laden...</p>';
  try {
    var r=await api({action:'getBarVouchers',token:_token,bar_id:barId});
    var vouchers=(r.success&&r.vouchers)?r.vouchers:[];
    var sold=vouchers.length,redeemed=0,pending=0,paid=0;
    vouchers.forEach(function(v){if(v.status==='redeemed')redeemed++;if(v.status==='redeemed'&&v.payout_status==='pending')pending+=Number(v.bar_payout||0);if(v.payout_status==='paid')paid+=Number(v.bar_payout||0);});
    el.innerHTML='<strong style="color:#FF3366">Statistik</strong><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px"><div style="background:#1a1a1a;padding:8px;border-radius:6px"><div style="color:#999;font-size:10px">Verkauft</div><div style="font-size:16px;font-weight:700">'+sold+'</div></div><div style="background:#1a1a1a;padding:8px;border-radius:6px"><div style="color:#999;font-size:10px">Eingelöst</div><div style="color:#22c55e;font-size:16px;font-weight:700">'+redeemed+'</div></div><div style="background:#1a1a1a;padding:8px;border-radius:6px"><div style="color:#999;font-size:10px">Offen</div><div style="color:#f59e0b;font-size:16px;font-weight:700">'+(sold-redeemed)+'</div></div></div><div style="margin-top:6px;font-size:12px;color:#ccc">Schuld: <strong style="color:#ef4444">'+pending.toFixed(2)+' CHF</strong> | Bezahlt: <strong style="color:#3b82f6">'+paid.toFixed(2)+' CHF</strong></div>';
  } catch(e){el.innerHTML='<p style="color:#ef4444">Fehler</p>';}
}

async function updateCommission(barId,rate){try{var r=await api({action:'updateBarCommission',token:_token,bar_id:barId,commission_rate:rate});if(r.success)showToast('✅ Provision gespeichert');else showToast(r.error,true);}catch(e){showToast('Fehler',true);}}
async function updateBarStatus(barId,status){try{var r=await api({action:'updateBarStatus',token:_token,bar_id:barId,status:status});if(r.success){showToast('✅ Status geändert');if(status==='active'){try{await api({action:'sendBarActivationEmail',token:_token,bar_id:barId});}catch(e){}}_adminLoaded.bars=false;loadBars(true);}else showToast(r.error,true);}catch(e){showToast('Fehler',true);}}
async function deleteBar(barId,name){if(!confirm('Bar "'+name+'" löschen?'))return;try{var r=await api({action:'deleteBar',token:_token,bar_id:barId});if(r.success){showToast('✅ Gelöscht');_adminLoaded.bars=false;loadBars(true);}else showToast(r.error,true);}catch(e){showToast('Fehler',true);}}

// =============================================
// DEALS
// =============================================
var _allDealsAdmin = [];
async function loadDeals(force){if(!hasSession()){doLogout();return;}if(!force&&_adminLoaded.deals&&_allDealsAdmin.length>0){renderDeals(_allDealsAdmin);return;}try{var r=await api({action:'getAdminDeals',token:_token});if(!r.success){showToast(r.error,true);return;}_allDealsAdmin=r.deals||[];_adminLoaded.deals=true;renderDeals(_allDealsAdmin);}catch(e){showToast('Ladefehler',true);}}
function renderDeals(deals){
  var tbody=document.getElementById('dealsBody');tbody.innerHTML='';
  if(!deals.length){tbody.innerHTML='<tr><td colspan="6" class="no-data">'+t('noDeals')+'</td></tr>';return;}
  deals.forEach(function(d){
    var tr=document.createElement('tr');
    var stBadge=document.createElement('span');stBadge.className='badge '+(d.active?'b-paid':'b-inactive');stBadge.textContent=d.active?'Aktiv':'Inaktiv';
    var stTd=document.createElement('td');stTd.appendChild(stBadge);
    var aTd=document.createElement('td');aTd.style.cssText='display:flex;gap:4px;flex-wrap:wrap';
    var btnT=document.createElement('button');btnT.className='btn-sm '+(d.active?'btn-orange':'btn-green');btnT.textContent=d.active?t('deactivateDeal'):t('activateDeal');
    btnT.addEventListener('click',function(){adminToggleDeal(d.id,!d.active);});aTd.appendChild(btnT);
    var btnD=document.createElement('button');btnD.className='btn-sm btn-red';btnD.textContent=t('delete');
    btnD.addEventListener('click',function(){adminDeleteDeal(d.id,d.title);});aTd.appendChild(btnD);
    tr.append(td(d.bar_name),td(d.title),td(fmtChf(d.deal_price)+' CHF'),td(d.sold_count||0),stTd,aTd);
    tbody.appendChild(tr);
  });
}
async function adminDeleteDeal(id,title){if(!confirm('Deal "'+(title||'')+'" löschen?'))return;try{var r=await api({action:'adminDeleteDeal',token:_token,deal_id:id});if(r.success){showToast('Gelöscht');_adminLoaded.deals=false;_statsData=null;loadDeals(true);}else showToast(r.error,true);}catch(e){showToast('Fehler',true);}}
async function adminToggleDeal(id,active){try{var r=await api({action:'updateDealStatus',token:_token,deal_id:id,active:active});if(r.success){showToast(active?'✅ Aktiviert':'⏸ Deaktiviert');_adminLoaded.deals=false;_statsData=null;loadDeals(true);}else showToast(r.error,true);}catch(e){showToast('Fehler',true);}}

// =============================================
// STATS (with per-bar filter + detail table)
// =============================================
var _statsFilter='all', _statsData=null, _statsBarId='';

async function loadStats(force) {
  if (!hasSession()) { doLogout(); return; }
  if (!force && _statsData) { renderStats(_statsFilter); return; }
  try {
    var [vR,oR,bR,dR] = await Promise.all([
      api({action:'getVouchers',token:_token}),
      api({action:'getOrders',token:_token}),
      api({action:'getBars',token:_token}),
      api({action:'getAdminDeals',token:_token})
    ]);
    _statsData = {
      vouchers:(vR.success?vR.vouchers:[])||[],
      orders:(oR.success?oR.orders:[])||[],
      bars:(bR.success?bR.bars:[])||[],
      deals:(dR.success?dR.deals:[])||[]
    };
    try{_statsData.customerCount=(await api({action:'getCustomers',token:_token})).customers.length;}catch(e){_statsData.customerCount=0;}
    // Populate bar filter
    var sel=document.getElementById('statsBarFilter');
    var cv=sel.value;
    sel.innerHTML='<option value="">-- Alle Bars (Global) --</option>';
    _statsData.bars.forEach(function(b){sel.innerHTML+='<option value="'+b.id+'">'+esc(b.name)+'</option>';});
    sel.value=cv||'';
    _statsBarId=sel.value;
    renderStats(_statsFilter);
  } catch(e){showToast('Ladefehler',true);}
}

function setStatsFilter(period){
  _statsFilter=period;
  highlightStatsFilterBtn(period);
  if(_statsData) renderStats(period);
}

function ensureStatsFilterBar() {
  var bar = document.getElementById('statsFilterBar');
  if (!bar || bar.children.length > 0) return;
  var wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;align-items:center';
  [['day','Heute'],['week','Woche'],['month','Monat'],['year','Jahr'],['all','Alle']].forEach(function(f) {
    var btn = document.createElement('button');
    btn.className = 'stats-filter-btn';
    btn.dataset.period = f[0];
    btn.textContent = f[1];
    btn.style.cssText = 'background:#222;color:#ccc;border:1px solid #333;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600';
    btn.addEventListener('click', function() { setStatsFilter(f[0]); });
    wrap.appendChild(btn);
  });
  var fromInp = document.createElement('input'); fromInp.type='date'; fromInp.id='sfFrom';
  fromInp.style.cssText = 'background:#222;color:#ccc;border:1px solid #333;padding:5px 10px;border-radius:6px;font-size:12px';
  wrap.appendChild(fromInp);
  var span = document.createElement('span'); span.textContent='bis'; span.style.cssText='color:#666;font-size:12px';
  wrap.appendChild(span);
  var toInp = document.createElement('input'); toInp.type='date'; toInp.id='sfTo';
  toInp.style.cssText = 'background:#222;color:#ccc;border:1px solid #333;padding:5px 10px;border-radius:6px;font-size:12px';
  wrap.appendChild(toInp);
  var applyBtn = document.createElement('button'); applyBtn.textContent='Anwenden';
  applyBtn.style.cssText = 'background:#FF3366;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600';
  applyBtn.addEventListener('click', setStatsCustomRange);
  wrap.appendChild(applyBtn);
  bar.appendChild(wrap);
}

function highlightStatsFilterBtn(period) {
  document.querySelectorAll('.stats-filter-btn').forEach(function(b) {
    if (b.dataset.period === period) { b.style.background='#FF3366'; b.style.color='#fff'; b.style.borderColor='#FF3366'; }
    else { b.style.background='#222'; b.style.color='#ccc'; b.style.borderColor='#333'; }
  });
}

function renderStats(period) {
  ensureStatsFilterBar();
  highlightStatsFilterBtn(period);
  var container=document.getElementById('statsGrid');
  container.innerHTML='';
  var detailEl=document.getElementById('statsBarDetail');
  detailEl.innerHTML='';
  var barId=_statsBarId;

  var cutoff=getFilterDate(period);
  var d=_statsData;

  // Filter by bar if selected
  var filtV=d.vouchers;
  var filtO=d.orders;
  if(barId){
    filtV=filtV.filter(function(v){return String(v.bar_id)===barId;});
    filtO=filtO.filter(function(o){return String(o.bar_id)===barId;});
  }
  // Filter by date
  var dateTo=getFilterDateTo(period);
  if(cutoff){
    filtV=filtV.filter(function(v){var d=new Date(v.created_at);return d>=cutoff&&(!dateTo||d<=dateTo);});
    filtO=filtO.filter(function(o){var d=new Date(o.created_at);return d>=cutoff&&(!dateTo||d<=dateTo);});
  }

  var totalRevenue=0,totalFees=0,totalStripeFees=0,totalPlatformNet=0,pendingPayout=0,totalPaidOut=0,redeemed=0,notRedeemed=0,refunded=0;
  filtV.forEach(function(v){
    totalRevenue+=Number(v.price_paid)||0;
    totalFees+=Number(v.platform_fee)||0;
    if(v.status==='redeemed'){redeemed++;if(v.payout_status==='pending')pendingPayout+=Number(v.bar_payout)||0;}
    else if(v.status==='refunded'){refunded++;}
    else{notRedeemed++;}
    if(v.payout_status==='paid')totalPaidOut+=Number(v.bar_payout)||0;
  });
  var paidOrders=0,totalRefunds=0;
  filtO.forEach(function(o){
    var fin = getOrderFinancials(o, barId);
    if (!fin.included) return;
    if(o.status==='paid'){
      paidOrders++;
      totalStripeFees += Number(fin.stripeFee)||0;
      totalPlatformNet += Number(fin.platformNet)||0;
    }
    if(o.refund_status==='completed') totalRefunds+=Number(o.price)||0;
  });
  var activeBars=0;d.bars.forEach(function(b){if(b.status==='active')activeBars++;});
  var activeDeals=barId?d.deals.filter(function(dl){return String(dl.bar_id)===barId&&dl.active;}).length:d.deals.filter(function(dl){return dl.active;}).length;

  var grid=document.createElement('div');grid.className='stats-grid';
  var stats=[
    ['Gutscheine vermittelt',filtV.length,'all_vouchers'],
    ['Bestellungen',filtO.filter(function(o){ return getOrderFinancials(o, barId).included; }).length,'all_orders'],
    ['Bezahlt',paidOrders,'paid_orders'],
    ['Verkaufsvolumen',fmtChf(totalRevenue)+' CHF','gross_sales'],
    ['Provision brutto',fmtChf(totalFees)+' CHF','gross_commission'],
    ['Stripe-Gebühren',fmtChf(totalStripeFees)+' CHF','stripe_fees'],
    ['Provision netto',fmtChf(totalPlatformNet)+' CHF','platform_net'],
    ['Schuld an Bars',fmtChf(pendingPayout)+' CHF','pending_payout'],
    ['Ausgezahlt',fmtChf(totalPaidOut)+' CHF','paid_out'],
    ['Eingelöst',redeemed,'redeemed'],
    ['Nicht eingelöst',notRedeemed,'not_redeemed'],
    ['Rückerstattet',refunded,'refunded'],
    ['Aktive Deals',activeDeals,'active_deals'],
  ];
  if(!barId){
    stats.push(['Aktive Bars',activeBars]);
    stats.push(['Kund:innen',d.customerCount||0]);
    stats.push(['Rückerstattungen',fmtChf(totalRefunds)+' CHF']);
  }
  stats.forEach(function(s){
    var card=document.createElement('div');card.className='stat-card';
    card.style.cursor='pointer';
    card.addEventListener('click',function(){ showStatDetail(s[0],s[2]||null); });
    var lEl=document.createElement('div');lEl.className='stat-label';lEl.textContent=s[0];
    var vEl=document.createElement('div');vEl.className='stat-value';vEl.textContent=String(s[1]);
    card.append(lEl,vEl);grid.appendChild(card);
  });
  container.appendChild(grid);

  // Per-bar detail table when a bar is selected
  if(barId && filtV.length > 0){
    var html='<div class="section-title" style="margin-top:20px">Gutscheine Detail</div>';
    html+='<div class="overflow-x"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr><th>Datum</th><th>Code</th><th>Deal</th><th>Kunde</th><th>Preis</th><th>Provision</th><th>Auszahlung</th><th>Status</th><th>Auszahl.</th></tr></thead><tbody>';
    filtV.forEach(function(v){
      var sc=v.status==='redeemed'?'#22c55e':v.status==='refunded'?'#ef4444':'#f59e0b';
      var st=v.status==='redeemed'?'Eingelöst':v.status==='refunded'?'Erstattet':'Offen';
      var pc=v.payout_status==='paid'?'#3b82f6':'#ef4444';
      var pt=v.payout_status==='paid'?'Bezahlt':'Ausstehend';
      html+='<tr><td style="font-size:11px">'+fmtDate(v.created_at)+'</td><td style="font-family:monospace">'+esc(v.code||'-')+'</td><td>'+esc(v.deal_title||'-')+'</td><td>'+esc(v.buyer_name||'-')+'</td><td style="text-align:right">'+fmtChf(v.price_paid)+'</td><td style="text-align:right;color:#ef4444">'+fmtChf(v.platform_fee)+'</td><td style="text-align:right;color:#22c55e">'+fmtChf(v.bar_payout)+'</td><td><span style="color:'+sc+';font-weight:600">'+st+'</span></td><td><span style="color:'+pc+';font-weight:600">'+pt+'</span></td></tr>';
    });
    // Sum row
    var sP=0,sF=0,sA=0;
    filtV.forEach(function(v2){sP+=Number(v2.price_paid||0);sF+=Number(v2.platform_fee||0);sA+=Number(v2.bar_payout||0);});
    html+='<tr style="border-top:2px solid #FF3366;font-weight:700"><td colspan="4" style="color:#FF3366">'+filtV.length+' Gutscheine</td><td style="text-align:right">'+sP.toFixed(2)+'</td><td style="text-align:right;color:#ef4444">'+sF.toFixed(2)+'</td><td style="text-align:right;color:#22c55e">'+sA.toFixed(2)+'</td><td colspan="2"></td></tr>';
    html+='</tbody></table></div>';
    detailEl.innerHTML=html;
  }
}

// =============================================
// CUSTOMERS
// =============================================
var _allCustomers=[];
async function loadCustomers(force){if(!hasSession()){doLogout();return;}if(!force&&_adminLoaded.customers&&_allCustomers.length>0){renderCustomers(_allCustomers);return;}try{var r=await api({action:'getCustomers',token:_token});if(!r.success){showToast(r.error,true);return;}_allCustomers=r.customers||[];_adminLoaded.customers=true;renderCustomers(_allCustomers);}catch(e){showToast('Ladefehler',true);}}
function renderCustomers(customers){var tbody=document.getElementById('customersBody');tbody.innerHTML='';if(!customers.length){tbody.innerHTML='<tr><td colspan="3" class="no-data">Keine Kund:innen</td></tr>';return;}customers.forEach(function(c){var tr=document.createElement('tr');var d=c.created_at?new Date(c.created_at):null;tr.append(td(c.name||'-'),td(c.email),td(d?d.toLocaleDateString('de-CH'):'-'));tbody.appendChild(tr);});}

// =============================================
// API / TOAST
// =============================================
async function api(body) { var r = await fetch(BACKEND_URL, { method:'POST', body:JSON.stringify(body) }); return r.json(); }
let _toastTimer=null;
function showToast(msg,isError){var el=document.getElementById('toast');el.textContent=msg;el.className='toast show '+(isError?'toast-err':'toast-ok');clearTimeout(_toastTimer);_toastTimer=setTimeout(function(){el.classList.remove('show');},3500);}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', function() {
  var _loginBtn = document.getElementById('btnLogin'); _loginBtn.addEventListener('click', function() { if (_loginBtn.disabled) return; doAdminLogin(); });
  document.getElementById('adminPass').addEventListener('keydown', function(e) { if (e.key==='Enter') doAdminLogin(); });
  document.getElementById('btnLogout').addEventListener('click', doLogout);
  document.querySelectorAll('[data-tab]').forEach(function(btn) {
    btn.addEventListener('click', function() { switchTab(this.dataset.tab, this); });
  });
  document.getElementById('langDE').addEventListener('click', function(){setLang('de');});
  document.getElementById('langEN').addEventListener('click', function(){setLang('en');});
  document.getElementById('langIT').addEventListener('click', function(){setLang('it');});
  document.getElementById('langFR').addEventListener('click', function(){setLang('fr');});
  // Payout bar filter
  document.getElementById('payoutBarFilter').addEventListener('change', function() { renderPayout(); });
  // Stats bar filter
  document.getElementById('statsBarFilter').addEventListener('change', function() { _statsBarId=this.value; if(_statsData) renderStats(_statsFilter); });
  // Customer search
  var cs=document.getElementById('customerSearch');
  if(cs) cs.addEventListener('input',function(){var q=this.value.toLowerCase();renderCustomers(_allCustomers.filter(function(c){return(c.name||'').toLowerCase().includes(q)||(c.email||'').toLowerCase().includes(q);}));});
});


// Clickable stat card detail
function showStatDetail(label, filterKey) {
  if (!_statsData || !filterKey) return;
  var detailEl=document.getElementById('statsBarDetail');
  if (!detailEl) return;
  var barId=_statsBarId;
  var cutoff=getFilterDate(_statsFilter);
  var dateTo=getFilterDateTo(_statsFilter);
  var filtV=_statsData.vouchers;
  var filtO=_statsData.orders;
  if(barId){filtV=filtV.filter(function(v){return String(v.bar_id)===barId;});filtO=filtO.filter(function(o){return String(o.bar_id)===barId;});}
  if(cutoff){filtV=filtV.filter(function(v){var d=new Date(v.created_at);return d>=cutoff&&(!dateTo||d<=dateTo);});filtO=filtO.filter(function(o){var d=new Date(o.created_at);return d>=cutoff&&(!dateTo||d<=dateTo);});}
  
  var items=[];
  if(filterKey==='redeemed') items=filtV.filter(function(v){return v.status==='redeemed';});
  else if(filterKey==='not_redeemed') items=filtV.filter(function(v){return v.status!=='redeemed'&&v.status!=='refunded';});
  else if(filterKey==='refunded') items=filtV.filter(function(v){return v.status==='refunded';});
  else if(filterKey==='pending_payout') items=filtV.filter(function(v){return v.status==='redeemed'&&v.payout_status==='pending';});
  else if(filterKey==='paid_out') items=filtV.filter(function(v){return v.payout_status==='paid';});
  else if(filterKey==='all_vouchers') items=filtV;
  else if(filterKey==='all_orders') { renderStatOrderDetail(detailEl,label,filtO.filter(function(o){ return getOrderFinancials(o, barId).included; }), barId); return; }
  else if(filterKey==='paid_orders') { renderStatOrderDetail(detailEl,label,filtO.filter(function(o){ return o.status==='paid' && getOrderFinancials(o, barId).included; }), barId); return; }
  else if(filterKey==='gross_sales') { renderStatOrderDetail(detailEl,label,filtO.filter(function(o){ var fin=getOrderFinancials(o, barId); return o.status==='paid' && fin.included && fin.sales>0; }), barId); return; }
  else if(filterKey==='gross_commission') { renderStatOrderDetail(detailEl,label,filtO.filter(function(o){ var fin=getOrderFinancials(o, barId); return o.status==='paid' && fin.included && fin.grossCommission>0; }), barId); return; }
  else if(filterKey==='stripe_fees') { renderStatOrderDetail(detailEl,label,filtO.filter(function(o){ var fin=getOrderFinancials(o, barId); return o.status==='paid' && fin.included && fin.stripeFee>0; }), barId); return; }
  else if(filterKey==='platform_net') { renderStatOrderDetail(detailEl,label,filtO.filter(function(o){ var fin=getOrderFinancials(o, barId); return o.status==='paid' && fin.included && (fin.grossCommission>0 || fin.stripeFee>0); }), barId); return; }
  else { detailEl.innerHTML=''; return; }
  
  var html='<div class="section-title" style="margin-top:20px">'+esc(label)+' ('+items.length+')</div>';
  if(!items.length){html+='<div class="no-data">Keine Daten</div>';detailEl.innerHTML=html;return;}
  html+='<div class="overflow-x"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr><th>Datum</th><th>Code</th><th>Deal</th><th>Bar</th><th>Kunde</th><th>Email</th><th>Preis</th><th>Status</th><th>Auszahl.</th></tr></thead><tbody>';
  items.forEach(function(v){
    html+='<tr><td style="font-size:11px">'+fmtDate(v.created_at)+'</td><td style="font-family:monospace">'+esc(v.code||'-')+'</td><td>'+esc(v.deal_title||'-')+'</td><td>'+esc(v.bar_name||'-')+'</td><td>'+esc(v.buyer_name||'-')+'</td><td style="font-size:11px">'+esc(v.buyer_email||'-')+'</td><td style="text-align:right">'+fmtChf(v.price_paid)+'</td><td>'+esc(v.status||'-')+'</td><td>'+esc(v.payout_status||'-')+'</td></tr>';
  });
  html+='</tbody></table></div>';
  detailEl.innerHTML=html;
}

function renderStatOrderDetail(el,label,orders,barId){
  var html='<div class="section-title" style="margin-top:20px">'+esc(label)+' ('+orders.length+')</div>';
  if(!orders.length){html+='<div class="no-data">Keine Daten</div>';el.innerHTML=html;return;}
  html+='<div class="overflow-x"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr><th>Datum</th><th>Deal</th><th>Bar</th><th>Käufer</th><th>Email</th><th>Verkauf</th><th>Provision brutto</th><th>Stripe-Gebühr</th><th>Provision netto</th><th>Status</th><th>Rückerstattung</th></tr></thead><tbody>';
  var totalSales=0,totalCommission=0,totalStripe=0,totalNet=0;
  orders.forEach(function(o){
    var fin = getOrderFinancials(o, barId);
    totalSales += Number(fin.sales||0);
    totalCommission += Number(fin.grossCommission||0);
    totalStripe += Number(fin.stripeFee||0);
    totalNet += Number(fin.platformNet||0);
    html+='<tr><td style="font-size:11px">'+fmtDate(o.created_at)+'</td><td>'+esc(o.deal_title||'-')+'</td><td>'+esc(o.bar_name||'-')+'</td><td>'+esc(o.buyer_name||'-')+'</td><td style="font-size:11px">'+esc(o.buyer_email||'-')+'</td><td style="text-align:right">'+fmtChf(fin.sales)+'</td><td style="text-align:right;color:#f59e0b">'+fmtChf(fin.grossCommission)+'</td><td style="text-align:right;color:#ef4444">'+fmtChf(fin.stripeFee)+'</td><td style="text-align:right;color:#22c55e">'+fmtChf(fin.platformNet)+'</td><td>'+esc(o.status||'-')+'</td><td>'+esc(o.refund_status||'-')+'</td></tr>';
  });
  html+='<tr style="border-top:2px solid #FF3366;font-weight:700"><td colspan="5" style="color:#FF3366">'+orders.length+' Bestellungen</td><td style="text-align:right">'+fmtChf(totalSales)+'</td><td style="text-align:right;color:#f59e0b">'+fmtChf(totalCommission)+'</td><td style="text-align:right;color:#ef4444">'+fmtChf(totalStripe)+'</td><td style="text-align:right;color:#22c55e">'+fmtChf(totalNet)+'</td><td colspan="2"></td></tr>';
  html+='</tbody></table></div>';
  el.innerHTML=html;
}

function setStatsCustomRange() {
  var from=document.getElementById('sfFrom');
  var to=document.getElementById('sfTo');
  if(!from||!to||!from.value) { showToast('Bitte Von-Datum wählen', true); return; }
  _statsFilter='custom';
  _customFrom=from.value;
  _customTo=to.value||new Date().toISOString().split('T')[0];
  highlightStatsFilterBtn('custom');
  if(_statsData) renderStats('custom');
}
var _customFrom='',_customTo='';


// =============================================
// FINAL PATCH: refund-aware admin metrics
// =============================================
(function(){
  function isRefundedVoucher_(v) { return String(v && v.status || '').toLowerCase() === 'refunded'; }
  var _origGetOrderFinancialsFinal = getOrderFinancials;
  getOrderFinancials = function(order, barId) {
    var fin = _origGetOrderFinancialsFinal(order, barId);
    var vouchers = order && order._vouchers ? order._vouchers : [];
    var relevant = barId ? vouchers.filter(function(v){ return String(v.bar_id) === String(barId); }) : vouchers.slice();
    if (!relevant.length) return fin;
    var sales = 0, gross = 0, payout = 0;
    relevant.forEach(function(v){ if (isRefundedVoucher_(v)) return; sales += Number(v.price_paid || 0); gross += Number(v.platform_fee || 0); payout += Number(v.bar_payout || 0); });
    var stripeFee = Number(order && order.stripe_fee || 0);
    var globalOriginalSales = 0; vouchers.forEach(function(v){ globalOriginalSales += Number(v.price_paid || 0); });
    var orderTotal = Number(order && order.price || 0) || globalOriginalSales;
    var allocatedStripe = barId ? ((orderTotal > 0) ? stripeFee * ((sales > 0 ? sales : 0) / orderTotal) : 0) : stripeFee;
    return { included: fin.included, sales: sales, grossCommission: gross, stripeFee: allocatedStripe, platformNet: gross - allocatedStripe, barPayout: payout };
  };
  var _origLoadOrdersFinal = loadOrders;
  loadOrders = async function(force) { await _origLoadOrdersFinal(force); _ordersData = (_ordersData || []).map(function(o){ var fin = getOrderFinancials(o); o._grossCommission = fin.grossCommission; o._stripeFee = fin.stripeFee; o._platformNet = fin.platformNet; return o; }); };
})();


// =============================================
// FINAL PATCH 2: admin refund status rendering
// =============================================
(function(){
  var _origRenderOrdersFinal2 = renderOrders;
  renderOrders = function() {
    _origRenderOrdersFinal2();
    var tbody = document.getElementById('ordersBody');
    if (!tbody) return;
    Array.prototype.forEach.call(tbody.querySelectorAll('tr'), function(tr){
      if (tr.children.length < 13) return;
      var refundCell = tr.children[11];
      var actionCell = tr.children[12];
      var txt = (refundCell.textContent || '').trim();
      if (txt === 'partial_requested') refundCell.innerHTML = '<span style="color:#FFC107">⚠️ Teilweise angefordert</span>';
      if (txt === 'partial_completed') refundCell.innerHTML = '<span style="color:#4CAF50">↩️ Teilweise erstattet</span>';
      if (txt === 'requested' && actionCell && !actionCell.querySelector('[data-refund-oid]')) {
        var delBtn = actionCell.querySelector('[data-del-oid]');
        var oid = delBtn ? delBtn.getAttribute('data-del-oid') : '';
        if (oid) {
          var btn=document.createElement('button');
          btn.className='btn-sm btn-red'; btn.textContent='Erstatten'; btn.setAttribute('data-refund-oid',oid);
          btn.addEventListener('click', function(){ processRefund(oid); });
          actionCell.insertBefore(btn, actionCell.firstChild);
          actionCell.insertBefore(document.createTextNode(' '), btn.nextSibling);
        }
      }
    });
  };

  renderVouchers = function() {
    var data = _vouchersData.slice();
    Object.keys(_voucherFilters).forEach(function(k){
      var q=String(_voucherFilters[k]||'').toLowerCase(); if(!q) return;
      data=data.filter(function(v){ var val=''; if(k==='date') val=fmtDate(v.created_at); else if(k==='code') val=v.code||''; else if(k==='deal') val=v.deal_title||''; else if(k==='bar') val=v.bar_name||''; else if(k==='buyer') val=v.buyer_name||''; else if(k==='buyer_email') val=v.buyer_email||''; else if(k==='price') val=fmtChf(v.price_paid); else if(k==='fee') val=fmtChf(v.platform_fee); else if(k==='payout') val=fmtChf(v.bar_payout); else if(k==='status') val=v.status||''; else if(k==='pay_status') val=v.payout_status||''; return String(val).toLowerCase().indexOf(q)!==-1; });
    });
    var tbody = document.getElementById('vouchersBody'); tbody.innerHTML='';
    var ftr=document.createElement('tr'); ftr.style.background='#1a1a1a';
    ['date','code','deal','bar','buyer','buyer_email','price','fee','payout','status','pay_status',''].forEach(function(k){ var ftd=document.createElement('td');ftd.style.padding='4px'; if(k){var inp=document.createElement('input');inp.type='text';inp.placeholder='🔍';inp.value=_voucherFilters[k]||'';inp.style.cssText='width:100%;background:#222;color:#ccc;border:1px solid #444;padding:3px 6px;font-size:11px;border-radius:4px;box-sizing:border-box';inp.addEventListener('input',function(){_voucherFilters[k]=this.value;renderVouchers();});ftd.appendChild(inp);} ftr.appendChild(ftd); });
    tbody.appendChild(ftr);
    if(!data.length){tbody.innerHTML+='<tr><td colspan="12" class="no-data">Keine Gutscheine</td></tr>';return;}
    var tP=0,tF=0,tA=0;
    data.forEach(function(v){
      var refunded = String(v.status||'').toLowerCase()==='refunded';
      if (!refunded) { tP+=Number(v.price_paid||0); tF+=Number(v.platform_fee||0); tA+=Number(v.bar_payout||0); }
      var statusKey = String(v.status||'').toLowerCase();
      var stBadge = statusKey==='redeemed' ? '<span class="badge b-paid">✓ Eingelöst</span>' : statusKey==='refund_requested' ? '<span class="badge" style="background:#f59e0b;color:#111">Refund beantragt</span>' : statusKey==='refunded' ? '<span class="badge" style="background:#EF4444;color:#fff">Erstattet</span>' : '<span class="badge b-active">'+esc(v.status||'-')+'</span>';
      var payBadge = v.payout_status==='paid' ? '<span style="color:#3b82f6;font-weight:600">Bezahlt</span>' : '<span style="color:#ef4444">Ausstehend</span>';
      var aHtml='';
      if(v.payout_status==='pending'&&statusKey==='redeemed') aHtml+='<button class="btn-sm btn-blue" style="font-size:10px" data-markpaid-vid="'+v.id+'">💸</button> ';
      if(statusKey==='refund_requested') aHtml+='<button class="btn-sm btn-red" style="font-size:10px" data-refund-vid="'+v.id+'" data-refund-code="'+(v.code||'')+'">↩️</button> ';
      aHtml+='<button class="btn-sm" style="background:#333;color:#999;font-size:10px" data-del-vid="'+v.id+'">🗑</button>';
      var tr=document.createElement('tr');
      tr.innerHTML='<td style="font-size:11px">'+fmtDate(v.created_at)+'</td><td style="font-family:monospace;font-size:11px">'+esc(v.code||'-')+'</td><td>'+esc(v.deal_title||'-')+'</td><td>'+esc(v.bar_name||'-')+'</td><td>'+esc(v.buyer_name||'-')+'</td><td style="font-size:11px">'+esc(v.buyer_email||'-')+'</td><td style="text-align:right">'+fmtChf(refunded ? 0 : v.price_paid)+'</td><td style="text-align:right;color:#ef4444">'+fmtChf(refunded ? 0 : v.platform_fee)+'</td><td style="text-align:right;color:#22c55e">'+fmtChf(refunded ? 0 : v.bar_payout)+'</td><td>'+stBadge+'</td><td>'+payBadge+'</td><td>'+aHtml+'</td>';
      tbody.appendChild(tr);
    });
    var sumTr=document.createElement('tr'); sumTr.style.cssText='background:#1a1a1a;font-weight:700;border-top:2px solid #FF3366';
    sumTr.innerHTML='<td colspan="6" style="padding:8px;color:#FF3366">'+data.length+' Gutscheine</td><td style="text-align:right;padding:8px">'+tP.toFixed(2)+'</td><td style="text-align:right;padding:8px;color:#ef4444">'+tF.toFixed(2)+'</td><td style="text-align:right;padding:8px;color:#22c55e">'+tA.toFixed(2)+'</td><td colspan="3"></td>';
    tbody.appendChild(sumTr);
    tbody.querySelectorAll('[data-markpaid-vid]').forEach(function(b){b.addEventListener('click',function(){markVoucherPaid(this.getAttribute('data-markpaid-vid'));});});
    tbody.querySelectorAll('[data-refund-vid]').forEach(function(b){b.addEventListener('click',function(){refundVoucher(this.getAttribute('data-refund-vid'),this.getAttribute('data-refund-code'));});});
    tbody.querySelectorAll('[data-del-vid]').forEach(function(b){b.addEventListener('click',function(){deleteVoucher(this.getAttribute('data-del-vid'));});});
  };
})();
