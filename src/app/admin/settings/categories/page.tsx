import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/admin';
import { getCategoryReferences } from '@/services/admin/settings';
import { CategoriesCard } from '../CategoriesCard';

export default async function AdminSettingsCategoriesPage() {
  const [t, tCommon, categories] = await Promise.all([
    getTranslations('adminSettings'),
    getTranslations('adminCommon'),
    getCategoryReferences(),
  ]);
  void t;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: tCommon('breadcrumb.root'), href: '/admin' },
          { label: tCommon('nav.settingsMenu.title'), href: '/admin/settings' },
          { label: tCommon('nav.settingsMenu.categories') },
        ]}
        ariaLabel={tCommon('breadcrumb.ariaLabel')}
      />

      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[26px] font-semibold">
          {tCommon('nav.settingsMenu.categories')}
        </h1>
      </header>

      <CategoriesCard categories={categories} index={0} />
    </div>
  );
}
