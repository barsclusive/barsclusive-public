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
  barLogin:'Bar Login', email:'Email *', password:'Passwort',
  loginBtn:'Einloggen', registerBar:'Bar registrieren',
  barName:'Bar-Name *', city:'Stadt *', address:'Adresse *', phone:'Telefon',
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
  changePassword:'Passwort ändern', oldPassword:'Altes Passwort', profileTitle:'Stammdaten', addressLbl:'Adresse', zipLbl:'PLZ', cityLbl:'Stadt', phoneLbl:'Telefon', ibanLbl:'IBAN', twintLbl:'Twint', saveProfile:'Speichern', profileSaved:'Profil gespeichert', deleteAccountTitle:'Account löschen', deleteAccountWarning:'Alle Deals werden deaktiviert. Diese Aktion ist endgültig.', deleteAccountBtn:'Account endgültig löschen', soldCount:'Verkauft', notRedeemed:'Nicht eingelöst', paidOut:'Ausgezahlt', activeDeals:'Aktive Deals', earnings:'Einnahmen', redeemed:'Eingelöst', pendingPayout:'Ausstehend', deleteDealBtn:'Deal löschen', deleteDealConfirm:'Deal endgültig löschen?', shop:'Shop', aboutUs:'Über uns', howItWorks:'So funktionierts', legalNotice:'Impressum', privacy:'Datenschutz', termsBars:'AGB Bars', contact:'Kontakt',
  newPasswordLbl:'Neues Passwort (mind. 8 Zeichen)', confirmPassword:'Passwort bestätigen',
  changePasswordBtn:'Passwort ändern', editDeal:'Deal bearbeiten',
  saveLbl:'Speichern', cancelLbl:'Abbrechen',
  activeBtn:'Aktivieren', deactivateBtn:'Deaktivieren', editBtn:'Bearbeiten',
  noDeals:'Noch keine Deals. Erstelle deinen ersten Deal!',
  noVouchers:'Noch keine Gutscheine.',
  soldCount:'verkauft',
  resetPasswordTitle:'Passwort zurücksetzen',
  newPassword:'Neues Passwort',
  portalTitle:'Bar-Portal', forgotPw:'Passwort vergessen?', resetInfo1:'Gib deine Email-Adresse ein. Wir senden dir einen 6-stelligen Code.', resetInfo2:'Gib den 6-stelligen Code aus deiner Email ein und wähle ein neues Passwort.', sendCode:'Code senden', backBtn:'Zurück', code6:'Code (6-stellig)',
  regAddressHelp:'Bitte die Adresse aus der Vorschlagsliste wählen. Adresse, PLZ, Ort und Koordinaten werden automatisch übernommen.',
  addressNotSelected:'Noch keine Adresse gewählt',
  checkMapSelection:'Auswahl auf Karte prüfen',
  confirmPasswordReq:'Passwort bestätigen *',
  ibanPayoutLabel:'IBAN * (für Auszahlungen)',
  ibanHelp:'Nur gültige IBAN-Zeichen. Die Eingabe wird automatisch formatiert.',
  mwstLabel:'MWST',
  notMwstLiable:'Ich bin nicht MWST-pflichtig',
  mwstNumberReq:'MWST-Nummer *',
  mwstHelp:'Die UID wird automatisch formatiert. Beispiel: CHE-123.456.789 MWST',
  acceptTerms:'Ich akzeptiere die',
  profileAddressHelp:'Adresse aus der Vorschlagsliste wählen. Die Koordinaten für Karte und Distanz werden automatisch übernommen.',
  locationLabel:'Standort',
  locationHelp:'Wird aus der gewählten Adresse übernommen und kann auf der Karte feinjustiert werden.',
  zipReq:'PLZ *',
  mwstNumberLabel:'MWST-Nummer'
},
en: {
  logout:'Logout', login:'Login', register:'Register',
  barLogin:'Bar Login', email:'Email *', password:'Password',
  loginBtn:'Login', registerBar:'Register Bar',
  barName:'Bar Name *', city:'City *', address:'Address *', phone:'Phone',
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
  portalTitle:'Bar Portal', forgotPw:'Forgot password?', resetInfo1:'Enter your email address. We will send you a 6-digit code.', resetInfo2:'Enter the 6-digit code from your email and choose a new password.', sendCode:'Send code', backBtn:'Back', code6:'Code (6 digits)',
  regAddressHelp:'Please choose the address from the suggestion list. Address, ZIP, city and coordinates are filled automatically.',
  addressNotSelected:'No address selected yet',
  checkMapSelection:'Check selection on map',
  confirmPasswordReq:'Confirm password *',
  ibanPayoutLabel:'IBAN * (for payouts)',
  ibanHelp:'Only valid IBAN characters are allowed. Input is formatted automatically.',
  mwstLabel:'VAT',
  notMwstLiable:'I am not liable for VAT',
  mwstNumberReq:'VAT number *',
  mwstHelp:'The UID is formatted automatically. Example: CHE-123.456.789 VAT',
  acceptTerms:'I accept the',
  profileAddressHelp:'Choose the address from the suggestion list. Coordinates for map and distance are filled automatically.',
  locationLabel:'Location',
  locationHelp:'Taken from the selected address and can be fine-tuned on the map.',
  zipReq:'ZIP *',
  mwstNumberLabel:'VAT number'
},
it: {
  logout:'Esci', login:'Login', register:'Registrati',
  barLogin:'Login Bar', email:'Email *', password:'Password',
  loginBtn:'Accedi', registerBar:'Registra Bar',
  barName:'Nome Bar *', city:'Città *', address:'Indirizzo *', phone:'Telefono',
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
  portalTitle:'Portale Bar', forgotPw:'Password dimenticata?', resetInfo1:'Inserisci la tua email. Ti invieremo un codice di 6 cifre.', resetInfo2:'Inserisci il codice di 6 cifre ricevuto via email e scegli una nuova password.', sendCode:'Invia codice', backBtn:'Indietro', code6:'Codice (6 cifre)',
  regAddressHelp:'Seleziona l’indirizzo dalla lista dei suggerimenti. Indirizzo, CAP, città e coordinate vengono compilati automaticamente.',
  addressNotSelected:'Nessun indirizzo selezionato',
  checkMapSelection:'Controlla la selezione sulla mappa',
  confirmPasswordReq:'Conferma password *',
  ibanPayoutLabel:'IBAN * (per i pagamenti)',
  ibanHelp:'Sono ammessi solo caratteri IBAN validi. L’inserimento viene formattato automaticamente.',
  mwstLabel:'IVA',
  notMwstLiable:'Non sono soggetto a IVA',
  mwstNumberReq:'Numero IVA *',
  mwstHelp:'L’UID viene formattato automaticamente. Esempio: CHE-123.456.789 IVA',
  acceptTerms:'Accetto i',
  profileAddressHelp:'Seleziona l’indirizzo dalla lista dei suggerimenti. Le coordinate per mappa e distanza vengono compilate automaticamente.',
  locationLabel:'Posizione',
  locationHelp:'Viene presa dall’indirizzo selezionato e può essere corretta sulla mappa.',
  zipReq:'CAP *',
  mwstNumberLabel:'Numero IVA'
},
fr: {
  logout:'Déconnexion', login:'Connexion', register:'Inscription',
  barLogin:'Connexion Bar', email:'Email *', password:'Mot de passe',
  loginBtn:'Se connecter', registerBar:'Inscrire Bar',
  barName:'Nom du Bar *', city:'Ville *', address:'Adresse *', phone:'Téléphone',
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
  changePassword:'Changer le mot de passe', oldPassword:'Ancien mot de passe', profileTitle:'Coordonnées', addressLbl:'Adresse', zipLbl:'NPA', cityLbl:'Ville', phoneLbl:'Téléphone', ibanLbl:'IBAN', twintLbl:'Twint', saveProfile:'Enregistrer', profileSaved:'Profil enregistré', deleteAccountTitle:'Supprimer le compte', deleteAccountWarning:'Tous les deals seront désactivés. Cette action est définitive.', deleteAccountBtn:'Supprimer le compte définitivement', soldCount:'Vendus', notRedeemed:'Non utilisés', paidOut:'Payé', activeDeals:'Offres actives', earnings:'Revenus', redeemed:'Utilisés', pendingPayout:'En attente', deleteDealBtn:'Supprimer', deleteDealConfirm:'Supprimer définitivement cette offre ?', shop:'Shop', aboutUs:'À propos', howItWorks:'Comment ça marche', legalNotice:'Mentions légales', privacy:'Confidentialité', termsBars:'CGV Bars', contact:'Contact',
  newPasswordLbl:'Nouveau mot de passe (min. 8 car.)', confirmPassword:'Confirmer',
  changePasswordBtn:'Changer', editDeal:'Modifier Deal',
  saveLbl:'Enregistrer', cancelLbl:'Annuler',
  activeBtn:'Activer', deactivateBtn:'Désactiver', editBtn:'Modifier',
  noDeals:'Aucun deal. Créez votre premier deal!',
  noVouchers:'Aucun bon.',
  soldCount:'vendus',
  resetPasswordTitle:'Réinitialiser le mot de passe',
  newPassword:'Nouveau mot de passe',
  portalTitle:'Portail Bar', forgotPw:'Mot de passe oublié ?', resetInfo1:'Saisissez votre adresse email. Nous vous enverrons un code à 6 chiffres.', resetInfo2:'Saisissez le code à 6 chiffres reçu par email puis choisissez un nouveau mot de passe.', sendCode:'Envoyer le code', backBtn:'Retour', code6:'Code (6 chiffres)',
  regAddressHelp:'Veuillez choisir l’adresse dans la liste des suggestions. L’adresse, le NPA, la ville et les coordonnées sont remplis automatiquement.',
  addressNotSelected:'Aucune adresse sélectionnée',
  checkMapSelection:'Vérifier la sélection sur la carte',
  confirmPasswordReq:'Confirmer le mot de passe *',
  ibanPayoutLabel:'IBAN * (pour les paiements)',
  ibanHelp:'Seuls les caractères IBAN valides sont autorisés. La saisie est formatée automatiquement.',
  mwstLabel:'TVA',
  notMwstLiable:'Je ne suis pas assujetti à la TVA',
  mwstNumberReq:'Numéro TVA *',
  mwstHelp:'L’UID est formaté automatiquement. Exemple : CHE-123.456.789 TVA',
  acceptTerms:'J’accepte les',
  profileAddressHelp:'Choisissez l’adresse dans la liste des suggestions. Les coordonnées pour la carte et la distance sont remplies automatiquement.',
  locationLabel:'Emplacement',
  locationHelp:'Repris depuis l’adresse choisie et peut être ajusté sur la carte.',
  zipReq:'NPA *',
  mwstNumberLabel:'Numéro TVA'
}
};

