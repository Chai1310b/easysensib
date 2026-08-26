/**
 * Inline stroke-based SVG icons used only by the manager/admin space.
 * Same conventions as `src/components/icons.tsx`: one component per icon,
 * 24x24 viewBox, size and color driven by props. No icon library.
 */
import type { SVGProps } from 'react';

export interface AdminIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

function svgProps(size: number, className?: string): SVGProps<SVGSVGElement> {
  return { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', className };
}

function stroke({ color = 'currentColor', strokeWidth = 1.6 }: AdminIconProps) {
  return {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

/** Sidebar: list of trainings. */
export function ListIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 17, props.className)}>
      <path d="M9 6H20M9 12H20M9 18H20" {...s} />
      <path
        d="M4.5 6H4.51M4.5 12H4.51M4.5 18H4.51"
        {...s}
        strokeWidth={(props.strokeWidth ?? 1.6) + 0.6}
      />
    </svg>
  );
}

/** Sidebar: sessions calendar. */
export function CalendarGridIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 17, props.className)}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" {...s} />
      <path d="M3.5 9.5H20.5M8 3.5V6.5M16 3.5V6.5" {...s} />
      <path d="M8 13.5H10M14 13.5H16M8 17H10M14 17H16" {...s} />
    </svg>
  );
}

/** Sidebar: certificates awaiting review. */
export function BadgeCheckIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 17, props.className)}>
      <path
        d="M12 2.8L14.2 4.6L17 4.3L17.9 7L20.3 8.5L19.7 11.3L20.3 14.1L17.9 15.6L17 18.3L14.2 18L12 19.8L9.8 18L7 18.3L6.1 15.6L3.7 14.1L4.3 11.3L3.7 8.5L6.1 7L7 4.3L9.8 4.6L12 2.8Z"
        {...s}
      />
      <path d="M9 11.4L11.2 13.6L15.2 9.4" {...s} />
    </svg>
  );
}

/** Sidebar: all users. */
export function UsersIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 17, props.className)}>
      <circle cx="9.5" cy="8.5" r="3.3" {...s} />
      <path d="M3.5 19.2C3.5 16.3 6.2 14.4 9.5 14.4C12.8 14.4 15.5 16.3 15.5 19.2" {...s} />
      <path d="M16.2 5.6C17.9 6 19 7.4 19 9C19 10.4 18.2 11.6 17 12.2" {...s} />
      <path d="M17.5 14.8C19.6 15.5 21 16.9 21 19.2" {...s} />
    </svg>
  );
}

/** Sidebar: privileged users. */
export function KeyIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 17, props.className)}>
      <circle cx="8" cy="13.5" r="4" {...s} />
      <path d="M11 11L19.5 4.5M17.2 6.3L19 8.1M15.2 7.8L17 9.6" {...s} />
    </svg>
  );
}

/** Sidebar: mail relance console. */
export function MailStackIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 17, props.className)}>
      <rect x="3" y="6.5" width="18" height="13" rx="2.4" {...s} />
      <path d="M3.6 8L12 13.6L20.4 8" {...s} />
      <path d="M6.5 4H17.5" {...s} />
    </svg>
  );
}

/** Sidebar: settings. */
export function SlidersIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 17, props.className)}>
      <path d="M4 7.5H20M4 16.5H20" {...s} />
      <circle cx="9.5" cy="7.5" r="2.4" {...s} />
      <circle cx="15.5" cy="16.5" r="2.4" {...s} />
    </svg>
  );
}

/** Dashboard: overview grid. */
export function GridIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 17, props.className)}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" {...s} />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" {...s} />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" {...s} />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" {...s} />
    </svg>
  );
}

/** Search input glyph. */
export function SearchIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 15, props.className)}>
      <circle cx="10.8" cy="10.8" r="6.3" {...s} />
      <path d="M15.4 15.4L20 20" {...s} />
    </svg>
  );
}

/** Generic chevron, rotated through className when needed. */
export function ChevronRightIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 14, props.className)}>
      <path d="M9 5L16 12L9 19" {...s} />
    </svg>
  );
}

/** Small close cross for drawers and modals. */
export function CloseIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 14, props.className)}>
      <path d="M6 6L18 18M18 6L6 18" {...s} strokeWidth={props.strokeWidth ?? 1.8} />
    </svg>
  );
}

/** Toast: success. */
export function CheckCircleIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)}>
      <circle cx="12" cy="12" r="8.6" {...s} />
      <path d="M8.4 12.2L10.9 14.7L15.7 9.6" {...s} />
    </svg>
  );
}

/** Toast: error. */
export function AlertCircleIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)}>
      <circle cx="12" cy="12" r="8.6" {...s} />
      <path d="M12 7.8V12.6M12 15.8V15.9" {...s} />
    </svg>
  );
}

/** Toast: information. */
export function InfoCircleIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)}>
      <circle cx="12" cy="12" r="8.6" {...s} />
      <path d="M12 11.2V16.2M12 8.1V8.2" {...s} />
    </svg>
  );
}

/** Empty state placeholder glyph. */
export function InboxIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 26, props.className)}>
      <path
        d="M3.5 13.5L6.2 5.4C6.5 4.6 7.2 4 8.1 4H15.9C16.8 4 17.5 4.6 17.8 5.4L20.5 13.5"
        {...s}
      />
      <path
        d="M3.5 13.5H8.4L9.6 16H14.4L15.6 13.5H20.5V17.6C20.5 18.9 19.5 20 18.2 20H5.8C4.5 20 3.5 18.9 3.5 17.6V13.5Z"
        {...s}
      />
    </svg>
  );
}

/** Space switch: arrow leaving a frame. */
export function SwitchSpaceIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 14, props.className)}>
      <path
        d="M4 8.5V5.5C4 4.7 4.7 4 5.5 4H18.5C19.3 4 20 4.7 20 5.5V18.5C20 19.3 19.3 20 18.5 20H5.5C4.7 20 4 19.3 4 18.5V15.5"
        {...s}
      />
      <path d="M13 12H3M6.2 8.8L3 12L6.2 15.2" {...s} />
    </svg>
  );
}
