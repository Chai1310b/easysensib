import type { StatusTone } from '@/lib/types';

interface ValidityGaugeProps {
  /** Already-translated label, e.g. "En retard de 75 j". */
  label: string;
  tone: StatusTone;
  /** Fill percentage, 0 to 100. */
  percent: number;
  /** Fixed width in px (150 in cards, 170 on the training header). */
  width?: number;
  /** Force the neutral #e9edf3 track (used on some warning gauges). */
  neutralTrack?: boolean;
}

const LABEL_COLOR: Record<StatusTone, string> = {
  danger: 'text-danger-text',
  warning: 'text-warning-text',
  success: 'text-success',
};

const FILL_COLOR: Record<StatusTone, string> = {
  danger: 'bg-gauge-danger',
  warning: 'bg-gauge-warning',
  success: 'bg-gauge-success',
};

const TRACK_COLOR: Record<StatusTone, string> = {
  danger: 'bg-gauge-danger-track',
  warning: 'bg-gauge-warning-track',
  success: 'bg-gauge-neutral-track',
};

/** 12px semibold colored label over a 4px proportional progress bar. */
export function ValidityGauge({
  label,
  tone,
  percent,
  width = 150,
  neutralTrack = false,
}: ValidityGaugeProps) {
  const track = neutralTrack ? 'bg-gauge-neutral-track' : TRACK_COLOR[tone];
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="flex shrink-0 flex-col gap-[5px]" style={{ width }}>
      <span className={`text-xs font-semibold ${LABEL_COLOR[tone]}`}>{label}</span>
      <div className={`flex h-1 rounded-full ${track}`}>
        <div className={`rounded-full ${FILL_COLOR[tone]}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
