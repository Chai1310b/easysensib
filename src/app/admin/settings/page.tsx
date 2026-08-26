import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/admin';
import { getRelanceSettings } from '@/services/admin/mails';
import { getUpcomingSessions } from '@/services/admin/sessions';
import {
  getCategoryReferences,
  getSessionTagReferences,
  getSiteRooms,
} from '@/services/admin/settings';
import { CategoriesCard } from './CategoriesCard';
import { RelanceSettingsCard } from './RelanceSettingsCard';
import { SessionTagsCard } from './SessionTagsCard';
import { SitesRoomsCard } from './SitesRoomsCard';

/**
 * Administration settings: relance engine parameters and the three
 * referentials of the manager space (business lines, session tags, rooms).
 * Every value comes from a service; the writes are simulated with a toast.
 */
export default async function AdminSettingsPage() {
  const [t, tCommon, settings, upcoming, categories, tags, siteRooms] = await Promise.all([
    getTranslations('adminSettings'),
    getTranslations('adminCommon'),
    getRelanceSettings(),
    getUpcomingSessions(),
    getCategoryReferences(),
    getSessionTagReferences(),
    getSiteRooms(),
  ]);

  const freeSeats = upcoming.reduce(
    (sum, session) => sum + Math.max(session.capacity - session.registered, 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[{ label: tCommon('breadcrumb.root'), href: '/admin' }, { label: t('title') }]}
        ariaLabel={tCommon('breadcrumb.ariaLabel')}
      />

      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[26px] font-semibold">{t('title')}</h1>
        <p className="max-w-[720px] text-sm text-ink-secondary">{t('subtitle')}</p>
      </header>

      <div className="flex flex-col gap-5">
        <RelanceSettingsCard settings={settings} freeSeats={freeSeats} index={0} />
        <CategoriesCard categories={categories} index={1} />
        <SessionTagsCard tags={tags} index={2} />
        <SitesRoomsCard siteRooms={siteRooms} index={3} />
      </div>
    </div>
  );
}
