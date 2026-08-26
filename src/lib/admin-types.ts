/**
 * Domain model of the EasySensib manager/admin space ("espace responsable").
 * Kept apart from `types.ts` so the end-user model stays untouched.
 * All dates are ISO strings (YYYY-MM-DD, or YYYY-MM-DDTHH:mm for executions).
 */

import type { ValidationMode } from './types';

/** Business line ("filiere") carried by a training. Closed list. */
export type TrainingCategory = 'Sécurité' | 'Sûreté' | 'QHSE';

/** Sites where users are attached and sessions happen. */
export type Site = 'Cholet' | 'Gennevilliers' | 'Mérignac';

/** Roles of the target permission matrix. */
export type AdminRole = 'user' | 'perimeter_manager' | 'training_manager' | 'admin';

/** Delivery format of a session slot. */
export type SessionFormat = 'onsite' | 'remote' | 'hybrid';

/* ------------------------------------------------------------------ */
/* Trainings (ex "objectifs", renamed "sensibilisations" in the target) */
/* ------------------------------------------------------------------ */

export interface AdminTraining {
  id: string;
  name: string;
  /** Business line, used as a filter when picking a training. */
  category: TrainingCategory;
  mode: ValidationMode;
  /** Validity period once obtained, in months. */
  validityMonths: number;
  /** Duration of one session, in hours. */
  durationHours: number;
  /** True when a user may validate by uploading an e-learning certificate. */
  elearningEnabled: boolean;
  /** Users holding this training as an obligation. */
  usersConcerned: number;
  /** Subset of `usersConcerned` whose validity has expired. */
  usersLate: number;
  /** Future sessions carrying this training. */
  sessionsPlanned: number;
  /** Manager responsible for this training, when one is set. */
  ownerId?: string;
}

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

/** State of one training for one user, as seen from the admin side. */
export type AdminTrainingState = 'valid' | 'expiring' | 'overdue' | 'registered' | 'never';

export interface AdminUserTraining {
  trainingId: string;
  trainingName: string;
  state: AdminTrainingState;
  /** End of the current validity period, when the training is validated. */
  expiresAt?: string;
  /** Last time the user validated it. */
  lastValidatedAt?: string;
  /** How the last validation was obtained. */
  validatedBy?: 'session' | 'certificate';
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  /** Display name, "Prénom Nom". */
  name: string;
  /** Empty string when no address is known (excluded from mail runs). */
  email: string;
  site: Site;
  role: AdminRole;
  /** VIP users are deliberately excluded from automatic mail runs. */
  isVip: boolean;
  /** Inactive accounts never receive a relance. */
  isActive: boolean;
  /** Last time the user signed in, ISO date. */
  lastActivity: string;
  trainings: AdminUserTraining[];
  /** Managers only: sites they may act on. */
  managedSites?: Site[];
  /** Managers only: trainings they may act on. */
  managedTrainingIds?: string[];
}

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

export type SessionStatus = 'planned' | 'done' | 'cancelled';

/** Attendance of one participant on one session. */
export type AttendanceStatus = 'registered' | 'attended' | 'absent' | 'excused';

export interface AdminSessionParticipant {
  userId: string;
  name: string;
  email: string;
  site: Site;
  attendance: AttendanceStatus;
}

export interface AdminSessionLocation {
  building: string;
  room: string;
}

export interface AdminSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  site: Site;
  /** Only meaningful for onsite and hybrid sessions. */
  location?: AdminSessionLocation;
  format: SessionFormat;
  capacity: number;
  registered: number;
  /** Trainings validated by attending this session. */
  trainingIds: string[];
  trainingNames: string[];
  /** Free-form tags carried by the session (common referential plus own tags). */
  tags: string[];
  status: SessionStatus;
  trainerName: string;
  participants: AdminSessionParticipant[];
}

/* ------------------------------------------------------------------ */
/* Certificates to review                                              */
/* ------------------------------------------------------------------ */

export type CertificateReviewStatus = 'pending' | 'approved' | 'rejected';

export interface CertificateReview {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  site: Site;
  trainingId: string;
  trainingName: string;
  fileName: string;
  /** Size in kilobytes, for display. */
  fileSizeKb: number;
  uploadedAt: string;
  /** Passing date read on the document, when provided. */
  completedAt?: string;
  status: CertificateReviewStatus;
  reviewedBy?: string;
  rejectionReason?: string;
}

/* ------------------------------------------------------------------ */
/* Mail relance engine                                                 */
/* ------------------------------------------------------------------ */

export type RelanceType = 'auto' | 'simulation' | 'manual';
export type RelanceStatus = 'pending' | 'running' | 'done' | 'failed';

/** Priority buckets of the scoring model (see the relance guide, section 5). */
export type PriorityCategory = 'newNoMail' | 'newWithMail' | 'expired' | 'expiringSoon' | 'regular';

/** Reasons a user is dropped before prioritisation (guide, section 4.1). */
export type ExclusionReason =
  'vip' | 'validTraining' | 'recentMail' | 'bookedSlot' | 'noEmail' | 'inactive';

/** Reasons an eligible user ends up assigned to no session. */
export type UnassignedReason = 'noCompatibleSession' | 'noSessionOnSite' | 'compatibleSessionsFull';

export interface PriorityBreakdown {
  category: PriorityCategory;
  count: number;
}

export interface ExclusionBreakdown {
  reason: ExclusionReason;
  count: number;
}

export interface RelanceExecution {
  id: string;
  /** Human-facing run number, e.g. 142. */
  number: number;
  /** ISO date-time of the run. */
  date: string;
  type: RelanceType;
  status: RelanceStatus;
  /** Admin display name, or "Système" for the daily automatic run. */
  launchedBy: string;
  /** Users analysed before exclusions. */
  analysed: number;
  /** Users kept after exclusions. */
  eligible: number;
  /** Free seats summed over all future sessions. */
  seats: number;
  /** Number of future sessions holding at least one free seat. */
  sessionsWithSeats: number;
  /** Mails produced by the run (one per assigned user). */
  mailsToSend: number;
  /** Eligible users that no session could take. */
  unassigned: number;
  /** Average invitation fill rate over the sessions, 0 to 100. */
  fillRatePercent: number;
  /** Run duration in seconds. */
  durationSeconds: number;
  priorityBreakdown: PriorityBreakdown[];
  exclusionBreakdown: ExclusionBreakdown[];
  unassignedBreakdown: { reason: UnassignedReason; count: number }[];
}

export interface RelanceSettings {
  /** Invitations sent per free seat (1.2 means a 20 % margin). */
  seatMargin: number;
  /** Minimum number of days between two relances for the same user. */
  daysBetweenMails: number;
  /** Window under which a valid training counts as "expiring soon", in days. */
  expiringSoonDays: number;
  /** Maximum number of sessions proposed inside one mail. */
  sessionsPerMail: number;
  /** Whether the daily automatic run is enabled. */
  autoRunEnabled: boolean;
  /** Time of day of the automatic run, "HH:mm". */
  autoRunTime: string;
  /** Sender address of the relance mails. */
  senderEmail: string;
  /** True when a cancelled validation forces an immediate relance. */
  relanceOnValidationCancel: boolean;
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export interface AdminDashboardStats {
  usersLate: number;
  upcomingSessions: number;
  /** Average seat fill rate of upcoming sessions, 0 to 100. */
  fillRatePercent: number;
  certificatesToReview: number;
}
