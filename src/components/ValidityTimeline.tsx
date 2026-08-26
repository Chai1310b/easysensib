import type { Training } from '@/lib/types';
import { formatLongDate, formatMonthYear } from '@/lib/format';

interface ValidityTimelineProps {
  training: Training;
  /** Translated strings (training.timeline namespace). */
  labels: {
    today: string;
    plannedSession?: string;
    left: string;
    right: string;
    /** Colored status sentence under the cursor. */
    status: string;
    legendValid: string;
    legendWarning: string;
    legendOverdue: string;
  };
}

const TONE_TEXT: Record<string, string> = {
  danger: 'text-danger-text',
  warning: 'text-warning-text',
  success: 'text-success',
};

/**
 * Large validity bar of the training page: green / orange / red zones with a
 * "today" cursor, in the spirit of the validated mockup (variante 8).
 */
export function ValidityTimeline({ training, labels }: ValidityTimelineProps) {
  const { state, validity } = training;

  // Zone widths (percent). Overdue trainings show a red tail past expiry;
  // never-done trainings show a countdown toward the deadline.
  const zones =
    state === 'overdue'
      ? [
          { width: 52, color: 'var(--color-gauge-success)' },
          { width: 16, color: 'var(--color-gauge-warning)' },
          { width: 32, color: 'var(--color-gauge-danger)' },
        ]
      : state === 'todo'
        ? [
            { width: 70, color: 'var(--color-gauge-warning)' },
            { width: 30, color: 'var(--color-gauge-danger)' },
          ]
        : [
            { width: 84, color: 'var(--color-gauge-success)' },
            { width: 16, color: 'var(--color-gauge-warning)' },
          ];

  const cursor = state === 'overdue' ? 88 : Math.max(2, Math.min(96, validity.progressPercent));

  // Blue dot marking the planned session, slightly after the cursor.
  const plannedDot = training.registration ? Math.min(97, cursor + 5.5) : null;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative flex h-2 overflow-visible rounded-full">
        {zones.map((zone, index) => (
          <div
            key={index}
            style={{ width: `${zone.width}%`, background: zone.color }}
            className={
              index === 0 ? 'rounded-l-full' : index === zones.length - 1 ? 'rounded-r-full' : ''
            }
          />
        ))}
        <div
          aria-hidden
          className="absolute -top-[7px] flex flex-col items-center"
          style={{ left: `${cursor}%` }}
        >
          <div className="h-[22px] w-[3px] rounded-sm bg-ink" />
        </div>
        {plannedDot !== null ? (
          <div
            aria-hidden
            title={labels.plannedSession}
            className="absolute -top-[4px] h-4 w-4 rounded-full border-[2.5px] border-white bg-accent shadow-[0_0_0_1px_var(--color-card-border)]"
            style={{ left: `calc(${plannedDot}% - 8px)` }}
          />
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] text-ink-tertiary">{labels.left}</span>
        <span className={`text-[13px] font-semibold ${TONE_TEXT[validity.tone]}`}>
          {labels.today} · {labels.status}
        </span>
        <span className="text-[11px] text-ink-tertiary">{labels.right}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
          <span className="h-1.5 w-4 rounded-full bg-gauge-success" />
          {labels.legendValid}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
          <span className="h-1.5 w-4 rounded-full bg-gauge-warning" />
          {labels.legendWarning}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
          <span className="h-1.5 w-4 rounded-full bg-gauge-danger" />
          {labels.legendOverdue}
        </span>
        {plannedDot !== null && labels.plannedSession ? (
          <span className="flex items-center gap-1.5 text-[11px] text-ink-tertiary">
            <span className="h-3 w-3 rounded-full border-2 border-white bg-accent shadow-[0_0_0_1px_var(--color-card-border)]" />
            {labels.plannedSession}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** Builds the left/right edge labels of the timeline from the validity data. */
export function timelineEdges(
  training: Training,
  t: (key: string, values?: Record<string, string | number>) => string,
): { left: string; right: string } {
  const { validity, state } = training;
  if (state === 'overdue' || state === 'todo') {
    return {
      left: validity.obtainedAt
        ? t('timeline.obtainedOn', { date: formatMonthYear(validity.obtainedAt) })
        : `${t('timeline.assigned')} · ${t('timeline.neverDone')}`,
      right: validity.dueAt
        ? t('timeline.dueBefore', { date: formatLongDate(validity.dueAt) })
        : '',
    };
  }
  return {
    left: validity.obtainedAt
      ? t('timeline.obtainedOn', { date: formatMonthYear(validity.obtainedAt) })
      : '',
    right: validity.expiresAt
      ? t('timeline.expiresOn', { date: formatMonthYear(validity.expiresAt) })
      : '',
  };
}
