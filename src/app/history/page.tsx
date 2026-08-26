import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ChevronLeftIcon } from '@/components/icons';
import { getParticipationHistory } from '@/services/history';
import { HistoryList } from './HistoryList';

export default async function HistoryPage() {
  const [tCommon, records] = await Promise.all([
    getTranslations('common'),
    getParticipationHistory(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 self-center px-5 pt-8 pb-14">
      <Link
        href="/"
        className="flex items-center gap-2 text-[13px] font-medium text-ink-secondary hover:text-ink"
      >
        <ChevronLeftIcon size={14} color="#5c6068" />
        {tCommon('actions.backToHome')}
      </Link>

      <HistoryList records={records} />
    </div>
  );
}
