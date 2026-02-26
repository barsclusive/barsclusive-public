// =============================================
// CONFIGURATION
// =============================================
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwVoFI8ZpENpf2KM6pzGAvyfmL0x0YWJkbDEjT2EapWh1sEKkUWEGay8wEb6pk2UxHp/exec';

// =============================================
// i18n — DE / EN
// =============================================
const TRANSLATIONS = {
  de: {
    logout:'Ausloggen', login:'Login', register:'Registrieren',
    barLogin:'Bar Login', email:'Email', password:'Passwort',
    loginBtn:'Einloggen', registerBar:'Bar registrieren',
    barName:'Bar-Name *', city:'Stadt *', address:'Adresse', phone:'Telefon',
    passwordMin:'Passwort (mind. 8 Zeichen) *', privacyPolicy:'Datenschutzerklärung',
    registerBtn:'Registrieren', pendingNote:'Nach der Registrierung wird dein Account von BarSclusive freigeschaltet.',
    tabOverview:'Übersicht', tabNewDeal:'Neuer Deal', tabMyDeals:'Meine Deals',
    tabVouchers:'Gutscheine', tabRedeem:'Einlösen', tabSettings:'Einstellungen',
    loggedInAs:'Eingeloggt als:', dealTitleLbl:'Titel *', dealDescLbl:'Beschreibung',
    origPrice:'Originalpreis (CHF)', dealPriceLbl:'Deal-Preis (CHF) *',
    maxQty:'Max. Anzahl (0 = unbegrenzt)', categoriesLbl:'Kategorien * (mind. 1)',
    validityLbl:'Gültigkeitsdauer *', recurring:'Wiederkehrend', singleDate:'Einmaliges Datum',
    weekdaysLbl:'Wochentage', dateLbl:'Datum', fromLbl:'Von', toLbl:'Bis',
    dealActiveLabel:'Deal sofort aktiv', createDeal:'Deal erstellen',
    codeLbl:'Code', dealLbl:'Deal', priceLbl:'Preis', createdLbl:'Erstellt', redeemedLbl:'Eingelöst',
    redeemTitle:'Gutschein einlösen', redeemHint:'Gutschein-Code des Kunden eingeben',
    redeemBtn:'Einlösen', redeemSuccess:'✅ Gutschein eingelöst!',
    changePassword:'Passwort ändern', oldPassword:'Altes Passwort',
    newPasswordLbl:'Neues Passwort (mind. 8 Zeichen)', confirmPassword:'Passwort bestätigen',
    changePasswordBtn:'Passwort ändern', editDeal:'Deal bearbeiten',
    saveLbl:'Speichern', cancelLbl:'Abbrechen',
    activeBtn:'Aktivieren', deactivateBtn:'Deaktivieren', editBtn:'Bearbeiten',
    noDeals:'Noch keine Deals. Erstelle deinen ersten Deal!',
    noVouchers:'Noch keine Gutscheine.',
    soldCount:'verkauft',
  },
  en: {
    logout:'Logout', login:'Login', register:'Register',
    barLogin:'Bar Login', email:'Email', password:'Password',
    loginBtn:'Login', registerBar:'Register Bar',
    barName:'Bar Name *', city:'City *', address:'Address', phone:'Phone',
    passwordMin:'Password (min. 8 chars) *', privacyPolicy:'Privacy Policy',
    registerBtn:'Register', pendingNote:'After registration your account will be activated by BarSclusive.',
    tabOverview:'Overview', tabNewDeal:'New Deal', tabMyDeals:'My Deals',
    tabVouchers:'Vouchers', tabRedeem:'Redeem', tabSettings:'Settings',
    loggedInAs:'Logged in as:', dealTitleLbl:'Title *', dealDescLbl:'Description',
    origPrice:'Original Price (CHF)', dealPriceLbl:'Deal Price (CHF) *',
    maxQty:'Max. Quantity (0 = unlimited)', categoriesLbl:'Categories * (min. 1)',
    validityLbl:'Validity *', recurring:'Recurring', singleDate:'Single Date',
    weekdaysLbl:'Weekdays', dateLbl:'Date', fromLbl:'From', toLbl:'To',
    dealActiveLabel:'Activate deal immediately', createDeal:'Create Deal',
    codeLbl:'Code', dealLbl:'Deal', priceLbl:'Price', createdLbl:'Created', redeemedLbl:'Redeemed',
    redeemTitle:'Redeem Voucher', redeemHint:"Enter the customer's voucher code",
    redeemBtn:'Redeem', redeemSuccess:'✅ Voucher redeemed!',
    changePassword:'Change Password', oldPassword:'Old Password',
    newPasswordLbl:'New Password (min. 8 chars)', confirmPassword:'Confirm Password',
    changePasswordBtn:'Change Password', editDeal:'Edit Deal',
    saveLbl:'Save', cancelLbl:'Cancel',
    activeBtn:'Activate', deactivateBtn:'Deactivate', editBtn:'Edit',
    noDeals:'No deals yet. Create your first deal!',
    noVouchers:'No vouchers yet.',
    soldCount:'sold',
  }
};

