/** Display helpers shared by the mail console and the run detail page. */
import { formatLongDate } from '@/lib/format';
import type {
  ExclusionBreakdown,
  PriorityBreakdown,
  RelanceExecution,
  RelanceStatus,
  RelanceType,
  UnassignedReason,
} from '@/lib/admin-types';

/** "2026-08-26T06:00" -> "26 août 2026 · 06:00" */
export function formatRunDateTime(iso: string): string {
  return `${formatLongDate(iso.slice(0, 10))} · ${iso.slice(11, 16)}`;
}

/** "2026-08-26T06:00" -> "26 août 2026" */
export function formatRunDate(iso: string): string {
  return formatLongDate(iso.slice(0, 10));
}

/** Pill classes of the run type: simulation blue, automatic green, manual orange. */
export const TYPE_PILL: Record<RelanceType, string> = {
  simulation: 'bg-accent-tint text-accent',
  auto: 'bg-success-tint text-success',
  manual: 'bg-warning-tint text-warning-text',
};

/** Pill classes of the run status. */
export const STATUS_PILL: Record<RelanceStatus, string> = {
  pending: 'bg-card-muted text-ink-secondary',
  running: 'bg-accent-tint text-accent',
  done: 'bg-success-tint text-success',
  failed: 'bg-danger-tint text-danger-text',
};

/** Ordered priority categories, most urgent first. */
export const PRIORITY_ORDER = [
  'newNoMail',
  'newWithMail',
  'expired',
  'expiringSoon',
  'regular',
] as const;

/** Ordered exclusion reasons, as listed by the relance guide. */
export const EXCLUSION_ORDER = [
  'vip',
  'validTraining',
  'recentMail',
  'bookedSlot',
  'noEmail',
  'inactive',
] as const;

/** Ordered unassigned reasons, most blocking first. */
export const UNASSIGNED_ORDER = [
  'noCompatibleSession',
  'noSessionOnSite',
  'compatibleSessionsFull',
] as const;

/** Sums a breakdown, whatever its shape. */
export function sumBreakdown(
  breakdown:
    PriorityBreakdown[] | ExclusionBreakdown[] | { reason: UnassignedReason; count: number }[],
): number {
  return breakdown.reduce((total, entry) => total + entry.count, 0);
}

/** Newcomers of a run: users that never validated and were never reminded. */
export function countNewcomers(execution: RelanceExecution): number {
  return execution.priorityBreakdown
    .filter((entry) => entry.category === 'newNoMail')
    .reduce((total, entry) => total + entry.count, 0);
}

/**
 * Users dropped before prioritisation. A run that failed before the exclusion
 * step has no exclusion at all, so the difference with `analysed` is ignored.
 */
export function countExcluded(execution: RelanceExecution): number {
  if (execution.exclusionBreakdown.length > 0) return sumBreakdown(execution.exclusionBreakdown);
  return execution.status === 'failed' ? 0 : Math.max(execution.analysed - execution.eligible, 0);
}
