import { getTranslations } from 'next-intl/server';
import { Breadcrumb, StatTile } from '@/components/admin';
import {
  BadgeCheckIcon,
  CalendarGridIcon,
  ListIcon,
  UsersIcon,
} from '@/components/admin/adminIcons';
import { getAdminTrainings, getTrainingCategories } from '@/services/admin/trainings';
import { getPrivilegedUsers } from '@/services/admin/users';
import { CreateTrainingButton } from './CreateTrainingButton';
import { TrainingsClient } from './TrainingsClient';

export default async function AdminTrainingsPage() {
  const [t, tCommon, trainings, categories, managers] = await Promise.all([
    getTranslations('adminTrainings'),
    getTranslations('adminCommon'),
    getAdminTrainings(),
    getTrainingCategories(),
    getPrivilegedUsers(),
  ]);

  const owners = managers.map((manager) => ({ id: manager.id, name: manager.name }));
  const totalConcerned = trainings.reduce((sum, item) => sum + item.usersConcerned, 0);
  const totalLate = trainings.reduce((sum, item) => sum + item.usersLate, 0);
  const totalSessions = trainings.reduce((sum, item) => sum + item.sessionsPlanned, 0);

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
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
        </div>
        <CreateTrainingButton categories={categories} owners={owners} />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          value={trainings.length}
          label={t('stats.total')}
          hint={t('stats.totalHint')}
          icon={<ListIcon size={16} />}
          className="ui-stagger"
        />
        <StatTile
          value={totalConcerned}
          label={t('stats.concerned')}
          hint={t('stats.concernedHint')}
          tone="accent"
          icon={<UsersIcon size={16} />}
          className="ui-stagger [--ui-index:1]"
        />
        <StatTile
          value={totalLate}
          label={t('stats.late')}
          hint={t('stats.lateHint')}
          tone="danger"
          icon={<BadgeCheckIcon size={16} />}
          className="ui-stagger [--ui-index:2]"
        />
        <StatTile
          value={totalSessions}
          label={t('stats.sessions')}
          hint={t('stats.sessionsHint')}
          tone="success"
          icon={<CalendarGridIcon size={16} />}
          className="ui-stagger [--ui-index:3]"
        />
      </section>

      <TrainingsClient trainings={trainings} categories={categories} />
    </div>
  );
}
