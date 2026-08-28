import type { ReactNode } from 'react';
import { BuildingIcon, CalendarIcon, ClockIcon, PeopleIcon, PinIcon, VideoIcon } from './icons';

type InfoIconName = 'clock' | 'pin' | 'building' | 'video' | 'people' | 'calendar';

interface InfoItemProps {
  icon: InfoIconName;
  /** 'success' = green (seats), 'accent' = blue, 'muted' = gray text (full session). */
  tone?: 'default' | 'success' | 'accent' | 'muted';
  children: ReactNode;
}

const ICONS: Record<InfoIconName, (color: string) => ReactNode> = {
  clock: (c) => <ClockIcon size={14} color={c} />,
  pin: (c) => <PinIcon size={14} color={c} />,
  building: (c) => <BuildingIcon size={14} color={c} />,
  video: (c) => <VideoIcon size={14} color={c} />,
  people: (c) => <PeopleIcon size={14} color={c} />,
  calendar: (c) => <CalendarIcon size={14} color={c} strokeWidth={1.7} />,
};

const TEXT: Record<NonNullable<InfoItemProps['tone']>, { text: string; icon: string }> = {
  default: { text: 'font-medium text-ink', icon: '#8a8e96' },
  success: { text: 'font-semibold text-success', icon: '#2f7d4f' },
  accent: { text: 'font-semibold text-accent', icon: '#0816a1' },
  muted: { text: 'font-medium text-ink-tertiary', icon: '#8a8e96' },
};

/** 13px icon + value pair (time, place, format, seats). */
export function InfoItem({ icon, tone = 'default', children }: InfoItemProps) {
  const style = TEXT[tone];

  return (
    <div className="flex items-center gap-1.5">
      {ICONS[icon](style.icon)}
      <span className={`text-[13px] ${style.text}`}>{children}</span>
    </div>
  );
}
