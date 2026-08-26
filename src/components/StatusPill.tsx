import type { ReactNode } from 'react';
import type { StatusTone } from '@/lib/types';

type PillIcon = 'check' | 'clock' | 'cross';

interface StatusPillProps {
  tone: StatusTone;
  icon: PillIcon;
  children: ReactNode;
}

const TONES: Record<StatusTone, { text: string; bg: string; stroke: string }> = {
  success: { text: 'text-success', bg: 'bg-success-tint', stroke: '#2f7d4f' },
  warning: { text: 'text-warning-text', bg: 'bg-warning-tint', stroke: '#96650f' },
  danger: { text: 'text-danger-text', bg: 'bg-danger-tint', stroke: '#a03232' },
};

function PillGlyph({ icon, stroke }: { icon: PillIcon; stroke: string }) {
  if (icon === 'check') {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12L10 17L19 7"
          stroke={stroke}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (icon === 'clock') {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.5" stroke={stroke} strokeWidth="1.8" />
        <path d="M12 8V12L14.5 13.8" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <path d="M6 6L18 18M18 6L6 18" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** Rounded status pill: tinted background, 12px semibold text, small leading icon. */
export function StatusPill({ tone, icon, children }: StatusPillProps) {
  const style = TONES[tone];

  return (
    <span
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.text} ${style.bg}`}
    >
      <PillGlyph icon={icon} stroke={style.stroke} />
      {children}
    </span>
  );
}
