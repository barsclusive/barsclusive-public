// =============================================
// CONFIGURATION
// =============================================
const BACKEND_URL  = 'https://script.google.com/macros/s/AKfycbztRaubL2hd-Z9yE2M-_Pc_BBn9u5p0xOalAZyMm13uc2wNN1WMZ2gZKYos87otUCN-gw/exec';
const WA_NUMBER    = '41765924391';

// No API key: a key in frontend JS is public and provides no auth.

// =============================================
// SESSION — in-memory only
// Rationale: sessionStorage/localStorage are readable by any JS on the page
// (XSS). In-memory variable is cleared on tab close, limits exposure window.
// Tradeoff: user must re-login on page refresh. TTL = 90 min matches backend.
// =============================================
let _session = null; // { token, name, email, role, expiresAt }

function sessionSet(token, name, email, role) {
  _session = {
    token,
    name,
    email,
    role,
    expiresAt: Date.now() + 90 * 60 * 1000
  };
  document.getElementById('userBtn').textContent = '👤 ' + escHtml(name);
  document.getElementById('btnOrders').style.display = 'block';
}

function sessionGet() {
  if (!_session) return null;
  if (Date.now() > _session.expiresAt) { sessionClear(); return null; }
  return _session;
}

function sessionClear() {
  _session = null;
  document.getElementById('userBtn').textContent = '👤 Login';
  document.getElementById('btnOrders').style.display = 'none';
  document.getElementById('userDropdown').classList.remove('show');
}

// =============================================
// XSS — escape all untrusted data before DOM insertion
// =============================================
function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Safe element text setter
function setText(el, val) {
  if (typeof el === 'string') el = document.getElementById(el);
  if (el) el.textContent = String(val ?? '');
}

// =============================================
// FILTERS & STATE
// =============================================
let allDeals = [];
let filters  = { date: 'all', time: 'all', cat: 'all', customDate: null };
let userLocation  = null; // { lat, lng } — never sent to backend (GDPR)
let locationOn    = false;

window.addEventListener('load', () => { loadDeals(); });

function setFilter(type, val, btn) {
  filters[type] = val;
  document.querySelectorAll('.filter-row').forEach(row => {
    row.querySelectorAll('.filter-btn').forEach(b => {
      if (b.dataset.filterType === type || b.onclick?.toString().includes("'"+type+"'")) {
        b.classList.remove('active');
      }
    });
  });
  if (btn) {
    document.querySelectorAll('.filter-btn').forEach(b => {
      if (b.textContent === btn.textContent && b !== btn) b.classList.remove('active');
    });
    btn.classList.add('active');
  }
  renderDeals();
}

function setCustomDate(val) {
  filters.date = 'custom';
  filters.customDate = val;
  renderDeals();
}

function toggleLocation() {
  if (!locationOn) {
    if (!navigator.geolocation) { showToast('Geolocation nicht verfügbar', true); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        // GPS stays client-only — never sent to backend
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        locationOn   = true;
        setText('btnLocation', '✅ Standort aktiv');
        document.getElementById('btnSortDist').style.display = 'block';
        attachDistances();
        renderDeals();
        showToast('Standort aktiviert');
      },
      () => showToast('Standort-Zugriff verweigert', true)
    );
  } else {
    locationOn   = false;
    userLocation = null;
    allDeals.forEach(d => delete d._dist);
    setText('btnLocation', 'In meiner Nähe');
    document.getElementById('btnSortDist').style.display = 'none';
    renderDeals();
  }
}

function attachDistances() {
  // Bars would need lat/lng in deal data for real calculation.
  // Currently placeholder — use Haversine when bar coordinates are in DB.
  allDeals.forEach(d => {
    if (d.bar_lat && d.bar_lng && userLocation) {
      d._dist = haversine(userLocation.lat, userLocation.lng, d.bar_lat, d.bar_lng);
    }
  });
}

