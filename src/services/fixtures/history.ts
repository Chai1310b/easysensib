import type { ParticipationRecord } from '@/lib/types';

/** Ordered from most recent to oldest. */
export const historyFixture: ParticipationRecord[] = [
  {
    id: 'p-accueil-2026',
    date: '2026-05-02',
    trainingName: 'Accueil sécurité site',
    trainingId: 't-accueil',
    kind: 'elearning',
    status: 'certificate',
  },
  {
    id: 'p-incendie-2026',
    date: '2026-03-14',
    trainingName: 'Risque incendie',
    trainingId: 't-incendie',
    startTime: '9h00',
    endTime: '11h00',
    kind: 'session',
    format: 'onsite',
    location: 'Cholet · Bât. A, salle 12',
    trainer: 'P. Moreau',
    status: 'attended',
  },
  {
    id: 'p-chimique-2025',
    date: '2025-09-12',
    trainingName: 'Risque chimique · niveau 1',
    startTime: '14h00',
    endTime: '17h00',
    kind: 'session',
    format: 'onsite',
    location: 'Cholet · Bât. B, salle 204',
    status: 'absent',
  },
  {
    id: 'p-gestes-2025',
    date: '2025-01-20',
    trainingName: 'Gestes et postures',
    kind: 'session',
    format: 'onsite',
    location: 'Gennevilliers · Bât. D, salle 2',
    status: 'attended',
  },
  {
    id: 'p-accueil-2025',
    date: '2025-01-08',
    trainingName: 'Accueil sécurité site',
    kind: 'session',
    format: 'remote',
    status: 'attended',
  },
];
