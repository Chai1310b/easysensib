/**
 * Fixture dataset of the manager/admin space.
 * Reference "today" is 2026-08-26, the same as the end-user fixtures.
 *
 * Counters that appear on several screens (users concerned, users late,
 * planned sessions, dashboard stats) are DERIVED from the raw data below so
 * every screen tells the same story. Only the raw rows are hand-written.
 */

import type {
  AdminSession,
  AdminSessionParticipant,
  AdminTraining,
  AdminTrainingState,
  AdminUser,
  AdminUserTraining,
  AttendanceStatus,
  CertificateReview,
  RelanceExecution,
  RelanceSettings,
  Site,
  TrainingCategory,
} from '@/lib/admin-types';
import type { ValidationMode } from '@/lib/types';

/** Reference date of the whole fixture dataset. */
export const TODAY = '2026-08-26';

/* ------------------------------------------------------------------ */
/* Trainings                                                           */
/* ------------------------------------------------------------------ */

interface RawTraining {
  id: string;
  name: string;
  category: TrainingCategory;
  mode: ValidationMode;
  validityMonths: number;
  durationHours: number;
  ownerId?: string;
}

const RAW_TRAININGS: RawTraining[] = [
  {
    id: 't-h0b0',
    name: 'Habilitation électrique H0B0',
    category: 'Sécurité',
    mode: 'session',
    validityMonths: 36,
    durationHours: 3,
    ownerId: 'u-berger',
  },
  {
    id: 't-gestes',
    name: 'Gestes et postures',
    category: 'Sécurité',
    mode: 'both',
    validityMonths: 24,
    durationHours: 3.5,
    ownerId: 'u-berger',
  },
  {
    id: 't-incendie',
    name: 'Manipulation des extincteurs',
    category: 'Sécurité',
    mode: 'session',
    validityMonths: 12,
    durationHours: 2,
    ownerId: 'u-berger',
  },
  {
    id: 't-evac',
    name: 'Guide-file et serre-file',
    category: 'Sécurité',
    mode: 'session',
    validityMonths: 24,
    durationHours: 2,
  },
  {
    id: 't-sst',
    name: 'Sauveteur secouriste du travail',
    category: 'Sécurité',
    mode: 'session',
    validityMonths: 24,
    durationHours: 14,
  },
  {
    id: 't-cyber',
    name: 'Cybersécurité au poste de travail',
    category: 'Sûreté',
    mode: 'both',
    validityMonths: 24,
    durationHours: 2.5,
    ownerId: 'u-nguyen',
  },
  {
    id: 't-confid',
    name: 'Protection du secret et confidentialité',
    category: 'Sûreté',
    mode: 'elearning',
    validityMonths: 36,
    durationHours: 1.5,
    ownerId: 'u-nguyen',
  },
  {
    id: 't-badge',
    name: "Contrôle d'accès et port du badge",
    category: 'Sûreté',
    mode: 'elearning',
    validityMonths: 24,
    durationHours: 1,
  },
  {
    id: 't-voyage',
    name: "Sûreté des déplacements à l'étranger",
    category: 'Sûreté',
    mode: 'both',
    validityMonths: 36,
    durationHours: 2,
    ownerId: 'u-nguyen',
  },
  {
    id: 't-rgpd',
    name: 'Sensibilisation RGPD',
    category: 'Sûreté',
    mode: 'elearning',
    validityMonths: 24,
    durationHours: 1,
  },
  {
    id: 't-accueil',
    name: 'Accueil sécurité site',
    category: 'QHSE',
    mode: 'session',
    validityMonths: 60,
    durationHours: 1.5,
    ownerId: 'u-fontaine',
  },
  {
    id: 't-chimie',
    name: 'Risque chimique et produits dangereux',
    category: 'QHSE',
    mode: 'session',
    validityMonths: 24,
    durationHours: 3,
    ownerId: 'u-fontaine',
  },
  {
    id: 't-dechets',
    name: 'Tri et gestion des déchets',
    category: 'QHSE',
    mode: 'elearning',
    validityMonths: 36,
    durationHours: 1,
  },
];

const TRAINING_NAMES = new Map(RAW_TRAININGS.map((t) => [t.id, t.name]));

