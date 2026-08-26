import { getTranslations } from 'next-intl/server';
import { Breadcrumb, ButtonLink, StatTile } from '@/components/admin';
import {
  getAdminSessions,
  getUpcomingFillRate,
  getUpcomingSessions,
} from '@/services/admin/sessions';
import { getSites } from '@/services/admin/users';
import { SessionsView } from './SessionsView';
import { ClockIcon, GroupIcon, PlusIcon } from './sessionIcons';
import { todayIso } from './sessionUtils';

/** Session list of the manager space: KPIs, filters and the full table. */
export default async function AdminSessionsPage() {
  const [t, tCommon, sessions, upcoming, fillRate, sites] = await Promise.all([
    getTranslations('adminSessions'),
    getTranslations('adminCommon'),
    getAdminSessions(),
    getUpcomingSessions(),
    getUpcomingFillRate(),
    getSites(),
  ]);

  const upcomingSeats = upcoming.reduce(
    (sum, s) => sum + Math.max(0, s.capacity - s.registered),
    0,
  );
  const upcomingRegistered = upcoming.reduce((sum, s) => sum + s.registered, 0);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        ariaLabel={tCommon('breadcrumb.ariaLabel')}
        items={[{ label: tCommon('breadcrumb.root'), href: '/admin' }, { label: t('list.title') }]}
      />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-[26px] font-semibold">{t('list.title')}</h1>
          <p className="max-w-[620px] text-sm text-ink-secondary">{t('list.subtitle')}</p>
        </div>
        <ButtonLink href="/admin/sessions/new">
          <PlusIcon size={15} />
          {t('create.title')}
        </ButtonLink>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          value={upcoming.length}
          label={t('stats.upcoming')}
          hint={t('stats.upcomingHint')}
          tone="accent"
          icon={<ClockIcon size={16} />}
          className="ui-stagger"
        />
        <StatTile
          value={upcomingRegistered}
          label={t('stats.registered')}
          hint={t('stats.registeredHint')}
          tone="neutral"
          icon={<GroupIcon size={16} />}
          className="ui-stagger [--ui-index:1]"
        />
        <StatTile
          value={upcomingSeats}
          label={t('stats.seats')}
          hint={t('stats.seatsHint')}
          tone="warning"
          icon={<GroupIcon size={16} />}
          className="ui-stagger [--ui-index:2]"
        />
        <StatTile
          value={`${fillRate} %`}
          label={t('stats.fillRate')}
          hint={t('stats.fillRateHint')}
          tone="success"
          icon={<ClockIcon size={16} />}
          className="ui-stagger [--ui-index:3]"
        />
      </section>

      <SessionsView sessions={sessions} sites={sites} today={todayIso()} />
    </div>
  );
}
