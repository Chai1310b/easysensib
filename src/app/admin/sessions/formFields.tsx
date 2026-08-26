'use client';

import type { ReactNode } from 'react';

const CONTROL =
  'h-10 w-full rounded-lg border border-card-border bg-card px-3 text-[13px] text-ink transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-ink-disabled focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)] disabled:bg-card-muted disabled:text-ink-tertiary';

/** Labelled wrapper of one form control. */
export function Field({
  label,
  hint,
  htmlFor,
  className = '',
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11.5px] text-ink-tertiary">{hint}</p> : null}
    </div>
  );
}

interface TextInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'date' | 'time';
}

/** Text, date or time input sharing the admin control skin. */
export function TextInput({ value, onChange, type = 'text', ...rest }: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={CONTROL}
      {...rest}
    />
  );
}

/** Numeric input with explicit bounds. */
export function NumberInput({
  id,
  value,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
}: {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type="number"
      min={min}
      max={max}
      value={Number.isNaN(value) ? '' : value}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
      className={`${CONTROL} font-display tabular-nums`}
    />
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

/** Native select with the admin control skin and a custom chevron. */
export function SelectInput({
  id,
  value,
  onChange,
  options,
  ariaLabel,
  disabled = false,
  className = '',
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        value={value}
        aria-label={ariaLabel}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`${CONTROL} cursor-pointer appearance-none pr-8`}
      >
        {options.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-tertiary">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

/** Single-choice segmented control, used for the session format. */
export function SegmentedControl({
  value,
  onChange,
  options,
  ariaLabel,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon?: ReactNode }[];
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex h-10 items-center gap-1 rounded-lg border border-card-border bg-card-muted p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`ui-pressable flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium transition-colors duration-200 disabled:cursor-default disabled:opacity-60 ${
              active
                ? 'bg-card text-accent shadow-[0_1px_2px_rgba(22,24,28,0.08)]'
                : 'text-ink-secondary hover:text-ink'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Checkbox rendered as a small switch. */
export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2.5 text-[13px] font-medium text-ink"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`ui-pressable relative flex h-[22px] w-[38px] shrink-0 items-center rounded-full border transition-colors duration-200 peer-focus-visible:shadow-[0_0_0_3px_var(--color-accent-surface)] ${
          checked ? 'border-accent bg-accent' : 'border-card-border bg-btn-secondary'
        }`}
      >
        <span
          className={`absolute h-[16px] w-[16px] rounded-full bg-card shadow-[0_1px_2px_rgba(22,24,28,0.2)] transition-transform duration-200 ${
            checked ? 'translate-x-[19px]' : 'translate-x-[2px]'
          }`}
        />
      </span>
      {label}
    </label>
  );
}

/** Section card of a form: title, hint and body. */
export function FormSection({
  title,
  hint,
  icon,
  aside,
  index = 0,
  children,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
  aside?: ReactNode;
  index?: number;
  children: ReactNode;
}) {
  return (
    <section
      className="ui-stagger ui-card flex flex-col rounded-xl border border-card-border bg-card transition-[border-color,box-shadow] duration-200"
      style={{ '--ui-index': index } as React.CSSProperties}
    >
      <header className="flex items-start justify-between gap-4 border-b border-divider px-5 py-4">
        <div className="flex items-start gap-3">
          {icon ? (
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-tint text-accent">
              {icon}
            </span>
          ) : null}
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>
            {hint ? <p className="max-w-[560px] text-[12.5px] text-ink-tertiary">{hint}</p> : null}
          </div>
        </div>
        {aside}
      </header>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}
