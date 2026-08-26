'use client';

/**
 * Session list of the training page: site and format filters, sessions grouped
 * by month, an occupancy gauge per slot and one registration button per open slot.
 */
import { Fragment, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SessionSlot } from '@/lib/types';
import { formatMonthUpper } from '@/lib/format';
import { DateBlock } from '@/components/DateBlock';
import { InfoItem } from '@/components/InfoItem';

interface SessionListProps {
  sessions: SessionSlot[];
  /** Home site of the current user, used as the default filter. */
  userSite: string;
}

type SiteFilter = 'site' | 'all';
type FormatFilter = 'all' | 'onsite' | 'remote';

/** Colored fill bar showing how full a slot is. */
function SeatsGauge({ session, label }: { session: SessionSlot; label: string }) {
  const capacity = session.capacity ?? 12;
  const left = session.seatsLeft ?? 0;
  const taken = Math.max(0, capacity - left);
  const percent = Math.min(100, Math.round((taken / capacity) * 100));
  const lowSeats = left > 0 && left <= Math.ceil(capacity * 0.25);
  const color =
    left === 0
      ? 'var(--color-gauge-danger)'
      : lowSeats
        ? 'var(--color-gauge-warning)'
        : 'var(--color-gauge-success)';

  return (
    <div className="flex w-[132px] shrink-0 flex-col gap-1.5">
      <span
        className={`text-[11.5px] font-semibold ${
          left === 0 ? 'text-danger-text' : lowSeats ? 'text-warning-text' : 'text-success'
        }`}
      >
        {label}
      </span>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-gauge-neutral-track">
        <div
          className="rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function SessionList({ sessions, userSite }: SessionListProps) {
  const t = useTranslations('training');
  const tCommon = useTranslations('common');
  const [siteFilter, setSiteFilter] = useState<SiteFilter>('site');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');

  const visibleSessions = useMemo(
    () =>
      sessions
        .filter((s) => (siteFilter === 'site' ? s.site === userSite : true))
        .filter((s) => (formatFilter === 'all' ? true : s.format === formatFilter)),
    [sessions, siteFilter, formatFilter, userSite],
  );

  const pill = (active: boolean) =>
    `ui-pressable cursor-pointer rounded-full px-3 py-[5px] text-xs font-medium transition-colors duration-150 ${
      active ? 'bg-ink text-page' : 'border border-card-border text-ink-secondary hover:bg-card'
    }`;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[17px] font-semibold">
          {t('sessionsAvailable', { count: visibleSessions.length })}
        </h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSiteFilter('site')}
            className={pill(siteFilter === 'site')}
          >
            {userSite}
          </button>
          <button
            type="button"
            onClick={() => setSiteFilter('all')}
            className={pill(siteFilter === 'all')}
          >
            {t('allSites')}
          </button>
          <span className="mx-1 h-4 w-px bg-card-border" aria-hidden />
          <button
            type="button"
            onClick={() => setFormatFilter('all')}
            className={pill(formatFilter === 'all')}
          >
            {t('allFormats')}
          </button>
          <button
            type="button"
            onClick={() => setFormatFilter('onsite')}
            className={pill(formatFilter === 'onsite')}
          >
            {tCommon('session.onsite')}
          </button>
          <button
            type="button"
            onClick={() => setFormatFilter('remote')}
            className={pill(formatFilter === 'remote')}
          >
            {tCommon('session.remote')}
          </button>
        </div>
      </div>

      {visibleSessions.map((session, index) => {
        const previous = visibleSessions[index - 1];
        const showMonth = !previous || previous.date.slice(0, 7) !== session.date.slice(0, 7);
        const full = session.seatsLeft === null;
        const capacity = session.capacity ?? 12;

        return (
          <Fragment key={session.id}>
            {showMonth && (
              <span className="text-xs font-semibold tracking-[0.8px] text-ink-tertiary">
                {formatMonthUpper(session.date)}
              </span>
            )}
            <div
              className={`ui-card flex items-center gap-5 rounded-xl border px-5 py-4 transition-shadow duration-200 ${
                session.isRegistered
                  ? 'border-accent-border bg-accent-surface'
                  : full
                    ? 'border-card-border bg-card-muted opacity-70'
                    : 'border-card-border bg-card'
              }`}
            >
              <DateBlock
                date={session.date}
                width={52}
                daySize={24}
                tone={full ? 'muted' : session.isRegistered ? 'accent' : 'default'}
              />
              <div className="w-px self-stretch bg-divider" />
              <div className="flex min-w-0 grow flex-col gap-1.5">
                <div className="flex items-center gap-4 whitespace-nowrap">
                  <InfoItem icon="clock" tone={full ? 'muted' : 'default'}>
                    {session.startTime} · {session.endTime}
                  </InfoItem>
                  <InfoItem
                    icon={session.format === 'onsite' ? 'building' : 'video'}
                    tone={full ? 'muted' : 'default'}
                  >
                    {tCommon(session.format === 'onsite' ? 'session.onsite' : 'session.remote')}
                  </InfoItem>
                </div>
                <InfoItem icon="pin" tone={full ? 'muted' : 'default'}>
                  {session.location
                    ? `${session.site} · ${session.location.building}, ${session.location.room}`
                    : session.site}
                </InfoItem>
              </div>

              <SeatsGauge
                session={session}
                label={
                  full
                    ? tCommon('session.full')
                    : t('seatsGauge', { left: session.seatsLeft ?? 0, total: capacity })
                }
              />

              {full ? null : session.isRegistered ? (
                <span className="w-24 shrink-0 text-right text-[13px] font-semibold text-accent">
                  {tCommon('session.registered')}
                </span>
              ) : (
                <button
                  type="button"
                  className="ui-pressable flex h-11 w-24 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-accent text-sm font-semibold text-white transition-colors duration-150 hover:bg-accent-hover"
                >
                  {tCommon('actions.register')}
                </button>
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
