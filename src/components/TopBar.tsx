import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/services/user';
import { SpaceSwitch } from './SpaceSwitch';
import { PinIcon, ShieldLogoIcon } from './icons';
import { UserMenu } from './UserMenu';

/** Dark top bar shared by every page (rendered from the root layout, fixed on scroll). */
export async function TopBar() {
  const [t, tAdmin, user] = await Promise.all([
    getTranslations('common'),
    getTranslations('adminCommon'),
    getCurrentUser(),
  ]);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-topbar-border bg-topbar px-10">
      <Link href="/" className="flex items-center gap-3">
        <ShieldLogoIcon size={24} color="#00005c" accentColor="#0816a1" />
        <span className="font-display text-lg font-semibold text-topbar-text">{t('app.name')}</span>
      </Link>
      <div className="flex items-center gap-[22px]">
        <SpaceSwitch toAdmin={tAdmin('space.toAdmin')} toUser={tAdmin('space.toUser')} />
        <a href="#" className="text-[13px] text-topbar-secondary hover:text-topbar-text">
          {t('topbar.help')}
        </a>
        <div className="flex items-center gap-2 rounded-full border border-topbar-border px-3.5 py-1.5">
          <PinIcon size={13} color="#8a94ac" />
          <span className="text-[13px] text-topbar-muted">{user.site}</span>
        </div>
        <UserMenu
          initials={user.initials}
          fullName={`${user.firstName} ${user.lastName}`}
          email={user.email}
          site={user.site}
        />
      </div>
    </header>
  );
}
