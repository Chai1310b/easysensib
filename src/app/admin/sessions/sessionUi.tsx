/**
 * Small presentational bricks shared by the three session screens.
 * They take already translated labels, so they work in server and client trees.
 */
import type { SessionFormat, SessionStatus } from '@/lib/admin-types';
import { formatDayNumber, formatMonthAbbr } from '@/lib/format';
import { BuildingIcon, HybridIcon, ScreenIcon } from './sessionIcons';
import { fillPercent } from './sessionUtils';

/* ------------------------------------------------------------------ */
/* Date badge                                                          */
/* ------------------------------------------------------------------ */

/** Square calendar chip: day number over the abbreviated month. */
export function DateBadge({
  date,
  tone = 'accent',
  size = 'md',
}: {
  date: string;
  tone?: 'accent' | 'muted';
  size?: 'md' | 'lg';
}) {
  const toneClass =
    tone === 'accent' ? 'bg-accent-tint text-accent' : 'bg-card-muted text-ink-tertiary';
  const box = size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  const day = size === 'lg' ? 'text-[19px]' : 'text-[15px]';

  return (
    <span
      className={`flex shrink-0 flex-col items-center justify-center rounded-lg ${box} ${toneClass}`}
    >
      <span className={`font-display leading-none font-semibold ${day}`}>
        {formatDayNumber(date)}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold tracking-[0.06em]">
        {formatMonthAbbr(date)}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Format                                                              */
/* ------------------------------------------------------------------ */

const FORMAT_ICON = {
  onsite: BuildingIcon,
  remote: ScreenIcon,
  hybrid: HybridIcon,
} as const;

/** Format glyph plus its label. */
export function FormatBadge({
  format,
  label,
  iconOnly = false,
}: {
  format: SessionFormat;
  label: string;
  iconOnly?: boolean;
}) {
  const Icon = FORMAT_ICON[format];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-secondary"
      title={iconOnly ? label : undefined}
    >
      <span className="text-ink-tertiary">
        <Icon size={15} />
      </span>
      {iconOnly ? <span className="sr-only">{label}</span> : label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

const STATUS_STYLE: Record<SessionStatus, string> = {
  planned: 'border-accent-border bg-accent-tint text-accent',
  done: 'border-success/25 bg-success-tint text-success',
  cancelled: 'border-danger/25 bg-danger-tint text-danger-text',
};

/** Coloured status pill of a session. */
export function SessionStatusPill({ status, label }: { status: SessionStatus; label: string }) {
  return (
    <span
      className={`inline-flex h-[22px] items-center rounded-full border px-2.5 text-[11.5px] font-medium ${STATUS_STYLE[status]}`}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Seats                                                               */
/* ------------------------------------------------------------------ */

function fillColor(percent: number): string {
  if (percent >= 75) return 'var(--color-gauge-success)';
  if (percent >= 40) return 'var(--color-gauge-warning)';
  return 'var(--color-gauge-danger)';
}

/** Registered over capacity, with a thin fill gauge under the numbers. */
export function SeatsCell({
  registered,
  capacity,
  label,
  hint,
  width = 84,
}: {
  registered: number;
  capacity: number;
  /** Already formatted "8 / 16". */
  label: string;
  /** Optional line under the gauge. */
  hint?: string;
  width?: number;
}) {
  const percent = fillPercent(registered, capacity);
  return (
    <span className="flex flex-col gap-1.5" style={{ width }}>
      <span className="font-display text-[13px] font-medium tabular-nums text-ink">{label}</span>
      <span className="h-[5px] w-full overflow-hidden rounded-full bg-gauge-neutral-track">
        <span
          className="block h-full rounded-full transition-[width] duration-300"
          style={{ width: `${percent}%`, background: fillColor(percent) }}
        />
      </span>
      {hint ? <span className="text-[11px] text-ink-tertiary">{hint}</span> : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Tags                                                                */
/* ------------------------------------------------------------------ */

/** Neutral chip used for free tags and training names. */
export function Chip({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent';
  className?: string;
}) {
  const toneClass =
    tone === 'accent'
      ? 'border-accent-border bg-accent-surface text-accent'
      : 'border-card-border bg-card-muted text-ink-secondary';
  return (
    <span
      className={`inline-flex h-[22px] max-w-full items-center rounded-full border px-2.5 text-[11.5px] font-medium whitespace-nowrap ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
