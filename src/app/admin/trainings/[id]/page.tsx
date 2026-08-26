import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Breadcrumb, ButtonLink, EmptyState, StatTile } from '@/components/admin';
import {
  AlertCircleIcon,
  CalendarGridIcon,
  KeyIcon,
  UsersIcon,
} from '@/components/admin/adminIcons';
import { ChevronLeftIcon, ClockIcon } from '@/components/icons';
import { getAdminSessions } from '@/services/admin/sessions';
import { getAdminTraining, getTrainingCategories } from '@/services/admin/trainings';
import { getAdminUsers, getPrivilegedUsers } from '@/services/admin/users';
import { CategoryChip, ModeTags } from '../TrainingBadges';
import { subtractMonths } from '../trainingDates';
import { TrainingDetailTabs } from './TrainingDetailTabs';
import { TrainingSessionsPanel } from './TrainingSessionsPanel';
import { TrainingSettingsPanel } from './TrainingSettingsPanel';
import { TrainingUsersPanel, type TrainingUserRow } from './TrainingUsersPanel';

/** States that count as covered for the coverage rate. */
const COVERED = ['valid', 'expiring'];

export default async function AdminTrainingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [t, tCommon, training, categories, managers, allUsers, sessions] = await Promise.all([
    getTranslations('adminTrainings'),
    getTranslations('adminCommon'),
    getAdminTraining(id),
    getTrainingCategories(),
    getPrivilegedUsers(),
    getAdminUsers(),
    getAdminSessions({ trainingId: id }),
  ]);

  if (!training) {
    return (
      <EmptyState
        title={t('detail.notFound')}
        description={t('detail.notFoundHint')}
        action={
          <ButtonLink href="/admin/trainings" variant="outline">
            <ChevronLeftIcon size={13} />
            {t('detail.backToList')}
          </ButtonLink>
        }
      />
    );
  }

  const owners = managers.map((manager) => ({ id: manager.id, name: manager.name }));
  const ownerName = managers.find((manager) => manager.id === training.ownerId)?.name;

  // Flatten "one user, this training" into serializable rows for the client panel.
  const userRows: TrainingUserRow[] = allUsers.flatMap((user) => {
    const entry = user.trainings.find((item) => item.trainingId === training.id);
    if (!entry) return [];
    const lastValidatedAt =
      entry.lastValidatedAt ?? subtractMonths(entry.expiresAt, training.validityMonths);
    return [
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        site: user.site,
        isVip: user.isVip,
        state: entry.state,
        ...(lastValidatedAt ? { lastValidatedAt } : {}),
        ...(entry.expiresAt ? { expiresAt: entry.expiresAt } : {}),
        ...(entry.validatedBy ? { validatedBy: entry.validatedBy } : {}),
      },
    ];
  });

  const coveredCount = userRows.filter((row) => COVERED.includes(row.state)).length;
  const coverage = userRows.length === 0 ? 0 : Math.round((coveredCount / userRows.length) * 100);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        <Breadcrumb
          ariaLabel={tCommon('breadcrumb.ariaLabel')}
          items={[
            { label: tCommon('breadcrumb.root'), href: '/admin' },
            { label: t('list.title'), href: '/admin/trainings' },
            { label: training.name },
          ]}
        />

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2.5">
            <h1 className="font-display text-[26px] leading-tight font-semibold">
              {training.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <CategoryChip category={training.category} />
              <ModeTags mode={training.mode} />
            </div>
            <dl className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink-secondary">
              <MetaItem
                icon={<ClockIcon size={13} color="currentColor" />}
                label={t('detail.duration')}
                value={t('units.hours', { value: training.durationHours })}
              />
              <MetaItem
                icon={<CalendarGridIcon size={13} />}
                label={t('detail.validity')}
                value={t('units.months', { count: training.validityMonths })}
              />
              <MetaItem
                icon={<KeyIcon size={13} />}
                label={t('detail.owner')}
                value={ownerName ?? t('detail.ownerNone')}
              />
            </dl>
          </div>

          <ButtonLink href="/admin/trainings" variant="secondary">
            <ChevronLeftIcon size={13} />
            {t('detail.backToList')}
          </ButtonLink>
        </header>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          value={training.usersConcerned}
          label={t('detail.stats.concerned')}
          hint={t('detail.stats.concernedHint')}
          tone="accent"
          icon={<UsersIcon size={16} />}
          className="ui-stagger"
        />
        <StatTile
          value={training.usersLate}
          label={t('detail.stats.late')}
          hint={t('detail.stats.lateHint')}
          tone="danger"
          icon={<AlertCircleIcon size={16} />}
          className="ui-stagger [--ui-index:1]"
        />
        <StatTile
          value={training.sessionsPlanned}
          label={t('detail.stats.sessions')}
          hint={t('detail.stats.sessionsHint')}
          icon={<CalendarGridIcon size={16} />}
          className="ui-stagger [--ui-index:2]"
        />
        <StatTile
          value={`${coverage} %`}
          label={t('detail.stats.coverage')}
          hint={t('detail.stats.coverageHint')}
          tone="success"
          icon={<UsersIcon size={16} />}
          className="ui-stagger [--ui-index:3]"
        />
      </section>

      <TrainingDetailTabs
        usersCount={userRows.length}
        sessionsCount={sessions.length}
        settings={
          <TrainingSettingsPanel training={training} categories={categories} owners={owners} />
        }
        users={<TrainingUsersPanel trainingName={training.name} users={userRows} />}
        sessions={<TrainingSessionsPanel sessions={sessions} />}
      />
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-ink-tertiary">{icon}</span>
      <dt className="text-ink-tertiary">{label} :</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
