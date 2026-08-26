'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useExitTransition } from './useExitTransition';

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Accessible name of the control, already translated. */
  ariaLabel: string;
  /** Small label rendered inside, before the value (e.g. "Site"). */
  prefix?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Styled replacement for the native `<select>`: same keyboard behavior
 * (arrows, Enter, Escape), design-system popover instead of the OS menu.
 */
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  prefix,
  disabled = false,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const { mounted, closing } = useExitTransition(open, 120);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const openMenu = () => {
    setHighlighted(
      Math.max(
        0,
        options.findIndex((o) => o.value === value),
      ),
    );
    setOpen(true);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
      event.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    if (event.key === 'Escape') setOpen(false);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((i) => Math.min(options.length - 1, i + 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((i) => Math.max(0, i - 1));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const option = options[highlighted];
      if (option) {
        onChange(option.value);
        setOpen(false);
      }
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className="ui-pressable flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-card-border bg-card px-3 text-[13px] text-ink transition-colors duration-150 hover:border-btn-outline disabled:cursor-default disabled:bg-card-muted disabled:text-ink-disabled disabled:hover:border-card-border"
      >
        {prefix ? <span className="text-ink-tertiary">{prefix}</span> : null}
        <span className="flex min-w-0 grow items-center gap-1.5 truncate text-left font-medium">
          {current?.icon}
          {current?.label}
        </span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="shrink-0"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="var(--color-ink-tertiary)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`origin-center transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            style={{ transformBox: 'fill-box' }}
          />
        </svg>
      </button>

      {mounted ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className={`${closing ? 'ui-popover-out' : 'ui-popover'} absolute left-0 z-50 mt-1.5 max-h-72 w-full min-w-44 overflow-y-auto rounded-xl border border-card-border bg-card p-1.5 shadow-[0_14px_38px_rgba(22,24,28,0.14)]`}
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors duration-100 ${
                    selected ? 'font-semibold text-accent' : 'text-ink'
                  } ${index === highlighted ? 'bg-card-muted' : ''}`}
                >
                  {option.icon}
                  <span className="grow truncate">{option.label}</span>
                  {selected ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M5 12L10 17L19 7"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
