/* ============================================================
   FACTURATION 2026 — envoi des formulaires (leads + précommandes)
   via EmailJS. Aucun envoi simulé : si EmailJS échoue, on affiche
   une erreur réelle à l'utilisateur.
   ============================================================ */
(function () {
  'use strict';

  var config = window.EMAILJS_CONFIG || {};
  var prix = window.PRIX || {};

  function texteSujet(valeur) {
    if (valeur === 'commande') {
      return 'PRÉCOMMANDE — ' + (prix.produit || 'Pack') + ' ' + prix.montant + ' ' + (prix.devise || '€');
    }
    if (valeur === 'question') {
      return 'QUESTION — ' + (config.site || 'Facturation 2026');
    }
    return 'DEMANDE — ' + (config.site || 'Facturation 2026');
  }

  function envoyer(form) {
    var statut = form.querySelector('[data-form-statut]');
    var bouton = form.querySelector('[type="submit"]');
    var nom = form.querySelector('[name="nom"]');
    var email = form.querySelector('[name="email"]');
    var consent = form.querySelector('[name="consentement"]');
    var sujetSelect = form.querySelector('[name="sujet"]');
    var message = form.querySelector('[name="message"]');

    function etat(type, texte) {
      if (!statut) return;
      statut.dataset.etat = type;
      statut.textContent = texte;
    }
    function restaurer() {
      if (bouton) { bouton.disabled = false; bouton.textContent = bouton.dataset.texteOrigine || 'Envoyer'; }
    }

    // Validation RGPD
    if (!nom.value.trim() || !email.value.trim()) {
      etat('erreur', 'Merci d\'indiquer votre nom et votre email.');
      return;
    }
    if (consent && !consent.checked) {
      etat('erreur', 'Merci d\'accepter le traitement de vos données (case RGPD).');
      consent.focus();
      return;
    }

    if (!window.emailjs) {
      etat('erreur', 'Le service d\'envoi est momentanément indisponible. Réessayez dans quelques instants.');
      return;
    }

    if (bouton) {
      if (!bouton.dataset.texteOrigine) bouton.dataset.texteOrigine = bouton.textContent;
      bouton.disabled = true;
      bouton.textContent = 'Envoi en cours…';
    }
    etat('', 'Envoi en cours…');

    var question = message && message.value.trim()
      ? message.value.trim()
      : (sujetSelect ? texteSujet(sujetSelect.value) : 'Prise de contact');

    window.emailjs.init({ publicKey: config.publicKey });
    window.emailjs.send(config.serviceId, config.templateId, {
      site: config.site,
      name: nom.value.trim(),
      email: email.value.trim(),
      question: question
    }).then(function () {
      etat('ok', 'Votre demande est bien partie. Réponse sous 24 h ouvrées sur ' + email.value.trim() + '.');
      form.reset();
      restaurer();
    }, function (err) {
      console.error('EmailJS :', err);
      etat('erreur', 'L\'envoi a échoué. Merci de réessayer ou d\'écrire à agentiadeploiement@gmail.com.');
      restaurer();
    });
  }

  function init() {
    document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        envoyer(form);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
