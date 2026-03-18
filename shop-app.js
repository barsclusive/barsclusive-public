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
  const customDateTrigger = document.getElementById('customDateTrigger');
  if (customDateTrigger && customDateInput) customDateTrigger.addEventListener('click', function(){ try { if (customDateInput.showPicker) customDateInput.showPicker(); else customDateInput.click(); } catch(e){ customDateInput.click(); } });

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
// FINAL SHOP UX + I18N PATCH
// =============================================
(function(){
  function uiLang(){
    return String((_shopLang || shopLang || localStorage.getItem('barsclusive_lang') || 'de')).toLowerCase();
  }

  function timeSlotLabel(slot){
    var lang = uiLang();
    var clean = String(slot || '').toLowerCase();
    var map = {
      de: { morning:'🌅 ' + (shopT('morgen') || 'Morgen'), midday:'☀️ ' + (shopT('mittag') || 'Mittag'), evening:'🌙 ' + (shopT('abend') || 'Abend') },
      en: { morning:'🌅 Morning', midday:'☀️ Noon', evening:'🌙 Evening' },
      it: { morning:'🌅 Mattina', midday:'☀️ Mezzogiorno', evening:'🌙 Sera' },
      fr: { morning:'🌅 Matin', midday:'☀️ Midi', evening:'🌙 Soir' }
    };
    return ((map[lang] || map.de)[clean]) || slot;
  }

  function translateWeekdayToken(token){
    var lang = uiLang();
    var clean = String(token || '').trim().toLowerCase();
    var days = {
      mo: {de:'Mo',en:'Mon',it:'Lun',fr:'Lun'},
      montag: {de:'Montag',en:'Monday',it:'Lunedì',fr:'Lundi'},
      monday: {de:'Montag',en:'Monday',it:'Lunedì',fr:'Lundi'},
      lunedi: {de:'Montag',en:'Monday',it:'Lunedì',fr:'Lundi'},
      'lunedì': {de:'Montag',en:'Monday',it:'Lunedì',fr:'Lundi'},
      lundi: {de:'Montag',en:'Monday',it:'Lunedì',fr:'Lundi'},
      di: {de:'Di',en:'Tue',it:'Mar',fr:'Mar'},
      dienstag: {de:'Dienstag',en:'Tuesday',it:'Martedì',fr:'Mardi'},
      tuesday: {de:'Dienstag',en:'Tuesday',it:'Martedì',fr:'Mardi'},
      martedi: {de:'Dienstag',en:'Tuesday',it:'Martedì',fr:'Mardi'},
      'martedì': {de:'Dienstag',en:'Tuesday',it:'Martedì',fr:'Mardi'},
      mardi: {de:'Dienstag',en:'Tuesday',it:'Martedì',fr:'Mardi'},
      mi: {de:'Mi',en:'Wed',it:'Mer',fr:'Mer'},
      mittwoch: {de:'Mittwoch',en:'Wednesday',it:'Mercoledì',fr:'Mercredi'},
      wednesday: {de:'Mittwoch',en:'Wednesday',it:'Mercoledì',fr:'Mercredi'},
      mercoledi: {de:'Mittwoch',en:'Wednesday',it:'Mercoledì',fr:'Mercredi'},
      'mercoledì': {de:'Mittwoch',en:'Wednesday',it:'Mercoledì',fr:'Mercredi'},
      mercredi: {de:'Mittwoch',en:'Wednesday',it:'Mercoledì',fr:'Mercredi'},
      do: {de:'Do',en:'Thu',it:'Gio',fr:'Jeu'},
      donnerstag: {de:'Donnerstag',en:'Thursday',it:'Giovedì',fr:'Jeudi'},
      thursday: {de:'Donnerstag',en:'Thursday',it:'Giovedì',fr:'Jeudi'},
      giovedi: {de:'Donnerstag',en:'Thursday',it:'Giovedì',fr:'Jeudi'},
      'giovedì': {de:'Donnerstag',en:'Thursday',it:'Giovedì',fr:'Jeudi'},
      jeudi: {de:'Donnerstag',en:'Thursday',it:'Giovedì',fr:'Jeudi'},
      fr: {de:'Fr',en:'Fri',it:'Ven',fr:'Ven'},
      freitag: {de:'Freitag',en:'Friday',it:'Venerdì',fr:'Vendredi'},
      friday: {de:'Freitag',en:'Friday',it:'Venerdì',fr:'Vendredi'},
      venerdi: {de:'Freitag',en:'Friday',it:'Venerdì',fr:'Vendredi'},
      'venerdì': {de:'Freitag',en:'Friday',it:'Venerdì',fr:'Vendredi'},
      vendredi: {de:'Freitag',en:'Friday',it:'Venerdì',fr:'Vendredi'},
      sa: {de:'Sa',en:'Sat',it:'Sab',fr:'Sam'},
      samstag: {de:'Samstag',en:'Saturday',it:'Sabato',fr:'Samedi'},
      saturday: {de:'Samstag',en:'Saturday',it:'Sabato',fr:'Samedi'},
      sabato: {de:'Samstag',en:'Saturday',it:'Sabato',fr:'Samedi'},
      samedi: {de:'Samstag',en:'Saturday',it:'Sabato',fr:'Samedi'},
      so: {de:'So',en:'Sun',it:'Dom',fr:'Dim'},
      sonntag: {de:'Sonntag',en:'Sunday',it:'Domenica',fr:'Dimanche'},
      sunday: {de:'Sonntag',en:'Sunday',it:'Domenica',fr:'Dimanche'},
      domenica: {de:'Sonntag',en:'Sunday',it:'Domenica',fr:'Dimanche'},
      dimanche: {de:'Sonntag',en:'Sunday',it:'Domenica',fr:'Dimanche'}
    };
    return (days[clean] && days[clean][lang]) || token;
  }

  function localizeWeekdayList(raw){
    if (!raw) return raw;
    if (Array.isArray(raw)) return raw.map(translateWeekdayToken).join(', ');
    return String(raw).split(',').map(function(part){ return translateWeekdayToken(part.trim()); }).join(', ');
  }

  function statusText(key){
    var lang = uiLang();
    var map = {
      pending:{de:'⏳ Ausstehend',en:'⏳ Pending',it:'⏳ In attesa',fr:'⏳ En attente'},
      created:{de:'⏳ Ausstehend',en:'⏳ Pending',it:'⏳ In attesa',fr:'⏳ En attente'},
      paid:{de:'✅ Gekauft',en:'✅ Purchased',it:'✅ Acquistato',fr:'✅ Acheté'},
      redeemed:{de:'🎉 Eingelöst',en:'🎉 Redeemed',it:'🎉 Riscattato',fr:'🎉 Utilisé'},
      refund_requested:{de:'⏳ Rückerstattung angefordert',en:'⏳ Refund requested',it:'⏳ Rimborso richiesto',fr:'⏳ Remboursement demandé'},
      refunded:{de:'↩️ Rückerstattet',en:'↩️ Refunded',it:'↩️ Rimborsato',fr:'↩️ Remboursé'}
    };
    return (map[key] && map[key][lang]) || map[key] && map[key].de || '';
  }

  var _origBuildDealCardFinal = typeof buildDealCard === 'function' ? buildDealCard : null;
  if (_origBuildDealCardFinal) {
    buildDealCard = function(deal){
      var card = _origBuildDealCardFinal(deal);
      try {
        card.querySelectorAll('span, div').forEach(function(el){
          var txt = (el.textContent || '').trim();
          if (!txt) return;
          if (txt === '🌅 Morgen' || txt === '☀️ Mittag' || txt === '🌙 Abend' || txt === 'Morgen' || txt === 'Mittag' || txt === 'Abend') {
            if (/Morgen/i.test(txt)) el.textContent = timeSlotLabel('morning');
            else if (/Mittag/i.test(txt)) el.textContent = timeSlotLabel('midday');
            else if (/Abend/i.test(txt)) el.textContent = timeSlotLabel('evening');
          }
        });
      } catch(e) {}
      return card;
    };
  }

  var _origBuildOrderCardFinal = typeof buildOrderCard === 'function' ? buildOrderCard : null;
  if (_origBuildOrderCardFinal) {
    buildOrderCard = function(o){
      var card = _origBuildOrderCardFinal(o);
      try {
        var pill = card.querySelector('.status-pill');
        if (pill) pill.textContent = statusText(o.status);

        card.querySelectorAll('.voucher-box > div:first-child').forEach(function(label){
          label.textContent = shopT('gutscheinCode') || 'Voucher code:';
        });

        card.querySelectorAll('.voucher-box .share-btn, .voucher-box a').forEach(function(btn){
          var t = (btn.textContent || '').trim();
          if (/anzeigen|view|visualizza|afficher/i.test(t)) btn.textContent = '🎫 ' + (shopT('gutscheinAnzeigen') || 'View');
          else if (/link kopieren|copy link|copia link|copier le lien/i.test(t)) btn.textContent = '📋 ' + (shopT('linkKopieren') || 'Copy link');
          else if (/teilen|share|condividi|partager/i.test(t)) btn.textContent = '📱 ' + (shopT('shareBtn') || 'Share');
        });

        var refundInfo = Array.from(card.querySelectorAll('div')).find(function(el){
          var t = (el.textContent || '').trim();
          return /Rückerstattung angefordert|Refund requested|Rimborso richiesto|Remboursement demandé|Rückerstattet|Refunded|Rimborsato|Remboursé/.test(t);
        });
        if (refundInfo) {
          if (o.refund_status === 'requested') refundInfo.textContent = statusText('refund_requested');
          if (o.refund_status === 'completed') refundInfo.textContent = statusText('refunded');
        }

        var refundBtn = card.querySelector('.btn-refund');
        if (refundBtn) refundBtn.textContent = '💰 ' + (shopT('refundReq') || 'Request refund');

        var refundHint = card.querySelector('.refund-hint');
        if (refundHint && typeof o.hours_left !== 'undefined') {
          var lang = uiLang();
          var txt = {
            de: 'Noch ' + o.hours_left + 'h verbleibend',
            en: o.hours_left + 'h remaining',
            it: o.hours_left + 'h rimanenti',
            fr: o.hours_left + 'h restantes'
          };
          refundHint.textContent = txt[lang] || txt.de;
        }
      } catch(e) {}
      return card;
    };
  }

  var _origOpenDealDetailFinal = typeof openDealDetail === 'function' ? openDealDetail : null;
  if (_origOpenDealDetailFinal) {
    openDealDetail = function(deal){
      _origOpenDealDetailFinal(deal);
      try {
        var ddInfo = document.getElementById('ddInfo');
        if (ddInfo) {
          ddInfo.querySelectorAll('div').forEach(function(row){
            var spans = row.querySelectorAll('span');
            if (spans.length >= 2) {
              var label = (spans[0].textContent || '').trim().toLowerCase();
              if (/jours|wochentage|giorni|weekdays/.test(label)) {
                spans[1].textContent = localizeWeekdayList(spans[1].textContent || '');
              }
            }
          });
        }
        var shareWrap = document.getElementById('ddShare');
        if (shareWrap) {
          shareWrap.querySelectorAll('button').forEach(function(btn){
            var t = (btn.textContent || '').trim();
            if (/link kopieren|copy link|copia link|copier le lien/i.test(t)) btn.textContent = '📋 ' + (shopT('linkKopieren') || 'Copy link');
            if (/teilen|share|condividi|partager/i.test(t)) btn.textContent = '📱 ' + (shopT('shareBtn') || 'Share');
          });
        }
      } catch(e) {}
    };
  }

  var _origAddToCartFinal = typeof addToCart === 'function' ? addToCart : null;
  if (_origAddToCartFinal) {
    addToCart = function(deal){
      getCart();
      var existing = _cart.find(function(c) { return c.deal_id === deal.id; });
      if (existing) existing.quantity++;
      else _cart.push({ deal_id: deal.id, title: deal.title, bar_name: deal.bar_name, price: deal.deal_price, quantity: 1, image_url: deal.image_url || '' });
      saveCart();
      showToast('🛒 ' + deal.title + ' ' + (shopT('addedToCartSuffix') || 'zum Warenkorb hinzugefügt'));
      try { renderCartPanel(); } catch(e) {}
    };
  }

  function dealsCacheForLang(lang){ return 'barsclusive_deals_cache_' + lang; }
  async function fetchDealsFresh(lang, showErrorsWhenEmpty){
    var started = Date.now();
    try {
      var r = await fetch(BACKEND_URL + '?action=getActiveDeals&lang=' + encodeURIComponent(lang), { cache:'no-store' });
      if (!r.ok) throw new Error('network');
      var d = await r.json();
      if (!d.success) throw new Error(d.error || 'load');
      allDeals = d.deals || [];
      attachDistances();
      dealsCache = { data: allDeals, timestamp: started, lang: lang };
      try {
        localStorage.setItem(dealsCacheForLang(lang), JSON.stringify(dealsCache));
        localStorage.setItem('barsclusive_deals_cache', JSON.stringify(dealsCache));
      } catch(e) {}
      var ld = document.getElementById('dealsLoading'); if (ld) ld.style.display = 'none';
      var dl = document.getElementById('dealsList'); if (dl) dl.style.display = '';
      renderDeals();
      return true;
    } catch (e) {
      var ld2 = document.getElementById('dealsLoading'); if (ld2) ld2.style.display = 'none';
      var dl2 = document.getElementById('dealsList'); if (dl2) dl2.style.display = '';
      if (!allDeals.length && showErrorsWhenEmpty) {
        var list = document.getElementById('dealsList');
        if (list) {
          list.innerHTML = '<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:48px 18px;color:#888"><div style="font-size:38px;margin-bottom:10px">🍸</div><div style="font-size:18px;font-weight:700;margin-bottom:6px">' + escHtml(shopT('dealsLoadError') || 'Fehler beim Laden der Deals') + '</div><div style="font-size:14px">' + escHtml(shopT('networkReload') || 'Bitte neu laden') + '</div></div>';
        }
        showToast(shopT('networkReload') || 'Verbindungsfehler - bitte neu laden', true);
      }
      return false;
    }
  }

  loadDeals = async function(forceRefresh){
    forceRefresh = !!forceRefresh;
    var lang = uiLang();
    var now = Date.now();
    var freshInMemory = dealsCache.data && dealsCache.lang === lang && (now - Number(dealsCache.timestamp || 0) < CACHE_DURATION);
    if (freshInMemory && !forceRefresh) {
      allDeals = dealsCache.data;
      attachDistances();
      var ld = document.getElementById('dealsLoading'); if (ld) ld.style.display = 'none';
      var dl = document.getElementById('dealsList'); if (dl) dl.style.display = '';
      renderDeals();
      fetchDealsFresh(lang, false);
      return;
    }
    if (!forceRefresh) {
      try {
        var raw = localStorage.getItem(dealsCacheForLang(lang)) || localStorage.getItem('barsclusive_deals_cache');
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && parsed.data && parsed.data.length) {
            allDeals = parsed.data;
            dealsCache = { data: parsed.data, timestamp: parsed.timestamp || now, lang: parsed.lang || lang };
            attachDistances();
            var ld3 = document.getElementById('dealsLoading'); if (ld3) ld3.style.display = 'none';
            var dl3 = document.getElementById('dealsList'); if (dl3) dl3.style.display = '';
            renderDeals();
            fetchDealsFresh(lang, false);
            return;
          }
        }
      } catch(e) {}
    }
    await fetchDealsFresh(lang, true);
  };

  var _origSetShopLangFinal = typeof setShopLang === 'function' ? setShopLang : null;
  if (_origSetShopLangFinal) {
    setShopLang = function(lang){
      _origSetShopLangFinal(lang);
      try {
        renderDeals();
        if (document.getElementById('ordersView') && document.getElementById('ordersView').style.display === 'block') loadOrders();
        if (document.getElementById('favoritesView') && document.getElementById('favoritesView').style.display === 'block' && typeof renderFavorites === 'function') renderFavorites();
        if (typeof _detailDeal !== 'undefined' && _detailDeal && document.getElementById('dealDetailModal') && document.getElementById('dealDetailModal').classList.contains('active')) openDealDetail(_detailDeal);
      } catch(e) {}
    };
  }
})();


