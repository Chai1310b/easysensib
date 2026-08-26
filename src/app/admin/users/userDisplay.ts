/**
 * Pure display helpers shared by the three user screens of the manager space.
 * Everything here is computed on the server and handed over as plain data, so
 * the client components never have to know about dates or fixtures.
 */

import type { AdminTrainingState, AdminUser, AdminUserTraining } from '@/lib/admin-types';
import type { StatusTone } from '@/lib/types';

/** Reference "today" as an ISO date, used for every validity computation. */
export function todayIso(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function toTime(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

const DAY_MS = 86_400_000;

/** Whole days between two ISO dates (positive when `to` is after `from`). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toTime(to) - toTime(from)) / DAY_MS);
}

/** ISO date shifted by a number of months, clamped to the end of the month. */
export function shiftMonths(iso: string, months: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  const targetDay = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(targetDay, lastDay));
  return date.toISOString().slice(0, 10);
}

/** Two-letter monogram used by the avatar disc. */
export function initialsOf(user: Pick<AdminUser, 'firstName' | 'lastName'>): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

/** A training state counts as "late" when it must be (re)validated now. */
export function isLateState(state: AdminTrainingState): boolean {
  return state === 'overdue' || state === 'never';
}

export interface TrainingCounts {
  total: number;
  valid: number;
  late: number;
  registered: number;
}

export function countTrainings(trainings: AdminUserTraining[]): TrainingCounts {
  return {
    total: trainings.length,
    valid: trainings.filter((t) => t.state === 'valid' || t.state === 'expiring').length,
    late: trainings.filter((t) => isLateState(t.state)).length,
    registered: trainings.filter((t) => t.state === 'registered').length,
  };
}

/** Visual tone attached to a training state, shared by pills and gauges. */
export const STATE_TONE: Record<AdminTrainingState, StatusTone | 'accent'> = {
  valid: 'success',
  expiring: 'warning',
  overdue: 'danger',
  never: 'danger',
  registered: 'accent',
};

/** i18n key of the gauge label plus the count to interpolate. */
export interface ValidityLabel {
  key: 'overdueDays' | 'remainingDays' | 'validMonths' | 'registered' | 'never';
  count: number;
}

export interface ValidityDisplay {
  /** Gauge fill, 0 to 100. Null when no gauge makes sense. */
  percent: number | null;
  tone: StatusTone;
  label: ValidityLabel;
  /** Date the current validity period ends, when known. */
  expiresAt?: string;
  /** Date the training was last validated, derived from the validity period. */
  lastValidatedAt?: string;
}

/**
 * Turns one assigned training into everything the UI needs to draw it.
 * `validityMonths` comes from the training referential, never from the user.
 */
export function validityOf(
  training: AdminUserTraining,
  validityMonths: number,
  today: string,
): ValidityDisplay {
  if (training.state === 'registered') {
    return { percent: null, tone: 'warning', label: { key: 'registered', count: 0 } };
  }
  if (training.state === 'never' || !training.expiresAt) {
    return { percent: null, tone: 'danger', label: { key: 'never', count: 0 } };
  }

  const expiresAt = training.expiresAt;
  const lastValidatedAt = shiftMonths(expiresAt, -validityMonths);
  const remaining = daysBetween(today, expiresAt);

  if (remaining < 0) {
    return {
      percent: 100,
      tone: 'danger',
      label: { key: 'overdueDays', count: Math.abs(remaining) },
      expiresAt,
      lastValidatedAt,
    };
  }

  const total = Math.max(1, daysBetween(lastValidatedAt, expiresAt));
  const percent = Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));

  if (training.state === 'expiring') {
    return {
      percent,
      tone: 'warning',
      label: { key: 'remainingDays', count: remaining },
      expiresAt,
      lastValidatedAt,
    };
  }

  return {
    percent,
    tone: 'success',
    label: { key: 'validMonths', count: Math.max(1, Math.round(remaining / 30)) },
    expiresAt,
    lastValidatedAt,
  };
}
