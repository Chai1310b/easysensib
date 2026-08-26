import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { StatTile } from '@/components/admin/StatTile';
import {
  BadgeCheckIcon,
  CalendarGridIcon,
  KeyIcon,
  UsersIcon,
} from '@/components/admin/adminIcons';
import { formatLongDate } from '@/lib/format';
import { getAdminUsers, getSites } from '@/services/admin/users';
import { UsersTable, type UserRow } from './UsersTable';
import { countTrainings, initialsOf } from './userDisplay';

/** List of every user tracked by the manager space. */
export default async function AdminUsersPage() {
  const [t, tCommon, users, sites] = await Promise.all([
    getTranslations('adminUsers'),
    getTranslations('adminCommon'),
    getAdminUsers(),
    getSites(),
  ]);

  const rows: UserRow[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    initials: initialsOf(user),
    email: user.email,
    site: user.site,
    role: user.role,
    isVip: user.isVip,
    isActive: user.isActive,
    lastActivity: user.lastActivity,
    lastActivityLabel: formatLongDate(user.lastActivity),
    counts: countTrainings(user.trainings),
  }));

  const lateCount = rows.filter((row) => row.counts.late > 0).length;
  const registeredCount = rows.filter((row) => row.counts.registered > 0).length;
  const privilegedCount = rows.filter((row) => row.role !== 'user').length;

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-1.5">
        <Breadcrumb
          items={[
            { label: tCommon('breadcrumb.root'), href: '/admin' },
            { label: t('list.title') },
          ]}
          ariaLabel={tCommon('breadcrumb.ariaLabel')}
          className="mb-0.5"
        />
        <h1 className="font-display text-[26px] font-semibold">{t('list.title')}</h1>
        <p className="text-sm text-ink-secondary">{t('list.subtitle')}</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          value={rows.length}
          label={t('list.stats.total')}
          hint={t('list.stats.totalHint')}
          icon={<UsersIcon size={16} />}
          className="ui-stagger"
        />
        <StatTile
          value={lateCount}
          label={t('list.stats.late')}
          hint={t('list.stats.lateHint')}
          tone="danger"
          icon={<BadgeCheckIcon size={16} />}
          className="ui-stagger [--ui-index:1]"
        />
        <StatTile
          value={registeredCount}
          label={t('list.stats.registered')}
          hint={t('list.stats.registeredHint')}
          tone="accent"
          icon={<CalendarGridIcon size={16} />}
          className="ui-stagger [--ui-index:2]"
        />
        <StatTile
          value={privilegedCount}
          label={t('list.stats.privileged')}
          hint={t('list.stats.privilegedHint')}
          tone="warning"
          icon={<KeyIcon size={16} />}
          href="/admin/users/privileged"
          className="ui-stagger [--ui-index:3]"
        />
      </section>

      <UsersTable rows={rows} sites={sites} />
    </div>
  );
}
