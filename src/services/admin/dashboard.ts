/**
 * Admin dashboard service: aggregates the other admin services.
 * Backend switch point: only the function bodies change once the API exists.
 */
import type { AdminDashboardStats } from '@/lib/admin-types';
import { countPendingCertificates } from './certificates';
import { getUpcomingFillRate, getUpcomingSessions } from './sessions';
import { countLateUsers } from './users';

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [usersLate, upcoming, fillRatePercent, certificatesToReview] = await Promise.all([
    countLateUsers(),
    getUpcomingSessions(),
    getUpcomingFillRate(),
    countPendingCertificates(),
  ]);

  return {
    usersLate,
    upcomingSessions: upcoming.length,
    fillRatePercent,
    certificatesToReview,
  };
}

/* ------------------------------------------------------------------ */
/* Indicators (charts), in the spirit of the previous EasySensib       */
/* dashboards: user status pie, participation rate, monthly activity.  */
/* ------------------------------------------------------------------ */

import { getAdminUsers } from './users';
import { getAdminSessions } from './sessions';
import { getAdminTrainings } from './trainings';

export interface DashboardIndicators {
  /** Obligations by state, across every user/training pair. */
  obligationStates: {
    valid: number;
    expiring: number;
    overdue: number;
    registered: number;
    never: number;
  };
  /** Trainings per category ("filiere"). */
  trainingsPerCategory: { category: string; count: number }[];
  /** Past sessions of the last months: attended vs registered. */
  monthlyParticipation: { monthIso: string; attended: number; registered: number }[];
  /** attended / (attended + absent) on done sessions, percent. */
  participationRatePercent: number;
  /** users registered to an upcoming slot / users with something to do, percent. */
  responseRatePercent: number;
}

export async function getDashboardIndicators(): Promise<DashboardIndicators> {
  const [users, sessions, trainings] = await Promise.all([
    getAdminUsers(),
    getAdminSessions(),
    getAdminTrainings(),
  ]);

  const obligationStates = { valid: 0, expiring: 0, overdue: 0, registered: 0, never: 0 };
  for (const user of users) {
    for (const t of user.trainings) obligationStates[t.state] += 1;
  }

  const perCategory = new Map<string, number>();
  for (const training of trainings) {
    perCategory.set(training.category, (perCategory.get(training.category) ?? 0) + 1);
  }
  const trainingsPerCategory = [...perCategory.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const doneSessions = sessions.filter((s) => s.status === 'done');
  const byMonth = new Map<string, { attended: number; registered: number }>();
  let attended = 0;
  let absent = 0;
  for (const session of doneSessions) {
    const month = session.date.slice(0, 7);
    const entry = byMonth.get(month) ?? { attended: 0, registered: 0 };
    for (const participant of session.participants) {
      entry.registered += 1;
      if (participant.attendance === 'attended') {
        entry.attended += 1;
        attended += 1;
      }
      if (participant.attendance === 'absent') absent += 1;
    }
    byMonth.set(month, entry);
  }
  const monthlyParticipation = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([monthIso, value]) => ({ monthIso, ...value }));

  const participationRatePercent =
    attended + absent > 0 ? Math.round((attended / (attended + absent)) * 100) : 0;

  let toDo = 0;
  let responded = 0;
  for (const user of users) {
    const pending = user.trainings.filter((t) => t.state !== 'valid');
    if (pending.length === 0) continue;
    toDo += 1;
    if (pending.some((t) => t.state === 'registered')) responded += 1;
  }
  const responseRatePercent = toDo > 0 ? Math.round((responded / toDo) * 100) : 0;

  return {
    obligationStates,
    trainingsPerCategory,
    monthlyParticipation,
    participationRatePercent,
    responseRatePercent,
  };
}