let currentLang = 'de';
function t(key) { return TRANSLATIONS[currentLang][key] || TRANSLATIONS.de[key] || key; }

function normText(v) { return String(v || '').trim(); }
function onlyAlphaNum(v) { return String(v || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase(); }
function onlyDigits(v) { return String(v || '').replace(/\D/g, ''); }
function formatIbanDisplay(v) {
  var raw = onlyAlphaNum(v).slice(0, 34);
  return raw.replace(/(.{4})/g, '$1 ').trim();
}
function ibanToNumeric(iban) {
  var moved = iban.slice(4) + iban.slice(0, 4);
  var out = '';
  for (var i = 0; i < moved.length; i++) {
    var ch = moved.charCodeAt(i);
    if (ch >= 48 && ch <= 57) out += moved[i];
    else if (ch >= 65 && ch <= 90) out += String(ch - 55);
    else return '';
  }
  return out;
}
function mod97(numStr) {
  var rem = 0;
  for (var i = 0; i < numStr.length; i += 7) {
    rem = Number(String(rem) + numStr.substring(i, i + 7)) % 97;
  }
  return rem;
}
function isValidIban(v) {
  var raw = onlyAlphaNum(v);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(raw)) return false;
  var numeric = ibanToNumeric(raw);
  return numeric && mod97(numeric) === 1;
}
function normalizeIban(v) { return formatIbanDisplay(v); }

function formatMwstDisplay(v) {
  var up = String(v || '').toUpperCase().replace(/\s+/g, ' ').trim();
  var suffix = /(?:MWST|TVA|IVA)$/.test(up) ? up.match(/(MWST|TVA|IVA)$/)[1] : (currentLang === 'fr' ? 'TVA' : currentLang === 'it' ? 'IVA' : 'MWST');
  var digits = onlyDigits(up).slice(0, 9);
  if (!digits) return '';
  var parts = [];
  if (digits.slice(0,3)) parts.push(digits.slice(0,3));
  if (digits.slice(3,6)) parts.push(digits.slice(3,6));
  if (digits.slice(6,9)) parts.push(digits.slice(6,9));
  var base = 'CHE-' + parts.join('.');
  if (digits.length === 9) base += ' ' + suffix;
  return base;
}
function normalizeMwst(v) { return formatMwstDisplay(v); }
function isValidMwst(v) { return /^CHE-\d{3}\.\d{3}\.\d{3} (MWST|TVA|IVA)$/.test(formatMwstDisplay(v)); }

function setMaskedInputValue(id, value, formatter) {
  var el = document.getElementById(id);
  if (!el) return;
  el.value = formatter ? formatter(value) : String(value || '');
}
function bindMaskedInput(id, formatter) {
  var el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', function() {
    var start = this.selectionStart || 0;
    var before = this.value.length;
    this.value = formatter(this.value);
    var after = this.value.length;
    try { this.setSelectionRange(start + (after - before), start + (after - before)); } catch(e) {}
  });
  el.addEventListener('blur', function() { this.value = formatter(this.value); });
}
function updateMwstVisibility(prefix) {
  var cb = document.getElementById(prefix + 'NoMwst');
  var group = document.getElementById(prefix + 'MwstNumGroup');
  var input = document.getElementById(prefix + 'MwstNumber');
  var liable = !(cb && cb.checked);
  if (group) group.style.display = liable ? 'block' : 'none';
  if (input) {
    input.required = liable;
    if (!liable) input.value = '';
  }
}
function parseSelectedAddress(prefix) {
  return {
    address: normText((document.getElementById(prefix + 'Address') || {}).value),
    city: normText((document.getElementById(prefix + 'City') || {}).value),
    zip: normText((document.getElementById(prefix + 'Zip') || document.getElementById(prefix + 'ZipVisible') || {}).value),
    latitude: normText((document.getElementById(prefix + 'Lat') || {}).value),
    longitude: normText((document.getElementById(prefix + 'Lng') || {}).value)
  };
}
function setAddressMeta(prefix, text) {
  var el = document.getElementById(prefix + 'AddressMeta');
  if (el) el.textContent = text || t('addressNotSelected');
}
function setSelectedAddress(prefix, place) {
  var sInput = document.getElementById(prefix + 'AddressSearch');
  var aInput = document.getElementById(prefix + 'Address');
  var zipEl = document.getElementById(prefix + 'Zip');
  var zipVisibleEl = document.getElementById(prefix + 'ZipVisible');
  var cityEl = document.getElementById(prefix + 'City');
  var latEl = document.getElementById(prefix + 'Lat');
  var lngEl = document.getElementById(prefix + 'Lng');
  if (sInput) sInput.value = place.label || '';
  if (aInput) aInput.value = place.address || '';
  if (zipEl) zipEl.value = place.zip || '';
  if (zipVisibleEl) zipVisibleEl.value = place.zip || '';
  if (cityEl) cityEl.value = place.city || '';
  if (latEl) latEl.value = place.latitude || '';
  if (lngEl) lngEl.value = place.longitude || '';
  if (sInput) sInput.dataset.selected = '1';
  setAddressMeta(prefix, [place.address, place.zip, place.city].filter(Boolean).join(', '));
}
function clearSelectedAddress(prefix, keepSearch) {
  var sInput = document.getElementById(prefix + 'AddressSearch');
  if (sInput && !keepSearch) sInput.value = '';
  if (sInput) sInput.dataset.selected = '';
  ['Address','Zip','City','Lat','Lng'].forEach(function(suffix) {
    var el = document.getElementById(prefix + suffix);
    if (el) el.value = '';
  });
  var zv = document.getElementById(prefix + 'ZipVisible');
  if (zv) zv.value = '';
  setAddressMeta(prefix, t('addressNotSelected'));
}
function extractAddressParts(item) {
  var a = item.address || {};
  return {
    address: item.display_name ? item.display_name.split(',').slice(0,2).join(',').trim() : [a.road, a.house_number].filter(Boolean).join(' '),
    zip: a.postcode || '',
    city: a.city || a.town || a.village || a.hamlet || a.municipality || '',
    latitude: item.lat ? Number(item.lat).toFixed(6) : '',
    longitude: item.lon ? Number(item.lon).toFixed(6) : '',
    label: item.display_name || ''
  };
}
var _addrDebounce = null;
function bindAddressAutocomplete(prefix) {
  var input = document.getElementById(prefix + 'AddressSearch');
  var box = document.getElementById(prefix + 'AddressSuggestions');
  if (!input || !box) return;
  var currentIndex = -1;
  var results = [];

  function render() {
    if (!results.length) {
      box.style.display = 'none';
      box.innerHTML = '';
      return;
    }
    box.innerHTML = results.map(function(item, idx) {
      var p = extractAddressParts(item);
      return '<div class="suggestion-item' + (idx === currentIndex ? ' active' : '') + '" data-idx="' + idx + '">' +
        '<div class="suggestion-title">' + escapeHtml(p.address || p.label) + '</div>' +
        '<div class="suggestion-meta">' + escapeHtml([p.zip, p.city].filter(Boolean).join(' ')) + '</div>' +
      '</div>';
    }).join('');
    box.style.display = 'block';
    Array.from(box.querySelectorAll('.suggestion-item')).forEach(function(el) {
      el.addEventListener('click', function() {
        var idx = Number(this.dataset.idx);
        var p = extractAddressParts(results[idx]);
        setSelectedAddress(prefix, p);
        box.style.display = 'none';
      });
    });
  }

  input.addEventListener('input', function() {
    clearSelectedAddress(prefix, true);
    var q = this.value.trim();
    if (_addrDebounce) clearTimeout(_addrDebounce);
    if (q.length < 3) {
      results = [];
      render();
      return;
    }
    _addrDebounce = setTimeout(async function() {
      try {
        var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=ch&q=' + encodeURIComponent(q);
        var resp = await fetch(url, { headers: { 'Accept-Language': 'de,en,it,fr' } });
        results = await resp.json();
        currentIndex = -1;
        render();
      } catch (e) {
        results = [];
        render();
      }
    }, 280);
  });

  input.addEventListener('keydown', function(e) {
    if (!results.length || box.style.display === 'none') return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = Math.min(currentIndex + 1, results.length - 1);
      render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = Math.max(currentIndex - 1, 0);
      render();
    } else if (e.key === 'Enter') {
      if (currentIndex >= 0 && results[currentIndex]) {
        e.preventDefault();
        var p = extractAddressParts(results[currentIndex]);
        setSelectedAddress(prefix, p);
        box.style.display = 'none';
      }
    } else if (e.key === 'Escape') {
      box.style.display = 'none';
    }
  });

  document.addEventListener('click', function(e) {
    if (!box.contains(e.target) && e.target !== input) {
      box.style.display = 'none';
    }
  });
}
function escapeHtml(v) {
  return String(v || '').replace(/[&<>"']/g, function(ch) {
    return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[ch];
  });
}

// =============================================
// SESSION & STATE
// =============================================
const SESSION_KEY = 'barsclusive_bar_session';
const _dataCache = {
  stats: null,
  deals: null,
  vouchers: null,
  profile: null,
  statsLoading: false,
  dealsLoading: false,
  vouchersLoading: false,
  profileLoading: false
};

function sessionGet() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
}
function sessionSet(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}
function sessionClear() {
  localStorage.removeItem(SESSION_KEY);
  _dataCache.stats = null;
  _dataCache.deals = null;
  _dataCache.vouchers = null;
  _dataCache.profile = null;
}

