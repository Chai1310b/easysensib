/**
 * Inline stroke-based SVG icons used only by the session screens.
 * Same conventions as `src/components/admin/adminIcons.tsx`: 24x24 viewBox,
 * size and color driven by props. No icon library, no emoji.
 */
import type { SVGProps } from 'react';

export interface SessionIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

function svgProps(size: number, className?: string): SVGProps<SVGSVGElement> {
  return { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', className };
}

function stroke({ color = 'currentColor', strokeWidth = 1.6 }: SessionIconProps) {
  return {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

/** Onsite format: a building. */
export function BuildingIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <path d="M4 20h16" {...s} />
      <path d="M6 20V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15" {...s} />
      <path d="M14 20V10h3a1 1 0 0 1 1 1v9" {...s} />
      <path d="M9 8h2M9 12h2M9 16h2" {...s} />
    </svg>
  );
}

/** Remote format: a screen. */
export function ScreenIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="12" rx="1.6" {...s} />
      <path d="M9 20h6M12 16.5V20" {...s} />
    </svg>
  );
}

/** Hybrid format: a screen overlapping a place marker. */
export function HybridIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <rect x="2.5" y="5" width="12" height="9" rx="1.5" {...s} />
      <path d="M6 17.5h5" {...s} />
      <path d="M18 21c2-3.2 3-5.2 3-6.8A3 3 0 0 0 15 14.2c0 1.6 1 3.6 3 6.8Z" {...s} />
    </svg>
  );
}

/** Place marker. */
export function PinIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <path d="M12 21.5c3.4-5 5-8.1 5-10.6a5 5 0 0 0-10 0c0 2.5 1.6 5.6 5 10.6Z" {...s} />
      <circle cx="12" cy="10.7" r="2" {...s} />
    </svg>
  );
}

/** Clock, used for the slot. */
export function ClockIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" {...s} />
      <path d="M12 7.5V12l3 1.8" {...s} />
    </svg>
  );
}

/** Plus sign, used on creation actions. */
export function PlusIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <path d="M12 5v14M5 12h14" {...s} />
    </svg>
  );
}

/** Plus sign over a person, used to register a user. */
export function UserPlusIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <circle cx="9.5" cy="8" r="3.5" {...s} />
      <path d="M3.5 20c0-3 2.7-5.2 6-5.2s6 2.2 6 5.2" {...s} />
      <path d="M18.5 8.5v5M16 11h5" {...s} />
    </svg>
  );
}

/** Simple check, used on attendance toggles. */
export function CheckIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <path d="M5 12.5 9.5 17 19 7" {...s} />
    </svg>
  );
}

/** Crossed circle, used on the cancel action. */
export function BanIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" {...s} />
      <path d="M6.2 6.2l11.6 11.6" {...s} />
    </svg>
  );
}

/** Pencil, used on the edit action. */
export function PencilIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <path d="M4 20h4l10-10a2.1 2.1 0 0 0-3-3L5 17v3Z" {...s} />
      <path d="M14.5 6.5 17.5 9.5" {...s} />
    </svg>
  );
}

/** Circular arrows, used on the multiple creation shortcut. */
export function RepeatIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <path d="M4 9.5A5.5 5.5 0 0 1 9.5 4H18" {...s} />
      <path d="m15 1.5 3 2.5-3 2.5" {...s} />
      <path d="M20 14.5A5.5 5.5 0 0 1 14.5 20H6" {...s} />
      <path d="m9 22.5-3-2.5 3-2.5" {...s} />
    </svg>
  );
}

/** Tag, used on the free tags block. */
export function TagIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <path
        d="M11.2 3.5H4.5a1 1 0 0 0-1 1v6.7a2 2 0 0 0 .6 1.4l7 7a2 2 0 0 0 2.8 0l5.9-5.9a2 2 0 0 0 0-2.8l-7-7a2 2 0 0 0-1.6-.4Z"
        {...s}
      />
      <circle cx="8" cy="8" r="1.4" {...s} />
    </svg>
  );
}

/** Small cross, used to drop a tag. */
export function XIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 12, props.className)} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" {...s} />
    </svg>
  );
}

/** Group of people, used on participant counters. */
export function GroupIcon(props: SessionIconProps) {
  const s = stroke(props);
  return (
    <svg {...svgProps(props.size ?? 16, props.className)} aria-hidden="true">
      <circle cx="9" cy="8" r="3.4" {...s} />
      <path d="M3 19.5c0-3 2.7-5.2 6-5.2s6 2.2 6 5.2" {...s} />
      <path d="M16 5.2a3.4 3.4 0 0 1 0 6.4M17.5 14.6c2 .8 3.5 2.6 3.5 4.9" {...s} />
    </svg>
  );
}
