/**
 * Inline stroke icons specific to the settings page.
 * Kept local to the route so the shared icon files stay untouched.
 */

interface IconProps {
  size?: number;
  className?: string;
}

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
}

/** Plus sign, used by the "add" buttons. */
export function PlusIcon({ size = 14, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Pencil, used to rename a referential entry. */
export function PencilIcon({ size = 14, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 20h4L20 8a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M14.5 6.5 17.5 9.5" />
    </svg>
  );
}

/** Bin, used to remove a session tag. */
export function TrashIcon({ size = 14, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 7h16M10 7V5h4v2M6 7l1 12h10l1-12" />
      <path d="M10.5 11v5M13.5 11v5" />
    </svg>
  );
}

/** Label, used by the session tag referential. */
export function TagIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12.6 3.5H20v7.4l-8.9 8.9a1.6 1.6 0 0 1-2.3 0l-5.1-5.1a1.6 1.6 0 0 1 0-2.3l8.9-8.9Z" />
      <path d="M16.6 7.4h.01" />
    </svg>
  );
}

/** Building, used by the sites and rooms referential. */
export function BuildingIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 20h16M6 20V5.5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 14 5.5V20" />
      <path d="M14 10h3.5A1.5 1.5 0 0 1 19 11.5V20" />
      <path d="M9 8h2M9 11.5h2M9 15h2" />
    </svg>
  );
}

/** Layered squares, used by the business line referential. */
export function LayersIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m12 3.5 8.5 4.3L12 12 3.5 7.8 12 3.5Z" />
      <path d="m3.5 12.2 8.5 4.3 8.5-4.3" />
      <path d="m3.5 16.4 8.5 4.3 8.5-4.3" />
    </svg>
  );
}

/** Paper plane, used by the relance settings card. */
export function SendIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M20.5 3.5 3.8 9.9l6.6 2.6 2.6 6.6 7.5-15.6Z" />
      <path d="m10.4 12.5 4.2-4.2" />
    </svg>
  );
}

/** Chevron used by the collapsible site blocks. */
export function ChevronDownIcon({ size = 14, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}