// =============================================
// I18N APPLY
// =============================================
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('barsclusive_bar_lang', lang);

  document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.remove('active'); });
  var activeBtn = document.getElementById('lang' + lang.toUpperCase());
  if (activeBtn) activeBtn.classList.add('active');

  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.dataset.i18n;
    var txt = t(key);
    if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
      if (key === 'password' || key === 'email' || key === 'barName' || key === 'city' || key === 'address' || key === 'phone') {
        el.placeholder = txt.replace(/\s*\*$/, '');
      } else if (key === 'dealTitleLbl' || key === 'dealDescLbl') {
        el.placeholder = txt.replace(/\s*\*$/, '');
      } else {
        if (el.type !== 'checkbox' && el.type !== 'radio') el.value = txt;
      }
    } else {
      el.textContent = txt;
    }
  });

  var regAddressSearch = document.getElementById('regAddressSearch');
  if (regAddressSearch) regAddressSearch.placeholder = {
    de:'Adresse suchen und auswählen',
    en:'Search and select an address',
    it:'Cerca e seleziona un indirizzo',
    fr:'Rechercher et sélectionner une adresse'
  }[lang];

  var profAddressSearch = document.getElementById('profAddressSearch');
  if (profAddressSearch) profAddressSearch.placeholder = {
    de:'Adresse suchen und auswählen',
    en:'Search and select an address',
    it:'Cerca e seleziona un indirizzo',
    fr:'Rechercher et sélectionner une adresse'
  }[lang];

  var loginEmail = document.getElementById('loginEmail');
  if (loginEmail) loginEmail.placeholder = {
    de:'Email',
    en:'Email',
    it:'Email',
    fr:'Email'
  }[lang];

  var loginPassword = document.getElementById('loginPassword');
  if (loginPassword) loginPassword.placeholder = {
    de:'Passwort',
    en:'Password',
    it:'Password',
    fr:'Mot de passe'
  }[lang];

  var redeemCode = document.getElementById('redeemCode');
  if (redeemCode) redeemCode.placeholder = {
    de:'XXXX-XXXX-XXXX',
    en:'XXXX-XXXX-XXXX',
    it:'XXXX-XXXX-XXXX',
    fr:'XXXX-XXXX-XXXX'
  }[lang];

  var regZipVisible = document.getElementById('regZipVisible');
  if (regZipVisible) regZipVisible.placeholder = {
    de:'wird automatisch gefüllt',
    en:'filled automatically',
    it:'compilato automaticamente',
    fr:'rempli automatiquement'
  }[lang];

  var regCity = document.getElementById('regCity');
  if (regCity) regCity.placeholder = {
    de:'wird automatisch gefüllt',
    en:'filled automatically',
    it:'compilata automaticamente',
    fr:'remplie automatiquement'
  }[lang];

  var pwOld = document.getElementById('pwOld');
  if (pwOld) pwOld.placeholder = {
    de:'Aktuelles Passwort',
    en:'Current password',
    it:'Password attuale',
    fr:'Mot de passe actuel'
  }[lang];

  var pwNew = document.getElementById('pwNew');
  if (pwNew) pwNew.placeholder = {
    de:'Neues Passwort',
    en:'New password',
    it:'Nuova password',
    fr:'Nouveau mot de passe'
  }[lang];

  var pwConfirm = document.getElementById('pwConfirm');
  if (pwConfirm) pwConfirm.placeholder = {
    de:'Passwort wiederholen',
    en:'Repeat password',
    it:'Ripeti password',
    fr:'Répéter le mot de passe'
  }[lang];

  var barResetEmail = document.getElementById('barResetEmail');
  if (barResetEmail) barResetEmail.placeholder = {
    de:'deine@email.ch',
    en:'your@email.com',
    it:'tua@email.com',
    fr:'votre@email.com'
  }[lang];

  var barResetCode = document.getElementById('barResetCode');
  if (barResetCode) barResetCode.placeholder = {
    de:'123456',
    en:'123456',
    it:'123456',
    fr:'123456'
  }[lang];

  var barResetNewPassword = document.getElementById('barResetNewPassword');
  if (barResetNewPassword) barResetNewPassword.placeholder = {
    de:'Neues Passwort',
    en:'New password',
    it:'Nuova password',
    fr:'Nouveau mot de passe'
  }[lang];

  setMaskedInputValue('regIban', (document.getElementById('regIban') || {}).value || '', formatIbanDisplay);
  setMaskedInputValue('profIban', (document.getElementById('profIban') || {}).value || '', formatIbanDisplay);
  setMaskedInputValue('regMwstNumber', (document.getElementById('regMwstNumber') || {}).value || '', formatMwstDisplay);
  setMaskedInputValue('profMwstNumber', (document.getElementById('profMwstNumber') || {}).value || '', formatMwstDisplay);

  var s = sessionGet();
  if (s) {
    if (_dataCache.stats) renderBarStats(_dataCache.stats);
    if (_dataCache.deals) renderMyDeals(_dataCache.deals);
    if (_dataCache.vouchers) renderMyVouchers(_dataCache.vouchers);
  }
}

// =============================================
// SCREEN TOGGLES
// =============================================
function showAuthScreen(show) {
  document.getElementById('loginScreen').style.display = show ? 'block' : 'none';
  document.getElementById('barDashboard').style.display = show ? 'none' : 'block';
}

function doLogout() {
  sessionClear();
  showAuthScreen(true);
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginErr').textContent = '';
  document.getElementById('btnLogout').style.display = 'none';
}

// =============================================
// LOGIN / REGISTER
// =============================================
async function doBarLogin() {
  const email = normText(document.getElementById('loginEmail').value).toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginErr');
  err.textContent = '';
  if (!email || !password) { err.textContent = currentLang === 'de' ? 'Email und Passwort eingeben.' : currentLang === 'fr' ? 'Veuillez saisir email et mot de passe.' : currentLang === 'it' ? 'Inserisci email e password.' : 'Please enter email and password.'; return; }

  const loginBtn = document.getElementById('btnBarLogin');
  if (loginBtn) { loginBtn.disabled = true; loginBtn.textContent = currentLang === 'de' ? 'Wird eingeloggt...' : currentLang === 'fr' ? 'Connexion...' : currentLang === 'it' ? 'Accesso...' : 'Logging in...'; }

  try {
    const r = await api({ action: 'barLogin', email, password });
    if (!r.success) {
      err.textContent = r.error || 'Login fehlgeschlagen';
      if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = t('loginBtn'); }
      return;
    }
    sessionSet({ token: r.token, barName: r.bar_name || '', barId: r.bar_id || '' });
    showAuthScreen(false);
    document.getElementById('barNameDisplay').textContent = r.bar_name || '';
    document.getElementById('btnLogout').style.display = 'block';
    if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = t('loginBtn'); }
    prefetchAllData();
    loadBarStats();
  } catch (e) {
    err.textContent = currentLang === 'de' ? 'Verbindungsfehler.' : currentLang === 'fr' ? 'Erreur de connexion.' : currentLang === 'it' ? 'Errore di connessione.' : 'Connection error.';
    if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = t('loginBtn'); }
  }
}