// ===== FINAL MERGE PATCH: sidebar, custom date, translated user labels, no auto-open cart =====
(function(){
  try {
    Object.assign(SHOP_TRANSLATIONS.de, {
      menuTitle:'Mehr entdecken', menuNote:'Alles Wichtige schnell erreichbar, ohne bis zum Seitenende zu scrollen.',
      customDateBtn:'📅 Eigenes Datum wählen', customDateLabel:'Eigenes Datum',
      myLocationBtn:'Nach Distanz sortieren', geoCurrentLocation:'Aktueller Standort',
      favoritesNav:'Favoriten', noAccountYet:'Noch kein Konto?',
      statusPending:'Ausstehend', statusBought:'Gekauft', statusRedeemed:'Eingelöst',
      timeSlotMorning:'🌅 Morgen', timeSlotMidday:'☀️ Mittag', timeSlotEvening:'🌙 Abend', weekdaysLabel:'Wochentage',
      buyBtn:'Deal kaufen'
    });
    Object.assign(SHOP_TRANSLATIONS.en, {
      menuTitle:'Explore more', menuNote:'Quick access to the important pages without endless scrolling.',
      customDateBtn:'📅 Choose your own date', customDateLabel:'Custom date',
      myLocationBtn:'Sort by distance', geoCurrentLocation:'Current location',
      favoritesNav:'Favorites', noAccountYet:'No account yet?',
      statusPending:'Pending', statusBought:'Purchased', statusRedeemed:'Redeemed',
      timeSlotMorning:'🌅 Morning', timeSlotMidday:'☀️ Midday', timeSlotEvening:'🌙 Evening', weekdaysLabel:'Weekdays',
      buyBtn:'Buy deal'
    });
    Object.assign(SHOP_TRANSLATIONS.it, {
      menuTitle:'Scopri di più', menuNote:'Tutto importante a portata di mano, senza scorrere fino in fondo.',
      customDateBtn:'📅 Scegli una data', customDateLabel:'Data personalizzata',
      myLocationBtn:'Ordina per distanza', geoCurrentLocation:'Posizione attuale',
      favoritesNav:'Preferiti', noAccountYet:'Non hai ancora un account?',
      statusPending:'In attesa', statusBought:'Acquistato', statusRedeemed:'Riscattato',
      timeSlotMorning:'🌅 Mattina', timeSlotMidday:'☀️ Pranzo', timeSlotEvening:'🌙 Sera', weekdaysLabel:'Giorni',
      buyBtn:'Acquista deal'
    });
    Object.assign(SHOP_TRANSLATIONS.fr, {
      menuTitle:'Découvrir plus', menuNote:'Toutes les pages importantes rapidement accessibles, sans devoir scroller jusqu’en bas.',
      customDateBtn:'📅 Choisir une date', customDateLabel:'Date personnalisée',
      myLocationBtn:'Trier par distance', geoCurrentLocation:'Position actuelle',
      favoritesNav:'Favoris', noAccountYet:'Pas encore de compte ?',
      statusPending:'En attente', statusBought:'Acheté', statusRedeemed:'Utilisé',
      timeSlotMorning:'🌅 Matin', timeSlotMidday:'☀️ Midi', timeSlotEvening:'🌙 Soir', weekdaysLabel:'Jours',
      buyBtn:'Acheter l’offre'
    });
  } catch(e) {}

  function updateCustomDateLabel(){
    var el = document.getElementById('customDateLabel');
    var input = document.getElementById('customDate');
    if (!el) return;
    if (input && input.value) {
      var dt = new Date(input.value + 'T00:00:00');
      if (!isNaN(dt.getTime())) {
        try {
          el.textContent = '📅 ' + dt.toLocaleDateString(document.documentElement.lang || 'de-CH', { day:'2-digit', month:'2-digit', year:'numeric' });
          return;
        } catch(e) {}
      }
    }
    el.textContent = st('customDateBtn') || '📅 Eigenes Datum wählen';
  }
  window.updateCustomDateLabel = updateCustomDateLabel;

  function updateShopUserUi(){
    var s = sessionGet();
    var userBtn = document.getElementById('userBtn');
    var btnOrders = document.getElementById('btnOrders');
    var btnFavorites = document.getElementById('btnFavorites');
    var ddLogout = document.getElementById('dropdownLogout');
    var ddPw = document.getElementById('dropdownChangePw');
    if (userBtn) userBtn.textContent = s ? ('👤 ' + escHtml(s.name || '')) : ('👤 ' + st('loginBtn'));
    if (btnOrders) btnOrders.textContent = '📦 ' + st('orders');
    if (btnFavorites) btnFavorites.textContent = '❤️ ' + st('favoritesNav');
    if (ddLogout) ddLogout.textContent = st('logoutBtn');
    if (ddPw) ddPw.textContent = '🔑 ' + st('changePw');
    var noAcc = document.getElementById('loginNoAccountText'); if (noAcc) noAcc.textContent = st('noAccountYet') || noAcc.textContent;
    var regLink = document.getElementById('linkToRegister'); if (regLink) regLink.textContent = st('registrieren') || regLink.textContent;
  }

  var _origApplyShopTranslations = applyShopTranslations;
  applyShopTranslations = function(){
    _origApplyShopTranslations();
    updateShopUserUi();
    updateCustomDateLabel();
    var input = document.getElementById('locationInput'); if (input) input.placeholder = st('searchPLZ');
    var search = document.getElementById('shopSearch'); if (search) search.placeholder = st('searchBarDeal');
  };

  var _origSessionSet = sessionSet;
  sessionSet = function(token, name, email, role){ _origSessionSet(token,name,email,role); updateShopUserUi(); };
  var _origSessionClear = sessionClear;
  sessionClear = function(){ _origSessionClear(); updateShopUserUi(); };

  var _origSetCustomDate = setCustomDate;
  setCustomDate = function(val){ _origSetCustomDate(val); updateCustomDateLabel(); };

  requestGeoPermission = function() {
    if (!navigator.geolocation) { showToast(shopT('locationUnavailable') || 'Standort nicht verfügbar', true); dismissGeoBanner(); return; }
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        _userLat = pos.coords.latitude;
        _userLng = pos.coords.longitude;
        _locationState = { label: shopT('geoCurrentLocation') || 'Aktueller Standort', lat: _userLat, lng: _userLng, source: 'geo', textFilter: '' };
        saveLocationState();
        updateLocationUi();
        dismissGeoBanner();
        showToast(shopT('dealsSortedByDistance') || '📍 Deals werden nach Nähe sortiert');
        sortDealsByDistance();
      },
      function() { dismissGeoBanner(); showToast(shopT('locationUnavailable') || 'Standort nicht verfügbar', true); },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  function openShopDrawer(){
    var drawer = document.getElementById('shopDrawer');
    var overlay = document.getElementById('shopDrawerOverlay');
    if (drawer) drawer.classList.add('active');
    if (overlay) overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
  function closeShopDrawer(){
    var drawer = document.getElementById('shopDrawer');
    var overlay = document.getElementById('shopDrawerOverlay');
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.style.display = 'none';
    var cartPanel = document.getElementById('cartPanel');
    if (!(cartPanel && cartPanel.classList.contains('active'))) document.body.style.overflow = '';
  }
  window.openShopDrawer = openShopDrawer;
  window.closeShopDrawer = closeShopDrawer;

  addToCart = function(deal) {
    getCart();
    var existing = _cart.find(function(c) { return c.deal_id === deal.id; });
    if (existing) existing.quantity++;
    else _cart.push({ deal_id: deal.id, title: deal.title, bar_name: deal.bar_name, price: deal.deal_price, quantity: 1, image_url: deal.image_url || '' });
    saveCart();
    showToast('🛒 ' + deal.title + ' ' + (shopT('addedToCartSuffix') || 'zum Warenkorb hinzugefügt'));
  };

  document.addEventListener('DOMContentLoaded', function(){
    var menuBtn = document.getElementById('shopMenuBtn'); if (menuBtn) menuBtn.addEventListener('click', openShopDrawer);
    var drawerClose = document.getElementById('shopDrawerClose'); if (drawerClose) drawerClose.addEventListener('click', closeShopDrawer);
    var drawerOverlay = document.getElementById('shopDrawerOverlay'); if (drawerOverlay) drawerOverlay.addEventListener('click', closeShopDrawer);
    var drawerDeals = document.getElementById('drawerDealsBtn'); if (drawerDeals) drawerDeals.addEventListener('click', function(){ closeShopDrawer(); showView('deals'); });
    var drawerFav = document.getElementById('drawerFavoritesBtn'); if (drawerFav) drawerFav.addEventListener('click', function(){ closeShopDrawer(); showView('favorites'); });
    var drawerOrders = document.getElementById('drawerOrdersBtn'); if (drawerOrders) drawerOrders.addEventListener('click', function(){ closeShopDrawer(); showView('orders'); });
    var customDate = document.getElementById('customDate'); if (customDate) customDate.addEventListener('change', updateCustomDateLabel);
    updateCustomDateLabel();
    updateShopUserUi();
  });
})();


// =============================================
// HOTFIX 2026-03-17 — stable login/cart/buy + immediate i18n + home triggers
// =============================================
(function(){
  var HOTFIX_SESSION_TTL = 90 * 60 * 1000;

  function hotfixLang(){
    return String(_shopLang || shopLang || localStorage.getItem('barsclusive_lang') || 'de').toLowerCase();
  }

  ['de','en','it','fr'].forEach(function(lang){
    if (!SHOP_TRANSLATIONS[lang]) SHOP_TRANSLATIONS[lang] = {};
  });

  Object.assign(SHOP_TRANSLATIONS.de, {
    heroBenefitQuick:'⚡ Schnell sichern',
    heroBenefitLocal:'🍸 Bars in deiner Nähe entdecken',
    heroBenefitMobile:'🎟️ Digital einlösbar',
    heroUtility:'Heute kaufen, später entspannt einlösen.',
    payNowBtn:'💳 Jetzt bezahlen',
    buyDealTitle:'Deal kaufen',
    favoritesHeading:'❤️ Meine Favoriten',
    favoritesSubline:'Behalte starke Deals im Blick und kaufe später in Ruhe.',
    ordersHeading:'📦 Meine Bestellungen',
    ordersSubline:'Alle Gutscheine, Statusmeldungen und Rückerstattungen an einem Ort.',
    shareCopy:'Link kopieren'
  });
  Object.assign(SHOP_TRANSLATIONS.en, {
    heroBenefitQuick:'⚡ Secure in seconds',
    heroBenefitLocal:'🍸 Discover bars nearby',
    heroBenefitMobile:'🎟️ Easy digital redemption',
    heroUtility:'Buy now, redeem later without stress.',
    payNowBtn:'💳 Pay now',
    buyDealTitle:'Buy deal',
    favoritesHeading:'❤️ My favorites',
    favoritesSubline:'Keep strong deals in view and buy later when it suits you.',
    ordersHeading:'📦 My orders',
    ordersSubline:'All vouchers, status updates and refunds in one place.',
    shareCopy:'Copy link'
  });
  Object.assign(SHOP_TRANSLATIONS.it, {
    heroBenefitQuick:'⚡ Acquista in pochi secondi',
    heroBenefitLocal:'🍸 Scopri bar vicini',
    heroBenefitMobile:'🎟️ Riscatto digitale semplice',
    heroUtility:'Acquista oggi, usa il voucher più tardi con calma.',
    payNowBtn:'💳 Paga ora',
    buyDealTitle:'Acquista deal',
    favoritesHeading:'❤️ I miei preferiti',
    favoritesSubline:'Tieni d’occhio i deal migliori e acquistali con calma più tardi.',
    ordersHeading:'📦 I miei ordini',
    ordersSubline:'Tutti i voucher, gli aggiornamenti di stato e i rimborsi in un unico posto.',
    shareCopy:'Copia link'
  });
  Object.assign(SHOP_TRANSLATIONS.fr, {
    heroBenefitQuick:'⚡ Réserver en quelques secondes',
    heroBenefitLocal:'🍸 Découvrir des bars proches',
    heroBenefitMobile:'🎟️ Utilisation numérique facile',
    heroUtility:'Acheter aujourd’hui, utiliser plus tard en toute tranquillité.',
    payNowBtn:'💳 Payer maintenant',
    buyDealTitle:'Acheter le deal',
    favoritesHeading:'❤️ Mes favoris',
    favoritesSubline:'Garde les meilleures offres sous les yeux et achète plus tard tranquillement.',
    ordersHeading:'📦 Mes commandes',
    ordersSubline:'Tous les vouchers, statuts et remboursements au même endroit.',
    shareCopy:'Copier le lien'
  });

  function hotfixUpdateNavButtons(){
    var dealsBtn = document.getElementById('btnDeals');
    if (dealsBtn) dealsBtn.setAttribute('type', 'button');
    var cartBtn = document.getElementById('cartOpenBtn');
    if (cartBtn) cartBtn.setAttribute('type', 'button');
    var userBtn = document.getElementById('userBtn');
    if (userBtn) userBtn.setAttribute('type', 'button');
  }

  function hotfixNormalizeCartItems(items){
    var list = [];
    if (Array.isArray(items)) list = items;
    else if (items && Array.isArray(items.items)) list = items.items;
    else list = [];
    return list.map(function(item){
      var dealId = String(item && (item.deal_id || item.dealId || item.id || '') || '');
      var quantity = Math.max(1, Number(item && (item.quantity || item.qty || item.count || 1) || 1) || 1);
      var price = Number(item && (item.price || item.deal_price || item.amount || 0) || 0);
      var fallbackDeal = allDeals.find(function(d){ return String(d.id) === dealId; }) || null;
      return {
        deal_id: dealId,
        title: String(item && (item.title || item.deal_title || item.name) || (fallbackDeal ? fallbackDeal.title : '') || ''),
        bar_name: String(item && (item.bar_name || item.barName || item.bar) || (fallbackDeal ? fallbackDeal.bar_name : '') || ''),
        price: isFinite(price) ? price : Number((fallbackDeal && fallbackDeal.deal_price) || 0),
        quantity: quantity,
        image_url: String(item && (item.image_url || item.image || item.img) || (fallbackDeal ? fallbackDeal.image_url : '') || '')
      };
    }).filter(function(item){
      return item.deal_id || item.title;
    });
  }

  getCart = function(){
    try {
      var raw = localStorage.getItem('barsclusive_cart') || '[]';
      _cart = hotfixNormalizeCartItems(JSON.parse(raw));
    } catch(e) {
      _cart = [];
    }
    try { localStorage.setItem('barsclusive_cart', JSON.stringify(_cart)); } catch(e) {}
    return _cart;
  };

  saveCart = function(){
    try { localStorage.setItem('barsclusive_cart', JSON.stringify(_cart || [])); } catch(e) {}
    updateCartBadge();
  };

  sessionSet = function(token, name, email, role, extra){
    var extras = {};
    if (typeof extra === 'string') extras.lang = extra;
    else if (extra && typeof extra === 'object') extras = extra;
    _session = {
      token: token,
      name: name,
      email: email,
      role: role,
      expiresAt: Date.now() + HOTFIX_SESSION_TTL,
      userId: extras.userId || '',
      lang: extras.lang || hotfixLang()
    };
    try { localStorage.setItem('barsclusive_customer_session', JSON.stringify(_session)); } catch(e) {}
    if (typeof updateShopUserUi === 'function') updateShopUserUi();
    else {
      var userBtn = document.getElementById('userBtn');
      if (userBtn) userBtn.textContent = '👤 ' + String(name || '');
    }
    var ordersBtn = document.getElementById('btnOrders');
    if (ordersBtn) ordersBtn.style.display = 'block';
    var favBtn = document.getElementById('btnFavorites');
    if (favBtn) favBtn.style.display = 'block';
    if (extras.lang) setShopLang(extras.lang);
  };

  sessionGet = function(){
    if (!_session) {
      try {
        var raw = localStorage.getItem('barsclusive_customer_session');
        if (raw) _session = JSON.parse(raw);
      } catch(e) {}
    }
    if (!_session || !Number(_session.expiresAt) || Date.now() > Number(_session.expiresAt)) {
      sessionClear();
      return null;
    }
    return _session;
  };

  sessionClear = function(){
    _session = null;
    try { localStorage.removeItem('barsclusive_customer_session'); } catch(e) {}
    var userBtn = document.getElementById('userBtn');
    if (userBtn) userBtn.textContent = '👤 ' + (shopT('loginBtn') || 'Login');
    var ordersBtn = document.getElementById('btnOrders');
    if (ordersBtn) ordersBtn.style.display = 'none';
    var favBtn = document.getElementById('btnFavorites');
    if (favBtn) favBtn.style.display = 'none';
    var dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('show');
    _favorites = [];
    if (typeof updateShopUserUi === 'function') updateShopUserUi();
  };

  function hotfixShowDealsLoading(){
    var loading = document.getElementById('dealsLoading');
    var list = document.getElementById('dealsList');
    if (loading) loading.style.display = '';
    if (list) list.style.display = 'none';
  }

  function hotfixHideDealsLoading(){
    var loading = document.getElementById('dealsLoading');
    var list = document.getElementById('dealsList');
    if (loading) loading.style.display = 'none';
    if (list) list.style.display = '';
  }

  loadDeals = async function(forceRefresh){
    forceRefresh = !!forceRefresh;
    var lang = hotfixLang();
    var now = Date.now();
    var cacheKey = 'barsclusive_deals_cache_' + lang;
    if (!forceRefresh) {
      try {
        var raw = localStorage.getItem(cacheKey);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && parsed.lang === lang && Array.isArray(parsed.data) && (now - Number(parsed.timestamp || 0) < 30 * 60 * 1000)) {
            dealsCache = parsed;
            allDeals = parsed.data;
            attachDistances();
            hotfixHideDealsLoading();
            renderDeals();
            return;
          }
        }
      } catch(e) {}
    }
    hotfixShowDealsLoading();
    try {
      var response = await fetch(BACKEND_URL + '?action=getActiveDeals&lang=' + encodeURIComponent(lang), { cache: 'no-store' });
      if (!response.ok) throw new Error('network');
      var data = await response.json();
      if (!data.success) throw new Error(data.error || 'load');
      allDeals = Array.isArray(data.deals) ? data.deals : [];
      attachDistances();
      dealsCache = { data: allDeals, timestamp: now, lang: lang };
      try {
        localStorage.setItem(cacheKey, JSON.stringify(dealsCache));
        localStorage.setItem('barsclusive_deals_cache', JSON.stringify(dealsCache));
      } catch(e) {}
      hotfixHideDealsLoading();
      renderDeals();
    } catch (e) {
      hotfixHideDealsLoading();
      showToast(shopT('networkReload') || 'Verbindungsfehler - bitte neu laden', true);
      if (!allDeals.length) renderDeals();
    }
  };

  var hotfixApplyShopTranslationsBase = typeof applyShopTranslations === 'function' ? applyShopTranslations : function(){};
  applyShopTranslations = function(){
    hotfixApplyShopTranslationsBase();
    var heroUtility = document.getElementById('heroUtilityLine');
    if (heroUtility) heroUtility.textContent = shopT('heroUtility') || heroUtility.textContent;
    var buyModalTitle = document.getElementById('buyModalTitle');
    if (buyModalTitle) buyModalTitle.textContent = shopT('buyDealTitle') || buyModalTitle.textContent;
    var buySubmit = document.getElementById('btnBuySubmit');
    if (buySubmit) buySubmit.textContent = shopT('payNowBtn') || buySubmit.textContent;
    var favHeading = document.getElementById('favoritesHeading');
    if (favHeading) favHeading.textContent = shopT('favoritesHeading') || favHeading.textContent;
    var favSub = document.getElementById('favoritesSubline');
    if (favSub) favSub.textContent = shopT('favoritesSubline') || favSub.textContent;
    var ordersHeading = document.getElementById('ordersHeading');
    if (ordersHeading) ordersHeading.textContent = shopT('ordersHeading') || ordersHeading.textContent;
    var ordersSub = document.getElementById('ordersSubline');
    if (ordersSub) ordersSub.textContent = shopT('ordersSubline') || ordersSub.textContent;
    hotfixUpdateNavButtons();
    try { renderCartPanel(); } catch(e) {}
  };

  setShopLang = function(lang){
    lang = String(lang || 'de').toLowerCase();
    if (!SHOP_TRANSLATIONS[lang]) lang = 'de';
    var previous = hotfixLang();
    _shopLang = lang;
    shopLang = lang;
    try { localStorage.setItem('barsclusive_lang', lang); } catch(e) {}
    document.documentElement.lang = lang;
    document.querySelectorAll('.shop-lang-btn').forEach(function(btn){
      btn.classList.remove('active');
      btn.style.borderColor = '#333';
      btn.style.color = '#888';
    });
    var activeBtn = document.getElementById('shopLang' + lang.toUpperCase());
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.style.borderColor = '#FF3366';
      activeBtn.style.color = '#fff';
    }
    applyShopTranslations();
    if (previous !== lang) {
      closeDealDetail();
      hotfixShowDealsLoading();
      loadDeals(true);
    } else {
      renderDeals();
    }
  };

  var hotfixBuildDealCardBase = typeof buildDealCard === 'function' ? buildDealCard : null;
  if (hotfixBuildDealCardBase) {
    buildDealCard = function(deal){
      var card = hotfixBuildDealCardBase(deal);
      if (card) card.dataset.dealId = String(deal.id || '');
      var buyBtn = card ? card.querySelector('.btn-buy') : null;
      if (buyBtn) {
        buyBtn.dataset.dealId = String(deal.id || '');
        buyBtn.setAttribute('type', 'button');
      }
      var cartBtn = card ? card.querySelector('.add-cart-btn') : null;
      if (cartBtn) {
        cartBtn.dataset.dealId = String(deal.id || '');
        cartBtn.setAttribute('type', 'button');
      }
      return card;
    };
  }

  openCartPanel = function(){
    var panel = document.getElementById('cartPanel');
    var overlay = document.getElementById('cartOverlay');
    if (!panel) return;
    try { renderCartPanel(); } catch(e) {}
    panel.classList.add('active');
    if (overlay) overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };

  closeCartPanel = function(){
    var panel = document.getElementById('cartPanel');
    var overlay = document.getElementById('cartOverlay');
    if (panel) panel.classList.remove('active');
    if (overlay) overlay.style.display = 'none';
    var drawer = document.getElementById('shopDrawer');
    if (!(drawer && drawer.classList.contains('active'))) document.body.style.overflow = '';
  };

  addToCart = function(deal){
    if (!deal) return;
    getCart();
    var existing = _cart.find(function(item){ return String(item.deal_id) === String(deal.id); });
    if (existing) existing.quantity += 1;
    else _cart.push({
      deal_id: String(deal.id),
      title: deal.title,
      bar_name: deal.bar_name,
      price: Number(deal.deal_price || 0),
      quantity: 1,
      image_url: deal.image_url || ''
    });
    saveCart();
    renderCartPanel();
    showToast('🛒 ' + deal.title + ' ' + (shopT('addedToCartSuffix') || 'zum Warenkorb hinzugefügt'));
  };

  function hotfixGoHome(){
    try { closeShopDrawer(); } catch(e) {}
    try { toggleMapView(false); } catch(e) {}
    showView('deals');
    var list = document.getElementById('dealsList');
    if (list && !list.children.length) renderDeals();
  }

  function hotfixFindDealById(id){
    return allDeals.find(function(deal){ return String(deal.id) === String(id); }) || null;
  }

  document.addEventListener('click', function(event){
    var buyBtn = event.target.closest('.btn-buy[data-deal-id]');
    if (buyBtn && buyBtn.id !== 'ddBuyBtn') {
      var buyDeal = hotfixFindDealById(buyBtn.dataset.dealId);
      if (buyDeal) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openBuyModal(buyDeal);
        return;
      }
    }
    var addBtn = event.target.closest('.add-cart-btn[data-deal-id]');
    if (addBtn) {
      var cartDeal = hotfixFindDealById(addBtn.dataset.dealId);
      if (cartDeal) {
        event.preventDefault();
        event.stopImmediatePropagation();
        addToCart(cartDeal);
        return;
      }
    }
  }, true);

  function hotfixBindStaticButtons(){
    var userBtn = document.getElementById('userBtn');
    if (userBtn) {
      userBtn.addEventListener('click', function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        onUserButtonClick();
      }, true);
    }

    var cartBtn = document.getElementById('cartOpenBtn');
    if (cartBtn) {
      cartBtn.addEventListener('click', function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleCartPanel();
      }, true);
    }

    var dealsBtn = document.getElementById('btnDeals');
    if (dealsBtn) {
      dealsBtn.addEventListener('click', function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        hotfixGoHome();
      }, true);
    }

    var logoBtn = document.getElementById('logoHomeBtn');
    if (logoBtn) {
      logoBtn.addEventListener('click', function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        hotfixGoHome();
      }, true);
      logoBtn.addEventListener('keydown', function(event){
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          hotfixGoHome();
        }
      });
    }
  }

  var hotfixDoLoginBase = typeof doLogin === 'function' ? doLogin : null;
  if (hotfixDoLoginBase) {
    doLogin = async function(){
      var result = await hotfixDoLoginBase.apply(this, arguments);
      var loginModal = document.getElementById('loginModal');
      if (loginModal && sessionGet()) loginModal.classList.remove('active');
      return result;
    };
  }

  var hotfixDoRegisterBase = typeof doRegister === 'function' ? doRegister : null;
  if (hotfixDoRegisterBase) {
    doRegister = async function(){
      var result = await hotfixDoRegisterBase.apply(this, arguments);
      var registerModal = document.getElementById('registerModal');
      if (registerModal && sessionGet()) registerModal.classList.remove('active');
      return result;
    };
  }

  document.addEventListener('DOMContentLoaded', function(){
    hotfixUpdateNavButtons();
    hotfixBindStaticButtons();
    getCart();
    updateCartBadge();
    try { renderCartPanel(); } catch(e) {}
    setShopLang(localStorage.getItem('barsclusive_lang') || hotfixLang() || 'de');
  });
})();


