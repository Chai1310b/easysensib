import { useTranslations } from 'next-intl';
import { CalendarIcon, LaptopIcon } from './icons';

interface ModeTagProps {
  mode: 'session' | 'elearning';
}

/**
 * 11px validation-mode tag: gray "Session" with a calendar icon,
 * blue-tinted "E-learning" with a laptop icon.
 */
export function ModeTag({ mode }: ModeTagProps) {
  const t = useTranslations('common');

  if (mode === 'session') {
    return (
      <span className="flex items-center gap-[5px] rounded px-2 py-[3px] text-[11px] font-semibold text-ink-secondary bg-btn-secondary">
        <CalendarIcon size={11} color="#5c6068" strokeWidth={1.8} />
        {t('mode.session')}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-[5px] rounded px-2 py-[3px] text-[11px] font-semibold text-accent bg-accent-tint">
      <LaptopIcon size={11} color="#2b3fbf" strokeWidth={1.8} />
      {t('mode.elearning')}
    </span>
  );
}
