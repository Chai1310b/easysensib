import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/Card';
import { DateBlock } from '@/components/DateBlock';
import { StatusPill } from '@/components/StatusPill';
import { ChevronLeftIcon, LaptopIcon, PinIcon, VideoIcon } from '@/components/icons';
import { formatYear } from '@/lib/format';
import type { ParticipationRecord } from '@/lib/types';
import { getParticipationHistory } from '@/services/history';

/** Groups records by year, keeping the incoming order (most recent first). */
function groupByYear(
  records: ParticipationRecord[],
): { year: string; records: ParticipationRecord[] }[] {
  const groups: { year: string; records: ParticipationRecord[] }[] = [];
  for (const record of records) {
    const year = formatYear(record.date);
    const group = groups.find((g) => g.year === year);
    if (group) {
      group.records.push(record);
    } else {
      groups.push({ year, records: [record] });
    }
  }
  return groups;
}

function RecordDetail({
  record,
  labels,
}: {
  record: ParticipationRecord;
  labels: { elearningCertificate: string; trainer: (name: string) => string; remote: string };
}) {
  if (record.kind === 'elearning') {
    return (
      <div className="flex items-center gap-1.5">
        <LaptopIcon size={12} color="#8a8e96" strokeWidth={1.8} />
        <span className="text-xs text-ink-tertiary">{labels.elearningCertificate}</span>
      </div>
    );
  }

  if (record.format === 'remote') {
    return (
      <div className="flex items-center gap-1.5">
        <VideoIcon size={12} color="#8a8e96" strokeWidth={1.8} />
        <span className="text-xs text-ink-tertiary">{labels.remote}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {record.location ? (
        <div className="flex items-center gap-1.5">
          <PinIcon size={12} color="#8a8e96" strokeWidth={1.8} />
          <span className="text-xs text-ink-tertiary">{record.location}</span>
        </div>
      ) : null}
      {record.trainer ? (
        <span className="text-xs text-ink-tertiary">{labels.trainer(record.trainer)}</span>
      ) : null}
    </div>
  );
}

export default async function HistoryPage() {
  const [t, tCommon, records] = await Promise.all([
    getTranslations('history'),
    getTranslations('common'),
    getParticipationHistory(),
  ]);

  const groups = groupByYear(records);
  const detailLabels = {
    elearningCertificate: t('detail.elearningCertificate'),
    trainer: (name: string) => t('detail.trainer', { name }),
    remote: t('detail.remote'),
  };

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 self-center px-5 pt-8 pb-14">
      <Link
        href="/"
        className="flex items-center gap-2 text-[13px] font-medium text-ink-secondary hover:text-ink"
      >
        <ChevronLeftIcon size={14} color="#5c6068" />
        {tCommon('actions.backToHome')}
      </Link>

      <div className="flex items-end justify-between">
        <h1 className="m-0 font-display text-[26px] font-semibold">{t('title')}</h1>
        <div className="flex gap-1.5">
          <span className="rounded-full bg-ink px-3 py-[5px] text-xs font-medium text-page">
            {t('filters.all')}
          </span>
          {groups.map((group) => (
            <span
              key={group.year}
              className="rounded-full border border-card-border px-3 py-[5px] text-xs font-medium text-ink-secondary"
            >
              {group.year}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {groups.map((group) => (
          <div key={group.year} className="flex flex-col gap-3.5">
            <span className="text-xs font-semibold tracking-[0.8px] text-ink-tertiary">
              {group.year}
            </span>
            <Card className="flex flex-col">
              {group.records.map((record, index) => (
                <div
                  key={record.id}
                  className={`flex items-center gap-[18px] px-[22px] py-[18px] ${
                    index < group.records.length - 1 ? 'border-b border-divider' : ''
                  }`}
                >
                  <DateBlock date={record.date} width={52} daySize={21} />
                  <div className="w-px self-stretch bg-divider" />
                  <div className="flex grow flex-col gap-[3px]">
                    <span className="text-[15px] font-semibold">{record.trainingName}</span>
                    <RecordDetail record={record} labels={detailLabels} />
                  </div>
                  {record.status === 'absent' ? (
                    <StatusPill tone="danger" icon="cross">
                      {t('status.absent')}
                    </StatusPill>
                  ) : (
                    <StatusPill tone="success" icon="check">
                      {t(
                        record.status === 'certificate' ? 'status.certificate' : 'status.attended',
                      )}
                    </StatusPill>
                  )}
                </div>
              ))}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