async function doBarRegister() {
  const bar_name = normText(document.getElementById('regBarName').value);
  const addr = parseSelectedAddress('reg');
  const phone = normText(document.getElementById('regPhone').value);
  const email = normText(document.getElementById('regBarEmail').value).toLowerCase();
  const password = document.getElementById('regBarPass').value;
  const password2 = document.getElementById('regBarPassConfirm').value;
  const consent = document.getElementById('regConsent').checked;
  const err = document.getElementById('regErr');
  const noMwst = document.getElementById('regNoMwst') && document.getElementById('regNoMwst').checked;
  const ibanRaw = normText(document.getElementById('regIban').value);
  const mwstRaw = normText(document.getElementById('regMwstNumber').value);

  err.textContent = '';

  if (!bar_name || !addr.address || !addr.city || !addr.zip || !email || !password || !password2) {
    err.textContent = currentLang === 'de' ? 'Bitte alle Pflichtfelder ausfüllen.' :
      currentLang === 'fr' ? 'Veuillez remplir tous les champs obligatoires.' :
      currentLang === 'it' ? 'Compila tutti i campi obbligatori.' :
      'Please fill in all required fields.';
    return;
  }
  if (!addr.latitude || !addr.longitude) {
    err.textContent = currentLang === 'de' ? 'Bitte die Adresse aus der Vorschlagsliste wählen.' :
      currentLang === 'fr' ? 'Veuillez choisir l’adresse dans la liste des suggestions.' :
      currentLang === 'it' ? 'Seleziona l’indirizzo dalla lista dei suggerimenti.' :
      'Please choose the address from the suggestion list.';
    return;
  }
  if (password.length < 8) {
    err.textContent = currentLang === 'de' ? 'Passwort muss mindestens 8 Zeichen haben.' :
      currentLang === 'fr' ? 'Le mot de passe doit contenir au moins 8 caractères.' :
      currentLang === 'it' ? 'La password deve contenere almeno 8 caratteri.' :
      'Password must be at least 8 characters.';
    return;
  }
  if (password !== password2) {
    err.textContent = currentLang === 'de' ? 'Passwörter stimmen nicht überein.' :
      currentLang === 'fr' ? 'Les mots de passe ne correspondent pas.' :
      currentLang === 'it' ? 'Le password non coincidono.' :
      'Passwords do not match.';
    return;
  }
  if (!isValidIban(ibanRaw)) {
    err.textContent = currentLang === 'de' ? 'Bitte eine gültige IBAN eingeben.' :
      currentLang === 'fr' ? 'Veuillez saisir un IBAN valide.' :
      currentLang === 'it' ? 'Inserisci un IBAN valido.' :
      'Please enter a valid IBAN.';
    return;
  }
  if (!noMwst && !isValidMwst(mwstRaw)) {
    err.textContent = currentLang === 'de' ? 'Bitte eine gültige MWST-Nummer eingeben.' :
      currentLang === 'fr' ? 'Veuillez saisir un numéro TVA valide.' :
      currentLang === 'it' ? 'Inserisci un numero IVA valido.' :
      'Please enter a valid VAT number.';
    return;
  }
  if (!consent) {
    err.textContent = currentLang === 'de' ? 'Bitte AGB und Datenschutz akzeptieren.' :
      currentLang === 'fr' ? 'Veuillez accepter les CGV et la confidentialité.' :
      currentLang === 'it' ? 'Accetta termini e privacy.' :
      'Please accept terms and privacy.';
    return;
  }

  const registerBtn = document.getElementById('btnBarRegister');
  if (registerBtn) { registerBtn.disabled = true; registerBtn.textContent = currentLang === 'de' ? 'Wird registriert...' : currentLang === 'fr' ? 'Inscription...' : currentLang === 'it' ? 'Registrazione...' : 'Registering...'; }

  try {
    const r = await api({
      action: 'barRegister',
      bar_name,
      address: addr.address,
      city: addr.city,
      zip: addr.zip,
      phone,
      email,
      password,
      iban: normalizeIban(ibanRaw),
      mwst_liable: !noMwst,
      mwst_number: !noMwst ? normalizeMwst(mwstRaw) : '',
      latitude: addr.latitude,
      longitude: addr.longitude
    });

    if (!r.success) {
      err.textContent = r.error || 'Registrierung fehlgeschlagen';
      if (registerBtn) { registerBtn.disabled = false; registerBtn.textContent = t('registerBtn'); }
      return;
    }

    showToast(r.message || (currentLang === 'de' ? 'Registrierung erfolgreich. Bitte auf Freischaltung warten.' :
      currentLang === 'fr' ? 'Inscription réussie. Veuillez attendre l’activation.' :
      currentLang === 'it' ? 'Registrazione avvenuta. Attendi l’attivazione.' :
      'Registration successful. Please wait for activation.'));
    document.getElementById('regBarName').value = '';
    clearSelectedAddress('reg');
    document.getElementById('regPhone').value = '';
    document.getElementById('regBarEmail').value = '';
    document.getElementById('regBarPass').value = '';
    document.getElementById('regBarPassConfirm').value = '';
    document.getElementById('regConsent').checked = false;
    document.getElementById('regNoMwst').checked = false;
    document.getElementById('regIban').value = '';
    document.getElementById('regMwstNumber').value = '';
    updateMwstVisibility('reg');
    var regMapWrap = document.getElementById('regMapWrap');
    if (regMapWrap) regMapWrap.style.display = 'none';

    document.querySelector('[data-auth-tab="login"]').click();
    if (registerBtn) { registerBtn.disabled = false; registerBtn.textContent = t('registerBtn'); }
  } catch (e) {
    err.textContent = currentLang === 'de' ? 'Verbindungsfehler.' : currentLang === 'fr' ? 'Erreur de connexion.' : currentLang === 'it' ? 'Errore di connessione.' : 'Connection error.';
    if (registerBtn) { registerBtn.disabled = false; registerBtn.textContent = t('registerBtn'); }
  }
}

// =============================================
// DATA LOADING / CACHING
// =============================================
async function prefetchAllData() {
  const s = sessionGet();
  if (!s) return;

  loadBarStats();
  loadMyDeals();
  loadMyVouchers();
  loadProfile();
}

async function loadBarStats() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }

  if (_dataCache.stats) {
    renderBarStats(_dataCache.stats);
  }
  if (_dataCache.statsLoading) return;
  _dataCache.statsLoading = true;

  try {
    const r = await api({ action: 'getBarStats', token: s.token });
    _dataCache.statsLoading = false;
    if (!r.success) {
      if (r.error === 'INVALID_TOKEN') doLogout();
      return;
    }
    _dataCache.stats = r;
    renderBarStats(r);
  } catch (e) {
    _dataCache.statsLoading = false;
    showToast(currentLang === 'de' ? 'Stats konnten nicht geladen werden' :
      currentLang === 'fr' ? 'Impossible de charger les statistiques' :
      currentLang === 'it' ? 'Impossibile caricare le statistiche' :
      'Could not load statistics', true);
  }
}

function dateInputValue(v) {
  if (!v) return '';
  try {
    var d = new Date(v);
    if (!isNaN(d)) return d.toISOString().slice(0,10);
  } catch(e) {}
  return String(v).slice(0,10);
}
function getSelectedStatsRange() {
  var from = document.getElementById('statsDateFrom');
  var to = document.getElementById('statsDateTo');
  return {
    date_from: from && from.value ? from.value : '',
    date_to: to && to.value ? to.value : ''
  };
}
function buildStatsFilterBar(filter) {
  var target = document.getElementById('barStatsFilterBar');
  if (!target) return;
  filter = filter || {};
  var fromVal = dateInputValue(filter.date_from);
  var toVal = dateInputValue(filter.date_to);
  target.innerHTML =
    '<div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:16px;margin-bottom:18px;display:flex;gap:12px;flex-wrap:wrap;align-items:end">' +
      '<div style="min-width:170px"><label class="form-label" style="margin-bottom:6px">' + (currentLang === 'de' ? 'Von' : currentLang === 'fr' ? 'De' : currentLang === 'it' ? 'Da' : 'From') + '</label><input type="date" class="form-input" id="statsDateFrom" value="' + escapeHtml(fromVal) + '"></div>' +
      '<div style="min-width:170px"><label class="form-label" style="margin-bottom:6px">' + (currentLang === 'de' ? 'Bis' : currentLang === 'fr' ? 'À' : currentLang === 'it' ? 'A' : 'To') + '</label><input type="date" class="form-input" id="statsDateTo" value="' + escapeHtml(toVal) + '"></div>' +
      '<button class="btn-pink" id="btnApplyStatsRange" style="width:auto;padding:12px 18px">' + (currentLang === 'de' ? 'Anwenden' : currentLang === 'fr' ? 'Appliquer' : currentLang === 'it' ? 'Applica' : 'Apply') + '</button>' +
      '<button class="btn-ghost" id="btnThisWeekStats" style="width:auto;padding:12px 18px;margin-top:0">' + (currentLang === 'de' ? 'Diese Woche' : currentLang === 'fr' ? 'Cette semaine' : currentLang === 'it' ? 'Questa settimana' : 'This week') + '</button>' +
      '<button class="btn-ghost" id="btnThisMonthStats" style="width:auto;padding:12px 18px;margin-top:0">' + (currentLang === 'de' ? 'Dieser Monat' : currentLang === 'fr' ? 'Ce mois' : currentLang === 'it' ? 'Questo mese' : 'This month') + '</button>' +
      '<button class="btn-ghost" id="btnResetStatsRange" style="width:auto;padding:12px 18px;margin-top:0">' + (currentLang === 'de' ? 'Zurücksetzen' : currentLang === 'fr' ? 'Réinitialiser' : currentLang === 'it' ? 'Reset' : 'Reset') + '</button>' +
    '</div>';
  document.getElementById('btnApplyStatsRange').onclick = function() { reloadBarStatsWithRange(); };
  document.getElementById('btnThisWeekStats').onclick = function() { presetStatsRange('week'); };
  document.getElementById('btnThisMonthStats').onclick = function() { presetStatsRange('month'); };
  document.getElementById('btnResetStatsRange').onclick = function() { presetStatsRange('reset'); };
}
function presetStatsRange(type) {
  var from = document.getElementById('statsDateFrom');
  var to = document.getElementById('statsDateTo');
  var now = new Date();
  if (type === 'week') {
    var day = now.getDay();
    var diff = day === 0 ? 6 : day - 1;
    var monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    var sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    from.value = monday.toISOString().slice(0,10);
    to.value = sunday.toISOString().slice(0,10);
  } else if (type === 'month') {
    var first = new Date(now.getFullYear(), now.getMonth(), 1);
    var last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    from.value = first.toISOString().slice(0,10);
    to.value = last.toISOString().slice(0,10);
  } else {
    from.value = '';
    to.value = '';
  }
  reloadBarStatsWithRange();
}
async function reloadBarStatsWithRange(detailType) {
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  var range = getSelectedStatsRange();
  try {
    const r = await api({
      action: 'getBarStats',
      token: s.token,
      date_from: range.date_from,
      date_to: range.date_to,
      detail_type: detailType || ''
    });
    if (!r.success) {
      if (r.error === 'INVALID_TOKEN') doLogout();
      else showToast(r.error || 'Fehler', true);
      return;
    }
    _dataCache.stats = r;
    renderBarStats(r);
  } catch (e) {
    showToast('Verbindungsfehler', true);
  }
}
function renderBarStats(r) {
  buildStatsFilterBar({ date_from: r.date_from, date_to: r.date_to });
  const grid = document.getElementById('statsGrid');
  const vals = [
    { key:'soldCount', value:r.sold || 0, detail:'sold' },
    { key:'notRedeemed', value:r.not_redeemed || 0, detail:'not_redeemed' },
    { key:'paidOut', value:r.paid_out || 0, detail:'paid_out' },
    { key:'activeDeals', value:r.active_deals || 0, detail:'active_deals' },
    { key:'earnings', value:'CHF ' + Number(r.earnings || 0).toFixed(2), detail:'earnings' },
    { key:'redeemed', value:r.redeemed || 0, detail:'redeemed' },
    { key:'pendingPayout', value:'CHF ' + Number(r.pending_payout || 0).toFixed(2), detail:'pending_payout' }
  ];
  grid.innerHTML = vals.map(function(it) {
    return '<div class="stat-card" style="cursor:pointer" data-detail="' + it.detail + '">' +
      '<div class="stat-label">' + t(it.key) + '</div>' +
      '<div class="stat-value">' + escapeHtml(String(it.value)) + '</div>' +
    '</div>';
  }).join('');
  Array.from(grid.querySelectorAll('.stat-card')).forEach(function(el) {
    el.onclick = function() { reloadBarStatsWithRange(this.dataset.detail); };
  });

  var detail = document.getElementById('barStatsDetail');
  if (!detail) return;
  if (!r.detail_items || !r.detail_items.length) {
    detail.innerHTML = '';
    return;
  }
  var titleMap = {
    sold: t('soldCount'),
    not_redeemed: t('notRedeemed'),
    paid_out: t('paidOut'),
    active_deals: t('activeDeals'),
    earnings: t('earnings'),
    redeemed: t('redeemed'),
    pending_payout: t('pendingPayout')
  };
  detail.innerHTML =
    '<div style="margin-top:18px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;padding:18px">' +
      '<div style="font-weight:700;font-size:16px;margin-bottom:12px">' + escapeHtml(titleMap[r.detail_type] || (currentLang === 'de' ? 'Details' : 'Details')) + '</div>' +
      '<div class="overflow-x"><table class="voucher-table"><thead><tr>' +
      '<th>' + (currentLang === 'de' ? 'Datum' : currentLang === 'fr' ? 'Date' : currentLang === 'it' ? 'Data' : 'Date') + '</th>' +
      '<th>' + t('dealLbl') + '</th>' +
      '<th>' + t('priceLbl') + '</th>' +
      '<th>Status</th></tr></thead><tbody>' +
      r.detail_items.map(function(it) {
        return '<tr><td>' + escapeHtml(String(it.date || '')) + '</td><td>' + escapeHtml(String(it.deal_title || '')) + '</td><td>' + escapeHtml(String(it.amount || '')) + '</td><td>' + escapeHtml(String(it.status || '')) + '</td></tr>';
      }).join('') +
      '</tbody></table></div>' +
    '</div>';
}

