/* ============================================================
   FACTURATION 2026 · landing scrollcraft — script page.
   Engine non modifié ; tout le comportement bespoke vit ici :
   1. Folio courant (feuillet + titre + fond du folio) ;
   2. Compte à rebours réel vers le 01/09/2027 (émission) ;
   3. Signature : la facture d'essai (retour expéditeur → reçue),
      pilotée par le --sc-p publié par l'engine sur l'acte #test ;
   4. Année du pied de page.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------- helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function pOf(el) {
    if (!el) return 0;
    var v = parseFloat(el.style.getPropertyValue('--sc-p'));
    return isNaN(v) ? 0 : Math.max(0, Math.min(1, v));
  }

  /* ============================================================
     FOLIO COURANT : feuillet, titre et fond du folio
     ============================================================ */
  var FEUILLETS = [
    { id: 'couverture',   no: 'FEUILLET 01 / 08', nom: 'COUVERTURE',          ground: 'papier' },
    { id: 'reglementaire',no: 'FEUILLET 02 / 08', nom: 'LE POINT RÉGLEMENTAIRE', ground: 'nuit' },
    { id: 'situations',   no: 'FEUILLET 03 / 08', nom: 'VOTRE SITUATION',     ground: 'papier' },
    { id: 'calendrier',   no: 'FEUILLET 04 / 08', nom: "L'ÉCHÉANCIER OFFICIEL", ground: 'nuit' },
    { id: 'pack',         no: 'FEUILLET 05 / 08', nom: 'LE PACK PRÊT À RECEVOIR', ground: 'papier' },
    { id: 'test',         no: 'FEUILLET 06 / 08', nom: 'LE TEST DE RÉCEPTION', ground: 'peak' },
    { id: 'faq',          no: 'FEUILLET 07 / 08', nom: 'QUESTIONS FRÉQUENTES', ground: 'papier-2' },
    { id: 'commande',     no: 'FEUILLET 08 / 08', nom: 'COMMANDER · ANNEXES',  ground: 'blanc' }
  ];

  var folioNo = $('.folio__no');
  var folioNom = $('.folio__nom');
  var annexesEl = $('#annexes');
  var tops = [];

  function folioMesure() {
    tops = FEUILLETS.map(function (f) {
      var el = document.getElementById(f.id);
      return { f: f, el: el, top: el ? (el.getBoundingClientRect().top + window.scrollY) : 0 };
    });
  }

  function folioTick() {
    var y = window.scrollY || window.pageYOffset || 0;
    var actif = tops[0] ? tops[0].f : FEUILLETS[0];
    for (var i = 0; i < tops.length; i++) {
      if (y >= tops[i].top - 4) actif = tops[i].f;
    }
    if (folioNo) folioNo.textContent = actif.no;
    if (folioNom) folioNom.textContent = actif.nom;

    /* l'annexe (fond papier-2) clôt le feuillet 08 */
    var ground = actif.ground;
    if (annexesEl) {
      var ay = annexesEl.getBoundingClientRect().top + window.scrollY;
      if (y >= ay - 4) ground = 'papier-2';
    }
    if (document.body.getAttribute('data-ground') !== ground) {
      document.body.setAttribute('data-ground', ground);
    }
  }

  /* ============================================================
     SIGNATURE : la facture d'essai
     L'engine publie --sc-p sur l'acte #test ; on le lit à chaque
     frame et on traduit les seuils en état visible (data-essai)
     + signature compacte pour le harness.
     ============================================================ */
  var testAct = document.getElementById('test');
  var essai = document.querySelector('[data-essai]');
  var testStage = document.getElementById('test-stage');

  function essaiTick() {
    if (!testAct || !essai) return;
    var p = pOf(testAct);
    var etat = p >= 0.6 ? 'ok' : (p >= 0.36 ? 'mix' : 'ko');
    if (essai.getAttribute('data-essai') !== etat) {
      essai.setAttribute('data-essai', etat);
    }
    if (testStage) {
      var sig = 'e:' + (etat === 'ok' ? 1 : 0) + ':p' + Math.round(p * 100);
      if (testStage.getAttribute('data-sc-verify-state') !== sig) {
        testStage.setAttribute('data-sc-verify-state', sig);
      }
    }
  }

  /* ============================================================
     COMPTE À REBOURS RÉEL vers le 01/09/2027 (émission)
     ============================================================ */
  var CIBLE = new Date('2027-09-01T00:00:00+02:00');
  function joursRestants() {
    var maintenant = new Date();
    return Math.max(0, Math.ceil((CIBLE - maintenant) / 86400000));
  }
  function majCompteRebours() {
    var j = joursRestants();
    $$('[data-jours]').forEach(function (el) { el.textContent = 'J-' + j; });
  }

  /* ============================================================
     DIVERS
     ============================================================ */
  function majAnnee() {
    $$('[data-annee]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------------------------------------------------------------- init */
  function init() {
    majCompteRebours();
    window.setInterval(majCompteRebours, 60000);
    majAnnee();
    folioMesure();
    folioTick();

    var pending = false;
    window.addEventListener('scroll', function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        folioTick();
      });
    }, { passive: true });
    window.addEventListener('resize', function () {
      folioMesure();
      folioTick();
    }, { passive: true });

    /* machine d'état de la facture d'essai, à chaque frame */
    function boucle() {
      essaiTick();
      requestAnimationFrame(boucle);
    }
    if (!reduce) {
      requestAnimationFrame(boucle);
    } else {
      /* mouvement réduit : on pose quand même l'état final lisible */
      essaiTick();
      window.addEventListener('scroll', essaiTick, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
