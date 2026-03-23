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
  changePassword:'Passwort ändern', oldPassword:'Altes Passwort', profileTitle:'Stammdaten', addressLbl:'Adresse', zipLbl:'PLZ', cityLbl:'Stadt', phoneLbl:'Telefon', ibanLbl:'IBAN', twintLbl:'Twint', saveProfile:'Speichern', profileSaved:'Profil gespeichert', deleteAccountTitle:'Account löschen', deleteAccountWarning:'Alle Deals werden deaktiviert. Diese Aktion ist endgültig.', deleteAccountBtn:'Account endgültig löschen', soldCount:'Verkauft', notRedeemed:'Nicht eingel\xf6st', paidOut:'Netto ausbezahlt', activeDeals:'Aktive Deals', earnings:'Einnahmen', redeemed:'Eingelöst', pendingPayout:'Ausstehend', deleteDealBtn:'Deal löschen', deleteDealConfirm:'Deal endgültig löschen?', shop:'Shop', aboutUs:'Über uns', howItWorks:'So funktionierts', legalNotice:'Impressum', privacy:'Datenschutz', termsBars:'AGB Bars', contact:'Kontakt',
  newPasswordLbl:'Neues Passwort (mind. 8 Zeichen)', confirmPassword:'Passwort bestätigen',
  changePasswordBtn:'Passwort ändern', editDeal:'Deal bearbeiten',
  saveLbl:'Speichern', cancelLbl:'Abbrechen',
  activeBtn:'Aktivieren', deactivateBtn:'Deaktivieren', editBtn:'Bearbeiten',
  noDeals:'Noch keine Deals. Erstelle deinen ersten Deal!',
  noVouchers:'Noch keine Gutscheine.',
  soldCount:'verkauft',
  resetPasswordTitle:'Passwort zurücksetzen',
  newPassword:'Neues Passwort',
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
  mwstNumberLabel:'MWST-Nummer',
  portalTitle:'Bar-Portal', forgotPw:'Passwort vergessen?', resetInfo1:'Gib deine Email-Adresse ein. Wir senden dir einen 6-stelligen Code.', resetInfo2:'Gib den 6-stelligen Code aus deiner Email ein und wähle ein neues Passwort.', sendCode:'Code senden', backBtn:'Zurück', code6:'Code (6-stellig)'
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
  changePassword:'Change Password', oldPassword:'Old Password', profileTitle:'Master Data', addressLbl:'Address', zipLbl:'ZIP', cityLbl:'City', phoneLbl:'Phone', ibanLbl:'IBAN', twintLbl:'Twint', saveProfile:'Save', profileSaved:'Profile saved', deleteAccountTitle:'Delete Account', deleteAccountWarning:'All deals will be deactivated. This action is permanent.', deleteAccountBtn:'Delete account permanently', soldCount:'Sold', notRedeemed:'Not redeemed', paidOut:'Net paid', activeDeals:'Active Deals', earnings:'Revenue', redeemed:'Redeemed', pendingPayout:'Pending', deleteDealBtn:'Delete Deal', deleteDealConfirm:'Permanently delete this deal?', shop:'Shop', aboutUs:'About Us', howItWorks:'How It Works', legalNotice:'Legal Notice', privacy:'Privacy', termsBars:'Terms Bars', contact:'Contact',
  newPasswordLbl:'New Password (min. 8 chars)', confirmPassword:'Confirm Password',
  changePasswordBtn:'Change Password', editDeal:'Edit Deal',
  saveLbl:'Save', cancelLbl:'Cancel',
  activeBtn:'Activate', deactivateBtn:'Deactivate', editBtn:'Edit',
  noDeals:'No deals yet. Create your first deal!',
  noVouchers:'No vouchers yet.',
  soldCount:'sold',
  resetPasswordTitle:'Reset Password',
  newPassword:'New Password',
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
  mwstNumberLabel:'VAT number',
  portalTitle:'Bar Portal', forgotPw:'Forgot password?', resetInfo1:'Enter your email address. We will send you a 6-digit code.', resetInfo2:'Enter the 6-digit code from your email and choose a new password.', sendCode:'Send code', backBtn:'Back', code6:'Code (6 digits)'
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
  changePassword:'Cambia Password', oldPassword:'Vecchia Password', profileTitle:'Dati anagrafici', addressLbl:'Indirizzo', zipLbl:'CAP', cityLbl:'Città', phoneLbl:'Telefono', ibanLbl:'IBAN', twintLbl:'Twint', saveProfile:'Salva', profileSaved:'Profilo salvato', deleteAccountTitle:'Elimina account', deleteAccountWarning:'Tutti i deal saranno disattivati. Questa azione è definitiva.', deleteAccountBtn:'Elimina account definitivamente', soldCount:'Venduti', notRedeemed:'Non riscattati', paidOut:'Netto pagato', activeDeals:'Deal attivi', earnings:'Entrate', redeemed:'Riscattati', pendingPayout:'In sospeso', deleteDealBtn:'Elimina Deal', deleteDealConfirm:'Eliminare definitivamente questo deal?', shop:'Shop', aboutUs:'Chi siamo', howItWorks:'Come funziona', legalNotice:'Impressum', privacy:'Privacy', termsBars:'Condizioni Bar', contact:'Contatto',
  newPasswordLbl:'Nuova Password (min. 8 car.)', confirmPassword:'Conferma Password',
  changePasswordBtn:'Cambia Password', editDeal:'Modifica Deal',
  saveLbl:'Salva', cancelLbl:'Annulla',
  activeBtn:'Attiva', deactivateBtn:'Disattiva', editBtn:'Modifica',
  noDeals:'Nessun deal. Crea il tuo primo deal!',
  noVouchers:'Nessun voucher.',
  soldCount:'venduti',
  resetPasswordTitle:'Reimposta Password',
  newPassword:'Nuova Password',
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
  mwstNumberLabel:'Numero IVA',
  portalTitle:'Portale Bar', forgotPw:'Password dimenticata?', resetInfo1:'Inserisci la tua email. Ti invieremo un codice di 6 cifre.', resetInfo2:'Inserisci il codice di 6 cifre ricevuto via email e scegli una nuova password.', sendCode:'Invia codice', backBtn:'Indietro', code6:'Codice (6 cifre)'
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
  regAddressHelp:'Veuillez choisir l’adresse dans la liste des suggestions. L’adresse, le NPA, la ville et les coordonnées sont remplies automatiquement.',
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
  mwstNumberLabel:'Numéro TVA',
  portalTitle:'Portail Bar', forgotPw:'Mot de passe oublié ?', resetInfo1:'Saisissez votre adresse email. Nous vous enverrons un code à 6 chiffres.', resetInfo2:'Saisissez le code à 6 chiffres reçu par email puis choisissez un nouveau mot de passe.', sendCode:'Envoyer le code', backBtn:'Retour', code6:'Code (6 chiffres)'
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
  var suffix = /(?:MWST|TVA|IVA)$/.test(up) ? up.match(/(MWST|TVA|IVA)$/)[1] : 'MWST';
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
  if (document.getElementById(id + 'Grid')) renderCodebox(id, id.toLowerCase().indexOf('mwst') >= 0 ? 'mwst' : 'iban');
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
  renderCodebox(prefix + 'MwstNumber', 'mwst');
}


function codeboxValueToChars(pattern, value) {
  var raw = pattern === 'mwst' ? onlyAlphaNum(value).slice(0, 15) : onlyAlphaNum(value).slice(0, 21);
  return raw.split('');
}
function getCodeboxGroups(pattern) {
  return pattern === 'mwst' ? [3, 3, 3, 3, 3] : [4, 4, 4, 4, 4, 1];
}
function getCodeboxActiveIndex(input, slots) {
  if (!input || document.activeElement !== input) return -1;
  var caret = Math.max(0, input.selectionStart || 0);
  var rawBefore = onlyAlphaNum(String(input.value || '').slice(0, caret)).length;
  if (rawBefore >= slots) return slots - 1;
  return rawBefore;
}
function renderCodebox(id, pattern) {
  var input = document.getElementById(id);
  var grid = document.getElementById(id + 'Grid');
  var field = document.getElementById(id + 'Field');
  if (!input || !grid || !field) return;
  var groups = getCodeboxGroups(pattern);
  var slots = groups.reduce(function(sum, size){ return sum + size; }, 0);
  var chars = codeboxValueToChars(pattern, input.value);
  if (!grid.dataset.ready) {
    var html = '';
    var slotIndex = 0;
    groups.forEach(function(size, groupIndex) {
      html += '<div class="codebox-group" data-group="' + groupIndex + '">';
      for (var i = 0; i < size; i++, slotIndex++) {
        html += '<div class="codebox-slot" data-slot="' + slotIndex + '"></div>';
      }
      html += '</div>';
    });
    grid.innerHTML = html;
    grid.dataset.ready = '1';
  }
  var activeIndex = getCodeboxActiveIndex(input, slots);
  Array.from(grid.querySelectorAll('.codebox-slot')).forEach(function(slot, idx) {
    var ch = chars[idx] || '';
    slot.textContent = ch;
    slot.classList.toggle('filled', !!ch);
    slot.classList.toggle('active', idx === activeIndex || (!chars.length && idx === 0 && activeIndex === 0));
  });
}
function setupCodeboxInput(id, formatter, pattern) {
  var input = document.getElementById(id);
  var field = document.getElementById(id + 'Field');
  if (!input || !field) return;
  function syncFormatted() {
    var start = input.selectionStart || input.value.length;
    var before = input.value.length;
    input.value = formatter ? formatter(input.value) : input.value;
    var after = input.value.length;
    try { input.setSelectionRange(start + (after - before), start + (after - before)); } catch(e) {}
    renderCodebox(id, pattern);
  }
  input.addEventListener('input', syncFormatted);
  input.addEventListener('keyup', function(){ renderCodebox(id, pattern); });
  input.addEventListener('click', function(){ renderCodebox(id, pattern); });
  input.addEventListener('focus', function(){ field.classList.add('is-focused'); renderCodebox(id, pattern); });
  input.addEventListener('blur', function(){ field.classList.remove('is-focused'); renderCodebox(id, pattern); });
  field.addEventListener('click', function(){ try { input.focus(); renderCodebox(id, pattern); } catch(e) {} });
  renderCodebox(id, pattern);
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
  if (el) el.textContent = text || 'Noch keine Adresse gewählt';
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
  setAddressMeta(prefix, 'Noch keine Adresse gewählt');
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
function debounce(fn, wait) {
  var tmr = null;
  return function() {
    var args = arguments, ctx = this;
    clearTimeout(tmr);
    tmr = setTimeout(function() { fn.apply(ctx, args); }, wait);
  };
}
function bindAddressAutocomplete(prefix) {
  var input = document.getElementById(prefix + 'AddressSearch');
  var box = document.getElementById(prefix + 'AddressSuggestions');
  if (!input || !box) return;
  var currentResults = [];
  function closeBox() { box.style.display = 'none'; box.innerHTML = ''; }
  function openBox() { if (box.innerHTML.trim()) box.style.display = 'block'; }
  function renderResults(items) {
    currentResults = items || [];
    box.innerHTML = '';
    if (!currentResults.length) { closeBox(); return; }
    currentResults.forEach(function(item) {
      var place = extractAddressParts(item);
      var row = document.createElement('div');
      row.className = 'suggestion-item';
      row.innerHTML = '<div class="suggestion-title">' + esc(place.address || place.label) + '</div><div class="suggestion-meta">' + esc([place.zip, place.city].filter(Boolean).join(' ')) + '</div>';
      row.addEventListener('click', function() {
        setSelectedAddress(prefix, place);
        closeBox();
      });
      box.appendChild(row);
    });
    openBox();
  }
  var runSearch = debounce(async function() {
    var q = normText(input.value);
    if (q.length < 3) { closeBox(); if (!q) clearSelectedAddress(prefix, true); return; }
    if (input.dataset.selected === '1' && q === input.value) {
      // continue searching only if user edits after selection
    }
    input.dataset.selected = '';
    try {
      var url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=ch&q=' + encodeURIComponent(q);
      var resp = await fetch(url, { headers: { 'Accept-Language': 'de' } });
      var data = await resp.json();
      renderResults(Array.isArray(data) ? data : []);
    } catch (e) {
      closeBox();
    }
  }, 250);
  input.addEventListener('input', runSearch);
  input.addEventListener('focus', function() { if (box.innerHTML.trim()) box.style.display = 'block'; });
  document.addEventListener('click', function(e) { if (!e.target.closest('.search-select-wrap')) closeBox(); });
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });
  document.title = 'BarSclusive – ' + t('portalTitle');
  // Translate placeholders
  var ph = {
    profAddressSearch: {de:'Adresse suchen und auswählen',en:'Search and select address',it:'Cerca e seleziona indirizzo',fr:'Rechercher et sélectionner une adresse'},
    profZip: {de:'PLZ',en:'ZIP',it:'CAP',fr:'NPA'},
    profCity: {de:'Stadt',en:'City',it:'Città',fr:'Ville'},
    profPhone: {de:'+41...',en:'+41...',it:'+41...',fr:'+41...'},
    profIban: {de:'CH00 0000 0000 0000 0000 0',en:'CH00 0000 0000 0000 0000 0',it:'CH00 0000 0000 0000 0000 0',fr:'CH00 0000 0000 0000 0000 0'},
    profTwint: {de:'+41...',en:'+41...',it:'+41...',fr:'+41...'},
    regAddressSearch: {de:'Adresse suchen und auswählen',en:'Search and select address',it:'Cerca e seleziona indirizzo',fr:'Rechercher et sélectionner une adresse'},
    dealTitle: {de:'z.B. 2 Cocktails für 1',en:'e.g. 2 Cocktails for 1',it:'es. 2 Cocktail per 1',fr:'ex. 2 Cocktails pour 1'},
    regIban: {de:'CH00 0000 0000 0000 0000 0',en:'CH00 0000 0000 0000 0000 0',it:'CH00 0000 0000 0000 0000 0',fr:'CH00 0000 0000 0000 0000 0'},
    regMwstNumber: {de:'CHE-123.456.789 MWST',en:'CHE-123.456.789 VAT',it:'CHE-123.456.789 IVA',fr:'CHE-123.456.789 TVA'},
    profMwstNumber: {de:'CHE-123.456.789 MWST',en:'CHE-123.456.789 VAT',it:'CHE-123.456.789 IVA',fr:'CHE-123.456.789 TVA'}
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

// ── DATA CACHE (avoids re-fetching on every tab switch) ─────────────────
var _dataCache = {
  deals: null, vouchers: null, profile: null,
  dealsLoading: false, vouchersLoading: false, profileLoading: false,
  statsLoading: false
};

function clearDataCache() {
  _dataCache = { deals: null, vouchers: null, profile: null, dealsLoading: false, vouchersLoading: false, profileLoading: false, statsLoading: false };
  _barStatsVouchers = null;
  _barStatsDeals = -1;
}

async function prefetchAllData() {
  var s = sessionGet();
  if (!s) return;
  // Fire all requests in parallel, don't await individually
  var promises = [];
  if (!_dataCache.deals) {
    _dataCache.dealsLoading = true;
    promises.push(api({ action: 'getBarDeals', token: s.token, bar_id: s.barId }).then(function(r) {
      _dataCache.dealsLoading = false;
      if (r.success) _dataCache.deals = r.deals || [];
    }).catch(function() { _dataCache.dealsLoading = false; }));
  }
  if (!_dataCache.vouchers) {
    _dataCache.vouchersLoading = true;
    promises.push(api({ action: 'getBarVouchers', token: s.token, bar_id: s.barId }).then(function(r) {
      _dataCache.vouchersLoading = false;
      if (r.success) _dataCache.vouchers = r.vouchers || [];
    }).catch(function() { _dataCache.vouchersLoading = false; }));
  }
  if (!_dataCache.profile) {
    _dataCache.profileLoading = true;
    promises.push(api({ action: 'getBarProfile', token: s.token }).then(function(r) {
      _dataCache.profileLoading = false;
      if (r.success && r.profile) _dataCache.profile = r.profile;
    }).catch(function() { _dataCache.profileLoading = false; }));
  }
  await Promise.all(promises);
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
      clearDataCache();
      prefetchAllData(); // Start loading all data in parallel
      loadBarStats();
    } else {
      err.textContent = r.error || 'Ungültige Zugangsdaten.';
      document.getElementById('loginPassword').value = '';
    }
  } catch (e) { err.textContent = 'Verbindungsfehler.'; }
}