/** Training name by id, or the id itself when unknown. */
export function trainingName(id: string): string {
  return TRAINING_NAMES.get(id) ?? id;
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

/**
 * Compact user row: [id, firstName, lastName, site, role, flags, trainings]
 * A training entry is [trainingId, state, dateHint] where dateHint is the
 * expiry date for valid/expiring states and the last validation otherwise.
 */
interface RawUser {
  id: string;
  firstName: string;
  lastName: string;
  site: Site;
  role: AdminUser['role'];
  isVip?: boolean;
  isActive?: boolean;
  noEmail?: boolean;
  lastActivity: string;
  managedSites?: Site[];
  managedTrainingIds?: string[];
  trainings: [string, AdminTrainingState, string?, ('session' | 'certificate')?][];
}

const RAW_USERS: RawUser[] = [
  {
    id: 'u-lefebvre',
    firstName: 'Marie',
    lastName: 'Lefebvre',
    site: 'Cholet',
    role: 'user',
    lastActivity: '2026-08-25',
    trainings: [
      ['t-h0b0', 'overdue', '2026-06-12'],
      ['t-cyber', 'expiring', '2026-10-15'],
      ['t-gestes', 'registered'],
      ['t-accueil', 'valid', '2029-05-01', 'session'],
    ],
  },
  {
    id: 'u-berger',
    firstName: 'Antoine',
    lastName: 'Berger',
    site: 'Cholet',
    role: 'training_manager',
    lastActivity: '2026-08-26',
    managedTrainingIds: ['t-h0b0', 't-gestes', 't-incendie', 't-evac', 't-sst'],
    trainings: [
      ['t-h0b0', 'valid', '2028-02-10', 'session'],
      ['t-accueil', 'valid', '2030-01-20', 'session'],
      ['t-cyber', 'valid', '2027-11-04', 'session'],
    ],
  },
  {
    id: 'u-nguyen',
    firstName: 'Linh',
    lastName: 'Nguyen',
    site: 'Gennevilliers',
    role: 'training_manager',
    lastActivity: '2026-08-26',
    managedTrainingIds: ['t-cyber', 't-confid', 't-badge', 't-voyage', 't-rgpd'],
    trainings: [
      ['t-cyber', 'valid', '2028-03-18', 'session'],
      ['t-confid', 'valid', '2029-01-09', 'certificate'],
      ['t-voyage', 'expiring', '2026-10-02'],
    ],
  },
  {
    id: 'u-fontaine',
    firstName: 'Claire',
    lastName: 'Fontaine',
    site: 'Mérignac',
    role: 'perimeter_manager',
    lastActivity: '2026-08-24',
    managedSites: ['Mérignac'],
    managedTrainingIds: ['t-accueil', 't-chimie', 't-dechets'],
    trainings: [
      ['t-accueil', 'valid', '2029-09-14', 'session'],
      ['t-chimie', 'valid', '2027-06-30', 'session'],
      ['t-rgpd', 'overdue', '2026-04-11'],
    ],
  },
  {
    id: 'u-dubois',
    firstName: 'Pierre',
    lastName: 'Dubois',
    site: 'Cholet',
    role: 'perimeter_manager',
    lastActivity: '2026-08-26',
    managedSites: ['Cholet'],
    trainings: [
      ['t-accueil', 'valid', '2028-11-02', 'session'],
      ['t-incendie', 'expiring', '2026-09-30'],
      ['t-h0b0', 'valid', '2027-04-15', 'session'],
    ],
  },
  {
    id: 'u-moreau',
    firstName: 'Sophie',
    lastName: 'Moreau',
    site: 'Gennevilliers',
    role: 'admin',
    lastActivity: '2026-08-26',
    managedSites: ['Cholet', 'Gennevilliers', 'Mérignac'],
    trainings: [
      ['t-accueil', 'valid', '2031-02-01', 'session'],
      ['t-cyber', 'valid', '2028-07-22', 'session'],
      ['t-confid', 'valid', '2028-12-05', 'certificate'],
    ],
  },
  {
    id: 'u-caron',
    firstName: 'Julien',
    lastName: 'Caron',
    site: 'Cholet',
    role: 'user',
    lastActivity: '2026-08-19',
    trainings: [
      ['t-h0b0', 'never'],
      ['t-accueil', 'valid', '2030-06-18', 'session'],
      ['t-incendie', 'overdue', '2026-03-05'],
    ],
  },
  {
    id: 'u-perrin',
    firstName: 'Nadia',
    lastName: 'Perrin',
    site: 'Cholet',
    role: 'user',
    lastActivity: '2026-08-22',
    trainings: [
      ['t-gestes', 'overdue', '2026-05-21'],
      ['t-accueil', 'valid', '2029-03-11', 'session'],
      ['t-rgpd', 'valid', '2027-10-08', 'certificate'],
    ],
  },
  {
    id: 'u-garnier',
    firstName: 'Thomas',
    lastName: 'Garnier',
    site: 'Gennevilliers',
    role: 'user',
    isVip: true,
    lastActivity: '2026-07-30',
    trainings: [
      ['t-cyber', 'overdue', '2026-02-14'],
      ['t-confid', 'valid', '2028-05-19', 'certificate'],
      ['t-accueil', 'valid', '2029-11-27', 'session'],
    ],
  },
  {
    id: 'u-roussel',
    firstName: 'Émilie',
    lastName: 'Roussel',
    site: 'Mérignac',
    role: 'user',
    lastActivity: '2026-08-21',
    trainings: [
      ['t-chimie', 'overdue', '2026-01-30'],
      ['t-accueil', 'valid', '2028-08-12', 'session'],
      ['t-dechets', 'registered'],
    ],
  },
  {
    id: 'u-marchand',
    firstName: 'Kevin',
    lastName: 'Marchand',
    site: 'Cholet',
    role: 'user',
    lastActivity: '2026-08-14',
    trainings: [
      ['t-h0b0', 'registered'],
      ['t-gestes', 'valid', '2027-09-03', 'session'],
      ['t-accueil', 'valid', '2029-01-15', 'session'],
    ],
  },
  {
    id: 'u-bonnet',
    firstName: 'Alice',
    lastName: 'Bonnet',
    site: 'Gennevilliers',
    role: 'user',
    lastActivity: '2026-08-26',
    trainings: [
      ['t-rgpd', 'never'],
      ['t-cyber', 'valid', '2027-12-01', 'session'],
      ['t-badge', 'valid', '2028-04-23', 'certificate'],
    ],
  },
  {
    id: 'u-leroy',
    firstName: 'Hugo',
    lastName: 'Leroy',
    site: 'Mérignac',
    role: 'user',
    noEmail: true,
    lastActivity: '2026-05-06',
    trainings: [
      ['t-accueil', 'overdue', '2026-04-02'],
      ['t-chimie', 'never'],
    ],
  },
  {
    id: 'u-simon',
    firstName: 'Camille',
    lastName: 'Simon',
    site: 'Cholet',
    role: 'user',
    lastActivity: '2026-08-25',
    trainings: [
      ['t-sst', 'expiring', '2026-09-18'],
      ['t-accueil', 'valid', '2028-10-30', 'session'],
      ['t-incendie', 'valid', '2027-02-08', 'session'],
    ],
  },
  {
    id: 'u-girard',
    firstName: 'Mathieu',
    lastName: 'Girard',
    site: 'Gennevilliers',
    role: 'user',
    lastActivity: '2026-08-18',
    trainings: [
      ['t-voyage', 'overdue', '2026-06-29'],
      ['t-cyber', 'registered'],
      ['t-confid', 'valid', '2029-07-14', 'certificate'],
    ],
  },
  {
    id: 'u-lambert',
    firstName: 'Sarah',
    lastName: 'Lambert',
    site: 'Mérignac',
    role: 'user',
    lastActivity: '2026-08-23',
    trainings: [
      ['t-dechets', 'expiring', '2026-10-05'],
      ['t-accueil', 'valid', '2030-03-27', 'session'],
      ['t-chimie', 'valid', '2027-07-19', 'session'],
    ],
  },
  {
    id: 'u-faure',
    firstName: 'Nicolas',
    lastName: 'Faure',
    site: 'Cholet',
    role: 'user',
    isActive: false,
    lastActivity: '2025-11-12',
    trainings: [
      ['t-h0b0', 'overdue', '2025-12-20'],
      ['t-accueil', 'valid', '2027-05-04', 'session'],
    ],
  },
  {
    id: 'u-blanchard',
    firstName: 'Laura',
    lastName: 'Blanchard',
    site: 'Gennevilliers',
    role: 'user',
    lastActivity: '2026-08-26',
    trainings: [
      ['t-badge', 'never'],
      ['t-rgpd', 'valid', '2028-01-16', 'certificate'],
      ['t-accueil', 'valid', '2029-06-09', 'session'],
    ],
  },
  {
    id: 'u-mercier',
    firstName: 'Vincent',
    lastName: 'Mercier',
    site: 'Cholet',
    role: 'user',
    lastActivity: '2026-08-20',
    trainings: [
      ['t-evac', 'overdue', '2026-07-01'],
      ['t-incendie', 'registered'],
      ['t-accueil', 'valid', '2028-09-22', 'session'],
    ],
  },
  {
    id: 'u-chevalier',
    firstName: 'Inès',
    lastName: 'Chevalier',
    site: 'Mérignac',
    role: 'user',
    lastActivity: '2026-08-17',
    trainings: [
      ['t-chimie', 'expiring', '2026-11-13'],
      ['t-dechets', 'valid', '2029-04-28', 'certificate'],
      ['t-accueil', 'valid', '2031-01-07', 'session'],
    ],
  },
  {
    id: 'u-renard',
    firstName: 'Paul',
    lastName: 'Renard',
    site: 'Gennevilliers',
    role: 'user',
    isVip: true,
    lastActivity: '2026-08-11',
    trainings: [
      ['t-confid', 'overdue', '2026-05-08'],
      ['t-cyber', 'valid', '2027-08-25', 'session'],
    ],
  },
  {
    id: 'u-masson',
    firstName: 'Julie',
    lastName: 'Masson',
    site: 'Cholet',
    role: 'user',
    lastActivity: '2026-08-24',
    trainings: [
      ['t-gestes', 'never'],
      ['t-accueil', 'valid', '2029-12-03', 'session'],
      ['t-h0b0', 'valid', '2028-06-11', 'session'],
    ],
  },
  {
    id: 'u-poirier',
    firstName: 'Damien',
    lastName: 'Poirier',
    site: 'Mérignac',
    role: 'user',
    lastActivity: '2026-08-13',
    trainings: [
      ['t-accueil', 'registered'],
      ['t-dechets', 'never'],
    ],
  },
  {
    id: 'u-colin',
    firstName: 'Anaïs',
    lastName: 'Colin',
    site: 'Gennevilliers',
    role: 'user',
    lastActivity: '2026-08-26',
    trainings: [
      ['t-cyber', 'expiring', '2026-09-25'],
      ['t-rgpd', 'valid', '2027-03-30', 'certificate'],
      ['t-badge', 'valid', '2028-02-17', 'certificate'],
    ],
  },
  {
    id: 'u-guerin',
    firstName: 'Franck',
    lastName: 'Guérin',
    site: 'Cholet',
    role: 'user',
    lastActivity: '2026-08-15',
    trainings: [
      ['t-sst', 'overdue', '2026-02-26'],
      ['t-incendie', 'valid', '2027-01-12', 'session'],
      ['t-accueil', 'valid', '2028-04-06', 'session'],
    ],
  },
  {
    id: 'u-rolland',
    firstName: 'Manon',
    lastName: 'Rolland',
    site: 'Mérignac',
    role: 'user',
    lastActivity: '2026-08-12',
    trainings: [
      ['t-chimie', 'registered'],
      ['t-accueil', 'valid', '2030-08-19', 'session'],
      ['t-rgpd', 'overdue', '2026-06-21'],
    ],
  },
  {
    id: 'u-legrand',
    firstName: 'Olivier',
    lastName: 'Legrand',
    site: 'Gennevilliers',
    role: 'user',
    lastActivity: '2026-08-10',
    trainings: [
      ['t-voyage', 'never'],
      ['t-confid', 'expiring', '2026-10-29'],
      ['t-accueil', 'valid', '2029-10-11', 'session'],
    ],
  },
  {
    id: 'u-brun',
    firstName: 'Sandra',
    lastName: 'Brun',
    site: 'Cholet',
    role: 'user',
    lastActivity: '2026-08-26',
    trainings: [
      ['t-evac', 'valid', '2027-11-23', 'session'],
      ['t-gestes', 'expiring', '2026-09-08'],
      ['t-accueil', 'valid', '2028-03-02', 'session'],
    ],
  },
];

function normalizeEmail(raw: RawUser): string {
  if (raw.noEmail) return '';
  const strip = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z]/g, '')
      .toLowerCase();
  return `${strip(raw.firstName)}.${strip(raw.lastName)}@thales.fr`;
}

