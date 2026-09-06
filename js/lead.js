/* ============================================================
   FACTURATION 2026 — envoi des formulaires (commandes + leads)
   via EmailJS. Une commande (sujet = commande) capture le lead PUIS
   redirige vers le paiement Stripe réel (js/paiement.js).
   Aucun envoi simulé : si EmailJS échoue, on affiche une erreur réelle.
   ============================================================ */
(function () {
  'use strict';

  var config = window.EMAILJS_CONFIG || {};
  var prix = window.PRIX || {};
  var paiement = window.PAIEMENT || {};

  function texteSujet(valeur) {
    if (valeur === 'commande') {
      return 'COMMANDE — ' + (prix.produit || 'Pack') + ' ' + prix.montant + ' ' + (prix.devise || '€');
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
      if (estCommande(form)) {
        /* Lead capté : la commande est notifiée à l'éditeur, on envoie
           l'acheteur vers le paiement réel (lien Stripe, pattern écosystème). */
        etat('ok', 'Commande enregistrée ! Redirection vers le paiement sécurisé (' + (paiement.libelle || 'Stripe') + ')…');
        if (bouton) { bouton.textContent = 'Redirection vers le paiement…'; }
        redirigerVersPaiement();
        return;
      }
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

  function estCommande(form) {
    var sujet = form.querySelector('[name="sujet"]');
    return !sujet || sujet.value === 'commande';
  }

  function redirigerVersPaiement() {
    if (!paiement.url) return;
    window.setTimeout(function () {
      window.location.href = paiement.url;
    }, paiement.delaiRedirectionMs || 1500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
