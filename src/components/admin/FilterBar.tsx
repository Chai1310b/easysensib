'use client';

import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './adminIcons';
import { useExitTransition } from './useExitTransition';

export interface FilterOption {
  value: string;
  label: string;
  /** Optional count shown after the label. */
  count?: number;
}

export interface FilterGroupDef {
  id: string;
  label: string;
  options: FilterOption[];
}

export type FilterSelection = Record<string, string[]>;

interface FilterBarProps {
  groups: FilterGroupDef[];
  selection: FilterSelection;
  onChange: (next: FilterSelection) => void;
  /** Translated labels. */
  labels: { filters: string; reset: string; close: string };
}

function activeCount(selection: FilterSelection): number {
  return Object.values(selection).reduce((sum, values) => sum + values.length, 0);
}

/**
 * Advanced filter control for large tables: a "Filters" button opening a
 * grouped checkbox panel, plus removable chips for the active criteria.
 */
export function FilterBar({ groups, selection, onChange, labels }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const { mounted, closing } = useExitTransition(open, 140);
  const rootRef = useRef<HTMLDivElement>(null);
  const count = activeCount(selection);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = (groupId: string, value: string) => {
    const current = selection[groupId] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...selection, [groupId]: next });
  };

  const chips = groups.flatMap((group) =>
    (selection[group.id] ?? []).map((value) => ({
      group,
      value,
      label: group.options.find((o) => o.value === value)?.label ?? value,
    })),
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`ui-pressable flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-colors duration-150 ${
            count > 0
              ? 'border-accent-border bg-accent-surface text-accent'
              : 'border-card-border bg-card text-ink hover:border-btn-outline'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 6H20M7 12H17M10 18H14"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          </svg>
          {labels.filters}
          {count > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
              {count}
            </span>
          ) : null}
        </button>

        {mounted ? (
          <div
            className={`${closing ? 'ui-popover-out' : 'ui-popover'} absolute left-0 z-50 mt-1.5 w-80 rounded-xl border border-card-border bg-card shadow-[0_16px_44px_rgba(22,24,28,0.16)]`}
          >
            <div className="max-h-[420px] overflow-y-auto p-3">
              <div className="flex flex-col gap-4">
                {groups.map((group) => (
                  <fieldset key={group.id} className="flex flex-col gap-1.5">
                    <legend className="mb-1 text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
                      {group.label}
                    </legend>
                    {group.options.map((option) => {
                      const checked = (selection[group.id] ?? []).includes(option.value);
                      return (
                        <label
                          key={option.value}
                          className="ui-pressable flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-ink transition-colors duration-100 hover:bg-card-muted"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(group.id, option.value)}
                            className="peer sr-only"
                          />
                          <span
                            aria-hidden
                            className={`flex h-4 w-4 items-center justify-center rounded border transition-colors duration-100 ${
                              checked ? 'border-accent bg-accent' : 'border-btn-outline bg-card'
                            }`}
                          >
                            {checked ? (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M5 12L10 17L19 7"
                                  stroke="#ffffff"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : null}
                          </span>
                          <span className="grow">{option.label}</span>
                          {option.count !== undefined ? (
                            <span className="text-[12px] text-ink-tertiary">{option.count}</span>
                          ) : null}
                        </label>
                      );
                    })}
                  </fieldset>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-divider px-3 py-2.5">
              <button
                type="button"
                onClick={() => onChange({})}
                disabled={count === 0}
                className="ui-pressable cursor-pointer rounded-lg px-2 py-1 text-[13px] font-medium text-ink-secondary transition-colors duration-150 hover:bg-card-muted disabled:cursor-default disabled:opacity-40"
              >
                {labels.reset}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ui-pressable cursor-pointer rounded-lg bg-btn-secondary px-3 py-1.5 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-card-border"
              >
                {labels.close}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {chips.map((chip) => (
        <button
          key={`${chip.group.id}:${chip.value}`}
          type="button"
          onClick={() => toggle(chip.group.id, chip.value)}
          className="ui-pressable flex cursor-pointer items-center gap-1.5 rounded-full border border-accent-border bg-accent-tint py-1 pr-2 pl-3 text-[12px] font-medium text-accent transition-colors duration-150 hover:bg-accent-border/60"
        >
          <span className="text-accent/70">{chip.group.label} ·</span>
          {chip.label}
          <CloseIcon size={9} />
        </button>
      ))}
    </div>
  );
}
