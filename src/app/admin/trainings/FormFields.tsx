'use client';

import { useId, type ReactNode } from 'react';

const CONTROL =
  'h-11 w-full rounded-lg border border-card-border bg-card px-3 text-[13.5px] text-ink transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-ink-disabled focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)]';

interface FieldShellProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

/** Label + control + optional hint, the single vertical rhythm of admin forms. */
export function Field({ label, hint, htmlFor, children, className = '' }: FieldShellProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-[12.5px] font-medium text-ink-secondary">
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11.5px] text-ink-tertiary">{hint}</p> : null}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  className,
}: TextFieldProps) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={CONTROL}
      />
    </Field>
  );
}

interface NumberFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  /** Trailing unit rendered inside the control, e.g. "h" or "mois". */
  suffix?: string;
  step?: string;
  min?: number;
  className?: string;
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  suffix,
  step = '1',
  min = 0,
  className,
}: NumberFieldProps) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${CONTROL} font-display tabular-nums ${suffix ? 'pr-14' : ''}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[12.5px] text-ink-tertiary">
            {suffix}
          </span>
        ) : null}
      </div>
    </Field>
  );
}

interface SelectFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function SelectField({
  label,
  hint,
  value,
  onChange,
  options,
  className,
}: SelectFieldProps) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${CONTROL} cursor-pointer appearance-none pr-9`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-tertiary">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </Field>
  );
}

interface TextAreaFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}: TextAreaFieldProps) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${CONTROL} h-auto resize-none py-2.5 leading-relaxed`}
      />
    </Field>
  );
}

interface ToggleFieldProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/** Switch row: label and hint on the left, sliding track on the right. */
export function ToggleField({ label, hint, checked, onChange, className = '' }: ToggleFieldProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-lg border border-card-border bg-card-muted px-3.5 py-3 ${className}`}
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-[13px] font-medium text-ink">{label}</span>
        {hint ? <span className="text-[11.5px] text-ink-tertiary">{hint}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`ui-pressable relative mt-0.5 h-[22px] w-[38px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
          checked ? 'bg-accent' : 'bg-btn-outline'
        }`}
      >
        <span
          className={`absolute top-[3px] h-4 w-4 rounded-full bg-card shadow-[0_1px_3px_rgba(22,24,28,0.25)] transition-[left] duration-200 ${
            checked ? 'left-[19px]' : 'left-[3px]'
          }`}
        />
      </button>
    </div>
  );
}
