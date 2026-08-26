import type { ButtonHTMLAttributes } from 'react';
import { CalendarPlusIcon, CrossIcon, DownloadIcon } from './icons';

type IconButtonIcon = 'calendarPlus' | 'cross' | 'download';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconButtonIcon;
  /** Accessible label (aria-label), already translated. */
  label: string;
  /** Blue-tinted border variant used inside selected session rows. */
  accentBorder?: boolean;
}

/** 36x36 bordered icon button, 8px radius. */
export function IconButton({ icon, label, accentBorder = false, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border bg-card ${
        accentBorder ? 'border-accent-border' : 'border-card-border'
      }`}
      {...rest}
    >
      {icon === 'calendarPlus' && <CalendarPlusIcon size={16} />}
      {icon === 'cross' && <CrossIcon size={14} />}
      {icon === 'download' && <DownloadIcon size={16} />}
    </button>
  );
}
