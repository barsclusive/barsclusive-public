// =============================================
// CONFIGURATION
// =============================================
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbz1zkTHlVpnFgbMlscbjgGHXDRwhoAqYQeasInpWUDzn6dzC2aFC_DEykj_itklCHILRA/exec';

// =============================================
// i18n — DE / EN / IT / FR
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
  changePassword:'Passwort ändern', oldPassword:'Altes Passwort', profileTitle:'Stammdaten', addressLbl:'Adresse', zipLbl:'PLZ', cityLbl:'Stadt', phoneLbl:'Telefon', ibanLbl:'IBAN', twintLbl:'Twint', saveProfile:'Speichern', profileSaved:'Profil gespeichert', deleteAccountTitle:'Account löschen', deleteAccountWarning:'Alle Deals werden deaktiviert. Diese Aktion ist endgültig.', deleteAccountBtn:'Account endgültig löschen', soldCount:'Verkauft', notRedeemed:'Nicht eingel\xf6st', paidOut:'Ausgezahlt', activeDeals:'Aktive Deals', earnings:'Einnahmen', redeemed:'Eingelöst', pendingPayout:'Ausstehend', deleteDealBtn:'Deal löschen', deleteDealConfirm:'Deal endgültig löschen?', shop:'Shop', aboutUs:'Über uns', howItWorks:'So funktionierts', legalNotice:'Impressum', privacy:'Datenschutz', termsBars:'AGB Bars', contact:'Kontakt',
  newPasswordLbl:'Neues Passwort (mind. 8 Zeichen)', confirmPassword:'Passwort bestätigen',
  changePasswordBtn:'Passwort ändern', editDeal:'Deal bearbeiten',
  saveLbl:'Speichern', cancelLbl:'Abbrechen',
  activeBtn:'Aktivieren', deactivateBtn:'Deaktivieren', editBtn:'Bearbeiten',
  noDeals:'Noch keine Deals. Erstelle deinen ersten Deal!',
  noVouchers:'Noch keine Gutscheine.',
  soldCount:'verkauft',
  resetPasswordTitle:'Passwort zurücksetzen',
  newPassword:'Neues Passwort',
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
  changePassword:'Change Password', oldPassword:'Old Password', profileTitle:'Master Data', addressLbl:'Address', zipLbl:'ZIP', cityLbl:'City', phoneLbl:'Phone', ibanLbl:'IBAN', twintLbl:'Twint', saveProfile:'Save', profileSaved:'Profile saved', deleteAccountTitle:'Delete Account', deleteAccountWarning:'All deals will be deactivated. This action is permanent.', deleteAccountBtn:'Delete account permanently', soldCount:'Sold', notRedeemed:'Not redeemed', paidOut:'Paid out', activeDeals:'Active Deals', earnings:'Revenue', redeemed:'Redeemed', pendingPayout:'Pending', deleteDealBtn:'Delete Deal', deleteDealConfirm:'Permanently delete this deal?', shop:'Shop', aboutUs:'About Us', howItWorks:'How It Works', legalNotice:'Legal Notice', privacy:'Privacy', termsBars:'Terms Bars', contact:'Contact',
  newPasswordLbl:'New Password (min. 8 chars)', confirmPassword:'Confirm Password',
  changePasswordBtn:'Change Password', editDeal:'Edit Deal',
  saveLbl:'Save', cancelLbl:'Cancel',
  activeBtn:'Activate', deactivateBtn:'Deactivate', editBtn:'Edit',
  noDeals:'No deals yet. Create your first deal!',
  noVouchers:'No vouchers yet.',
  soldCount:'sold',
  resetPasswordTitle:'Reset Password',
  newPassword:'New Password',
},
it: {
  logout:'Esci', login:'Login', register:'Registrati',
  barLogin:'Login Bar', email:'Email', password:'Password',
  loginBtn:'Accedi', registerBar:'Registra Bar',
  barName:'Nome Bar *', city:'Città *', address:'Indirizzo', phone:'Telefono',
  passwordMin:'Password (min. 8 caratteri) *', privacyPolicy:'Privacy Policy',
  registerBtn:'Registrati', pendingNote:'Dopo la registrazione il tuo account sarà attivato da BarSclusive.',
  tabOverview:'Panoramica', tabNewDeal:'Nuovo Deal', tabMyDeals:'I miei Deal',
  tabVouchers:'Voucher', tabRedeem:'Riscatta', tabSettings:'Impostazioni',
  loggedInAs:'Connesso come:', dealTitleLbl:'Titolo *', dealDescLbl:'Descrizione',
  origPrice:'Prezzo originale (CHF)', dealPriceLbl:'Prezzo Deal (CHF) *',
  maxQty:'Quantità max. (0 = illimitato)', categoriesLbl:'Categorie * (min. 1)',
  validityLbl:'Validità *', recurring:'Ricorrente', singleDate:'Data singola',
  weekdaysLbl:'Giorni', dateLbl:'Data', fromLbl:'Da', toLbl:'A',
  dealActiveLabel:'Attiva subito', createDeal:'Crea Deal',
  codeLbl:'Codice', dealLbl:'Deal', priceLbl:'Prezzo', createdLbl:'Creato', redeemedLbl:'Riscattato',
  redeemTitle:'Riscatta Voucher', redeemHint:'Inserisci il codice voucher del cliente',
  redeemBtn:'Riscatta', redeemSuccess:'✅ Voucher riscattato!',
  changePassword:'Cambia Password', oldPassword:'Vecchia Password', profileTitle:'Dati anagrafici', addressLbl:'Indirizzo', zipLbl:'CAP', cityLbl:'Città', phoneLbl:'Telefono', ibanLbl:'IBAN', twintLbl:'Twint', saveProfile:'Salva', profileSaved:'Profilo salvato', deleteAccountTitle:'Elimina account', deleteAccountWarning:'Tutti i deal saranno disattivati. Questa azione è definitiva.', deleteAccountBtn:'Elimina account definitivamente', soldCount:'Venduti', notRedeemed:'Non riscattati', paidOut:'Pagato', activeDeals:'Deal attivi', earnings:'Entrate', redeemed:'Riscattati', pendingPayout:'In sospeso', deleteDealBtn:'Elimina Deal', deleteDealConfirm:'Eliminare definitivamente questo deal?', shop:'Shop', aboutUs:'Chi siamo', howItWorks:'Come funziona', legalNotice:'Impressum', privacy:'Privacy', termsBars:'Condizioni Bar', contact:'Contatto',
  newPasswordLbl:'Nuova Password (min. 8 car.)', confirmPassword:'Conferma Password',
  changePasswordBtn:'Cambia Password', editDeal:'Modifica Deal',
  saveLbl:'Salva', cancelLbl:'Annulla',
  activeBtn:'Attiva', deactivateBtn:'Disattiva', editBtn:'Modifica',
  noDeals:'Nessun deal. Crea il tuo primo deal!',
  noVouchers:'Nessun voucher.',
  soldCount:'venduti',
  resetPasswordTitle:'Reimposta Password',
  newPassword:'Nuova Password',
},
fr: {
  logout:'Déconnexion', login:'Connexion', register:'Inscription',
  barLogin:'Connexion Bar', email:'Email', password:'Mot de passe',
  loginBtn:'Se connecter', registerBar:'Inscrire Bar',
  barName:'Nom du Bar *', city:'Ville *', address:'Adresse', phone:'Téléphone',
  passwordMin:'Mot de passe (min. 8 car.) *', privacyPolicy:'Politique de confidentialité',
  registerBtn:"S'inscrire", pendingNote:"Après l'inscription, votre compte sera activé par BarSclusive.",
  tabOverview:'Aperçu', tabNewDeal:'Nouveau Deal', tabMyDeals:'Mes Deals',
  tabVouchers:'Bons', tabRedeem:'Échanger', tabSettings:'Paramètres',
  loggedInAs:'Connecté en tant que:', dealTitleLbl:'Titre *', dealDescLbl:'Description',
  origPrice:'Prix original (CHF)', dealPriceLbl:'Prix Deal (CHF) *',
  maxQty:'Quantité max. (0 = illimité)', categoriesLbl:'Catégories * (min. 1)',
  validityLbl:'Validité *', recurring:'Récurrent', singleDate:'Date unique',
  weekdaysLbl:'Jours', dateLbl:'Date', fromLbl:'De', toLbl:'À',
  dealActiveLabel:'Activer immédiatement', createDeal:'Créer Deal',
  codeLbl:'Code', dealLbl:'Deal', priceLbl:'Prix', createdLbl:'Créé', redeemedLbl:'Échangé',
  redeemTitle:'Échanger Bon', redeemHint:'Entrez le code du bon client',
  redeemBtn:'Échanger', redeemSuccess:'✅ Bon échangé!',
  changePassword:'Changer le mot de passe', oldPassword:'Ancien mot de passe', profileTitle:'Coordonnées', addressLbl:'Adresse', zipLbl:'NPA', cityLbl:'Ville', phoneLbl:'Téléphone', ibanLbl:'IBAN', twintLbl:'Twint', saveProfile:'Enregistrer', profileSaved:'Profil enregistré', deleteAccountTitle:'Supprimer le compte', deleteAccountWarning:'Tous les deals seront désactivés. Cette action est définitive.', deleteAccountBtn:'Supprimer le compte définitivement', soldCount:'Vendus', notRedeemed:'Non utilis\xe9s', paidOut:'Pay\xe9', activeDeals:'Offres actives', earnings:'Revenus', redeemed:'Utilisés', pendingPayout:'En attente', deleteDealBtn:'Supprimer', deleteDealConfirm:'Supprimer définitivement cette offre ?', shop:'Shop', aboutUs:'À propos', howItWorks:'Comment ça marche', legalNotice:'Mentions légales', privacy:'Confidentialité', termsBars:'CGV Bars', contact:'Contact',
  newPasswordLbl:'Nouveau mot de passe (min. 8 car.)', confirmPassword:'Confirmer',
  changePasswordBtn:'Changer', editDeal:'Modifier Deal',
  saveLbl:'Enregistrer', cancelLbl:'Annuler',
  activeBtn:'Activer', deactivateBtn:'Désactiver', editBtn:'Modifier',
  noDeals:'Aucun deal. Créez votre premier deal!',
  noVouchers:'Aucun bon.',
  soldCount:'vendus',
  resetPasswordTitle:'Réinitialiser le mot de passe',
  newPassword:'Nouveau mot de passe',
}
};