function haversine(la1, lo1, la2, lo2) {
  const R  = 6371;
  const dL = (la2 - la1) * Math.PI / 180;
  const dO = (lo2 - lo1) * Math.PI / 180;
  const a  = Math.sin(dL/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function sortByDistance() {
  allDeals.sort((a, b) => (a._dist ?? 999) - (b._dist ?? 999));
  renderDeals();
}

// =============================================
// DEALS
// =============================================
async function loadDeals() {
  try {
    const r = await fetch(BACKEND_URL + '?action=getActiveDeals');
    const d = await r.json();
    if (d.success) { allDeals = d.deals; renderDeals(); }
  } catch (e) { /* no sensitive info to log */ }
}

function matchDate(deal) {
  const today    = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);

  if (filters.date === 'all') return true;

  if (deal.validity_type === 'recurring') return true; // recurring always matches date filter

  const dDate = new Date(deal.valid_single_date); dDate.setHours(0,0,0,0);

  if (filters.date === 'today')    return dDate.getTime() === today.getTime();
  if (filters.date === 'tomorrow') return dDate.getTime() === tomorrow.getTime();
  if (filters.date === 'custom' && filters.customDate) {
    const sel = new Date(filters.customDate); sel.setHours(0,0,0,0);
    return dDate.getTime() === sel.getTime();
  }
  return true;
}

function matchTime(deal) {
  if (filters.time === 'all' || !deal.valid_from_time || !deal.valid_to_time) return true;
  const from = parseInt(deal.valid_from_time);
  const to   = parseInt(deal.valid_to_time);
  const h    = new Date().getHours();
  if (filters.time === 'now')     return h >= from && h < to;
  if (filters.time === 'lunch')   return from <= 11 && to >= 14 || (from >= 11 && from <= 14);
  if (filters.time === 'evening') return from <= 17 && to >= 23 || (from >= 17 && from <= 23);
  return true;
}

function renderDeals() {
  const el = document.getElementById('dealsList');

  const visible = allDeals.filter(d =>
    (filters.cat === 'all' || (d.categories || []).includes(filters.cat)) &&
    matchDate(d) && matchTime(d)
  );

  if (!visible.length) {
    el.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'empty';
    div.innerHTML = '<h3>Keine Deals gefunden</h3><p>Andere Filter versuchen</p>';
    el.appendChild(div);
    return;
  }

  el.innerHTML = '';
  visible.forEach(deal => el.appendChild(buildDealCard(deal)));
}

function buildDealCard(deal) {
  const card = document.createElement('div');
  card.className = 'deal-card';

  const discount = deal.original_price > deal.deal_price
    ? Math.round((1 - deal.deal_price / deal.original_price) * 100) : 0;

  const CAT_EMOJI = { breakfast:'🥐', lunch:'🍽️', aperitif:'🍹', dinner:'🍷', events:'🎉' };
  const CAT_NAME  = { breakfast:'Breakfast', lunch:'Lunch', aperitif:'Aperitif', dinner:'Dinner', events:'Events' };
  const mainCat   = (deal.categories || [])[0];

  // Image area
  const imgDiv = document.createElement('div');
  imgDiv.className = 'deal-image';

  if (deal.image_url) {
    const img = document.createElement('img');
    img.src = deal.image_url;                   // URL from backend; no untrusted HTML
    img.alt = escHtml(deal.title);              // alt is set as text attribute
    imgDiv.appendChild(img);
  } else {
    imgDiv.textContent = '🍹';
    imgDiv.style.fontSize = '48px';
  }

  if (discount > 0) {
    const b = document.createElement('div');
    b.className = 'badge-discount';
    b.textContent = '-' + discount + '%';
    imgDiv.appendChild(b);
  }
  if (mainCat) {
    const b = document.createElement('div');
    b.className = 'badge-cat';
    b.textContent = (CAT_EMOJI[mainCat] || '') + ' ' + (CAT_NAME[mainCat] || mainCat);
    imgDiv.appendChild(b);
  }
  if (deal._dist !== undefined) {
    const b = document.createElement('div');
    b.className = 'badge-dist';
    b.textContent = deal._dist.toFixed(1) + ' km';
    imgDiv.appendChild(b);
  }

  // Content area — all user-supplied strings go through textContent
  const content = document.createElement('div');
  content.className = 'deal-content';

  const title = document.createElement('div');
  title.className = 'deal-title';
  title.textContent = deal.title;

  const bar = document.createElement('div');
  bar.className = 'deal-bar';
  bar.textContent = deal.bar_name + (deal.bar_city ? ' · ' + deal.bar_city : '');

  const priceDiv = document.createElement('div');
  priceDiv.className = 'deal-price';
  const pNew = document.createElement('span');
  pNew.className = 'price-new';
  pNew.textContent = Number(deal.deal_price).toFixed(2) + ' CHF';
  priceDiv.appendChild(pNew);
  if (deal.original_price > deal.deal_price) {
    const pOld = document.createElement('span');
    pOld.className = 'price-old';
    pOld.textContent = Number(deal.original_price).toFixed(2) + ' CHF';
    priceDiv.appendChild(pOld);
  }

  const validity = document.createElement('div');
  validity.className = 'deal-validity';
  if (deal.validity_type === 'single' && deal.valid_single_date) {
    const d = new Date(deal.valid_single_date).toLocaleDateString('de-CH');
    validity.textContent = '📅 Nur am ' + d
      + (deal.valid_from_time && deal.valid_to_time ? ' · ' + deal.valid_from_time + '–' + deal.valid_to_time : '');
  } else if (deal.valid_from_time && deal.valid_to_time) {
    validity.textContent = '🕐 ' + deal.valid_from_time + '–' + deal.valid_to_time;
  }

  const btn = document.createElement('button');
  btn.className = 'btn-buy';
  btn.textContent = 'Kaufen';
  btn.addEventListener('click', () => openBuyModal(deal));

  content.append(title, bar, priceDiv, validity, btn);
  card.append(imgDiv, content);
  return card;
}

function openBuyModal(deal) {
  window._currentDeal = deal;

  setText('buyModalTitle', deal.title);

  const info = document.getElementById('buyModalInfo');
  info.innerHTML = '';
  const strong = document.createElement('strong');
  strong.textContent = deal.bar_name;
  const br = document.createElement('br');
  const price = document.createElement('span');
  price.style.cssText = 'color:#FF3366;font-size:18px;font-weight:700';
  price.textContent = Number(deal.deal_price).toFixed(2) + ' CHF';
  info.append(strong, br, price);

  const s = sessionGet();
  if (s) {
    document.getElementById('buyName').value  = s.name  || '';
    document.getElementById('buyEmail').value = s.email || '';
  }

  openModal('buyModal');
}

async function submitOrder() {
  const name     = document.getElementById('buyName').value.trim();
  const email    = document.getElementById('buyEmail').value.trim();
  const phone    = document.getElementById('buyPhone').value.trim();
  const delivery = document.getElementById('buyDelivery').value;
  const consent  = document.getElementById('buyConsent').checked;
  const deal     = window._currentDeal;

  if (!name || !email) { showToast('Name und Email sind Pflichtfelder', true); return; }
  if (!consent)         { showToast('Bitte Datenschutz akzeptieren', true); return; }
  if (!deal)            return;

  const s = sessionGet();
  const body = {
    action: 'createOrder',
    token: s ? s.token : null,
    deal_id: deal.id, bar_id: deal.bar_id,
    deal_title: deal.title, bar_name: deal.bar_name,
    buyer_name: name, buyer_email: email, buyer_phone: phone,
    price: deal.deal_price, delivery_method: delivery
  };

  try {
    const r = await api(body);
    if (!r.success) { showToast(r.error || 'Fehler', true); return; }

    if (delivery === 'whatsapp') {
      const msg = 'BarSclusive Bestellung\n\nDeal: ' + deal.title
        + '\nBar: ' + deal.bar_name
        + '\nPreis: ' + Number(deal.deal_price).toFixed(2) + ' CHF'
        + '\n\nName: ' + name + '\nEmail: ' + email
        + '\n\nBitte per Twint bezahlen an: +41 76 592 43 91'
        + '\nBetreff: ' + r.order_id;
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
    }

    closeModal('buyModal');
    showToast('✅ Bestellung aufgegeben!');
    document.getElementById('buyConsent').checked = false;
    if (!s) {
      document.getElementById('buyName').value  = '';
      document.getElementById('buyEmail').value = '';
    }
    document.getElementById('buyPhone').value = '';
  } catch (e) {
    showToast('Verbindungsfehler', true);
  }
}

// =============================================
// ORDERS
// =============================================
async function loadOrders() {
  const s = sessionGet();
  if (!s) { openModal('loginModal'); return; }

  try {
    const r = await api({ action: 'getCustomerOrders', token: s.token });
    if (!r.success) { showToast(r.error || 'Fehler', true); return; }
    renderOrders(r.orders);
  } catch (e) {
    showToast('Verbindungsfehler', true);
  }
}

function renderOrders(orders) {
  const el = document.getElementById('ordersList');
  el.innerHTML = '';

  if (!orders.length) {
    const div = document.createElement('div');
    div.className = 'empty';
    div.innerHTML = '<h3>Keine Bestellungen</h3><p>Du hast noch nichts bestellt</p>';
    el.appendChild(div);
    return;
  }

  orders.forEach(o => el.appendChild(buildOrderCard(o)));
}

function buildOrderCard(o) {
  const card = document.createElement('div');
  card.className = 'order-card';

  const head = document.createElement('div');
  head.className = 'order-head';
  const titleEl = document.createElement('div');
  titleEl.className = 'order-title';
  titleEl.textContent = o.deal_title;   // textContent — safe

  const STATUS_CLASS = { pending:'s-pending', paid:'s-paid', redeemed:'s-redeemed' };
  const STATUS_TEXT  = { pending:'⏳ Ausstehend', paid:'✅ Bezahlt', redeemed:'🎉 Eingelöst' };
  const pill = document.createElement('div');
  pill.className = 'status-pill ' + (STATUS_CLASS[o.status] || 's-pending');
  pill.textContent = STATUS_TEXT[o.status] || o.status;

  head.append(titleEl, pill);

  const details = document.createElement('div');
  details.style.cssText = 'color:#999;font-size:14px;margin-bottom:8px';
  details.textContent = (o.bar_name || '') + ' · ' + Number(o.price).toFixed(2) + ' CHF';

  const date = document.createElement('div');
  date.style.cssText = 'color:#666;font-size:12px;margin-bottom:12px';
  date.textContent = 'Bestellt: ' + new Date(o.created_at).toLocaleString('de-CH');

  card.append(head, details, date);

  if (o.voucher_code) {
    const box = document.createElement('div');
    box.className = 'voucher-box';
    const label = document.createElement('div');
    label.style.cssText = 'font-size:12px;color:#999;margin-bottom:6px';
    label.textContent = 'Gutschein-Code:';
    const code = document.createElement('div');
    code.className = 'voucher-code';
    code.textContent = o.voucher_code;   // textContent — safe
    box.append(label, code);
    card.appendChild(box);
  }

  if (o.refund_status === 'requested') {
    const info = document.createElement('div');
    info.style.cssText = 'color:#FFC107;margin-top:12px;font-size:14px';
    info.textContent = '⏳ Rückerstattung angefordert';
    card.appendChild(info);
  } else if (o.refund_status === 'completed') {
    const info = document.createElement('div');
    info.style.cssText = 'color:#4CAF50;margin-top:12px;font-size:14px';
    info.textContent = '↩️ Rückerstattet';
    card.appendChild(info);
  } else if (o.can_refund) {
    const btn = document.createElement('button');
    btn.className = 'btn-refund';
    btn.textContent = '💰 Rückerstattung anfordern';
    btn.addEventListener('click', () => doRefund(o.id));
    const hint = document.createElement('div');
    hint.className = 'refund-hint';
    hint.textContent = 'Noch ' + o.hours_left + 'h verbleibend';
    card.append(btn, hint);
  }

  return card;
}

async function doRefund(orderId) {
  if (!confirm('Rückerstattung anfordern?\nDer Gutschein wird ungültig.')) return;
  const s = sessionGet();
  if (!s) { showToast('Nicht eingeloggt', true); return; }

  try {
    const r = await api({ action: 'requestRefund', token: s.token, order_id: orderId });
    if (r.success) { showToast('✅ Rückerstattung angefordert'); loadOrders(); }
    else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// =============================================
// AUTH
// =============================================
function onUserButtonClick() {
  if (!sessionGet()) { openModal('loginModal'); }
  else { document.getElementById('userDropdown').classList.toggle('show'); }
}

async function doLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { showToast('Bitte Email und Passwort eingeben', true); return; }

  try {
    const r = await api({ action: 'customerLogin', email, password });
    if (r.success) {
      sessionSet(r.token, r.customer.name, r.customer.email, 'customer');
      closeModal('loginModal');
      document.getElementById('loginPassword').value = '';
      showToast('✅ Eingeloggt!');
    } else {
      showToast(r.error || 'Ungültige Zugangsdaten', true);
      document.getElementById('loginPassword').value = '';
    }
  } catch (e) { showToast('Verbindungsfehler', true); }
}

async function doRegister() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const consent  = document.getElementById('regConsent').checked;

  if (!name || !email || !password) { showToast('Alle Felder ausfüllen', true); return; }
  if (password.length < 8)           { showToast('Passwort mind. 8 Zeichen', true); return; }
  if (!consent)                       { showToast('Datenschutz akzeptieren', true); return; }

  try {
    const r = await api({ action: 'customerRegister', name, email, password });
    if (r.success) {
      sessionSet(r.token, name, email, 'customer');
      closeModal('registerModal');
      document.getElementById('regPassword').value = '';
      showToast('✅ Registrierung erfolgreich!');
    } else {
      showToast(r.error || 'Fehler', true);
    }
  } catch (e) { showToast('Verbindungsfehler', true); }
}

async function doLogout() {
  const s = sessionGet();
  if (s) {
    try { await api({ action: 'logout', token: s.token }); } catch (e) {}
  }
  sessionClear();
  showView('deals');
  showToast('Ausgeloggt');
}

// =============================================
// VIEW SWITCHING
// =============================================
function showView(view) {
  document.getElementById('dealsView').style.display  = view === 'deals'  ? 'block' : 'none';
  document.getElementById('ordersView').style.display = view === 'orders' ? 'block' : 'none';
  document.getElementById('btnDeals').classList.toggle('active',  view === 'deals');
  document.getElementById('btnOrders').classList.toggle('active', view === 'orders');
  if (view === 'orders') loadOrders();
}

// =============================================
// MODAL HELPERS
// =============================================
function openModal(id)  { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) e.target.classList.remove('active');
  if (!e.target.closest('.user-menu')) {
    document.getElementById('userDropdown').classList.remove('show');
  }
});

