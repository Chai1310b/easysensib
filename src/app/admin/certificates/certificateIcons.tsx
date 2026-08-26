/**
 * Inline stroke SVG icons specific to the certificate review page.
 * Same conventions as `src/components/admin/adminIcons.tsx`: 24x24 viewBox,
 * size and color driven by props, no icon library.
 */
import type { AdminIconProps } from '@/components/admin/adminIcons';

function svgProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    className,
  } as const;
}

function stroke({ color = 'currentColor', strokeWidth = 1.6 }: AdminIconProps) {
  return {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

/** Uploaded file of type PDF. */
export function FileTextIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)}>
      <path
        d="M14 3H7.5A1.5 1.5 0 0 0 6 4.5v15A1.5 1.5 0 0 0 7.5 21h9a1.5 1.5 0 0 0 1.5-1.5V7l-4-4Z"
        {...s}
      />
      <path d="M14 3v4h4" {...s} />
      <path d="M9 12.5h6M9 16h4" {...s} />
    </svg>
  );
}

/** Uploaded file of type image (scan or photo). */
export function FileImageIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" {...s} />
      <circle cx="9" cy="10" r="1.6" {...s} />
      <path d="M4 17l4.5-4.5 3.5 3.5 2.5-2.5 5.5 5" {...s} />
    </svg>
  );
}

/** Opens the document preview. */
export function EyeIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...s} />
      <circle cx="12" cy="12" r="3" {...s} />
    </svg>
  );
}

/** Approve action. */
export function CheckIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 15, props.className)}>
      <path d="M5 12.5l4.5 4.5L19 7" {...s} strokeWidth={props.strokeWidth ?? 1.9} />
    </svg>
  );
}

/** Reject action. */
export function CrossIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 15, props.className)}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" {...s} strokeWidth={props.strokeWidth ?? 1.9} />
    </svg>
  );
}

/** Ageing badge glyph. */
export function ClockIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 13, props.className)}>
      <circle cx="12" cy="12" r="8.5" {...s} />
      <path d="M12 7.5V12l3 1.8" {...s} />
    </svg>
  );
}

/** Chevron of the collapsible "processed" section. */
export function ChevronDownIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 14, props.className)}>
      <path d="M6 9.5l6 6 6-6" {...s} />
    </svg>
  );
}

/** History glyph of the processed section header. */
export function ArchiveIcon(props: AdminIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)}>
      <rect x="3.5" y="4.5" width="17" height="4" rx="1.2" {...s} />
      <path d="M5 8.5v9A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5v-9" {...s} />
      <path d="M10 12h4" {...s} />
    </svg>
  );
}
