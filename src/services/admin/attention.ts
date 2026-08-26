/**
 * "Points d'attention" service: the three situations a manager should look at
 * first, derived from the same fixtures as the rest of the manager space.
 * Backend switch point: only the function bodies change once the API exists.
 */
import type { Site } from '@/lib/admin-types';
import {
  TODAY,
  adminSessionsFixture,
  adminUsersFixture,
  certificateReviewsFixture,
} from './fixtures';

/** Thresholds of the three rules, exposed so the UI can label them. */
export const ATTENTION_THRESHOLDS = {
  /** A pending certificate older than this many days is late to review. */
  certificateWaitingDays: 7,
  /** A session happening within this many days is imminent. */
  sessionHorizonDays: 7,
  /** Under this fill rate an imminent session counts as almost empty. */
  sessionFillPercent: 50,
  /** A training overdue for longer than this many days is a hard case. */
  userOverdueDays: 60,
} as const;

export interface AttentionCertificate {
  id: string;
  userName: string;
  trainingName: string;
  waitingDays: number;
}

export interface AttentionSession {
  id: string;
  date: string;
  site: Site;
  trainingNames: string[];
  registered: number;
  capacity: number;
  fillPercent: number;
  daysUntil: number;
}

export interface AttentionUser {
  id: string;
  name: string;
  site: Site;
  /** Training overdue for the longest time. */
  trainingName: string;
  overdueDays: number;
}

export interface AttentionGroup<T> {
  /** Number of matching rows, before the display limit. */
  total: number;
  items: T[];
}

export interface AttentionPoints {
  certificates: AttentionGroup<AttentionCertificate>;
  sessions: AttentionGroup<AttentionSession>;
  users: AttentionGroup<AttentionUser>;
}

const MS_PER_DAY = 86_400_000;

/** Whole days between two ISO dates (YYYY-MM-DD), `to` minus `from`. */
function daysBetween(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00`).getTime();
  const end = new Date(`${to}T00:00:00`).getTime();
  return Math.round((end - start) / MS_PER_DAY);
}

/**
 * Builds the three attention lists.
 * @param limit maximum rows kept per group (the totals stay exhaustive).
 */
export async function getAttentionPoints(limit = 3): Promise<AttentionPoints> {
  const certificates = certificateReviewsFixture
    .filter((review) => review.status === 'pending')
    .map((review) => ({
      id: review.id,
      userName: review.userName,
      trainingName: review.trainingName,
      waitingDays: daysBetween(review.uploadedAt, TODAY),
    }))
    .filter((row) => row.waitingDays > ATTENTION_THRESHOLDS.certificateWaitingDays)
    .sort((a, b) => b.waitingDays - a.waitingDays);

  const sessions = adminSessionsFixture
    .filter((session) => session.status === 'planned' && session.date >= TODAY)
    .map((session) => ({
      id: session.id,
      date: session.date,
      site: session.site,
      trainingNames: session.trainingNames,
      registered: session.registered,
      capacity: session.capacity,
      fillPercent:
        session.capacity === 0 ? 0 : Math.round((session.registered / session.capacity) * 100),
      daysUntil: daysBetween(TODAY, session.date),
    }))
    .filter(
      (row) =>
        row.daysUntil <= ATTENTION_THRESHOLDS.sessionHorizonDays &&
        row.fillPercent < ATTENTION_THRESHOLDS.sessionFillPercent,
    )
    .sort((a, b) => a.daysUntil - b.daysUntil || a.fillPercent - b.fillPercent);

  const users = adminUsersFixture
    .map((user) => {
      const worst = user.trainings
        .filter((training) => training.state === 'overdue' && training.expiresAt)
        .map((training) => ({
          trainingName: training.trainingName,
          overdueDays: daysBetween(training.expiresAt as string, TODAY),
        }))
        .sort((a, b) => b.overdueDays - a.overdueDays)[0];

      if (!worst) return null;
      return {
        id: user.id,
        name: user.name,
        site: user.site,
        trainingName: worst.trainingName,
        overdueDays: worst.overdueDays,
      };
    })
    .filter((row): row is AttentionUser => row !== null)
    .filter((row) => row.overdueDays > ATTENTION_THRESHOLDS.userOverdueDays)
    .sort((a, b) => b.overdueDays - a.overdueDays);

  return {
    certificates: { total: certificates.length, items: certificates.slice(0, limit) },
    sessions: { total: sessions.length, items: sessions.slice(0, limit) },
    users: { total: users.length, items: users.slice(0, limit) },
  };
}
