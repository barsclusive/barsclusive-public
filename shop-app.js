// =============================================
// CONFIGURATION
// =============================================
const BACKEND_URL  = 'https://script.google.com/macros/s/AKfycbz1zkTHlVpnFgbMlscbjgGHXDRwhoAqYQeasInpWUDzn6dzC2aFC_DEykj_itklCHILRA/exec';
// WhatsApp removed - Stripe only

// No API key: a key in frontend JS is public and provides no auth.

// =============================================
// SESSION — in-memory only
// =============================================
let _session = null;

function sessionSet(token, name, email, role) {
  _session = { token, name, email, role, expiresAt: Date.now() + 90 * 60 * 1000 };
  try { localStorage.setItem('barsclusive_customer_session', JSON.stringify(_session)); } catch(e) {}
  document.getElementById('userBtn').textContent = '👤 ' + escHtml(name);
  document.getElementById('btnOrders').style.display = 'block';
  var bf = document.getElementById('btnFavorites'); if(bf) bf.style.display = 'block';
}

function sessionGet() {
  if (!_session) {
    try { var s = localStorage.getItem('barsclusive_customer_session'); if (s) _session = JSON.parse(s); } catch(e) {}
  }
  if (!_session || Date.now() > _session.expiresAt) { sessionClear(); return null; }
  return _session;
}

function sessionClear() {
  _session = null;
  try { localStorage.removeItem('barsclusive_customer_session'); } catch(e) {}
  document.getElementById('userBtn').textContent = '👤 Login';
  document.getElementById('btnOrders').style.display = 'none';
  var bf2 = document.getElementById('btnFavorites'); if(bf2) bf2.style.display = 'none';
  _favorites = [];
  document.getElementById('userDropdown').classList.remove('show');
}

// Restore session on page load
window.addEventListener('load', function() {
  var s = sessionGet();
  if (s) {
    document.getElementById('userBtn').textContent = '👤 ' + escHtml(s.name);
    document.getElementById('btnOrders').style.display = 'block';
    var bf = document.getElementById('btnFavorites'); if(bf) bf.style.display = 'block';
  }
});

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
let _locationState = { label: '', lat: null, lng: null, source: '', textFilter: '' };

window.addEventListener('load', () => { restoreLocationState(); loadDeals(); });

function isValidCoord(v) { return typeof v === 'number' && isFinite(v) && Math.abs(v) > 0; }
function saveLocationState() {
  try { localStorage.setItem('barsclusive_shop_location', JSON.stringify(_locationState)); } catch(e) {}
}
function restoreLocationState() {
  try {
    var raw = localStorage.getItem('barsclusive_shop_location');
    if (!raw) return;
    var parsed = JSON.parse(raw);
    if (!parsed) return;
    _locationState = Object.assign(_locationState, parsed);
    if (parsed.label && document.getElementById('locationInput')) document.getElementById('locationInput').value = parsed.label;
    filters.city = parsed.textFilter || '';
    if (isValidCoord(Number(parsed.lat)) && isValidCoord(Number(parsed.lng))) {
      _userLat = Number(parsed.lat);
      _userLng = Number(parsed.lng);
    }
    updateLocationUi();
  } catch(e) {}
}
function updateLocationUi() {
  var clearBtn = document.getElementById('btnClearLocation');
  var statusEl = document.getElementById('locationStatus');
  var inputEl = document.getElementById('locationInput');
  var hasLocation = !!(filters.city || _locationState.label || (isValidCoord(Number(_userLat)) && isValidCoord(Number(_userLng))));
  if (clearBtn) clearBtn.style.display = hasLocation ? 'inline-block' : 'none';
  if (statusEl) {
    if (_locationState.label) {
      statusEl.style.display = 'inline-flex';
      statusEl.textContent = '📍 ' + _locationState.label;
    } else {
      statusEl.style.display = 'none';
      statusEl.textContent = '';
    }
  }
  if (inputEl && _locationState.label && document.activeElement !== inputEl) inputEl.value = _locationState.label;
}
function setFilter(type, val, btn) {
  filters[type] = val;
  const attr = { date: 'data-filter-date', time: 'data-filter-time', cat: 'data-filter-cat' }[type];
  if (attr) document.querySelectorAll('.filter-btn[' + attr + ']').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderDeals();
}
function setCustomDate(val) {
  filters.date = 'custom';
  filters.customDate = val;
  document.querySelectorAll('.filter-btn[data-filter-date]').forEach(b => b.classList.remove('active'));
  renderDeals();
}
async function geocodeLocationQuery(query) {
  var q = String(query || '').trim();
  if (q.length < 2) return [];
  try {
    var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=ch&q=' + encodeURIComponent(q);
    var resp = await fetch(url, { headers: { 'Accept-Language': 'de' } });
    var data = await resp.json();
    return Array.isArray(data) ? data : [];
  } catch(e) { return []; }
}
function mapLocationResult(item) {
  var a = item.address || {};
  var city = a.city || a.town || a.village || a.hamlet || a.municipality || '';
  var zip = a.postcode || '';
  var title = item.display_name || [a.road, a.house_number, zip, city].filter(Boolean).join(', ');
  return {
    label: [title].filter(Boolean).join(''),
    shortLabel: [zip, city].filter(Boolean).join(' ') || city || title,
    textFilter: (city || zip || title).toLowerCase(),
    lat: Number(item.lat),
    lng: Number(item.lon)
  };
}
function applySelectedLocation(place) {
  _locationState = {
    label: place.label || place.shortLabel || '',
    lat: Number(place.lat),
    lng: Number(place.lng),
    source: 'search',
    textFilter: (place.textFilter || '').toLowerCase()
  };
  _userLat = Number(place.lat);
  _userLng = Number(place.lng);
  filters.city = _locationState.textFilter;
  saveLocationState();
  updateLocationUi();
  sortDealsByDistance();
}
async function applyLocation() {
  var input = document.getElementById('locationInput');
  var val = (input && input.value || '').trim();
  if (!val) { clearLocation(); return; }
  var results = await geocodeLocationQuery(val);
  if (results.length) {
    applySelectedLocation(mapLocationResult(results[0]));
  } else {
    filters.city = val.toLowerCase();
    _locationState.label = val;
    _locationState.textFilter = val.toLowerCase();
    _locationState.source = 'text';
    _locationState.lat = null; _locationState.lng = null;
    _userLat = null; _userLng = null;
    saveLocationState();
    updateLocationUi();
    renderDeals();
  }
}
function clearLocation() {
  filters.city = '';
  _locationState = { label: '', lat: null, lng: null, source: '', textFilter: '' };
  _userLat = null; _userLng = null;
  var input = document.getElementById('locationInput');
  if (input) input.value = '';
  saveLocationState();
  updateLocationUi();
  renderDeals();
}
function attachDistances() {
  var hasCoords = isValidCoord(Number(_userLat)) && isValidCoord(Number(_userLng));
  allDeals.forEach(function(d) {
    var lat = Number(d.bar_lat), lng = Number(d.bar_lng);
    if (hasCoords && isValidCoord(lat) && isValidCoord(lng)) d._dist = haversine(Number(_userLat), Number(_userLng), lat, lng);
    else delete d._dist;
  });
}
function haversine(la1, lo1, la2, lo2) {
  const R  = 6371;
  const dL = (la2 - la1) * Math.PI / 180;
  const dO = (lo2 - lo1) * Math.PI / 180;
  const a  = Math.sin(dL/2)**2 + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function sortDealsByDistance() {
  attachDistances();
  renderDeals();
}
function getVisibleDeals() {
  attachDistances();
  var visible = allDeals.filter(function(d) {
    if (filters.cat !== 'all' && !(d.categories || []).includes(filters.cat)) return false;
    if (!matchDate(d)) return false;
    if (!matchTime(d)) return false;
    if (filters.search) {
      var hay = ((d.title||'') + ' ' + (d.bar_name||'') + ' ' + (d.bar_city||'') + ' ' + (d.description||'')).toLowerCase();
      if (!hay.includes(filters.search)) return false;
    }
    if (filters.city) {
      var q = String(filters.city).toLowerCase();
      var haystack = ((d.bar_city||'') + ' ' + (d.bar_zip||'') + ' ' + (d.bar_address||'')).toLowerCase();
      if (/^\d+$/.test(q)) {
        var prefix = q.length >= 2 ? q.substring(0, 2) : q;
        if (!(String(d.bar_zip||'').startsWith(prefix))) return false;
      } else if (!haystack.includes(q)) {
        return false;
      }
    }
    return true;
  });
  var hasCoords = isValidCoord(Number(_userLat)) && isValidCoord(Number(_userLng));
  visible.sort(function(a,b) {
    if (hasCoords) {
      var da = typeof a._dist === 'number' ? a._dist : 9999;
      var db = typeof b._dist === 'number' ? b._dist : 9999;
      if (da !== db) return da - db;
    }
    var dA = a.original_price > 0 ? (1 - a.deal_price/a.original_price) : 0;
    var dB = b.original_price > 0 ? (1 - b.deal_price/b.original_price) : 0;
    return dB - dA;
  });
  return visible;
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
      attachDistances();
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
  const visible = getVisibleDeals();

  if (!visible.length) {
    el.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'empty-state';
    div.style.cssText = 'grid-column:1/-1;text-align:center;padding:70px 20px;color:#666';
    div.innerHTML = '<div style="font-size:56px;margin-bottom:10px">🍸</div><div style="font-size:18px;font-weight:700;margin-bottom:6px">' + escHtml(shopT('keineDeals') || 'Keine Deals gefunden') + '</div><div style="font-size:14px">' + escHtml(shopT('andereFilter') || 'Versuche andere Filter') + '</div>';
    el.appendChild(div);
    if (_shopMap && _mapView) updateShopMapMarkers();
    return;
  }

  el.innerHTML = '';
  visible.forEach(function(deal) { el.appendChild(buildDealCard(deal)); });
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
  if (deal._dist !== undefined && deal._dist < 200) {
    const b = document.createElement('div');
    b.className = 'badge-dist';
    b.textContent = formatDistanceLabel(deal._dist);
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
  cartBtn.title = shopT('cartAddTitle') || 'In den Warenkorb';
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

  var distLine = document.createElement('div');
  distLine.className = 'deal-distance-line';
  if (typeof deal._dist === 'number' && isFinite(deal._dist)) {
    distLine.textContent = '📍 ' + formatDistanceLabel(deal._dist);
  } else {
    distLine.style.display = 'none';
  }

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

  content.append(title, bar, addrDiv, distLine, tsContainer, validity, priceBtn);
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
  if (!name || !email) { showToast(shopT('nameEmailRequired') || 'Name und Email sind Pflichtfelder', true); return; }
  if (!consent) { showToast(shopT('buyConsentError') || 'Bitte AGB & Datenschutz akzeptieren', true); return; }
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

      if (navigator.share) {
        var nsBtn = document.createElement('button');
        nsBtn.className = 'share-btn';
        nsBtn.textContent = '📱 ' + (shopT('shareBtn') || 'Teilen');
        nsBtn.addEventListener('click', (function(c, t) { return function() {
          var vUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'voucher.html?code=' + encodeURIComponent(c);
          navigator.share({ title: t || 'BarSclusive Voucher', url: vUrl }).catch(function() {});
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
  if (!confirm(shopT('refundConfirm') || 'Rückerstattung anfordern?\nDer Gutschein wird ungültig.')) return;
  const s = sessionGet();
  if (!s) { showToast(shopT('notLoggedIn') || 'Nicht eingeloggt', true); return; }

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
  var defaultLabel = shopT('loginSubmitBtn') || 'Einloggen';
  if (_loginBtn) { _loginBtn.disabled = true; _loginBtn.textContent = '⏳...'; }
  try {
    const r = await api({ action: 'customerLogin', email, password });
    if (r.success) {
      sessionSet(r.token, r.customer.name, r.customer.email, 'customer');
      closeModal('loginModal');
      document.getElementById('loginPassword').value = '';
      showToast('✅ Eingeloggt!');
      Promise.resolve().then(loadFavorites).catch(function(){});
      if (document.getElementById('ordersView') && document.getElementById('ordersView').style.display === 'block') {
        Promise.resolve().then(loadOrders).catch(function(){});
      }
    } else {
      showToast(r.error || 'Ungültige Zugangsdaten', true);
      document.getElementById('loginPassword').value = '';
    }
  } catch (e) {
    showToast('Verbindungsfehler', true);
  } finally {
    if (_loginBtn) { _loginBtn.disabled = false; _loginBtn.textContent = defaultLabel; }
  }
}

async function doRegister() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const consent  = document.getElementById('regConsent').checked;

  if (!name || !email || !password) { showToast('Alle Felder ausfüllen', true); return; }
  if (password.length < 8)           { showToast('Passwort mind. 8 Zeichen', true); return; }
  var passConfirm = document.getElementById('regPasswordConfirm') ? document.getElementById('regPasswordConfirm').value : password;
  if (password !== passConfirm)      { showToast('Passwörter stimmen nicht überein', true); return; }
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
  showToast(shopT('logoutSuccess') || 'Ausgeloggt');
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
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('active');
  if (id === 'buyModal') {
    var btn = document.getElementById('btnBuySubmit');
    if (btn) { btn.disabled = false; btn.textContent = '💳 Jetzt bezahlen'; }
  }
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
      showToast(shopT('passwordChangedSuccess') || '✅ Passwort geändert!');
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
    fUeberUns:'Über uns', fSoFunktionierts:'So funktionierts', fImpressum:'Impressum', fDatenschutz:'Datenschutz', fAGB:'AGB', fKontakt:'Kontakt', fFuerBars:'Für Bars → Bar-Portal', loginSubmitBtn:'Einloggen', cancelLoginBtn:'Abbrechen', suchenBtn:'Suchen', anmeldenTitle:'Anmelden', searchBarDeal:'Bar oder Deal suchen...', searchPLZ:'PLZ oder Ort...',
    gutscheinAnzeigen:'Anzeigen', linkKopieren:'Link kopieren', linkKopiert:'Link kopiert!',
    warenkorbLeer:'Warenkorb ist leer', jetztBezahlen:'Jetzt bezahlen', total:'Total', deinName:'Dein Name:', deineEmail:'Deine Email:', pwBestaetigen:'Passwort bestätigen',
    viewDeals:'🏠 Deals', viewMap:'🗺️ Karte', catBreakfast:'🥐 Breakfast', catLunch:'🍽️ Lunch', catAperitif:'🍹 Aperitif', catDinner:'🍷 Dinner', catEvents:'🎉 Events', catDiscount:'🏷️ Rabatt',
    myLocationBtn:'Mein Standort', clearLocationBtn:'Zurücksetzen', geoEnableBtn:'Standort freigeben', geoBannerText:'Deals in deiner Nähe anzeigen?', mapStateText:'Deals direkt auf der Karte der Schweiz', mapCountryBadge:'🇨🇭 Schweiz', distanceAway:'entfernt',
    emailLbl:'Email', passwordLbl:'Passwort', nameLbl:'Name', registerPasswordLbl:'Passwort (mind. 8 Zeichen)', registerConfirmLbl:'Passwort bestätigen', registerModalTitle:'✨ Registrieren', registerSubmitBtn:'Registrieren', acceptPrivacyOnly:'Ich akzeptiere die', privacyOnly:'Datenschutzerklärung', alreadyRegistered:'Schon registriert?', goToLogin:'Zum Login', cartTitle:'🛒 Warenkorb', checkoutTitle:'Checkout', acceptTermsCart:'Ich akzeptiere die', processing:'⏳ Wird verarbeitet...', nameEmailRequired:'Name und Email sind Pflichtfelder', checkoutFailed:'Checkout fehlgeschlagen', loginModalTitle:'🔐 Anmelden', resetModalTitle:'🔑 Passwort zurücksetzen', resetInfo1:'Gib deine Email-Adresse ein. Wir senden dir einen 6-stelligen Code.', resetInfo2:'Gib den 6-stelligen Code aus deiner Email ein und wähle ein neues Passwort.', backBtn:'Zurück',
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
    fUeberUns:'About Us', fSoFunktionierts:'How It Works', fImpressum:'Legal Notice', fDatenschutz:'Privacy', fAGB:'Terms', fKontakt:'Contact', fFuerBars:'For Bars → Bar Portal', loginSubmitBtn:'Login', cancelLoginBtn:'Cancel', suchenBtn:'Search', anmeldenTitle:'Login', searchBarDeal:'Search bar or deal...', searchPLZ:'ZIP or city...',
    gutscheinAnzeigen:'View', linkKopieren:'Copy link', linkKopiert:'Link copied!',
    warenkorbLeer:'Cart is empty', jetztBezahlen:'Pay now', total:'Total', deinName:'Your name:', deineEmail:'Your email:', pwBestaetigen:'Confirm password',
    viewDeals:'🏠 Deals', viewMap:'🗺️ Map', catBreakfast:'🥐 Breakfast', catLunch:'🍽️ Lunch', catAperitif:'🍹 Aperitif', catDinner:'🍷 Dinner', catEvents:'🎉 Events', catDiscount:'🏷️ Discount',
    myLocationBtn:'My location', clearLocationBtn:'Reset', geoEnableBtn:'Enable location', geoBannerText:'Show deals near you?', mapStateText:'Deals directly on the map of Switzerland', mapCountryBadge:'🇨🇭 Switzerland', distanceAway:'away',
    emailLbl:'Email', passwordLbl:'Password', nameLbl:'Name', registerPasswordLbl:'Password (min. 8 chars)', registerConfirmLbl:'Confirm password', registerModalTitle:'✨ Register', registerSubmitBtn:'Register', acceptPrivacyOnly:'I accept the', privacyOnly:'Privacy Policy', alreadyRegistered:'Already registered?', goToLogin:'Go to login', cartTitle:'🛒 Cart', checkoutTitle:'Checkout', acceptTermsCart:'I accept the', processing:'⏳ Processing...', nameEmailRequired:'Name and email are required', checkoutFailed:'Checkout failed', loginModalTitle:'🔐 Login', resetModalTitle:'🔑 Reset password', resetInfo1:'Enter your email address. We will send you a 6-digit code.', resetInfo2:'Enter the 6-digit code from your email and choose a new password.', backBtn:'Back',
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
    fUeberUns:'Chi siamo', fSoFunktionierts:'Come funziona', fImpressum:'Impressum', fDatenschutz:'Privacy', fAGB:'Condizioni', fKontakt:'Contatto', fFuerBars:'Per bar → Portale Bar', loginSubmitBtn:'Accedi', cancelLoginBtn:'Annulla', suchenBtn:'Cerca', anmeldenTitle:'Accedi', searchBarDeal:'Cerca bar o offerta...', searchPLZ:'CAP o città...',
    gutscheinAnzeigen:'Visualizza', linkKopieren:'Copia link', linkKopiert:'Link copiato!',
    warenkorbLeer:'Carrello vuoto', jetztBezahlen:'Paga ora', total:'Totale', deinName:'Il tuo nome:', deineEmail:'La tua email:', pwBestaetigen:'Conferma password',
    viewDeals:'🏠 Deals', viewMap:'🗺️ Mappa', catBreakfast:'🥐 Colazione', catLunch:'🍽️ Pranzo', catAperitif:'🍹 Aperitivo', catDinner:'🍷 Cena', catEvents:'🎉 Eventi', catDiscount:'🏷️ Sconto',
    myLocationBtn:'La mia posizione', clearLocationBtn:'Reimposta', geoEnableBtn:'Attiva posizione', geoBannerText:'Mostrare i deal vicino a te?', mapStateText:'Deal direttamente sulla mappa della Svizzera', mapCountryBadge:'🇨🇭 Svizzera', distanceAway:'di distanza',
    emailLbl:'Email', passwordLbl:'Password', nameLbl:'Nome', registerPasswordLbl:'Password (min. 8 caratteri)', registerConfirmLbl:'Conferma password', registerModalTitle:'✨ Registrati', registerSubmitBtn:'Registrati', acceptPrivacyOnly:'Accetto la', privacyOnly:'Privacy', alreadyRegistered:'Già registrato?', goToLogin:'Vai al login', cartTitle:'🛒 Carrello', checkoutTitle:'Checkout', acceptTermsCart:'Accetto', processing:'⏳ Elaborazione...', nameEmailRequired:'Nome ed email sono obbligatori', checkoutFailed:'Checkout non riuscito', loginModalTitle:'🔐 Accedi', resetModalTitle:'🔑 Reimposta password', resetInfo1:'Inserisci la tua email. Ti invieremo un codice di 6 cifre.', resetInfo2:'Inserisci il codice di 6 cifre ricevuto via email e scegli una nuova password.', backBtn:'Indietro',
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
    fUeberUns:'À propos', fSoFunktionierts:'Comment ça marche', fImpressum:'Mentions légales', fDatenschutz:'Confidentialité', fAGB:'CGV', fKontakt:'Contact', fFuerBars:'Pour bars → Portail Bar', loginSubmitBtn:'Connexion', cancelLoginBtn:'Annuler', suchenBtn:'Chercher', anmeldenTitle:'Connexion', searchBarDeal:'Chercher bar ou offre...', searchPLZ:'NPA ou ville...',
    gutscheinAnzeigen:'Afficher', linkKopieren:'Copier le lien', linkKopiert:'Lien copié!',
    alle:'Tous', heute:"Aujourd'hui", morgen:'Demain',
    viewDeals:'🏠 Deals', viewMap:'🗺️ Carte', catBreakfast:'🥐 Petit-déjeuner', catLunch:'🍽️ Déjeuner', catAperitif:'🍹 Apéritif', catDinner:'🍷 Dîner', catEvents:'🎉 Événements', catDiscount:'🏷️ Réduction',
    myLocationBtn:'Ma position', clearLocationBtn:'Réinitialiser', geoEnableBtn:'Activer la position', geoBannerText:'Afficher les deals près de vous ?', mapStateText:'Deals directement sur la carte de la Suisse', mapCountryBadge:'🇨🇭 Suisse', distanceAway:'de distance',
    emailLbl:'Email', passwordLbl:'Mot de passe', nameLbl:'Nom', registerPasswordLbl:'Mot de passe (min. 8 car.)', registerConfirmLbl:'Confirmer le mot de passe', registerModalTitle:'✨ Inscription', registerSubmitBtn:"S'inscrire", acceptPrivacyOnly:"J'accepte la", privacyOnly:'Confidentialité', alreadyRegistered:'Déjà inscrit ?', goToLogin:'Vers la connexion', cartTitle:'🛒 Panier', checkoutTitle:'Checkout', acceptTermsCart:"J'accepte les", processing:'⏳ Traitement...', nameEmailRequired:'Nom et email sont obligatoires', checkoutFailed:'Échec du checkout', loginModalTitle:'🔐 Connexion', resetModalTitle:'🔑 Réinitialiser le mot de passe', resetInfo1:'Saisissez votre adresse email. Nous vous enverrons un code à 6 chiffres.', resetInfo2:'Saisissez le code à 6 chiffres reçu par email puis choisissez un nouveau mot de passe.', backBtn:'Retour',
  }
};

let shopLang = 'de';
function st(key) { return SHOP_TRANSLATIONS[shopLang][key] || SHOP_TRANSLATIONS.de[key] || key; }
function formatDistanceLabel(dist) {
  if (typeof dist !== 'number' || !isFinite(dist)) return '';
  var core = dist < 1 ? (Math.round(dist * 1000) + ' m') : (dist.toFixed(dist < 10 ? 1 : 0) + ' km');
  return core + ' ' + st('distanceAway');
}

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
  document.querySelectorAll('[data-shop-i18n]').forEach(function(el) {
    var k = el.getAttribute('data-shop-i18n');
    var tr = st(k);
    if (tr && tr !== k) el.textContent = tr;
  });
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var k = el.getAttribute('data-i18n');
    var trans = (SHOP_TRANSLATIONS[shopLang] || {})[k];
    if (trans) el.textContent = trans;
  });
  var ss = document.getElementById('shopSearch');
  if (ss) ss.placeholder = st('searchBarDeal');
  var li = document.getElementById('locationInput');
  if (li) li.placeholder = st('searchPLZ');
  var rm = document.getElementById('registerModalTitle'); if (rm) rm.textContent = st('registerModalTitle');
  var ub = document.getElementById('userBtn'); if (ub && !sessionGet()) ub.textContent = '👤 ' + st('loginBtn');
  var ct = document.getElementById('cartTitle'); if (ct) ct.textContent = st('cartTitle');

  var viewGrid = document.getElementById('viewGrid');
  if (viewGrid) viewGrid.textContent = st('viewDeals');
  var viewMap = document.getElementById('viewMap');
  if (viewMap) viewMap.textContent = st('viewMap');
  var loginModalTitle = document.getElementById('loginModalTitle');
  if (loginModalTitle) loginModalTitle.textContent = st('loginModalTitle');
  var resetModalTitle = document.getElementById('resetModalTitle');
  if (resetModalTitle) resetModalTitle.textContent = st('resetModalTitle');
  var mapStateText = document.getElementById('mapStateText');
  if (mapStateText) mapStateText.textContent = st('mapStateText');
  var mapCountryBadge = document.getElementById('mapCountryBadge');
  if (mapCountryBadge) mapCountryBadge.textContent = st('mapCountryBadge');
  renderDeals();
  if (_shopMap && _mapView) updateShopMapMarkers();
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
  if (!oldPw || !newPw || !confPw) { err.textContent = shopT('allFieldsRequired') || 'Alle Felder ausfüllen.'; return; }
  if (newPw.length < 8) { err.textContent = shopT('newPasswordMinErr') || 'Neues Passwort mind. 8 Zeichen.'; return; }
  if (newPw !== confPw) { err.textContent = shopT('passwordMismatchDot') || 'Passwörter stimmen nicht überein.'; return; }
  try {
    const r = await api({ action: 'changePassword', token: s.token, old_password: oldPw, new_password: newPw });
    if (r.success) {
      showToast(shopT('passwordChangedSuccess') || '✅ Passwort geändert!');
      closeChangePwModal();
    } else {
      err.textContent = translateShopRuntimeMessage(r.error || (shopT('genericErrorDot') || 'Fehler.'));
    }
  } catch (e) { err.textContent = shopT('networkErrorDot') || 'Verbindungsfehler.'; }
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
  var btnUseMyLocation = document.getElementById('btnUseMyLocation');
  if (btnUseMyLocation) btnUseMyLocation.addEventListener('click', requestGeoPermission);
  var locInput = document.getElementById('locationInput');
  var locSuggestions = document.getElementById('locationSuggestions');
  function closeLocationSuggestions() { if (locSuggestions) { locSuggestions.style.display = 'none'; locSuggestions.innerHTML = ''; } }
  if (locInput) {
    var runLocationSearch = (function() {
      var timer = null;
      return function() {
        clearTimeout(timer);
        timer = setTimeout(async function() {
          var q = locInput.value.trim();
          if (q.length < 3) { closeLocationSuggestions(); return; }
          var results = await geocodeLocationQuery(q);
          if (!locSuggestions) return;
          locSuggestions.innerHTML = '';
          results.forEach(function(item) {
            var p = mapLocationResult(item);
            var row = document.createElement('div');
            row.className = 'suggestion-item';
            row.innerHTML = '<div class="suggestion-title">' + escHtml(p.label) + '</div><div class="suggestion-meta">' + escHtml(p.shortLabel) + '</div>';
            row.addEventListener('click', function() {
              applySelectedLocation(p);
              closeLocationSuggestions();
            });
            locSuggestions.appendChild(row);
          });
          locSuggestions.style.display = results.length ? 'block' : 'none';
        }, 250);
      };
    })();
    locInput.addEventListener('input', runLocationSearch);
    locInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') { e.preventDefault(); applyLocation(); closeLocationSuggestions(); } });
    locInput.addEventListener('focus', function() { if (locSuggestions && locSuggestions.innerHTML.trim()) locSuggestions.style.display = 'block'; });
    document.addEventListener('click', function(e) { if (!e.target.closest('.search-select-wrap')) closeLocationSuggestions(); });
  }
  updateLocationUi();
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
  if (!s) { showToast(shopT('loginRequired') || 'Bitte einloggen', true); return; }
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
  if (deal.bar_address) info += '<div><span style="color:#999">' + escHtml(shopLang === 'en' ? 'Address' : shopLang === 'it' ? 'Indirizzo' : shopLang === 'fr' ? 'Adresse' : 'Adresse') + '</span><span>' + escHtml(deal.bar_address) + ', ' + escHtml(deal.bar_zip || '') + ' ' + escHtml(deal.bar_city || '') + '</span></div>';
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
    ['📋 Link kopieren', function() { copyDealLink(); }]
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
  ddCartBtn.textContent = '🛒 ' + (shopT('cartAddTitle') || 'In den Warenkorb');
  ddCartBtn.onclick = function() { addToCart(deal); closeDealDetail(); };
  
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
  if (isValidCoord(Number(_userLat)) && isValidCoord(Number(_userLng))) return;
  var banner = document.getElementById('geoBanner');
  if (banner) banner.style.display = 'block';
}

function dismissGeoBanner() {
  var banner = document.getElementById('geoBanner');
  if (banner) banner.style.display = 'none';
  localStorage.setItem('barsclusive_geo_dismissed', '1');
}

function requestGeoPermission() {
  if (!navigator.geolocation) { showToast(shopT('locationUnavailable') || 'Standort nicht verfügbar', true); dismissGeoBanner(); return; }
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      _userLat = pos.coords.latitude;
      _userLng = pos.coords.longitude;
      _locationState = { label: shopT('myLocationBtn') || 'Mein Standort', lat: _userLat, lng: _userLng, source: 'geo', textFilter: '' };
      saveLocationState();
      updateLocationUi();
      dismissGeoBanner();
      showToast(shopT('dealsSortedByDistance') || '📍 Deals werden nach Nähe sortiert');
      sortDealsByDistance();
    },
    function() { dismissGeoBanner(); showToast(shopT('locationUnavailable') || 'Standort nicht verfügbar', true); },
    { enableHighAccuracy: false, timeout: 10000 }
  );
}

