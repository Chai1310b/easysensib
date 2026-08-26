import type { CSSProperties, ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: ReactNode;
  /** Optional control aligned to the right of the header (an add button). */
  action?: ReactNode;
  /** Cascade index used by the shared `.ui-stagger` animation. */
  index?: number;
  children: ReactNode;
}

/** Card shell shared by the four settings referentials. */
export function SettingsSection({
  title,
  description,
  icon,
  action,
  index = 0,
  children,
}: SettingsSectionProps) {
  return (
    <section
      className="ui-card ui-stagger flex flex-col rounded-xl border border-card-border bg-card"
      style={{ '--ui-index': index } as CSSProperties}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-divider px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-tint text-accent">
            {icon}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>
            <p className="text-[12.5px] text-ink-tertiary">{description}</p>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </section>
  );
}

interface SettingsRowProps {
  label: string;
  hint?: string;
  /** The control itself, aligned to the right on wide viewports. */
  children: ReactNode;
}

/** Label plus control line used inside the relance settings form. */
export function SettingsRow({ label, hint, children }: SettingsRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider px-5 py-3.5 last:border-b-0">
      <div className="flex min-w-0 max-w-[440px] flex-col gap-0.5">
        <span className="text-[13.5px] font-medium text-ink">{label}</span>
        {hint ? <span className="text-[12px] text-ink-tertiary">{hint}</span> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/**
 * Static cascade classes for the shared `.ui-stagger` animation.
 * Tailwind needs literal class names, so the delays are listed, not computed.
 */
const STAGGER_CLASSES = [
  '[--ui-index:0]',
  '[--ui-index:1]',
  '[--ui-index:2]',
  '[--ui-index:3]',
  '[--ui-index:4]',
  '[--ui-index:5]',
  '[--ui-index:6]',
  '[--ui-index:7]',
  '[--ui-index:8]',
  '[--ui-index:9]',
];

/** `ui-stagger` class of the row at this position, delays capped at the last one. */
export function staggerClass(index: number): string {
  return `ui-stagger ${STAGGER_CLASSES[Math.min(index, STAGGER_CLASSES.length - 1)]}`;
}