/** ISO date shifted by the given number of months (negative to go back). */
function addMonths(iso: string, months: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1 + months, day);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function validityMonthsOf(trainingId: string): number {
  return RAW_TRAININGS.find((training) => training.id === trainingId)?.validityMonths ?? 24;
}

/** E-learning-only trainings can only ever be validated by certificate. */
function defaultValidatedBy(trainingId: string): 'session' | 'certificate' {
  const mode = RAW_TRAININGS.find((training) => training.id === trainingId)?.mode;
  return mode === 'elearning' ? 'certificate' : 'session';
}

function toUserTraining(entry: RawUser['trainings'][number]): AdminUserTraining {
  const [trainingId, state, dateHint, validatedBy] = entry;
  const base: AdminUserTraining = {
    trainingId,
    trainingName: trainingName(trainingId),
    state,
  };
  if (state === 'valid' || state === 'expiring' || state === 'overdue') {
    // A validated (even expired) training was obtained one validity period
    // before its expiry: derive the date so counters, gauges and history all
    // tell the same story.
    return {
      ...base,
      expiresAt: dateHint,
      lastValidatedAt: addMonths(dateHint as string, -validityMonthsOf(trainingId)),
      validatedBy: validatedBy ?? defaultValidatedBy(trainingId),
    };
  }
  return base;
}

