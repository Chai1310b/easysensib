import type { ReactNode } from 'react';
import { InboxIcon } from './adminIcons';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional call to action rendered under the description. */
  action?: ReactNode;
  /** Replaces the default inbox glyph. */
  icon?: ReactNode;
  className?: string;
}

/** Neutral placeholder shown when a list or a panel has nothing to display. */
export function EmptyState({ title, description, action, icon, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-xl border border-dashed border-card-border bg-card-muted px-6 py-12 text-center ${className}`}
    >
      <span className="text-ink-disabled">{icon ?? <InboxIcon size={26} />}</span>
      <p className="font-display text-[15px] font-semibold text-ink">{title}</p>
      {description ? (
        <p className="max-w-[380px] text-[13px] text-ink-tertiary">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
