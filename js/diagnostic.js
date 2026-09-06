/* Moteur du diagnostic « Prêt à recevoir ? » — pur, sans framework, sans DOM.
   Testable côté Node :  const d = require('./diagnostic.js'); d.calcDiagnostic([true,...])
   Utilisable côté navigateur : window.Diagnostic.calcDiagnostic([...]) */

(function (root) {
  'use strict';

  var QUESTIONS = [
    {
      id: 'q1',
      texte: 'Mon entreprise est établie en France et assujettie à la TVA (y compris en franchise en base de TVA).',
      aide: 'Toutes les entreprises assujetties établies en France sont concernées, y compris les micro-entrepreneurs en franchise en base (ils restent assujettis à la TVA). Répondez « non » uniquement si votre activité n\'est pas assujettie.'
    },
    {
      id: 'q2',
      texte: 'J\'ai désigné une plateforme de dématérialisation (PDP) ou j\'utilise le portail public (PPF) pour recevoir mes factures électroniques.',
      aide: 'Depuis le 01/09/2026, les factures électroniques ne se reçoivent plus par simple email : une plateforme est nécessaire.'
    },
    {
      id: 'q3',
      texte: 'Ma plateforme est immatriculée / agréée et mon entreprise est référencée dans l\'annuaire du PPF.',
      aide: 'L\'annuaire public permet à vos fournisseurs de trouver votre adresse de réception électronique.'
    },
    {
      id: 'q4',
      texte: 'Je suis en mesure de recevoir les formats réglementaires (Factur-X, UBL, CII), directement ou via ma plateforme.',
      aide: 'Votre plateforme peut convertir pour vous, mais le format structuré doit pouvoir arriver jusqu\'à votre comptabilité.'
    },
    {
      id: 'q5',
      texte: 'J\'ai informé mes fournisseurs de mon adresse de réception électronique et testé la réception d\'une facture de test.',
      aide: 'Un test de bout en bout (fournisseur → plateforme → vous) évite les mauvaises surprises au premier règlement.'
    },
    {
      id: 'q6',
      texte: 'Ma comptabilité (ou mon expert-comptable) sait traiter, archiver 10 ans et payer les factures reçues électroniquement.',
      aide: 'Les factures électroniques doivent être archivées dans un format lisible et non altérable pendant 10 ans.'
    }
  ];

  var VERDICTS = {
    horsPerimetre: {
      code: 'HORS PÉRIMÈTRE',
      libelle: 'La réception obligatoire ne semble pas s\'appliquer à votre activité',
      description: 'Si votre entreprise n\'est pas assujettie à la TVA (activité hors champ ou exonérée), l\'obligation de recevoir des factures électroniques ne s\'applique pas directement à elle. Attention : la franchise en base de TVA ne dispense pas — un micro-entrepreneur en franchise reste assujetti et reste donc concerné.',
      plan: [
        'Confirmez votre régime avec votre expert-comptable (assujetti ou non, champ d\'application).',
        'Si vous êtes en franchise en base de TVA : vous êtes concerné, désignez une plateforme et référencez-vous dans l\'annuaire.',
        'Surveillez les seuils de franchise : un dépassement vous rend redevable et l\'obligation s\'allume.',
        'Dès que vous facturez des entreprises assujetties, vérifiez que vous pouvez recevoir leurs factures électroniques.'
      ]
    },
    urgent: {
      code: 'URGENT',
      libelle: 'Action requise dès cette semaine',
      description: 'Votre entreprise est probablement en retard sur l\'obligation de réception. Ne paniquez pas : la mise en conformité prend moins d\'une heure si vous suivez les bonnes étapes.',
      plan: [
        'Désignez sans attendre une plateforme : une PDP agréée (privée) ou le portail public PPF (gratuit).',
        'Faites référencer votre entreprise dans l\'annuaire du PPF (SIREN, coordonnées de réception).',
        'Vérifiez les formats acceptés (Factur-X, UBL, CII) et testez la réception d\'une facture.',
        'Prévenez vos principaux fournisseurs de votre adresse de réception électronique.',
        'Suivez la checklist « Prêt à recevoir » (12 points) du pack pour tout verrouiller.'
      ]
    },
    traiter: {
      code: 'À TRAITER',
      libelle: 'Vous avancez, il reste des points à verrouiller',
      description: 'Une partie du dispositif est en place, mais des maillons manquent encore (plateforme, annuaire, test, circuit comptable). Ce sont les points les plus souvent à l\'origine de factures perdues.',
      plan: [
        'Listez les points « non » ci-dessus : ce sont vos priorités.',
        'Si aucune plateforme n\'est désignée, faites-le maintenant (PDP agréée ou PPF).',
        'Confirmez votre référencement dans l\'annuaire du PPF.',
        'Réalisez un test de réception avec un fournisseur volontaire.',
        'Validez avec votre expert-comptable le circuit d\'archivage 10 ans.'
      ]
    },
    bonneVoie: {
      code: 'EN BONNE VOIE',
      libelle: 'Dispositif solide, restez vigilant',
      description: 'Votre réception électronique est en place. Il reste à entretenir le dispositif : nouveaux fournisseurs, nouvelles mentions obligatoires, archivage.',
      plan: [
        'Programmez un contrôle trimestriel : nouveaux fournisseurs référencés, factures bien reçues.',
        'Vérifiez les 4 nouvelles mentions obligatoires (depuis le 01/09/2026) sur vos factures reçues.',
        'Testez votre plan de secours (facture qui n\'arrive pas : qui contacter, comment la récupérer).',
        'Anticipez le 01/09/2027 : l\'émission électronique deviendra obligatoire pour votre entreprise.'
      ]
    }
  };

  /* Entrées : 6 booléens (true = oui). Sortie : score 0-100, verdict, manques. */
  function calcDiagnostic(reponses) {
    if (!Array.isArray(reponses) || reponses.length !== QUESTIONS.length) {
      throw new Error('calcDiagnostic attend un tableau de ' + QUESTIONS.length + ' réponses booléennes.');
    }
    var oui = 0;
    var manques = [];
    reponses.forEach(function (rep, i) {
      if (rep === true) {
        oui += 1;
      } else if (rep === false) {
        manques.push(QUESTIONS[i].id);
      }
    });
    var score = Math.round((oui / QUESTIONS.length) * 100);

    var verdict;
    if (reponses[0] === false) {
      verdict = VERDICTS.horsPerimetre;
    } else if (oui <= 2) {
      verdict = VERDICTS.urgent;
    } else if (oui <= 4) {
      verdict = VERDICTS.traiter;
    } else {
      verdict = VERDICTS.bonneVoie;
    }

    return {
      score: score,
      oui: oui,
      total: QUESTIONS.length,
      verdict: verdict,
      manques: manques,
      reponses: reponses.slice()
    };
  }

  var api = {
    QUESTIONS: QUESTIONS,
    VERDICTS: VERDICTS,
    calcDiagnostic: calcDiagnostic
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.Diagnostic = api;
})(typeof window !== 'undefined' ? window : globalThis);
