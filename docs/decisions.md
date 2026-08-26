# Décisions produit et design actées

Décisions validées lors du cadrage et de la phase de maquettes. Elles font foi pour l'implémentation de la vue utilisateur.

## Produit

### Deux concepts seulement

La cible ne conserve que la sensibilisation (ex-objectif) et la session. Filière (en tant que niveau hiérarchique), sensibilisation historique et série de sessions disparaissent. La filière subsiste comme catégorisation portée par la sensibilisation.

### Page unique, sans menu

L'utilisateur standard n'a pas de menu de navigation : une seule page liste toutes ses sensibilisations. L'historique et les certificats sont accessibles ponctuellement mais l'accueil est le point d'entrée unique. L'ancien menu à trois entrées (à passer / sessions réservées / validés) disparaît.

### L'état dicte l'affichage

Chaque carte de sensibilisation s'affiche selon l'état, sans action superflue :

| État                                              | Affichage                                                                        |
| ------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Validée** (`valid`)                             | Rien à faire, date de fin de validité affichée                                   |
| **Inscrit à une session** (`registered`)          | Rien à faire, rappel de la session, annulable                                    |
| **À faire** (`todo`) ou **en retard** (`overdue`) | Session recommandée mise en avant, e-learning proposé discrètement si disponible |

La session recommandée est prioritaire sur l'e-learning dans la hiérarchie visuelle : l'e-learning est une voie secondaire, jamais un appel à l'action principal.

### Page dédiée d'inscription, pas de modale

L'inscription à une session se fait sur une page dédiée (`/trainings/[id]`) et non dans une modale : choix du créneau, récapitulatif, confirmation. La page porte un stepper qui situe l'utilisateur dans le parcours.

### Deux voies de validation

Une sensibilisation se valide par session, par e-learning (dépôt de certificat), ou les deux (`mode: 'session' | 'elearning' | 'both'`). Le paramètre e-learning se pose au niveau de la sensibilisation, pas de la session : c'est lui qui conditionne l'apparition du dépôt de certificat côté utilisateur.

### Pas d'attestation côté utilisateur

L'utilisateur ne télécharge pas d'attestation de participation depuis l'application. Les seuls documents gérés côté utilisateur sont les **certificats e-learning** qu'il dépose lui-même (page `/certificates`, statuts validé / en attente / rejeté avec motif).

### Sessions indépendantes

Chaque session est modifiable individuellement (salle, formateur, horaire). La création multiple est un raccourci de saisie, pas un regroupement.

## Design

### Jauge de validité fine

La validité restante est représentée par une jauge fine (barre de 4px, radius full) accompagnée d'un libellé 12px semibold coloré. Trois tons : rouge (en retard), orange (échéance proche), vert (à jour). Pas de gros compteur ni de camembert.

### Stepper Inscription · Session · Validation

Le parcours d'inscription affiche un stepper à trois étapes de largeur fixe : Inscription (crayon), Session (calendrier), Validation (check). Cercles 28px reliés par des lignes 2px ; étape faite en vert plein avec check blanc, étape courante en bleu plein, étape future en contour gris.

### Système visuel

- Fonts : Space Grotesk (titres, chiffres de date) + Instrument Sans (corps).
- Fond de page #f4f5f1, topbar sombre #14161a, cartes blanches à bordure #e2e4de radius 12px, accent bleu #2b3fbf.
- Tous les tokens sont définis dans `src/app/globals.css` (bloc `@theme`).
- Icônes : SVG inline stroke-based repris des maquettes, aucune librairie d'icônes.
- Largeur de référence 1440px, contenu centré avec max-width, aucun scroll horizontal en dessous.

### Composants récurrents

TopBar (logo bouclier + EasySensib, lien Aide, pastille site, avatar), DateBlock (jour + mois abrégé), jauge de validité, stepper, tags de mode (Session / E-learning), paires icône + valeur (horaire, lieu, format, places), pastilles de statut (check vert, horloge, croix rouge).

## Conventions transverses

- UI en français via next-intl, structure prête pour l'anglais, sans routing par locale.
- Vocabulaire UI : « sensibilisation », jamais « formation » ni « objectif ».
- Aucun tiret cadratin dans les chaînes UI ni la documentation : « · » ou virgules.
- La couche `src/services/` est la frontière backend : fixtures aujourd'hui, API demain, signatures inchangées.
