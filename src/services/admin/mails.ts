/**
 * Mail relance console service (executions and engine settings).
 * Backend switch point: only the function bodies change once the API exists.
 */
import type { RelanceExecution, RelanceSettings, RelanceType } from '@/lib/admin-types';
import { relanceExecutionsFixture, relanceSettingsFixture } from './fixtures';

export interface RelanceExecutionFilters {
  type?: RelanceType;
}

/** Executions, most recent first. */
export async function getRelanceExecutions(
  filters: RelanceExecutionFilters = {},
): Promise<RelanceExecution[]> {
  return relanceExecutionsFixture
    .filter((run) => (filters.type ? run.type === filters.type : true))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getRelanceExecution(id: string): Promise<RelanceExecution | null> {
  return relanceExecutionsFixture.find((run) => run.id === id) ?? null;
}

/** The most recent executions, for the dashboard list. */
export async function getRecentRelanceExecutions(limit = 4): Promise<RelanceExecution[]> {
  const runs = await getRelanceExecutions();
  return runs.slice(0, limit);
}

export async function getRelanceSettings(): Promise<RelanceSettings> {
  return relanceSettingsFixture;
}

/* ------------------------------------------------------------------ */
/* Derived detail of a run: per-slot assignments and a mail preview.   */
/* Deterministic, computed from the shared dataset (no randomness).    */
/* ------------------------------------------------------------------ */

import type { PriorityCategory } from '@/lib/admin-types';
import { TODAY } from './fixtures';
import { getAdminSessions } from './sessions';
import { getAdminUsers } from './users';

export interface RelanceSlotAssignment {
  sessionId: string;
  date: string;
  startTime: string;
  site: string;
  trainingNames: string[];
  freeSeats: number;
  invitations: number;
  registered: number;
  capacity: number;
}

/** Upcoming slots of the run with the invitation count (free seats x margin). */
export async function getRelanceSlotAssignments(): Promise<RelanceSlotAssignment[]> {
  const [sessions, settings] = await Promise.all([getAdminSessions(), getRelanceSettings()]);
  return sessions
    .filter((session) => session.status === 'planned' && session.date >= TODAY)
    .filter((session) => session.capacity > session.registered)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((session) => {
      const freeSeats = session.capacity - session.registered;
      return {
        sessionId: session.id,
        date: session.date,
        startTime: session.startTime,
        site: session.site,
        trainingNames: session.trainingNames,
        freeSeats,
        invitations: Math.ceil(freeSeats * settings.seatMargin),
        registered: session.registered,
        capacity: session.capacity,
      };
    });
}

export interface RelanceMailPreview {
  userId: string;
  userName: string;
  site: string;
  trainingName: string;
  category: PriorityCategory;
  /** Priority score, per the guide's scoring model (section 5). */
  score: number;
  status: 'scheduled' | 'sent';
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round(
    (new Date(`${toIso}T00:00:00`).getTime() - new Date(`${fromIso}T00:00:00`).getTime()) /
      86_400_000,
  );
}

/**
 * Sample of the mails a run produces: users with a pending obligation,
 * scored with the guide's model (new 1000, overdue 400-799, expiring 200-399).
 */
export async function getRelanceMailPreview(sentRun: boolean): Promise<RelanceMailPreview[]> {
  const users = await getAdminUsers();
  const mails: RelanceMailPreview[] = [];

  for (const user of users) {
    if (!user.isActive || user.isVip || !user.email) continue;
    for (const training of user.trainings) {
      if (training.state === 'registered' || training.state === 'valid') continue;
      let category: PriorityCategory;
      let score: number;
      if (training.state === 'never') {
        category = 'newNoMail';
        score = 1000;
      } else if (training.state === 'overdue' && training.expiresAt) {
        const overdueDays = Math.min(365, Math.max(1, daysBetween(training.expiresAt, TODAY)));
        category = 'expired';
        score = Math.round(400 + (overdueDays / 365) * 399);
      } else if (training.expiresAt) {
        const daysLeft = Math.min(90, Math.max(0, daysBetween(TODAY, training.expiresAt)));
        category = 'expiringSoon';
        score = Math.round(200 + ((90 - daysLeft) / 90) * 180);
      } else {
        category = 'regular';
        score = 100;
      }
      mails.push({
        userId: user.id,
        userName: user.name,
        site: user.site,
        trainingName: training.trainingName,
        category,
        score,
        status: sentRun ? 'sent' : 'scheduled',
      });
    }
  }

  return mails.sort((a, b) => b.score - a.score);
}