export const adminUsersFixture: AdminUser[] = RAW_USERS.map((raw) => ({
  id: raw.id,
  firstName: raw.firstName,
  lastName: raw.lastName,
  name: `${raw.firstName} ${raw.lastName}`,
  email: normalizeEmail(raw),
  site: raw.site,
  role: raw.role,
  isVip: raw.isVip ?? false,
  isActive: raw.isActive ?? true,
  lastActivity: raw.lastActivity,
  trainings: raw.trainings.map(toUserTraining),
  ...(raw.managedSites ? { managedSites: raw.managedSites } : {}),
  ...(raw.managedTrainingIds ? { managedTrainingIds: raw.managedTrainingIds } : {}),
}));

const USERS_BY_ID = new Map(adminUsersFixture.map((u) => [u.id, u]));

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

interface RawSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  site: Site;
  building?: string;
  room?: string;
  format: AdminSession['format'];
  capacity: number;
  trainingIds: string[];
  tags: string[];
  status: AdminSession['status'];
  trainerName: string;
  /** [userId, attendance] pairs. */
  participants: [string, AttendanceStatus][];
}

const RAW_SESSIONS: RawSession[] = [
  {
    id: 's-2609-cholet',
    date: '2026-09-08',
    startTime: '9h00',
    endTime: '12h00',
    site: 'Cholet',
    building: 'Bât. A',
    room: 'Salle 12',
    format: 'onsite',
    capacity: 16,
    trainingIds: ['t-h0b0'],
    tags: ['Rentrée 2026', 'Atelier'],
    status: 'planned',
    trainerName: 'P. Moreau',
    participants: [
      ['u-marchand', 'registered'],
      ['u-lefebvre', 'registered'],
      ['u-caron', 'registered'],
      ['u-masson', 'registered'],
      ['u-brun', 'registered'],
      ['u-mercier', 'registered'],
      ['u-simon', 'registered'],
      ['u-perrin', 'registered'],
      ['u-guerin', 'registered'],
      ['u-dubois', 'registered'],
    ],
  },
  {
    id: 's-2609-gestes',
    date: '2026-09-15',
    startTime: '14h00',
    endTime: '17h30',
    site: 'Cholet',
    building: 'Bât. C',
    room: 'Salle 3',
    format: 'onsite',
    capacity: 12,
    trainingIds: ['t-gestes'],
    tags: ['Ergonomie'],
    status: 'planned',
    trainerName: 'A. Berger',
    participants: [
      ['u-lefebvre', 'registered'],
      ['u-perrin', 'registered'],
      ['u-masson', 'registered'],
      ['u-brun', 'registered'],
      ['u-simon', 'registered'],
      ['u-caron', 'registered'],
      ['u-mercier', 'registered'],
    ],
  },
  {
    id: 's-2609-cyber',
    date: '2026-09-17',
    startTime: '10h00',
    endTime: '12h30',
    site: 'Gennevilliers',
    format: 'remote',
    capacity: 40,
    trainingIds: ['t-cyber', 't-rgpd'],
    tags: ['Visio', 'Numérique responsable'],
    status: 'planned',
    trainerName: 'L. Nguyen',
    participants: [
      ['u-girard', 'registered'],
      ['u-colin', 'registered'],
      ['u-bonnet', 'registered'],
      ['u-blanchard', 'registered'],
      ['u-legrand', 'registered'],
      ['u-lefebvre', 'registered'],
      ['u-garnier', 'registered'],
      ['u-renard', 'registered'],
      ['u-moreau', 'registered'],
      ['u-nguyen', 'registered'],
      ['u-perrin', 'registered'],
      ['u-simon', 'registered'],
      ['u-brun', 'registered'],
      ['u-marchand', 'registered'],
      ['u-caron', 'registered'],
      ['u-masson', 'registered'],
      ['u-chevalier', 'registered'],
      ['u-lambert', 'registered'],
      ['u-rolland', 'registered'],
      ['u-poirier', 'registered'],
      ['u-roussel', 'registered'],
      ['u-guerin', 'registered'],
      ['u-mercier', 'registered'],
    ],
  },
  {
    id: 's-2609-sst',
    date: '2026-09-21',
    startTime: '8h30',
    endTime: '17h00',
    site: 'Cholet',
    building: 'Bât. A',
    room: 'Salle polyvalente',
    format: 'onsite',
    capacity: 10,
    trainingIds: ['t-sst'],
    tags: ['Secourisme', 'Journée complète'],
    status: 'planned',
    trainerName: 'C. Renaud',
    participants: [
      ['u-simon', 'registered'],
      ['u-guerin', 'registered'],
      ['u-brun', 'registered'],
      ['u-marchand', 'registered'],
      ['u-masson', 'registered'],
      ['u-perrin', 'registered'],
    ],
  },
  {
    id: 's-2609-chimie',
    date: '2026-09-24',
    startTime: '9h00',
    endTime: '12h00',
    site: 'Mérignac',
    building: 'Bât. Nord',
    room: 'Salle 7',
    format: 'onsite',
    capacity: 14,
    trainingIds: ['t-chimie'],
    tags: ['Produits dangereux'],
    status: 'planned',
    trainerName: 'C. Fontaine',
    participants: [
      ['u-rolland', 'registered'],
      ['u-roussel', 'registered'],
      ['u-chevalier', 'registered'],
      ['u-lambert', 'registered'],
      ['u-fontaine', 'registered'],
      ['u-poirier', 'registered'],
      ['u-leroy', 'registered'],
    ],
  },
  {
    id: 's-2610-accueil',
    date: '2026-10-02',
    startTime: '9h00',
    endTime: '10h30',
    site: 'Mérignac',
    building: 'Bât. Nord',
    room: 'Auditorium',
    format: 'hybrid',
    capacity: 30,
    trainingIds: ['t-accueil'],
    tags: ['Nouveaux arrivants'],
    status: 'planned',
    trainerName: 'C. Fontaine',
    participants: [
      ['u-poirier', 'registered'],
      ['u-leroy', 'registered'],
      ['u-rolland', 'registered'],
      ['u-chevalier', 'registered'],
      ['u-lambert', 'registered'],
      ['u-roussel', 'registered'],
      ['u-fontaine', 'registered'],
      ['u-colin', 'registered'],
      ['u-legrand', 'registered'],
      ['u-blanchard', 'registered'],
      ['u-bonnet', 'registered'],
      ['u-girard', 'registered'],
      ['u-garnier', 'registered'],
      ['u-renard', 'registered'],
      ['u-moreau', 'registered'],
      ['u-nguyen', 'registered'],
    ],
  },
  {
    id: 's-2610-incendie',
    date: '2026-10-06',
    startTime: '14h00',
    endTime: '16h00',
    site: 'Cholet',
    building: 'Extérieur',
    room: 'Aire de feu',
    format: 'onsite',
    capacity: 12,
    trainingIds: ['t-incendie', 't-evac'],
    tags: ['Exercice', 'Extérieur'],
    status: 'planned',
    trainerName: 'P. Moreau',
    participants: [
      ['u-mercier', 'registered'],
      ['u-caron', 'registered'],
      ['u-dubois', 'registered'],
      ['u-guerin', 'registered'],
      ['u-simon', 'registered'],
      ['u-brun', 'registered'],
      ['u-marchand', 'registered'],
      ['u-masson', 'registered'],
    ],
  },
  {
    id: 's-2610-voyage',
    date: '2026-10-13',
    startTime: '11h00',
    endTime: '13h00',
    site: 'Gennevilliers',
    format: 'remote',
    capacity: 25,
    trainingIds: ['t-voyage'],
    tags: ['International'],
    status: 'planned',
    trainerName: 'L. Nguyen',
    participants: [
      ['u-girard', 'registered'],
      ['u-legrand', 'registered'],
      ['u-nguyen', 'registered'],
      ['u-garnier', 'registered'],
      ['u-renard', 'registered'],
      ['u-moreau', 'registered'],
      ['u-bonnet', 'registered'],
      ['u-blanchard', 'registered'],
      ['u-colin', 'registered'],
    ],
  },
  {
    id: 's-2608-h0b0',
    date: '2026-08-12',
    startTime: '9h00',
    endTime: '12h00',
    site: 'Cholet',
    building: 'Bât. A',
    room: 'Salle 12',
    format: 'onsite',
    capacity: 16,
    trainingIds: ['t-h0b0'],
    tags: ['Rentrée 2026'],
    status: 'done',
    trainerName: 'P. Moreau',
    participants: [
      ['u-masson', 'attended'],
      ['u-dubois', 'attended'],
      ['u-berger', 'attended'],
      ['u-faure', 'absent'],
      ['u-guerin', 'excused'],
    ],
  },
  {
    id: 's-2607-cyber',
    date: '2026-07-09',
    startTime: '10h00',
    endTime: '12h30',
    site: 'Gennevilliers',
    format: 'remote',
    capacity: 40,
    trainingIds: ['t-cyber'],
    tags: ['Visio'],
    status: 'done',
    trainerName: 'L. Nguyen',
    participants: [
      ['u-bonnet', 'attended'],
      ['u-renard', 'attended'],
      ['u-moreau', 'attended'],
      ['u-berger', 'attended'],
      ['u-garnier', 'absent'],
    ],
  },
  {
    id: 's-2606-accueil',
    date: '2026-06-18',
    startTime: '9h00',
    endTime: '10h30',
    site: 'Cholet',
    building: 'Bât. C',
    room: 'Salle 3',
    format: 'onsite',
    capacity: 30,
    trainingIds: ['t-accueil'],
    tags: ['Nouveaux arrivants'],
    status: 'done',
    trainerName: 'P. Dubois',
    participants: [
      ['u-brun', 'attended'],
      ['u-simon', 'attended'],
      ['u-perrin', 'attended'],
      ['u-marchand', 'attended'],
      ['u-caron', 'attended'],
      ['u-mercier', 'attended'],
    ],
  },
  {
    id: 's-2609-dechets',
    date: '2026-09-29',
    startTime: '14h00',
    endTime: '15h00',
    site: 'Mérignac',
    format: 'remote',
    capacity: 20,
    trainingIds: ['t-dechets'],
    tags: ['QHSE'],
    status: 'cancelled',
    trainerName: 'C. Fontaine',
    participants: [['u-roussel', 'registered']],
  },
];

