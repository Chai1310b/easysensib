import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/admin';
import { getAdminSession, getAdminSessions, getCommonTags } from '@/services/admin/sessions';
import { getAdminUsers, getSites } from '@/services/admin/users';
import { SessionDetail } from './SessionDetail';

export async function generateStaticParams() {
  const sessions = await getAdminSessions();
  return sessions.map((session) => ({ id: session.id }));
}

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

/** Detail of one session: independent, editable, with attendance and actions. */
export default async function AdminSessionPage({ params }: SessionPageProps) {
  const { id } = await params;
  const session = await getAdminSession(id);

  if (!session) {
    notFound();
  }

  const [t, tCommon, sites, users, commonTags] = await Promise.all([
    getTranslations('adminSessions'),
    getTranslations('adminCommon'),
    getSites(),
    getAdminUsers(),
    getCommonTags(),
  ]);

  const candidates = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    site: user.site,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        ariaLabel={tCommon('breadcrumb.ariaLabel')}
        items={[
          { label: tCommon('breadcrumb.root'), href: '/admin' },
          { label: t('list.title'), href: '/admin/sessions' },
          { label: session.trainingNames.join(' · ') },
        ]}
      />

      <SessionDetail
        session={session}
        sites={sites}
        candidates={candidates}
        commonTags={commonTags}
      />
    </div>
  );
}
