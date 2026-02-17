// =============================================
// CONFIGURATION
// =============================================
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbztRaubL2hd-Z9yE2M-_Pc_BBn9u5p0xOalAZyMm13uc2wNN1WMZ2gZKYos87otUCN-gw/exec';


// ── SESSION (in-memory) ──────────────────────────────────────────────────
let _session = null; // { token, barId, barName, expiresAt }

function sessionSet(token, barId, barName) {
  _session = { token, barId, barName, expiresAt: Date.now() + 90 * 60 * 1000 };
  document.getElementById('btnLogout').style.display = 'block';
  const el = document.getElementById('barNameDisplay');
  if (el) el.textContent = barName;
}

function sessionGet() {
  if (!_session || Date.now() > _session.expiresAt) { _session = null; return null; }
  return _session;
}

function sessionClear() {
  _session = null;
  document.getElementById('btnLogout').style.display = 'none';
}

// ── XSS ESCAPE ──────────────────────────────────────────────────────────
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// ── AUTH ─────────────────────────────────────────────────────────────────
async function doBarLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  const err   = document.getElementById('loginErr');

  err.textContent = '';
  if (!email || !pass) { err.textContent = 'Bitte alle Felder ausfüllen.'; return; }

  try {
    const r = await api({ action: 'barLogin', email, password: pass });
    if (r.success) {
      sessionSet(r.token, r.bar.id, r.bar.name);
      document.getElementById('loginPassword').value = '';
      showAuthScreen(false);
      loadBarStats();
    } else {
      err.textContent = r.error || 'Ungültige Zugangsdaten.';
      document.getElementById('loginPassword').value = '';
    }
  } catch (e) { err.textContent = 'Verbindungsfehler.'; }
}

async function doBarRegister() {
  const name    = document.getElementById('regBarName').value.trim();
  const city    = document.getElementById('regCity').value.trim();
  const address = document.getElementById('regAddress').value.trim();
  const phone   = document.getElementById('regPhone').value.trim();
  const email   = document.getElementById('regBarEmail').value.trim();
  const pass    = document.getElementById('regBarPass').value;
  const consent = document.getElementById('regConsent').checked;
  const err     = document.getElementById('regErr');

  err.textContent = '';
  if (!name || !city || !email || !pass) { err.textContent = 'Pflichtfelder ausfüllen.'; return; }
  if (pass.length < 8)                   { err.textContent = 'Passwort mind. 8 Zeichen.'; return; }
  if (!consent)                           { err.textContent = 'Datenschutz akzeptieren.'; return; }

  try {
    const r = await api({ action: 'barRegister', name, city, address, phone, email, password: pass });
    if (r.success) {
      showToast('✅ Registrierung erfolgreich! Wir melden uns zur Freischaltung.');
      document.getElementById('regBarPass').value = '';
    } else {
      err.textContent = r.error || 'Fehler bei der Registrierung.';
    }
  } catch (e) { err.textContent = 'Verbindungsfehler.'; }
}

async function doLogout() {
  const s = sessionGet();
  if (s) {
    try { await api({ action: 'logout', token: s.token }); } catch (e) {}
  }
  sessionClear();
  showAuthScreen(true);
}

// ── DASHBOARD ────────────────────────────────────────────────────────────
function showAuthScreen(show) {
  document.getElementById('loginScreen').style.display   = show ? 'block' : 'none';
  document.getElementById('barDashboard').style.display  = show ? 'none'  : 'block';
}

async function loadBarStats() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }

  try {
    const r = await api({ action: 'getBarStats', token: s.token, bar_id: s.barId });
    if (!r.success) return;

    const grid = document.getElementById('statsGrid');
    grid.innerHTML = '';
    const items = [
      ['Deals verkauft', r.total_sold],
      ['Einnahmen', Number(r.total_earned).toFixed(2) + ' CHF'],
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
  } catch (e) {}
}