function toParticipant([userId, attendance]: [string, AttendanceStatus]): AdminSessionParticipant {
  const user = USERS_BY_ID.get(userId);
  return {
    userId,
    name: user?.name ?? userId,
    email: user?.email ?? '',
    site: user?.site ?? 'Cholet',
    attendance,
  };
}

export const adminSessionsFixture: AdminSession[] = RAW_SESSIONS.map((raw) => ({
  id: raw.id,
  date: raw.date,
  startTime: raw.startTime,
  endTime: raw.endTime,
  site: raw.site,
  ...(raw.building && raw.room ? { location: { building: raw.building, room: raw.room } } : {}),
  format: raw.format,
  capacity: raw.capacity,
  registered: raw.participants.length,
  trainingIds: raw.trainingIds,
  trainingNames: raw.trainingIds.map(trainingName),
  tags: raw.tags,
  status: raw.status,
  trainerName: raw.trainerName,
  participants: raw.participants.map(toParticipant),
}));

/* ------------------------------------------------------------------ */
/* Reconciliation: attending a done session refreshes the validity     */
/* of the trainings it carries, so gauges, history and counters agree. */
/* ------------------------------------------------------------------ */

function daysUntil(iso: string): number {
  return Math.round(
    (new Date(`${iso}T00:00:00`).getTime() - new Date(`${TODAY}T00:00:00`).getTime()) / 86_400_000,
  );
}

