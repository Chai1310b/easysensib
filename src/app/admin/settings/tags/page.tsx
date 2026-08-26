import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/admin';
import { getSessionTagReferences } from '@/services/admin/settings';
import { SessionTagsCard } from '../SessionTagsCard';

export default async function AdminSettingsTagsPage() {
  const [t, tCommon, tags] = await Promise.all([
    getTranslations('adminSettings'),
    getTranslations('adminCommon'),
    getSessionTagReferences(),
  ]);
  void t;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: tCommon('breadcrumb.root'), href: '/admin' },
          { label: tCommon('nav.settingsMenu.title'), href: '/admin/settings' },
          { label: tCommon('nav.settingsMenu.tags') },
        ]}
        ariaLabel={tCommon('breadcrumb.ariaLabel')}
      />

      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[26px] font-semibold">
          {tCommon('nav.settingsMenu.tags')}
        </h1>
      </header>

      <SessionTagsCard tags={tags} index={0} />
    </div>
  );
}
