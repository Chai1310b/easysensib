@AGENTS.md

# CLAUDE.md · guide du projet EasySensib (refonte)

Front utilisateur de la refonte EasySensib pour Thales. Next.js 16 (App Router, TypeScript strict), bun, Tailwind CSS v4, next-intl. Pas de backend : la couche `src/services/` retourne des fixtures typées.

## Commandes essentielles

```bash
bun install            # Dépendances
bun dev                # Serveur de dev (http://localhost:3000)
bun run typecheck      # tsc --noEmit (à lancer après chaque modification)
bun run lint           # ESLint
bun run format:check   # Prettier
bun run check          # typecheck + lint + format:check (avant de conclure)
bun run build          # Build de production
```

Package manager : **bun uniquement** (pas de npm, pnpm ni yarn).

## Conventions

- **Code, identifiants, commentaires : anglais.** Chaînes UI : **français** via next-intl.
- **Jamais de tiret cadratin (em dash)** dans aucune chaîne UI ni aucun document. Utiliser « · » ou des virgules.
- **Vocabulaire UI** : « sensibilisation » (jamais « formation » ni « objectif » côté utilisateur). En code, l'entité s'appelle `Training`.
- **Aucune donnée en dur dans les composants.** Toute donnée vient d'un service de `src/services/` ; toute chaîne UI vient de `messages/fr/*.json` (avec miroir `messages/en/*.json`).
- **Design tokens dans `src/app/globals.css`** (bloc `@theme` Tailwind v4). Ne jamais réintroduire de couleurs hexadécimales en dur dans les composants : utiliser les classes issues des tokens (`bg-page`, `text-ink`, `border-card-border`, etc.).
- **Icônes : SVG inline** copiés des maquettes (stroke-based), centralisés dans `src/components/icons.tsx`. Ne pas installer lucide-react ni aucune librairie d'icônes.
- Dates formatées via les helpers de `src/lib/format.ts` (Intl fr-FR). Ne pas recréer de formateurs ad hoc.
- Types du domaine : `src/lib/types.ts` est la source unique. Ne pas redéfinir ces types ailleurs.

## La frontière backend : `src/services/`

Chaque service (`trainings.ts`, `sessions.ts`, `history.ts`, `certificates.ts`, `user.ts`) expose des fonctions async typées dont le corps lit les fixtures de `src/services/fixtures/`. Le jour où le backend existe, **seul l'intérieur des fonctions change** : les signatures sont le contrat, les pages n'importent jamais les fixtures directement.

## i18n (next-intl, sans routing par locale)

- Locale par défaut : `fr`. La config (`src/i18n/request.ts`) fusionne 5 namespaces : `common`, `home`, `training`, `history`, `certificates`.
- Chaque page possède exactement un namespace. `common` porte la TopBar et les libellés partagés.
- Toute clé ajoutée en `fr` doit avoir son miroir traduit en `en`.

## Structure

```
src/app/               Pages : / (accueil), /trainings/[id], /history, /certificates
src/components/        Composants partagés (TopBar, Card, DateBlock, ValidityGauge, Stepper, ModeTag, StatusPill, icons...)
src/i18n/              config.ts (locales, namespaces) + request.ts (chargement des messages)
src/lib/               types.ts (domaine) + format.ts (dates)
src/services/          Services + fixtures/
messages/fr|en/        Chaînes UI par namespace
docs/                  Contexte de la refonte, décisions, questions ouvertes, modèle de données
```

Les composants spécifiques à une page vivent dans le dossier de sa route, pas dans `src/components/`.

## Règles métier clés

- États d'une sensibilisation : `overdue` (en retard), `todo` (à faire), `registered` (inscrit à une session), `valid` (validée). **L'état dicte l'affichage** : validée = rien à faire + date de fin de validité ; inscrit = rien à faire + rappel de la session annulable ; à faire = session recommandée + e-learning discret si disponible.
- Modes de validation : `session`, `elearning`, ou `both`.
- `seatsLeft: null` signifie session complète (pas 0 places restantes affichables).

## Pièges connus

- Le fichier `AGENTS.md` est régénéré par `next dev` (bloc nextjs-agent-rules) : ne pas supprimer ce bloc, il revient.
- Tailwind v4 : pas de `tailwind.config.js`, tout passe par `@theme` dans `globals.css`.
- next-intl est configuré **sans** routing par locale : pas de segment `[locale]` dans `src/app/`.
- Les fixtures reproduisent exactement les maquettes (Marie Lefebvre, site Cholet). Ne pas « améliorer » les données sans raison : elles servent de référence visuelle pixel-perfect.
- Largeur de référence desktop : 1440px. Les pages doivent rester correctes en dessous (max-width + centrage, aucun scroll horizontal).
