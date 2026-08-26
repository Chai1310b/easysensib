import Link from 'next/link';
import type { ReactNode } from 'react';

export type StatTone = 'neutral' | 'danger' | 'warning' | 'success' | 'accent';

interface StatTileProps {
  /** Big number, already formatted (e.g. "84 %"). */
  value: ReactNode;
  label: string;
  /** Small line under the label, e.g. "sur 8 sessions". */
  hint?: string;
  tone?: StatTone;
  /** Optional leading glyph. */
  icon?: ReactNode;
  /** Turns the whole tile into a link. */
  href?: string;
  className?: string;
}

const VALUE_TONE: Record<StatTone, string> = {
  neutral: 'text-ink',
  danger: 'text-danger-text',
  warning: 'text-warning-text',
  success: 'text-success',
  accent: 'text-accent',
};

const ICON_TONE: Record<StatTone, string> = {
  neutral: 'bg-card-muted text-ink-tertiary',
  danger: 'bg-danger-tint text-danger-text',
  warning: 'bg-warning-tint text-warning-text',
  success: 'bg-success-tint text-success',
  accent: 'bg-accent-tint text-accent',
};

/** Single KPI tile: Space Grotesk number, small caption below. */
export function StatTile({
  value,
  label,
  hint,
  tone = 'neutral',
  icon,
  href,
  className = '',
}: StatTileProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={`font-display text-[30px] leading-none font-semibold ${VALUE_TONE[tone]}`}>
          {value}
        </span>
        {icon ? (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ICON_TONE[tone]}`}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
        {hint ? <span className="text-xs text-ink-tertiary">{hint}</span> : null}
      </div>
    </>
  );

  const base =
    'ui-card block rounded-xl border border-card-border bg-card p-4 transition-[background-color,box-shadow,border-color] duration-200';

  if (href) {
    return (
      <Link href={href} className={`${base} ui-pressable hover:border-accent-border ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={`${base} ${className}`}>{content}</div>;
}
