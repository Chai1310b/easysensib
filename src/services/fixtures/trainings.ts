import type { Training } from '@/lib/types';

/** Reference "today" for the fixture dataset: 2026-08-26. */
export const trainingsFixture: Training[] = [
  {
    id: 't-h0b0',
    name: 'Habilitation électrique H0B0',
    description:
      "Reconnaître les risques électriques, appliquer les distances de sécurité et les consignes pour travailler à proximité d'installations électriques sans habilitation de travaux.",
    category: 'Sécurité',
    mode: 'session',
    state: 'overdue',
    durationHours: 3,
    validityYears: 3,
    validity: {
      dueAt: '2026-06-12',
      progressPercent: 100,
      tone: 'danger',
      labelKey: 'overdueDays',
      labelCount: 75,
    },
  },
  {
    id: 't-cyber',
    name: 'Cybersécurité au poste de travail',
    description:
      'Adopter les bons réflexes au poste de travail : mots de passe, hameçonnage, données sensibles et signalement des incidents de sécurité.',
    category: 'Sûreté',
    mode: 'both',
    state: 'todo',
    durationHours: 2.5,
    validityYears: 2,
    validity: {
      dueAt: '2026-10-15',
      progressPercent: 56,
      tone: 'warning',
      labelKey: 'remainingDays',
      labelCount: 50,
    },
  },
  {
    id: 't-gestes',
    name: 'Gestes et postures',
    description:
      'Prévenir les troubles musculo-squelettiques : postures de travail, manutention de charges et aménagement du poste.',
    category: 'QHSE',
    mode: 'session',
    state: 'registered',
    durationHours: 2,
    validityYears: 2,
    registration: { sessionId: 's-gestes-2026-10-09' },
    lastValidation: { kind: 'session', date: '2025-01-20' },
    validity: {
      obtainedAt: '2025-01-20',
      expiresAt: '2027-01-20',
      progressPercent: 79,
      tone: 'warning',
      labelKey: 'expiresInMonths',
      labelCount: 5,
    },
  },
  {
    id: 't-incendie',
    name: 'Risque incendie',
    description:
      "Réagir face à un départ de feu : alarme, extincteurs, cheminements d'évacuation et points de rassemblement du site.",
    category: 'Sécurité',
    mode: 'session',
    state: 'valid',
    durationHours: 2,
    validityYears: 2,
    lastValidation: { kind: 'session', date: '2026-03-14' },
    validity: {
      obtainedAt: '2026-03-14',
      expiresAt: '2028-03-14',
      progressPercent: 21,
      tone: 'success',
      labelKey: 'validMonthsLeft',
      labelCount: 19,
    },
  },
  {
    id: 't-accueil',
    name: 'Accueil sécurité site',
    description:
      "Consignes générales du site : accès, circulation, équipements de protection et conduite à tenir en cas d'urgence.",
    category: 'Sécurité',
    mode: 'elearning',
    state: 'valid',
    durationHours: 1,
    validityYears: 3,
    lastValidation: { kind: 'certificate', date: '2026-05-02', certificateId: 'c-accueil' },
    validity: {
      obtainedAt: '2026-05-02',
      expiresAt: '2029-05-02',
      progressPercent: 9,
      tone: 'success',
      labelKey: 'validMonthsLeft',
      labelCount: 33,
    },
  },
];
