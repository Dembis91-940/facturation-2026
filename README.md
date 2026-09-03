# Facturation électronique 2026 — « Prêt à recevoir ? »

Mini-business standalone : êtes-vous prêt à recevoir les factures électroniques ?
Landing de conversion + auto-diagnostic + pack vendable (checklist, guide, mémo).

URL live : https://dembis91-940.github.io/facturation-2026/
Date d'édition : 3 septembre 2026 — Réforme : réception obligatoire depuis le 01/09/2026, émission au 01/09/2027.

## Structure

```
facturation-2026/
├── index.html                    Landing de conversion (scroll-driven)
├── check.html                    Auto-diagnostic « Prêt à recevoir ? » (6 questions → score 0-100)
├── css/
│   ├── site.css                  Design system du site (identité « dossier d'échéance »)
│   └── pack.css                  Mise en page A4 des documents du pack
├── js/
│   ├── prix.js                   Source unique de prix (29 €, barré 49 €)
│   ├── emailjs-config.js         Configuration EmailJS (clé publique)
│   ├── diagnostic.js             Moteur pur du diagnostic (testable sous Node)
│   ├── lead.js                   Envoi des formulaires (EmailJS)
│   └── main.js                   Motion : Lenis + GSAP ScrollTrigger
├── pack/                         LE PRODUIT (livré après précommande)
│   ├── checklist-pret-a-recevoir.html    P1 — 12 points de conformité réception, imprimable
│   ├── guide-choix-plateforme.html       P2 — Guide de choix PDP/PPF (version imprimable)
│   ├── guide-choix-plateforme.md         P2 — Même guide en Markdown
│   └── mentions-obligatoires.html        P3 — Mémo des mentions obligatoires (+ 4 nouvelles 2026)
└── README.md
```

## Flux de vente (honnête)

1. Le visiteur arrive sur `index.html`, fait le diagnostic gratuit (`check.html`) ou lit le pack.
2. Il précommande via le formulaire EmailJS (section « Précommande », ou boutons 29 €).
3. La demande part vers la messagerie de l'éditeur (agentiadeploiement@gmail.com) via
   EmailJS (service `service_cy1ytdb`, template `template_xpo58cv`, clé publique).
4. L'éditeur livre le pack par email sous 24 h ouvrées.
5. Le paiement en ligne (Stripe) est en cours d'activation : la précommande est
   **explicitement présentée comme telle** sur le site (« Aucun débit sans votre accord »).
   Aucun paiement n'est simulé, aucun faux succès n'est affiché.

## Test des scripts

```bash
node --check js/prix.js js/emailjs-config.js js/diagnostic.js js/lead.js js/main.js
node -e "const d=require('./js/diagnostic.js'); console.log(d.calcDiagnostic([true,false,false,false,false,false]).verdict.code)"
```

## Cohérence des prix

La valeur de référence est `js/prix.js` (29 €, prix barré 49 €, offre de lancement
jusqu'aux 200 premières précommandes). Les mentions 29 € et 49 € des pages sont
vérifiées par un test (voir rapport de build).

## Sources officielles citées sur le site

- economie.gouv.fr — « Tout savoir sur la facturation électronique pour les entreprises »
- economie.gouv.fr — « Mentions obligatoires d'une facture : tout savoir »
- impots.gouv.fr — « Je découvre la facturation électronique »
- entreprendre.service-public.fr/vosdroits/A15683

## Limites assumées

- Hébergement GitHub Pages public : les fichiers du pack sont techniquement visibles
  dans le dépôt. La valeur vendue est la livraison accompagnée (email, versions à jour,
  lien de paiement sécurisé). Un zip de livraison est fourni dans `pack/`.
- Le site n'est pas un conseil fiscal ou juridique : un avertissement figure dans le
  pied de chaque page et chaque document.
- Le diagnostic est un outil d'auto-contrôle, pas une certification.

## Confidentialité

Aucun secret dans le dépôt : la clé EmailJS est publique par conception, aucune clé
privée, aucun .env, aucun CSV n'est versionné.
