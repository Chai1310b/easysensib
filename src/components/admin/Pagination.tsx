'use client';

import { ChevronRightIcon } from './adminIcons';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  /** Already translated labels. */
  labels: { previous: string; next: string; summary: string };
}

/** Compact page switcher: previous, numbered pages, next. */
export function Pagination({ page, pageCount, onChange, labels }: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);
  const buttonBase =
    'ui-pressable flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border px-2 text-[12.5px] font-medium transition-colors duration-200 disabled:cursor-default disabled:opacity-40';

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12.5px] text-ink-tertiary">{labels.summary}</span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={labels.previous}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className={`${buttonBase} border-card-border bg-card text-ink-secondary hover:bg-card-muted`}
        >
          <span className="rotate-180">
            <ChevronRightIcon size={13} />
          </span>
        </button>

        {pages.map((item) => (
          <button
            key={item}
            type="button"
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onChange(item)}
            className={`${buttonBase} font-display tabular-nums ${
              item === page
                ? 'border-accent-border bg-accent-tint text-accent'
                : 'border-card-border bg-card text-ink-secondary hover:bg-card-muted'
            }`}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          aria-label={labels.next}
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
          className={`${buttonBase} border-card-border bg-card text-ink-secondary hover:bg-card-muted`}
        >
          <ChevronRightIcon size={13} />
        </button>
      </div>
    </div>
  );
}