let currentLang = 'de';
function t(key) { return TRANSLATIONS[currentLang][key] || TRANSLATIONS.de[key] || key; }

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  // Translate placeholders
  var ph = {
    profAddress: {de:'Strasse Nr.',en:'Street No.',it:'Via Nr.',fr:'Rue No.'},
    profZip: {de:'PLZ',en:'ZIP',it:'CAP',fr:'NPA'},
    profCity: {de:'Stadt',en:'City',it:'Città',fr:'Ville'},
    profPhone: {de:'+41...',en:'+41...',it:'+41...',fr:'+41...'},
    profIban: {de:'CH...',en:'CH...',it:'CH...',fr:'CH...'},
    profTwint: {de:'+41...',en:'+41...',it:'+41...',fr:'+41...'},
    dealTitle: {de:'z.B. 2 Cocktails für 1',en:'e.g. 2 Cocktails for 1',it:'es. 2 Cocktail per 1',fr:'ex. 2 Cocktails pour 1'},
    regIban: {de:'CH00 0000 0000 0000 0000 0',en:'CH00 0000 0000 0000 0000 0',it:'CH00 0000 0000 0000 0000 0',fr:'CH00 0000 0000 0000 0000 0'}
  };
  Object.keys(ph).forEach(function(id) {
    var el = document.getElementById(id);
    if (el && ph[id][currentLang]) el.placeholder = ph[id][currentLang];
  });
}

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  try { localStorage.setItem('barsclusive_bar_lang', lang); } catch(e) {}
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.remove('active');
  });
  var activeBtn = document.getElementById('lang' + lang.toUpperCase());
  if (activeBtn) activeBtn.classList.add('active');
  applyTranslations();
}

