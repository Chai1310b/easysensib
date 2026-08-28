'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  BadgeCheckIcon,
  CalendarGridIcon,
  GridIcon,
  KeyIcon,
  ListIcon,
  MailStackIcon,
  SlidersIcon,
  UsersIcon,
} from '@/components/admin/adminIcons';
import { PinIcon } from '@/components/icons';

interface NavEntry {
  href: string;
  labelKey: string;
  icon: ReactNode;
  /** True when only the exact path marks the entry as active. */
  exact?: boolean;
}

interface NavSection {
  titleKey?: string;
  entries: NavEntry[];
}

const SECTIONS: NavSection[] = [
  {
    entries: [
      { href: '/admin', labelKey: 'nav.dashboard', icon: <GridIcon size={17} />, exact: true },
    ],
  },
  {
    titleKey: 'nav.sections.trainings',
    entries: [
      { href: '/admin/trainings', labelKey: 'nav.trainingsList', icon: <ListIcon size={17} /> },
      { href: '/admin/sessions', labelKey: 'nav.sessions', icon: <CalendarGridIcon size={17} /> },
      {
        href: '/admin/certificates',
        labelKey: 'nav.certificates',
        icon: <BadgeCheckIcon size={17} />,
      },
    ],
  },
  {
    titleKey: 'nav.sections.users',
    entries: [
      {
        href: '/admin/users',
        labelKey: 'nav.allUsers',
        icon: <UsersIcon size={17} />,
        exact: true,
      },
      {
        href: '/admin/users/privileged',
        labelKey: 'nav.privilegedUsers',
        icon: <KeyIcon size={17} />,
      },
    ],
  },
  {
    titleKey: 'nav.sections.administration',
    entries: [
      { href: '/admin/mails', labelKey: 'nav.mails', icon: <MailStackIcon size={17} /> },
      { href: '/admin/settings', labelKey: 'nav.settings', icon: <SlidersIcon size={17} /> },
    ],
  },
];

/** Sub-menu shown while browsing /admin/settings (Jira-style drill-in). */
const SETTINGS_ENTRIES: NavEntry[] = [
  {
    href: '/admin/settings',
    labelKey: 'nav.settingsMenu.relance',
    icon: <MailStackIcon size={17} />,
    exact: true,
  },
  {
    href: '/admin/settings/categories',
    labelKey: 'nav.settingsMenu.categories',
    icon: <GridIcon size={17} />,
  },
  {
    href: '/admin/settings/tags',
    labelKey: 'nav.settingsMenu.tags',
    icon: <ListIcon size={17} />,
  },
  {
    href: '/admin/settings/rooms',
    labelKey: 'nav.settingsMenu.rooms',
    icon: <PinIcon size={17} color="currentColor" />,
  },
];

function isActive(pathname: string, entry: NavEntry): boolean {
  if (entry.exact) return pathname === entry.href;
  return pathname === entry.href || pathname.startsWith(`${entry.href}/`);
}

/**
 * Fixed left navigation of the manager space.
 * Dark surface matching the top bar, so the two form one continuous frame
 * around the light content area.
 */
export function AdminSidebar() {
  const t = useTranslations('adminCommon');
  const pathname = usePathname();
  const inSettings = pathname.startsWith('/admin/settings');
  // Render-phase adjustment: remember we just left the settings sub-menu so
  // the main menu can slide back in from the left.
  const [prevInSettings, setPrevInSettings] = useState(inSettings);
  const [wasInSettings, setWasInSettings] = useState(false);
  if (inSettings !== prevInSettings) {
    setPrevInSettings(inSettings);
    setWasInSettings(!inSettings);
  }

  return (
    <nav
      aria-label={t('nav.ariaLabel')}
      className="sticky top-16 hidden max-h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] w-60 shrink-0 flex-col gap-6 self-start overflow-y-auto bg-topbar px-4 py-6 lg:flex"
    >
      <span className="mx-1 w-fit rounded-full border border-topbar-border px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] text-topbar-secondary uppercase">
        {t('space.badge')}
      </span>

      {inSettings ? (
        <div key="settings" className="ui-menu-forward flex flex-col gap-4">
          <Link
            href="/admin"
            className="ui-pressable flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] text-topbar-secondary! transition-colors duration-200 hover:bg-white/5 hover:text-topbar-text!"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M14 6L8 12L14 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t('nav.settingsMenu.back')}
          </Link>
          <div className="flex flex-col gap-1">
            <h2 className="mb-1 px-3 text-[11px] font-semibold tracking-[0.07em] text-[#8a92c4] uppercase">
              {t('nav.settingsMenu.title')}
            </h2>
            {SETTINGS_ENTRIES.map((entry) => (
              <SidebarEntry
                key={entry.href}
                entry={entry}
                pathname={pathname}
                label={t(entry.labelKey)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div key="main" className={`flex flex-col gap-6 ${wasInSettings ? 'ui-menu-back' : ''}`}>
          {SECTIONS.map((section, index) => (
            <div key={section.titleKey ?? `section-${index}`} className="flex flex-col gap-1">
              {section.titleKey ? (
                <h2 className="mb-1 px-3 text-[11px] font-semibold tracking-[0.07em] text-[#8a92c4] uppercase">
                  {t(section.titleKey)}
                </h2>
              ) : null}

              {section.entries.map((entry) => (
                <SidebarEntry
                  key={entry.href}
                  entry={entry}
                  pathname={pathname}
                  label={t(entry.labelKey)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}

function SidebarEntry({
  entry,
  pathname,
  label,
}: {
  entry: NavEntry;
  pathname: string;
  label: string;
}) {
  const active = isActive(pathname, entry);
  return (
    <Link
      href={entry.href}
      aria-current={active ? 'page' : undefined}
      className={`ui-pressable flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors duration-200 ${
        active
          ? 'bg-[#14147c] font-medium text-topbar-text!'
          : 'text-topbar-secondary! hover:bg-white/5 hover:text-topbar-text!'
      }`}
    >
      <span className={active ? 'text-[#87edff]' : 'text-[#97a1cf]'}>{entry.icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

/**
 * Narrow-viewport fallback for the sidebar: one horizontal scrolling strip
 * carrying the same entries, section titles dropped.
 */
export function AdminMobileNav() {
  const t = useTranslations('adminCommon');
  const pathname = usePathname();
  const inSettings = pathname.startsWith('/admin/settings');
  const entries = inSettings ? SETTINGS_ENTRIES : SECTIONS.flatMap((section) => section.entries);

  return (
    <nav
      aria-label={t('nav.ariaLabel')}
      className="flex gap-1.5 overflow-x-auto bg-topbar px-4 py-3 lg:hidden"
    >
      {entries.map((entry) => {
        const active = isActive(pathname, entry);
        return (
          <Link
            key={entry.href}
            href={entry.href}
            aria-current={active ? 'page' : undefined}
            className={`ui-pressable flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors duration-200 ${
              active
                ? 'bg-[#14147c] font-medium text-topbar-text!'
                : 'text-topbar-secondary! hover:text-topbar-text!'
            }`}
          >
            <span className={active ? 'text-[#87edff]' : 'text-[#97a1cf]'}>{entry.icon}</span>
            {t(entry.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
