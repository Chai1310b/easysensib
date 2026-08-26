import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/admin';
import { getCommonTags } from '@/services/admin/sessions';
import { getAdminTrainings, getTrainingCategories } from '@/services/admin/trainings';
import { getSites } from '@/services/admin/users';
import { SessionCreateForm } from './SessionCreateForm';
import { todayIso } from '../sessionUtils';

/** Creation screen of a session, including the multiple creation shortcut. */
export default async function AdminSessionCreatePage() {
  const [t, tCommon, trainings, categories, sites, commonTags] = await Promise.all([
    getTranslations('adminSessions'),
    getTranslations('adminCommon'),
    getAdminTrainings(),
    getTrainingCategories(),
    getSites(),
    getCommonTags(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        ariaLabel={tCommon('breadcrumb.ariaLabel')}
        items={[
          { label: tCommon('breadcrumb.root'), href: '/admin' },
          { label: t('list.title'), href: '/admin/sessions' },
          { label: t('create.title') },
        ]}
      />

      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[26px] font-semibold">{t('create.title')}</h1>
        <p className="max-w-[680px] text-sm text-ink-secondary">{t('create.subtitle')}</p>
      </header>

      <SessionCreateForm
        trainings={trainings}
        categories={categories}
        sites={sites}
        commonTags={commonTags}
        defaultDate={todayIso()}
      />
    </div>
  );
}
