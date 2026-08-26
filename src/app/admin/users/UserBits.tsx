/**
 * Small presentational pieces shared by the three user screens.
 * All of them are dumb: every string arrives already translated.
 */

import type { AdminRole, AdminTrainingState } from '@/lib/admin-types';

/**
 * Static list of stagger delays. Tailwind only generates classes it can read in
 * the source, so the arbitrary `--ui-index` values must be written out here
 * rather than interpolated at runtime.
 */
const STAGGER = [
  'ui-stagger [--ui-index:0]',
  'ui-stagger [--ui-index:1]',
  'ui-stagger [--ui-index:2]',
  'ui-stagger [--ui-index:3]',
  'ui-stagger [--ui-index:4]',
  'ui-stagger [--ui-index:5]',
  'ui-stagger [--ui-index:6]',
  'ui-stagger [--ui-index:7]',
  'ui-stagger [--ui-index:8]',
  'ui-stagger [--ui-index:9]',
  'ui-stagger [--ui-index:10]',
  'ui-stagger [--ui-index:11]',
];

/** Cascade class for row number `index`; delays stop growing past the list. */
export function staggerClass(index: number): string {
  return STAGGER[Math.min(index, STAGGER.length - 1)] ?? 'ui-stagger';
}

const AVATAR_SIZE = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-9 w-9 text-[12px]',
  lg: 'h-14 w-14 text-[17px]',
} as const;

/** Initials disc standing in for a photo. */
export function Avatar({
  initials,
  size = 'md',
  tone = 'neutral',
}: {
  initials: string;
  size?: keyof typeof AVATAR_SIZE;
  tone?: 'neutral' | 'accent';
}) {
  const colors =
    tone === 'accent'
      ? 'bg-accent-tint text-accent'
      : 'bg-card-muted text-ink-secondary border border-card-border';
  return (
    <span
      aria-hidden="true"
      className={`font-display flex shrink-0 items-center justify-center rounded-full font-semibold ${AVATAR_SIZE[size]} ${colors}`}
    >
      {initials}
    </span>
  );
}

const STATE_CHIP: Record<AdminTrainingState, string> = {
  valid: 'bg-success-tint text-success',
  expiring: 'bg-warning-tint text-warning-text',
  overdue: 'bg-danger-tint text-danger-text',
  never: 'bg-danger-tint text-danger-text',
  registered: 'bg-accent-tint text-accent',
};

const STATE_DOT: Record<AdminTrainingState, string> = {
  valid: 'bg-success',
  expiring: 'bg-warning',
  overdue: 'bg-danger',
  never: 'bg-danger',
  registered: 'bg-accent',
};

/** Colored pill carrying the state of one training for one user. */
export function StateChip({ state, label }: { state: AdminTrainingState; label: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${STATE_CHIP[state]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATE_DOT[state]}`} />
      {label}
    </span>
  );
}

/** Counter dot used in the list cell that sums up a user's trainings. */
export function CountDot({
  tone,
  label,
}: {
  tone: 'success' | 'danger' | 'accent';
  label: string;
}) {
  const dot = { success: 'bg-success', danger: 'bg-danger', accent: 'bg-accent' }[tone];
  const text = { success: 'text-success', danger: 'text-danger-text', accent: 'text-accent' }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/** Discreet VIP marker. VIP users are deliberately excluded from mail runs. */
export function VipBadge({ label, title }: { label: string; title: string }) {
  return (
    <span
      title={title}
      className="font-display inline-flex items-center rounded-md border border-card-border bg-card-muted px-1.5 py-0.5 text-[10.5px] font-semibold tracking-[0.06em] text-ink-secondary uppercase"
    >
      {label}
    </span>
  );
}

/** Inactive account marker. */
export function InactiveBadge({ label, title }: { label: string; title: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center rounded-md bg-card-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-tertiary"
    >
      {label}
    </span>
  );
}

const ROLE_CHIP: Record<AdminRole, string> = {
  user: 'text-ink-tertiary',
  perimeter_manager: 'text-accent',
  training_manager: 'text-accent',
  admin: 'text-ink',
};

/** Role label, muted for standard users so managers stand out in a list. */
export function RoleLabel({ role, label }: { role: AdminRole; label: string }) {
  return <span className={`text-[12.5px] font-medium ${ROLE_CHIP[role]}`}>{label}</span>;
}

/** Key/value block used in the profile header and in the privileged drawer. */
export function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink">{children}</div>
    </div>
  );
}

/** Neutral tag used to list sites and trainings inside a perimeter. */
export function Tag({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent';
}) {
  const colors =
    tone === 'accent'
      ? 'border-accent-border bg-accent-surface text-accent'
      : 'border-card-border bg-card-muted text-ink-secondary';
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[12px] ${colors}`}
    >
      {children}
    </span>
  );
}
