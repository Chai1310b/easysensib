# Contexte de la refonte

## D'où l'on part

L'application EasySensib historique gère le suivi des sensibilisations sécurité en entreprise : inscriptions, participation effective, preuves, KPIs, relances par mail. Sa structure repose sur quatre niveaux imbriqués :

> **Filière** > **Sensibilisation** > **Série de sessions** > **Session** (créneau)

À côté de cette hiérarchie, des **objectifs de sensibilisation** sont paramétrés et associés aux sensibilisations. C'est l'objectif qui relie l'utilisateur au dispositif : un utilisateur doit valider l'ensemble de ses objectifs, et passer une session valide les objectifs associés à sa sensibilisation.

Problèmes constatés :

- Les sessions d'une série ne sont pas modifiables individuellement (salle, formateur figés au niveau de la série).
- L'empilement filière / sensibilisation / série n'apporte rien à l'utilisateur final et complique l'administration.
- Un objectif ne se valide que par une session : pas de voie e-learning.

## Où l'on va

La cible ne conserve que **deux concepts** :

1. **La sensibilisation** : ce que l'utilisateur doit valider.
2. **La session** : le créneau (présentiel ou visio) qui permet de la valider.

Chaque session est indépendante et modifiable individuellement. À la création, on peut générer plusieurs sessions d'un coup avec les mêmes caractéristiques, mais c'est un raccourci de création, pas un regroupement.

Une sensibilisation se valide :

- **par session** : la participation à une session valide les sensibilisations qu'elle porte ;
- **par e-learning** : dépôt d'un certificat par l'utilisateur, quand la sensibilisation l'autorise ;
- **ou les deux** (mode `both`), au choix de l'utilisateur.

Une fois validée, la sensibilisation porte une **durée de validité**, puis doit être repassée.

## Le renommage : objectif devient sensibilisation

C'est le point de vocabulaire critique de la refonte. Le mot « sensibilisation » change de référent :

| Objet                                                           | Aujourd'hui                 | En cible                        |
| --------------------------------------------------------------- | --------------------------- | ------------------------------- |
| Niveau intermédiaire entre la filière et les séries de sessions | Sensibilisation             | **Supprimé**                    |
| Ce que l'utilisateur doit valider                               | Objectif de sensibilisation | **Sensibilisation** (renommage) |

Le **concept** d'objectif survit et devient l'un des deux piliers de la cible, renommé « sensibilisation ». Le concept aujourd'hui appelé sensibilisation disparaît. Le mot survit, l'objet qu'il désignait non.

Conséquence pour ce dépôt : l'UI dit « sensibilisation », le code dit `Training`, et les documents historiques (guide de relance, schémas) emploient encore « objectif ». Toute phrase ancienne contenant « sensibilisation » est ambiguë tant qu'on ne sait pas de quelle version on parle.

La filière ne disparaît pas complètement : elle devient une simple **catégorisation portée par la sensibilisation** (champ `category` du type `Training`), en liste fermée, servant de filtre. Les sessions, elles, peuvent porter des **tags** ouverts.

## Règle de visibilité par inclusion

La règle historique est conservée, transposée aux sessions :

> Un utilisateur voit une session si l'ensemble des sensibilisations qu'elle porte est entièrement contenu dans les siennes.

Exemple pour un utilisateur ayant {A, B, C} :

| Sensibilisations de la session | Visible ? |
| ------------------------------ | --------- |
| A · A+B · B+C · A+B+C          | Oui       |
| A+E · B+D · A+B+C+D            | Non       |

Il faut donc au moins une sensibilisation commune, et aucune sensibilisation que l'utilisateur n'a pas. Cette règle alimente aussi l'éligibilité du moteur de relance par mail.

À ne pas confondre avec le **périmètre de droits** des utilisateurs à privilège : l'attribution d'une sensibilisation crée une obligation (et la visibilité ci-dessus), le périmètre de droits définit ce qu'un responsable peut voir et gérer.

## Vue utilisateur standard

| Aujourd'hui (menu à trois entrées) | Cible (page unique)                                          |
| ---------------------------------- | ------------------------------------------------------------ |
| Sensibilisations à passer          | Toutes les sensibilisations de l'utilisateur, avec leur état |
| Sessions réservées                 | Rappel de la session sur la carte concernée                  |
| Objectifs validés                  | Sensibilisations validées avec durée de validité             |

La liste des sessions proposées est filtrée par défaut sur le **site** de l'utilisateur. Pour une sensibilisation ouverte à l'e-learning, l'utilisateur dispose du dépôt de certificat directement depuis sa page.

## Périmètre de ce dépôt

Ce dépôt couvre uniquement la **vue utilisateur standard** de la cible : page d'accueil « Mes sensibilisations », page d'inscription à une session, historique des participations, certificats e-learning. Les écrans d'administration (création de sessions, gestion des rôles, console de relance) ne sont pas dans le périmètre actuel.

Aucun backend : les services de `src/services/` retournent des fixtures reproduisant les maquettes de référence.