window.addEventListener('load', function() { setTimeout(showGeoBanner, 2000); });


// =============================================
// CART
// =============================================
var _cart = [];

function getCart() { try { _cart = JSON.parse(localStorage.getItem('barsclusive_cart')||'[]'); } catch(e) { _cart = []; } return _cart; }
function saveCart() { try { localStorage.setItem('barsclusive_cart', JSON.stringify(_cart)); } catch(e) {} updateCartBadge(); }
var _cartCheckoutBusy = false;

function openCartPanel() {
  var panel = document.getElementById('cartPanel');
  var overlay = document.getElementById('cartOverlay');
  if (!panel) return;
  panel.classList.add('active');
  if (overlay) overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
  renderCartPanel();
}
function closeCartPanel() {
  var panel = document.getElementById('cartPanel');
  var overlay = document.getElementById('cartOverlay');
  if (panel) panel.classList.remove('active');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}
function toggleCartPanel() {
  var panel = document.getElementById('cartPanel');
  if (!panel) return;
  if (panel.classList.contains('active')) closeCartPanel();
  else openCartPanel();
}

function addToCart(deal) {
  getCart();
  var existing = _cart.find(function(c) { return c.deal_id === deal.id; });
  if (existing) existing.quantity++;
  else _cart.push({ deal_id: deal.id, title: deal.title, bar_name: deal.bar_name, price: deal.deal_price, quantity: 1, image_url: deal.image_url || '' });
  saveCart();
  openCartPanel();
  showToast('🛒 ' + deal.title + ' ' + (shopT('addedToCartSuffix') || 'zum Warenkorb hinzugefügt'));
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

function renderCartPanel() {
  var body = document.getElementById('cartBody');
  if (!body) return;
  getCart();
  if (!_cart.length) {
    body.innerHTML = '<div style="text-align:center;padding:40px;color:#666">' + (shopT('warenkorbLeer') || 'Warenkorb ist leer') + '</div>';
    return;
  }
  var s = sessionGet();
  var defaultName = s && s.name ? s.name : ((document.getElementById('cartBuyerName') || {}).value || '');
  var defaultEmail = s && s.email ? s.email : ((document.getElementById('cartBuyerEmail') || {}).value || '');
  body.innerHTML = '';
  _cart.forEach(function(c) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #222;gap:12px';
    var info = document.createElement('div');
    info.style.flex = '1';
    info.innerHTML = '<div style="font-weight:600;font-size:14px">' + escHtml(c.title) + '</div><div style="font-size:12px;color:#999">' + escHtml(c.bar_name) + '</div>';
    var controls = document.createElement('div');
    controls.style.cssText = 'display:flex;align-items:center;gap:8px';
    var btnMinus = document.createElement('button');
    btnMinus.textContent = '-';
    btnMinus.style.cssText = 'background:#333;color:#fff;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px';
    btnMinus.addEventListener('click', function() { changeCartQty(c.deal_id, -1); });
    var qtySpan = document.createElement('span');
    qtySpan.style.cssText = 'min-width:20px;text-align:center';
    qtySpan.textContent = c.quantity;
    var btnPlus = document.createElement('button');
    btnPlus.textContent = '+';
    btnPlus.style.cssText = 'background:#333;color:#fff;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px';
    btnPlus.addEventListener('click', function() { changeCartQty(c.deal_id, 1); });
    var priceSpan = document.createElement('span');
    priceSpan.style.cssText = 'min-width:72px;text-align:right;font-weight:700';
    priceSpan.textContent = (c.price * c.quantity).toFixed(2) + ' CHF';
    var btnRemove = document.createElement('button');
    btnRemove.textContent = '✕';
    btnRemove.style.cssText = 'background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px';
    btnRemove.addEventListener('click', function() { removeFromCart(c.deal_id); });
    controls.append(btnMinus, qtySpan, btnPlus, priceSpan, btnRemove);
    row.append(info, controls);
    body.appendChild(row);
  });

  var totalDiv = document.createElement('div');
  totalDiv.style.cssText = 'padding:16px 0;font-size:18px;font-weight:700;text-align:right;border-top:2px solid #FF3366;margin-top:8px';
  totalDiv.textContent = (shopT('total') || 'Total') + ': ' + getCartTotal().toFixed(2) + ' CHF';
  body.appendChild(totalDiv);

  var buyerWrap = document.createElement('div');
  buyerWrap.style.cssText = 'margin-top:14px;padding:14px;background:#171717;border:1px solid #2a2a2a;border-radius:12px';
  buyerWrap.innerHTML = ''
    + '<div style="font-size:13px;font-weight:700;margin-bottom:12px">' + (shopT('checkoutTitle') || 'Checkout') + '</div>'
    + '<div class="form-group" style="margin-bottom:10px"><label class="form-label" for="cartBuyerName">' + (shopT('nameLbl') || 'Name') + '</label><input type="text" class="form-input" id="cartBuyerName" value="' + escHtml(defaultName) + '" autocomplete="name"></div>'
    + '<div class="form-group" style="margin-bottom:10px"><label class="form-label" for="cartBuyerEmail">' + (shopT('emailLbl') || 'Email') + '</label><input type="email" class="form-input" id="cartBuyerEmail" value="' + escHtml(defaultEmail) + '" autocomplete="email"></div>'
    + '<label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;color:#ccc"><input type="checkbox" id="cartConsent"><span>' + (shopT('acceptTermsCart') || 'Ich akzeptiere die') + ' <a href="agb.html" target="_blank" rel="noopener" style="color:#FF3366">' + (shopT('fAGB') || 'AGB') + '</a> ' + (shopLang === 'en' ? 'and' : shopLang === 'it' ? 'e' : shopLang === 'fr' ? 'et' : 'und') + ' <a href="datenschutz.html" target="_blank" rel="noopener" style="color:#FF3366">' + (shopT('fDatenschutz') || 'Datenschutz') + '</a>.</span></label>';
  body.appendChild(buyerWrap);

  var checkBtn = document.createElement('button');
  checkBtn.id = 'cartCheckoutBtn';
  checkBtn.textContent = _cartCheckoutBusy ? (shopT('processing') || '⏳ Wird verarbeitet...') : (shopT('jetztBezahlen') || 'Jetzt bezahlen');
  checkBtn.disabled = _cartCheckoutBusy;
  checkBtn.style.cssText = 'width:100%;background:#FF3366;color:#fff;border:none;padding:14px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;margin-top:12px';
  checkBtn.addEventListener('click', checkoutCart);
  body.appendChild(checkBtn);
}

