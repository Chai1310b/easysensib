import { useTranslations } from 'next-intl';
import { CalendarIcon, LaptopIcon } from '@/components/icons';
import type { AdminTrainingState, TrainingCategory } from '@/lib/admin-types';
import type { ValidationMode } from '@/lib/types';

/* ------------------------------------------------------------------ */
/* Category                                                            */
/* ------------------------------------------------------------------ */

/**
 * Business lines are not statuses, so they never borrow the status palette.
 * They get a neutral chip plus a coloured dot, enough to scan a long table.
 */
const CATEGORY_DOT: Record<TrainingCategory, string> = {
  Sécurité: 'bg-gauge-danger',
  Sûreté: 'bg-gauge-warning',
  QHSE: 'bg-gauge-success',
};

export function CategoryChip({ category }: { category: TrainingCategory }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-card-muted py-[3px] pr-2.5 pl-2 text-[11.5px] font-medium whitespace-nowrap text-ink-secondary">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${CATEGORY_DOT[category]}`} />
      {category}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Validation modes                                                    */
/* ------------------------------------------------------------------ */

/** Renders one tag per accepted validation mode ("both" renders the two). */
export function ModeTags({ mode }: { mode: ValidationMode }) {
  const t = useTranslations('adminTrainings');

  return (
    <span className="flex flex-wrap items-center gap-1.5" aria-label={t('mode.aria')}>
      {mode !== 'elearning' ? (
        <span className="flex items-center gap-[5px] rounded bg-btn-secondary px-2 py-[3px] text-[11px] font-semibold whitespace-nowrap text-ink-secondary">
          <CalendarIcon size={11} color="#5c6068" strokeWidth={1.8} />
          {t('mode.session')}
        </span>
      ) : null}
      {mode !== 'session' ? (
        <span className="flex items-center gap-[5px] rounded bg-accent-tint px-2 py-[3px] text-[11px] font-semibold whitespace-nowrap text-accent">
          <LaptopIcon size={11} color="#2b3fbf" strokeWidth={1.8} />
          {t('mode.elearning')}
        </span>
      ) : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Per-user state of one training                                      */
/* ------------------------------------------------------------------ */

const STATE_STYLE: Record<AdminTrainingState, string> = {
  valid: 'bg-success-tint text-success',
  expiring: 'bg-warning-tint text-warning-text',
  overdue: 'bg-danger-tint text-danger-text',
  registered: 'bg-accent-tint text-accent',
  never: 'bg-btn-secondary text-ink-secondary',
};

const STATE_DOT: Record<AdminTrainingState, string> = {
  valid: 'bg-success',
  expiring: 'bg-warning',
  overdue: 'bg-danger',
  registered: 'bg-accent',
  never: 'bg-ink-disabled',
};

/** Coloured pill carrying the state of the training for one user. */
export function StateChip({ state }: { state: AdminTrainingState }) {
  const t = useTranslations('adminCommon');

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap ${STATE_STYLE[state]}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATE_DOT[state]}`} />
      {t(`status.${state}`)}
    </span>
  );
}
