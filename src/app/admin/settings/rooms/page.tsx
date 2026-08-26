import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/admin';
import { getSiteRooms } from '@/services/admin/settings';
import { SitesRoomsCard } from '../SitesRoomsCard';

export default async function AdminSettingsRoomsPage() {
  const [t, tCommon, siteRooms] = await Promise.all([
    getTranslations('adminSettings'),
    getTranslations('adminCommon'),
    getSiteRooms(),
  ]);
  void t;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: tCommon('breadcrumb.root'), href: '/admin' },
          { label: tCommon('nav.settingsMenu.title'), href: '/admin/settings' },
          { label: tCommon('nav.settingsMenu.rooms') },
        ]}
        ariaLabel={tCommon('breadcrumb.ariaLabel')}
      />

      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[26px] font-semibold">
          {tCommon('nav.settingsMenu.rooms')}
        </h1>
      </header>

      <SitesRoomsCard siteRooms={siteRooms} index={0} />
    </div>
  );
}