async function checkoutCart() {
  getCart();
  if (!_cart.length || _cartCheckoutBusy) { if (!_cart.length) showToast(shopT('warenkorbLeer') || 'Warenkorb ist leer', true); return; }
  var s = sessionGet();
  var nameEl = document.getElementById('cartBuyerName');
  var emailEl = document.getElementById('cartBuyerEmail');
  var consentEl = document.getElementById('cartConsent');
  var buyerName = nameEl ? nameEl.value.trim() : '';
  var buyerEmail = emailEl ? emailEl.value.trim() : '';
  if (!buyerName || !buyerEmail) { showToast(shopT('nameEmailRequired') || 'Name und Email sind Pflichtfelder', true); return; }
  if (!consentEl || !consentEl.checked) { showToast((shopLang === 'en' ? 'Please accept terms and privacy' : shopLang === 'it' ? 'Accetta termini e privacy' : shopLang === 'fr' ? 'Veuillez accepter les CGV et la confidentialité' : 'Bitte AGB und Datenschutz akzeptieren'), true); return; }

  var checkoutBtn = document.getElementById('cartCheckoutBtn');
  _cartCheckoutBusy = true;
  if (checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.textContent = shopT('processing') || '⏳ Wird verarbeitet...'; }

  try {
    var r = await api({
      action: 'createCartCheckout',
      items: _cart.map(function(c) { return { deal_id: c.deal_id, quantity: c.quantity }; }),
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      customer_id: s ? s.customerId : '',
      site_url: window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
    });
    if (r.success && r.checkout_url) {
      _cart = [];
      saveCart();
      closeCartPanel();
      window.location.href = r.checkout_url;
      return;
    }
    showToast(r.error || (shopT('checkoutFailed') || 'Checkout fehlgeschlagen'), true);
  } catch(e) {
    showToast('Verbindungsfehler', true);
  } finally {
    _cartCheckoutBusy = false;
    renderCartPanel();
  }
}

window.addEventListener('load', function() { getCart(); updateCartBadge(); });

// =============================================
// EVENT BINDINGS for cart, deal modal, geo (no inline onclick needed)
// =============================================
document.addEventListener('DOMContentLoaded', function() {
  // Cart open/close
  var cartOpen = document.getElementById('cartOpenBtn');
  if (cartOpen) cartOpen.addEventListener('click', toggleCartPanel);
  var cartClose = document.getElementById('cartCloseBtn');
  if (cartClose) cartClose.addEventListener('click', closeCartPanel);
  var cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartPanel);
  
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
var _swissBounds = L.latLngBounds([[45.75, 5.85], [47.92, 10.75]]);

function initShopMap() {
  if (_shopMap) return;
  var el = document.getElementById('shopMap');
  if (!el) return;
  _shopMap = L.map('shopMap', {
    zoomControl: true,
    minZoom: 7,
    maxZoom: 18,
    maxBounds: _swissBounds,
    maxBoundsViscosity: 1.0,
    worldCopyJump: false
  }).setView([46.8182, 8.2275], 8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
    noWrap: true
  }).addTo(_shopMap);
}

function buildMapPopupHtml(barEntry) {
  var html = '<div class="map-popup"><div class="map-popup-head">' + escHtml(barEntry.name || '') + '</div><div class="map-popup-sub">' + escHtml(barEntry.city || '') + '</div><div class="map-popup-list">';
  barEntry.deals.slice(0, 6).forEach(function(d) {
    html += '<div class="map-popup-item" data-map-deal-id="' + d.id + '"><span>' + escHtml(d.title || '') + '</span><span class="map-popup-price">' + Number(d.deal_price || 0).toFixed(2) + ' CHF</span></div>';
  });
  if (barEntry.deals.length > 6) {
    html += '<div style="font-size:12px;color:#666;padding-top:2px">+' + (barEntry.deals.length - 6) + ' weitere Deals</div>';
  }
  html += '</div></div>';
  return html;
}

function buildPricePinIcon(barEntry) {
  var cheapest = barEntry.deals.reduce(function(min, d) {
    var p = Number(d.deal_price || 0);
    return min === null || p < min ? p : min;
  }, null);
  var label = Number(cheapest || 0).toFixed(2) + ' CHF';
  var count = barEntry.deals.length > 1 ? '<small>+' + (barEntry.deals.length - 1) + '</small>' : '';
  return L.divIcon({
    className: 'map-pin-wrapper',
    html: '<div class="map-price-pin"><span>' + label + '</span>' + count + '</div>',
    iconSize: [94, 34],
    iconAnchor: [47, 17],
    popupAnchor: [0, -12]
  });
}


function offsetDuplicateDealsForMap(deals) {
  var groups = {};
  deals.forEach(function(d) {
    var lat = Number(d.bar_lat), lng = Number(d.bar_lng);
    if (!isValidCoord(lat) || !isValidCoord(lng)) return;
    var key = lat.toFixed(5) + ',' + lng.toFixed(5);
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  });
  var out = [];
  Object.keys(groups).forEach(function(key) {
    var arr = groups[key];
    if (arr.length === 1) {
      arr[0]._mapLat = Number(arr[0].bar_lat);
      arr[0]._mapLng = Number(arr[0].bar_lng);
      out.push(arr[0]);
      return;
    }
    var baseLat = Number(arr[0].bar_lat), baseLng = Number(arr[0].bar_lng);
    var radius = 0.00022;
    arr.forEach(function(d, idx) {
      var angle = (Math.PI * 2 * idx) / arr.length;
      d._mapLat = baseLat + Math.sin(angle) * radius;
      d._mapLng = baseLng + Math.cos(angle) * radius;
      out.push(d);
    });
  });
  return out;
}

function buildDealPinIcon(deal) {
  var label = Number(deal.deal_price || 0).toFixed(2) + ' CHF';
  return L.divIcon({
    className: 'map-pin-wrapper',
    html: '<div class="map-price-pin"><span>' + label + '</span></div>',
    iconSize: [96, 34],
    iconAnchor: [48, 17]
  });
}

