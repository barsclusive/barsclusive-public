// =============================================
// CONFIGURATION
// =============================================
const BACKEND_URL  = 'https://script.google.com/macros/s/AKfycbz1zkTHlVpnFgbMlscbjgGHXDRwhoAqYQeasInpWUDzn6dzC2aFC_DEykj_itklCHILRA/exec';
// WhatsApp removed - Stripe only

// No API key: a key in frontend JS is public and provides no auth.

// =============================================
// SESSION — in-memory only
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
  var bf = document.getElementById('btnFavorites'); if(bf) bf.style.display = 'block';
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
  var bf2 = document.getElementById('btnFavorites'); if(bf2) bf2.style.display = 'none';
  _favorites = [];
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
let filters  = { date: 'all', time: 'all', cat: 'all', customDate: null, search: '', city: '' };
var _favorites = [];
let userLocation  = null;
let locationOn    = false;

window.addEventListener('load', () => { loadDeals(); });

function setFilter(type, val, btn) {
  filters[type] = val;
  const attr = { date: 'data-filter-date', time: 'data-filter-time', cat: 'data-filter-cat' }[type];
  if (attr) {
    document.querySelectorAll('.filter-btn[' + attr + ']').forEach(b => b.classList.remove('active'));
  }
  if (btn) btn.classList.add('active');
  renderDeals();
}

function setCustomDate(val) {
  filters.date = 'custom';
  filters.customDate = val;
  // Deactivate all date buttons when custom date is selected
  document.querySelectorAll('.filter-btn[data-filter-date]').forEach(b => b.classList.remove('active'));
  renderDeals();
}

function applyLocation() {
  var val = (document.getElementById('locationInput').value || '').trim().toLowerCase();
  if (!val) { clearLocation(); return; }
  filters.city = val;
  document.getElementById('btnClearLocation').style.display = 'inline-block';
  renderDeals();
}
function clearLocation() {
  filters.city = '';
  document.getElementById('locationInput').value = '';
  document.getElementById('btnClearLocation').style.display = 'none';
  renderDeals();
}

function attachDistances() {
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
let dealsCache = { data: null, timestamp: 0 };

// Performance: load cached deals from localStorage instantly
try {
  var _stored = localStorage.getItem('barsclusive_deals_cache');
  if (_stored) {
    var _parsed = JSON.parse(_stored);
    if (_parsed.data && (Date.now() - _parsed.timestamp) < 30 * 60 * 1000) {
      dealsCache = _parsed;
      allDeals = _parsed.data;
      setTimeout(function() {
        var ld = document.getElementById('dealsLoading'); if(ld) ld.style.display='none';
        var dl = document.getElementById('dealsList'); if(dl) dl.style.display='';
        renderDeals();
      }, 50);
    }
  }
} catch(e) {}
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function loadDeals(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && dealsCache.data && (now - dealsCache.timestamp) < CACHE_DURATION) {
    allDeals = dealsCache.data;
    renderDeals();
    return;
  }
  
  try {
    const r = await fetch(BACKEND_URL + '?action=getActiveDeals');
    if (!r.ok) throw new Error('Network error');
    const d = await r.json();
    if (d.success) {
      allDeals = d.deals;
      dealsCache = { data: d.deals, timestamp: now };
      try { localStorage.setItem('barsclusive_deals_cache', JSON.stringify(dealsCache)); } catch(e) {}
      var ld = document.getElementById('dealsLoading'); if(ld) ld.style.display='none';
      var dl = document.getElementById('dealsList'); if(dl) dl.style.display='';
      renderDeals();
    } else {
      showToast('Fehler beim Laden der Deals', true);
    }
  } catch (e) {
    showToast('Verbindungsfehler - bitte neu laden', true);
  }
}

// FIX BUG 3: Datum-Filter — parst Datumstrings ohne Timezone-Problem
// "2026-03-15" → { year:2026, month:3, day:15 } direkt aus String
function parseDateString(str) {
  if (!str) return null;
  // Handle ISO strings like "2026-03-15" or "2026-03-15T00:00:00.000Z"
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return { year: parseInt(m[1]), month: parseInt(m[2]), day: parseInt(m[3]) };
}

