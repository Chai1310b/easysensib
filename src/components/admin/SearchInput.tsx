'use client';

import type { InputHTMLAttributes } from 'react';
import { SearchIcon } from './adminIcons';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Already translated placeholder. */
  placeholder: string;
  /** Width of the field; defaults to a 260px comfortable box. */
  className?: string;
}

/** Search field with a leading magnifier glyph. */
export function SearchInput({ placeholder, className = '', ...rest }: SearchInputProps) {
  return (
    <div className={`relative ${className || 'w-full max-w-[280px]'}`}>
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-tertiary">
        <SearchIcon size={15} />
      </span>
      <input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-card-border bg-card pr-3 pl-9 text-[13px] text-ink transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-ink-disabled focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)]"
        {...rest}
      />
    </div>
  );
}