function updateShopMapMarkers() {
  if (!_shopMap) return;
  _shopMapMarkers.forEach(function(m) { try { _shopMap.removeLayer(m); } catch(e) {} });
  _shopMapMarkers = [];
  var visibleDeals = offsetDuplicateDealsForMap(getVisibleDeals());
  var bounds = [];

  if (isValidCoord(Number(_userLat)) && isValidCoord(Number(_userLng)) && _swissBounds.contains([Number(_userLat), Number(_userLng)])) {
    var userMarker = L.marker([Number(_userLat), Number(_userLng)], {
      icon: L.divIcon({ className: 'map-user-wrapper', html: '<div class="map-user-pin"></div>', iconSize: [16,16], iconAnchor: [8,8] })
    }).addTo(_shopMap);
    userMarker.bindPopup(st('myLocationBtn'));
    _shopMapMarkers.push(userMarker);
    bounds.push([Number(_userLat), Number(_userLng)]);
  }

  visibleDeals.forEach(function(d) {
    var lat = Number(d._mapLat != null ? d._mapLat : d.bar_lat), lng = Number(d._mapLng != null ? d._mapLng : d.bar_lng);
    if (!isValidCoord(lat) || !isValidCoord(lng)) return;
    if (!_swissBounds.contains([lat, lng])) return;
    var marker = L.marker([lat, lng], { icon: buildDealPinIcon(d), keyboard: true, title: d.title || '' }).addTo(_shopMap);
    marker.on('click', function() { openDealDetail(d); });
    marker.bindTooltip(
      '<div style="font-weight:700">' + escHtml(d.title || '') + '</div>' +
      '<div style="font-size:12px;color:#666">' + escHtml(d.bar_name || '') + '</div>',
      { direction: 'top', offset: [0, -10], opacity: 0.96 }
    );
    _shopMapMarkers.push(marker);
    bounds.push([lat, lng]);
  });

  var mapStateText = document.getElementById('mapStateText');
  if (mapStateText) {
    var countryLabel = (st('mapCountryBadge') || '🇨🇭 Schweiz').replace('🇨🇭 ', '');
    mapStateText.textContent = visibleDeals.length ? (visibleDeals.length + ' ' + st('deals') + ' · ' + countryLabel) : st('mapStateText');
  }

  if (bounds.length > 1) {
    _shopMap.fitBounds(L.latLngBounds(bounds).pad(0.18), { padding: [20,20], maxZoom: 14 });
  } else if (bounds.length === 1) {
    _shopMap.setView(bounds[0], 14);
  } else {
    _shopMap.setView([46.8182, 8.2275], 8);
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
    setTimeout(function() { if (_shopMap) _shopMap.invalidateSize(); updateShopMapMarkers(); }, 120);
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


// ===== FINAL PATCH: keep cart/register labels translated after language switch =====
(function(){
  var oldSetShopLang = setShopLang;
  setShopLang = function(lang){
    oldSetShopLang(lang);
    try { renderCartPanel(); } catch(e) {}
    var t = shopT;
    var el;
    el = document.getElementById('registerModalTitle'); if (el) el.textContent = t('registerModalTitle');
    el = document.querySelector('label[for="regName"]'); if (el) el.textContent = t('nameLbl');
    el = document.querySelector('label[for="regEmail"]'); if (el) el.textContent = t('emailLbl');
    el = document.querySelector('label[for="regPassword"]'); if (el) el.textContent = t('registerPasswordLbl');
    el = document.querySelector('label[for="regPasswordConfirm"]'); if (el) el.textContent = t('registerConfirmLbl');
  };
})();


// =============================================
// STRICT PATCH: i18n cleanup + language-aware deals + reduced sharing
// =============================================
Object.assign(SHOP_TRANSLATIONS.de, {
  shareBtn:'Teilen', networkError:'Verbindungsfehler', networkReload:'Verbindungsfehler - bitte neu laden',
  dealsLoadError:'Fehler beim Laden der Deals', cartAddTitle:'In den Warenkorb',
  acceptTermsPrivacy:'Bitte AGB & Datenschutz akzeptieren', invalidCredentials:'Ungültige Zugangsdaten',
  fillAllFields:'Alle Felder ausfüllen', passwordMinErr:'Passwort mind. 8 Zeichen', passwordMismatch:'Passwörter stimmen nicht überein',
  emailRequired:'Bitte Email eingeben', codeSent:'Code gesendet!', passwordChangedSuccess:'✅ Passwort geändert!',
  loginRequired:'Bitte einloggen', notLoggedIn:'Nicht eingeloggt', refundConfirm:'Rückerstattung anfordern?\nDer Gutschein wird ungültig.', refundRequestedSuccess:'✅ Rückerstattung angefordert',
  locationUnavailable:'Standort nicht verfügbar', dealsSortedByDistance:'📍 Deals werden nach Nähe sortiert',
  addedToCartSuffix:'zum Warenkorb hinzugefügt', processing:'⏳ Wird verarbeitet...',
  loadError:'Fehler', registrationSuccess:'✅ Registrierung erfolgreich!', loginSuccess:'✅ Eingeloggt!', logoutSuccess:'Ausgeloggt',
  linkGenericPrefix:'Link:', nameEmailRequired:'Name und Email sind Pflichtfelder', buyConsentError:'Bitte AGB & Datenschutz akzeptieren',
  allFieldsRequired:'Alle Felder ausfüllen.', newPasswordMinErr:'Neues Passwort mind. 8 Zeichen.', passwordMismatchDot:'Passwörter stimmen nicht überein.', genericErrorDot:'Fehler.', networkErrorDot:'Verbindungsfehler.'
});
Object.assign(SHOP_TRANSLATIONS.en, {
  shareBtn:'Share', networkError:'Connection error', networkReload:'Connection error - please reload',
  dealsLoadError:'Error loading deals', cartAddTitle:'Add to cart', acceptTermsPrivacy:'Please accept terms and privacy',
  invalidCredentials:'Invalid credentials', fillAllFields:'Please fill in all fields', passwordMinErr:'Password must be at least 8 characters',
  passwordMismatch:'Passwords do not match', emailRequired:'Please enter your email', codeSent:'Code sent!',
  passwordChangedSuccess:'✅ Password changed!', loginRequired:'Please log in', notLoggedIn:'Not logged in',
  refundConfirm:'Request refund?\nThe voucher will become invalid.', refundRequestedSuccess:'✅ Refund requested',
  locationUnavailable:'Location not available', dealsSortedByDistance:'📍 Deals are now sorted by distance',
  addedToCartSuffix:'added to cart', loadError:'Error', registrationSuccess:'✅ Registration successful!', loginSuccess:'✅ Logged in!', logoutSuccess:'Logged out',
  linkGenericPrefix:'Link:', buyConsentError:'Please accept terms and privacy', allFieldsRequired:'Please fill in all fields.',
  newPasswordMinErr:'New password must be at least 8 characters.', passwordMismatchDot:'Passwords do not match.', genericErrorDot:'Error.', networkErrorDot:'Connection error.'
});
Object.assign(SHOP_TRANSLATIONS.it, {
  shareBtn:'Condividi', networkError:'Errore di connessione', networkReload:'Errore di connessione - ricarica la pagina',
  dealsLoadError:'Errore durante il caricamento dei deal', cartAddTitle:'Aggiungi al carrello', acceptTermsPrivacy:'Accetta condizioni e privacy',
  invalidCredentials:'Credenziali non valide', fillAllFields:'Compila tutti i campi', passwordMinErr:'La password deve avere almeno 8 caratteri',
  passwordMismatch:'Le password non coincidono', emailRequired:'Inserisci l\'email', codeSent:'Codice inviato!',
  passwordChangedSuccess:'✅ Password modificata!', loginRequired:'Accedi prima', notLoggedIn:'Non connesso',
  refundConfirm:'Richiedere il rimborso?\nIl voucher diventerà non valido.', refundRequestedSuccess:'✅ Rimborso richiesto',
  locationUnavailable:'Posizione non disponibile', dealsSortedByDistance:'📍 I deal sono ora ordinati per distanza',
  addedToCartSuffix:'aggiunto al carrello', loadError:'Errore', registrationSuccess:'✅ Registrazione riuscita!', loginSuccess:'✅ Accesso effettuato!', logoutSuccess:'Disconnesso',
  linkGenericPrefix:'Link:', buyConsentError:'Accetta condizioni e privacy', allFieldsRequired:'Compila tutti i campi.',
  newPasswordMinErr:'La nuova password deve avere almeno 8 caratteri.', passwordMismatchDot:'Le password non coincidono.', genericErrorDot:'Errore.', networkErrorDot:'Errore di connessione.'
});
Object.assign(SHOP_TRANSLATIONS.fr, {
  shareBtn:'Partager', networkError:'Erreur de connexion', networkReload:'Erreur de connexion - veuillez recharger',
  dealsLoadError:'Erreur lors du chargement des deals', cartAddTitle:'Ajouter au panier', acceptTermsPrivacy:'Veuillez accepter les CGV et la confidentialité',
  invalidCredentials:'Identifiants invalides', fillAllFields:'Veuillez remplir tous les champs', passwordMinErr:'Le mot de passe doit contenir au moins 8 caractères',
  passwordMismatch:'Les mots de passe ne correspondent pas', emailRequired:'Veuillez saisir l\'email', codeSent:'Code envoyé !',
  passwordChangedSuccess:'✅ Mot de passe modifié !', loginRequired:'Veuillez vous connecter', notLoggedIn:'Non connecté',
  refundConfirm:'Demander un remboursement ?\nLe bon deviendra invalide.', refundRequestedSuccess:'✅ Remboursement demandé',
  locationUnavailable:'Position non disponible', dealsSortedByDistance:'📍 Les deals sont maintenant triés par distance',
  addedToCartSuffix:'ajouté au panier', loadError:'Erreur', registrationSuccess:'✅ Inscription réussie !', loginSuccess:'✅ Connecté !', logoutSuccess:'Déconnecté',
  linkGenericPrefix:'Lien :', buyConsentError:'Veuillez accepter les CGV et la confidentialité', allFieldsRequired:'Veuillez remplir tous les champs.',
  newPasswordMinErr:'Le nouveau mot de passe doit contenir au moins 8 caractères.', passwordMismatchDot:'Les mots de passe ne correspondent pas.', genericErrorDot:'Erreur.', networkErrorDot:'Erreur de connexion.'
});

function dealsCacheKeyForLang(lang) {
  return 'barsclusive_deals_cache_' + String(lang || 'de').toLowerCase();
}
function translateShopRuntimeMessage(msg) {
  var raw = String(msg == null ? '' : msg).trim();
  var map = {
    'Fehler beim Laden der Deals':'dealsLoadError',
    'Verbindungsfehler - bitte neu laden':'networkReload',
    'Verbindungsfehler':'networkError',
    'Name und Email sind Pflichtfelder':'nameEmailRequired',
    'Bitte AGB & Datenschutz akzeptieren':'buyConsentError',
    'Ungültige Zugangsdaten':'invalidCredentials',
    'Alle Felder ausfüllen':'fillAllFields',
    'Bitte Email eingeben':'emailRequired',
    'Code gesendet!':'codeSent',
    '✅ Passwort geändert!':'passwordChangedSuccess',
    'Bitte einloggen':'loginRequired',
    'Nicht eingeloggt':'notLoggedIn',
    '✅ Rückerstattung angefordert':'refundRequestedSuccess',
    'Standort nicht verfügbar':'locationUnavailable',
    '📍 Deals werden nach Nähe sortiert':'dealsSortedByDistance',
    'Ausgeloggt':'logoutSuccess',
    '✅ Registrierung erfolgreich!':'registrationSuccess',
    '✅ Eingeloggt!':'loginSuccess',
    'Fehler':'loadError',
    'Alle Felder ausfüllen.':'allFieldsRequired',
    'Neues Passwort mind. 8 Zeichen.':'newPasswordMinErr',
    'Passwörter stimmen nicht überein.':'passwordMismatchDot',
    'Fehler.':'genericErrorDot',
    'Verbindungsfehler.':'networkErrorDot'
  };
  if (map[raw]) return shopT(map[raw]) || raw;
  return raw;
}
var _showToastOrig = showToast;
showToast = function(msg, isError) {
  return _showToastOrig(translateShopRuntimeMessage(msg), isError);
};
var _origCopyDealLink = copyDealLink;
copyDealLink = function() {
  if (!_detailDeal) return;
  var url = window.location.origin + window.location.pathname + '?deal=' + _detailDeal.id;
  navigator.clipboard.writeText(url).then(function() {
    showToast(shopT('linkKopiert') || 'Link kopiert!');
  }).catch(function() {
    showToast((shopT('linkGenericPrefix') || 'Link:') + ' ' + url);
  });
};
copyVoucherLink = function(code) {
  var url = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'voucher.html?code=' + encodeURIComponent(code);
  navigator.clipboard.writeText(url).then(function() {
    showToast(shopT('linkKopiert') || 'Link kopiert!');
  }).catch(function() {
    showToast((shopT('linkGenericPrefix') || 'Link:') + ' ' + url);
  });
};
var _origLoadDeals = loadDeals;
loadDeals = async function(forceRefresh) {
  forceRefresh = !!forceRefresh;
  var now = Date.now();
  var lang = (_shopLang || shopLang || localStorage.getItem('barsclusive_lang') || 'de').toLowerCase();
  var cacheKey = dealsCacheKeyForLang(lang);
  if (!forceRefresh && dealsCache.data && dealsCache.lang === lang && (now - dealsCache.timestamp) < CACHE_DURATION) {
    allDeals = dealsCache.data;
    attachDistances();
    renderDeals();
    return;
  }
  if (!forceRefresh) {
    try {
      var localRaw = localStorage.getItem(cacheKey);
      if (localRaw) {
        var localParsed = JSON.parse(localRaw);
        if (localParsed.data && localParsed.lang === lang && (now - localParsed.timestamp) < CACHE_DURATION) {
          dealsCache = localParsed;
          allDeals = localParsed.data;
          attachDistances();
          renderDeals();
          return;
        }
      }
    } catch(e) {}
  }
  try {
    const r = await fetch(BACKEND_URL + '?action=getActiveDeals&lang=' + encodeURIComponent(lang));
    if (!r.ok) throw new Error('Network error');
    const d = await r.json();
    if (d.success) {
      allDeals = d.deals || [];
      attachDistances();
      dealsCache = { data: allDeals, timestamp: now, lang: lang };
      try { localStorage.setItem(cacheKey, JSON.stringify(dealsCache)); } catch(e) {}
      var ld = document.getElementById('dealsLoading'); if(ld) ld.style.display='none';
      var dl = document.getElementById('dealsList'); if(dl) dl.style.display='';
      renderDeals();
    } else {
      showToast(d.error || shopT('dealsLoadError') || 'Fehler beim Laden der Deals', true);
    }
  } catch (e) {
    showToast(shopT('networkReload') || 'Verbindungsfehler - bitte neu laden', true);
  }
};
var _origSetShopLang = setShopLang;
setShopLang = function(lang) {
  var previous = _shopLang || shopLang || 'de';
  _origSetShopLang(lang);
  if (previous !== lang) loadDeals(false);
};
// prime language-specific cache immediately if present
try {
  var _initialLang = (localStorage.getItem('barsclusive_lang') || _shopLang || 'de').toLowerCase();
  var _localRaw = localStorage.getItem(dealsCacheKeyForLang(_initialLang));
  if (_localRaw) {
    var _localParsed = JSON.parse(_localRaw);
    if (_localParsed.data && _localParsed.lang === _initialLang && (Date.now() - _localParsed.timestamp) < 30 * 60 * 1000) {
      dealsCache = _localParsed;
      allDeals = _localParsed.data;
    }
  }
} catch(e) {}

// =============================================
// FINAL STRICT PATCH: correspondence language, clean auth labels, deal original text
// =============================================
(function(){
  Object.assign(SHOP_TRANSLATIONS.de, {
    noAccountYet:'Noch kein Konto?',
    correspondenceLang:'Korrespondenzsprache',
    langGerman:'Deutsch', langEnglish:'English', langItalian:'Italiano', langFrench:'Français',
    acceptTermsRegister:'Ich akzeptiere die', andConnector:'und',
    acceptPrivacyOnly:'Ich akzeptiere die', privacyOnly:'Datenschutzerklärung',
    acceptTermsPrivacy:'Bitte AGB und Datenschutz akzeptieren',
    addressLabel:'Adresse', weekdaysLabel:'Wochentage', timeLabel:'Zeit', availableLabel:'Verfügbar', discountLabel:'Rabatt', minimumOrderLabel:'Mindestbestellung', typeLabel:'Typ', flatVoucherType:'Pauschalgutschein', detailsNone:'Keine weiteren Details',
    originalBarText:'Originaltext der Bar', linkCopied:'Link kopiert!',
    loginSuccess:'Eingeloggt!', registerSuccess:'Registrierung erfolgreich!',
    emailPasswordRequired:'Bitte Email und Passwort eingeben', invalidCredentials:'Ungültige Zugangsdaten', passwordMin8:'Passwort mind. 8 Zeichen', passwordMismatch:'Passwörter stimmen nicht überein'
  });
  Object.assign(SHOP_TRANSLATIONS.en, {
    noAccountYet:'No account yet?',
    correspondenceLang:'Correspondence language',
    langGerman:'German', langEnglish:'English', langItalian:'Italian', langFrench:'French',
    acceptTermsRegister:'I accept the', andConnector:'and',
    acceptPrivacyOnly:'I accept the', privacyOnly:'Privacy Policy',
    acceptTermsPrivacy:'Please accept terms and privacy',
    addressLabel:'Address', weekdaysLabel:'Weekdays', timeLabel:'Time', availableLabel:'Available', discountLabel:'Discount', minimumOrderLabel:'Minimum order', typeLabel:'Type', flatVoucherType:'Flat discount voucher', detailsNone:'No further details',
    originalBarText:'Original bar text', linkCopied:'Link copied!', loginSuccess:'Logged in!', registerSuccess:'Registration successful!',
    emailPasswordRequired:'Please enter email and password', invalidCredentials:'Invalid credentials', passwordMin8:'Password min. 8 characters', passwordMismatch:'Passwords do not match'
  });
  Object.assign(SHOP_TRANSLATIONS.it, {
    noAccountYet:'Non hai ancora un account?',
    correspondenceLang:'Lingua di corrispondenza',
    langGerman:'Tedesco', langEnglish:'Inglese', langItalian:'Italiano', langFrench:'Francese',
    acceptTermsRegister:'Accetto i', andConnector:'e',
    acceptPrivacyOnly:'Accetto la', privacyOnly:'Privacy',
    acceptTermsPrivacy:'Accetta condizioni e privacy',
    addressLabel:'Indirizzo', weekdaysLabel:'Giorni', timeLabel:'Orario', availableLabel:'Disponibile', discountLabel:'Sconto', minimumOrderLabel:'Ordine minimo', typeLabel:'Tipo', flatVoucherType:'Voucher sconto forfettario', detailsNone:'Nessun ulteriore dettaglio',
    originalBarText:'Testo originale del bar', linkCopied:'Link copiato!', loginSuccess:'Accesso effettuato!', registerSuccess:'Registrazione riuscita!',
    emailPasswordRequired:'Inserisci email e password', invalidCredentials:'Credenziali non valide', passwordMin8:'Password min. 8 caratteri', passwordMismatch:'Le password non coincidono'
  });
  Object.assign(SHOP_TRANSLATIONS.fr, {
    noAccountYet:'Pas encore de compte ?',
    correspondenceLang:'Langue de correspondance',
    langGerman:'Allemand', langEnglish:'Anglais', langItalian:'Italien', langFrench:'Français',
    acceptTermsRegister:'J’accepte les', andConnector:'et',
    acceptPrivacyOnly:'J’accepte la', privacyOnly:'Confidentialité',
    acceptTermsPrivacy:'Veuillez accepter les CGV et la confidentialité',
    addressLabel:'Adresse', weekdaysLabel:'Jours', timeLabel:'Horaire', availableLabel:'Disponible', discountLabel:'Réduction', minimumOrderLabel:'Commande minimum', typeLabel:'Type', flatVoucherType:'Bon de réduction forfaitaire', detailsNone:'Pas d’autres détails',
    originalBarText:'Texte original du bar', linkCopied:'Lien copié !', loginSuccess:'Connecté !', registerSuccess:'Inscription réussie !',
    emailPasswordRequired:'Veuillez saisir l’email et le mot de passe', invalidCredentials:'Identifiants invalides', passwordMin8:'Mot de passe min. 8 caractères', passwordMismatch:'Les mots de passe ne correspondent pas'
  });

  var _origSessionSetShop = sessionSet;
  sessionSet = function(token, name, email, role, lang) {
    _origSessionSetShop(token, name, email, role);
    if (lang) {
      _session.lang = lang;
      try { localStorage.setItem('barsclusive_customer_session', JSON.stringify(_session)); } catch(e) {}
      if (typeof setShopLang === 'function') setShopLang(lang);
    }
  };

  var _origApplyShopTranslations = applyShopTranslations;
  applyShopTranslations = function() {
    _origApplyShopTranslations();
    var regLang = document.getElementById('regLangSelect');
    if (regLang && !regLang.value) regLang.value = (_shopLang || localStorage.getItem('barsclusive_lang') || 'de');
    var loginNo = document.getElementById('loginNoAccountText'); if (loginNo) loginNo.textContent = st('noAccountYet');
    var originalLabel = document.getElementById('ddOriginalLabel'); if (originalLabel) originalLabel.textContent = st('originalBarText');
  };

  doLogin = async function() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { showToast(st('emailPasswordRequired') || 'Bitte Email und Passwort eingeben', true); return; }
    var _loginBtn = document.getElementById('btnLoginSubmit');
    var defaultLabel = shopT('loginSubmitBtn') || 'Einloggen';
    if (_loginBtn) { _loginBtn.disabled = true; _loginBtn.textContent = '⏳...'; }
    try {
      const r = await api({ action: 'customerLogin', email, password });
      if (r.success) {
        var uiLang = (r.customer && r.customer.lang) || _shopLang || localStorage.getItem('barsclusive_lang') || 'de';
        sessionSet(r.token, r.customer.name, r.customer.email, 'customer', uiLang);
        closeModal('loginModal');
        document.getElementById('loginPassword').value = '';
        showToast('✅ ' + (st('loginSuccess') || 'Eingeloggt!'));
        Promise.resolve().then(loadFavorites).catch(function(){});
        if (document.getElementById('ordersView') && document.getElementById('ordersView').style.display === 'block') Promise.resolve().then(loadOrders).catch(function(){});
      } else {
        showToast(r.error || (st('invalidCredentials') || 'Ungültige Zugangsdaten'), true);
        document.getElementById('loginPassword').value = '';
      }
    } catch (e) {
      showToast(st('networkError') || 'Verbindungsfehler', true);
    } finally {
      if (_loginBtn) { _loginBtn.disabled = false; _loginBtn.textContent = defaultLabel; }
    }
  };

  doRegister = async function() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const passConfirm = document.getElementById('regPasswordConfirm') ? document.getElementById('regPasswordConfirm').value : password;
    const consent = document.getElementById('regConsent').checked;
    const lang = (document.getElementById('regLangSelect') || {}).value || _shopLang || 'de';
    if (!name || !email || !password) { showToast(st('allFieldsRequired') || 'Alle Felder ausfüllen', true); return; }
    if (password.length < 8) { showToast(st('passwordMin8') || 'Passwort mind. 8 Zeichen', true); return; }
    if (password !== passConfirm) { showToast(st('passwordMismatch') || 'Passwörter stimmen nicht überein', true); return; }
    if (!consent) { showToast(st('acceptTermsPrivacy') || 'Bitte AGB & Datenschutz akzeptieren', true); return; }
    try {
      const r = await api({ action: 'customerRegister', name, email, password, lang });
      if (r.success) {
        sessionSet(r.token, name, email, 'customer', (r.customer && r.customer.lang) || lang);
        closeModal('registerModal');
        document.getElementById('regPassword').value = '';
        document.getElementById('regPasswordConfirm').value = '';
        showToast('✅ ' + (st('registerSuccess') || 'Registrierung erfolgreich!'));
      } else {
        showToast(r.error || (st('genericErrorDot') || 'Fehler'), true);
      }
    } catch (e) { showToast(st('networkError') || 'Verbindungsfehler', true); }
  };

  openDealDetail = function(deal) {
    _detailDeal = deal;
    var modal = document.getElementById('dealDetailModal');
    if (!modal) return;
    var isPauschal = (deal.categories || []).indexOf('pauschalgutscheine') !== -1;
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
      if (gid) img.src = 'https://lh3.googleusercontent.com/d/' + gid + '=w800'; else img.src = u;
      img.referrerPolicy = 'no-referrer'; img.onerror = function() { this.style.display='none'; };
      imgDiv.insertBefore(img, imgDiv.firstChild);
    }
    document.getElementById('ddTitle').textContent = deal.title;
    document.getElementById('ddBar').textContent = deal.bar_name + (deal.bar_city ? ' • ' + deal.bar_city : '');
    document.getElementById('ddDesc').textContent = deal.description || '';
    document.getElementById('ddPrice').textContent = Number(deal.deal_price).toFixed(2) + ' CHF';
    var origEl = document.getElementById('ddOrig');
    if (deal.original_price > deal.deal_price) { origEl.textContent = Number(deal.original_price).toFixed(2) + ' CHF'; origEl.style.display = 'inline'; }
    else { origEl.style.display = 'none'; }
    var origWrap = document.getElementById('ddOriginalWrap');
    var origTitle = document.getElementById('ddOriginalTitle');
    var origDesc = document.getElementById('ddOriginalDesc');
    var originalTitle = deal.original_title || deal.title || '';
    var originalDesc = deal.original_description || deal.description || '';
    var titleDiff = (deal.title || '') !== originalTitle;
    var descDiff = (deal.description || '') !== originalDesc;
    if (origWrap && (titleDiff || descDiff)) {
      origWrap.style.display = 'block';
      document.getElementById('ddOriginalLabel').textContent = st('originalBarText');
      origTitle.textContent = titleDiff ? originalTitle : '';
      origTitle.style.display = titleDiff ? 'block' : 'none';
      origDesc.textContent = originalDesc || '';
    } else if (origWrap) {
      origWrap.style.display = 'none';
    }
    var info = '';
    if (deal.bar_address) info += '<div><span style="color:#999">' + escHtml(st('addressLabel')) + '</span><span>' + escHtml(deal.bar_address) + ', ' + escHtml(deal.bar_zip || '') + ' ' + escHtml(deal.bar_city || '') + '</span></div>';
    if (isPauschal) {
      if (deal.discount_percent) info += '<div><span style="color:#999">' + escHtml(st('discountLabel')) + '</span><span style="color:#FF3366;font-weight:700">' + deal.discount_percent + '%</span></div>';
      if (deal.min_order) info += '<div><span style="color:#999">' + escHtml(st('minimumOrderLabel')) + '</span><span>' + deal.min_order + ' CHF</span></div>';
      info += '<div><span style="color:#999">' + escHtml(st('typeLabel')) + '</span><span>' + escHtml(st('flatVoucherType')) + '</span></div>';
    }
    var weekdays = deal.valid_weekdays || [];
    if (weekdays.length) info += '<div><span style="color:#999">' + escHtml(st('weekdaysLabel')) + '</span><span>' + weekdays.join(', ') + '</span></div>';
    if (deal.valid_from_time && deal.valid_to_time) info += '<div><span style="color:#999">' + escHtml(st('timeLabel')) + '</span><span>' + deal.valid_from_time + ' - ' + deal.valid_to_time + '</span></div>';
    if (deal.max_quantity > 0) info += '<div><span style="color:#999">' + escHtml(st('availableLabel')) + '</span><span>' + Math.max(0, deal.max_quantity - (deal.sold_count||0)) + ' / ' + deal.max_quantity + '</span></div>';
    document.getElementById('ddInfo').innerHTML = info || '<div style="color:#666">' + escHtml(st('detailsNone')) + '</div>';
    var shareUrl = window.location.origin + window.location.pathname + '?deal=' + deal.id;
    var shareText = deal.title + ' bei ' + deal.bar_name + ' - nur ' + Number(deal.deal_price).toFixed(2) + ' CHF!';
    var shareEl = document.getElementById('ddShare'); shareEl.innerHTML = '';
    var shareItems = [['📋 ' + (shopT('shareCopy') || 'Link kopieren'), function() { copyDealLink(); }]];
    if (navigator.share) shareItems.unshift(['📱 ' + (shopT('shareBtn') || 'Teilen'), function() { navigator.share({ title: deal.title, text: shareText, url: shareUrl }).catch(function() {}); }]);
    shareItems.forEach(function(s) { var btn = document.createElement('button'); btn.className = 'share-btn'; btn.textContent = s[0]; btn.addEventListener('click', s[1]); shareEl.appendChild(btn); });
    document.getElementById('ddBuyBtn').onclick = function() { closeDealDetail(); openBuyModal(deal); };
    var ddCartBtn = document.getElementById('ddCartBtn');
    if (!ddCartBtn) {
      ddCartBtn = document.createElement('button'); ddCartBtn.id = 'ddCartBtn';
      ddCartBtn.style.cssText = 'width:100%;background:#2a2a2a;border:1px solid #3a3a3a;color:#fff;padding:12px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px';
      document.getElementById('ddBuyBtn').after(ddCartBtn);
    }
    ddCartBtn.textContent = '🛒 ' + (shopT('cartAddTitle') || 'In den Warenkorb');
    ddCartBtn.onclick = function() { addToCart(deal); closeDealDetail(); };
    modal.classList.add('active'); document.body.style.overflow = 'hidden';
  };

  copyDealLink = function() {
    if (!_detailDeal) return;
    var url = window.location.origin + window.location.pathname + '?deal=' + _detailDeal.id;
    navigator.clipboard.writeText(url).then(function() { showToast(st('linkCopied') || 'Link kopiert!'); }).catch(function() { showToast((st('linkGenericPrefix') || 'Link:') + ' ' + url); });
  };
})();

