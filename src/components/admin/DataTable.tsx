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
