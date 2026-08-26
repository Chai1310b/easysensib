'use client';

/**
 * Participation history grouped by year. Each row expands on click to reveal
 * the full detail (date, time, format, location, trainer) and deep links.
 */
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ParticipationRecord } from '@/lib/types';
import { formatLongDate, formatYear } from '@/lib/format';
import { Card } from '@/components/Card';
import { DateBlock } from '@/components/DateBlock';
import { StatusPill } from '@/components/StatusPill';
import { LaptopIcon, PinIcon, VideoIcon } from '@/components/icons';

interface HistoryListProps {
  records: ParticipationRecord[];
}

interface YearGroup {
  year: string;
  records: ParticipationRecord[];
}

function groupByYear(records: ParticipationRecord[]): YearGroup[] {
  const groups: YearGroup[] = [];
  for (const record of records) {
    const year = formatYear(record.date);
    const group = groups.find((g) => g.year === year);
    if (group) group.records.push(record);
    else groups.push({ year, records: [record] });
  }
  return groups;
}

function SummaryDetail({ record }: { record: ParticipationRecord }) {
  const t = useTranslations('history');
  if (record.kind === 'elearning') {
    return (
      <div className="flex items-center gap-1.5">
        <LaptopIcon size={12} color="#8a8e96" strokeWidth={1.8} />
        <span className="text-xs text-ink-tertiary">{t('detail.elearningCertificate')}</span>
      </div>
    );
  }
  if (record.format === 'remote') {
    return (
      <div className="flex items-center gap-1.5">
        <VideoIcon size={12} color="#8a8e96" strokeWidth={1.8} />
        <span className="text-xs text-ink-tertiary">{t('detail.remote')}</span>
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
        <span className="text-xs text-ink-tertiary">
          {t('detail.trainer', { name: record.trainer })}
        </span>
      ) : null}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold tracking-[0.05em] text-ink-tertiary uppercase">
        {label}
      </span>
      <span className="text-[13px] font-medium text-ink">{value}</span>
    </div>
  );
}

function RecordRow({ record, isLast }: { record: ParticipationRecord; isLast: boolean }) {
  const t = useTranslations('history');
  const tCommon = useTranslations('common');
  const [open, setOpen] = useState(false);

  const statusPill =
    record.status === 'absent' ? (
      <StatusPill tone="danger" icon="cross">
        {t('status.absent')}
      </StatusPill>
    ) : (
      <StatusPill tone="success" icon="check">
        {t(record.status === 'certificate' ? 'status.certificate' : 'status.attended')}
      </StatusPill>
    );

  const formatLabel =
    record.kind === 'elearning'
      ? tCommon('mode.elearning')
      : record.format === 'remote'
        ? tCommon('session.remote')
        : tCommon('session.onsite');

  return (
    <div className={isLast ? '' : 'border-b border-divider'}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={t('expanded.toggle')}
        onClick={() => setOpen((v) => !v)}
        className="ui-row flex w-full cursor-pointer items-center gap-[18px] px-[22px] py-[18px] text-left hover:bg-card-muted"
      >
        <DateBlock date={record.date} width={52} daySize={21} />
        <div className="w-px self-stretch bg-divider" />
        <div className="flex grow flex-col gap-[3px]">
          <span className="text-[15px] font-semibold">{record.trainingName}</span>
          <SummaryDetail record={record} />
        </div>
        {statusPill}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 9L12 15L18 9"
            stroke="var(--color-ink-tertiary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`origin-center transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            style={{ transformBox: 'fill-box' }}
          />
        </svg>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-250 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="mx-[22px] mb-4 flex flex-col gap-4 rounded-xl bg-card-muted px-5 py-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              <DetailField label={t('expanded.date')} value={formatLongDate(record.date)} />
              {record.startTime && record.endTime ? (
                <DetailField
                  label={t('expanded.time')}
                  value={`${record.startTime} · ${record.endTime}`}
                />
              ) : null}
              <DetailField label={t('expanded.format')} value={formatLabel} />
              {record.location ? (
                <DetailField label={t('expanded.location')} value={record.location} />
              ) : null}
              {record.trainer ? (
                <DetailField label={t('expanded.trainerLabel')} value={record.trainer} />
              ) : null}
            </div>
            {(record.trainingId || record.status === 'certificate') && (
              <div className="flex items-center gap-4 border-t border-card-border pt-3">
                {record.trainingId ? (
                  <Link
                    href={`/trainings/${record.trainingId}`}
                    className="text-[13px] font-semibold"
                  >
                    {t('expanded.viewTraining')}
                  </Link>
                ) : null}
                {record.status === 'certificate' ? (
                  <Link href="/certificates" className="text-[13px] font-semibold">
                    {t('expanded.viewCertificate')}
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HistoryList({ records }: HistoryListProps) {
  const t = useTranslations('history');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const groups = groupByYear(records);
  const visibleGroups = yearFilter === 'all' ? groups : groups.filter((g) => g.year === yearFilter);

  const pill = (active: boolean) =>
    `ui-pressable cursor-pointer rounded-full px-3 py-[5px] text-xs font-medium transition-colors duration-150 ${
      active ? 'bg-ink text-page' : 'border border-card-border text-ink-secondary hover:bg-card'
    }`;

  return (
    <>
      <div className="flex items-end justify-between">
        <h1 className="m-0 font-display text-[26px] font-semibold">{t('title')}</h1>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setYearFilter('all')}
            className={pill(yearFilter === 'all')}
          >
            {t('filters.all')}
          </button>
          {groups.map((group) => (
            <button
              key={group.year}
              type="button"
              onClick={() => setYearFilter(group.year)}
              className={pill(yearFilter === group.year)}
            >
              {group.year}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {visibleGroups.map((group) => (
          <div key={group.year} className="flex flex-col gap-3.5">
            <span className="text-xs font-semibold tracking-[0.8px] text-ink-tertiary">
              {group.year}
            </span>
            <Card className="flex flex-col overflow-hidden">
              {group.records.map((record, index) => (
                <RecordRow
                  key={record.id}
                  record={record}
                  isLast={index === group.records.length - 1}
                />
              ))}
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}
