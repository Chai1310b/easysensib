'use client';

export interface FilterChip {
  /** Stable identifier; an empty string is the conventional "all" chip. */
  value: string;
  label: string;
  /** Optional counter shown next to the label. */
  count?: number;
}

interface FilterChipsProps {
  options: FilterChip[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible label of the group, already translated. */
  ariaLabel: string;
  className?: string;
}

/** Horizontal row of selectable chips (single choice). */
export function FilterChips({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: FilterChipsProps) {
  return (
    <div role="group" aria-label={ariaLabel} className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value || 'all'}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`ui-pressable flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors duration-200 ${
              active
                ? 'border-accent-border bg-accent-tint text-accent'
                : 'border-card-border bg-card text-ink-secondary hover:bg-card-muted'
            }`}
          >
            {option.label}
            {typeof option.count === 'number' ? (
              <span
                className={`font-display text-[11px] tabular-nums ${
                  active ? 'text-accent' : 'text-ink-tertiary'
                }`}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