async function loadMyDeals() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }

  if (_dataCache.deals) {
    renderMyDeals(_dataCache.deals);
  }
  if (_dataCache.dealsLoading) return;
  _dataCache.dealsLoading = true;

  try {
    const r = await api({ action: 'getMyDeals', token: s.token });
    _dataCache.dealsLoading = false;
    if (!r.success) {
      if (r.error === 'INVALID_TOKEN') doLogout();
      return;
    }
    _dataCache.deals = r.deals || [];
    renderMyDeals(_dataCache.deals);
  } catch (e) {
    _dataCache.dealsLoading = false;
    showToast(currentLang === 'de' ? 'Deals konnten nicht geladen werden' :
      currentLang === 'fr' ? 'Impossible de charger les deals' :
      currentLang === 'it' ? 'Impossibile caricare i deal' :
      'Could not load deals', true);
  }
}

function renderMyDeals(deals) {
  const list = document.getElementById('dealList');
  if (!list) return;

  if (!deals || deals.length === 0) {
    list.innerHTML = '<div class="empty">' + t('noDeals') + '</div>';
    return;
  }

  list.innerHTML = deals.map(function(d) {
    var activeBadge = d.active ? '<span class="badge b-active">' + (currentLang === 'de' ? 'Aktiv' : currentLang === 'fr' ? 'Actif' : currentLang === 'it' ? 'Attivo' : 'Active') + '</span>' :
      '<span class="badge b-inactive">' + (currentLang === 'de' ? 'Inaktiv' : currentLang === 'fr' ? 'Inactif' : currentLang === 'it' ? 'Inattivo' : 'Inactive') + '</span>';

    var validity;
    if (String(d.valid_type || '') === 'single' && d.single_date) {
      validity = d.single_date;
    } else {
      validity = (d.weekdays || '').replace(/,/g, ', ') || '—';
    }
    var timeInfo = [d.time_from, d.time_to].filter(Boolean).join(' - ');
    var meta = [
      activeBadge,
      escapeHtml(validity),
      timeInfo ? escapeHtml(timeInfo) : '',
      (d.categories || []).length ? escapeHtml((d.categories || []).join(', ')) : ''
    ].filter(Boolean).join(' · ');

    return '<div class="deal-item">' +
      '<div>' +
        '<div class="deal-item-title">' + escapeHtml(d.title || '') + '</div>' +
        '<div class="deal-item-meta">' + meta + '</div>' +
        '<div class="deal-item-meta">CHF ' + Number(d.deal_price || 0).toFixed(2) + (d.original_price ? ' <span style="text-decoration:line-through;opacity:.6;margin-left:6px">CHF ' + Number(d.original_price).toFixed(2) + '</span>' : '') + '</div>' +
      '</div>' +
      '<div class="deal-actions">' +
        '<button class="btn-sm btn-blue" onclick="openEditModal(\'' + escapeHtml(String(d.id || '')) + '\')">' + t('editBtn') + '</button>' +
        '<button class="btn-sm ' + (d.active ? 'btn-orange' : 'btn-green') + '" onclick="toggleDeal(\'' + escapeHtml(String(d.id || '')) + '\',' + (!!d.active) + ')">' + (d.active ? t('deactivateBtn') : t('activeBtn')) + '</button>' +
        '<button class="btn-sm btn-red" onclick="deleteDeal(\'' + escapeHtml(String(d.id || '')) + '\')">' + t('deleteDealBtn') + '</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

async function loadMyVouchers() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }

  if (_dataCache.vouchers) {
    renderMyVouchers(_dataCache.vouchers);
  }
  if (_dataCache.vouchersLoading) return;
  _dataCache.vouchersLoading = true;

  try {
    const r = await api({ action: 'getMyBarVouchers', token: s.token });
    _dataCache.vouchersLoading = false;
    if (!r.success) {
      if (r.error === 'INVALID_TOKEN') doLogout();
      return;
    }
    _dataCache.vouchers = r.vouchers || [];
    renderMyVouchers(_dataCache.vouchers);
  } catch (e) {
    _dataCache.vouchersLoading = false;
    showToast(currentLang === 'de' ? 'Gutscheine konnten nicht geladen werden' :
      currentLang === 'fr' ? 'Impossible de charger les bons' :
      currentLang === 'it' ? 'Impossibile caricare i voucher' :
      'Could not load vouchers', true);
  }
}

function renderMyVouchers(vouchers) {
  const body = document.getElementById('voucherBody');
  if (!body) return;

  if (!vouchers || vouchers.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="empty">' + t('noVouchers') + '</td></tr>';
    return;
  }

  body.innerHTML = vouchers.map(function(v) {
    var status = String(v.status || '').toLowerCase();
    var badgeClass = status === 'redeemed' ? 'b-redeemed' : status === 'sent' ? 'b-sent' : 'b-issued';
    var code = v.code_masked || (status === 'redeemed' ? (v.code || '—') : '••••-••••-••••');
    var redeemedAt = v.redeemed_at ? escapeHtml(String(v.redeemed_at)) : '—';

    return '<tr>' +
      '<td style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace">' + escapeHtml(code) + '</td>' +
      '<td>' + escapeHtml(String(v.deal_title || '')) + '</td>' +
      '<td>CHF ' + Number(v.amount || 0).toFixed(2) + '</td>' +
      '<td><span class="badge ' + badgeClass + '">' + escapeHtml(String(v.status_label || v.status || '')) + '</span></td>' +
      '<td>' + escapeHtml(String(v.created_at || '')) + '</td>' +
      '<td>' + redeemedAt + '</td>' +
    '</tr>';
  }).join('');
}

// =============================================
// DEAL ACTIONS
// =============================================
async function toggleDeal(id, isActive) {
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  try {
    const r = await api({
      action: 'toggleDeal',
      token: s.token,
      deal_id: id,
      active: !isActive
    });
    if (!r.success) {
      showToast(r.error || 'Fehler', true);
      return;
    }
    _dataCache.deals = null;
    _dataCache.stats = null;
    loadMyDeals();
    loadBarStats();
    showToast(currentLang === 'de' ? 'Deal aktualisiert' :
      currentLang === 'fr' ? 'Deal mis à jour' :
      currentLang === 'it' ? 'Deal aggiornato' :
      'Deal updated');
  } catch (e) {
    showToast('Verbindungsfehler', true);
  }
}

async function deleteDeal(id) {
  if (!confirm(t('deleteDealConfirm'))) return;
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  try {
    const r = await api({
      action: 'deleteDeal',
      token: s.token,
      deal_id: id
    });
    if (!r.success) {
      showToast(r.error || 'Fehler', true);
      return;
    }
    _dataCache.deals = null;
    _dataCache.stats = null;
    loadMyDeals();
    loadBarStats();
    showToast(currentLang === 'de' ? 'Deal gelöscht' :
      currentLang === 'fr' ? 'Deal supprimé' :
      currentLang === 'it' ? 'Deal eliminato' :
      'Deal deleted');
  } catch (e) {
    showToast('Verbindungsfehler', true);
  }
}

// =============================================
// EDIT MODAL
// =============================================
function openEditModal(id) {
  const deals = _dataCache.deals || [];
  const d = deals.find(function(x) { return String(x.id) === String(id); });
  if (!d) return;

  document.getElementById('editDealId').value = d.id || '';
  document.getElementById('editTitle').value = d.title || '';
  document.getElementById('editDesc').value = d.description || '';
  document.getElementById('editOrigPrice').value = d.original_price || '';
  document.getElementById('editDealPrice').value = d.deal_price || '';
  document.getElementById('editQty').value = d.max_qty != null ? d.max_qty : 0;
  document.getElementById('editTimeFrom').value = d.time_from || '';
  document.getElementById('editTimeTo').value = d.time_to || '';
  document.getElementById('editActive').checked = !!d.active;
  document.getElementById('editImageUrl').value = d.image_url || '';

  var prev = document.getElementById('editImagePreview');
  var prevImg = document.getElementById('editImagePreviewImg');
  if (d.image_url) {
    prevImg.src = d.image_url;
    prev.style.display = 'block';
  } else {
    prev.style.display = 'none';
  }

  if (String(d.valid_type || '') === 'single') {
    document.getElementById('editVTypeSingle').checked = true;
    document.getElementById('editSingleFields').style.display = 'block';
    document.getElementById('editRecurringFields').style.display = 'none';
    document.getElementById('editSingleDate').value = dateInputValue(d.single_date);
  } else {
    document.getElementById('editVTypeRecurring').checked = true;
    document.getElementById('editSingleFields').style.display = 'none';
    document.getElementById('editRecurringFields').style.display = 'block';
    const weekdays = String(d.weekdays || '').split(',').map(function(x) { return x.trim(); });
    document.querySelectorAll('#editWeekdays .wd-btn').forEach(function(btn) {
      btn.classList.toggle('selected', weekdays.indexOf(btn.dataset.wd) >= 0);
    });
  }

  const timeSlots = Array.isArray(d.time_slots) ? d.time_slots : String(d.time_slots || '').split(',').map(function(x) { return x.trim(); }).filter(Boolean);
  document.querySelectorAll('input[name="editTimeSlot"]').forEach(function(cb) {
    cb.checked = timeSlots.indexOf(cb.value) >= 0;
  });

  document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

async function saveEditDeal() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }

  const id = document.getElementById('editDealId').value;
  const title = normText(document.getElementById('editTitle').value);
  const description = normText(document.getElementById('editDesc').value);
  const original_price = Number(document.getElementById('editOrigPrice').value || 0);
  const deal_price = Number(document.getElementById('editDealPrice').value || 0);
  const max_qty = Number(document.getElementById('editQty').value || 0);
  const active = document.getElementById('editActive').checked;
  const valid_type = document.querySelector('input[name="editValidType"]:checked').value;
  const single_date = document.getElementById('editSingleDate').value;
  const weekdays = Array.from(document.querySelectorAll('#editWeekdays .wd-btn.selected')).map(function(b) { return b.dataset.wd; });
  const time_from = document.getElementById('editTimeFrom').value;
  const time_to = document.getElementById('editTimeTo').value;
  const time_slots = Array.from(document.querySelectorAll('input[name="editTimeSlot"]:checked')).map(function(cb) { return cb.value; });
  const imageFile = document.getElementById('editImageFile').files[0];
  let image_url = document.getElementById('editImageUrl').value || '';

  if (!title || !deal_price) {
    showToast(currentLang === 'de' ? 'Bitte Titel und Deal-Preis eingeben.' :
      currentLang === 'fr' ? 'Veuillez saisir le titre et le prix du deal.' :
      currentLang === 'it' ? 'Inserisci titolo e prezzo del deal.' :
      'Please enter title and deal price.', true);
    return;
  }
  if (valid_type === 'single' && !single_date) {
    showToast(currentLang === 'de' ? 'Bitte ein Datum wählen.' :
      currentLang === 'fr' ? 'Veuillez choisir une date.' :
      currentLang === 'it' ? 'Scegli una data.' :
      'Please choose a date.', true);
    return;
  }
  if (valid_type === 'recurring' && weekdays.length === 0) {
    showToast(currentLang === 'de' ? 'Bitte mindestens einen Wochentag wählen.' :
      currentLang === 'fr' ? 'Veuillez choisir au moins un jour.' :
      currentLang === 'it' ? 'Scegli almeno un giorno.' :
      'Please choose at least one weekday.', true);
    return;
  }

  const btn = document.getElementById('btnSaveEdit');
  if (btn) { btn.disabled = true; btn.textContent = currentLang === 'de' ? 'Speichern...' : currentLang === 'fr' ? 'Enregistrement...' : currentLang === 'it' ? 'Salvataggio...' : 'Saving...'; }

  try {
    if (imageFile) {
      const base64 = await fileToBase64(imageFile);
      const up = await api({
        action: 'uploadImage',
        token: s.token,
        filename: imageFile.name,
        mime_type: imageFile.type,
        base64_data: base64
      });
      if (!up.success) throw new Error(up.error || 'Image upload failed');
      image_url = up.url || '';
    }

    const r = await api({
      action: 'updateDeal',
      token: s.token,
      deal_id: id,
      title,
      description,
      original_price,
      deal_price,
      max_qty,
      active,
      valid_type,
      single_date,
      weekdays: weekdays.join(','),
      time_from,
      time_to,
      time_slots: time_slots.join(','),
      image_url
    });

    if (!r.success) {
      showToast(r.error || 'Fehler', true);
      if (btn) { btn.disabled = false; btn.textContent = t('saveLbl'); }
      return;
    }

    closeEditModal();
    _dataCache.deals = null;
    _dataCache.stats = null;
    loadMyDeals();
    loadBarStats();
    showToast(currentLang === 'de' ? 'Deal gespeichert' :
      currentLang === 'fr' ? 'Deal enregistré' :
      currentLang === 'it' ? 'Deal salvato' :
      'Deal saved');
    if (btn) { btn.disabled = false; btn.textContent = t('saveLbl'); }
  } catch (e) {
    showToast(e.message || 'Verbindungsfehler', true);
    if (btn) { btn.disabled = false; btn.textContent = t('saveLbl'); }
  }
}

