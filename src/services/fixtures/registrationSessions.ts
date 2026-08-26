import type { SessionSlot } from '@/lib/types';

/**
 * Extra open session slots shown on the registration page only.
 * Kept out of `sessionsFixture` so the home page keeps the exact
 * mockup dataset (18 sept / 1 oct / 9 oct / 20 oct / 4 nov).
 */
export const registrationSessionsFixture: SessionSlot[] = [
  {
    id: 's-cyber-2026-09-24',
    trainingId: 't-cyber',
    trainingName: 'Cybersécurité au poste de travail',
    date: '2026-09-24',
    startTime: '10h00',
    endTime: '12h30',
    format: 'remote',
    site: 'Cholet',
    seatsLeft: 14,
    isRegistered: false,
  },
  {
    id: 's-cyber-2026-10-16',
    trainingId: 't-cyber',
    trainingName: 'Cybersécurité au poste de travail',
    date: '2026-10-16',
    startTime: '9h00',
    endTime: '11h30',
    format: 'onsite',
    location: { building: 'Bât. A', room: 'salle 12' },
    site: 'Cholet',
    seatsLeft: 8,
    isRegistered: false,
  },
  {
    id: 's-gestes-2026-10-21',
    trainingId: 't-gestes',
    trainingName: 'Gestes et postures',
    date: '2026-10-21',
    startTime: '14h00',
    endTime: '16h00',
    format: 'onsite',
    location: { building: 'Bât. C', room: 'salle 8' },
    site: 'Cholet',
    seatsLeft: 10,
    isRegistered: false,
  },
  {
    id: 's-gestes-2026-11-12',
    trainingId: 't-gestes',
    trainingName: 'Gestes et postures',
    date: '2026-11-12',
    startTime: '10h00',
    endTime: '12h00',
    format: 'onsite',
    location: { building: 'Bât. C', room: 'salle 8' },
    site: 'Cholet',
    seatsLeft: null,
    isRegistered: false,
  },
];