let currentLang = 'de';
function t(key) { return TRANSLATIONS[currentLang][key] || TRANSLATIONS.de[key] || key; }

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
}

function setLang(lang) {
  console.log('[BarApp] Switching language to:', lang);
  currentLang = lang;
  document.documentElement.lang = lang;
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
  applyTranslations();
  console.log('[BarApp] Language switched. Translations applied.');
}

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
  const zip     = document.getElementById('regZip') ? document.getElementById('regZip').value.trim() : '';
  const phone   = document.getElementById('regPhone').value.trim();
  const email   = document.getElementById('regBarEmail').value.trim();
  const pass    = document.getElementById('regBarPass').value;
  const consent = document.getElementById('regConsent').checked;
  const err     = document.getElementById('regErr');
  err.textContent = '';
  if (!name || !city || !address || !zip || !email || !pass) { err.textContent = 'Alle Pflichtfelder ausfüllen (Name, Stadt, Adresse, PLZ, Email, Passwort).'; return; }
  if (pass.length < 8) { err.textContent = 'Passwort mind. 8 Zeichen.'; return; }
  if (!consent) { err.textContent = 'Bitte AGB & Datenschutz akzeptieren.'; return; }
  try {
    var btn = document.getElementById('btnBarRegister');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Registrierung läuft...'; }
    const r = await api({ action: 'barRegister', name, city, address, zip, phone, email, password: pass });
    if (r.success) {
      showToast('✅ Registrierung erfolgreich! Wir melden uns zur Freischaltung.');
      document.getElementById('regBarPass').value = '';
    } else {
      err.textContent = r.error || 'Fehler bei der Registrierung.';
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Registrieren'; }
  } catch (e) { err.textContent = 'Verbindungsfehler.'; if (btn) { btn.disabled = false; btn.textContent = 'Registrieren'; } }
}

async function doLogout() {
  const s = sessionGet();
  if (s) { try { await api({ action: 'logout', token: s.token }); } catch (e) {} }
  sessionClear();
  showAuthScreen(true);
}

function showAuthScreen(show) {
  document.getElementById('loginScreen').style.display  = show ? 'block' : 'none';
  document.getElementById('barDashboard').style.display = show ? 'none'  : 'block';
}

// ── OVERVIEW ─────────────────────────────────────────────────────────────
async function loadBarStats() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  try {
    const r = await api({ action: 'getBarStats', token: s.token, bar_id: s.barId });
    if (!r.success) return;
    const grid = document.getElementById('statsGrid');
    grid.innerHTML = '';
    [
      [t('tabMyDeals') + ' ' + t('soldCount'), r.total_sold],
      ['Einnahmen', Number(r.total_earned).toFixed(2) + ' CHF'],
    ].forEach(([label, val]) => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      const lEl = document.createElement('div'); lEl.className = 'stat-label'; lEl.textContent = label;
      const vEl = document.createElement('div'); vEl.className = 'stat-value'; vEl.textContent = String(val);
      card.append(lEl, vEl);
      grid.appendChild(card);
    });
  } catch (e) {}
}