// ===== ENTRY FOCUS PATCH: cleaner shop intro within same page =====
(function(){
  try {
    ['de','en','it','fr'].forEach(function(lang){
      if (!SHOP_TRANSLATIONS[lang]) SHOP_TRANSLATIONS[lang] = {};
    });
    Object.assign(SHOP_TRANSLATIONS.de, {
      entryBadge:'BarSclusive Shop',
      discoverDeals:'🍸 Deals entdecken',
      discoverByCity:'📍 Stadt wählen',
      heroSub:'Exklusive Angebote für Frühstück, Lunch, Aperitivo und Events'
    });
    Object.assign(SHOP_TRANSLATIONS.en, {
      entryBadge:'BarSclusive Shop',
      discoverDeals:'🍸 Explore deals',
      discoverByCity:'📍 Choose city',
      heroSub:'Exclusive offers for breakfast, lunch, aperitivo and events'
    });
    Object.assign(SHOP_TRANSLATIONS.it, {
      entryBadge:'BarSclusive Shop',
      discoverDeals:'🍸 Scopri i deal',
      discoverByCity:'📍 Scegli la città',
      heroSub:'Offerte esclusive per colazione, pranzo, aperitivo ed eventi'
    });
    Object.assign(SHOP_TRANSLATIONS.fr, {
      entryBadge:'BarSclusive Shop',
      discoverDeals:'🍸 Découvrir les deals',
      discoverByCity:'📍 Choisir la ville',
      heroSub:'Offres exclusives pour le petit-déjeuner, le lunch, l’apéritif et les événements'
    });
  } catch(e) {}

  function scrollShopFocus(){
    var target = document.getElementById('shopFocusArea') || document.getElementById('shopViewToggle') || document.querySelector('.filter-wrap');
    if (!target) return;
    var top = Math.max((target.getBoundingClientRect().top + window.scrollY) - 88, 0);
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  document.addEventListener('DOMContentLoaded', function(){
    ['btnDiscoverDeals','btnExploreCity'].forEach(function(id){
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', function(ev){
        ev.preventDefault();
        scrollShopFocus();
      });
    });
  });
})();


