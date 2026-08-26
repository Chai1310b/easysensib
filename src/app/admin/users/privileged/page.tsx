import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { StatTile } from '@/components/admin/StatTile';
import { GridIcon, KeyIcon, ListIcon } from '@/components/admin/adminIcons';
import { getAdminTrainings } from '@/services/admin/trainings';
import { getPrivilegedUsers } from '@/services/admin/users';
import { PrivilegedTable, type PrivilegedRow } from './PrivilegedTable';
import { countTrainings, initialsOf } from '../userDisplay';

/**
 * Privileged users: the screen that separates the two things that are easy to
 * confuse, an assigned training (an obligation) and a rights perimeter.
 */
export default async function PrivilegedUsersPage() {
  const [t, tCommon, users, trainings] = await Promise.all([
    getTranslations('adminUsers'),
    getTranslations('adminCommon'),
    getPrivilegedUsers(),
    getAdminTrainings(),
  ]);

  const trainingById = new Map(trainings.map((training) => [training.id, training]));

  const rows: PrivilegedRow[] = users.map((user) => {
    const counts = countTrainings(user.trainings);
    return {
      id: user.id,
      name: user.name,
      initials: initialsOf(user),
      email: user.email,
      site: user.site,
      role: user.role,
      allSites: user.role === 'admin',
      allTrainings: user.role === 'admin',
      managedSites: user.managedSites ?? [],
      managedTrainings: (user.managedTrainingIds ?? []).map(
        (id) => trainingById.get(id)?.name ?? id,
      ),
      ownTotal: counts.total,
      ownLate: counts.late,
      ownTrainings: user.trainings.map((entry) => ({
        name: entry.trainingName,
        state: entry.state,
      })),
    };
  });

  const perimeterCount = rows.filter((row) => row.role === 'perimeter_manager').length;
  const trainingManagerCount = rows.filter((row) => row.role === 'training_manager').length;
  const adminCount = rows.filter((row) => row.role === 'admin').length;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        ariaLabel={tCommon('breadcrumb.ariaLabel')}
        items={[
          { label: tCommon('breadcrumb.root'), href: '/admin' },
          { label: t('detail.backToList'), href: '/admin/users' },
          { label: t('privileged.title') },
        ]}
      />

      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[26px] font-semibold">{t('privileged.title')}</h1>
        <p className="text-sm text-ink-secondary">{t('privileged.subtitle')}</p>
      </header>

      <section className="ui-stagger flex flex-col gap-4 rounded-xl border border-card-border bg-card-muted p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-tint text-accent">
            <KeyIcon size={16} />
          </span>
          <h2 className="font-display pt-1.5 text-[16px] font-semibold">
            {t('privileged.explainerTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-divider pt-4 lg:grid-cols-2">
          <ExplainerCard
            icon={<ListIcon size={15} />}
            title={t('detail.trainingsTitle')}
            text={t('privileged.explainerAssignment')}
            tone="neutral"
          />
          <ExplainerCard
            icon={<GridIcon size={15} />}
            title={t('privileged.drawerPerimeter')}
            text={t('privileged.explainerPerimeter')}
            tone="accent"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          value={perimeterCount}
          label={t('privileged.stats.perimeter')}
          hint={t('privileged.stats.perimeterHint')}
          tone="accent"
          className="ui-stagger [--ui-index:1]"
        />
        <StatTile
          value={trainingManagerCount}
          label={t('privileged.stats.training')}
          hint={t('privileged.stats.trainingHint')}
          tone="accent"
          className="ui-stagger [--ui-index:2]"
        />
        <StatTile
          value={adminCount}
          label={t('privileged.stats.admin')}
          hint={t('privileged.stats.adminHint')}
          className="ui-stagger [--ui-index:3]"
        />
      </section>

      <PrivilegedTable rows={rows} />
    </div>
  );
}

function ExplainerCard({
  icon,
  title,
  text,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  tone: 'neutral' | 'accent';
}) {
  const frame =
    tone === 'accent' ? 'border-accent-border bg-accent-surface' : 'border-card-border bg-card';
  const glyph = tone === 'accent' ? 'text-accent' : 'text-ink-tertiary';

  return (
    <div className={`flex flex-col gap-2 rounded-xl border p-4 ${frame}`}>
      <span className="flex items-center gap-2">
        <span className={glyph}>{icon}</span>
        <span className="font-display text-[13.5px] font-semibold text-ink">{title}</span>
      </span>
      <p className="text-[12.5px] leading-relaxed text-ink-secondary">{text}</p>
    </div>
  );
}
