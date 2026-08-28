'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useExitTransition } from '@/components/admin/useExitTransition';
import { ClockIcon, FileCheckIcon, LaptopIcon, LogoutIcon, PencilIcon } from '@/components/icons';

interface UserMenuProps {
  initials: string;
  fullName: string;
  email: string;
  site: string;
}

/** Avatar + name in the top bar, opening a small account menu. */
export function UserMenu({ initials, fullName, email, site }: UserMenuProps) {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);
  const { mounted, closing } = useExitTransition(open, 140);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const itemClass =
    'ui-pressable flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-ink! transition-colors duration-150 hover:bg-card-muted';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t('userMenu.open')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="ui-pressable flex cursor-pointer items-center gap-2.5 rounded-full py-1 pr-2 pl-1 transition-colors duration-200 hover:bg-card-muted"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-white">
          {initials}
        </span>
        <span className="text-[13px] text-topbar-muted">{fullName}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 9L12 15L18 9"
            stroke="#8a94ac"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`origin-center transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            style={{ transformBox: 'fill-box' }}
          />
        </svg>
      </button>

      {mounted ? (
        <div
          role="menu"
          className={`${closing ? 'ui-popover-out' : 'ui-popover'} absolute right-0 z-50 mt-2 w-72 rounded-xl border border-card-border bg-card p-1.5 shadow-[0_16px_44px_rgba(22,24,28,0.16)]`}
        >
          <div className="flex items-center gap-3 border-b border-divider px-3 pt-2 pb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[14px] font-semibold text-white">
              {initials}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[14px] font-semibold text-ink">{fullName}</span>
              <span className="truncate text-[12px] text-ink-tertiary">{email}</span>
              <span className="truncate text-[12px] text-ink-tertiary">{site}</span>
            </span>
          </div>

          <div className="flex flex-col py-1">
            <button
              type="button"
              role="menuitem"
              className={itemClass}
              onClick={() => setOpen(false)}
              title={t('userMenu.demo')}
            >
              <PencilIcon size={15} color="var(--color-ink-tertiary)" />
              {t('userMenu.profile')}
            </button>
            <Link
              role="menuitem"
              href="/history"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <ClockIcon size={15} color="var(--color-ink-tertiary)" />
              {t('userMenu.history')}
            </Link>
            <Link
              role="menuitem"
              href="/certificates"
              className={itemClass}
              onClick={() => setOpen(false)}
            >
              <FileCheckIcon size={15} color="var(--color-ink-tertiary)" />
              {t('userMenu.certificates')}
            </Link>
          </div>

          <div className="flex items-center justify-between border-t border-divider px-3 py-2.5">
            <span className="flex items-center gap-2 text-[12px] text-ink-tertiary">
              <LaptopIcon size={14} color="var(--color-ink-tertiary)" />
              {t('userMenu.language')}
            </span>
            <span className="flex overflow-hidden rounded-full border border-card-border text-[11px] font-semibold">
              <span className="bg-accent px-2.5 py-1 text-white">FR</span>
              <span className="px-2.5 py-1 text-ink-disabled" title={t('userMenu.demo')}>
                EN
              </span>
            </span>
          </div>

          <div className="border-t border-divider py-1">
            <button
              type="button"
              role="menuitem"
              className={`${itemClass} text-danger-text!`}
              onClick={() => setOpen(false)}
              title={t('userMenu.demo')}
            >
              <LogoutIcon size={15} color="var(--color-danger-text)" />
              {t('userMenu.signOut')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
