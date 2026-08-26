'use client';

import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { Tabs } from '@/components/admin';

interface TrainingDetailTabsProps {
  usersCount: number;
  sessionsCount: number;
  settings: ReactNode;
  users: ReactNode;
  sessions: ReactNode;
}

/**
 * Tab shell of the training detail. Panels are rendered by the server page and
 * handed over as nodes, so only the active-tab state lives on the client.
 */
export function TrainingDetailTabs({
  usersCount,
  sessionsCount,
  settings,
  users,
  sessions,
}: TrainingDetailTabsProps) {
  const t = useTranslations('adminTrainings');
  const [tab, setTab] = useState('settings');

  return (
    <div className="flex flex-col gap-5">
      <Tabs
        ariaLabel={t('detail.tabsAria')}
        value={tab}
        onChange={setTab}
        items={[
          { value: 'settings', label: t('detail.tabs.settings') },
          { value: 'users', label: t('detail.tabs.users'), count: usersCount },
          { value: 'sessions', label: t('detail.tabs.sessions'), count: sessionsCount },
        ]}
      />

      <div key={tab} className="ui-page-enter">
        {tab === 'settings' ? settings : null}
        {tab === 'users' ? users : null}
        {tab === 'sessions' ? sessions : null}
      </div>
    </div>
  );
}
