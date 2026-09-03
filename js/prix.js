/* Source unique des prix et de l'identifiant produit.
   Toute page qui affiche un prix lit ce fichier (window.PRIX). */
(function (root) {
  'use strict';

  var PRIX = {
    site: 'Facturation 2026',
    produit: 'Pack Prêt à recevoir',
    montant: 29,
    barre: 49,
    devise: '€',
    noteBarre: 'offre de lancement (le prix remontera à 49 €)'
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PRIX; // testable côté Node
  }
  root.PRIX = PRIX;
})(typeof window !== 'undefined' ? window : globalThis);
