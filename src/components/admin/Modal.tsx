'use client';

import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from './adminIcons';
import { useExitTransition } from './useExitTransition';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  /** Accessible label of the close button, already translated. */
  closeLabel: string;
  /** Max width of the dialog box; defaults to 460px. */
  width?: number;
  children: ReactNode;
}

/** Centered dialog with a dimmed overlay. Escape and overlay close it. */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  footer,
  closeLabel,
  width = 460,
  children,
}: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className={`${closing ? 'ui-overlay-out' : 'ui-overlay'} absolute inset-0 cursor-default bg-[#16181c]/35`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
        className={`${closing ? 'ui-modal-out' : 'ui-modal'} relative flex w-full flex-col rounded-xl border border-card-border bg-card shadow-[0_18px_48px_rgba(22,24,28,0.18)]`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-divider px-5 py-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[16px] font-semibold text-ink">{title}</h2>
            {subtitle ? <p className="text-[13px] text-ink-secondary">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="ui-pressable flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-tertiary transition-colors duration-200 hover:bg-card-muted"
          >
            <CloseIcon size={13} />
          </button>
        </header>

        <div className="px-5 py-4 text-[13px] text-ink-secondary">{children}</div>

        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-divider px-5 py-3.5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
