/**
 * Inline stroke icons specific to the mail relance console.
 * Kept in the route folder so the shared icon files stay untouched.
 */

interface IconProps {
  size?: number;
  className?: string;
}

const BASE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** Clock, used for the run duration. */
export function ClockIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden className={className}>
      <circle cx="10" cy="10" r="7.25" {...BASE} />
      <path d="M10 6v4.2l2.6 1.6" {...BASE} />
    </svg>
  );
}

/** Play triangle in a circle, used by the simulation action. */
export function PlayIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden className={className}>
      <circle cx="10" cy="10" r="7.25" {...BASE} />
      <path d="M8.4 7.3 13 10l-4.6 2.7z" {...BASE} />
    </svg>
  );
}

/** Row of seats, used for the free seats metric. */
export function SeatsIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden className={className}>
      <path d="M3.75 12.5h12.5" {...BASE} />
      <path d="M5.5 12.5V8.25a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5v4.25" {...BASE} />
      <path d="M5.5 12.5v2.75M14.5 12.5v2.75M10 6.75v5.75" {...BASE} />
    </svg>
  );
}

/** Left chevron, used by the back link of the detail page. */
export function ChevronLeftIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden className={className}>
      <path d="M12.25 4.5 6.75 10l5.5 5.5" {...BASE} />
    </svg>
  );
}

/** Balance-like scale, used by the priority model panel. */
export function ScaleIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden className={className}>
      <path d="M10 4.25v11.5M6.25 15.75h7.5M4 6.75h12" {...BASE} />
      <path d="M4 6.75 2 11.25h4zM16 6.75l-2 4.5h4z" {...BASE} />
    </svg>
  );
}

/** Filter funnel, used by the exclusion panel. */
export function FunnelIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden className={className}>
      <path d="M3.5 4.75h13l-5 5.75v4.75l-3 1.5V10.5z" {...BASE} />
    </svg>
  );
}
