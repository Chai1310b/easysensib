'use client';

import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from './adminIcons';
import { useExitTransition } from './useExitTransition';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional line under the title. */
  subtitle?: string;
  /** Sticky footer, typically the action buttons. */
  footer?: ReactNode;
  /** Accessible label of the close button, already translated. */
  closeLabel: string;
  children: ReactNode;
}

/** Right-hand side panel with a dimmed overlay. Escape and overlay close it. */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  footer,
  closeLabel,
  children,
}: DrawerProps) {
  const { mounted, closing } = useExitTransition(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className={`${closing ? 'ui-overlay-out' : 'ui-overlay'} absolute inset-0 cursor-default bg-[#16181c]/35`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`${closing ? 'ui-drawer-out' : 'ui-drawer'} relative flex h-full w-full max-w-[440px] flex-col bg-card shadow-[-12px_0_40px_rgba(22,24,28,0.14)]`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-divider px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[17px] font-semibold text-ink">{title}</h2>
            {subtitle ? <p className="text-[13px] text-ink-secondary">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="ui-pressable flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-card-border text-ink-secondary transition-colors duration-200 hover:bg-card-muted"
          >
            <CloseIcon size={14} />
          </button>
        </header>

        <div className="grow overflow-y-auto px-6 py-5">{children}</div>

        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-divider px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
