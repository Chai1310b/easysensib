/**
 * Domain model of the EasySensib end-user app.
 * Single source of truth for types: do not redefine these elsewhere.
 * All dates are ISO strings (YYYY-MM-DD).
 */

/** How a training can be validated. */
export type ValidationMode = 'session' | 'elearning' | 'both';

/** Current state of a training for the logged-in user. */
export type TrainingState = 'overdue' | 'todo' | 'registered' | 'valid';

/** Visual tone used by gauges and status elements. */
export type StatusTone = 'danger' | 'warning' | 'success';

/** Pre-computed key for the validity gauge label, translated via common.validity.*. */
export type ValidityLabelKey =
  'overdueDays' | 'remainingDays' | 'expiresInMonths' | 'validMonthsLeft';

export interface TrainingValidity {
  /** Date the training was last validated, if ever. */
  obtainedAt?: string;
  /** End of the current validity period (valid/registered trainings). */
  expiresAt?: string;
  /** Deadline to (re)validate (overdue/todo trainings). */
  dueAt?: string;
  /** Gauge fill, 0 to 100. */
  progressPercent: number;
  /** Gauge color. */
  tone: StatusTone;
  /** i18n key of the gauge label (common.validity namespace). */
  labelKey: ValidityLabelKey;
  /** Count interpolated into the label (days or months). */
  labelCount: number;
}

/** How the last validation was obtained. */
export interface TrainingLastValidation {
  kind: 'session' | 'certificate';
  date: string;
  /** Certificate backing the validation, when kind is 'certificate'. */
  certificateId?: string;
}

export interface Training {
  id: string;
  name: string;
  /** Business line ("filiere"): Securite, Surete, QHSE... */
  category: string;
  mode: ValidationMode;
  state: TrainingState;
  validity: TrainingValidity;
  /** Duration of a session, in hours. */
  durationHours?: number;
  /** Validity period once obtained, in years. */
  validityYears?: number;
  /** Present when the user is registered to a session. */
  registration?: { sessionId: string };
  /** Present when the training has been validated at least once. */
  lastValidation?: TrainingLastValidation;
}

export interface SessionLocation {
  building: string;
  room: string;
}

export interface SessionSlot {
  id: string;
  trainingId: string;
  trainingName: string;
  /** ISO date of the session day. */
  date: string;
  /** e.g. "9h00" */
  startTime: string;
  /** e.g. "12h00" */
  endTime: string;
  format: 'onsite' | 'remote';
  /** Only for onsite sessions. */
  location?: SessionLocation;
  /** Site where the session happens (e.g. "Cholet"). */
  site: string;
  /** Remaining seats; null means the session is full. */
  seatsLeft: number | null;
  /** True when the current user is registered on this slot. */
  isRegistered: boolean;
}

export interface ParticipationRecord {
  id: string;
  date: string;
  trainingName: string;
  kind: 'session' | 'elearning';
  /** Session format, when kind is 'session'. */
  format?: 'onsite' | 'remote';
  /** Free-form location, e.g. "Cholet · Bât. A, salle 12". */
  location?: string;
  /** Trainer name, e.g. "P. Moreau". */
  trainer?: string;
  status: 'attended' | 'absent' | 'certificate';
}

export type CertificateStatus = 'approved' | 'pending' | 'rejected';

export interface Certificate {
  id: string;
  fileName: string;
  trainingId: string;
  trainingName: string;
  uploadedAt: string;
  status: CertificateStatus;
  /** Set when status is 'rejected', e.g. "document illisible". */
  rejectionReason?: string;
  /** Set when status is 'approved'. */
  validUntil?: string;
}

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  /** Avatar initials, e.g. "ML". */
  initials: string;
  /** Home site, e.g. "Cholet". */
  site: string;
}