// =============================================
// FINAL UI / UX POLISH PATCH (current uploaded state only)
// =============================================
(function(){
  Object.assign(SHOP_TRANSLATIONS.de, {
    loginBtnShort:'Login',
    distanceSortBtn:'Nach Distanz sortieren',
    distanceSortActive:'Nach Distanz sortiert',
    geoSortActive:'Standort aktiv',
    locationHelper:'Standort wählen oder Distanzsortierung aktivieren.',
    locationPlaceholder:'Ort oder Adresse suchen...',
    statusLabel:'Status',
    heroKicker:'✨ BarSclusive Picks',
    trustFastTitle:'Schnell gekauft', trustFastText:'Digitale Gutscheine in wenigen Sekunden erhalten.',
    trustNearbyTitle:'Lokal entdecken', trustNearbyText:'Deals in deiner Nähe oder gezielt nach Adresse filtern.',
    trustVoucherTitle:'Direkt einlösbar', trustVoucherText:'Sofort verfügbar, einfach teilen und mobil vorzeigen.',
    heroBenefitTitle:'Exklusive Gutscheine, sofort digital.',
    heroBenefitText:'Entdecke hochwertige Deals, kaufe in wenigen Klicks und behalte alles direkt im Login im Blick.',
    sectionUtilityTitle:'Entdecke heute besondere Bar-Momente.',
    sectionUtilityText:'Exklusive Gutscheine sofort digital erhalten und direkt vor Ort einlösen.',
    buyFixedDeal:'Jetzt sichern', buyDiscountVoucher:'Rabatt aktivieren',
    dealPriceLabel:'Preis',
    orderAt:'Bestellt am', orderFrom:'Bar',
    orderStatusPending:'⏳ Ausstehend', orderStatusPaid:'✅ Gekauft', orderStatusRedeemed:'🎉 Eingelöst', orderStatusRefundRequested:'⏳ Rückerstattung beantragt', orderStatusRefunded:'↩️ Rückerstattet',
    noFavoritesTitle:'Noch keine Favoriten', noFavoritesText:'Speichere spannende Deals und kaufe später mit einem Tap.',
    noFavoriteDealsTitle:'Keine aktiven Favoriten', noFavoriteDealsText:'Sobald deine Lieblingsbars neue Deals haben, erscheinen sie hier.',
    cartEmptyTitle:'Dein Warenkorb ist leer', cartEmptyText:'Füge einen Deal hinzu und verwalte deine Bestellung hier.', cartContinue:'Deals entdecken',
    orderVoucherTitle:'Deine Gutscheine',
    copiedLinkToast:'Link kopiert!'
  });
  Object.assign(SHOP_TRANSLATIONS.en, {
    loginBtnShort:'Login',
    distanceSortBtn:'Sort by distance',
    distanceSortActive:'Sorted by distance',
    geoSortActive:'Location active',
    locationHelper:'Choose a place or enable distance sorting.',
    locationPlaceholder:'Search place or address...',
    statusLabel:'Status',
    heroKicker:'✨ BarSclusive Picks',
    trustFastTitle:'Bought in seconds', trustFastText:'Receive digital vouchers in just a few moments.',
    trustNearbyTitle:'Discover local bars', trustNearbyText:'Filter deals near you or search by address.',
    trustVoucherTitle:'Ready right away', trustVoucherText:'Instantly available, easy to share and show on mobile.',
    heroBenefitTitle:'Exclusive vouchers, instantly digital.',
    heroBenefitText:'Discover premium deals, buy in a few taps and manage everything in your login.',
    sectionUtilityTitle:'Find standout bar moments today.',
    sectionUtilityText:'Receive exclusive vouchers instantly and redeem them on site.',
    buyFixedDeal:'Get this deal', buyDiscountVoucher:'Activate discount',
    dealPriceLabel:'Price',
    orderAt:'Ordered on', orderFrom:'Bar',
    orderStatusPending:'⏳ Pending', orderStatusPaid:'✅ Purchased', orderStatusRedeemed:'🎉 Redeemed', orderStatusRefundRequested:'⏳ Refund requested', orderStatusRefunded:'↩️ Refunded',
    noFavoritesTitle:'No favorites yet', noFavoritesText:'Save deals you like and come back anytime.',
    noFavoriteDealsTitle:'No active favorites', noFavoriteDealsText:'As soon as your favorite bars publish new deals, they will appear here.',
    cartEmptyTitle:'Your cart is empty', cartEmptyText:'Add a deal and manage your checkout right here.', cartContinue:'Explore deals',
    orderVoucherTitle:'Your vouchers',
    copiedLinkToast:'Link copied!'
  });
  Object.assign(SHOP_TRANSLATIONS.it, {
    loginBtnShort:'Accedi',
    distanceSortBtn:'Ordina per distanza',
    distanceSortActive:'Ordinato per distanza',
    geoSortActive:'Posizione attiva',
    locationHelper:'Scegli un luogo o attiva l’ordinamento per distanza.',
    locationPlaceholder:'Cerca luogo o indirizzo...',
    statusLabel:'Stato',
    heroKicker:'✨ Scelte BarSclusive',
    trustFastTitle:'Acquisto rapido', trustFastText:'Ricevi voucher digitali in pochi secondi.',
    trustNearbyTitle:'Scopri locali vicini', trustNearbyText:'Filtra i deal vicino a te o cerca per indirizzo.',
    trustVoucherTitle:'Pronto subito', trustVoucherText:'Disponibile immediatamente, facile da condividere e mostrare dal telefono.',
    heroBenefitTitle:'Voucher esclusivi, subito digitali.',
    heroBenefitText:'Scopri deal di qualità, acquista in pochi tocchi e gestisci tutto dal tuo login.',
    sectionUtilityTitle:'Scopri oggi momenti speciali al bar.',
    sectionUtilityText:'Ricevi voucher esclusivi subito e riscattali direttamente sul posto.',
    buyFixedDeal:'Ottieni il deal', buyDiscountVoucher:'Attiva sconto',
    dealPriceLabel:'Prezzo',
    orderAt:'Ordinato il', orderFrom:'Bar',
    orderStatusPending:'⏳ In attesa', orderStatusPaid:'✅ Acquistato', orderStatusRedeemed:'🎉 Riscattato', orderStatusRefundRequested:'⏳ Rimborso richiesto', orderStatusRefunded:'↩️ Rimborsato',
    noFavoritesTitle:'Ancora nessun preferito', noFavoritesText:'Salva i deal che ti piacciono e ritrovali quando vuoi.',
    noFavoriteDealsTitle:'Nessun preferito attivo', noFavoriteDealsText:'Appena i tuoi bar preferiti pubblicano nuovi deal, li troverai qui.',
    cartEmptyTitle:'Il carrello è vuoto', cartEmptyText:'Aggiungi un deal e gestisci qui il tuo checkout.', cartContinue:'Scopri i deal',
    orderVoucherTitle:'I tuoi voucher',
    copiedLinkToast:'Link copiato!'
  });
  Object.assign(SHOP_TRANSLATIONS.fr, {
    loginBtnShort:'Connexion',
    distanceSortBtn:'Trier par distance',
    distanceSortActive:'Trié par distance',
    geoSortActive:'Position active',
    locationHelper:'Choisissez un lieu ou activez le tri par distance.',
    locationPlaceholder:'Rechercher un lieu ou une adresse...',
    statusLabel:'Statut',
    heroKicker:'✨ Sélection BarSclusive',
    trustFastTitle:'Achat rapide', trustFastText:'Recevez vos bons numériques en quelques secondes.',
    trustNearbyTitle:'Découvrir localement', trustNearbyText:'Filtrez les offres près de vous ou recherchez une adresse.',
    trustVoucherTitle:'Utilisable tout de suite', trustVoucherText:'Disponible immédiatement, simple à partager et à montrer sur mobile.',
    heroBenefitTitle:'Des bons exclusifs, immédiatement numériques.',
    heroBenefitText:'Découvrez des offres premium, achetez en quelques gestes et gérez tout depuis votre compte.',
    sectionUtilityTitle:'Découvrez aujourd’hui des moments bar à part.',
    sectionUtilityText:'Recevez des bons exclusifs instantanément et utilisez-les directement sur place.',
    buyFixedDeal:'Obtenir l’offre', buyDiscountVoucher:'Activer la réduction',
    dealPriceLabel:'Prix',
    orderAt:'Commandé le', orderFrom:'Bar',
    orderStatusPending:'⏳ En attente', orderStatusPaid:'✅ Acheté', orderStatusRedeemed:'🎉 Utilisé', orderStatusRefundRequested:'⏳ Remboursement demandé', orderStatusRefunded:'↩️ Remboursé',
    noFavoritesTitle:'Pas encore de favoris', noFavoritesText:'Enregistrez les offres qui vous plaisent et revenez plus tard en un geste.',
    noFavoriteDealsTitle:'Aucun favori actif', noFavoriteDealsText:'Dès que vos bars favoris publient de nouvelles offres, elles apparaîtront ici.',
    cartEmptyTitle:'Votre panier est vide', cartEmptyText:'Ajoutez une offre et gérez votre commande ici.', cartContinue:'Découvrir les offres',
    orderVoucherTitle:'Vos bons',
    copiedLinkToast:'Lien copié !'
  });

  function uiLocale(){ return ({de:'de-CH',en:'en-CH',it:'it-CH',fr:'fr-CH'})[_shopLang || shopLang || 'de'] || 'de-CH'; }
  function uiText(key, fallback){ return shopT(key) || fallback || key; }
  function localizeWeekdays(days){
    var map = {
      de:{Mo:'Mo',Di:'Di',Mi:'Mi',Do:'Do',Fr:'Fr',Sa:'Sa',So:'So'},
      en:{Mo:'Mon',Di:'Tue',Mi:'Wed',Do:'Thu',Fr:'Fri',Sa:'Sat',So:'Sun'},
      it:{Mo:'Lun',Di:'Mar',Mi:'Mer',Do:'Gio',Fr:'Ven',Sa:'Sab',So:'Dom'},
      fr:{Mo:'Lun',Di:'Mar',Mi:'Mer',Do:'Jeu',Fr:'Ven',Sa:'Sam',So:'Dim'}
    };
    var table = map[_shopLang || shopLang || 'de'] || map.de;
    return (days || []).map(function(d){ return table[d] || d; }).join(', ');
  }
  function localizeTimeSlot(slot){
    var labels = {
      de:{morning:'🌅 Morgen',midday:'☀️ Mittag',evening:'🌙 Abend'},
      en:{morning:'🌅 Morning',midday:'☀️ Midday',evening:'🌙 Evening'},
      it:{morning:'🌅 Mattina',midday:'☀️ Pranzo',evening:'🌙 Sera'},
      fr:{morning:'🌅 Matin',midday:'☀️ Midi',evening:'🌙 Soir'}
    };
    return ((labels[_shopLang || shopLang || 'de'] || labels.de)[slot]) || slot;
  }
  function localizedCategory(cat){
    var keyMap = { breakfast:'catBreakfast', lunch:'catLunch', aperitif:'catAperitif', dinner:'catDinner', events:'catEvents', pauschalgutscheine:'catDiscount' };
    return uiText(keyMap[cat], cat);
  }
  function localizedDateTime(value){
    try { return new Date(value).toLocaleString(uiLocale(), { dateStyle:'medium', timeStyle:'short' }); }
    catch(e){ return value || ''; }
  }
  function formatValidityLabel(deal){
    if (deal.validity_type === 'single' && deal.valid_single_date) {
      var p = parseDateString(deal.valid_single_date);
      if (p) {
        var d = new Date(p.year, p.month - 1, p.day);
        var label = d.toLocaleDateString(uiLocale(), { weekday:'short', day:'2-digit', month:'2-digit', year:'numeric' });
        if (deal.valid_from_time && deal.valid_to_time) label += ' · ' + deal.valid_from_time + '–' + deal.valid_to_time;
        return '📅 ' + label;
      }
    }
    if (deal.valid_from_time && deal.valid_to_time) return '🕐 ' + deal.valid_from_time + '–' + deal.valid_to_time;
    if (deal.time_slots && deal.time_slots.length) return deal.time_slots.map(localizeTimeSlot).join(' · ');
    return '';
  }
  function updateShopStaticUi(){
    var mapping = {
      heroKicker:'heroKicker', trustFastTitle:'trustFastTitle', trustFastText:'trustFastText', trustNearbyTitle:'trustNearbyTitle', trustNearbyText:'trustNearbyText', trustVoucherTitle:'trustVoucherTitle', trustVoucherText:'trustVoucherText', heroBenefitTitle:'heroBenefitTitle', heroBenefitText:'heroBenefitText', sectionUtilityTitle:'sectionUtilityTitle', sectionUtilityText:'sectionUtilityText', locationHelper:'locationHelper'
    };
    Object.keys(mapping).forEach(function(id){ var el=document.getElementById(id); if(el) el.textContent = uiText(mapping[id], el.textContent); });
    var search = document.getElementById('shopSearch'); if (search) search.placeholder = uiText('searchBarDeal', search.placeholder);
    var locationInput = document.getElementById('locationInput');
    if (locationInput && (!_locationState.label || _locationState.source === 'geo') && document.activeElement !== locationInput) locationInput.placeholder = uiText('locationPlaceholder', locationInput.placeholder || '');
    var btn = document.getElementById('btnUseMyLocation'); if (btn) btn.textContent = uiText('distanceSortBtn', 'Sort by distance');
    var userBtn = document.getElementById('userBtn'); if (userBtn && !sessionGet()) userBtn.textContent = '👤 ' + uiText('loginBtnShort', 'Login');
    updateLocationUi();
  }

  var _origSetShopLangUi = setShopLang;
  setShopLang = function(lang){
    _origSetShopLangUi(lang);
    updateShopStaticUi();
    try { renderCartPanel(); } catch(e) {}
    try { if (document.getElementById('ordersView') && document.getElementById('ordersView').style.display === 'block') loadOrders(); } catch(e) {}
    try { if (document.getElementById('favoritesView') && document.getElementById('favoritesView').style.display === 'block') showFavorites(); } catch(e) {}
  };

  updateLocationUi = function() {
    var clearBtn = document.getElementById('btnClearLocation');
    var statusEl = document.getElementById('locationStatus');
    var sortEl = document.getElementById('distanceSortStatus');
    var inputEl = document.getElementById('locationInput');
    var hasCoords = isValidCoord(Number(_userLat)) && isValidCoord(Number(_userLng));
    var hasLabel = !!(_locationState.label && _locationState.source !== 'geo');
    if (clearBtn) clearBtn.style.display = (hasCoords || hasLabel || !!filters.city) ? 'inline-flex' : 'none';
    if (statusEl) {
      if (hasLabel) {
        statusEl.style.display = 'inline-flex';
        statusEl.textContent = '📍 ' + _locationState.label;
      } else {
        statusEl.style.display = 'none';
        statusEl.textContent = '';
      }
    }
    if (sortEl) {
      if (hasCoords) {
        sortEl.style.display = 'inline-flex';
        sortEl.textContent = '↕️ ' + uiText('distanceSortActive', 'Sorted by distance');
      } else {
        sortEl.style.display = 'none';
        sortEl.textContent = '';
      }
    }
    if (inputEl && document.activeElement !== inputEl) {
      if (hasLabel) inputEl.value = _locationState.label;
      else if (_locationState.source === 'geo') inputEl.value = '';
    }
  };

  requestGeoPermission = function() {
    if (!navigator.geolocation) { showToast(uiText('locationUnavailable', 'Location not available'), true); dismissGeoBanner(); return; }
    navigator.geolocation.getCurrentPosition(function(pos) {
      _userLat = pos.coords.latitude;
      _userLng = pos.coords.longitude;
      _locationState = { label:'', lat:_userLat, lng:_userLng, source:'geo', textFilter:'' };
      var input = document.getElementById('locationInput'); if (input && document.activeElement !== input) input.value = '';
      saveLocationState();
      updateLocationUi();
      dismissGeoBanner();
      showToast(uiText('dealsSortedByDistance', '📍 Deals are now sorted by distance'));
      sortDealsByDistance();
    }, function(){ dismissGeoBanner(); showToast(uiText('locationUnavailable','Location not available'), true); }, { enableHighAccuracy:false, timeout:10000 });
  };

  var _origClearLocationUi = clearLocation;
  clearLocation = function(){ _origClearLocationUi(); updateLocationUi(); };

  buildDealCard = function(deal) {
    var card = document.createElement('div');
    card.className = 'deal-card';
    var isPauschal = (deal.categories || []).includes('pauschalgutscheine');
    var discount = deal.original_price > deal.deal_price ? Math.round((1 - deal.deal_price / deal.original_price) * 100) : 0;
    var mainCat = (deal.categories || [])[0];

    var imgDiv = document.createElement('div');
    imgDiv.className = 'deal-image';
    if (deal.image_url) {
      var img = document.createElement('img');
      var imgUrl = deal.image_url, gid='';
      if (imgUrl.indexOf('lh3.googleusercontent.com/d/') >= 0) gid = imgUrl.split('/d/')[1].split('=')[0];
      else if (imgUrl.indexOf('thumbnail?id=') >= 0) gid = imgUrl.split('id=')[1].split('&')[0];
      else if (imgUrl.indexOf('/d/') >= 0) gid = (imgUrl.split('/d/')[1] || '').split('/')[0];
      else if (imgUrl.indexOf('uc?') >= 0 && imgUrl.indexOf('id=') >= 0) gid = imgUrl.split('id=')[1].split('&')[0];
      if (gid) imgUrl = 'https://lh3.googleusercontent.com/d/' + gid + '=w900';
      img.src = imgUrl; img.alt = escHtml(deal.title || 'Deal'); img.referrerPolicy = 'no-referrer'; img.crossOrigin = 'anonymous';
      img.onerror = function(){
        if (gid && !this.dataset.retried) { this.dataset.retried='1'; this.src='https://drive.google.com/thumbnail?id=' + gid + '&sz=w900'; }
        else { this.remove(); imgDiv.textContent = isPauschal ? '🏷️' : '🍸'; imgDiv.style.fontSize='46px'; }
      };
      imgDiv.appendChild(img);
    } else {
      imgDiv.textContent = isPauschal ? '🏷️' : '🍸';
      imgDiv.style.fontSize = '46px';
    }
    if (discount > 0 && !isPauschal) {
      var badge = document.createElement('div'); badge.className = 'badge-discount'; badge.textContent = '-' + discount + '%'; imgDiv.appendChild(badge);
    }
    if (isPauschal && deal.discount_percent) {
      var pBadge = document.createElement('div'); pBadge.className = 'badge-discount'; pBadge.textContent = '-' + deal.discount_percent + '%'; imgDiv.appendChild(pBadge);
    }
    if (mainCat) {
      var cBadge = document.createElement('div'); cBadge.className = 'badge-cat'; cBadge.textContent = localizedCategory(mainCat); imgDiv.appendChild(cBadge);
    }
    if (typeof deal._dist === 'number' && isFinite(deal._dist)) {
      var dBadge = document.createElement('div'); dBadge.className = 'badge-dist'; dBadge.textContent = formatDistanceLabel(deal._dist); imgDiv.appendChild(dBadge);
    }

    var content = document.createElement('div'); content.className = 'deal-content';
    var title = document.createElement('div'); title.className = 'deal-title'; title.textContent = deal.title || '';
    var bar = document.createElement('div'); bar.className = 'deal-bar'; bar.textContent = (deal.bar_name || '') + (deal.bar_city ? ' · ' + deal.bar_city : '');
    var address = document.createElement('div'); address.className = 'deal-address'; address.textContent = deal.bar_address ? '📍 ' + deal.bar_address + (deal.bar_city ? ', ' + deal.bar_city : '') : (deal.bar_city ? '📍 ' + deal.bar_city : '');

    var meta = document.createElement('div'); meta.className = 'deal-meta-chips';
    var validity = formatValidityLabel(deal);
    if (validity) { var chip = document.createElement('span'); chip.className = 'deal-chip'; chip.textContent = validity; meta.appendChild(chip); }
    if (deal.time_slots && deal.time_slots.length) {
      deal.time_slots.forEach(function(slot){ var chip = document.createElement('span'); chip.className='deal-chip'; chip.textContent = localizeTimeSlot(slot); meta.appendChild(chip); });
    }
    if (isPauschal && deal.applies_to) {
      var applyMap = { all: uiText('alles','Alles'), drinks: uiText('getraenke','Getränke'), food: uiText('essen','Essen') };
      var chipApply = document.createElement('span'); chipApply.className='deal-chip'; chipApply.textContent = '✅ ' + uiText('giltFuer','Gilt für:') + ' ' + (applyMap[deal.applies_to] || deal.applies_to); meta.appendChild(chipApply);
    }

    var priceRow = document.createElement('div'); priceRow.className = 'deal-price-row';
    var priceStack = document.createElement('div'); priceStack.className = 'deal-price-stack';
    var priceLabel = document.createElement('div'); priceLabel.className = 'deal-price-label'; priceLabel.textContent = uiText('dealPriceLabel','Preis');
    var priceWrap = document.createElement('div'); priceWrap.className = 'deal-price';
    var pNew = document.createElement('span'); pNew.className = 'price-new'; pNew.textContent = Number(deal.deal_price || 0).toFixed(2) + ' CHF';
    priceWrap.appendChild(pNew);
    if (deal.original_price > deal.deal_price && !isPauschal) {
      var pOld = document.createElement('span'); pOld.className = 'price-old'; pOld.textContent = Number(deal.original_price).toFixed(2) + ' CHF'; priceWrap.appendChild(pOld);
    }
    priceStack.append(priceLabel, priceWrap);
    if (isPauschal) {
      var note = document.createElement('div'); note.className = 'deal-price-note'; note.textContent = deal.discount_percent + '% ' + uiText('minimumOrderLabel','Mindestbestellung') + ' ' + (deal.min_order || 0) + ' CHF'; priceStack.appendChild(note);
    }

    var actionsRow = document.createElement('div'); actionsRow.className = 'deal-actions-row';
    var btn = document.createElement('button'); btn.className = 'deal-primary-btn'; btn.textContent = isPauschal ? uiText('buyDiscountVoucher','Rabatt aktivieren') : uiText('buyFixedDeal','Jetzt sichern'); btn.addEventListener('click', function(e){ e.stopPropagation(); openBuyModal(deal); });
    var inlineActions = document.createElement('div'); inlineActions.className = 'deal-inline-actions';
    var favBtn = document.createElement('button'); favBtn.className = 'fav-btn'; favBtn.textContent = (_favorites.indexOf(deal.id) !== -1) ? '❤️' : '🤍'; favBtn.title = 'Favorite'; favBtn.addEventListener('click', function(e){ e.stopPropagation(); toggleFavorite(deal.id, favBtn); });
    var cartBtn = document.createElement('button'); cartBtn.className = 'add-cart-btn'; cartBtn.textContent = '🛒'; cartBtn.title = uiText('cartAddTitle','Add to cart'); cartBtn.addEventListener('click', function(e){ e.stopPropagation(); addToCart(deal); });
    inlineActions.append(favBtn, cartBtn);
    actionsRow.append(btn, inlineActions);
    priceRow.append(priceStack, document.createElement('div'));

    content.append(title, bar, address, meta, priceRow, actionsRow);
    card.append(imgDiv, content);
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(){ openDealDetail(deal); });
    return card;
  };

  buildOrderCard = function(o) {
    var card = document.createElement('div'); card.className = 'order-card';
    var head = document.createElement('div'); head.className = 'order-head';
    var titleWrap = document.createElement('div');
    var titleEl = document.createElement('div'); titleEl.className = 'order-title'; titleEl.textContent = o.deal_title || 'BarSclusive';
    var meta = document.createElement('div'); meta.className = 'order-meta';
    meta.innerHTML = '<span>🏷️ ' + escHtml(uiText('orderFrom','Bar')) + ': ' + escHtml(o.bar_name || '') + '</span><span>💳 ' + Number(o.price || 0).toFixed(2) + ' CHF</span><span>🗓️ ' + escHtml(uiText('orderAt','Bestellt am')) + ': ' + escHtml(localizedDateTime(o.created_at)) + '</span>';
    titleWrap.append(titleEl, meta);
    var pill = document.createElement('div'); pill.className = 'status-pill ' + ({ pending:'s-pending', created:'s-pending', paid:'s-paid', redeemed:'s-redeemed' }[o.status] || 's-pending');
    pill.textContent = o.refund_status === 'requested' ? uiText('orderStatusRefundRequested','Refund requested') : o.refund_status === 'completed' ? uiText('orderStatusRefunded','Refunded') : ({ pending:uiText('orderStatusPending','Pending'), created:uiText('orderStatusPending','Pending'), paid:uiText('orderStatusPaid','Purchased'), redeemed:uiText('orderStatusRedeemed','Redeemed') }[o.status] || o.status);
    head.append(titleWrap, pill); card.appendChild(head);
    var codes = (o.voucher_code || '').split(',').map(function(c){ return c.trim(); }).filter(Boolean);
    if (codes.length) {
      var title = document.createElement('div'); title.className='deal-price-label'; title.style.margin='14px 0 10px'; title.textContent = uiText('orderVoucherTitle','Your vouchers'); card.appendChild(title);
      codes.forEach(function(vc){
        var box = document.createElement('div'); box.className = 'voucher-box';
        var label = document.createElement('div'); label.style.cssText='font-size:12px;color:#a9b2c6;margin-bottom:8px'; label.textContent = uiText('gutscheinCode','Voucher code:');
        var codeEl = document.createElement('div'); codeEl.className = 'voucher-code'; codeEl.textContent = vc;
        var actions = document.createElement('div'); actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:14px';
        var vUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'voucher.html?code=' + encodeURIComponent(vc) + '&lang=' + encodeURIComponent(_shopLang || localStorage.getItem('barsclusive_lang') || 'de');
        var viewLink = document.createElement('a'); viewLink.href = vUrl; viewLink.target='_blank'; viewLink.className='share-btn'; viewLink.style.textDecoration='none'; viewLink.textContent = '🎫 ' + (uiText('gutscheinAnzeigen','View'));
        var copyBtn = document.createElement('button'); copyBtn.className='share-btn'; copyBtn.textContent='📋 ' + uiText('linkKopieren','Copy link'); copyBtn.addEventListener('click', function(){ copyVoucherLink(vc); });
        actions.append(viewLink, copyBtn);
        if (navigator.share) {
          var shareBtn = document.createElement('button'); shareBtn.className='share-btn'; shareBtn.textContent='📱 ' + uiText('shareBtn','Share'); shareBtn.addEventListener('click', function(){ navigator.share({ title:o.deal_title || 'BarSclusive', url:vUrl }).catch(function(){}); }); actions.appendChild(shareBtn);
        }
        box.append(label, codeEl, actions); card.appendChild(box);
      });
    }
    if (o.refund_status === 'requested') {
      var info = document.createElement('div'); info.style.cssText='color:#facc15;margin-top:12px;font-size:14px'; info.textContent='⏳ ' + uiText('refundRequested','Rückerstattung beantragt'); card.appendChild(info);
    } else if (o.refund_status === 'completed') {
      var info2 = document.createElement('div'); info2.style.cssText='color:#4ade80;margin-top:12px;font-size:14px'; info2.textContent='↩️ ' + uiText('refunded','Rückerstattet'); card.appendChild(info2);
    } else if (o.can_refund) {
      var refundBtn = document.createElement('button'); refundBtn.className = 'btn-refund'; refundBtn.textContent = '💰 ' + uiText('refundReq','Rückerstattung anfordern'); refundBtn.addEventListener('click', function(){ doRefund(o.id); });
      var hint = document.createElement('div'); hint.className='refund-hint'; hint.textContent = (o.hours_left != null ? o.hours_left + 'h ' : '') + uiText('remaining','remaining');
      card.append(refundBtn, hint);
    }
    return card;
  };

  renderOrders = function(orders) {
    var el = document.getElementById('ordersList'); if (!el) return; el.innerHTML='';
    if (!orders || !orders.length) {
      el.innerHTML = '<div class="empty"><h3>' + escHtml(uiText('keineBestellungen','No orders')) + '</h3><p>' + escHtml(uiText('nochNichts','')) + '</p></div>';
      return;
    }
    orders.forEach(function(o){ el.appendChild(buildOrderCard(o)); });
  };

  showFavorites = function() {
    var el = document.getElementById('favoritesList'); if (!el) return; el.innerHTML = '';
    if (!_favorites.length) { el.innerHTML = '<div class="empty"><h3>' + escHtml(uiText('noFavoritesTitle','No favorites yet')) + '</h3><p>' + escHtml(uiText('noFavoritesText','')) + '</p></div>'; return; }
    var favDeals = allDeals.filter(function(d) { return _favorites.indexOf(d.id) !== -1; });
    if (!favDeals.length) { el.innerHTML = '<div class="empty"><h3>' + escHtml(uiText('noFavoriteDealsTitle','No active favorites')) + '</h3><p>' + escHtml(uiText('noFavoriteDealsText','')) + '</p></div>'; return; }
    favDeals.forEach(function(d){ el.appendChild(buildDealCard(d)); });
  };

  renderCartPanel = function() {
    var body = document.getElementById('cartBody'); if (!body) return;
    getCart(); updateCartBadge(); body.innerHTML = '';
    if (!_cart.length) {
      body.innerHTML = '<div class="empty"><h3>' + escHtml(uiText('cartEmptyTitle','Cart is empty')) + '</h3><p>' + escHtml(uiText('cartEmptyText','')) + '</p><button id="cartEmptyBtn" class="btn-pink" style="margin-top:14px">' + escHtml(uiText('cartContinue','Explore deals')) + '</button></div>';
      var emptyBtn = document.getElementById('cartEmptyBtn'); if (emptyBtn) emptyBtn.addEventListener('click', function(){ closeCartPanel(); showView('deals'); });
      return;
    }
    var defaultName = (sessionGet() && sessionGet().name) ? sessionGet().name : ((document.getElementById('cartBuyerName') || {}).value || '');
    var defaultEmail = (sessionGet() && sessionGet().email) ? sessionGet().email : ((document.getElementById('cartBuyerEmail') || {}).value || '');
    _cart.forEach(function(c){
      var row = document.createElement('div'); row.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06);gap:12px';
      var left = document.createElement('div'); left.style.minWidth='0';
      left.innerHTML = '<div style="font-weight:700">' + escHtml(c.title) + '</div><div style="font-size:12px;color:#98a0b1">' + escHtml(c.bar_name || '') + '</div><div style="font-size:13px;margin-top:4px">' + Number(c.price).toFixed(2) + ' CHF</div>';
      var right = document.createElement('div'); right.style.cssText='display:flex;align-items:center;gap:8px';
      var minus = document.createElement('button'); minus.type='button'; minus.className='share-btn'; minus.textContent='−'; minus.addEventListener('click', function(){ updateCartQuantity(c.deal_id, -1); });
      var qty = document.createElement('span'); qty.style.cssText='min-width:20px;text-align:center;font-weight:700'; qty.textContent=String(c.quantity);
      var plus = document.createElement('button'); plus.type='button'; plus.className='share-btn'; plus.textContent='+'; plus.addEventListener('click', function(){ updateCartQuantity(c.deal_id, 1); });
      var remove = document.createElement('button'); remove.type='button'; remove.className='share-btn'; remove.style.color='#ff7b99'; remove.textContent='✕'; remove.addEventListener('click', function(){ removeFromCart(c.deal_id); });
      right.append(minus, qty, plus, remove); row.append(left, right); body.appendChild(row);
    });
    var totalDiv = document.createElement('div'); totalDiv.style.cssText='padding:18px 0 6px;font-size:20px;font-weight:800;text-align:right'; totalDiv.textContent = (uiText('total','Total') + ': ' + cartTotal().toFixed(2) + ' CHF'); body.appendChild(totalDiv);
    var buyerWrap = document.createElement('div'); buyerWrap.style.cssText='margin-top:12px;padding:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:20px';
    buyerWrap.innerHTML = '' +
      '<div class="form-group" style="margin-bottom:10px"><label class="form-label" for="cartBuyerName">' + escHtml(uiText('nameLbl','Name')) + '</label><input type="text" class="form-input" id="cartBuyerName" value="' + escHtml(defaultName) + '" autocomplete="name"></div>' +
      '<div class="form-group" style="margin-bottom:10px"><label class="form-label" for="cartBuyerEmail">' + escHtml(uiText('emailLbl','Email')) + '</label><input type="email" class="form-input" id="cartBuyerEmail" value="' + escHtml(defaultEmail) + '" autocomplete="email"></div>' +
      '<label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;color:#d4d8e3"><input type="checkbox" id="cartConsent"><span>' + escHtml(uiText('acceptTermsCart','I accept')) + ' <a href="agb.html" target="_blank" rel="noopener" style="color:#FF3366">' + escHtml(uiText('fAGB','AGB')) + '</a> ' + escHtml((_shopLang === 'en' ? 'and' : _shopLang === 'it' ? 'e' : _shopLang === 'fr' ? 'et' : 'und')) + ' <a href="datenschutz.html" target="_blank" rel="noopener" style="color:#FF3366">' + escHtml(uiText('fDatenschutz','Datenschutz')) + '</a>.</span></label>';
    body.appendChild(buyerWrap);
    var checkBtn = document.createElement('button'); checkBtn.id='cartCheckoutBtn'; checkBtn.className='btn-pink'; checkBtn.textContent = _cartCheckoutBusy ? (uiText('processing','Processing')) : (uiText('jetztBezahlen','Jetzt bezahlen')); checkBtn.disabled = _cartCheckoutBusy; checkBtn.style.marginTop='12px'; checkBtn.addEventListener('click', doCartCheckout); body.appendChild(checkBtn);
  };

  copyVoucherLink = function(code) {
    var url = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'voucher.html?code=' + encodeURIComponent(code) + '&lang=' + encodeURIComponent(_shopLang || localStorage.getItem('barsclusive_lang') || 'de');
    navigator.clipboard.writeText(url).then(function(){ showToast(uiText('copiedLinkToast','Link copied!')); }).catch(function(){ showToast((uiText('linkGenericPrefix','Link:')) + ' ' + url); });
  };

  var _origShowViewUi = showView;
  showView = function(view){
    _origShowViewUi(view);
    document.body.classList.toggle('shop-subview', view !== 'deals');
    var utility = document.getElementById('shopSectionUtility');
    var toggle = document.querySelector('.view-toggle');
    if (utility) utility.style.display = view === 'deals' ? 'flex' : 'none';
    if (toggle) toggle.style.display = view === 'deals' ? 'inline-flex' : 'none';
  };

  var _origOpenDealDetailUi = openDealDetail;
  openDealDetail = function(deal){ _origOpenDealDetailUi(deal); try { var ddCart=document.getElementById('ddCartBtn'); if(ddCart) ddCart.className='btn-ghost'; } catch(e){} };

  document.addEventListener('DOMContentLoaded', function(){
    document.body.classList.toggle('shop-subview', false);
    updateShopStaticUi();
  });
})();


