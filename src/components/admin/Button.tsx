import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover border border-transparent',
  secondary: 'bg-btn-secondary text-ink border border-transparent hover:bg-[#e8eae5]',
  outline: 'bg-card text-accent border-[1.5px] border-accent hover:bg-accent-surface',
  ghost: 'bg-transparent text-ink-secondary border border-transparent hover:bg-card-muted',
  danger: 'bg-danger-tint text-danger-text border border-transparent hover:bg-[#f3ddda]',
};

const SIZE: Record<ButtonSize, string> = {
  md: 'h-11 px-4 text-[13.5px]',
  sm: 'h-9 px-3 text-[13px]',
};

// A disabled button drops to the neutral fill rather than a faded accent:
// white text over a 50 % opacity blue was unreadable.
const DISABLED =
  'disabled:cursor-default disabled:border-transparent disabled:bg-btn-secondary disabled:text-ink-tertiary disabled:hover:bg-btn-secondary';

const BASE = `ui-pressable inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,border-color,color] duration-200 ${DISABLED}`;

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

/** Admin action button. 44px tall by default, 8px radius. */
export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps extends CommonProps {
  href: string;
}

/** Same visual as `Button`, rendered as a Next.js link. */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: ButtonLinkProps) {
  const color = variant === 'primary' ? 'text-white! hover:text-white!' : '';
  return (
    <Link href={href} className={`${BASE} ${VARIANT[variant]} ${SIZE[size]} ${color} ${className}`}>
      {children}
    </Link>
  );
}