// ── MY DEALS ──────────────────────────────────────────────────────────────
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
    div.className = 'empty'; div.textContent = t('noDeals');
    el.appendChild(div); return;
  }
  deals.forEach(d => {
    const item = document.createElement('div');
    item.className = 'deal-item';

    const info = document.createElement('div');
    const title = document.createElement('div'); title.className = 'deal-item-title'; title.textContent = d.title;
    const meta  = document.createElement('div'); meta.className  = 'deal-item-meta';
    meta.textContent = Number(d.deal_price).toFixed(2) + ' CHF · ' + (d.active ? '✅ Aktiv' : '⏸ Inaktiv');
    info.append(title, meta);

    const actions = document.createElement('div');
    actions.className = 'deal-actions';

    // Toggle active/inactive
    const btnToggle = document.createElement('button');
    btnToggle.className = 'btn-sm ' + (d.active ? 'btn-orange' : 'btn-green');
    btnToggle.textContent = d.active ? t('deactivateBtn') : t('activeBtn');
    btnToggle.addEventListener('click', () => toggleDeal(d.id, !d.active));

    // Edit
    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn-sm btn-blue';
    btnEdit.textContent = t('editBtn');
    btnEdit.addEventListener('click', () => openEditModal(d));

    actions.append(btnToggle, btnEdit);
    item.append(info, actions);
    el.appendChild(item);
  });
}

