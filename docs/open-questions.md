# Points ouverts

Questions non tranchées, reprises des notes de cadrage. La plupart sont à confirmer avec le client. Elles n'empêchent pas le développement de la vue utilisateur, mais certaines impacteront les services et les écrans d'administration à venir.

## Rôles et droits

- **Contenu des deux rôles intermédiaires** : responsable de périmètre et responsable de filière / objectif ne sont pas définis. La matrice de droits actuelle est une hypothèse de travail, pas une cible validée. À faire dire au client en call, sans proposer de cible avant.
- **Nommage du troisième rôle** : « Responsable Objectif » ou « Responsable de filière » ? Deux périmètres différents, la filière regroupant plusieurs sensibilisations.
- **Notion de site** : le site apparaît dans la matrice de droits (« ses sites ») et comme filtre par défaut de la vue utilisateur, mais sa définition exacte et son rattachement à l'utilisateur restent à expliciter.
- **Utilisateur à privilège** : il porte à la fois des sensibilisations attribuées (obligation) et un périmètre de droits. La distinction est source de confusion et devra être explicitée.
- **Nouvelles actions à ajouter à la matrice** : « annuler la validation chez un utilisateur » et, si la reconvocation est une inscription forcée, « inscrire un utilisateur à une session ». Périmètre à trancher avec le contenu des rôles intermédiaires.

## E-learning et certificats

- **Contrôle des certificats** : le dépôt vaut-il validation immédiate, ou passe-t-il par un contrôle d'un responsable avec possibilité de rejet ? Les fixtures actuelles supposent un contrôle (statuts validé / en attente / rejeté), à confirmer.
- **Le certificat déposé** : formats et tailles acceptés, date de passage saisie ou lue sur le document, point de départ de la durée de validité, conservation et consultation par les responsables.
- **E-learning exclusif ou combiné** : une sensibilisation ouverte à l'e-learning peut-elle aussi être portée par des sessions (deux voies au choix) ou l'e-learning est-il exclusif ? Le front actuel implémente le mode combiné (`both`), à confirmer.

## Annulation et reconvocation

- **Sens de la reconvocation** : inscription d'office sur une session choisie par le responsable, ou simple retour dans le vivier de relance ? Conséquences très différentes sur les droits et sur le moteur de mails.
- **Portée de l'annulation** : un utilisateur à la fois, ou tous les participants d'une session (session ratée, formateur non habilité) ?
- **Motif et traçabilité** : faut-il saisir un motif d'annulation, le conserver, et l'utilisateur en est-il informé par mail ?

## Moteur de relance par mail

Le moteur actuel repose sur des objets qui disparaissent (sensibilisation historique, série de sessions) et sur l'hypothèse qu'un objectif ne se valide qu'en s'inscrivant à un créneau. À reprendre :

- **Le pivot devient la sensibilisation portée par la session** : la règle d'éligibilité se réécrit contre les sensibilisations de la session, plus contre la hiérarchie.
- **Voie e-learning sans places** : le moteur ne relance qu'en assignant à un créneau ; il faut un mail invitant au dépôt de certificat, hors logique de places. La règle « invitations = places libres × 1,2 » n'a pas de sens pour cette voie.
- **Cadence de relance e-learning** : à quelle fréquence relancer et sur quel critère d'arrêt, sans place ni créneau à remplir ?
- **Le certificat comme preuve** : la relance cesse-t-elle dès le dépôt ou seulement après contrôle ? Dépend du point sur la validation des certificats.
- **Priorité après annulation** : un utilisateur annulé calculé sur sa date d'expiration d'origine aurait un score faible, alors que le besoin est immédiat. Remonter en tête ou suivre le barème ?
- **Délai de sept jours entre relances** : l'annulation force-t-elle un envoi immédiat ?
- **Ciblage par filière** : la filière étant portée par la sensibilisation, faut-il pouvoir segmenter les relances par filière ?

## Salles et logistique

- **Gestion des salles** : à prévoir dans la cible (la salle figée au niveau de la série fait partie du problème d'origine), mais le besoin n'est pas cadré : référentiel de salles, capacité, disponibilité, rattachement au site, conflits de réservation.

## Divers

- **Portée du « pour soi » des tags de session** : un tag ajouté reste dans les suggestions de son créateur, mais devient visible par les autres une fois posé sur une session. À clarifier si la question tombe en séance.
- **Migration des données** : la reprise de l'existant (validations acquises, historiques de sessions, objectifs attribués) vers le nouveau modèle n'est pas cadrée.
- **Accompagnement du changement de vocabulaire** : « sensibilisation » désignera autre chose qu'aujourd'hui pour les utilisateurs en place. Prévoir comment l'expliquer, et si un texte d'accompagnement est attendu.
