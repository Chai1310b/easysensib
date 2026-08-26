import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/admin/Toast';
import { AdminMobileNav, AdminSidebar } from './AdminSidebar';

/**
 * Manager space layout ("espace responsable").
 * The dark sidebar continues the top bar, so both frame the light content.
 * The end-user layout above (top bar, main) stays untouched.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('adminCommon');

  return (
    <ToastProvider closeLabel={t('toast.dismiss')}>
      <AdminMobileNav />
      <div className="flex grow items-stretch">
        <AdminSidebar />
        <div className="min-w-0 grow">
          <div className="mx-auto w-full max-w-[1180px] px-6 pt-8 pb-14">{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