for (const session of adminSessionsFixture) {
  if (session.status !== 'done') continue;
  for (const participant of session.participants) {
    if (participant.attendance !== 'attended') continue;
    const user = USERS_BY_ID.get(participant.userId);
    if (!user) continue;
    for (const trainingId of session.trainingIds) {
      const held = user.trainings.find((t) => t.trainingId === trainingId);
      if (!held) continue;
      if (held.lastValidatedAt && held.lastValidatedAt >= session.date) continue;
      const expiresAt = addMonths(session.date, validityMonthsOf(trainingId));
      held.lastValidatedAt = session.date;
      held.expiresAt = expiresAt;
      held.validatedBy = 'session';
      held.state =
        daysUntil(expiresAt) < 0 ? 'overdue' : daysUntil(expiresAt) <= 90 ? 'expiring' : 'valid';
    }
  }
}

/* ------------------------------------------------------------------ */
/* Trainings, with counters derived from users and sessions            */
/* ------------------------------------------------------------------ */

function countUsersConcerned(trainingId: string): number {
  return adminUsersFixture.filter((u) => u.trainings.some((t) => t.trainingId === trainingId))
    .length;
}

function countUsersLate(trainingId: string): number {
  return adminUsersFixture.filter((u) =>
    u.trainings.some(
      (t) => t.trainingId === trainingId && (t.state === 'overdue' || t.state === 'never'),
    ),
  ).length;
}

function countSessionsPlanned(trainingId: string): number {
  return adminSessionsFixture.filter(
    (s) => s.status === 'planned' && s.date >= TODAY && s.trainingIds.includes(trainingId),
  ).length;
}

