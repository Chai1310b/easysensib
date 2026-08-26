# Modèle de données

Les types vivent dans `src/lib/types.ts`, source unique du domaine. Le code est en anglais ; ce document donne la correspondance avec le vocabulaire métier français. Toutes les dates sont des chaînes ISO (`YYYY-MM-DD`).

## Correspondance code / métier

| Type (code)           | Vocabulaire métier (UI)                          |
| --------------------- | ------------------------------------------------ |
| `Training`            | Sensibilisation (ex-objectif de sensibilisation) |
| `Training.category`   | Filière                                          |
| `SessionSlot`         | Session (créneau, présentiel ou visio)           |
| `ParticipationRecord` | Ligne d'historique de participation              |
| `Certificate`         | Certificat e-learning déposé par l'utilisateur   |
| `CurrentUser`         | Utilisateur connecté (utilisateur standard)      |

Attention : `Training` ne correspond pas à la « sensibilisation » de l'ancienne application (niveau hiérarchique supprimé), mais à l'ex-objectif renommé. Voir `docs/context.md`.

## Training (sensibilisation)

```
Training {
  id, name
  category        Filière (Sécurité, Sûreté, QHSE...), liste fermée, sert de filtre
  mode            ValidationMode
  state           TrainingState
  validity        TrainingValidity
  durationHours?  Durée d'une session, en heures
  validityYears?  Durée de validité une fois obtenue, en années
  registration?   { sessionId } présent quand l'utilisateur est inscrit à une session
  lastValidation? Dernière validation (par session ou par certificat)
}
```

### ValidationMode : les voies de validation

| Valeur      | Sens métier                                               |
| ----------- | --------------------------------------------------------- |
| `session`   | Se valide uniquement en participant à une session         |
| `elearning` | Se valide uniquement par dépôt d'un certificat e-learning |
| `both`      | Les deux voies sont ouvertes, au choix de l'utilisateur   |

Le mode se pose au niveau de la sensibilisation, pas de la session : c'est lui qui fait apparaître (ou non) le dépôt de certificat côté utilisateur.

### TrainingState : l'état dicte l'affichage

| Valeur       | Sens métier                                                       | Affichage                                             |
| ------------ | ----------------------------------------------------------------- | ----------------------------------------------------- |
| `overdue`    | En retard : échéance dépassée, jamais validée ou validité expirée | Session recommandée, ton rouge                        |
| `todo`       | À faire : échéance à venir                                        | Session recommandée, e-learning discret si disponible |
| `registered` | Inscrit à une session à venir                                     | Rien à faire, rappel de la session, annulable         |
| `valid`      | Validée et encore valide                                          | Rien à faire, date de fin de validité                 |

### TrainingValidity : la jauge

Champs pré-calculés côté service pour que les composants restent purement présentatifs :

| Champ                     | Rôle                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `obtainedAt?`             | Date de dernière validation                                                           |
| `expiresAt?`              | Fin de la période de validité (états `valid` / `registered`)                          |
| `dueAt?`                  | Échéance pour (re)valider (états `overdue` / `todo`)                                  |
| `progressPercent`         | Remplissage de la jauge, 0 à 100                                                      |
| `tone`                    | `danger` / `warning` / `success` : couleur de la jauge et du libellé                  |
| `labelKey` + `labelCount` | Clé i18n du libellé (namespace `common.validity`) et nombre interpolé (jours ou mois) |

## SessionSlot (session)

```
SessionSlot {
  id, trainingId, trainingName
  date, startTime, endTime     Jour et horaires ("9h00", "12h00")
  format                       'onsite' (présentiel) | 'remote' (visio)
  location?                    { building, room }, présentiel uniquement
  site                         Site de la session (ex. "Cholet")
  seatsLeft                    Places restantes ; null = session complète
  isRegistered                 L'utilisateur courant est inscrit sur ce créneau
}
```

Point de vigilance : `seatsLeft: null` signifie **complète**, pas « inconnu ». La liste des sessions proposées est filtrée par défaut sur le site de l'utilisateur.

## ParticipationRecord (historique)

```
ParticipationRecord {
  id, date, trainingName
  kind        'session' | 'elearning'
  format?     'onsite' | 'remote' quand kind = 'session'
  location?   Libellé libre, ex. "Cholet · Bât. A, salle 12"
  trainer?    Formateur, ex. "P. Moreau"
  status      'attended' (présent) | 'absent' | 'certificate' (validé par certificat)
}
```

## Certificate (certificat e-learning)

```
Certificate {
  id, fileName, trainingId, trainingName, uploadedAt
  status            'approved' (validé) | 'pending' (en attente) | 'rejected' (rejeté)
  rejectionReason?  Motif quand rejeté, ex. "document illisible"
  validUntil?       Fin de validité quand approuvé
}
```

Le cycle approuvé / en attente / rejeté suppose un contrôle par un responsable ; ce point reste à confirmer avec le client (voir `docs/open-questions.md`). Un rejet équivaut à l'annulation de la validation : la sensibilisation repasse à l'état non validé.

## CurrentUser (utilisateur connecté)

```
CurrentUser { id, firstName, lastName, initials, site }
```

`initials` alimente l'avatar de la TopBar, `site` la pastille de site et le filtre par défaut des sessions.

## Fixtures de référence

Les fixtures (`src/services/fixtures/`) reproduisent exactement les données des maquettes : Marie Lefebvre, site Cholet, H0B0 en retard de 75 jours, Cybersécurité jamais passée (50 jours restants, e-learning + session), Gestes et postures inscrite au 9 octobre, Risque incendie valide jusqu'en mars 2028, Accueil sécurité site validée par e-learning jusqu'en mai 2029, sessions de septembre à novembre dont une complète, historique 2025-2026, trois certificats (validé, en attente, rejeté). Elles servent de référence visuelle : ne pas les modifier sans raison.
