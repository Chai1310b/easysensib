# EasySensib · refonte

Refonte de l'application EasySensib (suivi des sensibilisations sécurité en entreprise) pour Thales. Ce dépôt contient le nouveau front utilisateur : une interface épurée autour de deux concepts seulement, les **sensibilisations** (anciennement « objectifs ») et les **sessions**.

Un utilisateur standard dispose d'une page unique listant ses sensibilisations. Chaque sensibilisation se valide en participant à une session (présentiel ou visio), par e-learning (dépôt d'un certificat), ou les deux. Une fois validée, elle porte une durée de validité puis doit être repassée.

## Statut actuel

Front seul, alimenté par des fixtures typées. **Aucune base de données, aucun backend.** La couche `src/services/` est la frontière : le jour où le backend existe, seul l'intérieur des services change, les signatures et les pages restent identiques.

## Stack

| Brique                  | Choix                                                                      |
| ----------------------- | -------------------------------------------------------------------------- |
| Framework               | Next.js 16.3.3 (App Router, TypeScript strict)                             |
| Gestionnaire de paquets | bun 1.3.14                                                                 |
| Styles                  | Tailwind CSS v4 (design tokens dans `src/app/globals.css`)                 |
| i18n                    | next-intl (UI en français, miroir anglais prêt, pas de routing par locale) |
| Icônes                  | SVG inline copiés des maquettes (pas de librairie d'icônes)                |
| Fonts                   | Space Grotesk (titres) + Instrument Sans (corps), via next/font/google     |

## Prérequis

- bun 1.3.14 ou plus récent
- Node.js 20+ (pour l'outillage Next.js)

## Commandes

```bash
bun install            # Installer les dépendances
bun dev                # Serveur de développement (http://localhost:3000)
bun run build          # Build de production
bun run start          # Servir le build

bun run typecheck      # tsc --noEmit
bun run lint           # ESLint
bun run lint:fix       # ESLint avec corrections
bun run format         # Prettier (écriture)
bun run format:check   # Prettier (vérification)
bun run check          # typecheck + lint + format:check
```

## Structure du dépôt

```
├── messages/              # Chaînes UI next-intl
│   ├── fr/                # common, home, training, history, certificates
│   └── en/                # Miroir anglais des mêmes namespaces
├── src/
│   ├── app/               # Pages (App Router)
│   │   ├── page.tsx       # / : Mes sensibilisations (page unique utilisateur)
│   │   ├── trainings/[id] # Inscription à une session
│   │   ├── history        # Historique des participations
│   │   ├── certificates   # Certificats e-learning
│   │   └── globals.css    # Design tokens Tailwind v4 (@theme)
│   ├── components/        # Composants partagés (TopBar, DateBlock, jauge, stepper...)
│   ├── i18n/              # Configuration next-intl
│   ├── lib/               # types.ts (modèle de domaine), format.ts (dates fr-FR)
│   └── services/          # Frontière backend : services typés + fixtures/
└── docs/                  # Contexte interne (refonte, décisions, questions ouvertes, modèle de données)
```

## Pages

| Route             | Contenu                                                                              |
| ----------------- | ------------------------------------------------------------------------------------ |
| `/`               | Mes sensibilisations : l'état de chaque sensibilisation dicte l'affichage            |
| `/trainings/[id]` | Page dédiée d'inscription à une session (stepper Inscription · Session · Validation) |
| `/history`        | Historique des participations (sessions suivies, absences, certificats)              |
| `/certificates`   | Certificats e-learning déposés (validé, en attente, rejeté)                          |

## Documentation

- `docs/context.md` : la refonte, existant vs cible, le renommage objectif vers sensibilisation
- `docs/decisions.md` : décisions produit et design actées
- `docs/open-questions.md` : points encore ouverts côté client
- `docs/data-model.md` : le modèle de données et sa correspondance avec le vocabulaire métier
- `CLAUDE.md` : conventions et pièges pour les agents et contributeurs
