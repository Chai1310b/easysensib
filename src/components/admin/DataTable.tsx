import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

type Align = 'left' | 'right' | 'center';

const ALIGN: Record<Align, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

interface TableProps {
  /** Optional header row content (a <tr> of <Th>). */
  head?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Admin data table primitives.
 * The table always scrolls inside its own container so the page never scrolls
 * horizontally on narrow viewports.
 */
export function Table({ head, children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-card-border bg-card ${className}`}>
      <table className="w-full min-w-[640px] border-collapse text-sm">
        {head ? <thead>{head}</thead> : null}
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

/** Header cell: 11px uppercase, tertiary ink, bottom divider. */
export function Th({ align = 'left', className = '', children, ...rest }: ThProps) {
  return (
    <th
      scope="col"
      className={`border-b border-divider px-4 py-2.5 text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase ${ALIGN[align]} ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
  /** Renders the value in Space Grotesk (numbers, counters). */
  numeric?: boolean;
}

/** Body cell: 13px, divider under each row. */
export function Td({
  align = 'left',
  numeric = false,
  className = '',
  children,
  ...rest
}: TdProps) {
  return (
    <td
      className={`border-b border-divider px-4 py-3 text-[13px] text-ink ${ALIGN[align]} ${
        numeric ? 'font-display font-medium tabular-nums' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}

interface TrProps {
  /** Highlights the row (selected or focused state). */
  selected?: boolean;
  children: ReactNode;
  className?: string;
}

/** Body row with the shared hover treatment. */
export function Tr({ selected = false, children, className = '' }: TrProps) {
  return (
    <tr
      className={`ui-row transition-colors duration-150 ${
        selected ? 'bg-accent-surface' : 'hover:bg-card-muted'
      } ${className}`}
    >
      {children}
    </tr>
  );
}

/** Full-width row used to render an empty state inside a table. */
export function TableEmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-[13px] text-ink-tertiary">
        {children}
      </td>
    </tr>
  );
}

interface SortableThProps {
  label: string;
  /** True when the table is currently sorted on this column. */
  active: boolean;
  /** Direction of the current sort, only meaningful while active. */
  descending: boolean;
  onClick: () => void;
  align?: Align;
  /** Accessible label of the sort button, already translated. */
  ariaLabel?: string;
}

/**
 * Header cell carrying the sort control of its column.
 * Shared by every admin table so the sort affordance reads the same
 * everywhere: the caret shows up only on the column actually sorted.
 */
export function SortableTh({
  label,
  active,
  descending,
  onClick,
  align = 'left',
  ariaLabel,
}: SortableThProps) {
  return (
    <Th align={align} aria-sort={active ? (descending ? 'descending' : 'ascending') : 'none'}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className={`inline-flex cursor-pointer items-center gap-1 tracking-[0.06em] uppercase transition-colors duration-200 hover:text-ink-secondary ${
          active ? 'text-ink-secondary' : ''
        }`}
      >
        {label}
        <span
          aria-hidden="true"
          className={`flex text-accent transition-[opacity,transform] duration-200 ${
            active ? 'opacity-100' : 'opacity-0'
          } ${active && !descending ? 'rotate-180' : ''}`}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </Th>
  );
}
