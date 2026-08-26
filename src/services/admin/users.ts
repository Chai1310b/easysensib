/**
 * Admin users service.
 * Backend switch point: only the function bodies change once the API exists.
 */
import type { AdminRole, AdminUser, Site } from '@/lib/admin-types';
import { adminUsersFixture, sitesFixture } from './fixtures';

export interface AdminUserFilters {
  site?: Site;
  role?: AdminRole;
  /** Case-insensitive match on name or email. */
  search?: string;
  /** Keep only users with at least one overdue or never-validated training. */
  lateOnly?: boolean;
  vipOnly?: boolean;
}

/** True when the user has at least one training to (re)validate. */
export function isLate(user: AdminUser): boolean {
  return user.trainings.some((t) => t.state === 'overdue' || t.state === 'never');
}

export async function getAdminUsers(filters: AdminUserFilters = {}): Promise<AdminUser[]> {
  const search = filters.search?.trim().toLowerCase();

  return adminUsersFixture.filter((user) => {
    if (filters.site && user.site !== filters.site) return false;
    if (filters.role && user.role !== filters.role) return false;
    if (filters.vipOnly && !user.isVip) return false;
    if (filters.lateOnly && !isLate(user)) return false;
    if (search) {
      const haystack = `${user.name} ${user.email}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

export async function getAdminUser(id: string): Promise<AdminUser | null> {
  return adminUsersFixture.find((user) => user.id === id) ?? null;
}

/** Users holding a role above the standard one ("utilisateurs à privilège"). */
export async function getPrivilegedUsers(): Promise<AdminUser[]> {
  return adminUsersFixture.filter((user) => user.role !== 'user');
}

export async function getSites(): Promise<Site[]> {
  return sitesFixture;
}

/** Number of users with at least one training to (re)validate. */
export async function countLateUsers(): Promise<number> {
  return adminUsersFixture.filter(isLate).length;
}
