import { formatDayNumber, formatMonthAbbr } from '@/lib/format';

interface DateBlockProps {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Fixed column width in px (46 in cards and lists, 52 on detail rows). */
  width?: number;
  /** Day number font size in px (20, 21 or 24 depending on context). */
  daySize?: number;
  /** 'accent' = blue (selected session), 'muted' = gray day number (full session). */
  tone?: 'default' | 'accent' | 'muted';
}

/** Day number (Space Grotesk 700) over an uppercase letter-spaced month abbreviation. */
export function DateBlock({ date, width = 46, daySize = 21, tone = 'default' }: DateBlockProps) {
  const dayColor =
    tone === 'accent' ? 'text-accent' : tone === 'muted' ? 'text-ink-tertiary' : 'text-ink';
  const monthColor = tone === 'accent' ? 'text-accent' : 'text-ink-tertiary';

  return (
    <div className="flex shrink-0 flex-col items-center" style={{ width }}>
      <span
        className={`font-display leading-none font-bold ${dayColor}`}
        style={{ fontSize: daySize }}
      >
        {formatDayNumber(date)}
      </span>
      <span className={`text-[10px] font-semibold tracking-[1px] ${monthColor}`}>
        {formatMonthAbbr(date)}
      </span>
    </div>
  );
}
