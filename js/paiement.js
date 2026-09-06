/* Configuration paiement — lien Stripe LIVE du pack.
   Le Payment Link est créé via l'API Stripe (POST /v1/payment_links),
   produit : « Pack Prêt à recevoir — Facturation électronique 2026 », 29,00 EUR.
   Cette URL est publique par conception (lien de paiement Stripe).
   Toute commande (sujet = commande) capture le lead EmailJS PUIS redirige ici. */
(function (root) {
  'use strict';

  var PAIEMENT = {
    url: 'https://buy.stripe.com/8x28wR5YO3LL7rfeKwfrW0o',
    delaiRedirectionMs: 1500,
    libelle: 'paiement sécurisé Stripe'
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PAIEMENT;
  }
  root.PAIEMENT = PAIEMENT;
})(typeof window !== 'undefined' ? window : globalThis);