// =============================================
// CREATE DEAL
// =============================================
function toggleValidity() {
  const isRecurring = document.getElementById('vTypeRecurring').checked;
  document.getElementById('recurringFields').style.display = isRecurring ? 'block' : 'none';
  document.getElementById('singleFields').style.display = isRecurring ? 'none' : 'block';
}

async function doCreateDeal() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }

  const title = normText(document.getElementById('dealTitle').value);
  const description = normText(document.getElementById('dealDesc').value);
  const original_price = Number(document.getElementById('dealOrigPrice').value || 0);
  const deal_price = Number(document.getElementById('dealPrice').value || 0);
  const max_qty = Number(document.getElementById('dealQty').value || 0);
  const active = document.getElementById('dealActive').checked;
  const categories = Array.from(document.querySelectorAll('input[name="cat"]:checked')).map(function(cb) { return cb.value; });
  const valid_type = document.querySelector('input[name="validType"]:checked').value;
  const weekdays = Array.from(document.querySelectorAll('#weekdays .wd-btn.selected')).map(function(b) { return b.dataset.weekday; });
  const single_date = document.getElementById('singleDate').value;
  const time_from = document.getElementById('timeFrom').value;
  const time_to = document.getElementById('timeTo').value;
  const time_slots = Array.from(document.querySelectorAll('input[name="timeSlot"]:checked')).map(function(cb) { return cb.value; });
  const imageFile = document.getElementById('dealImageFile').files[0];
  const imageUrlField = document.getElementById('dealImageUrl');

  let image_url = imageUrlField ? imageUrlField.value : '';

  if (!title || !deal_price) {
    showToast(currentLang === 'de' ? 'Bitte Titel und Deal-Preis eingeben.' :
      currentLang === 'fr' ? 'Veuillez saisir le titre et le prix du deal.' :
      currentLang === 'it' ? 'Inserisci titolo e prezzo del deal.' :
      'Please enter title and deal price.', true);
    return;
  }
  if (!categories.length) {
    showToast(currentLang === 'de' ? 'Bitte mindestens eine Kategorie wählen.' :
      currentLang === 'fr' ? 'Veuillez choisir au moins une catégorie.' :
      currentLang === 'it' ? 'Scegli almeno una categoria.' :
      'Please choose at least one category.', true);
    return;
  }
  if (valid_type === 'single' && !single_date) {
    showToast(currentLang === 'de' ? 'Bitte ein Datum wählen.' :
      currentLang === 'fr' ? 'Veuillez choisir une date.' :
      currentLang === 'it' ? 'Scegli una data.' :
      'Please choose a date.', true);
    return;
  }
  if (valid_type === 'recurring' && weekdays.length === 0) {
    showToast(currentLang === 'de' ? 'Bitte mindestens einen Wochentag wählen.' :
      currentLang === 'fr' ? 'Veuillez choisir au moins un jour.' :
      currentLang === 'it' ? 'Scegli almeno un giorno.' :
      'Please choose at least one weekday.', true);
    return;
  }

  const isPauschal = categories.indexOf('pauschalgutscheine') >= 0;
  let pauschal_config = null;
  if (isPauschal) {
    const discountPercent = Number(document.getElementById('discountPercent').value || 0);
    const minOrder = Number(document.getElementById('minOrder').value || 0);
    const appliesTo = document.getElementById('appliesTo').value;
    if (discountPercent < 15) {
      showToast(currentLang === 'de' ? 'Pauschalgutschein: Rabatt muss mindestens 15% sein.' :
        currentLang === 'fr' ? 'Bon forfaitaire : la remise doit être d’au moins 15%.' :
        currentLang === 'it' ? 'Buono forfait: lo sconto deve essere almeno del 15%.' :
        'Flat voucher: discount must be at least 15%.', true);
      return;
    }
    if (minOrder < 40) {
      showToast(currentLang === 'de' ? 'Pauschalgutschein: Mindestbestellung muss mindestens 40 CHF sein.' :
        currentLang === 'fr' ? 'Bon forfaitaire : la commande minimale doit être d’au moins 40 CHF.' :
        currentLang === 'it' ? 'Buono forfait: l’ordine minimo deve essere almeno di 40 CHF.' :
        'Flat voucher: minimum order must be at least CHF 40.', true);
      return;
    }
    pauschal_config = { discount_percent: discountPercent, min_order: minOrder, applies_to: appliesTo };
  }

  const btn = document.getElementById('btnCreateDeal');
  if (btn) { btn.disabled = true; btn.textContent = currentLang === 'de' ? 'Wird erstellt...' : currentLang === 'fr' ? 'Création...' : currentLang === 'it' ? 'Creazione...' : 'Creating...'; }

  try {
    if (imageFile) {
      const base64 = await fileToBase64(imageFile);
      const up = await api({
        action: 'uploadImage',
        token: s.token,
        filename: imageFile.name,
        mime_type: imageFile.type,
        base64_data: base64
      });
      if (!up.success) throw new Error(up.error || 'Image upload failed');
      image_url = up.url || '';
    }

    const r = await api({
      action: 'createDeal',
      token: s.token,
      title,
      description,
      original_price,
      deal_price,
      max_qty,
      active,
      categories: categories.join(','),
      valid_type,
      weekdays: weekdays.join(','),
      single_date,
      time_from,
      time_to,
      time_slots: time_slots.join(','),
      image_url,
      pauschal_config: pauschal_config ? JSON.stringify(pauschal_config) : ''
    });

    if (r.success) {
      _dataCache.deals = null;
      _dataCache.stats = null;
      loadMyDeals();
      loadBarStats();
      showToast(currentLang === 'de' ? 'Deal erstellt!' :
        currentLang === 'fr' ? 'Deal créé !' :
        currentLang === 'it' ? 'Deal creato!' :
        'Deal created!');
      document.getElementById('dealTitle').value = '';
      document.getElementById('dealDesc').value = '';
      document.getElementById('dealOrigPrice').value = '';
      document.getElementById('dealPrice').value = '';
      document.getElementById('timeFrom').value = '';
      document.getElementById('timeTo').value = '';
      document.getElementById('singleDate').value = '';
      var imgEl = document.getElementById('dealImageFile');
      if (imgEl) imgEl.value = '';
      var pvEl = document.getElementById('imagePreview'); if (pvEl) pvEl.style.display = 'none';
      document.querySelectorAll('input[name="timeSlot"]').forEach(function(c){c.checked=false;});
      var pf = document.getElementById('pauschalFields'); if (pf) pf.style.display = 'none';
      document.querySelectorAll('input[name="cat"]').forEach(function(c) { c.checked = false; });
      document.querySelectorAll('.wd-btn').forEach(function(b) { b.classList.remove('selected'); });
      document.getElementById('dealQty').value = '0';
    } else showToast(r.error || 'Fehler', true);
    if (btn) { btn.disabled = false; btn.textContent = t('createDeal') || 'Deal erstellen'; }
  } catch (e) {
    showToast('Verbindungsfehler', true);
    var rb = document.getElementById('btnCreateDeal');
    if (rb) { rb.disabled = false; rb.textContent = t('createDeal') || 'Deal erstellen'; }
  }
}