async function toggleDeal(dealId, active) {
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  try {
    const r = await api({ action: 'updateDealStatus', token: s.token, deal_id: dealId, active });
    if (r.success) { showToast(active ? '✅ Aktiviert' : '⏸ Deaktiviert'); loadMyDeals(); }
    else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// ── EDIT MODAL ────────────────────────────────────────────────────────────
function openEditModal(deal) {
  document.getElementById('editDealId').value       = deal.id;
  document.getElementById('editTitle').value        = deal.title || '';
  document.getElementById('editDesc').value         = deal.description || '';
  document.getElementById('editOrigPrice').value    = deal.original_price || 0;
  document.getElementById('editDealPrice').value    = deal.deal_price || '';
  document.getElementById('editQty').value          = deal.max_quantity || 0;
  document.getElementById('editImageUrl').value     = deal.image_url || '';
  document.getElementById('editActive').checked     = !!deal.active;
  document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

async function saveEditDeal() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  const dealId = document.getElementById('editDealId').value;
  const price  = parseFloat(document.getElementById('editDealPrice').value);
  if (isNaN(price) || price <= 0) { showToast('Ungültiger Preis', true); return; }

  const payload = {
    action: 'updateDeal', token: s.token,
    deal_id: dealId,
    title:          document.getElementById('editTitle').value.trim(),
    description:    document.getElementById('editDesc').value.trim(),
    original_price: parseFloat(document.getElementById('editOrigPrice').value) || 0,
    deal_price:     price,
    max_quantity:   parseInt(document.getElementById('editQty').value) || 0,
    image_url:      document.getElementById('editImageUrl').value.trim(),
    active:         document.getElementById('editActive').checked,
  };

  try {
    const r = await api(payload);
    if (r.success) {
      showToast('✅ ' + t('saveLbl'));
      closeEditModal();
      loadMyDeals();
    } else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// ── VOUCHERS TAB ──────────────────────────────────────────────────────────
async function loadMyVouchers() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  try {
    const r = await api({ action: 'getBarVouchers', token: s.token, bar_id: s.barId });
    if (!r.success) { showToast(r.error || 'Fehler', true); return; }
    renderVouchers(r.vouchers);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

function renderVouchers(vouchers) {
  const tbody = document.getElementById('voucherBody');
  tbody.innerHTML = '';
  if (!vouchers.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6; td.style.padding = '30px'; td.style.textAlign = 'center';
    td.style.color = '#555'; td.textContent = t('noVouchers');
    tr.appendChild(td); tbody.appendChild(tr); return;
  }
  const statusMap = { sent:'b-sent', issued:'b-issued', redeemed:'b-redeemed', active:'b-active' };
  vouchers.forEach(v => {
    const tr = document.createElement('tr');
    const badge = document.createElement('span');
    badge.className = 'badge ' + (statusMap[v.status] || 'b-inactive');
    badge.textContent = v.status;
    const statusTd = document.createElement('td'); statusTd.appendChild(badge);

    tr.append(
      mkTd(v.code),
      mkTd(v.deal_title),
      mkTd(Number(v.price_paid).toFixed(2) + ' CHF'),
      statusTd,
      mkTd(v.created_at ? new Date(v.created_at).toLocaleDateString('de-CH') : '–'),
      mkTd(v.redeemed_at ? new Date(v.redeemed_at).toLocaleDateString('de-CH') : '–')
    );
    tbody.appendChild(tr);
  });
}

function mkTd(val) {
  const td = document.createElement('td');
  td.textContent = String(val ?? '');
  return td;
}

// ── REDEEM ────────────────────────────────────────────────────────────────
async function doRedeem() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  const code = document.getElementById('redeemCode').value.trim().toUpperCase();
  const err  = document.getElementById('redeemErr');
  const result = document.getElementById('redeemResult');
  err.textContent = ''; result.style.display = 'none';

  if (!code) { err.textContent = 'Code eingeben.'; return; }
  try {
    const r = await api({ action: 'redeemVoucher', token: s.token, code });
    if (r.success) {
      document.getElementById('redeemDeal').textContent = r.deal_title || code;
      result.style.display = 'block';
      document.getElementById('redeemCode').value = '';
      showToast('✅ ' + t('redeemSuccess'));
    } else {
      err.textContent = r.error || 'Ungültiger Gutschein.';
    }
  } catch (e) { err.textContent = 'Verbindungsfehler.'; }
}

// ── CHANGE PASSWORD ───────────────────────────────────────────────────────
async function doChangePassword() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  const oldPw  = document.getElementById('pwOld').value;
  const newPw  = document.getElementById('pwNew').value;
  const confPw = document.getElementById('pwConfirm').value;
  const err    = document.getElementById('pwErr');
  err.textContent = '';

  if (!oldPw || !newPw || !confPw) { err.textContent = 'Alle Felder ausfüllen.'; return; }
  if (newPw.length < 8) { err.textContent = 'Neues Passwort mind. 8 Zeichen.'; return; }
  if (newPw !== confPw) { err.textContent = 'Passwörter stimmen nicht überein.'; return; }

  try {
    const r = await api({ action: 'changePassword', token: s.token, old_password: oldPw, new_password: newPw });
    if (r.success) {
      showToast('✅ Passwort geändert!');
      document.getElementById('pwOld').value = '';
      document.getElementById('pwNew').value = '';
      document.getElementById('pwConfirm').value = '';
    } else {
      err.textContent = r.error || 'Fehler.';
    }
  } catch (e) { err.textContent = 'Verbindungsfehler.'; }
}

// ── DEAL CREATION ─────────────────────────────────────────────────────────
function toggleValidity() {
  const isRecurring = document.querySelector('input[name="validType"]:checked').value === 'recurring';
  document.getElementById('recurringFields').style.display = isRecurring ? 'block' : 'none';
  document.getElementById('singleFields').style.display    = isRecurring ? 'none'  : 'block';
}

async function doCreateDeal() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }

  const title  = document.getElementById('dealTitle').value.trim();
  const origP  = parseFloat(document.getElementById('dealOrigPrice').value) || 0;
  const price  = parseFloat(document.getElementById('dealPrice').value);
  const qty    = parseInt(document.getElementById('dealQty').value) || 0;
  const desc   = document.getElementById('dealDesc').value.trim();
  const imageUrl = document.getElementById('dealImageUrl').value.trim();
  const active = document.getElementById('dealActive').checked;
  const fromT  = document.getElementById('timeFrom').value;
  const toT    = document.getElementById('timeTo').value;
  const cats   = Array.from(document.querySelectorAll('input[name="cat"]:checked')).map(c => c.value);
  const isPauschal = cats.includes('pauschalgutscheine');

  if (isPauschal) { price = 2.50; }
  if (!title)       { showToast('Titel ist Pflichtfeld', true); return; }
  if (isNaN(price)) { showToast('Deal-Preis ist Pflichtfeld', true); return; }
  if (isPauschal && (parseInt(document.getElementById('discountPercent').value)||0) < 15) { showToast('Rabatt mind. 15%', true); return; }
  if (isPauschal && (parseInt(document.getElementById('minOrder').value)||0) > 0 && (parseInt(document.getElementById('minOrder').value)||0) < 40) { showToast('Mindestbestellung mind. 40 CHF', true); return; }
  if (!cats.length) { showToast('Mind. 1 Kategorie wählen', true); return; }

  const validType  = document.querySelector('input[name="validType"]:checked').value;
  const weekdays   = Array.from(document.querySelectorAll('.wd-btn.selected')).map(b => b.textContent);
  const singleDate = document.getElementById('singleDate').value;
  if (validType === 'single' && !singleDate) { showToast('Datum wählen', true); return; }

  try {
    const r = await api({
    // Upload image if file selected
    var imageUrl = document.getElementById('dealImageUrl') ? document.getElementById('dealImageUrl').value : '';
    var imgF = document.getElementById('dealImageFile');
    if (imgF && imgF.files.length > 0) {
      try {
        var b64 = await fileToBase64(imgF.files[0]);
        var uR = await api({ action: 'uploadImage', token: s.token, image_data: b64, filename: imgF.files[0].name });
        if (uR.success) imageUrl = uR.url;
      } catch(e) {}
    }

    const r = await api({
      action: 'createDeal', token: s.token,
      time_slots: Array.from(document.querySelectorAll('input[name="timeSlot"]:checked')).map(function(c){return c.value}),
      discount_percent: isPauschal ? (parseInt(document.getElementById('discountPercent').value)||0) : 0,
      min_order: isPauschal ? (parseInt(document.getElementById('minOrder').value)||0) : 0,
      applies_to: isPauschal ? document.getElementById('appliesTo').value : '',
      bar_id: s.barId, bar_name: s.barName,
      title, description: desc,
      original_price: origP, deal_price: price,
      max_quantity: qty, categories: cats,
      image_url: imageUrl,
      validity_type: validType, valid_weekdays: weekdays,
      valid_from_time: fromT, valid_to_time: toT,
      valid_single_date: singleDate, active
    });
    if (r.success) {
      showToast('✅ Deal erstellt!');
      ['dealTitle','dealDesc','dealOrigPrice','dealPrice','dealImageUrl','singleDate','timeFrom','timeTo']
        .forEach(id => { document.getElementById(id).value = ''; });
      var imgEl = document.getElementById('dealImageFile'); if(imgEl) imgEl.value = '';
      var pvEl = document.getElementById('imagePreview'); if(pvEl) pvEl.style.display = 'none';
      document.querySelectorAll('input[name="timeSlot"]').forEach(function(c){c.checked=false});
      var pf = document.getElementById('pauschalFields'); if(pf) pf.style.display = 'none';
      document.querySelectorAll('input[name="cat"]').forEach(c => c.checked = false);
      document.querySelectorAll('.wd-btn').forEach(b => b.classList.remove('selected'));
      document.getElementById('dealQty').value = '0';
    } else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// ── TAB SWITCHING ─────────────────────────────────────────────────────────
function switchAuthTab(name, btn) {
  document.getElementById('loginForm').classList.toggle('active', name === 'login');
  document.getElementById('registerForm').classList.toggle('active', name === 'register');
  document.querySelectorAll('[data-auth-tab]').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

const TAB_IDS = {
  overview:'dashOverview', newdeal:'dashNewdeal', mydeals:'dashMydeals',
  vouchers:'dashVouchers', redeem:'dashRedeem', settings:'dashSettings'
};
const TAB_LOADERS = {
  overview: loadBarStats, mydeals: loadMyDeals,
  vouchers: loadMyVouchers, redeem: () => {}
};

function switchDashTab(name, btn) {
  Object.values(TAB_IDS).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById(TAB_IDS[name]);
  if (target) target.classList.add('active');
  document.querySelectorAll('#barDashboard .tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  if (TAB_LOADERS[name]) TAB_LOADERS[name]();
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
  el.className = 'toast show ' + (isError ? 'toast-err' : 'toast-ok');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ── PASSWORD RESET ────────────────────────────────────────────────────────
async function sendBarResetCode() {
  const email = document.getElementById('barResetEmail').value.trim();
  if (!email) {
    showToast('Bitte Email eingeben', true);
    return;
  }
  
  try {
    const r = await api({ action: 'requestPasswordReset', email, role: 'bar' });
    if (r.success) {
      showToast(r.message || 'Code gesendet!');
      document.getElementById('barResetStep1').style.display = 'none';
      document.getElementById('barResetStep2').style.display = 'block';
    } else {
      showToast(r.error || 'Fehler', true);
    }
  } catch (e) {
    showToast('Verbindungsfehler', true);
  }
}

async function resetBarPassword() {
  const email = document.getElementById('barResetEmail').value.trim();
  const code = document.getElementById('barResetCode').value.trim();
  const newPassword = document.getElementById('barResetNewPassword').value;
  
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
      role: 'bar' 
    });
    if (r.success) {
      showToast('✅ Passwort geändert!');
      closeBarResetModal();
      // Reset form
      document.getElementById('barResetEmail').value = '';
      document.getElementById('barResetCode').value = '';
      document.getElementById('barResetNewPassword').value = '';
      document.getElementById('barResetStep1').style.display = 'block';
      document.getElementById('barResetStep2').style.display = 'none';
    } else {
      showToast(r.error || 'Fehler', true);
    }
  } catch (e) {
    showToast('Verbindungsfehler', true);
  }
}

function openBarResetPasswordModal() {
  document.getElementById('barResetPasswordModal').classList.add('active');
  document.getElementById('barResetStep1').style.display = 'block';
  document.getElementById('barResetStep2').style.display = 'none';
}

function closeBarResetModal() {
  document.getElementById('barResetPasswordModal').classList.remove('active');
}

function barBackToResetStep1() {
  document.getElementById('barResetStep2').style.display = 'none';
  document.getElementById('barResetStep1').style.display = 'block';
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Language
  const langDE = document.getElementById('langDE');
  const langEN = document.getElementById('langEN');
  if (langDE) {
    langDE.addEventListener('click', function() {
      console.log('[BarApp] DE button clicked');
      setLang('de');
    });
  } else {
    console.error('[BarApp] langDE button not found');
  }
  if (langEN) {
    langEN.addEventListener('click', function() {
      console.log('[BarApp] EN button clicked');
      setLang('en');
    });
  } else {
    console.error('[BarApp] langEN button not found');
  }

  // Logout
  document.querySelectorAll('.btn-logout').forEach(b => b.addEventListener('click', doLogout));

  // Auth tabs
  document.querySelectorAll('[data-auth-tab]').forEach(btn => {
    btn.addEventListener('click', function() { switchAuthTab(this.dataset.authTab, this); });
  });

  // Login / Register
  const btnBarLogin    = document.getElementById('btnBarLogin');
  const btnBarRegister = document.getElementById('btnBarRegister');
  if (btnBarLogin)    btnBarLogin.addEventListener('click', doBarLogin);
  if (btnBarRegister) btnBarRegister.addEventListener('click', doBarRegister);

  // Enter key on password
  document.getElementById('loginPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') doBarLogin();
  });

  // Dashboard tabs
  document.querySelectorAll('[data-dash-tab]').forEach(btn => {
    btn.addEventListener('click', function() { switchDashTab(this.dataset.dashTab, this); });
  });

  // Weekday toggles
  document.querySelectorAll('[data-weekday]').forEach(div => {
    div.addEventListener('click', function() { this.classList.toggle('selected'); });
  });

  // Validity toggle
  document.querySelectorAll('input[name="validType"]').forEach(radio => {
    radio.addEventListener('change', toggleValidity);
  });

  // Create deal
  const btnCreateDeal = document.getElementById('btnCreateDeal');
  if (btnCreateDeal) btnCreateDeal.addEventListener('click', doCreateDeal);

  // Redeem
  const btnRedeem = document.getElementById('btnRedeem');
  if (btnRedeem) btnRedeem.addEventListener('click', doRedeem);

  const redeemCode = document.getElementById('redeemCode');
  if (redeemCode) redeemCode.addEventListener('keydown', e => {
    if (e.key === 'Enter') doRedeem();
  });

  // Change password
  const btnChangePw = document.getElementById('btnChangePassword');
  if (btnChangePw) btnChangePw.addEventListener('click', doChangePassword);

  // Edit modal
  const btnCloseEdit  = document.getElementById('btnCloseEditModal');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const btnSaveEdit   = document.getElementById('btnSaveEdit');
  if (btnCloseEdit)  btnCloseEdit.addEventListener('click', closeEditModal);
  if (btnCancelEdit) btnCancelEdit.addEventListener('click', closeEditModal);
  if (btnSaveEdit)   btnSaveEdit.addEventListener('click', saveEditDeal);

  // Close modal on backdrop click
  document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) closeEditModal();
  });

  // Password reset
  const linkBarForgotPassword = document.getElementById('linkBarForgotPassword');
  if (linkBarForgotPassword) linkBarForgotPassword.addEventListener('click', openBarResetPasswordModal);

  const btnBarSendResetCode = document.getElementById('btnBarSendResetCode');
  if (btnBarSendResetCode) btnBarSendResetCode.addEventListener('click', sendBarResetCode);

  const btnBarResetPassword = document.getElementById('btnBarResetPassword');
  if (btnBarResetPassword) btnBarResetPassword.addEventListener('click', resetBarPassword);

  const btnBarBackToStep1 = document.getElementById('btnBarBackToStep1');
  if (btnBarBackToStep1) btnBarBackToStep1.addEventListener('click', barBackToResetStep1);

  const btnCloseBarResetModal = document.getElementById('btnCloseBarResetModal');
  if (btnCloseBarResetModal) btnCloseBarResetModal.addEventListener('click', closeBarResetModal);

  const btnBarCancelReset1 = document.getElementById('btnBarCancelReset1');
  if (btnBarCancelReset1) btnBarCancelReset1.addEventListener('click', closeBarResetModal);
});


// =============================================
// IMAGE UPLOAD PREVIEW
// =============================================
document.addEventListener('DOMContentLoaded', function() {
  var imgFile = document.getElementById('dealImageFile');
  if (imgFile) {
    imgFile.addEventListener('change', function() {
      var preview = document.getElementById('imagePreview');
      var img = document.getElementById('imagePreviewImg');
      if (this.files.length > 0) {
        var file = this.files[0];
        if (file.size > 2*1024*1024) { showToast('Bild max. 2 MB', true); this.value=''; return; }
        var reader = new FileReader();
        reader.onload = function(e) { img.src = e.target.result; preview.style.display='block'; };
        reader.readAsDataURL(file);
      } else { preview.style.display='none'; }
    });
  }
  // Pauschalgutschein toggle
  var cp = document.getElementById('catPauschal');
  if (cp) {
    cp.addEventListener('change', function() {
      var pf = document.getElementById('pauschalFields');
      if (pf) pf.style.display = this.checked ? 'block' : 'none';
    });
  }
});

function fileToBase64(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() { resolve(reader.result.split(',')[1]); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
