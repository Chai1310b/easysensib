import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/services/user';
import { SpaceSwitch } from './SpaceSwitch';
import { ShieldLogoIcon } from './icons';

/** Dark top bar shared by every page (rendered from the root layout). */
export async function TopBar() {
  const [t, tAdmin, user] = await Promise.all([
    getTranslations('common'),
    getTranslations('adminCommon'),
    getCurrentUser(),
  ]);

  return (
    <header className="flex h-16 items-center justify-between bg-topbar px-10">
      <Link href="/" className="flex items-center gap-3">
        <ShieldLogoIcon size={24} />
        <span className="font-display text-lg font-semibold text-topbar-text">{t('app.name')}</span>
      </Link>
      <div className="flex items-center gap-[22px]">
        <SpaceSwitch toAdmin={tAdmin('space.toAdmin')} toUser={tAdmin('space.toUser')} />
        <a href="#" className="text-[13px] text-topbar-secondary hover:text-topbar-text">
          {t('topbar.help')}
        </a>
        <div className="flex items-center gap-2 rounded-full border border-topbar-border px-3.5 py-1.5">
          <span className="text-[13px] text-topbar-muted">{user.site}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-white">
            {user.initials}
          </div>
          <span className="text-[13px] text-topbar-muted">
            {user.firstName} {user.lastName}
          </span>
        </div>
      </div>
    </header>
  );
}