async function loadMyDeals() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }

  try {
    const r = await api({ action: 'getBarDeals', token: s.token, bar_id: s.barId });
    if (!r.success) { showToast(r.error || 'Fehler', true); return; }
    renderMyDeals(r.deals);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

function renderMyDeals(deals) {
  const el = document.getElementById('dealList');
  el.innerHTML = '';

  if (!deals.length) {
    const div = document.createElement('div');
    div.className = 'empty';
    div.textContent = 'Noch keine Deals. Erstelle deinen ersten Deal!';
    el.appendChild(div);
    return;
  }

  deals.forEach(d => {
    const item = document.createElement('div');
    item.className = 'deal-item';

    const info = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'deal-item-title';
    title.textContent = d.title;          // textContent — safe
    const meta = document.createElement('div');
    meta.className = 'deal-item-meta';
    meta.textContent = Number(d.deal_price).toFixed(2) + ' CHF'
      + ' · ' + (d.active ? '✅ Aktiv' : '⏸ Inaktiv');
    info.append(title, meta);

    item.appendChild(info);
    el.appendChild(item);
  });
}

// ── DEAL CREATION ─────────────────────────────────────────────────────────
function toggleValidity() {
  const isRecurring = document.querySelector('input[name="validType"]:checked').value === 'recurring';
  document.getElementById('recurringFields').style.display = isRecurring ? 'block' : 'none';
  document.getElementById('singleFields').style.display    = isRecurring ? 'none'  : 'block';
}

function toggleWeekday(el, day) {
  el.classList.toggle('selected');
}

async function doCreateDeal() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }

  const title    = document.getElementById('dealTitle').value.trim();
  const origP    = parseFloat(document.getElementById('dealOrigPrice').value) || 0;
  const price    = parseFloat(document.getElementById('dealPrice').value);
  const qty      = parseInt(document.getElementById('dealQty').value) || 0;
  const desc     = document.getElementById('dealDesc').value.trim();
  const active   = document.getElementById('dealActive').checked;
  const fromT    = document.getElementById('timeFrom').value;
  const toT      = document.getElementById('timeTo').value;

  const cats = Array.from(document.querySelectorAll('input[name="cat"]:checked')).map(c => c.value);
  if (!title)       { showToast('Titel ist Pflichtfeld', true); return; }
  if (isNaN(price)) { showToast('Deal-Preis ist Pflichtfeld', true); return; }
  if (!cats.length) { showToast('Mind. 1 Kategorie wählen', true); return; }

  const validType = document.querySelector('input[name="validType"]:checked').value;
  const weekdays  = Array.from(document.querySelectorAll('.wd-btn.selected')).map(b => b.textContent);
  const singleDate = document.getElementById('singleDate').value;

  if (validType === 'single' && !singleDate) { showToast('Datum wählen', true); return; }

  const payload = {
    action: 'createDeal', token: s.token,
    bar_id: s.barId, bar_name: s.barName,
    title, description: desc,
    original_price: origP, deal_price: price,
    max_quantity: qty,
    categories: cats,
    validity_type: validType,
    valid_weekdays: weekdays,
    valid_from_time: fromT, valid_to_time: toT,
    valid_single_date: singleDate,
    active
  };

  try {
    const r = await api(payload);
    if (r.success) {
      showToast('✅ Deal erstellt!');
      // Reset form
      document.getElementById('dealTitle').value    = '';
      document.getElementById('dealDesc').value     = '';
      document.getElementById('dealOrigPrice').value = '';
      document.getElementById('dealPrice').value    = '';
      document.querySelectorAll('input[name="cat"]').forEach(c => c.checked = false);
      document.querySelectorAll('.wd-btn').forEach(b => b.classList.remove('selected'));
      document.getElementById('singleDate').value  = '';
      document.getElementById('timeFrom').value    = '';
      document.getElementById('timeTo').value      = '';
    } else {
      showToast(r.error || 'Fehler', true);
    }
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// ── TAB SWITCHING ─────────────────────────────────────────────────────────
function switchAuthTab(name, btn) {
  document.getElementById('loginForm').classList.toggle('active', name === 'login');
  document.getElementById('registerForm').classList.toggle('active', name === 'register');
  document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

function switchDashTab(name, btn) {
  ['dashOverview','dashNewdeal','dashMydeals'].forEach(id => {
    document.getElementById(id).classList.remove('active');
  });
  document.getElementById('dash' + name.charAt(0).toUpperCase() + name.slice(1)).classList.add('active');
  document.querySelectorAll('#barDashboard .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  if (name === 'mydeals') loadMyDeals();
  if (name === 'overview') loadBarStats();
}

// ── API / TOAST ───────────────────────────────────────────────────────────
async function api(body) {
  const r = await fetch(BACKEND_URL, { method: 'POST', body: JSON.stringify(body) });
  return r.json();
}

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
  // Logout
  document.querySelectorAll('.btn-logout').forEach(b => b.addEventListener('click', doLogout));

  // Auth tabs
  document.querySelectorAll('[data-auth-tab]').forEach(btn => {
    btn.addEventListener('click', function() { switchAuthTab(this.dataset.authTab, this); });
  });

  // Login / Register forms — use IDs set in HTML
  const barLoginBtn    = document.getElementById('btnBarLogin');
  const barRegisterBtn = document.getElementById('btnBarRegister');
  if (barLoginBtn)    barLoginBtn.addEventListener('click', doBarLogin);
  if (barRegisterBtn) barRegisterBtn.addEventListener('click', doBarRegister);

  // Dashboard tabs
  document.querySelectorAll('[data-dash-tab]').forEach(btn => {
    btn.addEventListener('click', function() { switchDashTab(this.dataset.dashTab, this); });
  });

  // Weekday toggles
  document.querySelectorAll('[data-weekday]').forEach(div => {
    div.addEventListener('click', function() { toggleWeekday(this, this.dataset.weekday); });
  });

  // Create deal button
  const btnCreateDeal = document.getElementById('btnCreateDeal');
  if (btnCreateDeal) btnCreateDeal.addEventListener('click', doCreateDeal);
});