function dateToYMD(d) {
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

function ymdEqual(a, b) {
  if (!a || !b) return false;
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function matchDate(deal) {
  if (filters.date === 'all') return true;

  // Recurring deals always visible regardless of date filter
  if (deal.validity_type === 'recurring') return true;

  const dealDateYMD = parseDateString(deal.valid_single_date);
  if (!dealDateYMD) return false;

  const today = new Date();
  const todayYMD = dateToYMD(today);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowYMD = dateToYMD(tomorrow);

  if (filters.date === 'today')    return ymdEqual(dealDateYMD, todayYMD);
  if (filters.date === 'tomorrow') return ymdEqual(dealDateYMD, tomorrowYMD);
  if (filters.date === 'custom' && filters.customDate) {
    const selYMD = parseDateString(filters.customDate);
    return ymdEqual(dealDateYMD, selYMD);
  }
  return true;
}

function matchTime(deal) {
  if (filters.time === 'all') return true;
  if (!deal.valid_from_time || !deal.valid_to_time) return true;

  // FIX: Parse "HH:MM" format correctly
  const fromParts = String(deal.valid_from_time).split(':');
  const toParts   = String(deal.valid_to_time).split(':');
  const fromH = parseInt(fromParts[0]);
  const toH   = parseInt(toParts[0]);
  const h     = new Date().getHours();

  if (filters.time === 'now')     return h >= fromH && h < toH;
  if (filters.time === 'lunch')   return (fromH <= 11 && toH >= 14) || (fromH >= 11 && fromH <= 14);
  if (filters.time === 'evening') return (fromH <= 17 && toH >= 23) || (fromH >= 17 && fromH <= 23);
  return true;
}

function renderDeals() {
  const el = document.getElementById('dealsList');

  const visible = allDeals.filter(d => {
    if (filters.cat !== 'all' && !(d.categories || []).includes(filters.cat)) return false;
    if (!matchDate(d)) return false;
    if (!matchTime(d)) return false;
    if (filters.search) {
      var hay = ((d.title||'') + ' ' + (d.bar_name||'') + ' ' + (d.bar_city||'') + ' ' + (d.description||'')).toLowerCase();
      if (!hay.includes(filters.search)) return false;
    }
    if (filters.city) {
      var q = filters.city;
      var haystack = ((d.bar_city||'') + ' ' + (d.bar_zip||'')).toLowerCase();
      // PLZ proximity: if user enters a number, match first 2 digits (same region)
      if (/^\d+$/.test(q)) {
        var prefix = q.length >= 2 ? q.substring(0,2) : q;
        if (!(d.bar_zip||'').startsWith(prefix)) return false;
      } else {
        if (!haystack.includes(q)) return false;
      }
    }
    return true;
  });

  // Sort by highest discount first
  visible.sort(function(a,b) {
    var dA = a.original_price > 0 ? (1 - a.deal_price/a.original_price) : 0;
    var dB = b.original_price > 0 ? (1 - b.deal_price/b.original_price) : 0;
    return dB - dA;
  });

  if (!visible.length) {
    el.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'empty';
    div.innerHTML = '<h3>' + (shopT('keineDeals') || 'Keine Deals gefunden') + '</h3><p>' + (shopT('andereFilter') || 'Andere Filter versuchen') + '</p>';
    el.appendChild(div);
    return;
  }

  el.innerHTML = '';
  visible.forEach(deal => el.appendChild(buildDealCard(deal)));
  // Update map markers if map exists
  if (_shopMap && _mapView) updateShopMapMarkers();
}

function buildDealCard(deal) {
  const card = document.createElement('div');
  card.className = 'deal-card';

  const isPauschal = (deal.categories || []).includes('pauschalgutscheine');

  const discount = deal.original_price > deal.deal_price
    ? Math.round((1 - deal.deal_price / deal.original_price) * 100) : 0;

  // FIX BUG 5: Pauschalgutscheine hinzugefügt
  const CAT_EMOJI = { breakfast:'🥐', lunch:'🍽️', aperitif:'🍹', dinner:'🍷', events:'🎉', pauschalgutscheine:'🏷️' };
  const CAT_NAME  = { breakfast:'Breakfast', lunch:'Lunch', aperitif:'Aperitif', dinner:'Dinner', events:'Events', pauschalgutscheine:'Rabatt-Gutschein' };
  const mainCat   = (deal.categories || [])[0];

  // Image area
  const imgDiv = document.createElement('div');
  imgDiv.className = 'deal-image';

  if (deal.image_url) {
    const img = document.createElement('img');
    var imgUrl = deal.image_url;
    // Convert any Google Drive URL to the most reliable format
    var gid = '';
    if (imgUrl.indexOf('lh3.googleusercontent.com/d/') >= 0) gid = imgUrl.split('/d/')[1].split('=')[0];
    else if (imgUrl.indexOf('thumbnail?id=') >= 0) gid = imgUrl.split('id=')[1].split('&')[0];
    else if (imgUrl.indexOf('/d/') >= 0) gid = (imgUrl.split('/d/')[1] || '').split('/')[0];
    else if (imgUrl.indexOf('uc?') >= 0 && imgUrl.indexOf('id=') >= 0) gid = imgUrl.split('id=')[1].split('&')[0];
    if (gid) imgUrl = 'https://lh3.googleusercontent.com/d/' + gid + '=w800';
    img.src = imgUrl;
    img.alt = escHtml(deal.title);
    img.referrerPolicy = 'no-referrer';
    img.crossOrigin = 'anonymous';
    img.onerror = function() {
      if (gid && !this.dataset.retried) {
        this.dataset.retried = '1';
        this.src = 'https://drive.google.com/thumbnail?id=' + gid + '&sz=w800';
      } else if (gid && !this.dataset.retried2) {
        this.dataset.retried2 = '1';
        this.src = 'https://drive.google.com/uc?export=view&id=' + gid;
      } else {
        this.style.display = 'none';
        this.parentElement.textContent = isPauschal ? '\ud83c\udff7\ufe0f' : '\ud83c\udf79';
        this.parentElement.style.fontSize = '48px';
      }
    };
    imgDiv.appendChild(img);
  } else {
    imgDiv.textContent = isPauschal ? '🏷️' : '🍹';
    imgDiv.style.fontSize = '48px';
  }

  if (discount > 0) {
    const b = document.createElement('div');
    b.className = 'badge-discount';
    b.textContent = '-' + discount + '%';
    imgDiv.appendChild(b);
  }
  // For Pauschalgutscheine show discount percentage badge
  if (isPauschal && deal.discount_percent) {
    const b = document.createElement('div');
    b.className = 'badge-discount';
    b.textContent = '-' + deal.discount_percent + '%';
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

  // Content area
  const content = document.createElement('div');
  content.className = 'deal-content';

  const title = document.createElement('div');
  title.className = 'deal-title';
  title.textContent = deal.title;

  const bar = document.createElement('div');
  bar.className = 'deal-bar';
  bar.textContent = deal.bar_name + (deal.bar_city ? ' · ' + deal.bar_city : '');

  const pNew = document.createElement('span');
  pNew.className = 'price-new';
  pNew.textContent = Number(deal.deal_price).toFixed(2) + ' CHF';

  var pOld = null;
  if (!isPauschal && deal.original_price > deal.deal_price) {
    pOld = document.createElement('span');
    pOld.className = 'price-old';
    pOld.textContent = Number(deal.original_price).toFixed(2) + ' CHF';
  }

  const validity = document.createElement('div');
  validity.className = 'deal-validity';
  if (deal.validity_type === 'single' && deal.valid_single_date) {
    const dateParts = parseDateString(deal.valid_single_date);
    if (dateParts) {
      const d = dateParts.day + '.' + dateParts.month + '.' + dateParts.year;
      validity.textContent = '📅 Nur am ' + d
        + (deal.valid_from_time && deal.valid_to_time ? ' · ' + deal.valid_from_time + '–' + deal.valid_to_time : '');
    }
  } else if (deal.valid_from_time && deal.valid_to_time) {
    validity.textContent = '🕐 ' + deal.valid_from_time + '–' + deal.valid_to_time;
  }

  if (isPauschal && deal.applies_to) {
    const applies = document.createElement('div');
    applies.style.cssText = 'color:#aaa;font-size:12px;margin-bottom:8px';
    const applyMap = { drinks: shopT('getraenke') || 'Getränke', food: shopT('essen') || 'Essen', all: shopT('alles') || 'Alles' };
    applies.textContent = '✅ Gilt für: ' + (applyMap[deal.applies_to] || deal.applies_to);
    content.appendChild(applies);
  }

  const btn = document.createElement('button');
  btn.className = 'btn-buy';
  btn.textContent = shopT('profitiere') || 'Profitiere jetzt!';
  btn.addEventListener('click', (e) => { e.stopPropagation(); openBuyModal(deal); });
  var cartBtn = document.createElement('button');
  cartBtn.className = 'add-cart-btn';
  cartBtn.textContent = '🛒+';
  cartBtn.title = 'In den Warenkorb';
  cartBtn.addEventListener('click', function(e) { e.stopPropagation(); addToCart(deal); });
  card.style.cursor = 'pointer';
  card.addEventListener('click', function() { openDealDetail(deal); });

  // Time slots display
  var tsContainer = document.createElement('div');
  if (deal.time_slots && deal.time_slots.length > 0) {
    tsContainer.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px';
    var tsLabels = {morning:'\u{1F305} Morgen', midday:'\u2600\uFE0F Mittag', evening:'\u{1F319} Abend'};
    deal.time_slots.forEach(function(slot) {
      var sp = document.createElement('span');
      sp.style.cssText = 'background:#2a2a2a;padding:3px 8px;border-radius:8px;font-size:11px;color:#ccc';
      sp.textContent = tsLabels[slot] || slot;
      tsContainer.appendChild(sp);
    });
  }

  // Favorite button
  var favBtn = document.createElement('button');
  favBtn.className = 'fav-btn';
  favBtn.textContent = (_favorites.indexOf(deal.id) !== -1) ? '\u2764\uFE0F' : '\u{1F90D}';
  favBtn.addEventListener('click', function(e) { e.stopPropagation(); toggleFavorite(deal.id, favBtn); });

  // btnRow replaced by priceBtn in content.append

  // Bar address line
  var addrDiv = document.createElement('div');
  addrDiv.style.cssText = 'color:#888;font-size:12px;margin-bottom:4px';
  if (deal.bar_address) addrDiv.textContent = '📍 ' + deal.bar_address + (deal.bar_city ? ', ' + deal.bar_city : '');
  else if (deal.bar_city) addrDiv.textContent = '📍 ' + deal.bar_city;

  // Price next to button
  var priceBtn = document.createElement('div');
  priceBtn.style.cssText = 'display:flex;align-items:center;gap:10px;flex-wrap:wrap';
  priceBtn.append(btn, pNew);
  if (isPauschal) {
    var infoLine = document.createElement('span');
    infoLine.style.cssText = 'font-size:12px;color:#999';
    infoLine.textContent = deal.discount_percent + '% ab ' + deal.min_order + ' CHF';
    priceBtn.appendChild(infoLine);
  } else if (deal.original_price > deal.deal_price) {
    priceBtn.appendChild(pOld);
  }
  priceBtn.appendChild(favBtn);
  priceBtn.appendChild(cartBtn);

  content.append(title, bar, addrDiv, tsContainer, validity, priceBtn);
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

async function doBuy() {
  var name = document.getElementById('buyName').value.trim();
  var email = document.getElementById('buyEmail').value.trim();
  var consent = document.getElementById('buyConsent').checked;
  var deal = window._currentDeal;
  if (!name || !email) { showToast('Name und Email sind Pflichtfelder', true); return; }
  if (!consent) { showToast('Bitte AGB & Datenschutz akzeptieren', true); return; }
  if (!deal) return;
  var btn = document.getElementById('btnBuySubmit');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Weiterleitung...'; }
  var s = sessionGet();
  try {
    var r = await api({
      action: 'createCheckoutSession',
      token: s ? s.token : null,
      deal_id: deal.id,
      buyer_name: name, buyer_email: email,
      customer_id: s ? s.token : '',
      site_url: window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
    });
    if (!r.success) {
      showToast(r.error || 'Fehler', true);
      if (btn) { btn.disabled = false; btn.textContent = '💳 Jetzt bezahlen'; }
      return;
    }
    if (r.checkout_url) { window.location.href = r.checkout_url; }
  } catch(e) {
    showToast('Verbindungsfehler', true);
    if (btn) { btn.disabled = false; btn.textContent = '💳 Jetzt bezahlen'; }
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
    div.innerHTML = '<h3>' + (shopT('keineBestellungen') || 'Keine Bestellungen') + '</h3><p>' + (shopT('nochNichts') || 'Du hast noch nichts bestellt') + '</p>';
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
  titleEl.textContent = o.deal_title;

  const STATUS_CLASS = { pending:'s-pending', created:'s-pending', paid:'s-paid', redeemed:'s-redeemed' };
  const STATUS_TEXT  = { pending:'⏳ Ausstehend', created:'⏳ Ausstehend', paid:'✅ Gekauft', redeemed:'🎉 Eingelöst' };
  const pill = document.createElement('div');
  pill.className = 'status-pill ' + (STATUS_CLASS[o.status] || 's-pending');
  pill.textContent = STATUS_TEXT[o.status] || o.status;

  head.append(titleEl, pill);

  const details = document.createElement('div');
  details.style.cssText = 'color:#999;font-size:14px;margin-bottom:8px';
  details.textContent = (o.bar_name || '') + ' · ' + Number(o.price).toFixed(2) + ' CHF';

  const date = document.createElement('div');
  date.style.cssText = 'color:#666;font-size:12px;margin-bottom:12px';
  date.textContent = (shopT('bestellt') || 'Bestellt:') + ' ' + new Date(o.created_at).toLocaleString('de-CH');

  card.append(head, details, date);

  if (o.voucher_code) {
    // Handle multiple voucher codes (cart orders store comma-separated)
    var codes = o.voucher_code.split(',').map(function(c) { return c.trim(); }).filter(Boolean);
    codes.forEach(function(vc) {
      var box = document.createElement('div');
      box.className = 'voucher-box';
      var label = document.createElement('div');
      label.style.cssText = 'font-size:12px;color:#999;margin-bottom:6px';
      label.textContent = shopT('gutscheinCode') || 'Gutschein-Code:';
      var codeEl = document.createElement('div');
      codeEl.className = 'voucher-code';
      codeEl.textContent = vc;
      box.append(label, codeEl);

      // Voucher link + share row
      var vUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'voucher.html?code=' + encodeURIComponent(vc);
      var actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:12px';

      var viewLink = document.createElement('a');
      viewLink.href = vUrl;
      viewLink.target = '_blank';
      viewLink.style.cssText = 'padding:7px 14px;border-radius:18px;background:#FF3366;color:#fff;font-size:12px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:4px';
      viewLink.textContent = '🎫 ' + (shopT('gutscheinAnzeigen') || 'Anzeigen');
      actions.appendChild(viewLink);

      var copyBtn = document.createElement('button');
      copyBtn.className = 'share-btn';
      copyBtn.textContent = '📋 ' + (shopT('linkKopieren') || 'Link kopieren');
      copyBtn.addEventListener('click', (function(c) { return function() { copyVoucherLink(c); }; })(vc));
      actions.appendChild(copyBtn);

      var waBtn = document.createElement('button');
      waBtn.className = 'share-btn';
      waBtn.textContent = '💬 WhatsApp';
      waBtn.addEventListener('click', (function(c, t) { return function() { shareVoucher(c, t, 'whatsapp'); }; })(vc, o.deal_title || ''));
      actions.appendChild(waBtn);

      var tgBtn = document.createElement('button');
      tgBtn.className = 'share-btn';
      tgBtn.textContent = '✈️ Telegram';
      tgBtn.addEventListener('click', (function(c, t) { return function() { shareVoucher(c, t, 'telegram'); }; })(vc, o.deal_title || ''));
      actions.appendChild(tgBtn);

      var igBtn = document.createElement('button');
      igBtn.className = 'share-btn';
      igBtn.textContent = '📸 Instagram';
      igBtn.addEventListener('click', (function(c) { return function() { copyVoucherLink(c); showToast('Link kopiert – in Instagram einfügen!'); }; })(vc));
      actions.appendChild(igBtn);

      var tkBtn = document.createElement('button');
      tkBtn.className = 'share-btn';
      tkBtn.textContent = '🎵 TikTok';
      tkBtn.addEventListener('click', (function(c) { return function() { copyVoucherLink(c); showToast('Link kopiert – in TikTok einfügen!'); }; })(vc));
      actions.appendChild(tkBtn);

      if (navigator.share) {
        var nsBtn = document.createElement('button');
        nsBtn.className = 'share-btn';
        nsBtn.textContent = '📱 Teilen';
        nsBtn.addEventListener('click', (function(c, t) { return function() {
          var vUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'voucher.html?code=' + encodeURIComponent(c);
          navigator.share({ title: t || 'BarSclusive Gutschein', url: vUrl }).catch(function() {});
        }; })(vc, o.deal_title || ''));
        actions.appendChild(nsBtn);
      }
      box.appendChild(actions);
      card.appendChild(box);
    });
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
  var _loginBtn = document.getElementById('btnLoginSubmit');
  if (_loginBtn) { _loginBtn.disabled = true; _loginBtn.textContent = '⏳...'; }
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
  var fv = document.getElementById('favoritesView'); if(fv) fv.style.display = view === 'favorites' ? 'block' : 'none';
  document.getElementById('btnDeals').classList.toggle('active',  view === 'deals');
  document.getElementById('btnOrders').classList.toggle('active', view === 'orders');
  var bf3 = document.getElementById('btnFavorites'); if(bf3) bf3.classList.toggle('active', view === 'favorites');
  if (view === 'orders') loadOrders();
  if (view === 'favorites') showFavorites();
  
  // Support browser back button — only for view changes, NOT modals
  history.pushState({ view }, '', '#' + view);
}

// =============================================
// MODAL HELPERS
// FIX BUG 4: openModal() kein pushState mehr — verhindert Doppelklick-Problem
// Das pushState in openModal() hat sofort einen popstate-Event getriggert,
// welcher alle Modals wieder geschlossen hat → erster Klick hatte keine Wirkung.
// =============================================
function openModal(id) {
  document.getElementById(id).classList.add('active');
  // NOTE: No history.pushState here — it caused the double-click bug.
  // The popstate handler was closing the modal immediately after opening.
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Handle browser back button — only closes open modals, doesn't mess with them
window.addEventListener('popstate', (e) => {
  // If any modals are open, close them first
  const openModals = document.querySelectorAll('.modal.active');
  if (openModals.length > 0) {
    openModals.forEach(modal => modal.classList.remove('active'));
    return;
  }
  
  // Handle view changes
  if (e.state && e.state.view) {
    const view = e.state.view;
    document.getElementById('dealsView').style.display  = view === 'deals'  ? 'block' : 'none';
    document.getElementById('ordersView').style.display = view === 'orders' ? 'block' : 'none';
    document.getElementById('btnDeals').classList.toggle('active',  view === 'deals');
    document.getElementById('btnOrders').classList.toggle('active', view === 'orders');
    if (view === 'orders') loadOrders();
  }
});

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
  el.textContent = msg;
  el.className   = 'toast show ' + (isError ? 'toast-err' : 'toast-ok');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// =============================================
// PASSWORD RESET
// =============================================

async function sendResetCode() {
  const email = document.getElementById('resetEmail').value.trim();
  if (!email) {
    showToast('Bitte Email eingeben', true);
    return;
  }
  
  try {
    const r = await api({ action: 'requestPasswordReset', email, role: 'customer' });
    if (r.success) {
      showToast(r.message || 'Code gesendet!');
      document.getElementById('resetStep1').style.display = 'none';
      document.getElementById('resetStep2').style.display = 'block';
    } else {
      showToast(r.error || 'Fehler', true);
    }
  } catch (e) {
    showToast('Verbindungsfehler', true);
  }
}

async function resetPasswordSubmit() {
  const email = document.getElementById('resetEmail').value.trim();
  const code = document.getElementById('resetCode').value.trim();
  const newPassword = document.getElementById('resetNewPassword').value;
  
  if (!code || !newPassword) {
    showToast('Alle Felder ausfüllen', true);
    return;
  }
  
  if (newPassword.length < 8) {
    showToast('Passwort mind. 8 Zeichen', true);
    return;
  }
  
  try {
    const r = await api({ 
      action: 'resetPassword', 
      email, 
      code, 
      new_password: newPassword, 
      role: 'customer' 
    });
    if (r.success) {
      showToast('✅ Passwort geändert!');
      closeModal('resetPasswordModal');
      document.getElementById('resetEmail').value = '';
      document.getElementById('resetCode').value = '';
      document.getElementById('resetNewPassword').value = '';
      document.getElementById('resetStep1').style.display = 'block';
      document.getElementById('resetStep2').style.display = 'none';
    } else {
      showToast(r.error || 'Fehler', true);
    }
  } catch (e) {
    showToast('Verbindungsfehler', true);
  }
}

function openResetPasswordModal() {
  closeModal('loginModal');
  openModal('resetPasswordModal');
  document.getElementById('resetStep1').style.display = 'block';
  document.getElementById('resetStep2').style.display = 'none';
}

function backToResetStep1() {
  document.getElementById('resetStep2').style.display = 'none';
  document.getElementById('resetStep1').style.display = 'block';
}

// =============================================
// BIND ALL INLINE EVENT HANDLERS
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
  const dropdownLogout = document.getElementById('dropdownLogout');
  if (dropdownLogout) {
    dropdownLogout.addEventListener('click', doLogout);
  } else {
    document.querySelectorAll('.dropdown-item').forEach(el => {
      if (el.textContent.includes('Ausloggen')) el.addEventListener('click', doLogout);
    });
  }

  // Cancel pw button
  const btnCancelPw = document.getElementById('btnCancelPwModal');
  if (btnCancelPw) btnCancelPw.addEventListener('click', closeChangePwModal);

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

  // Custom date input — bind via JS (CSP-konform, kein inline onchange)
  const customDateInput = document.getElementById('customDate');
  if (customDateInput) customDateInput.addEventListener('change', function() { setCustomDate(this.value); });

  // Modal close buttons
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

// Modal switches and location buttons
document.addEventListener('DOMContentLoaded', () => {
  const linkToRegister = document.getElementById('linkToRegister');
  if (linkToRegister) linkToRegister.addEventListener('click', () => {
    openModal('registerModal'); closeModal('loginModal');
  });

  const linkToLogin = document.getElementById('linkToLogin');
  if (linkToLogin) linkToLogin.addEventListener('click', () => {
    openModal('loginModal'); closeModal('registerModal');
  });

  // Password reset
  const linkForgotPassword = document.getElementById('linkForgotPassword');
  if (linkForgotPassword) linkForgotPassword.addEventListener('click', openResetPasswordModal);

  const btnSendResetCode = document.getElementById('btnSendResetCode');
  if (btnSendResetCode) btnSendResetCode.addEventListener('click', sendResetCode);

  const btnResetPassword = document.getElementById('btnResetPassword');
  if (btnResetPassword) btnResetPassword.addEventListener('click', resetPasswordSubmit);

  const btnBackToStep1 = document.getElementById('btnBackToStep1');
  if (btnBackToStep1) btnBackToStep1.addEventListener('click', backToResetStep1);

  // Location: now manual input via locationInput

  // Sort by distance: removed (manual location)
});

// =============================================
// i18n — DE / EN
// =============================================
var _shopLang = 'de';
function shopT(key) { return (SHOP_TRANSLATIONS[_shopLang] || {})[key] || (SHOP_TRANSLATIONS.de || {})[key] || ''; }
const SHOP_TRANSLATIONS = {
  de: {
    deals:'Deals', orders:'Bestellungen',
    loginBtn:'Login / Registrieren', logoutBtn:'Ausloggen',
    myOrders:'Meine Bestellungen', changePw:'Passwort ändern',
    heroTitle:'🍹 Die besten Bar-Deals deiner Stadt',
    heroSub:'Exklusive Angebote für Breakfast, Brunch, Aperitif und Events',
    buyBtn:'Deal kaufen', changePasswordTitle:'Passwort ändern',
    oldPassword:'Altes Passwort', newPassword:'Neues Passwort',
    confirmPassword:'Passwort bestätigen', savePw:'Speichern',
    cancelBtn:'Abbrechen',
    datum:'Datum', uhrzeit:'Uhrzeit', kategorie:'Kategorie', standort:'Standort',
    alle:'Alle', heute:'Heute', morgen:'Morgen', jederzeit:'Jederzeit', jetzt:'Jetzt', mittag:'Mittag', abend:'Abend', suchen:'Suchen',
    profitiere:'Profitiere jetzt!', bestellt:'Bestellt:', gutscheinCode:'Gutschein-Code:',
    keineDeals:'Keine Deals gefunden', andereFilter:'Andere Filter versuchen',
    keineBestellungen:'Keine Bestellungen', nochNichts:'Du hast noch nichts bestellt',
    forgotPw:'Passwort vergessen?', sendCode:'Code senden', abbrechen:'Abbrechen',
    code6:'Code (6-stellig)', neuesPw:'Neues Passwort (mind. 8 Zeichen)', pwAendern:'Passwort ändern',
    nurAm:'Nur am', giltFuer:'Gilt für:', getraenke:'Getränke', essen:'Essen', alles:'Alles',
    refundReq:'Rückerstattung anfordern', refundRequested:'Rückerstattung angefordert', refunded:'Rückerstattet',
    remaining:'verbleibend', anmelden:'Anmelden', registrieren:'Registrieren',
    fUeberUns:'Über uns', fSoFunktionierts:'So funktionierts', fImpressum:'Impressum', fDatenschutz:'Datenschutz', fAGB:'AGB', fKontakt:'Kontakt', fFuerBars:'Für Bars \u2192 Bar-Portal', loginSubmitBtn:'Einloggen', cancelLoginBtn:'Abbrechen', suchenBtn:'Suchen', anmeldenTitle:'Anmelden', searchBarDeal:'Bar oder Deal suchen...', searchPLZ:'PLZ oder Ort...',
    gutscheinAnzeigen:'Anzeigen', linkKopieren:'Link kopieren', linkKopiert:'Link kopiert!',
  },
  en: {
    deals:'Deals', orders:'Orders',
    loginBtn:'Login / Register', logoutBtn:'Logout',
    myOrders:'My Orders', changePw:'Change Password',
    heroTitle:'🍹 The best bar deals in your city',
    heroSub:'Exclusive offers for Breakfast, Brunch, Aperitif and Events',
    buyBtn:'Buy Deal', changePasswordTitle:'Change Password',
    oldPassword:'Old Password', newPassword:'New Password',
    confirmPassword:'Confirm Password', savePw:'Save',
    cancelBtn:'Cancel',
    datum:'Date', uhrzeit:'Time', kategorie:'Category', standort:'Location',
    alle:'All', heute:'Today', morgen:'Tomorrow', jederzeit:'Anytime', jetzt:'Now', mittag:'Midday', abend:'Evening', suchen:'Search',
    profitiere:'Get this deal!', bestellt:'Ordered:', gutscheinCode:'Voucher code:',
    keineDeals:'No deals found', andereFilter:'Try different filters',
    keineBestellungen:'No orders', nochNichts:'You haven\'t ordered anything yet',
    forgotPw:'Forgot password?', sendCode:'Send code', abbrechen:'Cancel',
    code6:'Code (6 digits)', neuesPw:'New password (min. 8 characters)', pwAendern:'Change password',
    nurAm:'Only on', giltFuer:'Applies to:', getraenke:'Drinks', essen:'Food', alles:'Everything',
    refundReq:'Request refund', refundRequested:'Refund requested', refunded:'Refunded',
    remaining:'remaining', anmelden:'Login', registrieren:'Register',
    fUeberUns:'About Us', fSoFunktionierts:'How It Works', fImpressum:'Legal Notice', fDatenschutz:'Privacy', fAGB:'Terms', fKontakt:'Contact', fFuerBars:'For Bars \u2192 Bar Portal', loginSubmitBtn:'Login', cancelLoginBtn:'Cancel', suchenBtn:'Search', anmeldenTitle:'Login', searchBarDeal:'Search bar or deal...', searchPLZ:'ZIP or city...',
    gutscheinAnzeigen:'View', linkKopieren:'Copy link', linkKopiert:'Link copied!',
  },
  it: {
    deals:'Deals', orders:'Ordini',
    loginBtn:'Login / Registrati', logoutBtn:'Esci',
    myOrders:'I miei ordini', changePw:'Cambia Password',
    heroTitle:'🍹 Le migliori offerte bar della tua città',
    heroSub:'Offerte esclusive per colazione, brunch, aperitivo ed eventi',
    buyBtn:'Acquista Deal', changePasswordTitle:'Cambia Password',
    oldPassword:'Vecchia Password', newPassword:'Nuova Password',
    confirmPassword:'Conferma Password', savePw:'Salva', cancelBtn:'Annulla',
    datum:'Data', uhrzeit:'Ora', kategorie:'Categoria', standort:'Posizione',
    alle:'Tutti', heute:'Oggi', morgen:'Domani', jederzeit:'Sempre', jetzt:'Adesso', mittag:'Pranzo', abend:'Sera', suchen:'Cerca',
    profitiere:'Approfitta ora!', bestellt:'Ordinato:', gutscheinCode:'Codice voucher:',
    keineDeals:'Nessun deal trovato', andereFilter:'Prova altri filtri',
    keineBestellungen:'Nessun ordine', nochNichts:'Non hai ancora ordinato nulla',
    forgotPw:'Password dimenticata?', sendCode:'Invia codice', abbrechen:'Annulla',
    code6:'Codice (6 cifre)', neuesPw:'Nuova password (min. 8 caratteri)', pwAendern:'Cambia password',
    nurAm:'Solo il', giltFuer:'Valido per:', getraenke:'Bevande', essen:'Cibo', alles:'Tutto',
    refundReq:'Richiedi rimborso', refundRequested:'Rimborso richiesto', refunded:'Rimborsato',
    remaining:'rimanenti', anmelden:'Accedi', registrieren:'Registrati',
    fUeberUns:'Chi siamo', fSoFunktionierts:'Come funziona', fImpressum:'Impressum', fDatenschutz:'Privacy', fAGB:'Condizioni', fKontakt:'Contatto', fFuerBars:'Per bar \u2192 Portale Bar', loginSubmitBtn:'Accedi', cancelLoginBtn:'Annulla', suchenBtn:'Cerca', anmeldenTitle:'Accedi', searchBarDeal:'Cerca bar o offerta...', searchPLZ:'CAP o città...',
    gutscheinAnzeigen:'Visualizza', linkKopieren:'Copia link', linkKopiert:'Link copiato!',
  },
  fr: {
    deals:'Deals', orders:'Commandes',
    loginBtn:'Connexion / Inscription', logoutBtn:'Déconnexion',
    myOrders:'Mes commandes', changePw:'Changer mot de passe',
    heroTitle:'🍹 Les meilleures offres bar de ta ville',
    heroSub:'Offres exclusives pour petit-déjeuner, brunch, apéritif et événements',
    buyBtn:'Acheter Deal', changePasswordTitle:'Changer mot de passe',
    oldPassword:'Ancien mot de passe', newPassword:'Nouveau mot de passe',
    confirmPassword:'Confirmer', savePw:'Enregistrer', cancelBtn:'Annuler',
    datum:'Date', uhrzeit:'Heure', kategorie:'Catégorie', standort:'Lieu', jederzeit:'À tout moment',
    profitiere:'Profite maintenant!', bestellt:'Commandé:', gutscheinCode:'Code bon:',
    keineDeals:'Aucune offre trouvée', andereFilter:'Essaie d\'autres filtres',
    keineBestellungen:'Aucune commande', nochNichts:'Tu n\'as encore rien commandé',
    forgotPw:'Mot de passe oublié?', sendCode:'Envoyer le code', abbrechen:'Annuler',
    code6:'Code (6 chiffres)', neuesPw:'Nouveau mot de passe (min. 8 caractères)', pwAendern:'Changer',
    nurAm:'Uniquement le', giltFuer:'Valable pour:', getraenke:'Boissons', essen:'Nourriture', alles:'Tout',
    refundReq:'Demander remboursement', refundRequested:'Remboursement demandé', refunded:'Remboursé',
    remaining:'restant', anmelden:'Connexion', registrieren:'Inscription',
    fUeberUns:'À propos', fSoFunktionierts:'Comment ça marche', fImpressum:'Mentions légales', fDatenschutz:'Confidentialité', fAGB:'CGV', fKontakt:'Contact', fFuerBars:'Pour bars \u2192 Portail Bar', loginSubmitBtn:'Connexion', cancelLoginBtn:'Annuler', suchenBtn:'Chercher', anmeldenTitle:'Connexion', searchBarDeal:'Chercher bar ou offre...', searchPLZ:'NPA ou ville...',
    gutscheinAnzeigen:'Afficher', linkKopieren:'Copier le lien', linkKopiert:'Lien copié!',
    alle:'Tous', heute:"Aujourd'hui", morgen:'Demain',
  }
};

let shopLang = 'de';
function st(key) { return SHOP_TRANSLATIONS[shopLang][key] || SHOP_TRANSLATIONS.de[key] || key; }

function setShopLang(lang) {
  shopLang = lang;
  _shopLang = lang;
  localStorage.setItem('barsclusive_lang', lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('.shop-lang-btn').forEach(function(b) { b.classList.remove('active'); b.style.borderColor = '#333'; b.style.color = '#888'; });
  var activeBtn = document.getElementById('shopLang' + lang.toUpperCase());
  if (activeBtn) { activeBtn.classList.add('active'); activeBtn.style.borderColor = '#FF3366'; activeBtn.style.color = '#fff'; }
  applyShopTranslations();
}

function applyShopTranslations() {
  const heroTitle = document.querySelector('.hero h1');
  const heroSub   = document.querySelector('.hero p');
  if (heroTitle) heroTitle.textContent = st('heroTitle');
  if (heroSub)   heroSub.textContent   = st('heroSub');
  const btnDeals  = document.getElementById('btnDeals');
  if (btnDeals) btnDeals.textContent = '🏠 ' + st('deals');
  const btnOrders = document.getElementById('btnOrders');
  if (btnOrders) btnOrders.textContent = '📦 ' + st('orders');
  // Translate footer links
  document.querySelectorAll('[data-shop-i18n]').forEach(function(el) {
    var k = el.getAttribute('data-shop-i18n');
    var t = st(k);
    if (t && t !== k) el.textContent = t;
  });
  // Translate data-i18n elements (filter labels etc)
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var k = el.getAttribute('data-i18n');
    var trans = (SHOP_TRANSLATIONS[shopLang] || {})[k];
    if (trans) el.textContent = trans;
  });
  // Translate placeholders
  var ss = document.getElementById('shopSearch');
  if (ss) ss.placeholder = st('searchBarDeal');
  var li = document.getElementById('locationInput');
  if (li) li.placeholder = st('searchPLZ');
  renderDeals();
}

// =============================================
// CUSTOMER — CHANGE PASSWORD
// =============================================
function openChangePwModal() {
  document.getElementById('changePwModal').classList.add('active');
  document.getElementById('userDropdown').classList.remove('show');
  document.getElementById('cpwErr').textContent = '';
  ['cpwOld','cpwNew','cpwConfirm'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function closeChangePwModal() {
  document.getElementById('changePwModal').classList.remove('active');
}

async function doChangePassword() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  const oldPw  = document.getElementById('cpwOld').value;
  const newPw  = document.getElementById('cpwNew').value;
  const confPw = document.getElementById('cpwConfirm').value;
  const err    = document.getElementById('cpwErr');
  err.textContent = '';
  if (!oldPw || !newPw || !confPw) { err.textContent = 'Alle Felder ausfüllen.'; return; }
  if (newPw.length < 8) { err.textContent = 'Neues Passwort mind. 8 Zeichen.'; return; }
  if (newPw !== confPw) { err.textContent = 'Passwörter stimmen nicht überein.'; return; }
  try {
    const r = await api({ action: 'changePassword', token: s.token, old_password: oldPw, new_password: newPw });
    if (r.success) {
      showToast('✅ Passwort geändert!');
      closeChangePwModal();
    } else {
      err.textContent = r.error || 'Fehler.';
    }
  } catch (e) { err.textContent = 'Verbindungsfehler.'; }
}

// Bind lang + password change on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  var langDE = document.getElementById('shopLangDE');
  var langEN = document.getElementById('shopLangEN');
  var langIT = document.getElementById('shopLangIT');
  var langFR = document.getElementById('shopLangFR');
  if (langDE) langDE.addEventListener('click', function(){setShopLang('de')});
  if (langEN) langEN.addEventListener('click', function(){setShopLang('en')});
  if (langIT) langIT.addEventListener('click', function(){setShopLang('it')});
  if (langFR) langFR.addEventListener('click', function(){setShopLang('fr')});
  // Init from localStorage
  var savedLang = localStorage.getItem('barsclusive_lang') || 'de';
  setShopLang(savedLang);

  const changePwBtn = document.getElementById('dropdownChangePw');
  if (changePwBtn) changePwBtn.addEventListener('click', openChangePwModal);

  const btnClosePw = document.getElementById('btnClosePwModal');
  if (btnClosePw) btnClosePw.addEventListener('click', closeChangePwModal);

  const btnSavePw = document.getElementById('btnSavePassword');
  if (btnSavePw) btnSavePw.addEventListener('click', doChangePassword);

  const cpwModal = document.getElementById('changePwModal');
  if (cpwModal) cpwModal.addEventListener('click', function(e) {
    if (e.target === this) closeChangePwModal();
  });
});


// =============================================
// SEARCH (works without login)
// =============================================
var _searchTimer = null;
document.addEventListener('DOMContentLoaded', function() {
  var si = document.getElementById('shopSearch');
  if (si) si.addEventListener('input', function() {
    clearTimeout(_searchTimer);
    var v = this.value.toLowerCase();
    _searchTimer = setTimeout(function() { filters.search = v; renderDeals(); }, 250);
  });
  var btnFav = document.getElementById('btnFavorites');
  if (btnFav) btnFav.addEventListener('click', function() { showView('favorites'); });
  var btnApplyLoc = document.getElementById('btnApplyLocation');
  if (btnApplyLoc) btnApplyLoc.addEventListener('click', applyLocation);
  var btnClearLoc = document.getElementById('btnClearLocation');
  if (btnClearLoc) btnClearLoc.addEventListener('click', clearLocation);
  var locInput = document.getElementById('locationInput');
  if (locInput) locInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') applyLocation(); });
});

// =============================================
// FAVORITES
// =============================================
async function loadFavorites() {
  var s = sessionGet();
  if (!s) return;
  try {
    var r = await api({ action: 'getFavorites', token: s.token });
    if (r.success) _favorites = r.deal_ids || r.bar_ids || [];
  } catch(e) {}
}

async function toggleFavorite(dealId, btn) {
  var s = sessionGet();
  if (!s) { showToast('Bitte einloggen', true); return; }
  var isFav = _favorites.indexOf(dealId) !== -1;
  try {
    var r = await api({ action: isFav ? 'removeFavorite' : 'addFavorite', token: s.token, deal_id: dealId });
    if (r.success) {
      if (isFav) _favorites = _favorites.filter(function(id) { return id !== dealId; });
      else _favorites.push(dealId);
      btn.textContent = isFav ? '\u{1F90D}' : '\u2764\uFE0F';
    }
  } catch(e) {}
}

function showFavorites() {
  var el = document.getElementById('favoritesList');
  if (!el) return;
  el.innerHTML = '';
  if (!_favorites.length) { el.innerHTML = '<div class="empty"><h3>Noch keine Favoriten</h3><p>Klicke \u2764\uFE0F bei einem Deal</p></div>'; return; }
  var favDeals = allDeals.filter(function(d) { return _favorites.indexOf(d.id) !== -1; });
  if (!favDeals.length) { el.innerHTML = '<div class="empty"><h3>Keine aktiven Deals von Favoriten</h3></div>'; return; }
  favDeals.forEach(function(d) { el.appendChild(buildDealCard(d)); });
}

// Load favorites on page load if logged in
window.addEventListener('load', function() { loadFavorites(); });


// =============================================
// DEAL DETAIL MODAL
// =============================================
var _detailDeal = null;

function openDealDetail(deal) {
  _detailDeal = deal;
  var modal = document.getElementById('dealDetailModal');
  if (!modal) return;
  
  var isPauschal = (deal.categories || []).indexOf('pauschalgutscheine') !== -1;
  
  // Image
  var imgDiv = document.getElementById('ddImg');
  var existingImg = imgDiv.querySelector('img');
  if (existingImg) existingImg.remove();
  if (deal.image_url) {
    var img = document.createElement('img');
    var gid = '';
    var u = deal.image_url;
    if (u.indexOf('lh3.googleusercontent.com/d/') >= 0) gid = u.split('/d/')[1].split('=')[0];
    else if (u.indexOf('thumbnail?id=') >= 0) gid = u.split('id=')[1].split('&')[0];
    else if (u.indexOf('/d/') >= 0) gid = (u.split('/d/')[1] || '').split('/')[0];
    if (gid) img.src = 'https://lh3.googleusercontent.com/d/' + gid + '=w800';
    else img.src = u;
    img.referrerPolicy = 'no-referrer';
    img.onerror = function() { this.style.display='none'; };
    imgDiv.insertBefore(img, imgDiv.firstChild);
  }
  
  document.getElementById('ddTitle').textContent = deal.title;
  document.getElementById('ddBar').textContent = deal.bar_name + (deal.bar_city ? ' \u2022 ' + deal.bar_city : '');
  document.getElementById('ddDesc').textContent = deal.description || '';
  document.getElementById('ddPrice').textContent = Number(deal.deal_price).toFixed(2) + ' CHF';
  var origEl = document.getElementById('ddOrig');
  if (deal.original_price > deal.deal_price) {
    origEl.textContent = Number(deal.original_price).toFixed(2) + ' CHF';
    origEl.style.display = 'inline';
  } else { origEl.style.display = 'none'; }
  
  // Info section
  var info = '';
  if (deal.bar_address) info += '<div><span style="color:#999">Adresse</span><span>' + escHtml(deal.bar_address) + ', ' + escHtml(deal.bar_zip || '') + ' ' + escHtml(deal.bar_city || '') + '</span></div>';
  if (isPauschal) {
    if (deal.discount_percent) info += '<div><span style="color:#999">Rabatt</span><span style="color:#FF3366;font-weight:700">' + deal.discount_percent + '%</span></div>';
    if (deal.min_order) info += '<div><span style="color:#999">Mindestbestellung</span><span>' + deal.min_order + ' CHF</span></div>';
    info += '<div><span style="color:#999">Typ</span><span>Pauschalgutschein</span></div>';
  }
  var weekdays = deal.valid_weekdays || [];
  if (weekdays.length) info += '<div><span style="color:#999">Wochentage</span><span>' + weekdays.join(', ') + '</span></div>';
  if (deal.valid_from_time && deal.valid_to_time) info += '<div><span style="color:#999">Zeit</span><span>' + deal.valid_from_time + ' - ' + deal.valid_to_time + '</span></div>';
  if (deal.max_quantity > 0) info += '<div><span style="color:#999">Verfügbar</span><span>' + Math.max(0, deal.max_quantity - (deal.sold_count||0)) + ' / ' + deal.max_quantity + '</span></div>';
  document.getElementById('ddInfo').innerHTML = info || '<div style="color:#666">Keine weiteren Details</div>';
  
  // Share buttons
  var shareUrl = window.location.origin + window.location.pathname + '?deal=' + deal.id;
  var shareText = deal.title + ' bei ' + deal.bar_name + ' - nur ' + Number(deal.deal_price).toFixed(2) + ' CHF!';
  var shareEl = document.getElementById('ddShare');
  shareEl.innerHTML = '';
  var shareItems = [
    ['📋 Link kopieren', function() { copyDealLink(); }],
    ['💬 WhatsApp', function() { shareDeal('whatsapp'); }],
    ['📘 Facebook', function() { shareDeal('facebook'); }],
    ['✈️ Telegram', function() { shareDeal('telegram'); }],
    ['📸 Instagram', function() { copyDealLink(); showToast('Link kopiert – jetzt in Instagram Story einfügen!'); }],
    ['🎵 TikTok', function() { copyDealLink(); showToast('Link kopiert – jetzt in TikTok einfügen!'); }]
  ];
  if (navigator.share) {
    shareItems.unshift(['📱 Teilen', function() {
      navigator.share({ title: deal.title, text: shareText, url: shareUrl }).catch(function() {});
    }]);
  }
  shareItems.forEach(function(s) {
    var btn = document.createElement('button');
    btn.className = 'share-btn';
    btn.textContent = s[0];
    btn.addEventListener('click', s[1]);
    shareEl.appendChild(btn);
  });
  
  // Buy button
  document.getElementById('ddBuyBtn').onclick = function() { closeDealDetail(); openBuyModal(deal); };
  // Add cart button in detail
  var ddCartBtn = document.getElementById('ddCartBtn');
  if (!ddCartBtn) {
    ddCartBtn = document.createElement('button');
    ddCartBtn.id = 'ddCartBtn';
    ddCartBtn.style.cssText = 'width:100%;background:#2a2a2a;border:1px solid #3a3a3a;color:#fff;padding:12px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px';
    document.getElementById('ddBuyBtn').after(ddCartBtn);
  }
  ddCartBtn.textContent = '🛒 In den Warenkorb';
  ddCartBtn.onclick = function() { addToCart(deal); };
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDealDetail() {
  var modal = document.getElementById('dealDetailModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  _detailDeal = null;
}

function copyDealLink() {
  if (!_detailDeal) return;
  var url = window.location.origin + window.location.pathname + '?deal=' + _detailDeal.id;
  navigator.clipboard.writeText(url).then(function() { showToast('Link kopiert!'); }).catch(function() { showToast('Link: ' + url); });
}

function shareDeal(platform) {
  if (!_detailDeal) return;
  var d = _detailDeal;
  var url = encodeURIComponent(window.location.origin + window.location.pathname + '?deal=' + d.id);
  var text = encodeURIComponent(d.title + ' bei ' + d.bar_name + ' - nur ' + Number(d.deal_price).toFixed(2) + ' CHF!');
  var link = '';
  if (platform === 'whatsapp') link = 'https://wa.me/?text=' + text + '%20' + url;
  else if (platform === 'facebook') link = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
  else if (platform === 'telegram') link = 'https://t.me/share/url?url=' + url + '&text=' + text;
  if (link) window.open(link, '_blank');
}

// Voucher sharing functions
function copyVoucherLink(code) {
  var url = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'voucher.html?code=' + encodeURIComponent(code);
  navigator.clipboard.writeText(url).then(function() { showToast(shopT('linkKopiert') || 'Link kopiert!'); }).catch(function() { showToast('Link: ' + url); });
}

function shareVoucher(code, dealTitle, platform) {
  var url = encodeURIComponent(window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'voucher.html?code=' + code);
  var text = encodeURIComponent((dealTitle || 'BarSclusive Gutschein') + ' - ' + code);
  var link = '';
  if (platform === 'whatsapp') link = 'https://wa.me/?text=' + text + '%20' + url;
  else if (platform === 'telegram') link = 'https://t.me/share/url?url=' + url + '&text=' + text;
  else if (platform === 'facebook') link = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
  if (link) window.open(link, '_blank');
}

// Close modal on backdrop click
document.addEventListener('click', function(e) {
  var modal = document.getElementById('dealDetailModal');
  if (modal && e.target === modal) closeDealDetail();
});

// Open deal from URL parameter
window.addEventListener('load', function() {
  var params = new URLSearchParams(window.location.search);
  var dealId = params.get('deal');
  if (dealId && allDeals.length) {
    var d = allDeals.find(function(x) { return x.id === dealId; });
    if (d) setTimeout(function() { openDealDetail(d); }, 300);
  }
});

// =============================================
// GEOLOCATION
// =============================================
var _userLat = null, _userLng = null;

function showGeoBanner() {
  if (localStorage.getItem('barsclusive_geo_dismissed')) return;
  if (_userLat) return;
  var banner = document.getElementById('geoBanner');
  if (banner) banner.style.display = 'block';
}

function dismissGeoBanner() {
  var banner = document.getElementById('geoBanner');
  if (banner) banner.style.display = 'none';
  localStorage.setItem('barsclusive_geo_dismissed', '1');
}

function requestGeoPermission() {
  if (!navigator.geolocation) { showToast('Standort nicht verfügbar', true); dismissGeoBanner(); return; }
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      _userLat = pos.coords.latitude;
      _userLng = pos.coords.longitude;
      dismissGeoBanner();
      showToast('📍 Deals werden nach Nähe sortiert');
      sortDealsByDistance();
    },
    function() { dismissGeoBanner(); showToast('Standort nicht verfügbar', true); },
    { enableHighAccuracy: false, timeout: 10000 }
  );
}

function sortDealsByDistance() {
  if (!_userLat || !_userLng) return;
  allDeals.forEach(function(d) {
    if (d.bar_lat && d.bar_lng) {
      d._dist = haversine(_userLat, _userLng, Number(d.bar_lat), Number(d.bar_lng));
    } else { d._dist = 99999; }
  });
  allDeals.sort(function(a, b) { return (a._dist || 99999) - (b._dist || 99999); });
  renderDeals();
}

// Show geo banner after page load
window.addEventListener('load', function() { setTimeout(showGeoBanner, 2000); });


// =============================================
// CART
// =============================================
var _cart = [];

function getCart() { try { _cart = JSON.parse(localStorage.getItem('barsclusive_cart')||'[]'); } catch(e) { _cart = []; } return _cart; }
function saveCart() { try { localStorage.setItem('barsclusive_cart', JSON.stringify(_cart)); } catch(e) {} updateCartBadge(); }

function addToCart(deal) {
  getCart();
  var existing = _cart.find(function(c) { return c.deal_id === deal.id; });
  if (existing) { existing.quantity++; }
  else { _cart.push({ deal_id: deal.id, title: deal.title, bar_name: deal.bar_name, price: deal.deal_price, quantity: 1, image_url: deal.image_url || '' }); }
  saveCart();
  showToast('\u{1F6D2} ' + deal.title + ' zum Warenkorb hinzugefügt');
}

function removeFromCart(dealId) {
  getCart();
  _cart = _cart.filter(function(c) { return c.deal_id !== dealId; });
  saveCart();
  renderCartPanel();
}

function changeCartQty(dealId, delta) {
  getCart();
  var item = _cart.find(function(c) { return c.deal_id === dealId; });
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart();
  renderCartPanel();
}

function getCartTotal() {
  getCart();
  var total = 0;
  _cart.forEach(function(c) { total += c.price * c.quantity; });
  return total;
}

function updateCartBadge() {
  getCart();
  var badge = document.getElementById('cartBadge');
  var count = 0;
  _cart.forEach(function(c) { count += c.quantity; });
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
}

function toggleCartPanel() {
  var panel = document.getElementById('cartPanel');
  if (!panel) return;
  panel.classList.toggle('active');
  if (panel.classList.contains('active')) renderCartPanel();
}

function renderCartPanel() {
  var body = document.getElementById('cartBody');
  if (!body) return;
  getCart();
  if (!_cart.length) { body.innerHTML = '<div style="text-align:center;padding:40px;color:#666">Warenkorb ist leer</div>'; return; }
  body.innerHTML = '';
  _cart.forEach(function(c) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #222';
    
    var info = document.createElement('div');
    info.style.flex = '1';
    info.innerHTML = '<div style="font-weight:600;font-size:14px">' + escHtml(c.title) + '</div><div style="font-size:12px;color:#999">' + escHtml(c.bar_name) + '</div>';
    
    var controls = document.createElement('div');
    controls.style.cssText = 'display:flex;align-items:center;gap:8px';
    
    var btnMinus = document.createElement('button');
    btnMinus.textContent = '-';
    btnMinus.style.cssText = 'background:#333;color:#fff;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px';
    btnMinus.addEventListener('click', (function(id) { return function() { changeCartQty(id, -1); }; })(c.deal_id));
    
    var qtySpan = document.createElement('span');
    qtySpan.style.cssText = 'min-width:20px;text-align:center';
    qtySpan.textContent = c.quantity;
    
    var btnPlus = document.createElement('button');
    btnPlus.textContent = '+';
    btnPlus.style.cssText = 'background:#333;color:#fff;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px';
    btnPlus.addEventListener('click', (function(id) { return function() { changeCartQty(id, 1); }; })(c.deal_id));
    
    var priceSpan = document.createElement('span');
    priceSpan.style.cssText = 'min-width:60px;text-align:right;font-weight:700';
    priceSpan.textContent = (c.price * c.quantity).toFixed(2);
    
    var btnRemove = document.createElement('button');
    btnRemove.textContent = '✕';
    btnRemove.style.cssText = 'background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px';
    btnRemove.addEventListener('click', (function(id) { return function() { removeFromCart(id); }; })(c.deal_id));
    
    controls.append(btnMinus, qtySpan, btnPlus, priceSpan, btnRemove);
    row.append(info, controls);
    body.appendChild(row);
  });
  
  var totalDiv = document.createElement('div');
  totalDiv.style.cssText = 'padding:16px 0;font-size:18px;font-weight:700;text-align:right;border-top:2px solid #FF3366;margin-top:8px';
  totalDiv.textContent = 'Total: ' + getCartTotal().toFixed(2) + ' CHF';
  body.appendChild(totalDiv);
  
  var checkBtn = document.createElement('button');
  checkBtn.id = 'cartCheckoutBtn';
  checkBtn.textContent = 'Jetzt bezahlen';
  checkBtn.style.cssText = 'width:100%;background:#FF3366;color:#fff;border:none;padding:14px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;margin-top:8px';
  checkBtn.addEventListener('click', checkoutCart);
  body.appendChild(checkBtn);
}

async function checkoutCart() {
  getCart();
  if (!_cart.length) { showToast('Warenkorb ist leer', true); return; }
  var s = sessionGet();
  var buyerName, buyerEmail;
  if (s && s.name && s.email) {
    buyerName = s.name;
    buyerEmail = s.email;
  } else {
    // Use buy modal fields if user filled them for a previous purchase
    var nameEl = document.getElementById('buyName');
    var emailEl = document.getElementById('buyEmail');
    buyerName = nameEl ? nameEl.value.trim() : '';
    buyerEmail = emailEl ? emailEl.value.trim() : '';
  }
  if (!buyerName || !buyerEmail) {
    // Open a cart checkout dialog
    var name = prompt(shopT('deinName') || 'Dein Name:');
    if (!name) return;
    var email = prompt(shopT('deineEmail') || 'Deine Email:');
    if (!email) return;
    buyerName = name;
    buyerEmail = email;
  }
  
  var checkoutBtn = document.getElementById('cartCheckoutBtn');
  
  try {
    if (checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.textContent = '⏳ Wird verarbeitet...'; }
    var r = await api({
      action: 'createCartCheckout',
      items: _cart.map(function(c) { return { deal_id: c.deal_id, quantity: c.quantity }; }),
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      customer_id: s ? s.customerId : '',
      site_url: window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
    });
    if (r.success && r.checkout_url) {
      _cart = []; saveCart();
      window.location.href = r.checkout_url;
    } else {
      showToast(r.error || 'Checkout fehlgeschlagen', true);
      if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.textContent = 'Jetzt bezahlen'; }
    }
  } catch(e) { 
    showToast('Verbindungsfehler', true);
    if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.textContent = 'Jetzt bezahlen'; }
  }
}

// Init cart on load
window.addEventListener('load', function() { getCart(); updateCartBadge(); });

// =============================================
// EVENT BINDINGS for cart, deal modal, geo (no inline onclick needed)
// =============================================
document.addEventListener('DOMContentLoaded', function() {
  // Cart open/close
  var cartOpen = document.getElementById('cartOpenBtn');
  if (cartOpen) cartOpen.addEventListener('click', toggleCartPanel);
  var cartClose = document.getElementById('cartCloseBtn');
  if (cartClose) cartClose.addEventListener('click', toggleCartPanel);
  var cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.addEventListener('click', toggleCartPanel);
  
  // Deal detail close
  var ddClose = document.getElementById('dealDetailCloseBtn');
  if (ddClose) ddClose.addEventListener('click', closeDealDetail);
  
  // Geo banner
  var geoBtn = document.getElementById('geoPermBtn');
  if (geoBtn) geoBtn.addEventListener('click', requestGeoPermission);
  var geoDismiss = document.getElementById('geoDismissBtn');
  if (geoDismiss) geoDismiss.addEventListener('click', dismissGeoBanner);
});

// =============================================
// SHOP MAP (Leaflet)
// =============================================
var _shopMap = null;
var _shopMapMarkers = [];
var _mapView = false;

function initShopMap() {
  if (_shopMap) return;
  var el = document.getElementById('shopMap');
  if (!el) return;
  // Default to Switzerland center
  _shopMap = L.map('shopMap').setView([47.37, 8.54], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(_shopMap);
}

function updateShopMapMarkers() {
  if (!_shopMap) return;
  // Clear old markers
  _shopMapMarkers.forEach(function(m) { _shopMap.removeLayer(m); });
  _shopMapMarkers = [];
  
  // Group deals by bar (avoid duplicate markers)
  var barMap = {};
  allDeals.forEach(function(d) {
    if (!d.bar_lat || !d.bar_lng) return;
    var lat = Number(d.bar_lat), lng = Number(d.bar_lng);
    if (!lat || !lng) return;
    var key = d.bar_id || (lat + ',' + lng);
    if (!barMap[key]) barMap[key] = { lat: lat, lng: lng, name: d.bar_name, city: d.bar_city, deals: [] };
    barMap[key].deals.push(d);
  });
  
  var bounds = [];
  Object.keys(barMap).forEach(function(key) {
    var b = barMap[key];
    var popupHtml = '<div style="min-width:180px">'
      + '<strong style="font-size:14px">' + (b.name || '') + '</strong>'
      + '<div style="color:#666;font-size:12px;margin-bottom:6px">' + (b.city || '') + '</div>';
    b.deals.forEach(function(d) {
      popupHtml += '<div style="padding:4px 0;border-top:1px solid #eee;cursor:pointer" data-deal-id="' + d.id + '">'
        + '<span style="font-weight:600">' + d.title + '</span>'
        + '<span style="color:#FF3366;float:right">' + Number(d.deal_price).toFixed(2) + ' CHF</span>'
        + '</div>';
    });
    popupHtml += '</div>';
    
    var marker = L.marker([b.lat, b.lng]).addTo(_shopMap);
    marker.bindPopup(popupHtml);
    marker.on('popupopen', function() {
      // Attach click events to deal links in popup
      setTimeout(function() {
        document.querySelectorAll('[data-deal-id]').forEach(function(el) {
          el.addEventListener('click', function() {
            var dealId = this.getAttribute('data-deal-id');
            var deal = allDeals.find(function(dd) { return dd.id === dealId; });
            if (deal) { _shopMap.closePopup(); openDealDetail(deal); }
          });
        });
      }, 100);
    });
    _shopMapMarkers.push(marker);
    bounds.push([b.lat, b.lng]);
  });
  
  // Fit bounds if we have markers
  if (bounds.length > 0) {
    if (bounds.length === 1) { _shopMap.setView(bounds[0], 14); }
    else { _shopMap.fitBounds(bounds, { padding: [30, 30] }); }
  }
}

function toggleMapView(showMap) {
  _mapView = showMap;
  var mapWrap = document.getElementById('shopMapWrap');
  var dealsView = document.getElementById('dealsView');
  var btnGrid = document.getElementById('viewGrid');
  var btnMap = document.getElementById('viewMap');
  
  if (showMap) {
    if (mapWrap) mapWrap.style.display = 'block';
    if (dealsView) dealsView.style.display = 'none';
    if (btnMap) { btnMap.style.background = '#FF3366'; btnMap.style.color = '#fff'; btnMap.style.borderColor = '#FF3366'; }
    if (btnGrid) { btnGrid.style.background = '#2a2a2a'; btnGrid.style.color = '#ccc'; btnGrid.style.borderColor = '#3a3a3a'; }
    initShopMap();
    setTimeout(function() { if (_shopMap) _shopMap.invalidateSize(); updateShopMapMarkers(); }, 200);
  } else {
    if (mapWrap) mapWrap.style.display = 'none';
    if (dealsView) dealsView.style.display = 'block';
    if (btnGrid) { btnGrid.style.background = '#FF3366'; btnGrid.style.color = '#fff'; btnGrid.style.borderColor = '#FF3366'; }
    if (btnMap) { btnMap.style.background = '#2a2a2a'; btnMap.style.color = '#ccc'; btnMap.style.borderColor = '#3a3a3a'; }
  }
}

// Bind map toggle buttons
document.addEventListener('DOMContentLoaded', function() {
  var btnGrid = document.getElementById('viewGrid');
  var btnMap = document.getElementById('viewMap');
  if (btnGrid) btnGrid.addEventListener('click', function() { toggleMapView(false); });
  if (btnMap) btnMap.addEventListener('click', function() { toggleMapView(true); });
});

// Update map markers when deals are loaded
var _origRenderDeals = typeof renderDeals === 'function' ? renderDeals : null;
// Hook into deals loading to update map
window.addEventListener('load', function() {
  // After deals are loaded, update map markers if map is visible
  var checkInterval = setInterval(function() {
    if (allDeals && allDeals.length > 0) {
      clearInterval(checkInterval);
      if (_mapView && _shopMap) updateShopMapMarkers();
    }
  }, 1000);
});
