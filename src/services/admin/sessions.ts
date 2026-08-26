/**
 * Admin sessions service.
 * Backend switch point: only the function bodies change once the API exists.
 */
import type { AdminSession, SessionStatus, Site } from '@/lib/admin-types';
import { TODAY, adminSessionsFixture, commonTagsFixture } from './fixtures';

export interface AdminSessionFilters {
  site?: Site;
  status?: SessionStatus;
  trainingId?: string;
  /** Case-insensitive match on training names, trainer or tags. */
  search?: string;
}

function byDateAsc(a: AdminSession, b: AdminSession): number {
  return a.date.localeCompare(b.date);
}

export async function getAdminSessions(filters: AdminSessionFilters = {}): Promise<AdminSession[]> {
  const search = filters.search?.trim().toLowerCase();

  return adminSessionsFixture
    .filter((session) => {
      if (filters.site && session.site !== filters.site) return false;
      if (filters.status && session.status !== filters.status) return false;
      if (filters.trainingId && !session.trainingIds.includes(filters.trainingId)) return false;
      if (search) {
        const haystack = [...session.trainingNames, session.trainerName, ...session.tags]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    })
    .sort(byDateAsc);
}

export async function getAdminSession(id: string): Promise<AdminSession | null> {
  return adminSessionsFixture.find((session) => session.id === id) ?? null;
}

/** Planned sessions from today on, soonest first. */
export async function getUpcomingSessions(limit?: number): Promise<AdminSession[]> {
  const upcoming = adminSessionsFixture
    .filter((session) => session.status === 'planned' && session.date >= TODAY)
    .sort(byDateAsc);
  return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming;
}

/** Seat fill rate of the upcoming sessions, rounded percentage. */
export async function getUpcomingFillRate(): Promise<number> {
  const upcoming = await getUpcomingSessions();
  const capacity = upcoming.reduce((sum, s) => sum + s.capacity, 0);
  if (capacity === 0) return 0;
  const registered = upcoming.reduce((sum, s) => sum + s.registered, 0);
  return Math.round((registered / capacity) * 100);
}

/** Common tag referential proposed on the session form. */
export async function getCommonTags(): Promise<string[]> {
  return commonTagsFixture;
}
