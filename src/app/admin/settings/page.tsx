import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/admin';
import { getRelanceSettings } from '@/services/admin/mails';
import { getUpcomingSessions } from '@/services/admin/sessions';
import { RelanceSettingsCard } from './RelanceSettingsCard';

/** Settings home: the relance engine parameters. */
export default async function AdminSettingsRelancePage() {
  const [t, tCommon, settings, upcoming] = await Promise.all([
    getTranslations('adminSettings'),
    getTranslations('adminCommon'),
    getRelanceSettings(),
    getUpcomingSessions(),
  ]);

  const freeSeats = upcoming.reduce(
    (sum, session) => sum + Math.max(session.capacity - session.registered, 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: tCommon('breadcrumb.root'), href: '/admin' },
          { label: t('title'), href: '/admin/settings' },
          { label: tCommon('nav.settingsMenu.relance') },
        ]}
        ariaLabel={tCommon('breadcrumb.ariaLabel')}
      />

      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[26px] font-semibold">
          {tCommon('nav.settingsMenu.relance')}
        </h1>
        <p className="max-w-[720px] text-sm text-ink-secondary">{t('subtitle')}</p>
      </header>

      <RelanceSettingsCard settings={settings} freeSeats={freeSeats} index={0} />
    </div>
  );
}
