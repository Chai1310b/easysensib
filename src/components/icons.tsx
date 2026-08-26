/**
 * Inline stroke-based SVG icons copied from the mockups.
 * One component per icon; sized and colored via props (no icon library).
 */
import type { SVGProps } from 'react';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

function svgProps(size: number, className?: string): SVGProps<SVGSVGElement> {
  return { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', className };
}

/** App logo: shield with an accent check. */
export function ShieldLogoIcon({
  size = 24,
  color = '#f4f5f1',
  accentColor = '#8fa0ff',
  strokeWidth = 1.6,
  className,
}: IconProps & { accentColor?: string }) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M12 2L20 6V12C20 17 16.5 20.5 12 22C7.5 20.5 4 17 4 12V6L12 2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12L11 14.5L15.5 9.5"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PencilIcon({
  size = 13,
  color = '#ffffff',
  strokeWidth = 1.8,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M4 20L5 16L16 5L19 8L8 19L4 20Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CalendarIcon({
  size = 14,
  color = '#8a8e96',
  strokeWidth = 1.8,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M4 9H20M8 3V6M16 3V6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CalendarPlusIcon({
  size = 16,
  color = '#5c6068',
  strokeWidth = 1.7,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M4 9H20M8 3V6M16 3V6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path d="M12 12V18M9 15H15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon({ size = 13, color = '#ffffff', strokeWidth = 2, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M5 12L10 17L19 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CrossIcon({
  size = 14,
  color = '#8a8e96',
  strokeWidth = 1.8,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ClockIcon({
  size = 14,
  color = '#8a8e96',
  strokeWidth = 1.7,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={strokeWidth} />
      <path d="M12 8V12L14.5 13.8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function PinIcon({ size = 14, color = '#8a8e96', strokeWidth = 1.7, className }: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M12 21C16 17 19 13.5 19 10A7 7 0 0 0 5 10C5 13.5 8 17 12 21Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function BuildingIcon({
  size = 14,
  color = '#8a8e96',
  strokeWidth = 1.7,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <rect x="5" y="4" width="10" height="16" stroke={color} strokeWidth={strokeWidth} />
      <path d="M15 9H19V20H15" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path
        d="M8 8H11M8 12H11M8 16H11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VideoIcon({
  size = 14,
  color = '#8a8e96',
  strokeWidth = 1.7,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <rect x="3" y="7" width="13" height="10" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M16 10.5L21 8.5V15.5L16 13.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PeopleIcon({
  size = 14,
  color = '#2f7d4f',
  strokeWidth = 1.7,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <circle cx="9" cy="8" r="3" stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M4 19C4.8 16 6.7 14.5 9 14.5C11.3 14.5 13.2 16 14 19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <circle cx="16.5" cy="9" r="2.3" stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M15.5 14.6C17.5 15 19 16.4 19.5 18.8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LaptopIcon({
  size = 12,
  color = '#2b3fbf',
  strokeWidth = 1.8,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <rect x="3" y="5" width="18" height="12" rx="2" stroke={color} strokeWidth={strokeWidth} />
      <path d="M8 21H16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function DownloadIcon({
  size = 16,
  color = '#5c6068',
  strokeWidth = 1.8,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M12 4V15M12 15L8 11M12 15L16 11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 19H19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function UploadIcon({
  size = 26,
  color = '#2b3fbf',
  strokeWidth = 1.8,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M12 15V4M12 4L8 8M12 4L16 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 15V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronLeftIcon({
  size = 14,
  color = '#5c6068',
  strokeWidth = 2,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M14 6L8 12L14 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon({
  size = 15,
  color = '#8a8e96',
  strokeWidth = 1.6,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M4 7C4 5.9 4.9 5 6 5H18C19.1 5 20 5.9 20 7V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V7Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d="M4 8L12 13L20 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FileIcon({
  size = 20,
  color = '#5c6068',
  strokeWidth = 1.7,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M6 3H15L19 7V19C19 20.1 18.1 21 17 21H6C4.9 21 4 20.1 4 19V5C4 3.9 4.9 3 6 3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path d="M14 3V8H19" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </svg>
  );
}

export function FileCheckIcon({
  size = 16,
  color = '#5c6068',
  strokeWidth = 1.7,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M6 3H15L19 7V19C19 20.1 18.1 21 17 21H6C4.9 21 4 20.1 4 19V5C4 3.9 4.9 3 6 3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M9 13L11 15L15 11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExclamationIcon({
  size = 24,
  color = '#b8362f',
  strokeWidth = 1.9,
  className,
}: IconProps) {
  return (
    <svg {...svgProps(size, className)}>
      <path
        d="M12 7V13M12 16.5V16.6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
