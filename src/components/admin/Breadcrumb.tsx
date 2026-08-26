import Link from 'next/link';
import { ChevronRightIcon } from './adminIcons';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the last item: the current page is not a link. */
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Accessible label, already translated. */
  ariaLabel: string;
  className?: string;
}

/** Small path trail above a page title. */
export function Breadcrumb({ items, ariaLabel, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[12.5px]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-ink-tertiary! transition-colors duration-200 hover:text-ink-secondary!"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'font-medium text-ink-secondary' : 'text-ink-tertiary'}>
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span className="text-ink-disabled">
                  <ChevronRightIcon size={12} />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
