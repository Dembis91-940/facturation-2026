# Facturation électronique 2026 — « Prêt à recevoir ? »

Mini-business standalone : êtes-vous prêt à recevoir les factures électroniques ?
Landing de conversion + auto-diagnostic + pack vendable (checklist, guide, mémo).

URL live : https://dembis91-940.github.io/facturation-2026/
Date d'édition : 3 septembre 2026 — Activé en machine de vente le 06/09/2026
(Stripe Payment Link réel 29 € + blog + mentions légales/CGV).
Réforme : réception obligatoire depuis le 01/09/2026, émission au 01/09/2027.

## Structure

```
facturation-2026/
├── index.html                    Landing de conversion (scroll-driven)
├── check.html                    Auto-diagnostic « Prêt à recevoir ? » (6 questions → score 0-100)
├── legale.html                   Mentions légales & CGV (éditeur, prix TTC, livraison, rétractation 14 j)
├── merci.html                    Confirmation post-paiement (cible du Payment Link Stripe)
├── blog/
│   ├── reception-obligatoire-1er-septembre-2026.html   Article sourcé (échéance réception)
│   └── 4-nouvelles-mentions-obligatoires.html          Article sourcé (4 mentions 2026)
├── css/
│   ├── site.css                  Design system du site (identité « dossier d'échéance »)
│   ├── pack.css                  Mise en page A4 des documents du pack
│   └── pages.css                 Pages secondaires (blog, légale, merci)
├── js/
│   ├── prix.js                   Source unique de prix (29 €, barré 49 €)
│   ├── emailjs-config.js         Configuration EmailJS (clé publique)
│   ├── paiement.js               Lien Stripe LIVE du pack (source unique du paiement)
│   ├── diagnostic.js             Moteur pur du diagnostic (testable sous Node)
│   ├── lead.js                   Envoi des formulaires + redirection paiement (EmailJS → Stripe)
│   └── main.js                   Motion : Lenis + GSAP ScrollTrigger
├── pack/                         LE PRODUIT (livré par email après paiement)
│   ├── checklist-pret-a-recevoir.html    P1 — 12 points de conformité réception, imprimable
│   ├── guide-choix-plateforme.html       P2 — Guide de choix PDP/PPF (version imprimable)
│   ├── guide-choix-plateforme.md         P2 — Même guide en Markdown
│   ├── mentions-obligatoires.html        P3 — Mémo des mentions obligatoires (+ 4 nouvelles 2026)
│   └── pack-facturation-2026.zip         Zip de livraison (4 fichiers)
└── README.md
```

## Flux de vente (réel, encaissable)

1. Le visiteur arrive sur `index.html`, fait le diagnostic gratuit (`check.html`) ou lit le pack.
2. Il commande via le formulaire (section « Achat immédiat », ou boutons 29 €).
3. La commande est notifiée à l'éditeur (agentiadeploiement@gmail.com) via EmailJS
   (service `service_cy1ytdb`, template `template_xpo58cv`, clé publique).
4. Après 1,5 s, redirection vers le **Payment Link Stripe LIVE** (`js/paiement.js`,
   créé via API Stripe le 06/09/2026, produit 29,00 EUR, livemode).
5. Paiement encaissé par Stripe → redirection vers `merci.html`.
6. L'éditeur livre le pack par email sous 24 h ouvrées. Garantie satisfait ou
   remboursé 14 jours (voir `legale.html`).

## Test des scripts

```bash
node --check js/prix.js js/emailjs-config.js js/paiement.js js/diagnostic.js js/lead.js js/main.js
node -e "const d=require('./js/diagnostic.js'); console.log(d.calcDiagnostic([true,false,false,false,false,false]).verdict.code)"
```

Scénarios attendus du diagnostic : tout oui → EN BONNE VOIE ; rien en place → URGENT ;
q1 = non (non assujetti) → HORS PÉRIMÈTRE ; mixte → À TRAITER.

## Cohérence des prix

La valeur de référence est `js/prix.js` (29 €, prix barré 49 €, prix de lancement
jusqu'aux 200 premières commandes). Le Payment Link Stripe facture 29,00 EUR.
Les mentions 29 € et 49 € des pages sont vérifiées par un test (voir rapport de build).

## Sources officielles citées sur le site

- economie.gouv.fr — « Tout savoir sur la facturation électronique pour les entreprises »
- economie.gouv.fr — « Mentions obligatoires d'une facture : tout savoir »
- impots.gouv.fr — « Je découvre la facturation électronique »
- entreprendre.service-public.fr/vosdroits/A15683

## Limites assumées

- Hébergement GitHub Pages public : les fichiers du pack sont techniquement visibles
  dans le dépôt. La valeur vendue est la livraison accompagnée (email, versions à jour,
  garantie 14 jours). Un zip de livraison est fourni dans `pack/`.
- Le site n'est pas un conseil fiscal ou juridique : un avertissement figure dans le
  pied de chaque page et chaque document.
- Le diagnostic est un outil d'auto-contrôle, pas une certification.

## Confidentialité

Aucun secret dans le dépôt : la clé EmailJS est publique par conception, aucune clé
privée, aucun .env, aucun CSV n'est versionné.
