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