(function(){
  try {
    Object.assign(SHOP_TRANSLATIONS.de, { headerLogin:'Einloggen', headerRegister:'Registrieren', discoverDeals:'🍸 Jetzt Deals entdecken' });
    Object.assign(SHOP_TRANSLATIONS.en, { headerLogin:'Log in', headerRegister:'Register', discoverDeals:'🍸 Discover deals now' });
    Object.assign(SHOP_TRANSLATIONS.it, { headerLogin:'Accedi', headerRegister:'Registrati', discoverDeals:'🍸 Scopri i deal ora' });
    Object.assign(SHOP_TRANSLATIONS.fr, { headerLogin:'Connexion', headerRegister:'Inscription', discoverDeals:'🍸 Découvrir les deals' });
  } catch(e) {}

  function openShopHeaderAuth(target){
    if (target === 'register') {
      if (typeof openModal === 'function') openModal('registerModal');
      if (typeof closeModal === 'function') closeModal('loginModal');
    } else {
      if (typeof openModal === 'function') openModal('loginModal');
      if (typeof closeModal === 'function') closeModal('registerModal');
    }
  }

  function syncShopEntryHeader(){
    var logged = !!(typeof sessionGet === 'function' && sessionGet());
    document.body.classList.toggle('shop-user-logged-in', logged);
    document.body.classList.toggle('shop-user-logged-out', !logged);
    var userBtn = document.getElementById('userBtn');
    if (userBtn && !logged && typeof shopT === 'function') userBtn.textContent = '👤 ' + (shopT('loginBtn') || 'Login / Registrieren');
  }

  if (typeof updateShopUserUi === 'function') {
    var _prevUpdateShopUserUi = updateShopUserUi;
    updateShopUserUi = function(){
      _prevUpdateShopUserUi();
      syncShopEntryHeader();
    };
  }

  document.addEventListener('DOMContentLoaded', function(){
    ['shopHeaderLoginBtn','shopHeaderRegisterBtn'].forEach(function(id){
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', function(ev){
        ev.preventDefault();
        openShopHeaderAuth(this.getAttribute('data-shop-auth-target') || 'login');
      });
    });
    syncShopEntryHeader();
  });
})();