// =============================================
// TAB SWITCHING
// =============================================
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

// =============================================
// API / TOAST
// =============================================
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

// =============================================
// PASSWORD RESET
// =============================================
async function sendBarResetCode() {
  var email = document.getElementById('barResetEmail').value.trim();
  if (!email) { showToast(currentLang === 'de' ? 'Bitte Email eingeben' : currentLang === 'fr' ? 'Veuillez saisir un email' : currentLang === 'it' ? 'Inserisci l’email' : 'Please enter email', true); return; }
  try {
    var r = await api({ action: 'requestPasswordReset', email: email, role: 'bar' });
    if (r.success) {
      showToast(r.message || currentLang === 'de' ? 'Code gesendet!' : currentLang === 'fr' ? 'Code envoyé !' : currentLang === 'it' ? 'Codice inviato!' : 'Code sent!');
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
  if (!code || !newPassword) { showToast(currentLang === 'de' ? 'Alle Felder ausfüllen' : currentLang === 'fr' ? 'Veuillez remplir tous les champs' : currentLang === 'it' ? 'Compila tutti i campi' : 'Fill in all fields', true); return; }
  if (newPassword.length < 8) { showToast(currentLang === 'de' ? 'Passwort mind. 8 Zeichen' : currentLang === 'fr' ? 'Mot de passe min. 8 caractères' : currentLang === 'it' ? 'Password min. 8 caratteri' : 'Password min. 8 characters', true); return; }
  try {
    var r = await api({ action: 'resetPassword', email: email, code: code, new_password: newPassword, role: 'bar' });
    if (r.success) {
      showToast(currentLang === 'de' ? '✅ Passwort geändert!' : currentLang === 'fr' ? '✅ Mot de passe changé !' : currentLang === 'it' ? '✅ Password cambiata!' : '✅ Password changed!');
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

// =============================================
// AUTO-LOGIN ON LOAD
// =============================================
window.addEventListener('load', function() {
  var s = sessionGet();
  if (s) {
    showAuthScreen(false);
    var el = document.getElementById('barNameDisplay');
    if (el) el.textContent = s.barName || '';
    var logBtn = document.getElementById('btnLogout');
    if (logBtn) logBtn.style.display = 'block';
    prefetchAllData();
    loadBarStats();
  } else {
    showAuthScreen(true);
  }
  var savedLang = localStorage.getItem('barsclusive_bar_lang') || 'de';
  setLang(savedLang);
});

// =============================================
// PROFILE
// =============================================
async function loadProfile() {
  var s = sessionGet();
  if (!s) return;
  if (_dataCache.profile) { applyProfileToForm(_dataCache.profile); }
  if (_dataCache.profileLoading) return;
  _dataCache.profileLoading = true;
  try {
    var r = await api({ action: 'getBarProfile', token: s.token });
    _dataCache.profileLoading = false;
    if (!r.success || !r.profile) return;
    _dataCache.profile = r.profile;
    applyProfileToForm(r.profile);
  } catch(e) { _dataCache.profileLoading = false; }
}

function applyProfileToForm(b) {
  var el = function(id) { return document.getElementById(id); };
  if (el('profAddressSearch')) el('profAddressSearch').value = b.address || '';
  if (el('profAddress')) el('profAddress').value = b.address || '';
  if (el('profZip')) el('profZip').value = b.zip || '';
  if (el('profCity')) el('profCity').value = b.city || '';
  if (el('profPhone')) el('profPhone').value = b.phone || '';
  setMaskedInputValue('profIban', b.iban || '', formatIbanDisplay);
  if (el('profTwint')) el('profTwint').value = b.twint || '';
  if (el('profNoMwst')) el('profNoMwst').checked = !(b.mwst_liable === true || b.mwst_liable === 'true');
  updateMwstVisibility('prof');
  setMaskedInputValue('profMwstNumber', b.mwst_number || '', formatMwstDisplay);
  if (el('profLat')) el('profLat').value = b.latitude || '';
  if (el('profLng')) el('profLng').value = b.longitude || '';
  setAddressMeta('prof', [b.address, b.zip, b.city].filter(Boolean).join(', ') || t('addressNotSelected'));
  if (el('profAddressSearch')) el('profAddressSearch').dataset.selected = b.address ? '1' : '';
}

async function saveProfile() {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  var addr = parseSelectedAddress('prof');
  var ibanRaw = normText(document.getElementById('profIban').value);
  var mwstLiable = !(document.getElementById('profNoMwst') && document.getElementById('profNoMwst').checked);
  var mwstRaw = document.getElementById('profMwstNumber') ? normText(document.getElementById('profMwstNumber').value) : '';

  if (!addr.address || !addr.city || !addr.zip) { showToast(currentLang === 'de' ? 'Bitte zuerst eine Adresse auswählen.' : currentLang === 'fr' ? 'Veuillez d’abord sélectionner une adresse.' : currentLang === 'it' ? 'Seleziona prima un indirizzo.' : 'Please select an address first.', true); return; }
  if (!addr.latitude || !addr.longitude) { showToast(currentLang === 'de' ? 'Für die Adresse fehlen Koordinaten.' : currentLang === 'fr' ? 'Les coordonnées manquent pour cette adresse.' : currentLang === 'it' ? 'Mancano le coordinate per questo indirizzo.' : 'Coordinates are missing for this address.', true); return; }
  if (ibanRaw && !isValidIban(ibanRaw)) { showToast(currentLang === 'de' ? 'Bitte eine gültige IBAN eingeben.' : currentLang === 'fr' ? 'Veuillez saisir un IBAN valide.' : currentLang === 'it' ? 'Inserisci un IBAN valido.' : 'Please enter a valid IBAN.', true); return; }
  if (mwstLiable && !isValidMwst(mwstRaw)) { showToast(currentLang === 'de' ? 'Bitte eine gültige MWST-Nummer eingeben.' : currentLang === 'fr' ? 'Veuillez saisir un numéro TVA valide.' : currentLang === 'it' ? 'Inserisci un numero IVA valido.' : 'Please enter a valid VAT number.', true); return; }

  var payload = {
    action: 'updateBarProfile',
    token: s.token,
    address: addr.address,
    zip: addr.zip,
    city: addr.city,
    phone: normText(document.getElementById('profPhone').value),
    iban: normalizeIban(ibanRaw),
    twint: normText(document.getElementById('profTwint').value),
    mwst_liable: mwstLiable,
    mwst_number: mwstLiable ? normalizeMwst(mwstRaw) : '',
    latitude: addr.latitude,
    longitude: addr.longitude
  };
  try {
    var r = await api(payload);
    if (r.success) { _dataCache.profile = null; showToast(t('profileSaved') || 'Gespeichert'); }
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

// =============================================
// REDEEM
// =============================================
async function doRedeem() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  const code = normText(document.getElementById('redeemCode').value).toUpperCase();
  const err = document.getElementById('redeemErr');
  const res = document.getElementById('redeemResult');
  err.textContent = '';
  res.style.display = 'none';

  if (!code) {
    err.textContent = currentLang === 'de' ? 'Bitte Code eingeben.' :
      currentLang === 'fr' ? 'Veuillez saisir un code.' :
      currentLang === 'it' ? 'Inserisci un codice.' :
      'Please enter a code.';
    return;
  }

  try {
    const r = await api({ action: 'redeemVoucher', token: s.token, code: code });
    if (!r.success) {
      err.textContent = r.error || 'Fehler';
      return;
    }

    document.getElementById('redeemDeal').textContent = r.deal_title || '';
    res.style.display = 'block';
    document.getElementById('redeemCode').value = '';
    _dataCache.stats = null;
    _dataCache.vouchers = null;
    loadBarStats();
    loadMyVouchers();
  } catch (e) {
    err.textContent = currentLang === 'de' ? 'Verbindungsfehler.' :
      currentLang === 'fr' ? 'Erreur de connexion.' :
      currentLang === 'it' ? 'Errore di connessione.' :
      'Connection error.';
  }
}

// =============================================
// CHANGE PASSWORD
// =============================================
async function doChangePassword() {
  const s = sessionGet();
  if (!s) { doLogout(); return; }
  const oldPassword = document.getElementById('pwOld').value;
  const newPassword = document.getElementById('pwNew').value;
  const confirmPassword = document.getElementById('pwConfirm').value;
  const err = document.getElementById('pwErr');
  err.textContent = '';

  if (!oldPassword || !newPassword || !confirmPassword) {
    err.textContent = currentLang === 'de' ? 'Bitte alle Felder ausfüllen.' :
      currentLang === 'fr' ? 'Veuillez remplir tous les champs.' :
      currentLang === 'it' ? 'Compila tutti i campi.' :
      'Please fill all fields.';
    return;
  }
  if (newPassword.length < 8) {
    err.textContent = currentLang === 'de' ? 'Neues Passwort muss mindestens 8 Zeichen haben.' :
      currentLang === 'fr' ? 'Le nouveau mot de passe doit contenir au moins 8 caractères.' :
      currentLang === 'it' ? 'La nuova password deve contenere almeno 8 caratteri.' :
      'New password must be at least 8 characters.';
    return;
  }
  if (newPassword !== confirmPassword) {
    err.textContent = currentLang === 'de' ? 'Passwörter stimmen nicht überein.' :
      currentLang === 'fr' ? 'Les mots de passe ne correspondent pas.' :
      currentLang === 'it' ? 'Le password non coincidono.' :
      'Passwords do not match.';
    return;
  }

  try {
    const r = await api({
      action: 'changeBarPassword',
      token: s.token,
      old_password: oldPassword,
      new_password: newPassword
    });
    if (!r.success) {
      err.textContent = r.error || 'Fehler';
      return;
    }

    document.getElementById('pwOld').value = '';
    document.getElementById('pwNew').value = '';
    document.getElementById('pwConfirm').value = '';
    showToast(currentLang === 'de' ? 'Passwort geändert' :
      currentLang === 'fr' ? 'Mot de passe modifié' :
      currentLang === 'it' ? 'Password cambiata' :
      'Password changed');
  } catch (e) {
    err.textContent = currentLang === 'de' ? 'Verbindungsfehler.' :
      currentLang === 'fr' ? 'Erreur de connexion.' :
      currentLang === 'it' ? 'Errore di connessione.' :
      'Connection error.';
  }
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', function() {
  var langDE = document.getElementById('langDE');
  var langEN = document.getElementById('langEN');
  var langIT = document.getElementById('langIT');
  var langFR = document.getElementById('langFR');
  if (langDE) langDE.addEventListener('click', function() { setLang('de'); });
  if (langEN) langEN.addEventListener('click', function() { setLang('en'); });
  if (langIT) langIT.addEventListener('click', function() { setLang('it'); });
  if (langFR) langFR.addEventListener('click', function() { setLang('fr'); });

  document.querySelectorAll('.btn-logout').forEach(function(b) { b.addEventListener('click', doLogout); });

  document.querySelectorAll('[data-auth-tab]').forEach(function(btn) {
    btn.addEventListener('click', function() { switchAuthTab(this.dataset.authTab, this); });
  });

  var btnBarLogin    = document.getElementById('btnBarLogin');
  var btnBarRegister = document.getElementById('btnBarRegister');
  if (btnBarLogin)    btnBarLogin.addEventListener('click', doBarLogin);
  if (btnBarRegister) btnBarRegister.addEventListener('click', doBarRegister);

  var loginPw = document.getElementById('loginPassword');
  if (loginPw) loginPw.addEventListener('keydown', function(e) { if (e.key === 'Enter') doBarLogin(); });

  document.querySelectorAll('[data-dash-tab]').forEach(function(btn) {
    btn.addEventListener('click', function() { switchDashTab(this.dataset.dashTab, this); });
  });

  document.querySelectorAll('[data-weekday]').forEach(function(div) {
    div.addEventListener('click', function() { this.classList.toggle('selected'); });
  });

  document.querySelectorAll('input[name="validType"]').forEach(function(radio) {
    radio.addEventListener('change', toggleValidity);
  });

  var btnCreateDeal = document.getElementById('btnCreateDeal');
  if (btnCreateDeal) btnCreateDeal.addEventListener('click', doCreateDeal);

  var btnRedeem = document.getElementById('btnRedeem');
  if (btnRedeem) btnRedeem.addEventListener('click', doRedeem);
  var redeemCode = document.getElementById('redeemCode');
  if (redeemCode) redeemCode.addEventListener('keydown', function(e) { if (e.key === 'Enter') doRedeem(); });

  var btnChangePw = document.getElementById('btnChangePassword');
  if (btnChangePw) btnChangePw.addEventListener('click', doChangePassword);

  var btnSavePr = document.getElementById('btnSaveProfile');
  if (btnSavePr) btnSavePr.addEventListener('click', saveProfile);
  var btnDelAcc = document.getElementById('btnDeleteAccount');
  if (btnDelAcc) btnDelAcc.addEventListener('click', deleteBarAccount);

  var btnCloseEdit  = document.getElementById('btnCloseEditModal');
  var btnCancelEdit = document.getElementById('btnCancelEdit');
  var btnSaveEdit   = document.getElementById('btnSaveEdit');
  if (btnCloseEdit)  btnCloseEdit.addEventListener('click', closeEditModal);
  if (btnCancelEdit) btnCancelEdit.addEventListener('click', closeEditModal);
  if (btnSaveEdit)   btnSaveEdit.addEventListener('click', saveEditDeal);

  var editModal = document.getElementById('editModal');
  if (editModal) editModal.addEventListener('click', function(e) { if (e.target === this) closeEditModal(); });

  document.querySelectorAll('#editWeekdays .wd-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { this.classList.toggle('selected'); });
  });

  document.querySelectorAll('input[name="editValidType"]').forEach(function(r) {
    r.addEventListener('change', function() {
      var isRec = this.value === 'recurring';
      var ef1 = document.getElementById('editRecurringFields');
      var ef2 = document.getElementById('editSingleFields');
      if (ef1) ef1.style.display = isRec ? 'block' : 'none';
      if (ef2) ef2.style.display = isRec ? 'none' : 'block';
    });
  });

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

  var barResetModal = document.getElementById('barResetPasswordModal');
  if (barResetModal) barResetModal.addEventListener('click', function(e) { if (e.target === this) closeBarResetModal(); });
});

document.addEventListener('DOMContentLoaded', function() {
  bindMaskedInput('regIban', formatIbanDisplay);
  bindMaskedInput('profIban', formatIbanDisplay);
  bindMaskedInput('regMwstNumber', formatMwstDisplay);
  bindMaskedInput('profMwstNumber', formatMwstDisplay);

  var regNoMwst = document.getElementById('regNoMwst');
  if (regNoMwst) regNoMwst.addEventListener('change', function() { updateMwstVisibility('reg'); });
  var profNoMwst = document.getElementById('profNoMwst');
  if (profNoMwst) profNoMwst.addEventListener('change', function() { updateMwstVisibility('prof'); });
  updateMwstVisibility('reg');
  updateMwstVisibility('prof');

  bindAddressAutocomplete('reg');
  bindAddressAutocomplete('prof');

  var profMap = null, profMarker = null;
  var regMap = null, regMarker = null;

  function showMapPin(mapId, wrapId, lat, lng, existingMap, existingMarker, prefix) {
    var wrap = document.getElementById(wrapId);
    if (!wrap) return { map: existingMap, marker: existingMarker };
    wrap.style.display = 'block';
    if (!existingMap) {
      existingMap = L.map(mapId).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(existingMap);
      existingMarker = L.marker([lat, lng], { draggable: true }).addTo(existingMap);
    } else {
      existingMap.setView([lat, lng], 15);
      existingMarker.setLatLng([lat, lng]);
    }
    setTimeout(function() { existingMap.invalidateSize(); }, 200);
    existingMarker.off('dragend');
    existingMarker.on('dragend', function(e) {
      var p = e.target.getLatLng();
      var latEl = document.getElementById(prefix + 'Lat');
      var lngEl = document.getElementById(prefix + 'Lng');
      if (latEl) latEl.value = p.lat.toFixed(6);
      if (lngEl) lngEl.value = p.lng.toFixed(6);
    });
    return { map: existingMap, marker: existingMarker };
  }

  var btnGeocode = document.getElementById('btnGeocode');
  if (btnGeocode) btnGeocode.addEventListener('click', async function() {
    var addr = parseSelectedAddress('prof');
    if (!addr.latitude || !addr.longitude) { showToast(currentLang === 'de' ? 'Bitte zuerst eine Adresse aus der Liste wählen' : currentLang === 'fr' ? 'Veuillez d’abord choisir une adresse dans la liste' : currentLang === 'it' ? 'Seleziona prima un indirizzo dalla lista' : 'Please choose an address from the list first', true); return; }
    var lat = Number(addr.latitude), lng = Number(addr.longitude);
    var r = showMapPin('profMap', 'profMapWrap', lat, lng, profMap, profMarker, 'prof');
    profMap = r.map; profMarker = r.marker;
    showToast(currentLang === 'de' ? '📍 Standort geladen' : currentLang === 'fr' ? '📍 Emplacement chargé' : currentLang === 'it' ? '📍 Posizione caricata' : '📍 Location loaded');
  });

  var btnRegGeo = document.getElementById('btnRegGeocode');
  if (btnRegGeo) btnRegGeo.addEventListener('click', async function() {
    var addr = parseSelectedAddress('reg');
    if (!addr.latitude || !addr.longitude) { showToast(currentLang === 'de' ? 'Bitte zuerst eine Adresse aus der Liste wählen' : currentLang === 'fr' ? 'Veuillez d’abord choisir une adresse dans la liste' : currentLang === 'it' ? 'Seleziona prima un indirizzo dalla lista' : 'Please choose an address from the list first', true); return; }
    var lat = Number(addr.latitude), lng = Number(addr.longitude);
    var r = showMapPin('regMap', 'regMapWrap', lat, lng, regMap, regMarker, 'reg');
    regMap = r.map; regMarker = r.marker;
    showToast(currentLang === 'de' ? '📍 Standort geladen – Pin verschiebbar!' : currentLang === 'fr' ? '📍 Emplacement chargé – marqueur déplaçable !' : currentLang === 'it' ? '📍 Posizione caricata – pin trascinabile!' : '📍 Location loaded – pin can be moved!');
  });

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
