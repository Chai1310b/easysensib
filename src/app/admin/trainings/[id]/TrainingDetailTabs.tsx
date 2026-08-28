'use client';

import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { Tabs } from '@/components/admin';

interface TrainingDetailTabsProps {
  usersCount: number;
  sessionsCount: number;
  certificatesCount?: number;
  settings: ReactNode;
  users: ReactNode;
  sessions: ReactNode;
  /** Only for e-learning trainings. */
  certificates?: ReactNode;
}

/**
 * Tab shell of the training detail. Panels are rendered by the server page and
 * handed over as nodes, so only the active-tab state lives on the client.
 */
export function TrainingDetailTabs({
  usersCount,
  sessionsCount,
  certificatesCount,
  settings,
  users,
  sessions,
  certificates,
}: TrainingDetailTabsProps) {
  const t = useTranslations('adminTrainings');
  const [tab, setTab] = useState('users');

  return (
    <div className="flex flex-col gap-5">
      <Tabs
        ariaLabel={t('detail.tabsAria')}
        value={tab}
        onChange={setTab}
        items={[
          { value: 'users', label: t('detail.tabs.users'), count: usersCount },
          { value: 'sessions', label: t('detail.tabs.sessions'), count: sessionsCount },
          ...(certificates
            ? [
                {
                  value: 'certificates',
                  label: t('detail.tabs.certificates'),
                  count: certificatesCount,
                },
              ]
            : []),
          { value: 'settings', label: t('detail.tabs.settings') },
        ]}
      />

      <div key={tab} className="ui-page-enter">
        {tab === 'users' ? users : null}
        {tab === 'sessions' ? sessions : null}
        {tab === 'certificates' ? certificates : null}
        {tab === 'settings' ? settings : null}
      </div>
    </div>
  );
}