export const adminTrainingsFixture: AdminTraining[] = RAW_TRAININGS.map((raw) => ({
  id: raw.id,
  name: raw.name,
  category: raw.category,
  mode: raw.mode,
  validityMonths: raw.validityMonths,
  durationHours: raw.durationHours,
  elearningEnabled: raw.mode !== 'session',
  usersConcerned: countUsersConcerned(raw.id),
  usersLate: countUsersLate(raw.id),
  sessionsPlanned: countSessionsPlanned(raw.id),
  ...(raw.ownerId ? { ownerId: raw.ownerId } : {}),
}));

/* ------------------------------------------------------------------ */
/* Certificates to review                                              */
/* ------------------------------------------------------------------ */

interface RawCertificate {
  id: string;
  userId: string;
  trainingId: string;
  fileName: string;
  fileSizeKb: number;
  uploadedAt: string;
  completedAt?: string;
  status: CertificateReview['status'];
  reviewedBy?: string;
  rejectionReason?: string;
}

const RAW_CERTIFICATES: RawCertificate[] = [
  {
    id: 'c-001',
    userId: 'u-bonnet',
    trainingId: 't-rgpd',
    fileName: 'attestation-rgpd-bonnet.pdf',
    fileSizeKb: 412,
    uploadedAt: '2026-08-24',
    completedAt: '2026-08-22',
    status: 'pending',
  },
  {
    id: 'c-002',
    userId: 'u-legrand',
    trainingId: 't-voyage',
    fileName: 'certificat-surete-deplacements.pdf',
    fileSizeKb: 780,
    uploadedAt: '2026-08-23',
    completedAt: '2026-08-20',
    status: 'pending',
  },
  {
    id: 'c-003',
    userId: 'u-blanchard',
    trainingId: 't-badge',
    fileName: 'badge-elearning-blanchard.pdf',
    fileSizeKb: 205,
    uploadedAt: '2026-08-21',
    status: 'pending',
  },
  {
    id: 'c-004',
    userId: 'u-poirier',
    trainingId: 't-dechets',
    fileName: 'tri-dechets-attestation.jpg',
    fileSizeKb: 1840,
    uploadedAt: '2026-08-20',
    completedAt: '2026-08-19',
    status: 'pending',
  },
  {
    id: 'c-005',
    userId: 'u-girard',
    trainingId: 't-confid',
    fileName: 'protection-secret-2026.pdf',
    fileSizeKb: 356,
    uploadedAt: '2026-08-18',
    completedAt: '2026-08-14',
    status: 'pending',
  },
  {
    id: 'c-006',
    userId: 'u-colin',
    trainingId: 't-rgpd',
    fileName: 'rgpd-colin.pdf',
    fileSizeKb: 298,
    uploadedAt: '2026-07-28',
    completedAt: '2026-07-26',
    status: 'approved',
    reviewedBy: 'Sophie Moreau',
  },
  {
    id: 'c-007',
    userId: 'u-lambert',
    trainingId: 't-dechets',
    fileName: 'scan-dechets.png',
    fileSizeKb: 94,
    uploadedAt: '2026-07-15',
    status: 'rejected',
    reviewedBy: 'Claire Fontaine',
    rejectionReason: 'Document illisible',
  },
];

export const certificateReviewsFixture: CertificateReview[] = RAW_CERTIFICATES.map((raw) => {
  const user = USERS_BY_ID.get(raw.userId);
  return {
    id: raw.id,
    userId: raw.userId,
    userName: user?.name ?? raw.userId,
    userEmail: user?.email ?? '',
    site: user?.site ?? 'Cholet',
    trainingId: raw.trainingId,
    trainingName: trainingName(raw.trainingId),
    fileName: raw.fileName,
    fileSizeKb: raw.fileSizeKb,
    uploadedAt: raw.uploadedAt,
    ...(raw.completedAt ? { completedAt: raw.completedAt } : {}),
    status: raw.status,
    ...(raw.reviewedBy ? { reviewedBy: raw.reviewedBy } : {}),
    ...(raw.rejectionReason ? { rejectionReason: raw.rejectionReason } : {}),
  };
});

/* ------------------------------------------------------------------ */
/* Mail relance executions                                             */
/* ------------------------------------------------------------------ */