// ===== ENTRY CONTENT COPY PATCH =====
(function(){
  ['de','en','it','fr'].forEach(function(lang){ if (!SHOP_TRANSLATIONS[lang]) SHOP_TRANSLATIONS[lang] = {}; });
  Object.assign(SHOP_TRANSLATIONS.de,{
    entryBadge:'BarSclusive Shop',
    heroTitle:'Bar-Deals schneller finden und spontan besser ausgehen',
    heroSub:'Du musst nicht mehr selber recherchieren, wo in deiner Umgebung etwas läuft. Hier findest du auf einen Blick am gewünschten Tag, zur gewünschten Zeit und in der passenden Kategorie genau das, was du suchst.',
    introBenefitNearbyTitle:'Exklusive Deals in deiner Nähe',
    introBenefitNearbySub:'Lokale Bars einfach entdecken und passende Angebote schneller finden.',
    introBenefitMailTitle:'Sofort per E-Mail erhalten',
    introBenefitMailSub:'Nach dem Kauf ist dein Gutschein direkt digital verfügbar und bereit für später.',
    introBenefitRefundTitle:'48 Stunden Rückerstattung',
    introBenefitRefundSub:'Mehr Flexibilität, falls sich deine Pläne kurzfristig ändern.',
    introBenefitSmartTitle:'Spontan ausgehen, clever sparen',
    introBenefitSmartSub:'Weniger suchen, besser auswählen und den Abend entspannter planen.',
    heroUtility:'Heute kaufen, später entspannt einlösen.',
    discoverDeals:'🍸 Jetzt Deals entdecken',
    introLearnMore:"Weitere Details unter So funktioniert's",
    headerLogin:'Einloggen',
    headerRegister:'Registrieren'
  });
  Object.assign(SHOP_TRANSLATIONS.en,{
    entryBadge:'BarSclusive Shop',
    heroTitle:'Find bar deals faster and go out more spontaneously',
    heroSub:'No more endless research to see what is happening nearby. Find the right option for your preferred day, time and category at a glance.',
    introBenefitNearbyTitle:'Exclusive deals near you',
    introBenefitNearbySub:'Discover local bars more easily and find fitting offers faster.',
    introBenefitMailTitle:'Delivered instantly by email',
    introBenefitMailSub:'After purchase, your voucher is available digitally right away and ready for later.',
    introBenefitRefundTitle:'48-hour refund',
    introBenefitRefundSub:'More flexibility if your plans change at short notice.',
    introBenefitSmartTitle:'Go out spontaneously, save smart',
    introBenefitSmartSub:'Less searching, better choices and a smoother evening plan.',
    heroUtility:'Buy today, redeem later without stress.',
    discoverDeals:'🍸 Discover deals now',
    introLearnMore:"More details under How it works",
    headerLogin:'Log in',
    headerRegister:'Register'
  });
  Object.assign(SHOP_TRANSLATIONS.it,{
    entryBadge:'BarSclusive Shop',
    heroTitle:'Trova i deal bar più in fretta ed esci meglio, anche all ultimo momento',
    heroSub:'Non devi più cercare da solo cosa succede vicino a te. Qui trovi a colpo d occhio quello che cerchi per giorno, orario e categoria.',
    introBenefitNearbyTitle:'Deal esclusivi vicino a te',
    introBenefitNearbySub:'Scopri più facilmente i bar locali e trova più in fretta le offerte giuste.',
    introBenefitMailTitle:'Ricevi tutto subito via email',
    introBenefitMailSub:'Dopo l acquisto, il voucher è subito disponibile in digitale e pronto per dopo.',
    introBenefitRefundTitle:'Rimborso entro 48 ore',
    introBenefitRefundSub:'Più flessibilità se i tuoi piani cambiano all ultimo momento.',
    introBenefitSmartTitle:'Esci all improvviso, risparmia con intelligenza',
    introBenefitSmartSub:'Meno ricerca, scelte migliori e una serata più facile da organizzare.',
    heroUtility:'Acquista oggi, usa il voucher più tardi con calma.',
    discoverDeals:'🍸 Scopri i deal ora',
    introLearnMore:'Più dettagli in Come funziona',
    headerLogin:'Accedi',
    headerRegister:'Registrati'
  });
  Object.assign(SHOP_TRANSLATIONS.fr,{
    entryBadge:'BarSclusive Shop',
    heroTitle:'Trouvez plus vite les deals bars et sortez plus librement',
    heroSub:'Plus besoin de chercher vous-même ce qui se passe près de chez vous. Ici, vous trouvez d un coup d oeil ce qui vous convient selon le jour, l heure et la catégorie.',
    introBenefitNearbyTitle:'Deals exclusifs près de vous',
    introBenefitNearbySub:'Découvrez plus facilement les bars locaux et trouvez plus vite les bonnes offres.',
    introBenefitMailTitle:'Reçu tout de suite par email',
    introBenefitMailSub:'Après l achat, votre voucher est disponible immédiatement en version numérique.',
    introBenefitRefundTitle:'Remboursement sous 48 heures',
    introBenefitRefundSub:'Plus de flexibilité si vos plans changent au dernier moment.',
    introBenefitSmartTitle:'Sortir spontanément, économiser intelligemment',
    introBenefitSmartSub:'Moins de recherche, de meilleurs choix et une soirée plus simple à organiser.',
    heroUtility:'Achetez aujourd hui, utilisez plus tard en toute tranquillité.',
    discoverDeals:'🍸 Découvrir les deals',
    introLearnMore:'Plus de détails dans Comment ça marche',
    headerLogin:'Connexion',
    headerRegister:'Inscription'
  });
})();