async function doBarRegister() {
  var name    = normText(document.getElementById('regBarName').value);
  var phone   = normText(document.getElementById('regPhone').value);
  var email   = normText(document.getElementById('regBarEmail').value);
  var pass    = document.getElementById('regBarPass').value;
  var ibanRaw = normText(document.getElementById('regIban').value);
  var mwstLiable = !(document.getElementById('regNoMwst') && document.getElementById('regNoMwst').checked);
  var mwstRaw = document.getElementById('regMwstNumber') ? normText(document.getElementById('regMwstNumber').value) : '';
  var consent = document.getElementById('regConsent').checked;
  var err     = document.getElementById('regErr');
  var addr    = parseSelectedAddress('reg');
  err.textContent = '';

  if (!name || !addr.city || !addr.address || !addr.zip || !email || !pass || !ibanRaw) {
    err.textContent = 'Alle Pflichtfelder ausfüllen.';
    return;
  }
  if (!(document.getElementById('regAddressSearch') || {}).dataset.selected || !addr.latitude || !addr.longitude) {
    err.textContent = 'Bitte Adresse aus der Vorschlagsliste auswählen.';
    return;
  }
  if (!isValidIban(ibanRaw)) { err.textContent = 'Bitte eine gültige IBAN eingeben.'; return; }
  if (mwstLiable && !isValidMwst(mwstRaw)) { err.textContent = 'Bitte eine gültige MWST-Nummer eingeben.'; return; }
  if (pass.length < 8) { err.textContent = 'Passwort mind. 8 Zeichen.'; return; }
  var passConfirm = document.getElementById('regBarPassConfirm') ? document.getElementById('regBarPassConfirm').value : pass;
  if (pass !== passConfirm) { err.textContent = 'Passwörter stimmen nicht überein.'; return; }
  if (!consent) { err.textContent = 'Bitte AGB & Datenschutz akzeptieren.'; return; }

  var btn = document.getElementById('btnBarRegister');
  try {
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Registrierung läuft…'; }
    var r = await api({
      action: 'barRegister',
      name: name,
      city: addr.city,
      address: addr.address,
      zip: addr.zip,
      phone: phone,
      email: email,
      password: pass,
      iban: normalizeIban(ibanRaw),
      mwst_liable: mwstLiable,
      mwst_number: mwstLiable ? normalizeMwst(mwstRaw) : '',
      latitude: addr.latitude,
      longitude: addr.longitude
    });
    if (r.success) {
      showToast('✅ Registrierung erfolgreich! Wir melden uns zur Freischaltung.');
      document.getElementById('regBarPass').value = '';
      document.getElementById('regBarPassConfirm').value = '';
      document.getElementById('regIban').value = '';
      document.getElementById('regMwstNumber').value = '';
      clearSelectedAddress('reg');
      if (document.getElementById('regAddressSearch')) document.getElementById('regAddressSearch').value = '';
      if (document.getElementById('regBarName')) document.getElementById('regBarName').value = '';
      if (document.getElementById('regPhone')) document.getElementById('regPhone').value = '';
      if (document.getElementById('regBarEmail')) document.getElementById('regBarEmail').value = '';
      if (document.getElementById('regConsent')) document.getElementById('regConsent').checked = false;
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
    if (r.success) { showToast(r.message || 'Deal gelöscht'); _dataCache.deals = null; _barStatsDeals = -1; loadMyDeals(); }
    else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// ── OVERVIEW ─────────────────────────────────────────────────────────────
var _barStatsVouchers = null;
var _barStatsDeals = -1;
var _barStatsPeriod = 'all';
var _barCustomFrom = '';
var _barCustomTo = '';

function barFilterDate(period) {
  var now = new Date();
  if (period === 'day') { var d = new Date(now); d.setHours(0,0,0,0); return d; }
  if (period === 'week') { var d = new Date(now); d.setDate(d.getDate() - 7); return d; }
  if (period === 'month') { var d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
  if (period === 'year') { var d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
  if (period === 'custom' && _barCustomFrom) return new Date(_barCustomFrom);
  return null;
}

function barFilterDateTo(period) {
  if (period === 'custom' && _barCustomTo) { var d = new Date(_barCustomTo); d.setHours(23,59,59,999); return d; }
  return null;
}

function ensureBarFilterBar() {
  var bar = document.getElementById('barStatsFilterBar');
  if (!bar || bar.children.length > 0) return;
  var wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap;align-items:center';
  [['day',{de:'Heute',en:'Today',it:'Oggi',fr:"Aujourd'hui"}],
   ['week',{de:'Woche',en:'Week',it:'Settimana',fr:'Semaine'}],
   ['month',{de:'Monat',en:'Month',it:'Mese',fr:'Mois'}],
   ['year',{de:'Jahr',en:'Year',it:'Anno',fr:'Année'}],
   ['all',{de:'Alle',en:'All',it:'Tutti',fr:'Tous'}]
  ].forEach(function(f) {
    var btn = document.createElement('button');
    btn.className = 'bar-stats-filter-btn';
    btn.dataset.period = f[0];
    btn.textContent = f[1][currentLang] || f[1].de;
    btn.style.cssText = 'background:#222;color:#ccc;border:1px solid #333;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600';
    btn.addEventListener('click', function() { _barStatsPeriod = f[0]; highlightBarFilterBtn(f[0]); renderBarStats(f[0]); });
    wrap.appendChild(btn);
  });
  var fromInp = document.createElement('input'); fromInp.type='date'; fromInp.id='barSfFrom';
  fromInp.style.cssText = 'background:#222;color:#ccc;border:1px solid #333;padding:4px 8px;border-radius:6px;font-size:12px';
  wrap.appendChild(fromInp);
  var span = document.createElement('span'); span.textContent='–'; span.style.cssText='color:#666;font-size:12px';
  wrap.appendChild(span);
  var toInp = document.createElement('input'); toInp.type='date'; toInp.id='barSfTo';
  toInp.style.cssText = 'background:#222;color:#ccc;border:1px solid #333;padding:4px 8px;border-radius:6px;font-size:12px';
  wrap.appendChild(toInp);
  var applyBtn = document.createElement('button'); applyBtn.textContent='OK';
  applyBtn.style.cssText = 'background:#FF3366;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600';
  applyBtn.addEventListener('click', function() {
    var f = document.getElementById('barSfFrom'), tt = document.getElementById('barSfTo');
    if (!f || !f.value) { showToast(currentLang === 'de' ? 'Bitte Von-Datum wählen' : currentLang === 'en' ? 'Please choose a from date' : currentLang === 'it' ? 'Seleziona una data iniziale' : 'Veuillez choisir une date de début', true); return; }
    _barCustomFrom = f.value;
    _barCustomTo = tt ? tt.value || new Date().toISOString().split('T')[0] : '';
    _barStatsPeriod = 'custom';
    highlightBarFilterBtn('custom');
    renderBarStats('custom');
  });
  wrap.appendChild(applyBtn);
  bar.appendChild(wrap);
  highlightBarFilterBtn(_barStatsPeriod);
}

function highlightBarFilterBtn(period) {
  document.querySelectorAll('.bar-stats-filter-btn').forEach(function(b) {
    if (b.dataset.period === period) { b.style.background='#FF3366'; b.style.color='#fff'; b.style.borderColor='#FF3366'; }
    else { b.style.background='#222'; b.style.color='#ccc'; b.style.borderColor='#333'; }
  });
}

async function loadBarStats(period) {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  period = period || _barStatsPeriod || 'all';
  _barStatsPeriod = period;

  // Use cached data if available for instant render
  if (_barStatsVouchers && _barStatsDeals >= 0) {
    renderBarStats(period);
    return;
  }

  // Try to use prefetched cache
  if (_dataCache.vouchers && _dataCache.deals) {
    _barStatsVouchers = _dataCache.vouchers;
    _barStatsDeals = 0;
    _dataCache.deals.forEach(function(d) { if (d.active) _barStatsDeals++; });
    renderBarStats(period);
    return;
  }

  var grid = document.getElementById('statsGrid');
  grid.innerHTML = '<div style="color:#999;padding:20px">Laden...</div>';

  if (_dataCache.statsLoading) return;
  _dataCache.statsLoading = true;
  try {
    var [vr, dr] = await Promise.all([
      api({ action: 'getBarVouchers', token: s.token, bar_id: s.barId }),
      api({ action: 'getBarDeals', token: s.token, bar_id: s.barId })
    ]);
    _dataCache.statsLoading = false;
    _barStatsVouchers = (vr.success && vr.vouchers) ? vr.vouchers : [];
    _dataCache.vouchers = _barStatsVouchers;
    _barStatsDeals = 0;
    var deals = (dr.success && dr.deals) ? dr.deals : [];
    _dataCache.deals = deals;
    deals.forEach(function(d) { if (d.active) _barStatsDeals++; });
  } catch(e) { _dataCache.statsLoading = false; _barStatsVouchers = []; _barStatsDeals = 0; }

  renderBarStats(period);
}

function renderBarStats(period) {
  ensureBarFilterBar();
  var cutoff = barFilterDate(period);
  var dateTo = barFilterDateTo(period);
  var vouchers = _barStatsVouchers;
  if (cutoff) {
    vouchers = vouchers.filter(function(v) {
      var d = new Date(v.created_at);
      return d >= cutoff && (!dateTo || d <= dateTo);
    });
  }

  var sold = vouchers.length, redeemed = 0, notRedeemed = 0, pending = 0, paid = 0;
  vouchers.forEach(function(v) {
    if (v.status === 'redeemed') { redeemed++; if (v.payout_status === 'pending') pending += Number(v.bar_payout) || 0; }
    else { notRedeemed++; }
    if (v.payout_status === 'paid') paid += Number(v.bar_payout) || 0;
  });

  var grid = document.getElementById('statsGrid');
  grid.innerHTML = '';

  var cardsDiv = document.createElement('div');
  cardsDiv.className = 'stats-grid';
  [
    [t('soldCount') || 'Verkauft', sold, '#fff', 'sold'],
    [t('redeemed') || 'Eingelöst', redeemed, '#22c55e', 'redeemed'],
    [t('notRedeemed') || 'Nicht eingelöst', notRedeemed, '#f59e0b', 'not_redeemed'],
    [t('pendingPayout') || 'Gutschrift offen', pending.toFixed(2) + ' CHF', '#ef4444', 'pending_payout'],
    [t('paidOut') || 'Ausgezahlt', paid.toFixed(2) + ' CHF', '#3b82f6', 'paid_out'],
    [t('activeDeals') || 'Aktive Deals', _barStatsDeals, '#fff', null],
  ].forEach(function(s) {
    var card = document.createElement('div'); card.className = 'stat-card';
    if (s[3]) { card.style.cursor = 'pointer'; card.addEventListener('click', function() { showBarStatDetail(s[0], s[3], vouchers); }); }
    var lEl = document.createElement('div'); lEl.className = 'stat-label'; lEl.textContent = s[0];
    var vEl = document.createElement('div'); vEl.className = 'stat-value'; vEl.textContent = String(s[1]);
    if (s[2]) vEl.style.color = s[2];
    card.append(lEl, vEl); cardsDiv.appendChild(card);
  });
  grid.appendChild(cardsDiv);
}

function showBarStatDetail(label, filterKey, filteredVouchers) {
  var detailEl = document.getElementById('barStatsDetail');
  if (!detailEl) return;
  var items = [];
  if (filterKey === 'sold') items = filteredVouchers;
  else if (filterKey === 'redeemed') items = filteredVouchers.filter(function(v) { return v.status === 'redeemed'; });
  else if (filterKey === 'not_redeemed') items = filteredVouchers.filter(function(v) { return v.status !== 'redeemed' && v.status !== 'refunded'; });
  else if (filterKey === 'pending_payout') items = filteredVouchers.filter(function(v) { return v.status === 'redeemed' && v.payout_status === 'pending'; });
  else if (filterKey === 'paid_out') items = filteredVouchers.filter(function(v) { return v.payout_status === 'paid'; });
  else { detailEl.innerHTML = ''; return; }

  if (!items.length) { detailEl.innerHTML = '<div style="color:#666;text-align:center;padding:20px">Keine Daten für diesen Zeitraum</div>'; return; }
  var html = '<div style="font-size:16px;font-weight:700;margin:20px 0 12px">' + label + ' (' + items.length + ')</div>';
  html += '<div class="overflow-x"><table class="voucher-table"><thead><tr><th>Datum</th><th>Code</th><th>Deal</th><th>Preis</th><th>Status</th><th>Auszahl.</th></tr></thead><tbody>';
  items.forEach(function(v) {
    var sc = v.status === 'redeemed' ? '#22c55e' : v.status === 'refunded' ? '#ef4444' : '#f59e0b';
    var st = v.status === 'redeemed' ? 'Eingelöst' : v.status === 'refunded' ? 'Erstattet' : 'Offen';
    var pc = v.payout_status === 'paid' ? '#3b82f6' : '#ef4444';
    var pt = v.payout_status === 'paid' ? 'Bezahlt' : 'Ausstehend';
    html += '<tr><td style="font-size:11px">' + (v.created_at ? new Date(v.created_at).toLocaleDateString('de-CH') : '-') + '</td><td style="font-family:monospace">' + ((v.code_display || v.code) || '-') + '</td><td>' + (v.deal_title || '-') + '</td><td style="text-align:right">' + Number(v.price_paid || 0).toFixed(2) + '</td><td><span style="color:' + sc + ';font-weight:600">' + st + '</span></td><td><span style="color:' + pc + ';font-weight:600">' + pt + '</span></td></tr>';
  });
  html += '</tbody></table></div>';
  detailEl.innerHTML = html;
}

// ── MY DEALS ──────────────────────────────────────────────────────────────
async function loadMyDeals() {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  // Show cached data instantly
  if (_dataCache.deals) { renderMyDeals(_dataCache.deals); }
  else {
    var el = document.getElementById('dealList');
    el.innerHTML = '<div class="empty" style="padding:20px;color:#999">Laden...</div>';
  }
  // Refresh in background
  if (_dataCache.dealsLoading) return;
  _dataCache.dealsLoading = true;
  try {
    var r = await api({ action: 'getBarDeals', token: s.token, bar_id: s.barId });
    _dataCache.dealsLoading = false;
    if (!r.success) { if (!_dataCache.deals) showToast(r.error || 'Fehler', true); return; }
    _dataCache.deals = r.deals || [];
    renderMyDeals(_dataCache.deals);
  } catch (e) { _dataCache.dealsLoading = false; if (!_dataCache.deals) showToast('Verbindungsfehler', true); }
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
    if (r.success) { showToast(active ? '✅ Aktiviert' : '⏸ Deaktiviert'); _dataCache.deals = null; _barStatsDeals = -1; loadMyDeals(); }
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
  // Image preview
  var editPreview = document.getElementById('editImagePreview');
  var editPreviewImg = document.getElementById('editImagePreviewImg');
  if (editPreview && editPreviewImg && deal.image_url) {
    var previewUrl = deal.image_url;
    if (previewUrl.indexOf('lh3.googleusercontent.com/d/') >= 0) { var pfid = previewUrl.split('/d/')[1]; if (pfid) previewUrl = 'https://drive.google.com/thumbnail?id=' + pfid + '&sz=w400'; }
    editPreviewImg.src = previewUrl; editPreviewImg.referrerPolicy = 'no-referrer'; editPreview.style.display = 'block';
  } else if (editPreview) { editPreview.style.display = 'none'; }
  var editFile = document.getElementById('editImageFile');
  if (editFile) editFile.value = '';
  document.getElementById('editActive').checked = !!deal.active;

  // Validity type
  var vType = deal.validity_type || 'recurring';
  var vRecurring = document.getElementById('editVTypeRecurring');
  var vSingle = document.getElementById('editVTypeSingle');
  if (vRecurring) vRecurring.checked = (vType === 'recurring');
  if (vSingle) vSingle.checked = (vType === 'single');
  var ef1 = document.getElementById('editRecurringFields');
  var ef2 = document.getElementById('editSingleFields');
  if (ef1) ef1.style.display = vType === 'recurring' ? 'block' : 'none';
  if (ef2) ef2.style.display = vType === 'single' ? 'block' : 'none';

  // Weekdays
  var wds = deal.valid_weekdays || [];
  document.querySelectorAll('#editWeekdays .wd-btn').forEach(function(b) {
    b.classList.toggle('selected', wds.indexOf(b.getAttribute('data-wd')) !== -1);
  });

  // Single date
  var sd = document.getElementById('editSingleDate');
  if (sd) sd.value = deal.valid_single_date || '';

  // Time from/to
  var tf = document.getElementById('editTimeFrom');
  var tt = document.getElementById('editTimeTo');
  if (tf) tf.value = deal.valid_from_time || '';
  if (tt) tt.value = deal.valid_to_time || '';

  // Time slots
  var ts = deal.time_slots || [];
  document.querySelectorAll('input[name="editTimeSlot"]').forEach(function(c) {
    c.checked = ts.indexOf(c.value) !== -1;
  });

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
    image_url:      document.getElementById('editImageUrl').value.trim(),
    active:         document.getElementById('editActive').checked,
    validity_type:  (document.querySelector('input[name="editValidType"]:checked') || {}).value || 'recurring',
    valid_weekdays: Array.from(document.querySelectorAll('#editWeekdays .wd-btn.selected')).map(function(b) { return b.getAttribute('data-wd'); }),
    valid_single_date: (document.getElementById('editSingleDate') || {}).value || '',
    valid_from_time: (document.getElementById('editTimeFrom') || {}).value || '',
    valid_to_time:   (document.getElementById('editTimeTo') || {}).value || '',
    time_slots:     Array.from(document.querySelectorAll('input[name="editTimeSlot"]:checked')).map(function(c) { return c.value; }),
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
      _dataCache.deals = null;
      closeEditModal();
      loadMyDeals();
    } else showToast(r.error || 'Fehler', true);
  } catch (e) { showToast('Verbindungsfehler', true); }
}

// ── VOUCHERS TAB ──────────────────────────────────────────────────────────
async function loadMyVouchers() {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  if (_dataCache.vouchers) { renderVouchers(_dataCache.vouchers); }
  else {
    var tbody = document.getElementById('voucherBody');
    tbody.innerHTML = '<tr><td colspan="6" style="padding:20px;text-align:center;color:#999">Laden...</td></tr>';
  }
  if (_dataCache.vouchersLoading) return;
  _dataCache.vouchersLoading = true;
  try {
    var r = await api({ action: 'getBarVouchers', token: s.token, bar_id: s.barId });
    _dataCache.vouchersLoading = false;
    if (!r.success) { if (!_dataCache.vouchers) showToast(r.error || 'Fehler', true); return; }
    _dataCache.vouchers = r.vouchers || [];
    renderVouchers(_dataCache.vouchers);
  } catch (e) { _dataCache.vouchersLoading = false; if (!_dataCache.vouchers) showToast('Verbindungsfehler', true); }
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
      mkTd(v.code_display || v.code),
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
      _dataCache.vouchers = null; _barStatsVouchers = null;
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
      var file = imgF.files[0];
      if (file.size > 5 * 1024 * 1024) { showToast('Bild zu gross (max 5MB)', true); return; }
      try {
        var b64 = await fileToBase64(file);
        var uR = await api({ action: 'uploadImage', token: s.token, image_data: b64, filename: file.name });
        if (uR.success) { imageUrl = uR.url; }
        else { showToast('Bild-Upload: ' + (uR.error || 'Fehler'), true); return; }
      } catch(e) { showToast('Bild-Upload fehlgeschlagen', true); return; }
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
      _dataCache.deals = null; _barStatsVouchers = null; _barStatsDeals = -1;
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
  redeem:'dashRedeem', settings:'dashSettings'
};
var TAB_LOADERS = {
  overview: loadBarStats, mydeals: loadMyDeals, settings: loadProfile,
  redeem: function() {}
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
var API_TIMEOUT_MS = 15000;
async function api(body) {
  var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var timeoutId = controller ? setTimeout(function() {
    try { controller.abort(); } catch(e) {}
  }, API_TIMEOUT_MS) : null;
  try {
    var r = await fetch(BACKEND_URL, {
      method: 'POST',
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller ? controller.signal : undefined
    });
    var data = await r.json();
    return data;
  } catch (e) {
    if (e && (e.name === 'AbortError' || /aborted|timeout/i.test(String(e.message || '')))) {
      var timeoutErr = new Error('Request timeout');
      timeoutErr.code = 'REQUEST_TIMEOUT';
      throw timeoutErr;
    }
    throw e;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
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
    var el = document.getElementById('barNameDisplay');
    if (el) el.textContent = s.barName || '';
    var logBtn = document.getElementById('btnLogout');
    if (logBtn) logBtn.style.display = 'block';
    prefetchAllData(); // Pre-load all data in background
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
  // Show cached profile instantly
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
  setAddressMeta('prof', [b.address, b.zip, b.city].filter(Boolean).join(', ') || 'Noch keine Adresse gewählt');
  if (el('profAddressSearch')) el('profAddressSearch').dataset.selected = b.address ? '1' : '';
}

async function saveProfile() {
  var s = sessionGet();
  if (!s) { doLogout(); return; }
  var addr = parseSelectedAddress('prof');
  var ibanRaw = normText(document.getElementById('profIban').value);
  var mwstLiable = !(document.getElementById('profNoMwst') && document.getElementById('profNoMwst').checked);
  var mwstRaw = document.getElementById('profMwstNumber') ? normText(document.getElementById('profMwstNumber').value) : '';

  if (!addr.address || !addr.city || !addr.zip) { showToast('Bitte zuerst eine Adresse auswählen.', true); return; }
  if (!addr.latitude || !addr.longitude) { showToast('Für die Adresse fehlen Koordinaten.', true); return; }
  if (ibanRaw && !isValidIban(ibanRaw)) { showToast('Bitte eine gültige IBAN eingeben.', true); return; }
  if (mwstLiable && !isValidMwst(mwstRaw)) { showToast('Bitte eine gültige MWST-Nummer eingeben.', true); return; }

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
    if (r.success) { _dataCache.profile = null; showToast(t('profileSaved') || 'Gespeichert'); ['profIban','profMwstNumber'].forEach(function(id){ if(document.getElementById(id)) renderCodebox(id, id.toLowerCase().indexOf('mwst') >= 0 ? 'mwst' : 'iban'); }); }
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

  // Edit modal: weekday toggles
  document.querySelectorAll('#editWeekdays .wd-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { this.classList.toggle('selected'); });
  });
  // Edit modal: validity type toggle
  document.querySelectorAll('input[name="editValidType"]').forEach(function(r) {
    r.addEventListener('change', function() {
      var isRec = this.value === 'recurring';
      var ef1 = document.getElementById('editRecurringFields');
      var ef2 = document.getElementById('editSingleFields');
      if (ef1) ef1.style.display = isRec ? 'block' : 'none';
      if (ef2) ef2.style.display = isRec ? 'none' : 'block';
    });
  });

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
  // MWST and formatting
  setupCodeboxInput('regIban', formatIbanDisplay, 'iban');
  setupCodeboxInput('profIban', formatIbanDisplay, 'iban');
  setupCodeboxInput('regMwstNumber', formatMwstDisplay, 'mwst');
  setupCodeboxInput('profMwstNumber', formatMwstDisplay, 'mwst');

  var regNoMwst = document.getElementById('regNoMwst');
  if (regNoMwst) regNoMwst.addEventListener('change', function() { updateMwstVisibility('reg'); });
  var profNoMwst = document.getElementById('profNoMwst');
  if (profNoMwst) profNoMwst.addEventListener('change', function() { updateMwstVisibility('prof'); });
  updateMwstVisibility('reg');
  updateMwstVisibility('prof');

  bindAddressAutocomplete('reg');
  bindAddressAutocomplete('prof');

  // Geocode + map helper
  var _profMap = null, _profMarker = null;
  var _regMap = null, _regMarker = null;

  function showMapPin(mapId, wrapId, lat, lng, existingMap, existingMarker) {
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
    return { map: existingMap, marker: existingMarker };
  }

  // Settings geocode button
  var btnGeocode = document.getElementById('btnGeocode');
  if (btnGeocode) btnGeocode.addEventListener('click', async function() {
    var addr = parseSelectedAddress('prof');
    if (!addr.latitude || !addr.longitude) { showToast('Bitte zuerst eine Adresse aus der Liste wählen', true); return; }
    var lat = Number(addr.latitude), lng = Number(addr.longitude);
    var r = showMapPin('profMap', 'profMapWrap', lat, lng, _profMap, _profMarker);
    _profMap = r.map; _profMarker = r.marker;
    _profMarker.off('dragend');
    _profMarker.on('dragend', function(e) {
      var p = e.target.getLatLng();
      document.getElementById('profLat').value = p.lat.toFixed(6);
      document.getElementById('profLng').value = p.lng.toFixed(6);
    });
    showToast('📍 Standort geladen');
  });

  // Registration geocode button
  var btnRegGeo = document.getElementById('btnRegGeocode');
  if (btnRegGeo) btnRegGeo.addEventListener('click', async function() {
    var addr = parseSelectedAddress('reg');
    if (!addr.latitude || !addr.longitude) { showToast('Bitte zuerst eine Adresse aus der Liste wählen', true); return; }
    var lat = Number(addr.latitude), lng = Number(addr.longitude);
    var r = showMapPin('regMap', 'regMapWrap', lat, lng, _regMap, _regMarker);
    _regMap = r.map; _regMarker = r.marker;
    _regMarker.off('dragend');
    _regMarker.on('dragend', function(e) {
      var p = e.target.getLatLng();
      document.getElementById('regLat').value = p.lat.toFixed(6);
      document.getElementById('regLng').value = p.lng.toFixed(6);
    });
    showToast('📍 Standort geladen – Pin verschiebbar!');
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



function escHtml(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, function(ch) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
  });
}

// =============================================
// FINAL PATCHES: translations, overview, voucher filters, detail timeline
// =============================================
(function(){
  Object.assign(TRANSLATIONS.de, {
    grossSales:'Umsatz', commissionLbl:'Provision', netRevenue:'Netto für die Bar', voucherFilters:'Gutscheinfilter', statusLbl:'Status', allStatuses:'Alle Status', openLbl:'Offen', refundedLbl:'Erstattet', paidAtLbl:'Bezahlt am', boughtAtLbl:'Kaufdatum', detailTitle:'Gutscheindetails', timelineLbl:'Statusverlauf', paidOutNetHint:'Ausgezahlt zeigt den Betrag nach Abzug der Provision.', overviewDetailHint:'Die Datumsangaben beziehen sich auf den jeweiligen Status.', refundRequested:'Rückerstattung angefordert', voucherListTitle:'Gutscheine', filterApply:'Anwenden', filterReset:'Zurücksetzen', paidLbl:'Bezahlt', allLbl:'Alle', statusIssued:'Offen', statusRedeemed:'Eingelöst', statusRefunded:'Erstattet', payoutPending:'Ausstehend', payoutPaid:'Bezahlt', payoutNone:'Keine Auszahlung', createdAtLbl:'Erstellt am', redeemedAtLbl:'Eingelöst am', noDataPeriod:'Keine Daten für diesen Zeitraum', locationHelp:'Wird aus der gewählten Adresse übernommen und kann auf der Karte feinjustiert werden.', profileAddressHelp:'Adresse aus der Vorschlagsliste wählen. Die Koordinaten für Karte und Distanz werden automatisch übernommen.'
  });
  Object.assign(TRANSLATIONS.en, {
    grossSales:'Gross sales', commissionLbl:'Commission', netRevenue:'Net for the bar', voucherFilters:'Voucher filters', statusLbl:'Status', allStatuses:'All statuses', openLbl:'Open', refundedLbl:'Refunded', paidAtLbl:'Paid at', boughtAtLbl:'Purchase date', detailTitle:'Voucher details', timelineLbl:'Status history', paidOutNetHint:'Paid out shows the amount after commission.', overviewDetailHint:'Dates refer to the respective status.', refundRequested:'Refund requested', voucherListTitle:'Vouchers', filterApply:'Apply', filterReset:'Reset', paidLbl:'Paid', allLbl:'All', statusIssued:'Open', statusRedeemed:'Redeemed', statusRefunded:'Refunded', payoutPending:'Pending', payoutPaid:'Paid', payoutNone:'No payment', createdAtLbl:'Created at', redeemedAtLbl:'Redeemed at', noDataPeriod:'No data for this period', locationHelp:'Taken from the selected address and can be fine-tuned on the map.', profileAddressHelp:'Choose the address from the suggestion list. Coordinates for map and distance are filled automatically.'
  });
  Object.assign(TRANSLATIONS.it, {
    grossSales:'Fatturato', commissionLbl:'Commissione', netRevenue:'Netto per il bar', voucherFilters:'Filtri voucher', statusLbl:'Stato', allStatuses:'Tutti gli stati', openLbl:'Aperto', refundedLbl:'Rimborsato', paidAtLbl:'Pagato il', boughtAtLbl:'Data acquisto', detailTitle:'Dettagli voucher', timelineLbl:'Cronologia stati', paidOutNetHint:'Pagato indica l’importo dopo la commissione.', overviewDetailHint:'Le date si riferiscono al relativo stato.', refundRequested:'Rimborso richiesto', voucherListTitle:'Voucher', filterApply:'Applica', filterReset:'Reset', paidLbl:'Pagato', allLbl:'Tutti', statusIssued:'Aperto', statusRedeemed:'Riscattato', statusRefunded:'Rimborsato', payoutPending:'In sospeso', payoutPaid:'Pagato', payoutNone:'Nessun pagamento', createdAtLbl:'Creato il', redeemedAtLbl:'Riscattato il', noDataPeriod:'Nessun dato per questo periodo', locationHelp:'Viene presa dall’indirizzo selezionato e può essere corretta sulla mappa.', profileAddressHelp:'Seleziona l’indirizzo dalla lista dei suggerimenti. Le coordinate per mappa e distanza vengono compilate automaticamente.'
  });
  Object.assign(TRANSLATIONS.fr, {
    grossSales:'Chiffre d’affaires', commissionLbl:'Commission', netRevenue:'Net pour le bar', voucherFilters:'Filtres bons', statusLbl:'Statut', allStatuses:'Tous les statuts', openLbl:'Ouvert', refundedLbl:'Remboursé', paidAtLbl:'Payé le', boughtAtLbl:'Date d’achat', detailTitle:'Détails du bon', timelineLbl:'Historique des statuts', paidOutNetHint:'Payé affiche le montant après commission.', overviewDetailHint:'Les dates se réfèrent au statut correspondant.', refundRequested:'Remboursement demandé', voucherListTitle:'Bons', filterApply:'Appliquer', filterReset:'Réinitialiser', paidLbl:'Payé', allLbl:'Tous', statusIssued:'Ouvert', statusRedeemed:'Utilisé', statusRefunded:'Remboursé', payoutPending:'En attente', payoutPaid:'Payé', payoutNone:'Aucun paiement', createdAtLbl:'Créé le', redeemedAtLbl:'Utilisé le', noDataPeriod:'Aucune donnée pour cette période', locationHelp:'Repris depuis l’adresse choisie et peut être ajusté sur la carte.', profileAddressHelp:'Choisissez l’adresse dans la liste des suggestions. Les coordonnées pour la carte et la distance sont remplies automatiquement.'
  });
})();

function trStatus_(status) {
  var s = String(status || '').toLowerCase();
  if (s === 'redeemed') return t('statusRedeemed');
  if (s === 'refunded') return t('statusRefunded');
  return t('statusIssued');
}
function isRefundedVoucher_(v) {
  return String((v && v.status) || '').toLowerCase() === 'refunded';
}
function getVoucherMoney_(v) {
  if (isRefundedVoucher_(v)) return { price: 0, fee: 0, payout: 0 };
  return {
    price: Number((v && v.price_paid) || 0),
    fee: Number((v && v.platform_fee) || 0),
    payout: Number((v && v.bar_payout) || 0)
  };
}
function getVoucherPayoutFilterValue_(v) {
  if (isRefundedVoucher_(v)) return 'none';
  return String((v && v.payout_status) || '').toLowerCase() === 'paid' ? 'paid' : 'pending';
}
function trPayout_(status, v) {
  if (isRefundedVoucher_(v)) return t('payoutNone');
  return String(status || '').toLowerCase() === 'paid' ? t('payoutPaid') : t('payoutPending');
}
function fmtDate_(v) {
  if (!v) return '–';
  try { return new Date(v).toLocaleDateString(currentLang === 'en' ? 'en-GB' : currentLang === 'it' ? 'it-CH' : currentLang === 'fr' ? 'fr-CH' : 'de-CH'); } catch(e) { return String(v); }
}
function fmtDateTime_(v) {
  if (!v) return '–';
  try { return new Date(v).toLocaleString(currentLang === 'en' ? 'en-GB' : currentLang === 'it' ? 'it-CH' : currentLang === 'fr' ? 'fr-CH' : 'de-CH'); } catch(e) { return String(v); }
}
function getCurrentVoucherFilters_() {
  return {
    from: (document.getElementById('voucherFilterFrom') || {}).value || '',
    to: (document.getElementById('voucherFilterTo') || {}).value || '',
    status: (document.getElementById('voucherFilterStatus') || {}).value || 'all',
    payout: (document.getElementById('voucherFilterPayout') || {}).value || 'all'
  };
}
function applyVoucherFilters_(vouchers) {
  var f = getCurrentVoucherFilters_();
  return (vouchers || []).filter(function(v) {
    var baseDate = v.order_created_at || v.created_at || '';
    var d = baseDate ? new Date(baseDate) : null;
    if (f.from && d && d < new Date(f.from + 'T00:00:00')) return false;
    if (f.to && d && d > new Date(f.to + 'T23:59:59')) return false;
    if (f.status !== 'all' && String(v.status || '') !== f.status) return false;
    if (f.payout !== 'all' && getVoucherPayoutFilterValue_(v) !== f.payout) return false;
    return true;
  });
}
function renderVoucherPanel_(targetId, vouchers) {
  var root = document.getElementById(targetId);
  if (!root) return;
  vouchers = vouchers || [];
  var f = getCurrentVoucherFilters_();
  var filtered = applyVoucherFilters_(vouchers);
  var sums = filtered.reduce(function(acc, v) {
    var money = getVoucherMoney_(v);
    acc.price += money.price;
    acc.fee += money.fee;
    acc.payout += money.payout;
    return acc;
  }, { price: 0, fee: 0, payout: 0 });
  var rows = filtered.map(function(v) {
    var money = getVoucherMoney_(v);
    return '<tr class="click-row" data-voucher-id="' + escHtml(String(v.id || '')) + '">' +
      '<td>' + escHtml(fmtDate_(v.order_created_at || v.created_at)) + '</td>' +
      '<td style="font-family:monospace">' + escHtml(String(v.code_display || v.code || '–')) + '</td>' +
      '<td>' + escHtml(String(v.deal_title || '')) + '</td>' +
      '<td style="text-align:right">CHF ' + money.price.toFixed(2) + '</td>' +
      '<td style="text-align:right;color:#ef4444">CHF ' + money.fee.toFixed(2) + '</td>' +
      '<td style="text-align:right;color:#22c55e">CHF ' + money.payout.toFixed(2) + '</td>' +
      '<td>' + escHtml(trStatus_(v.status)) + '</td>' +
      '<td>' + escHtml(trPayout_(v.payout_status, v)) + '</td>' +
      '</tr>';
  }).join('');
  root.innerHTML = '' +
    '<div class="filter-panel">' +
      '<div style="font-size:15px;font-weight:700;margin-bottom:12px">' + t('voucherFilters') + '</div>' +
      '<div class="filter-inline">' +
        '<div><label class="form-label">' + t('fromLbl') + '</label><input type="date" class="form-input" id="voucherFilterFrom" value="' + escHtml(f.from) + '"></div>' +
        '<div><label class="form-label">' + t('toLbl') + '</label><input type="date" class="form-input" id="voucherFilterTo" value="' + escHtml(f.to) + '"></div>' +
        '<div><label class="form-label">' + t('statusLbl') + '</label><select class="form-input" id="voucherFilterStatus"><option value="all">' + t('allStatuses') + '</option><option value="issued">' + t('openLbl') + '</option><option value="sent">' + t('openLbl') + '</option><option value="redeemed">' + t('redeemed') + '</option><option value="refunded">' + t('refundedLbl') + '</option></select></div>' +
        '<div><label class="form-label">' + t('paidLbl') + '</label><select class="form-input" id="voucherFilterPayout"><option value="all">' + t('allLbl') + '</option><option value="pending">' + t('payoutPending') + '</option><option value="paid">' + t('payoutPaid') + '</option><option value="none">' + t('payoutNone') + '</option></select></div>' +
        '<div><button class="btn-pink" id="voucherApplyBtn" style="width:auto;padding:12px 18px">' + t('filterApply') + '</button></div>' +
        '<div><button class="btn-ghost" id="voucherResetBtn" style="width:auto;padding:12px 18px;margin-top:0">' + t('filterReset') + '</button></div>' +
      '</div>' +
    '</div>' +
    '<div class="money-grid">' +
      '<div class="money-card"><div class="money-label">' + t('grossSales') + '</div><div class="money-value">CHF ' + sums.price.toFixed(2) + '</div></div>' +
      '<div class="money-card"><div class="money-label">' + t('commissionLbl') + '</div><div class="money-value" style="color:#ef4444">CHF ' + sums.fee.toFixed(2) + '</div></div>' +
      '<div class="money-card"><div class="money-label">' + t('netRevenue') + '</div><div class="money-value" style="color:#22c55e">CHF ' + sums.payout.toFixed(2) + '</div></div>' +
    '</div>' +
    '<div style="color:#999;font-size:12px;margin-bottom:10px">' + t('paidOutNetHint') + ' ' + t('overviewDetailHint') + '</div>' +
    '<div class="overflow-x"><table class="voucher-table"><thead><tr><th>' + t('boughtAtLbl') + '</th><th>' + t('codeLbl') + '</th><th>' + t('dealLbl') + '</th><th>' + t('priceLbl') + '</th><th>' + t('commissionLbl') + '</th><th>' + t('netRevenue') + '</th><th>' + t('statusLbl') + '</th><th>' + t('paidLbl') + '</th></tr></thead><tbody>' +
      (rows || '<tr><td colspan="8" style="padding:18px;color:#666;text-align:center">' + t('noDataPeriod') + '</td></tr>') +
    '</tbody></table></div>';
  var sEl = document.getElementById('voucherFilterStatus'); if (sEl) sEl.value = f.status;
  var pEl = document.getElementById('voucherFilterPayout'); if (pEl) pEl.value = f.payout;
  var applyBtn = document.getElementById('voucherApplyBtn'); if (applyBtn) applyBtn.onclick = function(){ renderVoucherPanel_(targetId, vouchers); };
  var resetBtn = document.getElementById('voucherResetBtn'); if (resetBtn) resetBtn.onclick = function(){
    var ids=['voucherFilterFrom','voucherFilterTo']; ids.forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
    var a=document.getElementById('voucherFilterStatus'); if(a) a.value='all';
    var b=document.getElementById('voucherFilterPayout'); if(b) b.value='all';
    renderVoucherPanel_(targetId, vouchers);
  };
  Array.prototype.forEach.call(root.querySelectorAll('tr.click-row'), function(row){
    row.addEventListener('click', function(){
      var id = this.getAttribute('data-voucher-id');
      var found = (vouchers || []).find(function(v){ return String(v.id) === String(id); });
      if (found) openVoucherDetail(found);
    });
  });
}
function openVoucherDetail(v) {
  var modal = document.getElementById('voucherDetailModal');
  var title = document.getElementById('voucherDetailTitle');
  var body = document.getElementById('voucherDetailBody');
  if (!modal || !body || !title) return;
  title.textContent = '🎟️ ' + (t('detailTitle'));
  var timeline = [];
  timeline.push({ title: t('createdAtLbl'), when: v.order_created_at || v.created_at, meta: v.deal_title || '' });
  if (v.paid_at) timeline.push({ title: t('paidAtLbl'), when: v.paid_at, meta: t('paidLbl') });
  if (v.redeemed_at) timeline.push({ title: t('redeemedAtLbl'), when: v.redeemed_at, meta: t('statusRedeemed') });
  if (v.refund_requested_at) timeline.push({ title: t('refundReq'), when: v.refund_requested_at, meta: t('refundRequested') || '' });
  if (v.refunded_at) timeline.push({ title: t('refundedLbl'), when: v.refunded_at, meta: t('statusRefunded') });
  if (v.payout_paid_at && !isRefundedVoucher_(v)) timeline.push({ title: t('paidOut') || t('paidLbl'), when: v.payout_paid_at, meta: t('payoutPaid') });
  var money = getVoucherMoney_(v);
  body.innerHTML = '' +
    '<div class="money-grid">' +
      '<div class="money-card"><div class="money-label">' + t('priceLbl') + '</div><div class="money-value">CHF ' + money.price.toFixed(2) + '</div></div>' +
      '<div class="money-card"><div class="money-label">' + t('commissionLbl') + '</div><div class="money-value" style="color:#ef4444">CHF ' + money.fee.toFixed(2) + '</div></div>' +
      '<div class="money-card"><div class="money-label">' + t('netRevenue') + '</div><div class="money-value" style="color:#22c55e">CHF ' + money.payout.toFixed(2) + '</div></div>' +
    '</div>' +
    '<div style="font-size:14px;font-weight:700;margin-bottom:8px">' + escHtml(v.deal_title || '') + '</div>' +
    '<div style="color:#999;font-size:13px;margin-bottom:14px">' + t('codeLbl') + ': <span style="font-family:monospace">' + escHtml(String(v.code_display || v.code || '–')) + '</span></div>' +
    '<div class="timeline-list">' + timeline.map(function(it){ return '<div class="timeline-item"><div class="timeline-dot"></div><div><div class="timeline-title">' + escHtml(it.title) + '</div><div class="timeline-meta">' + escHtml(fmtDateTime_(it.when)) + (it.meta ? ' · ' + escHtml(it.meta) : '') + '</div></div></div>'; }).join('') + '</div>';
  modal.classList.add('active');
}
function closeVoucherDetail(){ var m=document.getElementById('voucherDetailModal'); if(m) m.classList.remove('active'); }

// Override setLang to also rebuild dynamic translated controls
var _oldSetLangPatched = setLang;
setLang = function(lang) {
  _oldSetLangPatched(lang);
  var bar = document.getElementById('barStatsFilterBar');
  if (bar) bar.innerHTML = '';
  if (_barStatsVouchers) renderBarStats(_barStatsPeriod || 'all');
  if (_dataCache.vouchers) renderMyVouchers(_dataCache.vouchers);
};

function renderBarStats(period) {
  ensureBarFilterBar();
  var cutoff = barFilterDate(period);
  var dateTo = barFilterDateTo(period);
  var vouchers = (_barStatsVouchers || []).filter(function(v) {
    var d = new Date(v.order_created_at || v.created_at || '');
    return !cutoff || (d >= cutoff && (!dateTo || d <= dateTo));
  });
  var sold = vouchers.length;
  var redeemed = vouchers.filter(function(v){ return v.status === 'redeemed'; }).length;
  var notRedeemed = vouchers.filter(function(v){ return v.status !== 'redeemed' && v.status !== 'refunded'; }).length;
  var gross = vouchers.reduce(function(a,v){ return a + getVoucherMoney_(v).price; }, 0);
  var fees = vouchers.reduce(function(a,v){ return a + getVoucherMoney_(v).fee; }, 0);
  var net = vouchers.reduce(function(a,v){ return a + getVoucherMoney_(v).payout; }, 0);
  var pending = vouchers.filter(function(v){ return v.status === 'redeemed' && !isRefundedVoucher_(v) && getVoucherPayoutFilterValue_(v) === 'pending'; }).reduce(function(a,v){ return a + getVoucherMoney_(v).payout; }, 0);
  var paid = vouchers.filter(function(v){ return !isRefundedVoucher_(v) && getVoucherPayoutFilterValue_(v) === 'paid'; }).reduce(function(a,v){ return a + getVoucherMoney_(v).payout; }, 0);

  var grid = document.getElementById('statsGrid'); if (!grid) return;
  grid.innerHTML = '';
  var cardsDiv = document.createElement('div'); cardsDiv.className = 'stats-grid';
  [
    [t('soldCount'), sold, '#fff', 'sold'],
    [t('redeemed'), redeemed, '#22c55e', 'redeemed'],
    [t('notRedeemed'), notRedeemed, '#f59e0b', 'not_redeemed'],
    [t('grossSales'), gross.toFixed(2) + ' CHF', '#fff', 'all'],
    [t('commissionLbl'), fees.toFixed(2) + ' CHF', '#ef4444', 'all'],
    [t('netRevenue'), net.toFixed(2) + ' CHF', '#22c55e', 'all'],
    [t('pendingPayout'), pending.toFixed(2) + ' CHF', '#ef4444', 'pending_payout'],
    [t('paidOut'), paid.toFixed(2) + ' CHF', '#3b82f6', 'paid_out'],
    [t('activeDeals'), _barStatsDeals, '#fff', null]
  ].forEach(function(s) {
    var card = document.createElement('div'); card.className = 'stat-card';
    var lEl = document.createElement('div'); lEl.className = 'stat-label'; lEl.textContent = s[0];
    var vEl = document.createElement('div'); vEl.className = 'stat-value'; vEl.textContent = String(s[1]); if (s[2]) vEl.style.color = s[2];
    card.append(lEl, vEl);
    if (s[3]) { card.style.cursor = 'pointer'; card.addEventListener('click', function(){ showBarStatDetail(s[0], s[3], vouchers); }); }
    cardsDiv.appendChild(card);
  });
  grid.appendChild(cardsDiv);
}
function showBarStatDetail(label, filterKey, filteredVouchers) {
  var detailEl = document.getElementById('barStatsDetail');
  if (!detailEl) return;
  var items = filteredVouchers || [];
  if (filterKey === 'redeemed') items = items.filter(function(v){ return v.status === 'redeemed'; });
  else if (filterKey === 'not_redeemed') items = items.filter(function(v){ return v.status !== 'redeemed' && v.status !== 'refunded'; });
  else if (filterKey === 'pending_payout') items = items.filter(function(v){ return v.status === 'redeemed' && !isRefundedVoucher_(v) && getVoucherPayoutFilterValue_(v) === 'pending'; });
  else if (filterKey === 'paid_out') items = items.filter(function(v){ return !isRefundedVoucher_(v) && getVoucherPayoutFilterValue_(v) === 'paid'; });
  detailEl.innerHTML = '<div style="font-size:16px;font-weight:700;margin:20px 0 12px">' + escHtml(label) + ' (' + items.length + ')</div><div id="overviewVoucherPanel"></div>';
  renderVoucherPanel_('overviewVoucherPanel', items);
}
function renderMyVouchers(vouchers) { renderVoucherPanel_('vouchersPanel', vouchers || []); }
var _oldLoadMyVouchers = loadMyVouchers;
loadMyVouchers = async function(){ var s=sessionGet(); if(!s){ doLogout(); return; } if(_dataCache.vouchers){ renderMyVouchers(_dataCache.vouchers);} try{ var r = await api({ action:'getBarVouchers', token:s.token, bar_id:s.barId }); if(r.success){ _dataCache.vouchers = r.vouchers || []; _barStatsVouchers = _dataCache.vouchers; renderMyVouchers(_dataCache.vouchers); } }catch(e){} };

document.addEventListener('DOMContentLoaded', function(){
  var close = document.getElementById('btnCloseVoucherDetail'); if (close) close.addEventListener('click', closeVoucherDetail);
  var modal = document.getElementById('voucherDetailModal'); if (modal) modal.addEventListener('click', function(e){ if (e.target === this) closeVoucherDetail(); });
});


// =============================================
// STRICT PATCH: MWST codeboxes + runtime i18n cleanup
// =============================================
Object.assign(TRANSLATIONS.de, {
  fillAllFields:'Bitte alle Felder ausfüllen.', fillRequiredFields:'Alle Pflichtfelder ausfüllen.',
  invalidAddressChoice:'Bitte Adresse aus der Vorschlagsliste auswählen.', invalidIban:'Bitte eine gültige IBAN eingeben.',
  invalidMwst:'Bitte eine gültige MWST-Nummer eingeben.', passwordMinErr:'Passwort mind. 8 Zeichen.',
  passwordsNoMatch:'Passwörter stimmen nicht überein.', acceptTermsError:'Bitte AGB & Datenschutz akzeptieren.',
  networkError:'Verbindungsfehler.', invalidCredentials:'Ungültige Zugangsdaten.', registrationSuccessDetailed:'✅ Registrierung erfolgreich! Wir melden uns zur Freischaltung.',
  registrationError:'Fehler bei der Registrierung.', codeRequired:'Code eingeben.', invalidVoucher:'Ungültiger Gutschein.',
  changePasswordSuccess:'✅ Passwort geändert!', genericError:'Fehler.', titleRequired:'Titel ist Pflichtfeld', dealPriceRequired:'Deal-Preis ist Pflichtfeld',
  pauschalDiscountMin:'Rabatt mind. 15%', pauschalMinOrder:'Mindestbestellung mind. 40 CHF', chooseOneCategory:'Mind. 1 Kategorie wählen',
  chooseDate:'Datum wählen', imageTooLarge:'Bild zu gross (max 5MB)', imageUploadPrefix:'Bild-Upload:', imageUploadFailed:'Bild-Upload fehlgeschlagen',
  dealCreatedSuccess:'✅ Deal erstellt!', emailRequired:'Bitte Email eingeben', codeSent:'Code gesendet!', allFieldsRequiredNoPlease:'Alle Felder ausfüllen',
  pleaseSelectAddressFirst:'Bitte zuerst eine Adresse auswählen.', missingCoordinates:'Für die Adresse fehlen Koordinaten.', accountDeleted:'Account gelöscht',
  pleaseSelectAddressFromList:'Bitte zuerst eine Adresse aus der Liste wählen', locationLoaded:'📍 Standort geladen', locationLoadedDraggable:'📍 Standort geladen – Pin verschiebbar!', imageMax5mb:'Bild max. 5 MB'
});
Object.assign(TRANSLATIONS.en, {
  fillAllFields:'Please fill in all fields.', fillRequiredFields:'Please complete all required fields.', invalidAddressChoice:'Please select an address from the suggestion list.',
  invalidIban:'Please enter a valid IBAN.', invalidMwst:'Please enter a valid VAT number.', passwordMinErr:'Password must be at least 8 characters.',
  passwordsNoMatch:'Passwords do not match.', acceptTermsError:'Please accept terms and privacy.', networkError:'Connection error.', invalidCredentials:'Invalid credentials.',
  registrationSuccessDetailed:'✅ Registration successful! We will contact you for activation.', registrationError:'Registration error.', codeRequired:'Please enter a code.', invalidVoucher:'Invalid voucher.',
  changePasswordSuccess:'✅ Password changed!', genericError:'Error.', titleRequired:'Title is required', dealPriceRequired:'Deal price is required', pauschalDiscountMin:'Discount must be at least 15%',
  pauschalMinOrder:'Minimum order must be at least CHF 40', chooseOneCategory:'Choose at least 1 category', chooseDate:'Choose a date', imageTooLarge:'Image too large (max 5 MB)',
  imageUploadPrefix:'Image upload:', imageUploadFailed:'Image upload failed', dealCreatedSuccess:'✅ Deal created!', emailRequired:'Please enter your email', codeSent:'Code sent!',
  allFieldsRequiredNoPlease:'Please fill in all fields', pleaseSelectAddressFirst:'Please select an address first.', missingCoordinates:'Coordinates are missing for this address.', accountDeleted:'Account deleted',
  pleaseSelectAddressFromList:'Please first choose an address from the list', locationLoaded:'📍 Location loaded', locationLoadedDraggable:'📍 Location loaded – pin can be moved!', imageMax5mb:'Image max. 5 MB'
});
Object.assign(TRANSLATIONS.it, {
  fillAllFields:'Compila tutti i campi.', fillRequiredFields:'Compila tutti i campi obbligatori.', invalidAddressChoice:'Seleziona un indirizzo dall\'elenco dei suggerimenti.',
  invalidIban:'Inserisci un IBAN valido.', invalidMwst:'Inserisci un numero IVA valido.', passwordMinErr:'La password deve avere almeno 8 caratteri.',
  passwordsNoMatch:'Le password non coincidono.', acceptTermsError:'Accetta condizioni e privacy.', networkError:'Errore di connessione.', invalidCredentials:'Credenziali non valide.',
  registrationSuccessDetailed:'✅ Registrazione riuscita! Ti contatteremo per l\'attivazione.', registrationError:'Errore di registrazione.', codeRequired:'Inserisci un codice.', invalidVoucher:'Voucher non valido.',
  changePasswordSuccess:'✅ Password modificata!', genericError:'Errore.', titleRequired:'Il titolo è obbligatorio', dealPriceRequired:'Il prezzo del deal è obbligatorio', pauschalDiscountMin:'Sconto minimo 15%',
  pauschalMinOrder:'Ordine minimo almeno 40 CHF', chooseOneCategory:'Scegli almeno 1 categoria', chooseDate:'Scegli una data', imageTooLarge:'Immagine troppo grande (max 5 MB)',
  imageUploadPrefix:'Upload immagine:', imageUploadFailed:'Upload immagine non riuscito', dealCreatedSuccess:'✅ Deal creato!', emailRequired:'Inserisci l\'email', codeSent:'Codice inviato!',
  allFieldsRequiredNoPlease:'Compila tutti i campi', pleaseSelectAddressFirst:'Seleziona prima un indirizzo.', missingCoordinates:'Mancano le coordinate per questo indirizzo.', accountDeleted:'Account eliminato',
  pleaseSelectAddressFromList:'Seleziona prima un indirizzo dalla lista', locationLoaded:'📍 Posizione caricata', locationLoadedDraggable:'📍 Posizione caricata – il pin è spostabile!', imageMax5mb:'Immagine max 5 MB'
});
Object.assign(TRANSLATIONS.fr, {
  fillAllFields:'Veuillez remplir tous les champs.', fillRequiredFields:'Veuillez remplir tous les champs obligatoires.', invalidAddressChoice:'Veuillez sélectionner une adresse dans la liste de suggestions.',
  invalidIban:'Veuillez saisir un IBAN valide.', invalidMwst:'Veuillez saisir un numéro TVA valide.', passwordMinErr:'Le mot de passe doit contenir au moins 8 caractères.',
  passwordsNoMatch:'Les mots de passe ne correspondent pas.', acceptTermsError:'Veuillez accepter les CGV et la confidentialité.', networkError:'Erreur de connexion.', invalidCredentials:'Identifiants invalides.',
  registrationSuccessDetailed:'✅ Inscription réussie ! Nous vous contacterons pour l\'activation.', registrationError:'Erreur lors de l\'inscription.', codeRequired:'Veuillez saisir un code.', invalidVoucher:'Bon invalide.',
  changePasswordSuccess:'✅ Mot de passe modifié !', genericError:'Erreur.', titleRequired:'Le titre est obligatoire', dealPriceRequired:'Le prix du deal est obligatoire', pauschalDiscountMin:'Réduction minimale de 15 %',
  pauschalMinOrder:'Commande minimale d\'au moins 40 CHF', chooseOneCategory:'Choisissez au moins 1 catégorie', chooseDate:'Choisissez une date', imageTooLarge:'Image trop volumineuse (max 5 Mo)',
  imageUploadPrefix:'Téléversement image :', imageUploadFailed:'Échec du téléversement de l\'image', dealCreatedSuccess:'✅ Deal créé !', emailRequired:'Veuillez saisir l\'email', codeSent:'Code envoyé !',
  allFieldsRequiredNoPlease:'Veuillez remplir tous les champs', pleaseSelectAddressFirst:'Veuillez d\'abord sélectionner une adresse.', missingCoordinates:'Les coordonnées manquent pour cette adresse.', accountDeleted:'Compte supprimé',
  pleaseSelectAddressFromList:'Veuillez d\'abord choisir une adresse dans la liste', locationLoaded:'📍 Position chargée', locationLoadedDraggable:'📍 Position chargée – le repère peut être déplacé !', imageMax5mb:'Image max. 5 Mo'
});
function getMwstSuffixForCodebox(value) {
  var m = String(value || '').toUpperCase().match(/(MWST|TVA|IVA|VAT)$/);
  if (m) return m[1];
  return {de:'MWST', en:'VAT', it:'IVA', fr:'TVA'}[currentLang] || 'MWST';
}
formatMwstDisplay = function(v) {
  var up = String(v || '').toUpperCase().replace(/\s+/g, ' ').trim();
  var suffix = /(?:MWST|TVA|IVA|VAT)$/.test(up) ? up.match(/(MWST|TVA|IVA|VAT)$/)[1] : ({de:'MWST', en:'VAT', it:'IVA', fr:'TVA'}[currentLang] || 'MWST');
  var digits = onlyDigits(up).slice(0, 9);
  if (!digits) return '';
  var parts = [];
  if (digits.slice(0,3)) parts.push(digits.slice(0,3));
  if (digits.slice(3,6)) parts.push(digits.slice(3,6));
  if (digits.slice(6,9)) parts.push(digits.slice(6,9));
  var base = 'CHE-' + parts.join('.');
  if (digits.length === 9) base += ' ' + suffix;
  return base;
};
isValidMwst = function(v) {
  return /^CHE-\d{3}\.\d{3}\.\d{3} (MWST|TVA|IVA|VAT)$/.test(formatMwstDisplay(v));
};
codeboxValueToChars = function(pattern, value) {
  var raw = pattern === 'mwst' ? onlyAlphaNum(value).slice(0, 12 + getMwstSuffixForCodebox(value).length) : onlyAlphaNum(value).slice(0, 21);
  return raw.split('');
};
getCodeboxGroups = function(pattern, value) {
  return pattern === 'mwst' ? [3, 3, 3, 3, getMwstSuffixForCodebox(value).length] : [4, 4, 4, 4, 4, 1];
};
renderCodebox = function(id, pattern) {
  var input = document.getElementById(id);
  var grid = document.getElementById(id + 'Grid');
  var field = document.getElementById(id + 'Field');
  if (!input || !grid || !field) return;
  var groups = getCodeboxGroups(pattern, input.value);
  var slots = groups.reduce(function(sum, size){ return sum + size; }, 0);
  var chars = codeboxValueToChars(pattern, input.value);
  var signature = groups.join('-');
  if (grid.dataset.signature !== signature) {
    var html = '';
    var slotIndex = 0;
    groups.forEach(function(size, groupIndex) {
      html += '<div class="codebox-group" data-group="' + groupIndex + '">';
      for (var i = 0; i < size; i++, slotIndex++) html += '<div class="codebox-slot" data-slot="' + slotIndex + '"></div>';
      html += '</div>';
    });
    grid.innerHTML = html;
    grid.dataset.signature = signature;
  }
  var activeIndex = getCodeboxActiveIndex(input, slots);
  Array.from(grid.querySelectorAll('.codebox-slot')).forEach(function(slot, idx) {
    var ch = chars[idx] || '';
    slot.textContent = ch;
    slot.classList.toggle('filled', !!ch);
    slot.classList.toggle('active', idx === activeIndex || (!chars.length && idx === 0 && activeIndex === 0));
  });
};
var _origBarShowToast = showToast;
function translateBarRuntimeMessage(msg) {
  var raw = String(msg == null ? '' : msg).trim();
  var map = {
    'Bitte alle Felder ausfüllen.':'fillAllFields',
    'Alle Pflichtfelder ausfüllen.':'fillRequiredFields',
    'Bitte Adresse aus der Vorschlagsliste auswählen.':'invalidAddressChoice',
    'Bitte eine gültige IBAN eingeben.':'invalidIban',
    'Bitte eine gültige MWST-Nummer eingeben.':'invalidMwst',
    'Passwort mind. 8 Zeichen.':'passwordMinErr',
    'Passwörter stimmen nicht überein.':'passwordsNoMatch',
    'Bitte AGB & Datenschutz akzeptieren.':'acceptTermsError',
    'Verbindungsfehler.':'networkError',
    'Ungültige Zugangsdaten.':'invalidCredentials',
    'Code eingeben.':'codeRequired',
    'Ungültiger Gutschein.':'invalidVoucher',
    '✅ Passwort geändert!':'changePasswordSuccess',
    'Fehler.':'genericError',
    'Titel ist Pflichtfeld':'titleRequired',
    'Deal-Preis ist Pflichtfeld':'dealPriceRequired',
    'Rabatt mind. 15%':'pauschalDiscountMin',
    'Mindestbestellung mind. 40 CHF':'pauschalMinOrder',
    'Mind. 1 Kategorie wählen':'chooseOneCategory',
    'Datum wählen':'chooseDate',
    'Bild zu gross (max 5MB)':'imageTooLarge',
    'Bild-Upload fehlgeschlagen':'imageUploadFailed',
    '✅ Deal erstellt!':'dealCreatedSuccess',
    'Bitte Email eingeben':'emailRequired',
    'Code gesendet!':'codeSent',
    'Alle Felder ausfüllen':'allFieldsRequiredNoPlease',
    'Bitte zuerst eine Adresse auswählen.':'pleaseSelectAddressFirst',
    'Für die Adresse fehlen Koordinaten.':'missingCoordinates',
    'Account gelöscht':'accountDeleted',
    'Bitte zuerst eine Adresse aus der Liste wählen':'pleaseSelectAddressFromList',
    '📍 Standort geladen':'locationLoaded',
    '📍 Standort geladen – Pin verschiebbar!':'locationLoadedDraggable',
    'Bild max. 5 MB':'imageMax5mb'
  };
  if (raw.indexOf('Bild-Upload:') === 0) return (t('imageUploadPrefix') || 'Bild-Upload:') + ' ' + raw.substring('Bild-Upload:'.length).trim();
  if (map[raw]) return t(map[raw]) || raw;
  return raw;
}
showToast = function(msg, isError) {
  return _origBarShowToast(translateBarRuntimeMessage(msg), isError);
};
var _origSetLangBar = setLang;
setLang = function(lang) {
  _origSetLangBar(lang);
  ['regIban','profIban','regMwstNumber','profMwstNumber'].forEach(function(id) {
    if (document.getElementById(id)) renderCodebox(id, id.toLowerCase().indexOf('mwst') >= 0 ? 'mwst' : 'iban');
  });
};
async function doBarLogin() {
  var email = document.getElementById('loginEmail').value.trim();
  var pass = document.getElementById('loginPassword').value;
  var err = document.getElementById('loginErr');
  err.textContent = '';
  if (!email || !pass) { err.textContent = t('fillAllFields'); return; }
  try {
    document.getElementById('btnBarLogin').disabled = true;
    document.getElementById('btnBarLogin').textContent = '⏳...';
    var r = await api({ action: 'barLogin', email: email, password: pass });
    document.getElementById('btnBarLogin').disabled = false;
    document.getElementById('btnBarLogin').textContent = t('loginBtn') || 'Einloggen';
    if (r.success) {
      sessionSet(r.token, r.bar.id, r.bar.name);
      document.getElementById('loginPassword').value = '';
      showAuthScreen(false);
      clearDataCache();
      prefetchAllData();
      loadBarStats();
    } else {
      err.textContent = translateBarRuntimeMessage(r.error || 'Ungültige Zugangsdaten.');
      document.getElementById('loginPassword').value = '';
    }
  } catch (e) { err.textContent = t('networkError'); }
}
async function doBarRegister() {
  var name = normText(document.getElementById('regBarName').value);
  var phone = normText(document.getElementById('regPhone').value);
  var email = normText(document.getElementById('regBarEmail').value);
  var pass = document.getElementById('regBarPass').value;
  var ibanRaw = normText(document.getElementById('regIban').value);
  var mwstLiable = !(document.getElementById('regNoMwst') && document.getElementById('regNoMwst').checked);
  var mwstRaw = document.getElementById('regMwstNumber') ? normText(document.getElementById('regMwstNumber').value) : '';
  var consent = document.getElementById('regConsent').checked;
  var err = document.getElementById('regErr');
  var addr = parseSelectedAddress('reg');
  err.textContent = '';
  if (!name || !addr.city || !addr.address || !addr.zip || !email || !pass || !ibanRaw) { err.textContent = t('fillRequiredFields'); return; }
  if (!(document.getElementById('regAddressSearch') || {}).dataset.selected || !addr.latitude || !addr.longitude) { err.textContent = t('invalidAddressChoice'); return; }
  if (!isValidIban(ibanRaw)) { err.textContent = t('invalidIban'); return; }
  if (mwstLiable && !isValidMwst(mwstRaw)) { err.textContent = t('invalidMwst'); return; }
  if (pass.length < 8) { err.textContent = t('passwordMinErr'); return; }
  var passConfirm = document.getElementById('regBarPassConfirm') ? document.getElementById('regBarPassConfirm').value : pass;
  if (pass !== passConfirm) { err.textContent = t('passwordsNoMatch'); return; }
  if (!consent) { err.textContent = t('acceptTermsError'); return; }
  var btn = document.getElementById('btnBarRegister');
  try {
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Registrierung läuft…'; }
    var r = await api({
      action: 'barRegister', name: name, city: addr.city, address: addr.address, zip: addr.zip, phone: phone,
      email: email, password: pass, iban: normalizeIban(ibanRaw), mwst_liable: mwstLiable,
      mwst_number: mwstLiable ? normalizeMwst(mwstRaw) : '', latitude: addr.latitude, longitude: addr.longitude
    });
    if (r.success) {
      showToast(t('registrationSuccessDetailed'));
      document.getElementById('regBarPass').value = '';
      document.getElementById('regBarPassConfirm').value = '';
      document.getElementById('regIban').value = '';
      document.getElementById('regMwstNumber').value = '';
      clearSelectedAddress('reg');
      if (document.getElementById('regAddressSearch')) document.getElementById('regAddressSearch').value = '';
      if (document.getElementById('regBarName')) document.getElementById('regBarName').value = '';
      if (document.getElementById('regPhone')) document.getElementById('regPhone').value = '';
      if (document.getElementById('regBarEmail')) document.getElementById('regBarEmail').value = '';
      if (document.getElementById('regConsent')) document.getElementById('regConsent').checked = false;
      ['regIban','regMwstNumber'].forEach(function(id){ if(document.getElementById(id)) renderCodebox(id, id.toLowerCase().indexOf('mwst') >= 0 ? 'mwst' : 'iban'); });
    } else {
      err.textContent = translateBarRuntimeMessage(r.error || t('registrationError'));
    }
  } catch (e) { err.textContent = t('networkError'); }
  finally { if (btn) { btn.disabled = false; btn.textContent = t('registerBtn'); } }
}
async function doRedeem() {
  var s = sessionGet(); if (!s) { doLogout(); return; }
  var code = document.getElementById('redeemCode').value.trim().toUpperCase();
  var err = document.getElementById('redeemErr'); var result = document.getElementById('redeemResult');
  err.textContent = ''; result.style.display = 'none';
  if (!code) { err.textContent = t('codeRequired'); return; }
  try {
    var r = await api({ action: 'redeemVoucher', token: s.token, code: code });
    if (r.success) {
      document.getElementById('redeemDeal').textContent = r.deal_title || code;
      result.style.display = 'block';
      document.getElementById('redeemCode').value = '';
      showToast(t('redeemSuccess'));
      _dataCache.vouchers = null; _barStatsVouchers = null;
    } else {
      err.textContent = translateBarRuntimeMessage(r.error || 'Ungültiger Gutschein.');
    }
  } catch(e) { err.textContent = t('networkError'); }
}
async function doChangePassword() {
  var s = sessionGet(); if (!s) { doLogout(); return; }
  var oldPw = document.getElementById('pwOld').value;
  var newPw = document.getElementById('pwNew').value;
  var confPw = document.getElementById('pwConfirm').value;
  var err = document.getElementById('pwErr');
  err.textContent = '';
  if (!oldPw || !newPw || !confPw) { err.textContent = t('fillAllFields'); return; }
  if (newPw.length < 8) { err.textContent = t('newPasswordLbl'); return; }
  if (newPw !== confPw) { err.textContent = t('passwordsNoMatch'); return; }
  try {
    var r = await api({ action: 'changePassword', token: s.token, old_password: oldPw, new_password: newPw });
    if (r.success) {
      showToast(t('changePasswordSuccess'));
      document.getElementById('pwOld').value = '';
      document.getElementById('pwNew').value = '';
      document.getElementById('pwConfirm').value = '';
    } else {
      err.textContent = translateBarRuntimeMessage(r.error || 'Fehler.');
    }
  } catch(e) { err.textContent = t('networkError'); }
}

setAddressMeta = function(prefix, text) {
  var el = document.getElementById(prefix + 'AddressMeta');
  if (el) el.textContent = text || t('addressNotSelected');
};
clearSelectedAddress = function(prefix, keepSearch) {
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
};
var _origApplyProfileToForm = applyProfileToForm;
applyProfileToForm = function(b) {
  _origApplyProfileToForm(b);
  setAddressMeta('prof', [b.address, b.zip, b.city].filter(Boolean).join(', ') || t('addressNotSelected'));
};

// =============================================
// FINAL STRICT PATCH: correspondence language + fixed MWST slots/CHE prefix
// =============================================
(function(){
  Object.assign(TRANSLATIONS.de, { correspondenceLang:'Korrespondenzsprache', langGerman:'Deutsch', langEnglish:'English', langItalian:'Italiano', langFrench:'Français', paidOut:'Netto erhalten' });
  Object.assign(TRANSLATIONS.en, { correspondenceLang:'Correspondence language', langGerman:'German', langEnglish:'English', langItalian:'Italian', langFrench:'French', paidOut:'Net received' });
  Object.assign(TRANSLATIONS.it, { correspondenceLang:'Lingua di corrispondenza', langGerman:'Tedesco', langEnglish:'Inglese', langItalian:'Italiano', langFrench:'Francese', paidOut:'Netto ricevuto' });
  Object.assign(TRANSLATIONS.fr, { correspondenceLang:'Langue de correspondance', langGerman:'Allemand', langEnglish:'Anglais', langItalian:'Italien', langFrench:'Français', paidOut:'Net reçu' });

  function currentMwstSuffix_() { return ({ de:'MWST', en:'VAT', it:'IVA', fr:'TVA' })[currentLang] || 'MWST'; }
  function getMwstDigitsOnly_(v) { return onlyDigits(v).slice(0, 9); }

  formatMwstDisplay = function(v) {
    var digits = getMwstDigitsOnly_(v);
    if (!digits) return 'CHE';
    var parts = [];
    if (digits.slice(0,3)) parts.push(digits.slice(0,3));
    if (digits.slice(3,6)) parts.push(digits.slice(3,6));
    if (digits.slice(6,9)) parts.push(digits.slice(6,9));
    var base = 'CHE-' + parts.join('.');
    if (digits.length === 9) base += ' ' + currentMwstSuffix_();
    return base;
  };
  normalizeMwst = function(v) { return formatMwstDisplay(v); };
  isValidMwst = function(v) { return /^CHE-\d{3}\.\d{3}\.\d{3} (MWST|VAT|IVA|TVA)$/.test(formatMwstDisplay(v)); };

  codeboxValueToChars = function(pattern, value) {
    if (pattern === 'mwst') return ('CHE' + getMwstDigitsOnly_(value) + currentMwstSuffix_()).split('');
    return onlyAlphaNum(value).slice(0, 21).split('');
  };
  getCodeboxGroups = function(pattern) {
    return pattern === 'mwst' ? [3, 3, 3, 3, currentMwstSuffix_().length] : [4, 4, 4, 4, 4, 1];
  };
  getCodeboxActiveIndex = function(input, slots) {
    if (!input || document.activeElement !== input) return -1;
    if ((input.id || '').toLowerCase().indexOf('mwst') !== -1) {
      var rawBeforeDigits = onlyDigits(String(input.value || '').slice(0, Math.max(0, input.selectionStart || 0))).length;
      return Math.min(3 + rawBeforeDigits, 11);
    }
    var caret = Math.max(0, input.selectionStart || 0);
    var rawBefore = onlyAlphaNum(String(input.value || '').slice(0, caret)).length;
    if (rawBefore >= slots) return slots - 1;
    return rawBefore;
  };
  setMaskedInputValue = function(id, value, formatter) {
    var el = document.getElementById(id);
    if (!el) return;
    if ((id || '').toLowerCase().indexOf('mwst') !== -1) el.value = getMwstDigitsOnly_(value);
    else el.value = formatter ? formatter(value) : String(value || '');
    if (document.getElementById(id + 'Grid')) renderCodebox(id, id.toLowerCase().indexOf('mwst') >= 0 ? 'mwst' : 'iban');
  };
  updateMwstVisibility = function(prefix) {
    var cb = document.getElementById(prefix + 'NoMwst');
    var group = document.getElementById(prefix + 'MwstNumGroup');
    var input = document.getElementById(prefix + 'MwstNumber');
    var liable = !(cb && cb.checked);
    if (group) group.style.display = liable ? 'block' : 'none';
    if (input) {
      input.required = liable;
      input.maxLength = 9;
      input.inputMode = 'numeric';
      if (!liable) input.value = '';
    }
    renderCodebox(prefix + 'MwstNumber', 'mwst');
  };
  setupCodeboxInput = function(id, formatter, pattern) {
    var input = document.getElementById(id);
    var field = document.getElementById(id + 'Field');
    if (!input || !field) return;
    if (pattern === 'mwst') { input.maxLength = 9; input.inputMode = 'numeric'; }
    else { input.maxLength = 27; }
    function syncFormatted() {
      if (pattern === 'mwst') input.value = getMwstDigitsOnly_(input.value);
      else input.value = formatter ? formatter(input.value) : input.value;
      renderCodebox(id, pattern);
    }
    input.addEventListener('input', syncFormatted);
    input.addEventListener('keydown', function(e){
      if (pattern === 'mwst') {
        var ctrl = e.ctrlKey || e.metaKey || e.altKey;
        var allowedNav = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
        if (ctrl || allowedNav.indexOf(e.key) !== -1) return;
        if (!/^[0-9]$/.test(e.key) || getMwstDigitsOnly_(input.value).length >= 9) e.preventDefault();
      } else {
        var ctrl2 = e.ctrlKey || e.metaKey || e.altKey;
        var allowedNav2 = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End',' '];
        if (ctrl2 || allowedNav2.indexOf(e.key) !== -1) return;
        if (!/^[A-Za-z0-9]$/.test(e.key) || onlyAlphaNum(input.value).length >= 21) e.preventDefault();
      }
    });
    input.addEventListener('keyup', function(){ renderCodebox(id, pattern); });
    input.addEventListener('click', function(){ renderCodebox(id, pattern); });
    input.addEventListener('focus', function(){ field.classList.add('is-focused'); renderCodebox(id, pattern); });
    input.addEventListener('blur', function(){ field.classList.remove('is-focused'); renderCodebox(id, pattern); });
    field.addEventListener('click', function(){ try { input.focus(); renderCodebox(id, pattern); } catch(e) {} });
    renderCodebox(id, pattern);
  };

  var _origSessionSetBar = sessionSet;
  sessionSet = function(token, barId, barName, lang) {
    _origSessionSetBar(token, barId, barName);
    if (lang) {
      _session.lang = lang;
      try { localStorage.setItem('barsclusive_bar_session', JSON.stringify(_session)); } catch(e) {}
      setLang(lang);
    }
  };

  doBarLogin = async function() {
    var email = document.getElementById('loginEmail').value.trim();
    var pass  = document.getElementById('loginPassword').value;
    var err   = document.getElementById('loginErr');
    var btn   = document.getElementById('btnBarLogin');
    err.textContent = '';
    if (!email || !pass) { err.textContent = currentLang === 'de' ? 'Bitte alle Felder ausfüllen.' : currentLang === 'en' ? 'Please fill in all fields.' : currentLang === 'it' ? 'Compila tutti i campi.' : 'Veuillez remplir tous les champs.'; return; }
    try {
      if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }
      var r = await api({ action: 'barLogin', email, password: pass });
      if (r.success) {
        var uiLang = (r.bar && r.bar.lang) || localStorage.getItem('barsclusive_bar_lang') || currentLang || 'de';
        sessionSet(r.token, r.bar.id, r.bar.name, uiLang);
        document.getElementById('loginPassword').value = '';
        showAuthScreen(false);
        clearDataCache();
        prefetchAllData();
        loadBarStats();
      } else {
        err.textContent = r.error || (currentLang === 'de' ? 'Ungültige Zugangsdaten.' : currentLang === 'en' ? 'Invalid credentials.' : currentLang === 'it' ? 'Credenziali non valide.' : 'Identifiants invalides.');
        document.getElementById('loginPassword').value = '';
      }
    } catch (e) {
      err.textContent = (e && e.code === 'REQUEST_TIMEOUT')
        ? (currentLang === 'de' ? 'Zeitüberschreitung beim Login. Bitte erneut versuchen.' : currentLang === 'en' ? 'Login timed out. Please try again.' : currentLang === 'it' ? 'Timeout durante il login. Riprova.' : 'Délai dépassé lors de la connexion. Réessayez.')
        : (currentLang === 'de' ? 'Verbindungsfehler.' : currentLang === 'en' ? 'Connection error.' : currentLang === 'it' ? 'Errore di connessione.' : 'Erreur de connexion.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = t('loginBtn') || 'Einloggen'; }
    }
  };

  doBarRegister = async function() {
    var name = normText(document.getElementById('regBarName').value);
    var phone = normText(document.getElementById('regPhone').value);
    var email = normText(document.getElementById('regBarEmail').value);
    var pass = document.getElementById('regBarPass').value;
    var ibanRaw = normText(document.getElementById('regIban').value);
    var mwstLiable = !(document.getElementById('regNoMwst') && document.getElementById('regNoMwst').checked);
    var mwstRaw = document.getElementById('regMwstNumber') ? normText(document.getElementById('regMwstNumber').value) : '';
    var consent = document.getElementById('regConsent').checked;
    var lang = (document.getElementById('regLangSelect') || {}).value || currentLang || 'de';
    var err = document.getElementById('regErr');
    var addr = parseSelectedAddress('reg');
    err.textContent = '';
    if (!name || !addr.city || !addr.address || !addr.zip || !email || !pass || !ibanRaw) { err.textContent = currentLang === 'de' ? 'Alle Pflichtfelder ausfüllen.' : currentLang === 'en' ? 'Please fill in all required fields.' : currentLang === 'it' ? 'Compila tutti i campi obbligatori.' : 'Veuillez remplir tous les champs obligatoires.'; return; }
    if (!(document.getElementById('regAddressSearch') || {}).dataset.selected || !addr.latitude || !addr.longitude) { err.textContent = currentLang === 'de' ? 'Bitte Adresse aus der Vorschlagsliste auswählen.' : currentLang === 'en' ? 'Please choose the address from the suggestion list.' : currentLang === 'it' ? 'Seleziona l’indirizzo dalla lista dei suggerimenti.' : 'Veuillez choisir l’adresse dans la liste des suggestions.'; return; }
    if (!isValidIban(ibanRaw)) { err.textContent = currentLang === 'de' ? 'Bitte eine gültige IBAN eingeben.' : currentLang === 'en' ? 'Please enter a valid IBAN.' : currentLang === 'it' ? 'Inserisci un IBAN valido.' : 'Veuillez saisir un IBAN valide.'; return; }
    if (mwstLiable && !isValidMwst(mwstRaw)) { err.textContent = currentLang === 'de' ? 'Bitte eine gültige MWST-Nummer eingeben.' : currentLang === 'en' ? 'Please enter a valid VAT number.' : currentLang === 'it' ? 'Inserisci un numero IVA valido.' : 'Veuillez saisir un numéro TVA valide.'; return; }
    if (pass.length < 8) { err.textContent = currentLang === 'de' ? 'Passwort mind. 8 Zeichen.' : currentLang === 'en' ? 'Password min. 8 characters.' : currentLang === 'it' ? 'Password min. 8 caratteri.' : 'Mot de passe min. 8 caractères.'; return; }
    var passConfirm = document.getElementById('regBarPassConfirm') ? document.getElementById('regBarPassConfirm').value : pass;
    if (pass !== passConfirm) { err.textContent = currentLang === 'de' ? 'Passwörter stimmen nicht überein.' : currentLang === 'en' ? 'Passwords do not match.' : currentLang === 'it' ? 'Le password non coincidono.' : 'Les mots de passe ne correspondent pas.'; return; }
    if (!consent) { err.textContent = currentLang === 'de' ? 'Bitte AGB & Datenschutz akzeptieren.' : currentLang === 'en' ? 'Please accept terms and privacy.' : currentLang === 'it' ? 'Accetta condizioni e privacy.' : 'Veuillez accepter les CGV et la confidentialité.'; return; }
    var btn = document.getElementById('btnBarRegister');
    try {
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Registrierung läuft…'; }
      var r = await api({ action: 'barRegister', name: name, city: addr.city, address: addr.address, zip: addr.zip, phone: phone, email: email, password: pass, iban: normalizeIban(ibanRaw), mwst_liable: mwstLiable, mwst_number: mwstLiable ? normalizeMwst(mwstRaw) : '', latitude: addr.latitude, longitude: addr.longitude, lang: lang });
      if (r.success) {
        showToast(currentLang === 'de' ? '✅ Registrierung erfolgreich! Wir melden uns zur Freischaltung.' : currentLang === 'en' ? '✅ Registration successful! We will contact you for activation.' : currentLang === 'it' ? '✅ Registrazione riuscita! Ti contatteremo per l’attivazione.' : '✅ Inscription réussie ! Nous vous contacterons pour l’activation.');
        document.getElementById('regBarPass').value = '';
        document.getElementById('regBarPassConfirm').value = '';
        document.getElementById('regIban').value = '';
        document.getElementById('regMwstNumber').value = '';
        clearSelectedAddress('reg');
        if (document.getElementById('regAddressSearch')) document.getElementById('regAddressSearch').value = '';
        if (document.getElementById('regBarName')) document.getElementById('regBarName').value = '';
        if (document.getElementById('regPhone')) document.getElementById('regPhone').value = '';
        if (document.getElementById('regBarEmail')) document.getElementById('regBarEmail').value = '';
        if (document.getElementById('regConsent')) document.getElementById('regConsent').checked = false;
      } else {
        err.textContent = r.error || (currentLang === 'de' ? 'Fehler bei der Registrierung.' : currentLang === 'en' ? 'Registration error.' : currentLang === 'it' ? 'Errore di registrazione.' : 'Erreur d’inscription.');
      }
    } catch (e) {
      err.textContent = (e && e.code === 'REQUEST_TIMEOUT')
        ? (currentLang === 'de' ? 'Zeitüberschreitung bei der Registrierung. Bitte erneut versuchen.' : currentLang === 'en' ? 'Registration timed out. Please try again.' : currentLang === 'it' ? 'Timeout durante la registrazione. Riprova.' : 'Délai dépassé lors de l’inscription. Réessayez.')
        : (currentLang === 'de' ? 'Verbindungsfehler.' : currentLang === 'en' ? 'Connection error.' : currentLang === 'it' ? 'Errore di connessione.' : 'Erreur de connexion.');
    }
    finally { if (btn) { btn.disabled = false; btn.textContent = t('registerBtn'); } }
  };

  var _origApplyProfileToForm = applyProfileToForm;
  applyProfileToForm = function(b) {
    _origApplyProfileToForm(b);
    var langSel = document.getElementById('profLangSelect');
    if (langSel) langSel.value = b.lang || currentLang || 'de';
  };

  saveProfile = async function() {
    var s = sessionGet();
    if (!s) { doLogout(); return; }
    var addr = parseSelectedAddress('prof');
    var ibanRaw = normText(document.getElementById('profIban').value);
    var mwstLiable = !(document.getElementById('profNoMwst') && document.getElementById('profNoMwst').checked);
    var mwstRaw = document.getElementById('profMwstNumber') ? normText(document.getElementById('profMwstNumber').value) : '';
    var lang = (document.getElementById('profLangSelect') || {}).value || currentLang || 'de';
    if (!addr.address || !addr.city || !addr.zip) { showToast(currentLang === 'de' ? 'Bitte zuerst eine Adresse auswählen.' : currentLang === 'en' ? 'Please select an address first.' : currentLang === 'it' ? 'Seleziona prima un indirizzo.' : 'Veuillez d’abord sélectionner une adresse.', true); return; }
    if (!addr.latitude || !addr.longitude) { showToast(currentLang === 'de' ? 'Für die Adresse fehlen Koordinaten.' : currentLang === 'en' ? 'Coordinates are missing for this address.' : currentLang === 'it' ? 'Mancano le coordinate per questo indirizzo.' : 'Il manque les coordonnées pour cette adresse.', true); return; }
    if (ibanRaw && !isValidIban(ibanRaw)) { showToast(currentLang === 'de' ? 'Bitte eine gültige IBAN eingeben.' : currentLang === 'en' ? 'Please enter a valid IBAN.' : currentLang === 'it' ? 'Inserisci un IBAN valido.' : 'Veuillez saisir un IBAN valide.', true); return; }
    if (mwstLiable && !isValidMwst(mwstRaw)) { showToast(currentLang === 'de' ? 'Bitte eine gültige MWST-Nummer eingeben.' : currentLang === 'en' ? 'Please enter a valid VAT number.' : currentLang === 'it' ? 'Inserisci un numero IVA valido.' : 'Veuillez saisir un numéro TVA valide.', true); return; }
    var payload = { action: 'updateBarProfile', token: s.token, address: addr.address, zip: addr.zip, city: addr.city, phone: normText(document.getElementById('profPhone').value), iban: normalizeIban(ibanRaw), twint: normText(document.getElementById('profTwint').value), mwst_liable: mwstLiable, mwst_number: mwstLiable ? normalizeMwst(mwstRaw) : '', latitude: addr.latitude, longitude: addr.longitude, lang: lang };
    try {
      var r = await api(payload);
      if (r.success) {
        _dataCache.profile = null;
        if (_session) _session.lang = lang;
        try { localStorage.setItem('barsclusive_bar_session', JSON.stringify(_session)); } catch(e) {}
        setLang(lang);
        showToast(t('profileSaved') || 'Gespeichert');
        ['profIban','profMwstNumber'].forEach(function(id){ if (document.getElementById(id)) renderCodebox(id, id.toLowerCase().indexOf('mwst') >= 0 ? 'mwst' : 'iban'); });
      } else showToast(r.error || 'Fehler', true);
    } catch(e) { showToast(currentLang === 'de' ? 'Verbindungsfehler' : currentLang === 'en' ? 'Connection error' : currentLang === 'it' ? 'Errore di connessione' : 'Erreur de connexion', true); }
  };
})();

(function(){
  setAddressMeta = function(prefix, text) {
    var el = document.getElementById(prefix + 'AddressMeta');
    if (el) el.textContent = text || t('addressNotSelected') || 'Noch keine Adresse gewählt';
  };
})();

// =============================================
// FINAL CLEANUP PATCH: hide legacy MWST UI and voucher tab
// =============================================
(function(){
  function removeLegacyVoucherUi(){
    document.querySelectorAll('[data-dash-tab="vouchers"]').forEach(function(el){ el.remove(); });
    var pane = document.getElementById('dashVouchers');
    if (pane) pane.remove();
  }
  function disableLegacyMwstUi(){
    ['regNoMwst','profNoMwst'].forEach(function(id){
      var cb = document.getElementById(id);
      if (cb) { cb.checked = true; cb.disabled = true; }
      var group = cb && cb.closest('.form-group');
      if (group) group.style.display = 'none';
    });
    ['regMwstNumGroup','profMwstNumGroup'].forEach(function(id){
      var group = document.getElementById(id);
      if (group) group.style.display = 'none';
    });
    ['regMwstNumber','profMwstNumber'].forEach(function(id){
      var input = document.getElementById(id);
      if (input) { input.value = ''; input.required = false; }
    });
  }
  var _origApplyProfileToFormFinal = typeof applyProfileToForm === 'function' ? applyProfileToForm : null;
  if (_origApplyProfileToFormFinal) {
    applyProfileToForm = function(b){
      _origApplyProfileToFormFinal(b);
      disableLegacyMwstUi();
      removeLegacyVoucherUi();
    };
  }
  var _origSetLangFinalBar = setLang;
  setLang = function(lang){
    _origSetLangFinalBar(lang);
    disableLegacyMwstUi();
    removeLegacyVoucherUi();
  };
  document.addEventListener('DOMContentLoaded', function(){
    disableLegacyMwstUi();
    removeLegacyVoucherUi();
  });
  setTimeout(function(){
    disableLegacyMwstUi();
    removeLegacyVoucherUi();
  }, 0);
})();


(function(){
  Object.assign(TRANSLATIONS.de, { pauschalHint:'💡 Kund:innen zahlen 2.50 CHF. Du erhältst keine Auszahlung. Der Rabatt wird direkt bei dir eingelöst.' });
  Object.assign(TRANSLATIONS.en, { pauschalHint:'💡 Guests pay 2.50 CHF. You do not receive a payout. The discount is redeemed directly at your bar.' });
  Object.assign(TRANSLATIONS.it, { pauschalHint:'💡 I clienti pagano 2.50 CHF. Non ricevi alcun payout. Lo sconto viene riscattato direttamente presso il tuo bar.' });
  Object.assign(TRANSLATIONS.fr, { pauschalHint:'💡 Les clients paient 2.50 CHF. Vous ne recevez aucun versement. La réduction est accordée directement sur place.' });
})();


// =============================================
// FINAL BAR PORTAL UX / CLEANUP PATCH
// =============================================
(function(){
  if (typeof TRANSLATIONS !== 'undefined') {
    Object.assign(TRANSLATIONS.de,{ correspondenceHint:'Diese Sprache wird für E-Mails und die Kommunikation mit der Bar verwendet.', benefitFree:'Kostenlose Registrierung', benefitFast:'Deal in wenigen Minuten erstellt', benefitPayout:'90 % Auszahlung', benefitPayoutSub:'Nach Einlösung bei Fixpreis-Deals', benefitManaged:'Mehr Sichtbarkeit', benefitManagedSub:'BarSclusive bringt Gäste direkt zu dir', previewLabel:'So sehen Kund:innen deinen Deal', estimateLabel:'Auszahlungs-Schätzung', estimateHint:'Geschätzter Betrag pro Einlösung für Fixpreis-Deals.', previewBadgeDeal:'Deal', previewBadgeActive:'Aktiv', sectionBar:'Bar & Standort', sectionContact:'Kontakt', sectionAccess:'Zugang', sectionPayout:'Auszahlung', sectionConsent:'Zustimmung', sectionProfile:'Profil & Standort', sectionSecurity:'Sicherheit', sectionOffer:'Angebot', sectionPrice:'Preis', sectionImage:'Bild', sectionValidity:'Gültigkeit', sectionVisibility:'Sichtbarkeit' });
    Object.assign(TRANSLATIONS.en,{ correspondenceHint:'This language is used for emails and communication with your bar.', benefitFree:'Free registration', benefitFast:'Create a deal in minutes', benefitPayout:'90% payout', benefitPayoutSub:'After redemption for fixed-price deals', benefitManaged:'More visibility', benefitManagedSub:'BarSclusive brings guests straight to you', previewLabel:'How guests will see your deal', estimateLabel:'Payout estimate', estimateHint:'Estimated payout per redemption for fixed-price deals.', previewBadgeDeal:'Deal', previewBadgeActive:'Active', sectionBar:'Bar & location', sectionContact:'Contact', sectionAccess:'Access', sectionPayout:'Payout', sectionConsent:'Consent', sectionProfile:'Profile & location', sectionSecurity:'Security', sectionOffer:'Offer', sectionPrice:'Price', sectionImage:'Image', sectionValidity:'Validity', sectionVisibility:'Visibility' });
    Object.assign(TRANSLATIONS.it,{ correspondenceHint:'Questa lingua viene usata per email e comunicazioni con il bar.', benefitFree:'Registrazione gratuita', benefitFast:'Crea un deal in pochi minuti', benefitPayout:'90% di payout', benefitPayoutSub:'Dopo il riscatto per i deal a prezzo fisso', benefitManaged:'Più visibilità', benefitManagedSub:'BarSclusive porta ospiti direttamente da te', previewLabel:'Come vedranno il tuo deal i clienti', estimateLabel:'Stima del payout', estimateHint:'Importo stimato per riscatto dei deal a prezzo fisso.', previewBadgeDeal:'Deal', previewBadgeActive:'Attivo', sectionBar:'Bar e posizione', sectionContact:'Contatto', sectionAccess:'Accesso', sectionPayout:'Payout', sectionConsent:'Consenso', sectionProfile:'Profilo e posizione', sectionSecurity:'Sicurezza', sectionOffer:'Offerta', sectionPrice:'Prezzo', sectionImage:'Immagine', sectionValidity:'Validità', sectionVisibility:'Visibilità' });
    Object.assign(TRANSLATIONS.fr,{ correspondenceHint:'Cette langue est utilisée pour les emails et la communication avec votre bar.', benefitFree:'Inscription gratuite', benefitFast:'Créez un deal en quelques minutes', benefitPayout:'90 % de versement', benefitPayoutSub:'Après utilisation pour les deals à prix fixe', benefitManaged:'Plus de visibilité', benefitManagedSub:'BarSclusive amène des clients directement chez vous', previewLabel:'Voici comment les clients verront votre deal', estimateLabel:'Estimation du versement', estimateHint:'Montant estimé par utilisation pour les deals à prix fixe.', previewBadgeDeal:'Deal', previewBadgeActive:'Actif', sectionBar:'Bar et emplacement', sectionContact:'Contact', sectionAccess:'Accès', sectionPayout:'Versement', sectionConsent:'Consentement', sectionProfile:'Profil et emplacement', sectionSecurity:'Sécurité', sectionOffer:'Offre', sectionPrice:'Prix', sectionImage:'Image', sectionValidity:'Validité', sectionVisibility:'Visibilité' });
  }

  function hideLegacyMwst(){
    document.querySelectorAll('.mwst-legacy-block').forEach(function(el){ el.style.display='none'; });
    ['regNoMwst','profNoMwst'].forEach(function(id){ var el=document.getElementById(id); if(el){ el.checked=true; el.disabled=true; } });
    ['regMwstNumber','profMwstNumber'].forEach(function(id){ var el=document.getElementById(id); if(el){ el.value=''; el.required=false; } });
  }

  function cleanLangSelect(id){
    var sel=document.getElementById(id); if(!sel) return;
    Array.from(sel.options).forEach(function(opt){ if(['de','en','it','fr'].indexOf(opt.value)===-1) opt.remove(); });
  }

  function wrapGroups(containerId, sections){
    var container=document.getElementById(containerId); if(!container || container.dataset.sectionized==='1') return;
    container.dataset.sectionized='1';
    function blockNode(node){ return node ? (node.closest('.form-group, .form-check, .err-msg, hr, h3, button, .inline-meta, [style*="margin-bottom"]') || node) : null; }
    sections.forEach(function(sec){
      var startRaw=document.querySelector(sec.start); if(!startRaw || !container.contains(startRaw)) return;
      var start=blockNode(startRaw);
      var endRaw = sec.end ? document.querySelector(sec.end) : null;
      var end = endRaw && container.contains(endRaw) ? blockNode(endRaw) : null;
      var wrapper=document.createElement('div'); wrapper.className='form-section';
      var title=document.createElement('div'); title.className='form-section-title';
      title.innerHTML='<span data-section-key="'+sec.label+'"></span>' + (sec.hint ? '<small>'+sec.hint+'</small>' : '');
      wrapper.appendChild(title);
      start.parentNode.insertBefore(wrapper, start);
      var node=start;
      while(node && node!==end){
        var next=node.nextSibling;
        wrapper.appendChild(node);
        node=next;
      }
    });
    syncSectionLabels();
  }

  function syncSectionLabels(){
    document.querySelectorAll('[data-section-key]').forEach(function(el){ var key=el.getAttribute('data-section-key'); el.textContent = (typeof t==='function' && t(key)) || key; });
    document.querySelectorAll('.correspondence-help').forEach(function(el){ el.textContent = (typeof t==='function' && t('correspondenceHint')) || el.textContent; });
  }

  function buildDealPreview(){
    var title=(document.getElementById('dealTitle')||{}).value || 'Dein Deal-Titel';
    var desc=(document.getElementById('dealDesc')||{}).value || '';
    var price=parseFloat((document.getElementById('dealPrice')||{}).value||0);
    var orig=parseFloat((document.getElementById('dealOrigPrice')||{}).value||0);
    var imgUrl=(document.getElementById('dealImageUrl')||{}).value || '';
    var titleEl=document.getElementById('builderPreviewTitle'); if(titleEl) titleEl.textContent=title || 'Dein Deal-Titel';
    var metaEl=document.getElementById('builderPreviewMeta'); if(metaEl) metaEl.textContent=(document.getElementById('barNameDisplay')&&document.getElementById('barNameDisplay').textContent.trim()) || 'BarSclusive • Live-Vorschau';
    var priceEl=document.getElementById('builderPreviewPrice'); if(priceEl) priceEl.textContent=(price||0).toFixed(2)+' CHF';
    var oldEl=document.getElementById('builderPreviewOldPrice'); if(oldEl){ oldEl.textContent = orig>price ? orig.toFixed(2)+' CHF' : ''; }
    var chipType=document.getElementById('builderPreviewChipType'); if(chipType) chipType.textContent = (document.getElementById('catPauschal')&&document.getElementById('catPauschal').checked) ? ((typeof t==='function'&&t('catDiscount'))||'Rabatt') : ((typeof t==='function'&&t('previewBadgeDeal'))||'Deal');
    var chipValidity=document.getElementById('builderPreviewChipValidity'); if(chipValidity) chipValidity.textContent = (document.getElementById('dealActive')&&document.getElementById('dealActive').checked) ? ((typeof t==='function'&&t('previewBadgeActive'))||'Aktiv') : ((typeof t==='function'&&t('inactive'))||'Inaktiv');
    var img=document.getElementById('builderPreviewImage'); if(img){ if(imgUrl){ img.src=imgUrl; img.style.display='block'; } else { img.removeAttribute('src'); img.style.display='none'; } }
    var estimate=0; var isDiscount=(document.getElementById('catPauschal')&&document.getElementById('catPauschal').checked); if(!isDiscount) estimate = Math.max(0, (price||0)*0.90);
    var estimateEl=document.getElementById('builderPayoutEstimate'); if(estimateEl) estimateEl.textContent = estimate.toFixed(2)+' CHF';
    var copyEl=document.getElementById('builderPayoutCopy'); if(copyEl) copyEl.textContent = isDiscount ? ((currentLang==='de') ? 'Für Pauschalrabatte gibt es keine Auszahlung. Der Rabatt wird direkt bei dir eingelöst.' : currentLang==='en' ? 'Flat discounts do not create a payout. The discount is redeemed directly at your bar.' : currentLang==='it' ? 'I buoni sconto forfettari non generano payout. Lo sconto viene riscattato direttamente nel tuo bar.' : 'Les réductions forfaitaires ne génèrent aucun versement. La réduction est appliquée directement dans votre bar.') : ((typeof t==='function' && t('estimateHint')) || copyEl.textContent);
  }

  function enhancePortalUi(){
    hideLegacyMwst();
    cleanLangSelect('regLangSelect'); cleanLangSelect('profLangSelect');
    wrapGroups('registerForm',[
      {start:'#regBarName', end:'#regPhone', label:'sectionBar'},
      {start:'#regBarEmail', end:'#regLangSelect', label:'sectionContact'},
      {start:'#regLangSelect', end:'#regIbanField', label:'sectionAccess'},
      {start:'#regIbanField', end:'#regConsent', label:'sectionPayout'},
      {start:'#regConsent', end:'#btnBarRegister', label:'sectionConsent'}
    ]);
    wrapGroups('dashSettings',[
      {start:'#profErr', end:'#btnSaveProfile', label:'sectionProfile'},
      {start:'#pwErr', end:'#btnChangePassword', label:'sectionSecurity'}
    ]);
    wrapGroups('dashNewdeal',[
      {start:'#dealTitle', end:'#dealOrigPrice', label:'sectionOffer'},
      {start:'#dealOrigPrice', end:'#dealImageFile', label:'sectionPrice'},
      {start:'#dealImageFile', end:'.cats-grid', label:'sectionImage'},
      {start:'.cats-grid', end:'#dealActive', label:'sectionValidity'},
      {start:'#dealActive', end:'#btnCreateDeal', label:'sectionVisibility'}
    ]);
    buildDealPreview();
  }

  var _origSetLangPortal = setLang;
  setLang = function(lang){ _origSetLangPortal(lang); syncSectionLabels(); hideLegacyMwst(); cleanLangSelect('regLangSelect'); cleanLangSelect('profLangSelect'); buildDealPreview(); };

  document.addEventListener('DOMContentLoaded', function(){
    enhancePortalUi();
    ['dealTitle','dealDesc','dealPrice','dealOrigPrice','dealImageUrl','dealActive','catPauschal'].forEach(function(id){ var el=document.getElementById(id); if(el) el.addEventListener('input', buildDealPreview); if(el) el.addEventListener('change', buildDealPreview); });
    document.querySelectorAll('input[name="cat"], input[name="timeSlot"], input[name="validType"]').forEach(function(el){ el.addEventListener('change', buildDealPreview); });
    setTimeout(enhancePortalUi, 100);
  });
})();


// ===== FINAL MERGE PATCH: sidebar + richer auth benefits =====
(function(){
  try {
    Object.assign(TRANSLATIONS.de, { menuTitle:'Mehr entdecken', menuNote:'Wichtige Infos schnell erreichbar, auch wenn weiter unten viele Inhalte sichtbar sind.', benefitFreeTitle:'Kostenlose Registrierung', benefitFreeSub:'Ohne Einrichtungsgebühr.', benefitNoRunningTitle:'Keine laufenden Fixkosten', benefitNoRunningSub:'Kein Monatsabo und keine wiederkehrenden Grundgebühren.', benefitFastTitle:'Neue Gäste in schwachen Zeiten', benefitFastSub:'Setze gezielte Anreize, wenn du zusätzliche Frequenz brauchst.', benefitPayoutTitle:'Du zahlst nur bei echten Verkäufen', benefitPayoutSub:'Es fallen nur bei verkauften beziehungsweise eingelösten Gutscheinen Provisionen an.', benefitReachTitle:'Mehr Sichtbarkeit für deine Bar', benefitReachSub:'BarSclusive bringt dein Angebot genau dort ins Blickfeld, wo Gäste suchen.' });
    Object.assign(TRANSLATIONS.en, { menuTitle:'Explore more', menuNote:'Important pages stay easy to reach, even when there is a lot to scroll through.', benefitFreeTitle:'Free registration', benefitFreeSub:'No setup fee.', benefitNoRunningTitle:'No ongoing fixed costs', benefitNoRunningSub:'No monthly subscription and no recurring base fees.', benefitFastTitle:'New guests during quiet times', benefitFastSub:'Create targeted incentives when you need additional footfall.', benefitPayoutTitle:'You only pay for real sales', benefitPayoutSub:'Commissions only apply to vouchers that are sold or redeemed.', benefitReachTitle:'More visibility for your bar', benefitReachSub:'BarSclusive puts your offer right where guests are searching.' });
    Object.assign(TRANSLATIONS.it, { menuTitle:'Scopri di più', menuNote:'Le informazioni importanti restano raggiungibili rapidamente, anche con molte sezioni nella pagina.', benefitFreeTitle:'Registrazione gratuita', benefitFreeSub:'Nessun costo di attivazione.', benefitNoRunningTitle:'Nessun costo fisso ricorrente', benefitNoRunningSub:'Nessun abbonamento mensile e nessun costo base ricorrente.', benefitFastTitle:'Nuovi ospiti nei momenti più deboli', benefitFastSub:'Crea incentivi mirati quando hai bisogno di più frequenza.', benefitPayoutTitle:'Paghi solo per vendite reali', benefitPayoutSub:'Le commissioni si applicano solo ai voucher venduti o riscattati.', benefitReachTitle:'Più visibilità per il tuo bar', benefitReachSub:'BarSclusive porta la tua offerta proprio dove gli ospiti stanno cercando.' });
    Object.assign(TRANSLATIONS.fr, { menuTitle:'Découvrir plus', menuNote:'Les pages importantes restent accessibles rapidement, même quand le contenu est long.', benefitFreeTitle:'Inscription gratuite', benefitFreeSub:'Sans frais de mise en place.', benefitNoRunningTitle:'Pas de coûts fixes récurrents', benefitNoRunningSub:'Aucun abonnement mensuel ni frais de base récurrents.', benefitFastTitle:'De nouveaux clients dans les périodes plus calmes', benefitFastSub:'Créez des incitations ciblées quand vous avez besoin de plus de fréquentation.', benefitPayoutTitle:'Vous ne payez que pour de vraies ventes', benefitPayoutSub:'Les commissions s’appliquent uniquement aux bons vendus ou utilisés.', benefitReachTitle:'Plus de visibilité pour votre bar', benefitReachSub:'BarSclusive met votre offre en avant exactement là où les clients recherchent.' });
  } catch(e) {}

  function openBarDrawer() {
    var drawer = document.getElementById('barDrawer');
    var overlay = document.getElementById('barDrawerOverlay');
    if (drawer) drawer.classList.add('active');
    if (overlay) overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
  function closeBarDrawer() {
    var drawer = document.getElementById('barDrawer');
    var overlay = document.getElementById('barDrawerOverlay');
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
  window.openBarDrawer = openBarDrawer;
  window.closeBarDrawer = closeBarDrawer;

  var _origSetLangMerge = setLang;
  setLang = function(lang){
    _origSetLangMerge(lang);
    document.querySelectorAll('.benefit-title,.benefit-sub,.drawer-note,[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if (key && TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) el.textContent = TRANSLATIONS[currentLang][key];
    });
  };

  document.addEventListener('DOMContentLoaded', function(){
    var barMenuBtn = document.getElementById('barMenuBtn'); if (barMenuBtn) barMenuBtn.addEventListener('click', openBarDrawer);
    var barDrawerClose = document.getElementById('barDrawerClose'); if (barDrawerClose) barDrawerClose.addEventListener('click', closeBarDrawer);
    var barDrawerOverlay = document.getElementById('barDrawerOverlay'); if (barDrawerOverlay) barDrawerOverlay.addEventListener('click', closeBarDrawer);
  });
})();


// ===== FINAL HEADER AUTH + CTA PATCH =====
(function(){
  try {
    Object.assign(TRANSLATIONS.de, { becomePartner:'Jetzt Partner werden', entryHowItWorks:"Weitere Details unter So funktioniert's" });
    Object.assign(TRANSLATIONS.en, { becomePartner:'Become a partner now', entryHowItWorks:'More details under How it works' });
    Object.assign(TRANSLATIONS.it, { becomePartner:'Diventa partner ora', entryHowItWorks:'Maggiori dettagli in Come funziona' });
    Object.assign(TRANSLATIONS.fr, { becomePartner:'Devenir partenaire', entryHowItWorks:'Plus de détails dans Comment ça marche' });
  } catch(e) {}

  function syncBarHeaderAuthState(active){
    var loginBtn = document.getElementById('barHeaderLoginBtn');
    var registerBtn = document.getElementById('barHeaderRegisterBtn');
    if (loginBtn) loginBtn.classList.toggle('active', active === 'login');
    if (registerBtn) registerBtn.classList.toggle('active', active === 'register');
  }

  function focusBarAuth(name){
    var loginForm = document.getElementById('loginForm');
    var registerForm = document.getElementById('registerForm');
    document.body.classList.remove('bar-entry-locked');
    if (loginForm) loginForm.classList.toggle('active', name === 'login');
    if (registerForm) registerForm.classList.toggle('active', name === 'register');
    syncBarHeaderAuthState(name);
    var target = name === 'register' ? registerForm : loginForm;
    if (target) {
      var top = Math.max((target.getBoundingClientRect().top + window.scrollY) - 88, 0);
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  var _prevShowAuthScreenPatch = typeof showAuthScreen === 'function' ? showAuthScreen : null;
  if (_prevShowAuthScreenPatch) {
    showAuthScreen = function(show){
      _prevShowAuthScreenPatch(show);
      var headerAuth = document.getElementById('barHeaderAuth');
      if (headerAuth) headerAuth.style.display = show ? 'flex' : 'none';
    };
  }

  document.addEventListener('DOMContentLoaded', function(){
    var headerLogin = document.getElementById('barHeaderLoginBtn');
    var headerRegister = document.getElementById('barHeaderRegisterBtn');
    var becomePartner = document.getElementById('btnBecomePartner');

    if (headerLogin) headerLogin.addEventListener('click', function(ev){ ev.preventDefault(); focusBarAuth('login'); });
    if (headerRegister) headerRegister.addEventListener('click', function(ev){ ev.preventDefault(); focusBarAuth('register'); });
    if (becomePartner) becomePartner.addEventListener('click', function(ev){ ev.preventDefault(); focusBarAuth('register'); });

    syncBarHeaderAuthState('login');
    var headerAuth = document.getElementById('barHeaderAuth');
    if (headerAuth && typeof sessionGet === 'function' && sessionGet()) headerAuth.style.display = 'none';
  });
})();


// ===== BAR ENTRY CLICK + TRANSLATION HOTFIX =====
(function(){
  function activateEntryAuth(which){
    var loginForm=document.getElementById('loginForm');
    var registerForm=document.getElementById('registerForm');
    if (!loginForm || !registerForm) return false;
    document.body.classList.remove('bar-entry-locked');
    loginForm.classList.toggle('active', which !== 'register');
    registerForm.classList.toggle('active', which === 'register');
    if (typeof applyTranslations === 'function') { try { applyTranslations(); } catch(e){} }
    var target = which === 'register' ? registerForm : loginForm;
    var top = Math.max((target.getBoundingClientRect().top + window.scrollY) - 84, 0);
    window.scrollTo({ top: top, behavior: 'smooth' });
    return false;
  }
  window.focusBarEntryAuth = function(which, ev){
    if (ev) { ev.preventDefault(); ev.stopPropagation(); }
    return activateEntryAuth(which || 'login');
  };
  document.addEventListener('DOMContentLoaded', function(){
    [['btnBarEntryLogin','login'],['btnBarEntryRegister','register']].forEach(function(pair){
      var el = document.getElementById(pair[0]);
      if (!el) return;
      el.addEventListener('click', function(ev){
        ev.preventDefault(); ev.stopPropagation(); activateEntryAuth(pair[1]);
      }, true);
    });
  });
})();


// ===== ENTRY TRANSLATION KEY HOTFIX =====
(function(){
  try {
    Object.assign(TRANSLATIONS.de, {
      barEntryHeadline:'Deine Bar auf BarSclusive',
      barEntrySub:'Mehr Gäste, mehr Sichtbarkeit – ohne Fixkosten und ohne Risiko.',
      benefitGuestsTitle:'Neue Gäste in deinen gewünschten Zeiten',
      benefitGuestsSub:'Erreiche Leute genau dann, wenn du sie brauchst.',
      benefitOnlySalesTitle:'Du zahlst nur bei echten Verkäufen',
      benefitOnlySalesSub:'Nur verkaufte Gutscheine beinhalten eine Provision.',
      benefitCustomTitle:'Komplett personalisierbar',
      benefitCustomSub:'Produkt, Zeitraum und Konditionen – du bestimmst alles selbst.'
    });
    Object.assign(TRANSLATIONS.en, {
      barEntryHeadline:'Your bar on BarSclusive',
      barEntrySub:'More guests, more visibility – without fixed costs and without risk.',
      benefitGuestsTitle:'New guests in your preferred time slots',
      benefitGuestsSub:'Reach people exactly when you need them.',
      benefitOnlySalesTitle:'You only pay for real sales',
      benefitOnlySalesSub:'A commission only applies to vouchers that are actually sold.',
      benefitCustomTitle:'Fully customizable',
      benefitCustomSub:'Product, time period and conditions – you decide everything yourself.'
    });
    Object.assign(TRANSLATIONS.it, {
      barEntryHeadline:'Il tuo bar su BarSclusive',
      barEntrySub:'Più ospiti, più visibilità, senza costi fissi e senza rischio.',
      benefitGuestsTitle:'Nuovi ospiti negli orari che desideri',
      benefitGuestsSub:'Raggiungi le persone proprio quando ne hai bisogno.',
      benefitOnlySalesTitle:'Paghi solo per vendite reali',
      benefitOnlySalesSub:'La commissione si applica solo ai voucher effettivamente venduti.',
      benefitCustomTitle:'Completamente personalizzabile',
      benefitCustomSub:'Prodotto, periodo e condizioni: decidi tutto tu.'
    });
    Object.assign(TRANSLATIONS.fr, {
      barEntryHeadline:'Votre bar sur BarSclusive',
      barEntrySub:'Plus de clients, plus de visibilité, sans coûts fixes et sans risque.',
      benefitGuestsTitle:'De nouveaux clients aux horaires que vous souhaitez',
      benefitGuestsSub:'Touchez les bonnes personnes exactement quand vous en avez besoin.',
      benefitOnlySalesTitle:'Vous ne payez que pour de vraies ventes',
      benefitOnlySalesSub:'Une commission s’applique uniquement aux bons effectivement vendus.',
      benefitCustomTitle:'Entièrement personnalisable',
      benefitCustomSub:'Produit, période et conditions: vous décidez de tout vous-même.'
    });
  } catch(e) {}
})();