// =============================================
// API HELPER
// =============================================
async function api(body) {
  const r = await fetch(BACKEND_URL, {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return r.json();
}

// =============================================
// TOAST
// =============================================
let _toastTimer = null;
function showToast(msg, isError) {
  const el = document.getElementById('toast');
  el.textContent = msg;               // textContent — safe
  el.className   = 'toast show ' + (isError ? 'toast-err' : 'toast-ok');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// =============================================
// BIND ALL INLINE EVENT HANDLERS
// Replaces onclick= attributes in HTML.
// Required for CSP: script-src 'self' (no unsafe-inline).
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const btnDeals  = document.getElementById('btnDeals');
  const btnOrders = document.getElementById('btnOrders');
  if (btnDeals)  btnDeals.addEventListener('click',  () => showView('deals'));
  if (btnOrders) btnOrders.addEventListener('click', () => showView('orders'));

  // User button
  const userBtn = document.getElementById('userBtn');
  if (userBtn) userBtn.addEventListener('click', onUserButtonClick);

  // Logout
  document.querySelectorAll('.dropdown-item').forEach(el => {
    if (el.textContent.includes('Ausloggen')) {
      el.addEventListener('click', doLogout);
    }
  });

  // Filter buttons — date
  document.querySelectorAll('.filter-btn[data-filter-date]').forEach(btn => {
    btn.addEventListener('click', function() { setFilter('date', this.dataset.filterDate, this); });
  });

  // Filter buttons — time
  document.querySelectorAll('.filter-btn[data-filter-time]').forEach(btn => {
    btn.addEventListener('click', function() { setFilter('time', this.dataset.filterTime, this); });
  });

  // Filter buttons — category
  document.querySelectorAll('.filter-btn[data-filter-cat]').forEach(btn => {
    btn.addEventListener('click', function() { setFilter('cat', this.dataset.filterCat, this); });
  });

  // Modal close buttons (data-close attribute)
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  // Login form
  const btnLogin = document.getElementById('btnLoginSubmit');
  if (btnLogin) btnLogin.addEventListener('click', doLogin);

  // Register form
  const btnRegister = document.getElementById('btnRegisterSubmit');
  if (btnRegister) btnRegister.addEventListener('click', doRegister);

  // Buy form
  const btnBuy = document.getElementById('btnBuySubmit');
  if (btnBuy) btnBuy.addEventListener('click', doBuy);
});

// Additional event bindings for modal switches and location buttons
document.addEventListener('DOMContentLoaded', () => {
  const linkToRegister = document.getElementById('linkToRegister');
  if (linkToRegister) linkToRegister.addEventListener('click', () => {
    openModal('registerModal'); closeModal('loginModal');
  });

  const linkToLogin = document.getElementById('linkToLogin');
  if (linkToLogin) linkToLogin.addEventListener('click', () => {
    openModal('loginModal'); closeModal('registerModal');
  });

  const btnLocation = document.getElementById('btnLocation');
  if (btnLocation) btnLocation.addEventListener('click', toggleLocation);

  const btnSortDist = document.getElementById('btnSortDist');
  if (btnSortDist) btnSortDist.addEventListener('click', sortByDistance);
});