// ── SESSION (in-memory + localStorage fallback) ──────────────────────────
let _session = null;

function sessionSet(token, barId, barName) {
  _session = { token, barId, barName, role: 'bar', expiresAt: Date.now() + 90 * 60 * 1000 };
  try { localStorage.setItem('barsclusive_bar_session', JSON.stringify(_session)); } catch(e) {}
  document.getElementById('btnLogout').style.display = 'block';
  var el = document.getElementById('barNameDisplay');
  if (el) el.textContent = barName;
}

function sessionGet() {
  if (!_session) {
    try { var s = localStorage.getItem('barsclusive_bar_session'); if (s) _session = JSON.parse(s); } catch(e) {}
  }
  if (!_session || Date.now() > _session.expiresAt) { _session = null; try { localStorage.removeItem('barsclusive_bar_session'); } catch(e) {} return null; }
  return _session;
}

function sessionClear() {
  _session = null;
  try { localStorage.removeItem('barsclusive_bar_session'); } catch(e) {}
  document.getElementById('btnLogout').style.display = 'none';
}

// ── AUTH ─────────────────────────────────────────────────────────────────
async function doBarLogin() {
  var email = document.getElementById('loginEmail').value.trim();
  var pass  = document.getElementById('loginPassword').value;
  var err   = document.getElementById('loginErr');
  err.textContent = '';
  if (!email || !pass) { err.textContent = 'Bitte alle Felder ausfüllen.'; return; }
  try {
    document.getElementById('btnBarLogin').disabled = true; document.getElementById('btnBarLogin').textContent = '⏳...';
    var r = await api({ action: 'barLogin', email, password: pass });
    document.getElementById('btnBarLogin').disabled = false; document.getElementById('btnBarLogin').textContent = t('loginBtn') || 'Einloggen';
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
  var name    = document.getElementById('regBarName').value.trim();
  var city    = document.getElementById('regCity').value.trim();
  var address = document.getElementById('regAddress').value.trim();
  var zip     = document.getElementById('regZip') ? document.getElementById('regZip').value.trim() : '';
  var phone   = document.getElementById('regPhone').value.trim();
  var email   = document.getElementById('regBarEmail').value.trim();
  var pass    = document.getElementById('regBarPass').value;
  var iban    = document.getElementById('regIban') ? document.getElementById('regIban').value.trim() : '';
  var consent = document.getElementById('regConsent').checked;
  var err     = document.getElementById('regErr');
  err.textContent = '';
  if (!name || !city || !address || !zip || !email || !pass || !iban) { err.textContent = 'Alle Pflichtfelder ausfüllen (Name, Stadt, Adresse, PLZ, Email, Passwort, IBAN).'; return; }
  if (pass.length < 8) { err.textContent = 'Passwort mind. 8 Zeichen.'; return; }
  if (!consent) { err.textContent = 'Bitte AGB & Datenschutz akzeptieren.'; return; }
  var btn = document.getElementById('btnBarRegister');
  try {
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Registrierung läuft…'; }
    var r = await api({ action: 'barRegister', name, city, address, zip, phone, email, password: pass, iban });
    if (r.success) {
      showToast('✅ Registrierung erfolgreich! Wir melden uns zur Freischaltung.');
      document.getElementById('regBarPass').value = '';
    } else {
      err.textContent = r.error || 'Fehler bei der Registrierung.';
    }
  } catch (e) { err.textContent = 'Verbindungsfehler.'; }
  finally { if (btn) { btn.disabled = false; btn.textContent = t('registerBtn'); } }
}

async function doLogout() {
  var s = sessionGet();
  if (s) { try { await api({ action: 'logout', token: s.token }); } catch (e) {} }
  sessionClear();
  showAuthScreen(true);
}

function showAuthScreen(show) {
  document.getElementById('loginScreen').style.display  = show ? 'block' : 'none';
  document.getElementById('barDashboard').style.display = show ? 'none'  : 'block';
}


async function deleteDeal(dealId) {
  if (!confirm(t('deleteDealConfirm'))) return;
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  try {
    var r = await api({ action: 'deleteDeal', token: s.token, deal_id: dealId });
    if (r.success) { showToast(r.message || 'Deal gelöscht'); loadMyDeals(); }
    else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// ── OVERVIEW ─────────────────────────────────────────────────────────────
var _barStatsVouchers = null;
var _barStatsDeals = -1;
var _barStatsPeriod = 'all';

function barFilterDate(period) {
  var now = new Date();
  if (period === 'day') { var d = new Date(now); d.setHours(0,0,0,0); return d; }
  if (period === 'week') { var d = new Date(now); d.setDate(d.getDate() - 7); return d; }
  if (period === 'month') { var d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
  if (period === 'year') { var d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
  return null;
}

async function loadBarStats(period) {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  period = period || _barStatsPeriod || 'all';
  _barStatsPeriod = period;

  // Fetch data once, cache it
  if (!_barStatsVouchers || _barStatsDeals < 0) {
    var grid = document.getElementById('statsGrid');
    grid.innerHTML = '<div style="color:#999;padding:20px">Laden...</div>';
    try {
      var [vr, dr] = await Promise.all([
        api({ action: 'getBarVouchers', token: s.token, bar_id: s.barId }),
        api({ action: 'getBarDeals', token: s.token, bar_id: s.barId })
      ]);
      _barStatsVouchers = (vr.success && vr.vouchers) ? vr.vouchers : [];
      _barStatsDeals = 0;
      if (dr.success && dr.deals) dr.deals.forEach(function(d) { if (d.active) _barStatsDeals++; });
    } catch(e) { _barStatsVouchers = []; _barStatsDeals = 0; }
  }

  renderBarStats(period);
}

function renderBarStats(period) {
  var cutoff = barFilterDate(period);
  var vouchers = cutoff ? _barStatsVouchers.filter(function(v) { return new Date(v.created_at) >= cutoff; }) : _barStatsVouchers;

  var sold = vouchers.length, redeemed = 0, pending = 0, paid = 0;
  vouchers.forEach(function(v) {
    if (v.status === 'redeemed') redeemed++;
    if (v.status === 'redeemed' && v.payout_status === 'pending') pending += Number(v.bar_payout) || 0;
    if (v.payout_status === 'paid') paid += Number(v.bar_payout) || 0;
  });

  var grid = document.getElementById('statsGrid');
  grid.innerHTML = '';

  // Filter buttons
  var filterDiv = document.createElement('div');
  filterDiv.style.cssText = 'display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap';
  [['day',{de:'Heute',en:'Today',it:'Oggi',fr:"Aujourd'hui"}],
   ['week',{de:'Woche',en:'Week',it:'Settimana',fr:'Semaine'}],
   ['month',{de:'Monat',en:'Month',it:'Mese',fr:'Mois'}],
   ['year',{de:'Jahr',en:'Year',it:'Anno',fr:'Année'}],
   ['all',{de:'Alle',en:'All',it:'Tutti',fr:'Tous'}]
  ].forEach(function(f) {
    var btn = document.createElement('button');
    btn.textContent = f[1][currentLang] || f[1].de;
    btn.style.cssText = (period === f[0] ? 'background:#FF3366;color:#fff;border-color:#FF3366' : 'background:#222;color:#ccc;border-color:#333') + ';border:1px solid;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600';
    btn.addEventListener('click', function() { _barStatsPeriod = f[0]; renderBarStats(f[0]); });
    filterDiv.appendChild(btn);
  });
  grid.appendChild(filterDiv);

  // Stat cards
  var cardsDiv = document.createElement('div');
  cardsDiv.className = 'stats-grid';
  [
    [t('soldCount') || 'Verkauft', sold, '#fff'],
    [t('redeemed') || 'Eingelöst', redeemed, '#22c55e'],
    [t('notRedeemed') || 'Nicht eingelöst', sold - redeemed, '#f59e0b'],
    [t('pendingPayout') || 'Gutschrift offen', pending.toFixed(2) + ' CHF', '#ef4444'],
    [t('paidOut') || 'Ausgezahlt', paid.toFixed(2) + ' CHF', '#3b82f6'],
    [t('activeDeals') || 'Aktive Deals', _barStatsDeals, '#fff'],
  ].forEach(function(s) {
    var card = document.createElement('div'); card.className = 'stat-card';
    var lEl = document.createElement('div'); lEl.className = 'stat-label'; lEl.textContent = s[0];
    var vEl = document.createElement('div'); vEl.className = 'stat-value'; vEl.textContent = String(s[1]);
    if (s[2]) vEl.style.color = s[2];
    card.append(lEl, vEl); cardsDiv.appendChild(card);
  });
  grid.appendChild(cardsDiv);
}

// ── MY DEALS ──────────────────────────────────────────────────────────────
async function loadMyDeals() {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  try {
    var r = await api({ action: 'getBarDeals', token: s.token, bar_id: s.barId });
    if (!r.success) { showToast(r.error || 'Fehler', true); return; }
    renderMyDeals(r.deals);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

function renderMyDeals(deals) {
  var el = document.getElementById('dealList');
  el.innerHTML = '';
  if (!deals.length) {
    var div = document.createElement('div');
    div.className = 'empty'; div.textContent = t('noDeals');
    el.appendChild(div); return;
  }
  deals.forEach(function(d) {
    var item = document.createElement('div');
    item.className = 'deal-item';
    if (d.image_url) {
      var thumb = document.createElement('img');
      var iUrl = d.image_url;
      if (iUrl.indexOf('lh3.googleusercontent.com/d/') >= 0) { var fid = iUrl.split('/d/')[1]; if (fid) iUrl = 'https://drive.google.com/thumbnail?id=' + fid + '&sz=w200'; }
      thumb.src = iUrl;
      thumb.style.cssText = 'width:60px;height:60px;object-fit:cover;border-radius:8px;flex-shrink:0';
      thumb.referrerPolicy = 'no-referrer';
      thumb.onerror = function() { this.style.display='none'; };
      item.appendChild(thumb);
    }
    var info = document.createElement('div');
    var title = document.createElement('div'); title.className = 'deal-item-title'; title.textContent = d.title;
    var meta  = document.createElement('div'); meta.className  = 'deal-item-meta';
    meta.textContent = Number(d.deal_price).toFixed(2) + ' CHF · ' + (d.active ? '✅ Aktiv' : '⏸ Inaktiv');
    info.append(title, meta);

    var actions = document.createElement('div');
    actions.className = 'deal-actions';

    var btnToggle = document.createElement('button');
    btnToggle.className = 'btn-sm ' + (d.active ? 'btn-orange' : 'btn-green');
    btnToggle.textContent = d.active ? t('deactivateBtn') : t('activeBtn');
    btnToggle.addEventListener('click', function() { toggleDeal(d.id, !d.active); });

    var btnEdit = document.createElement('button');
    btnEdit.className = 'btn-sm btn-blue';
    btnEdit.textContent = t('editBtn');
    btnEdit.addEventListener('click', function() { openEditModal(d); });

    var btnDel = document.createElement('button');
    btnDel.className = 'btn-sm'; btnDel.style.cssText = 'background:#2a2a2a;color:#ef4444;border:1px solid #ef4444;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px';
    btnDel.textContent = t('deleteDealBtn') || 'Löschen';
    (function(dealId) { btnDel.addEventListener('click', function() { deleteDeal(dealId); }); })(d.id);

    actions.append(btnToggle, btnEdit, btnDel);
    item.append(info, actions);
    el.appendChild(item);
  });
}

async function toggleDeal(dealId, active) {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  try {
    var r = await api({ action: 'updateDealStatus', token: s.token, deal_id: dealId, active: active });
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
    // Show current image preview if exists
    var editPreview = document.getElementById('editImagePreview');
    var editPreviewImg = document.getElementById('editImagePreviewImg');
    if (editPreview && editPreviewImg && deal.image_url) {
      var previewUrl = deal.image_url;
      if (previewUrl.indexOf('lh3.googleusercontent.com/d/') >= 0) { var pfid = previewUrl.split('/d/')[1]; if (pfid) previewUrl = 'https://drive.google.com/thumbnail?id=' + pfid + '&sz=w400'; }
      editPreviewImg.src = previewUrl; editPreviewImg.referrerPolicy = 'no-referrer'; editPreview.style.display = 'block';
    } else if (editPreview) { editPreview.style.display = 'none'; }
    // Reset file input
    var editFile = document.getElementById('editImageFile');
    if (editFile) editFile.value = '';
  document.getElementById('editActive').checked     = !!deal.active;
  document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

async function saveEditDeal() {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  var dealId = document.getElementById('editDealId').value;
  var price  = parseFloat(document.getElementById('editDealPrice').value);
  if (isNaN(price) || price <= 0) { showToast('Ungültiger Preis', true); return; }

  var payload = {
    action: 'updateDeal', token: s.token,
    deal_id: dealId,
    title:          document.getElementById('editTitle').value.trim(),
    description:    document.getElementById('editDesc').value.trim(),
    original_price: parseFloat(document.getElementById('editOrigPrice').value) || 0,
    deal_price:     price,
    max_quantity:   parseInt(document.getElementById('editQty').value) || 0,
    image_url:      document.getElementById('editImageUrl').value.trim(), // may be overridden by file upload below
    active:         document.getElementById('editActive').checked,
  };

  try {
    var _sBtn = document.getElementById('btnSaveEdit');
    if (_sBtn) { _sBtn.disabled = true; _sBtn.textContent = '\u23F3...'; }
    // Handle image file upload for edit
    var editImgFile = document.getElementById('editImageFile');
    if (editImgFile && editImgFile.files && editImgFile.files[0]) {
      var file = editImgFile.files[0];
      if (file.size <= 5*1024*1024) {
        var b64 = await new Promise(function(resolve, reject) {
          var reader = new FileReader();
          reader.onload = function() { resolve(reader.result.split(',')[1]); };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        var uR = await api({ action: 'uploadImage', token: s.token, image_data: b64, filename: file.name });
        if (uR.success) payload.image_url = uR.url;
      }
    }
    var r = await api(payload);
    if (r.success) {
      showToast('✅ ' + t('saveLbl'));
      closeEditModal();
      loadMyDeals();
    } else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// ── VOUCHERS TAB ──────────────────────────────────────────────────────────
async function loadMyVouchers() {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  try {
    var r = await api({ action: 'getBarVouchers', token: s.token, bar_id: s.barId });
    if (!r.success) { showToast(r.error || 'Fehler', true); return; }
    renderVouchers(r.vouchers);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

function renderVouchers(vouchers) {
  var tbody = document.getElementById('voucherBody');
  tbody.innerHTML = '';
  if (!vouchers.length) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.colSpan = 6; td.style.padding = '30px'; td.style.textAlign = 'center';
    td.style.color = '#555'; td.textContent = t('noVouchers');
    tr.appendChild(td); tbody.appendChild(tr); return;
  }
  var statusMap = { sent:'b-sent', issued:'b-issued', redeemed:'b-redeemed', active:'b-active' };
  vouchers.forEach(function(v) {
    var tr = document.createElement('tr');
    var badge = document.createElement('span');
    badge.className = 'badge ' + (statusMap[v.status] || 'b-inactive');
    badge.textContent = v.status;
    var statusTd = document.createElement('td'); statusTd.appendChild(badge);

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
  var td = document.createElement('td');
  td.textContent = String(val ?? '');
  return td;
}

// ── REDEEM ────────────────────────────────────────────────────────────────
async function doRedeem() {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  var code = document.getElementById('redeemCode').value.trim().toUpperCase();
  var err  = document.getElementById('redeemErr');
  var result = document.getElementById('redeemResult');
  err.textContent = ''; result.style.display = 'none';

  if (!code) { err.textContent = 'Code eingeben.'; return; }
  try {
    var r = await api({ action: 'redeemVoucher', token: s.token, code: code });
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
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  var oldPw  = document.getElementById('pwOld').value;
  var newPw  = document.getElementById('pwNew').value;
  var confPw = document.getElementById('pwConfirm').value;
  var err    = document.getElementById('pwErr');
  err.textContent = '';

  if (!oldPw || !newPw || !confPw) { err.textContent = 'Alle Felder ausfüllen.'; return; }
  if (newPw.length < 8) { err.textContent = 'Neues Passwort mind. 8 Zeichen.'; return; }
  if (newPw !== confPw) { err.textContent = 'Passwörter stimmen nicht überein.'; return; }

  try {
    var r = await api({ action: 'changePassword', token: s.token, old_password: oldPw, new_password: newPw });
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
  var isRecurring = document.querySelector('input[name="validType"]:checked').value === 'recurring';
  document.getElementById('recurringFields').style.display = isRecurring ? 'block' : 'none';
  document.getElementById('singleFields').style.display    = isRecurring ? 'none'  : 'block';
}

async function doCreateDeal() {
  var s = sessionGet();
  if (!s) { doLogout(); return; }

  var title  = document.getElementById('dealTitle').value.trim();
  var origP  = parseFloat(document.getElementById('dealOrigPrice').value) || 0;
  var price  = parseFloat(document.getElementById('dealPrice').value);
  var qty    = parseInt(document.getElementById('dealQty').value) || 0;
  var desc   = document.getElementById('dealDesc').value.trim();
  var active = document.getElementById('dealActive').checked;
  var fromT  = document.getElementById('timeFrom').value;
  var toT    = document.getElementById('timeTo').value;
  var cats   = Array.from(document.querySelectorAll('input[name="cat"]:checked')).map(function(c) { return c.value; });
  var isPauschal = cats.indexOf('pauschalgutscheine') !== -1;

  if (isPauschal) { price = 2.50; }
  if (!title)       { showToast('Titel ist Pflichtfeld', true); return; }
  if (isNaN(price)) { showToast('Deal-Preis ist Pflichtfeld', true); return; }
  if (isPauschal && (parseInt(document.getElementById('discountPercent').value)||0) < 15) { showToast('Rabatt mind. 15%', true); return; }
  if (isPauschal && (parseInt(document.getElementById('minOrder').value)||0) > 0 && (parseInt(document.getElementById('minOrder').value)||0) < 40) { showToast('Mindestbestellung mind. 40 CHF', true); return; }
  if (!cats.length) { showToast('Mind. 1 Kategorie wählen', true); return; }

  var validType  = document.querySelector('input[name="validType"]:checked').value;
  var weekdays   = Array.from(document.querySelectorAll('.wd-btn.selected')).map(function(b) { return b.textContent; });
  var singleDate = document.getElementById('singleDate').value;
  if (validType === 'single' && !singleDate) { showToast('Datum wählen', true); return; }

  try {
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

    var _cBtn = document.getElementById('btnCreateDeal');
    if (_cBtn) { _cBtn.disabled = true; _cBtn.textContent = '\u23F3 Wird erstellt...'; }
    var r = await api({
      action: 'createDeal', token: s.token,
      time_slots: Array.from(document.querySelectorAll('input[name="timeSlot"]:checked')).map(function(c){return c.value;}),
      discount_percent: isPauschal ? (parseInt(document.getElementById('discountPercent').value)||0) : 0,
      min_order: isPauschal ? (parseInt(document.getElementById('minOrder').value)||0) : 0,
      applies_to: isPauschal ? document.getElementById('appliesTo').value : '',
      bar_id: s.barId, bar_name: s.barName,
      title: title, description: desc,
      original_price: origP, deal_price: price,
      max_quantity: qty, categories: cats,
      image_url: imageUrl,
      validity_type: validType, valid_weekdays: weekdays,
      valid_from_time: fromT, valid_to_time: toT,
      valid_single_date: singleDate, active: active
    });
    if (r.success) {
      showToast('✅ Deal erstellt!');
      ['dealTitle','dealDesc','dealOrigPrice','dealPrice','dealImageUrl','singleDate','timeFrom','timeTo']
        .forEach(function(id) { document.getElementById(id).value = ''; });
      var imgEl = document.getElementById('dealImageFile'); if(imgEl) imgEl.value = '';
      var pvEl = document.getElementById('imagePreview'); if(pvEl) pvEl.style.display = 'none';
      document.querySelectorAll('input[name="timeSlot"]').forEach(function(c){c.checked=false;});
      var pf = document.getElementById('pauschalFields'); if(pf) pf.style.display = 'none';
      document.querySelectorAll('input[name="cat"]').forEach(function(c) { c.checked = false; });
      document.querySelectorAll('.wd-btn').forEach(function(b) { b.classList.remove('selected'); });
      document.getElementById('dealQty').value = '0';
    } else showToast(r.error || 'Fehler', true);
    if (_cBtn) { _cBtn.disabled = false; _cBtn.textContent = t('createDeal') || 'Deal erstellen'; }
  } catch (e) {
    showToast('Verbindungsfehler', true);
    var _rb = document.getElementById('btnCreateDeal');
    if (_rb) { _rb.disabled = false; _rb.textContent = t('createDeal') || 'Deal erstellen'; }
  }
}

// ── TAB SWITCHING ─────────────────────────────────────────────────────────
function switchAuthTab(name, btn) {
  document.getElementById('loginForm').classList.toggle('active', name === 'login');
  document.getElementById('registerForm').classList.toggle('active', name === 'register');
  document.querySelectorAll('[data-auth-tab]').forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
}

var TAB_IDS = {
  overview:'dashOverview', newdeal:'dashNewdeal', mydeals:'dashMydeals',
  vouchers:'dashVouchers', redeem:'dashRedeem', settings:'dashSettings'
};
var TAB_LOADERS = {
  overview: loadBarStats, mydeals: loadMyDeals, settings: loadProfile,
  vouchers: loadMyVouchers, redeem: function() {}
};

function switchDashTab(name, btn) {
  Object.values(TAB_IDS).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  var target = document.getElementById(TAB_IDS[name]);
  if (target) target.classList.add('active');
  document.querySelectorAll('#barDashboard .tab').forEach(function(t) { t.classList.remove('active'); });
  btn.classList.add('active');
  if (TAB_LOADERS[name]) TAB_LOADERS[name]();
}

// ── API / TOAST ───────────────────────────────────────────────────────────
async function api(body) {
  var r = await fetch(BACKEND_URL, { method: 'POST', body: JSON.stringify(body) });
  return r.json();
}

var _toastTimer = null;
function showToast(msg, isError) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + (isError ? 'toast-err' : 'toast-ok');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { el.classList.remove('show'); }, 3500);
}

// ── PASSWORD RESET ────────────────────────────────────────────────────────
async function sendBarResetCode() {
  var email = document.getElementById('barResetEmail').value.trim();
  if (!email) { showToast('Bitte Email eingeben', true); return; }
  try {
    var r = await api({ action: 'requestPasswordReset', email: email, role: 'bar' });
    if (r.success) {
      showToast(r.message || 'Code gesendet!');
      document.getElementById('barResetStep1').style.display = 'none';
      document.getElementById('barResetStep2').style.display = 'block';
    } else {
      showToast(r.error || 'Fehler', true);
    }
  } catch (e) { showToast('Verbindungsfehler', true); }
}

async function resetBarPassword() {
  var email = document.getElementById('barResetEmail').value.trim();
  var code = document.getElementById('barResetCode').value.trim();
  var newPassword = document.getElementById('barResetNewPassword').value;
  if (!code || !newPassword) { showToast('Alle Felder ausfüllen', true); return; }
  if (newPassword.length < 8) { showToast('Passwort mind. 8 Zeichen', true); return; }
  try {
    var r = await api({ action: 'resetPassword', email: email, code: code, new_password: newPassword, role: 'bar' });
    if (r.success) {
      showToast('✅ Passwort geändert!');
      closeBarResetModal();
      document.getElementById('barResetEmail').value = '';
      document.getElementById('barResetCode').value = '';
      document.getElementById('barResetNewPassword').value = '';
      document.getElementById('barResetStep1').style.display = 'block';
      document.getElementById('barResetStep2').style.display = 'none';
    } else { showToast(r.error || 'Fehler', true); }
  } catch (e) { showToast('Verbindungsfehler', true); }
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

// ── AUTO-LOGIN ON LOAD ────────────────────────────────────────────────────
window.addEventListener('load', function() {
  var s = sessionGet();
  if (s) {
    showAuthScreen(false);
    // Restore bar name display and logout button
    var el = document.getElementById('barNameDisplay');
    if (el) el.textContent = s.barName || '';
    var logBtn = document.getElementById('btnLogout');
    if (logBtn) logBtn.style.display = 'block';
    loadBarStats();
  } else {
    showAuthScreen(true);
  }
  // Apply language on load
  var savedLang = localStorage.getItem('barsclusive_bar_lang') || 'de';
  setLang(savedLang);
});


// ── PROFILE ───────────────────────────────────────────────────────────────
async function loadProfile() {
  var s = sessionGet();
  if (!s) return;
  try {
    var r = await api({ action: 'getBarProfile', token: s.token });
    if (!r.success || !r.profile) return;
    var b = r.profile;
    var el = function(id) { return document.getElementById(id); };
    if (el('profAddress')) el('profAddress').value = b.address || '';
    if (el('profZip')) el('profZip').value = b.zip || '';
    if (el('profCity')) el('profCity').value = b.city || '';
    if (el('profPhone')) el('profPhone').value = b.phone || '';
    if (el('profIban')) el('profIban').value = b.iban || '';
    if (el('profTwint')) el('profTwint').value = b.twint || '';
  } catch(e) {}
}

async function saveProfile() {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  var payload = {
    action: 'updateBarProfile',
    token: s.token,
    address: document.getElementById('profAddress').value.trim(),
    zip: document.getElementById('profZip').value.trim(),
    city: document.getElementById('profCity').value.trim(),
    phone: document.getElementById('profPhone').value.trim(),
    iban: document.getElementById('profIban').value.trim(),
    twint: document.getElementById('profTwint').value.trim()
  };
  try {
    var r = await api(payload);
    if (r.success) showToast(t('profileSaved') || 'Gespeichert');
    else showToast(r.error || 'Fehler', true);
  } catch(e) { showToast('Verbindungsfehler', true); }
}

async function deleteBarAccount() {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  var msg = currentLang === 'de' ? 'Account wirklich löschen? Alle Deals werden deaktiviert. Diese Aktion ist endgültig!' :
            currentLang === 'en' ? 'Really delete your account? All deals will be deactivated. This action is permanent!' :
            currentLang === 'it' ? 'Eliminare davvero il tuo account? Tutti i deal saranno disattivati. Questa azione è definitiva!' :
            'Vraiment supprimer votre compte ? Tous les deals seront désactivés. Cette action est définitive !';
  if (!confirm(msg)) return;
  if (!confirm(currentLang === 'de' ? 'Bist du GANZ sicher?' : 'Are you REALLY sure?')) return;
  try {
    var r = await api({ action: 'deleteBarAccount', token: s.token });
    if (r.success) {
      showToast('Account gelöscht');
      setTimeout(function() { doLogout(); }, 1500);
    } else showToast(r.error || 'Fehler', true);
  } catch(e) { showToast('Verbindungsfehler', true); }
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Language
  var langDE = document.getElementById('langDE');
  var langEN = document.getElementById('langEN');
  var langIT = document.getElementById('langIT');
  var langFR = document.getElementById('langFR');
  if (langDE) langDE.addEventListener('click', function() { setLang('de'); });
  if (langEN) langEN.addEventListener('click', function() { setLang('en'); });
  if (langIT) langIT.addEventListener('click', function() { setLang('it'); });
  if (langFR) langFR.addEventListener('click', function() { setLang('fr'); });

  // Logout
  document.querySelectorAll('.btn-logout').forEach(function(b) { b.addEventListener('click', doLogout); });

  // Auth tabs
  document.querySelectorAll('[data-auth-tab]').forEach(function(btn) {
    btn.addEventListener('click', function() { switchAuthTab(this.dataset.authTab, this); });
  });

  // Login / Register
  var btnBarLogin    = document.getElementById('btnBarLogin');
  var btnBarRegister = document.getElementById('btnBarRegister');
  if (btnBarLogin)    btnBarLogin.addEventListener('click', doBarLogin);
  if (btnBarRegister) btnBarRegister.addEventListener('click', doBarRegister);

  // Enter key on password
  var loginPw = document.getElementById('loginPassword');
  if (loginPw) loginPw.addEventListener('keydown', function(e) { if (e.key === 'Enter') doBarLogin(); });

  // Dashboard tabs
  document.querySelectorAll('[data-dash-tab]').forEach(function(btn) {
    btn.addEventListener('click', function() { switchDashTab(this.dataset.dashTab, this); });
  });

  // Weekday toggles
  document.querySelectorAll('[data-weekday]').forEach(function(div) {
    div.addEventListener('click', function() { this.classList.toggle('selected'); });
  });

  // Validity toggle
  document.querySelectorAll('input[name="validType"]').forEach(function(radio) {
    radio.addEventListener('change', toggleValidity);
  });

  // Create deal
  var btnCreateDeal = document.getElementById('btnCreateDeal');
  if (btnCreateDeal) btnCreateDeal.addEventListener('click', doCreateDeal);

  // Redeem
  var btnRedeem = document.getElementById('btnRedeem');
  if (btnRedeem) btnRedeem.addEventListener('click', doRedeem);
  var redeemCode = document.getElementById('redeemCode');
  if (redeemCode) redeemCode.addEventListener('keydown', function(e) { if (e.key === 'Enter') doRedeem(); });

  // Change password
  var btnChangePw = document.getElementById('btnChangePassword');
  if (btnChangePw) btnChangePw.addEventListener('click', doChangePassword);

  // Profile save + delete account
  var btnSavePr = document.getElementById('btnSaveProfile');
  if (btnSavePr) btnSavePr.addEventListener('click', saveProfile);
  var btnDelAcc = document.getElementById('btnDeleteAccount');
  if (btnDelAcc) btnDelAcc.addEventListener('click', deleteBarAccount);

  // Edit modal
  var btnCloseEdit  = document.getElementById('btnCloseEditModal');
  var btnCancelEdit = document.getElementById('btnCancelEdit');
  var btnSaveEdit   = document.getElementById('btnSaveEdit');
  if (btnCloseEdit)  btnCloseEdit.addEventListener('click', closeEditModal);
  if (btnCancelEdit) btnCancelEdit.addEventListener('click', closeEditModal);
  if (btnSaveEdit)   btnSaveEdit.addEventListener('click', saveEditDeal);

  // Close modal on backdrop click
  var editModal = document.getElementById('editModal');
  if (editModal) editModal.addEventListener('click', function(e) { if (e.target === this) closeEditModal(); });

  // Password reset
  var linkBarForgotPassword = document.getElementById('linkBarForgotPassword');
  if (linkBarForgotPassword) linkBarForgotPassword.addEventListener('click', openBarResetPasswordModal);
  var btnBarSendResetCode = document.getElementById('btnBarSendResetCode');
  if (btnBarSendResetCode) btnBarSendResetCode.addEventListener('click', sendBarResetCode);
  var btnBarResetPassword = document.getElementById('btnBarResetPassword');
  if (btnBarResetPassword) btnBarResetPassword.addEventListener('click', resetBarPassword);
  var btnBarBackToStep1 = document.getElementById('btnBarBackToStep1');
  if (btnBarBackToStep1) btnBarBackToStep1.addEventListener('click', barBackToResetStep1);
  var btnCloseBarResetModal = document.getElementById('btnCloseBarResetModal');
  if (btnCloseBarResetModal) btnCloseBarResetModal.addEventListener('click', closeBarResetModal);
  var btnBarCancelReset1 = document.getElementById('btnBarCancelReset1');
  if (btnBarCancelReset1) btnBarCancelReset1.addEventListener('click', closeBarResetModal);

  // Bar reset modal backdrop click
  var barResetModal = document.getElementById('barResetPasswordModal');
  if (barResetModal) barResetModal.addEventListener('click', function(e) { if (e.target === this) closeBarResetModal(); });
});

// ── IMAGE UPLOAD PREVIEW ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  var imgFile = document.getElementById('dealImageFile');
  if (imgFile) {
    imgFile.addEventListener('change', function() {
      var preview = document.getElementById('imagePreview');
      var img = document.getElementById('imagePreviewImg');
      if (this.files.length > 0) {
        var file = this.files[0];
        if (file.size > 5*1024*1024) { showToast('Bild max. 5 MB', true); this.value=''; return; }
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
