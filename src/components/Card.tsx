import type { ReactNode } from 'react';

interface CardProps {
  /** Muted cards use the softer #fbfcfa background (validated rows). */
  muted?: boolean;
  className?: string;
  children: ReactNode;
}

/** White rounded card, 1px border, 12px radius. */
export function Card({ muted = false, className = '', children }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-card-border ${muted ? 'bg-card-muted' : 'bg-card'} ${className}`}
    >
      {children}
    </div>
  );
}
