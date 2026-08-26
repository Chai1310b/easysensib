'use client';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible label of the tab list, already translated. */
  ariaLabel: string;
  className?: string;
}

/** Underlined tab bar. Panels are rendered by the caller. */
export function Tabs({ items, value, onChange, ariaLabel, className = '' }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex gap-1 border-b border-divider ${className}`}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={`relative -mb-px cursor-pointer px-3 pb-2.5 text-[13px] font-medium transition-colors duration-200 ${
              active
                ? 'text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-accent'
                : 'text-ink-tertiary hover:text-ink-secondary'
            }`}
          >
            {item.label}
            {typeof item.count === 'number' ? (
              <span
                className={`ml-1.5 font-display text-[11px] tabular-nums ${
                  active ? 'text-accent' : 'text-ink-disabled'
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