(function(){
  Object.assign(SHOP_TRANSLATIONS.de, {
    heroEyebrow:'✨ Kuratierte Bar-Highlights',
    heroTitle:'Die schönsten Bar-Momente in deiner Nähe',
    heroSub:'Exklusive Gutscheine für Breakfast, Lunch, Aperitif, Dinner und Events — direkt digital verfügbar.',
    trustFastTitle:'Sofort digital', trustFastText:'In wenigen Sekunden kaufen, speichern oder verschenken.',
    trustNearbyTitle:'Lokal entdecken', trustNearbyText:'Nach Stadt, Adresse oder Distanz filtern und direkt loslegen.',
    trustVoucherTitle:'Einfach einlösen', trustVoucherText:'Mobil vorzeigen, teilen und jederzeit griffbereit haben.',
    heroBenefitTitle:'Exklusive Gutscheine. Sofort digital.', heroBenefitText:'Entdecke hochwertige Bar-Deals, bestelle in wenigen Klicks und behalte alles direkt im Login im Blick.',
    sectionUtilityTitle:'Entdecke heute besondere Bar-Momente.', sectionUtilityText:'Exklusive Gutscheine sofort digital erhalten und direkt vor Ort einlösen.',
    favoritesSubline:'Speichere schöne Ideen und greife später schneller darauf zu.',
    ordersSubline:'Alle Gutscheine an einem Ort — inklusive Anzeigen, Teilen und Rückerstattung.',
    myLocationBtn:'Nach Distanz sortieren', sortByDistanceActive:'📍 Nach Distanz sortiert', currentPosition:'Aktueller Standort',
    searchPLZ:'Ort oder Adresse suchen…', searchBarDeal:'Bar oder Deal suchen…',
    cartAddTitle:'In den Warenkorb', cartEmptyTitle:'Dein Warenkorb ist noch leer', cartEmptyText:'Speichere attraktive Deals oder füge sofort einen Gutschein hinzu.', cartEmptyCta:'Zu den Deals',
    ordersHeading:'📦 Meine Bestellungen', favoritesHeading:'❤️ Meine Favoriten',
    noFavoritesTitle:'Noch keine Favoriten', noFavoritesText:'Tippe auf ❤ bei einem Deal, um ihn später schneller wiederzufinden.',
    noFavoriteDeals:'Zurzeit keine aktiven Deals in deinen Favoriten',
    addressLabel:'Adresse', discountLabel:'Rabatt', minimumOrderLabel:'Mindestbestellung', typeLabel:'Typ', flatVoucherType:'BarSclusive Rabatt', weekdaysLabel:'Wochentage', timeLabel:'Zeit', availableLabel:'Verfügbar', detailsNone:'Keine weiteren Details',
    orderPending:'⏳ Ausstehend', orderPaid:'✅ Gekauft', orderRedeemed:'🎉 Eingelöst', orderRefundRequested:'↩️ Rückerstattung beantragt', orderRefunded:'↩️ Rückerstattet',
    validOn:'Gültig', fromBar:'von', giftableBadge:'Perfekt zum Verschenken',
    listViewHint:'Deals zuerst', mapViewHint:'Karte als Alternative'
  });
  Object.assign(SHOP_TRANSLATIONS.en, {
    heroEyebrow:'✨ Curated bar highlights',
    heroTitle:'The best bar moments near you',
    heroSub:'Exclusive vouchers for breakfast, lunch, aperitif, dinner and events — instantly available digitally.',
    trustFastTitle:'Instantly digital', trustFastText:'Buy, save or gift vouchers in seconds.',
    trustNearbyTitle:'Discover locally', trustNearbyText:'Filter by city, address or distance and head out faster.',
    trustVoucherTitle:'Easy to redeem', trustVoucherText:'Show it on your phone, share it or keep it ready anytime.',
    heroBenefitTitle:'Exclusive vouchers. Instantly digital.', heroBenefitText:'Discover premium bar deals, buy in a few taps and manage everything right in your login.',
    sectionUtilityTitle:'Discover standout bar moments today.', sectionUtilityText:'Receive exclusive vouchers digitally and redeem them on the spot.',
    favoritesSubline:'Save your favourite ideas and come back to them faster later on.',
    ordersSubline:'All vouchers in one place — including viewing, sharing and refunds.',
    myLocationBtn:'Sort by distance', sortByDistanceActive:'📍 Sorted by distance', currentPosition:'Current location',
    searchPLZ:'Search city or address…', searchBarDeal:'Search bar or deal…',
    cartAddTitle:'Add to cart', cartEmptyTitle:'Your cart is still empty', cartEmptyText:'Save a great deal or add your first voucher now.', cartEmptyCta:'Browse deals',
    ordersHeading:'📦 My orders', favoritesHeading:'❤️ My favourites',
    noFavoritesTitle:'No favourites yet', noFavoritesText:'Tap ❤ on a deal to find it again later.',
    noFavoriteDeals:'No active deals available from your favourites right now',
    addressLabel:'Address', discountLabel:'Discount', minimumOrderLabel:'Minimum order', typeLabel:'Type', flatVoucherType:'BarSclusive discount', weekdaysLabel:'Weekdays', timeLabel:'Time', availableLabel:'Available', detailsNone:'No further details',
    orderPending:'⏳ Pending', orderPaid:'✅ Purchased', orderRedeemed:'🎉 Redeemed', orderRefundRequested:'↩️ Refund requested', orderRefunded:'↩️ Refunded',
    validOn:'Valid', fromBar:'from', giftableBadge:'Perfect as a gift',
    listViewHint:'Deals first', mapViewHint:'Map as alternative'
  });
  Object.assign(SHOP_TRANSLATIONS.it, {
    heroEyebrow:'✨ Selezione BarSclusive',
    heroTitle:'I migliori momenti bar vicino a te',
    heroSub:'Voucher esclusivi per colazione, pranzo, aperitivo, cena ed eventi — subito disponibili in digitale.',
    trustFastTitle:'Subito digitale', trustFastText:'Acquista, salva o regala il voucher in pochi secondi.',
    trustNearbyTitle:'Scopri vicino a te', trustNearbyText:'Filtra per città, indirizzo o distanza e trova subito il posto giusto.',
    trustVoucherTitle:'Facile da riscattare', trustVoucherText:'Mostralo sul telefono, condividilo o tienilo sempre pronto.',
    heroBenefitTitle:'Voucher esclusivi. Subito digitali.', heroBenefitText:'Scopri deal premium, acquista in pochi tocchi e gestisci tutto direttamente dal tuo login.',
    sectionUtilityTitle:'Scopri oggi momenti bar speciali.', sectionUtilityText:'Ricevi voucher esclusivi in digitale e riscattali subito sul posto.',
    favoritesSubline:'Salva le idee migliori e ritrovale più velocemente in seguito.',
    ordersSubline:'Tutti i voucher in un solo posto — con visualizzazione, condivisione e rimborso.',
    myLocationBtn:'Ordina per distanza', sortByDistanceActive:'📍 Ordinato per distanza', currentPosition:'Posizione attuale',
    searchPLZ:'Cerca città o indirizzo…', searchBarDeal:'Cerca bar o deal…',
    cartAddTitle:'Aggiungi al carrello', cartEmptyTitle:'Il carrello è ancora vuoto', cartEmptyText:'Salva un bel deal o aggiungi subito il tuo primo voucher.', cartEmptyCta:'Scopri i deal',
    ordersHeading:'📦 I miei ordini', favoritesHeading:'❤️ I miei preferiti',
    noFavoritesTitle:'Ancora nessun preferito', noFavoritesText:'Tocca ❤ su un deal per ritrovarlo più facilmente più tardi.',
    noFavoriteDeals:'Al momento non ci sono deal attivi nei tuoi preferiti',
    addressLabel:'Indirizzo', discountLabel:'Sconto', minimumOrderLabel:'Ordine minimo', typeLabel:'Tipo', flatVoucherType:'Sconto BarSclusive', weekdaysLabel:'Giorni', timeLabel:'Orario', availableLabel:'Disponibile', detailsNone:'Nessun altro dettaglio',
    orderPending:'⏳ In sospeso', orderPaid:'✅ Acquistato', orderRedeemed:'🎉 Riscattato', orderRefundRequested:'↩️ Rimborso richiesto', orderRefunded:'↩️ Rimborsato',
    validOn:'Valido', fromBar:'di', giftableBadge:'Perfetto da regalare',
    listViewHint:'Prima i deal', mapViewHint:'Mappa come alternativa'
  });
  Object.assign(SHOP_TRANSLATIONS.fr, {
    heroEyebrow:'✨ Sélection BarSclusive',
    heroTitle:'Les meilleurs moments bar près de vous',
    heroSub:'Bons exclusifs pour petit-déjeuner, lunch, apéritif, dîner et événements — disponibles immédiatement en version digitale.',
    trustFastTitle:'Immédiatement digital', trustFastText:'Achetez, enregistrez ou offrez un bon en quelques secondes.',
    trustNearbyTitle:'Découvrir localement', trustNearbyText:'Filtrez par ville, adresse ou distance et trouvez plus vite le bon lieu.',
    trustVoucherTitle:'Facile à utiliser', trustVoucherText:'Montrez-le sur votre téléphone, partagez-le ou gardez-le toujours à portée de main.',
    heroBenefitTitle:'Bons exclusifs. Immédiatement digitaux.', heroBenefitText:'Découvrez des offres premium, achetez en quelques clics et gardez tout directement dans votre connexion.',
    sectionUtilityTitle:'Découvrez aujourd’hui de beaux moments bar.', sectionUtilityText:'Recevez des bons exclusifs en digital et utilisez-les directement sur place.',
    favoritesSubline:'Enregistrez vos idées préférées et retrouvez-les plus vite plus tard.',
    ordersSubline:'Tous les bons au même endroit — avec affichage, partage et remboursement.',
    myLocationBtn:'Trier par distance', sortByDistanceActive:'📍 Trié par distance', currentPosition:'Position actuelle',
    searchPLZ:'Rechercher une ville ou une adresse…', searchBarDeal:'Rechercher un bar ou une offre…',
    cartAddTitle:'Ajouter au panier', cartEmptyTitle:'Votre panier est encore vide', cartEmptyText:'Enregistrez une belle offre ou ajoutez maintenant votre premier bon.', cartEmptyCta:'Voir les offres',
    ordersHeading:'📦 Mes commandes', favoritesHeading:'❤️ Mes favoris',
    noFavoritesTitle:'Pas encore de favoris', noFavoritesText:'Touchez ❤ sur une offre pour la retrouver plus vite plus tard.',
    noFavoriteDeals:'Aucune offre active disponible dans vos favoris pour le moment',
    addressLabel:'Adresse', discountLabel:'Réduction', minimumOrderLabel:'Commande minimum', typeLabel:'Type', flatVoucherType:'Réduction BarSclusive', weekdaysLabel:'Jours', timeLabel:'Horaire', availableLabel:'Disponible', detailsNone:'Aucun autre détail',
    orderPending:'⏳ En attente', orderPaid:'✅ Acheté', orderRedeemed:'🎉 Utilisé', orderRefundRequested:'↩️ Remboursement demandé', orderRefunded:'↩️ Remboursé',
    validOn:'Valable', fromBar:'chez', giftableBadge:'Parfait à offrir',
    listViewHint:'Offres d’abord', mapViewHint:'Carte en alternative',
    buyBtn:'Acheter', viewDeals:'🏠 Offres', favorites:'Favoris'
  });

  function weekdayLabels(){
    return {
      de:{Mo:'Mo',Di:'Di',Mi:'Mi',Do:'Do',Fr:'Fr',Sa:'Sa',So:'So'},
      en:{Mo:'Mon',Di:'Tue',Mi:'Wed',Do:'Thu',Fr:'Fri',Sa:'Sat',So:'Sun'},
      it:{Mo:'Lun',Di:'Mar',Mi:'Mer',Do:'Gio',Fr:'Ven',Sa:'Sab',So:'Dom'},
      fr:{Mo:'Lun',Di:'Mar',Mi:'Mer',Do:'Jeu',Fr:'Ven',Sa:'Sam',So:'Dim'}
    }[shopLang] || {Mo:'Mo',Di:'Di',Mi:'Mi',Do:'Do',Fr:'Fr',Sa:'Sa',So:'So'};
  }
  function getStatusMeta(status){
    var map = {
      pending:['s-pending', st('orderPending')], created:['s-pending', st('orderPending')],
      paid:['s-paid', st('orderPaid')], redeemed:['s-redeemed', st('orderRedeemed')],
      refund_requested:['s-refund', st('orderRefundRequested')], refunded:['s-refund', st('orderRefunded')]
    };
    return map[status] || ['s-pending', status || ''];
  }
  function buildValidityText(deal){
    if (deal.validity_type === 'single' && deal.valid_single_date) {
      var dateParts = parseDateString(deal.valid_single_date);
      if (dateParts) {
        var d = dateParts.day + '.' + dateParts.month + '.' + dateParts.year;
        return '📅 ' + st('validOn') + ' ' + d + (deal.valid_from_time && deal.valid_to_time ? ' · ' + deal.valid_from_time + '–' + deal.valid_to_time : '');
      }
    }
    if (deal.valid_from_time && deal.valid_to_time) return '🕐 ' + deal.valid_from_time + '–' + deal.valid_to_time;
    return '';
  }

  var _baseApply = applyShopTranslations;
  applyShopTranslations = function(){
    _baseApply();
    var heroKicker = document.getElementById('heroKicker'); if (heroKicker) heroKicker.textContent = st('heroEyebrow');
    var trustIds = [
      ['trustFastTitle','trustFastTitle'],['trustFastText','trustFastText'],['trustNearbyTitle','trustNearbyTitle'],['trustNearbyText','trustNearbyText'],['trustVoucherTitle','trustVoucherTitle'],['trustVoucherText','trustVoucherText'],
      ['heroBenefitTitle','heroBenefitTitle'],['heroBenefitText','heroBenefitText'],['sectionUtilityTitle','sectionUtilityTitle'],['sectionUtilityText','sectionUtilityText'],['favoritesHeading','favoritesHeading'],['favoritesSubline','favoritesSubline'],['ordersHeading','ordersHeading'],['ordersSubline','ordersSubline']
    ];
    trustIds.forEach(function(pair){ var el=document.getElementById(pair[0]); if(el) el.textContent = st(pair[1]); });
    var regLang = document.getElementById('regLangSelect');
    if (regLang) {
      var labels = [st('langGerman'), st('langEnglish'), st('langItalian'), st('langFrench')];
      Array.prototype.forEach.call(regLang.options, function(opt, i){ if (labels[i]) opt.textContent = labels[i]; });
    }
    var sortBadge = document.getElementById('distanceSortBadge');
    if (!sortBadge) {
      sortBadge = document.createElement('span'); sortBadge.id='distanceSortBadge'; sortBadge.className='location-pill'; sortBadge.style.display='none';
      var locationStatus = document.getElementById('locationStatus'); if (locationStatus && locationStatus.parentNode) locationStatus.parentNode.appendChild(sortBadge);
    }
    var btnLoc = document.getElementById('btnUseMyLocation'); if (btnLoc) btnLoc.textContent = st('myLocationBtn');
  };

  updateLocationUi = function(){
    var clearBtn = document.getElementById('btnClearLocation');
    var statusEl = document.getElementById('locationStatus');
    var sortBadge = document.getElementById('distanceSortBadge');
    var inputEl = document.getElementById('locationInput');
    var hasLocation = !!(_locationState.label || filters.city || (isValidCoord(Number(_userLat)) && isValidCoord(Number(_userLng))));
    if (clearBtn) clearBtn.style.display = hasLocation ? 'inline-flex' : 'none';
    if (statusEl) {
      if (_locationState.label && _locationState.source !== 'geo') {
        statusEl.style.display = 'inline-flex';
        statusEl.textContent = '📍 ' + _locationState.label;
      } else {
        statusEl.style.display = 'none';
        statusEl.textContent = '';
      }
    }
    if (sortBadge) {
      var activeSort = isValidCoord(Number(_userLat)) && isValidCoord(Number(_userLng));
      sortBadge.style.display = activeSort ? 'inline-flex' : 'none';
      sortBadge.classList.toggle('sort-active', activeSort);
      sortBadge.textContent = st('sortByDistanceActive');
    }
    if (inputEl && _locationState.label && _locationState.source !== 'geo' && document.activeElement !== inputEl) inputEl.value = _locationState.label;
    if (inputEl && _locationState.source === 'geo' && !inputEl.dataset.userTyped && document.activeElement !== inputEl) inputEl.value = '';
  };

  requestGeoPermission = function(){
    if (!navigator.geolocation) { showToast(shopT('locationUnavailable') || 'Standort nicht verfügbar', true); dismissGeoBanner(); return; }
    navigator.geolocation.getCurrentPosition(function(pos){
      _userLat = pos.coords.latitude; _userLng = pos.coords.longitude;
      _locationState = { label:'', lat:_userLat, lng:_userLng, source:'geo', textFilter:'' };
      saveLocationState(); updateLocationUi(); dismissGeoBanner(); showToast(st('sortByDistanceActive')); sortDealsByDistance();
    }, function(){ dismissGeoBanner(); showToast(shopT('locationUnavailable') || 'Standort nicht verfügbar', true); }, { enableHighAccuracy:false, timeout:10000 });
  };

  buildDealCard = function(deal){
    var card = document.createElement('div'); card.className = 'deal-card'; card.style.cursor='pointer';
    var isPauschal = (deal.categories || []).includes('pauschalgutscheine');
    var discount = deal.original_price > deal.deal_price ? Math.round((1 - deal.deal_price / deal.original_price) * 100) : 0;
    var CAT_EMOJI = { breakfast:'🥐', lunch:'🍽️', aperitif:'🍹', dinner:'🍷', events:'🎉', pauschalgutscheine:'🏷️' };
    var CAT_NAME  = {
      breakfast: st('catBreakfast').replace(/^.*?\s/, ''), lunch: st('catLunch').replace(/^.*?\s/, ''), aperitif: st('catAperitif').replace(/^.*?\s/, ''),
      dinner: st('catDinner').replace(/^.*?\s/, ''), events: st('catEvents').replace(/^.*?\s/, ''), pauschalgutscheine: st('catDiscount').replace(/^.*?\s/, '')
    };
    var mainCat = (deal.categories || [])[0];
    var imgDiv = document.createElement('div'); imgDiv.className = 'deal-image';
    if (deal.image_url) {
      var img = document.createElement('img');
      var imgUrl = deal.image_url, gid='';
      if (imgUrl.indexOf('lh3.googleusercontent.com/d/') >= 0) gid = imgUrl.split('/d/')[1].split('=')[0];
      else if (imgUrl.indexOf('thumbnail?id=') >= 0) gid = imgUrl.split('id=')[1].split('&')[0];
      else if (imgUrl.indexOf('/d/') >= 0) gid = (imgUrl.split('/d/')[1] || '').split('/')[0];
      else if (imgUrl.indexOf('uc?') >= 0 && imgUrl.indexOf('id=') >= 0) gid = imgUrl.split('id=')[1].split('&')[0];
      if (gid) imgUrl = 'https://lh3.googleusercontent.com/d/' + gid + '=w800';
      img.src = imgUrl; img.alt = escHtml(deal.title); img.referrerPolicy='no-referrer'; img.crossOrigin='anonymous';
      img.onerror = function(){ if(gid && !this.dataset.retried){ this.dataset.retried='1'; this.src='https://drive.google.com/thumbnail?id=' + gid + '&sz=w800'; } else { this.style.display='none'; imgDiv.textContent = isPauschal ? '🏷️' : '🍹'; imgDiv.style.fontSize='48px'; } };
      imgDiv.appendChild(img);
    } else { imgDiv.textContent = isPauschal ? '🏷️' : '🍹'; imgDiv.style.fontSize='48px'; }
    if (discount > 0) { var bd=document.createElement('div'); bd.className='badge-discount'; bd.textContent='-' + discount + '%'; imgDiv.appendChild(bd); }
    if (isPauschal && deal.discount_percent) { var bp=document.createElement('div'); bp.className='badge-discount'; bp.textContent='-' + deal.discount_percent + '%'; imgDiv.appendChild(bp); }
    if (mainCat) { var bc=document.createElement('div'); bc.className='badge-cat'; bc.textContent=(CAT_EMOJI[mainCat]||'') + ' ' + (CAT_NAME[mainCat]||mainCat); imgDiv.appendChild(bc); }
    if (typeof deal._dist === 'number' && isFinite(deal._dist)) { var bdist=document.createElement('div'); bdist.className='badge-dist'; bdist.textContent=formatDistanceLabel(deal._dist); imgDiv.appendChild(bdist); }

    var content = document.createElement('div'); content.className='deal-content';
    var title = document.createElement('div'); title.className='deal-title'; title.textContent = deal.title;
    var bar = document.createElement('div'); bar.className='deal-bar'; bar.textContent = (deal.bar_name || '') + (deal.bar_city ? ' · ' + deal.bar_city : '');
    var metaRow = document.createElement('div'); metaRow.style.cssText='display:flex;gap:8px;flex-wrap:wrap';
    if (typeof deal._dist === 'number' && isFinite(deal._dist)) { var chip=document.createElement('span'); chip.className='location-pill'; chip.textContent = '📍 ' + formatDistanceLabel(deal._dist); metaRow.appendChild(chip); }
    var validityText = buildValidityText(deal); if (validityText) { var chip2=document.createElement('span'); chip2.className='location-pill'; chip2.textContent = validityText; metaRow.appendChild(chip2); }
    if (isPauschal && deal.discount_percent) { var chip3=document.createElement('span'); chip3.className='location-pill'; chip3.textContent = st('giftableBadge'); metaRow.appendChild(chip3); }
    var addrDiv = document.createElement('div'); addrDiv.className='deal-distance-line';
    if (deal.bar_address) addrDiv.textContent = '📍 ' + deal.bar_address + (deal.bar_city ? ', ' + deal.bar_city : '');
    else if (deal.bar_city) addrDiv.textContent = '📍 ' + deal.bar_city;
    else addrDiv.style.display='none';
    var priceRow = document.createElement('div'); priceRow.className='deal-price';
    var pNew = document.createElement('span'); pNew.className='price-new'; pNew.textContent = Number(deal.deal_price || 0).toFixed(2) + ' CHF';
    priceRow.appendChild(pNew);
    if (!isPauschal && Number(deal.original_price || 0) > Number(deal.deal_price || 0)) { var pOld=document.createElement('span'); pOld.className='price-old'; pOld.textContent = Number(deal.original_price).toFixed(2) + ' CHF'; priceRow.appendChild(pOld); }
    var ctaRow = document.createElement('div'); ctaRow.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap';
    var buyBtn = document.createElement('button'); buyBtn.className='btn-buy'; buyBtn.textContent = isPauschal ? (st('buyBtn') || 'Jetzt kaufen') : (shopT('profitiere') || 'Jetzt profitieren'); buyBtn.addEventListener('click', function(e){ e.stopPropagation(); openBuyModal(deal); });
    var favBtn = document.createElement('button'); favBtn.className='fav-btn'; favBtn.textContent = (_favorites.indexOf(deal.id) !== -1) ? '❤️' : '🤍'; favBtn.addEventListener('click', function(e){ e.stopPropagation(); toggleFavorite(deal.id, favBtn); });
    var cartBtn = document.createElement('button'); cartBtn.className='add-cart-btn'; cartBtn.textContent='🛒'; cartBtn.title = st('cartAddTitle'); cartBtn.addEventListener('click', function(e){ e.stopPropagation(); addToCart(deal); });
    ctaRow.appendChild(buyBtn); ctaRow.appendChild(favBtn); ctaRow.appendChild(cartBtn);
    if (isPauschal && deal.discount_percent && deal.min_order) {
      var pauschal = document.createElement('div'); pauschal.className='deal-validity'; pauschal.textContent = deal.discount_percent + '% ab ' + deal.min_order + ' CHF';
      content.append(title, bar, metaRow, addrDiv, priceRow, pauschal, ctaRow);
    } else {
      content.append(title, bar, metaRow, addrDiv, priceRow, ctaRow);
    }
    card.appendChild(imgDiv); card.appendChild(content); card.addEventListener('click', function(){ openDealDetail(deal); });
    return card;
  };

  showFavorites = function(){
    var el = document.getElementById('favoritesList'); if (!el) return; el.innerHTML='';
    if (!_favorites.length) { el.innerHTML = '<div class="empty"><h3>' + escHtml(st('noFavoritesTitle')) + '</h3><p>' + escHtml(st('noFavoritesText')) + '</p></div>'; return; }
    var favDeals = allDeals.filter(function(d){ return _favorites.indexOf(d.id) !== -1; });
    if (!favDeals.length) { el.innerHTML = '<div class="empty"><h3>' + escHtml(st('noFavoriteDeals')) + '</h3></div>'; return; }
    favDeals.forEach(function(d){ el.appendChild(buildDealCard(d)); });
  };

  buildOrderCard = function(o){
    var card = document.createElement('div'); card.className='order-card';
    var head = document.createElement('div'); head.className='order-head';
    var titleWrap = document.createElement('div');
    var titleEl = document.createElement('div'); titleEl.className='order-title'; titleEl.textContent = o.deal_title || '';
    var metaEl = document.createElement('div'); metaEl.style.cssText='color:#a8afc0;font-size:13px;margin-top:6px'; metaEl.textContent = (o.bar_name || '') + ' · ' + Number(o.price || 0).toFixed(2) + ' CHF';
    titleWrap.appendChild(titleEl); titleWrap.appendChild(metaEl);
    var status = (o.refund_status === 'requested') ? 'refund_requested' : (o.refund_status === 'completed' ? 'refunded' : o.status);
    var meta = getStatusMeta(status);
    var pill = document.createElement('div'); pill.className='status-pill ' + meta[0]; pill.textContent = meta[1];
    head.appendChild(titleWrap); head.appendChild(pill); card.appendChild(head);
    var date = document.createElement('div'); date.style.cssText='color:#7f8798;font-size:12px;margin-bottom:12px';
    try { date.textContent = (shopT('bestellt') || 'Bestellt:') + ' ' + new Date(o.created_at).toLocaleString(shopLang === 'en' ? 'en-GB' : shopLang === 'it' ? 'it-CH' : shopLang === 'fr' ? 'fr-CH' : 'de-CH'); } catch(e){ date.textContent = (shopT('bestellt') || 'Bestellt:') + ' ' + (o.created_at || ''); }
    card.appendChild(date);
    var codes = (o.voucher_code || '').split(',').map(function(c){ return c.trim(); }).filter(Boolean);
    codes.forEach(function(vc){
      var box = document.createElement('div'); box.className='voucher-box';
      box.innerHTML = '<div style="font-size:12px;color:#8f96a8;margin-bottom:6px">' + escHtml(shopT('gutscheinCode') || 'Gutschein-Code:') + '</div><div class="voucher-code">' + escHtml(vc) + '</div>';
      var actions = document.createElement('div'); actions.style.cssText='display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:12px';
      var vUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + 'voucher.html?code=' + encodeURIComponent(vc) + '&lang=' + encodeURIComponent(shopLang);
      var viewLink = document.createElement('a'); viewLink.href=vUrl; viewLink.target='_blank'; viewLink.className='share-btn'; viewLink.style.textDecoration='none'; viewLink.textContent='🎫 ' + (shopT('gutscheinAnzeigen') || 'Anzeigen');
      var copyBtn = document.createElement('button'); copyBtn.className='share-btn'; copyBtn.textContent='📋 ' + (shopT('linkKopieren') || 'Link kopieren'); copyBtn.addEventListener('click', function(){ copyVoucherLink(vc); });
      actions.appendChild(viewLink); actions.appendChild(copyBtn);
      if (navigator.share) {
        var shareBtn = document.createElement('button'); shareBtn.className='share-btn'; shareBtn.textContent='📱 ' + (shopT('shareBtn') || 'Teilen');
        shareBtn.addEventListener('click', function(){ navigator.share({ title:o.deal_title || 'BarSclusive Voucher', url:vUrl }).catch(function(){}); });
        actions.appendChild(shareBtn);
      }
      box.appendChild(actions); card.appendChild(box);
    });
    if (o.refund_status === 'requested') {
      var info = document.createElement('div'); info.style.cssText='color:#FFC107;margin-top:12px;font-size:14px'; info.textContent='⏳ ' + st('refundRequested'); card.appendChild(info);
    } else if (o.refund_status === 'completed') {
      var info2 = document.createElement('div'); info2.style.cssText='color:#4CAF50;margin-top:12px;font-size:14px'; info2.textContent='↩️ ' + st('refunded'); card.appendChild(info2);
    } else if (o.can_refund) {
      var btn = document.createElement('button'); btn.className='btn-refund'; btn.textContent='💰 ' + (shopT('refundReq') || 'Rückerstattung anfordern'); btn.addEventListener('click', function(){ doRefund(o.id); });
      var hint = document.createElement('div'); hint.className='refund-hint'; hint.textContent=(st('remaining') || 'verbleibend') + ': ' + o.hours_left + 'h';
      card.appendChild(btn); card.appendChild(hint);
    }
    return card;
  };

  renderCartPanel = function(){
    var body = document.getElementById('cartBody'); if (!body) return; getCart(); body.innerHTML='';
    if (!_cart.length) {
      body.innerHTML = '<div class="empty" style="padding:34px 16px"><div style="font-size:42px;margin-bottom:12px">🛒</div><h3 style="margin-bottom:8px">' + escHtml(st('cartEmptyTitle')) + '</h3><p style="margin-bottom:16px">' + escHtml(st('cartEmptyText')) + '</p><button id="cartEmptyGoDeals" class="btn-pink" style="margin-top:0">' + escHtml(st('cartEmptyCta')) + '</button></div>';
      var goBtn = document.getElementById('cartEmptyGoDeals'); if (goBtn) goBtn.addEventListener('click', function(){ closeCartPanel(); showView('deals'); });
      return;
    }
    return (window.__origRenderCartPanel ? window.__origRenderCartPanel() : undefined);
  };

  if (!window.__origRenderCartPanel) window.__origRenderCartPanel = renderCartPanel;

  var _reallyOrigRenderCartPanel = window.__origRenderCartPanel;
  renderCartPanel = function(){
    getCart();
    if (!_cart.length) {
      var body = document.getElementById('cartBody'); if (!body) return;
      body.innerHTML = '<div class="empty" style="padding:34px 16px"><div style="font-size:42px;margin-bottom:12px">🛒</div><h3 style="margin-bottom:8px">' + escHtml(st('cartEmptyTitle')) + '</h3><p style="margin-bottom:16px">' + escHtml(st('cartEmptyText')) + '</p><button id="cartEmptyGoDeals" class="btn-pink" style="margin-top:0">' + escHtml(st('cartEmptyCta')) + '</button></div>';
      var goBtn = document.getElementById('cartEmptyGoDeals'); if (goBtn) goBtn.addEventListener('click', function(){ closeCartPanel(); showView('deals'); });
      return;
    }
    _reallyOrigRenderCartPanel();
  };

  openDealDetail = function(deal){
    _detailDeal = deal;
    var modal = document.getElementById('dealDetailModal'); if (!modal) return;
    var isPauschal = (deal.categories || []).indexOf('pauschalgutscheine') !== -1;
    var imgDiv = document.getElementById('ddImg'); var existingImg = imgDiv.querySelector('img'); if (existingImg) existingImg.remove();
    if (deal.image_url) {
      var img = document.createElement('img'); var gid=''; var u=deal.image_url;
      if (u.indexOf('lh3.googleusercontent.com/d/') >= 0) gid = u.split('/d/')[1].split('=')[0];
      else if (u.indexOf('thumbnail?id=') >= 0) gid = u.split('id=')[1].split('&')[0];
      else if (u.indexOf('/d/') >= 0) gid = (u.split('/d/')[1] || '').split('/')[0];
      img.src = gid ? 'https://lh3.googleusercontent.com/d/' + gid + '=w800' : u; img.referrerPolicy='no-referrer'; img.onerror=function(){ this.style.display='none'; }; imgDiv.insertBefore(img,imgDiv.firstChild);
    }
    document.getElementById('ddTitle').textContent = deal.title || '';
    document.getElementById('ddBar').textContent = (deal.bar_name || '') + (deal.bar_city ? ' • ' + deal.bar_city : '');
    document.getElementById('ddDesc').textContent = deal.description || '';
    document.getElementById('ddPrice').textContent = Number(deal.deal_price || 0).toFixed(2) + ' CHF';
    var origEl = document.getElementById('ddOrig'); if (Number(deal.original_price || 0) > Number(deal.deal_price || 0)) { origEl.textContent = Number(deal.original_price).toFixed(2) + ' CHF'; origEl.style.display='inline'; } else { origEl.style.display='none'; }
    var origWrap = document.getElementById('ddOriginalWrap'), origTitle = document.getElementById('ddOriginalTitle'), origDesc = document.getElementById('ddOriginalDesc');
    var originalTitle = deal.original_title || deal.title || '', originalDesc = deal.original_description || deal.description || '';
    var titleDiff = (deal.title || '') !== originalTitle, descDiff = (deal.description || '') !== originalDesc;
    if (origWrap && (titleDiff || descDiff)) { origWrap.style.display='block'; document.getElementById('ddOriginalLabel').textContent = st('originalBarText'); origTitle.textContent = titleDiff ? originalTitle : ''; origTitle.style.display = titleDiff ? 'block' : 'none'; origDesc.textContent = originalDesc || ''; }
    else if (origWrap) origWrap.style.display='none';
    var info = [];
    if (deal.bar_address) info.push('<div><span style="color:#999">' + escHtml(st('addressLabel')) + '</span><span>' + escHtml(deal.bar_address) + ', ' + escHtml(deal.bar_zip || '') + ' ' + escHtml(deal.bar_city || '') + '</span></div>');
    if (isPauschal) {
      if (deal.discount_percent) info.push('<div><span style="color:#999">' + escHtml(st('discountLabel')) + '</span><span style="color:#FF3366;font-weight:700">' + deal.discount_percent + '%</span></div>');
      if (deal.min_order) info.push('<div><span style="color:#999">' + escHtml(st('minimumOrderLabel')) + '</span><span>' + deal.min_order + ' CHF</span></div>');
      info.push('<div><span style="color:#999">' + escHtml(st('typeLabel')) + '</span><span>' + escHtml(st('flatVoucherType')) + '</span></div>');
    }
    var weekdays = (deal.valid_weekdays || []).map(function(w){ return weekdayLabels()[w] || w; });
    if (weekdays.length) info.push('<div><span style="color:#999">' + escHtml(st('weekdaysLabel')) + '</span><span>' + weekdays.join(', ') + '</span></div>');
    if (deal.valid_from_time && deal.valid_to_time) info.push('<div><span style="color:#999">' + escHtml(st('timeLabel')) + '</span><span>' + deal.valid_from_time + ' - ' + deal.valid_to_time + '</span></div>');
    if (deal.max_quantity > 0) info.push('<div><span style="color:#999">' + escHtml(st('availableLabel')) + '</span><span>' + Math.max(0, deal.max_quantity - (deal.sold_count || 0)) + ' / ' + deal.max_quantity + '</span></div>');
    document.getElementById('ddInfo').innerHTML = info.length ? info.join('') : '<div style="color:#666">' + escHtml(st('detailsNone')) + '</div>';
    var shareUrl = window.location.origin + window.location.pathname + '?deal=' + deal.id;
    var shareText = (deal.title || '') + ' ' + (st('fromBar') || '') + ' ' + (deal.bar_name || '') + ' · ' + Number(deal.deal_price || 0).toFixed(2) + ' CHF';
    var shareEl = document.getElementById('ddShare'); shareEl.innerHTML='';
    var shareItems = [['📋 ' + (shopT('shareCopy') || 'Link kopieren'), function(){ copyDealLink(); }]];
    if (navigator.share) shareItems.unshift(['📱 ' + (shopT('shareBtn') || 'Teilen'), function(){ navigator.share({ title: deal.title, text: shareText, url: shareUrl }).catch(function(){}); }]);
    shareItems.forEach(function(entry){ var btn=document.createElement('button'); btn.className='share-btn'; btn.textContent=entry[0]; btn.addEventListener('click', entry[1]); shareEl.appendChild(btn); });
    document.getElementById('ddBuyBtn').textContent = isPauschal ? (st('buyBtn') || 'Jetzt kaufen') : (shopT('profitiere') || 'Jetzt profitieren');
    document.getElementById('ddBuyBtn').onclick = function(){ closeDealDetail(); openBuyModal(deal); };
    var ddCartBtn = document.getElementById('ddCartBtn');
    if (!ddCartBtn) {
      ddCartBtn = document.createElement('button'); ddCartBtn.id='ddCartBtn';
      ddCartBtn.style.cssText='width:100%;background:#20222a;border:1px solid rgba(255,255,255,.08);color:#fff;padding:12px;border-radius:14px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px';
      document.getElementById('ddBuyBtn').after(ddCartBtn);
    }
    ddCartBtn.textContent = '🛒 ' + st('cartAddTitle'); ddCartBtn.onclick=function(){ addToCart(deal); closeDealDetail(); };
    modal.classList.add('active'); document.body.style.overflow='hidden';
  };

  var _baseShowView = showView;
  showView = function(view){ document.body.setAttribute('data-shop-view', view); _baseShowView(view); };

  document.addEventListener('DOMContentLoaded', function(){
    document.body.setAttribute('data-shop-view', 'deals');
    var btns = ['shopSearch','locationInput'];
    btns.forEach(function(id){ var el=document.getElementById(id); if(el){ el.addEventListener('input', function(){ this.dataset.userTyped='1'; }); } });
    applyShopTranslations();
  });
})();
