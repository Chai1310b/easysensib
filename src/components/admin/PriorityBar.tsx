export interface PriorityBarSegment {
  /** Stable key, used for React and for the legend. */
  key: string;
  label: string;
  count: number;
  /** CSS color of the segment. */
  color: string;
}

interface PriorityBarProps {
  segments: PriorityBarSegment[];
  /** Hides the legend under the bar. */
  hideLegend?: boolean;
  /** Bar height in pixels; defaults to 10. */
  height?: number;
  className?: string;
}

/**
 * Segmented distribution bar used by the mail console (priority categories,
 * exclusion reasons, unassigned reasons). Segments are sized by share of total.
 */
export function PriorityBar({
  segments,
  hideLegend = false,
  height = 10,
  className = '',
}: PriorityBarProps) {
  const visible = segments.filter((segment) => segment.count > 0);
  const total = visible.reduce((sum, segment) => sum + segment.count, 0);

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <div
        className="flex w-full overflow-hidden rounded-full bg-gauge-neutral-track"
        style={{ height }}
      >
        {total > 0
          ? visible.map((segment) => (
              <div
                key={segment.key}
                title={`${segment.label} · ${segment.count}`}
                style={{
                  width: `${(segment.count / total) * 100}%`,
                  backgroundColor: segment.color,
                }}
              />
            ))
          : null}
      </div>

      {!hideLegend && visible.length > 0 ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {visible.map((segment) => (
            <li key={segment.key} className="flex items-center gap-1.5 text-[12px]">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-ink-secondary">{segment.label}</span>
              <span className="font-display font-medium tabular-nums text-ink">
                {segment.count}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Palette of the priority categories, ordered from most to least urgent. */
export const PRIORITY_COLORS = {
  newNoMail: '#b8362f',
  newWithMail: '#c66a63',
  expired: '#c08a2d',
  expiringSoon: '#d3a94e',
  regular: '#7fae90',
} as const;

/** Palette of the exclusion reasons. */
export const EXCLUSION_COLORS = {
  validTraining: '#7fae90',
  recentMail: '#0816a1',
  bookedSlot: '#87edff',
  vip: '#d3a94e',
  noEmail: '#c66a63',
  inactive: '#b3b7be',
} as const;

/** Palette of the unassigned reasons. */
export const UNASSIGNED_COLORS = {
  noCompatibleSession: '#b8362f',
  noSessionOnSite: '#c08a2d',
  compatibleSessionsFull: '#8a8e96',
} as const;
