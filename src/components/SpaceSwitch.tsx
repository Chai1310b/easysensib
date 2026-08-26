'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SwitchSpaceIcon } from './admin/adminIcons';

interface SpaceSwitchProps {
  /** Already translated labels. */
  toAdmin: string;
  toUser: string;
}

/**
 * Discreet top bar link that toggles between the end-user space (/) and the
 * manager space (/admin). Visible on every page.
 */
export function SpaceSwitch({ toAdmin, toUser }: SpaceSwitchProps) {
  const pathname = usePathname();
  const inAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  return (
    <Link
      href={inAdmin ? '/' : '/admin'}
      className="ui-pressable flex items-center gap-1.5 rounded-full border border-topbar-border px-3 py-1.5 text-[13px] text-topbar-secondary! hover:bg-white/5 hover:text-topbar-text!"
    >
      <SwitchSpaceIcon size={13} color="currentColor" />
      {inAdmin ? toUser : toAdmin}
    </Link>
  );
}
