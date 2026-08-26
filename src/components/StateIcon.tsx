import type { TrainingState } from '@/lib/types';

interface StateIconProps {
  state: TrainingState;
  size?: number;
  className?: string;
}

const STYLES: Record<TrainingState, { fill: string; stroke: string }> = {
  overdue: { fill: '#f8e9e7', stroke: '#b8362f' },
  todo: { fill: '#f9f0dd', stroke: '#96650f' },
  registered: { fill: '#eaedfb', stroke: '#2b3fbf' },
  valid: { fill: '#e9f2ec', stroke: '#2f7d4f' },
};

/**
 * Training state icon in a tinted circle:
 * overdue/todo = exclamation, registered = clock, valid = check.
 */
export function StateIcon({ state, size = 24, className }: StateIconProps) {
  const { fill, stroke } = STYLES[state];

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill={fill} />
      {(state === 'overdue' || state === 'todo') && (
        <path d="M12 7V13M12 16.5V16.6" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" />
      )}
      {state === 'registered' && (
        <path d="M12 7V12L15 14" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      )}
      {state === 'valid' && (
        <path
          d="M7.5 12L10.5 15L16.5 9"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