export const relanceExecutionsFixture: RelanceExecution[] = [
  {
    id: 'r-146',
    number: 146,
    date: '2026-08-26T06:00',
    type: 'auto',
    status: 'done',
    launchedBy: 'Système',
    analysed: 320,
    eligible: 180,
    seats: 45,
    sessionsWithSeats: 18,
    mailsToSend: 38,
    unassigned: 142,
    fillRatePercent: 84,
    durationSeconds: 12,
    priorityBreakdown: [
      { category: 'newNoMail', count: 12 },
      { category: 'newWithMail', count: 21 },
      { category: 'expired', count: 74 },
      { category: 'expiringSoon', count: 39 },
      { category: 'regular', count: 34 },
    ],
    exclusionBreakdown: [
      { reason: 'validTraining', count: 61 },
      { reason: 'recentMail', count: 43 },
      { reason: 'bookedSlot', count: 22 },
      { reason: 'vip', count: 8 },
      { reason: 'noEmail', count: 4 },
      { reason: 'inactive', count: 2 },
    ],
    unassignedBreakdown: [
      { reason: 'compatibleSessionsFull', count: 88 },
      { reason: 'noSessionOnSite', count: 34 },
      { reason: 'noCompatibleSession', count: 20 },
    ],
  },
  {
    id: 'r-145',
    number: 145,
    date: '2026-08-25T06:00',
    type: 'auto',
    status: 'done',
    launchedBy: 'Système',
    analysed: 320,
    eligible: 174,
    seats: 52,
    sessionsWithSeats: 19,
    mailsToSend: 44,
    unassigned: 130,
    fillRatePercent: 78,
    durationSeconds: 11,
    priorityBreakdown: [
      { category: 'newNoMail', count: 15 },
      { category: 'newWithMail', count: 18 },
      { category: 'expired', count: 71 },
      { category: 'expiringSoon', count: 40 },
      { category: 'regular', count: 30 },
    ],
    exclusionBreakdown: [
      { reason: 'validTraining', count: 63 },
      { reason: 'recentMail', count: 51 },
      { reason: 'bookedSlot', count: 18 },
      { reason: 'vip', count: 8 },
      { reason: 'noEmail', count: 4 },
      { reason: 'inactive', count: 2 },
    ],
    unassignedBreakdown: [
      { reason: 'compatibleSessionsFull', count: 79 },
      { reason: 'noSessionOnSite', count: 31 },
      { reason: 'noCompatibleSession', count: 20 },
    ],
  },
  {
    id: 'r-144',
    number: 144,
    date: '2026-08-24T15:42',
    type: 'simulation',
    status: 'done',
    launchedBy: 'Sophie Moreau',
    analysed: 320,
    eligible: 176,
    seats: 58,
    sessionsWithSeats: 20,
    mailsToSend: 49,
    unassigned: 127,
    fillRatePercent: 71,
    durationSeconds: 9,
    priorityBreakdown: [
      { category: 'newNoMail', count: 14 },
      { category: 'newWithMail', count: 19 },
      { category: 'expired', count: 72 },
      { category: 'expiringSoon', count: 41 },
      { category: 'regular', count: 30 },
    ],
    exclusionBreakdown: [
      { reason: 'validTraining', count: 62 },
      { reason: 'recentMail', count: 48 },
      { reason: 'bookedSlot', count: 20 },
      { reason: 'vip', count: 8 },
      { reason: 'noEmail', count: 4 },
      { reason: 'inactive', count: 2 },
    ],
    unassignedBreakdown: [
      { reason: 'compatibleSessionsFull', count: 74 },
      { reason: 'noSessionOnSite', count: 33 },
      { reason: 'noCompatibleSession', count: 20 },
    ],
  },
  {
    id: 'r-143',
    number: 143,
    date: '2026-08-24T06:00',
    type: 'auto',
    status: 'done',
    launchedBy: 'Système',
    analysed: 318,
    eligible: 169,
    seats: 61,
    sessionsWithSeats: 21,
    mailsToSend: 53,
    unassigned: 116,
    fillRatePercent: 69,
    durationSeconds: 13,
    priorityBreakdown: [
      { category: 'newNoMail', count: 11 },
      { category: 'newWithMail', count: 17 },
      { category: 'expired', count: 68 },
      { category: 'expiringSoon', count: 42 },
      { category: 'regular', count: 31 },
    ],
    exclusionBreakdown: [
      { reason: 'validTraining', count: 66 },
      { reason: 'recentMail', count: 46 },
      { reason: 'bookedSlot', count: 23 },
      { reason: 'vip', count: 8 },
      { reason: 'noEmail', count: 4 },
      { reason: 'inactive', count: 2 },
    ],
    unassignedBreakdown: [
      { reason: 'compatibleSessionsFull', count: 65 },
      { reason: 'noSessionOnSite', count: 30 },
      { reason: 'noCompatibleSession', count: 21 },
    ],
  },
  {
    id: 'r-142',
    number: 142,
    date: '2026-08-21T09:18',
    type: 'manual',
    status: 'failed',
    launchedBy: 'Antoine Berger',
    analysed: 312,
    eligible: 0,
    seats: 0,
    sessionsWithSeats: 0,
    mailsToSend: 0,
    unassigned: 0,
    fillRatePercent: 0,
    durationSeconds: 3,
    priorityBreakdown: [],
    exclusionBreakdown: [],
    unassignedBreakdown: [],
  },
];

export const relanceSettingsFixture: RelanceSettings = {
  seatMargin: 1.2,
  daysBetweenMails: 7,
  expiringSoonDays: 90,
  sessionsPerMail: 3,
  autoRunEnabled: true,
  autoRunTime: '06:00',
  senderEmail: 'easysensib@thales.fr',
  relanceOnValidationCancel: true,
};

/* ------------------------------------------------------------------ */
/* Reference lists                                                     */
/* ------------------------------------------------------------------ */

export const sitesFixture: Site[] = ['Cholet', 'Gennevilliers', 'Mérignac'];

export const categoriesFixture: TrainingCategory[] = ['Sécurité', 'Sûreté', 'QHSE'];

/** Common tag referential proposed by default on the session form. */
export const commonTagsFixture: string[] = [
  'Rentrée 2026',
  'Nouveaux arrivants',
  'Exercice',
  'Visio',
  'Atelier',
  'Journée complète',
  'Secourisme',
  'QHSE',
  'International',
];
