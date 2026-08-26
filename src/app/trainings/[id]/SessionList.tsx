'use client';

/**
 * Session list of the registration page: site filter pills, sessions grouped
 * by month, one registration button per open slot (primary on the closest one).
 */
import { Fragment, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SessionSlot } from '@/lib/types';
import { formatMonthUpper } from '@/lib/format';
import { DateBlock } from '@/components/DateBlock';
import { InfoItem } from '@/components/InfoItem';
import { MailIcon } from '@/components/icons';

interface SessionListProps {
  sessions: SessionSlot[];
  /** Home site of the current user, used as the default filter. */
  userSite: string;
}

type SiteFilter = 'site' | 'all';

function isOpen(session: SessionSlot): boolean {
  return session.seatsLeft !== null && !session.isRegistered;
}

export function SessionList({ sessions, userSite }: SessionListProps) {
  const t = useTranslations('training');
  const tCommon = useTranslations('common');
  const [filter, setFilter] = useState<SiteFilter>('site');

  const visibleSessions = useMemo(
    () => (filter === 'site' ? sessions.filter((s) => s.site === userSite) : sessions),
    [sessions, filter, userSite],
  );

  const primarySessionId = visibleSessions.find(isOpen)?.id;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold">
          {t('sessionsAvailable', { count: visibleSessions.length })}
        </h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('site')}
            className={`rounded-full px-3 py-[5px] text-xs font-medium ${
              filter === 'site'
                ? 'bg-ink text-page'
                : 'border border-card-border text-ink-secondary'
            }`}
          >
            {userSite}
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-full px-3 py-[5px] text-xs font-medium ${
              filter === 'all' ? 'bg-ink text-page' : 'border border-card-border text-ink-secondary'
            }`}
          >
            {t('allSites')}
          </button>
        </div>
      </div>

      {visibleSessions.map((session, index) => {
        const previous = visibleSessions[index - 1];
        const showMonth = !previous || previous.date.slice(0, 7) !== session.date.slice(0, 7);
        const full = session.seatsLeft === null;

        return (
          <Fragment key={session.id}>
            {showMonth && (
              <span className="text-xs font-semibold tracking-[0.8px] text-ink-tertiary">
                {formatMonthUpper(session.date)}
              </span>
            )}
            <div
              className={`flex items-center gap-5 rounded-xl border border-card-border px-[22px] py-[18px] ${
                full ? 'bg-card-muted opacity-70' : 'bg-card'
              }`}
            >
              <DateBlock
                date={session.date}
                width={52}
                daySize={24}
                tone={full ? 'muted' : 'default'}
              />
              <div className="w-px self-stretch bg-divider" />
              <div className="flex grow items-center gap-[18px] whitespace-nowrap">
                <InfoItem icon="clock" tone={full ? 'muted' : 'default'}>
                  {session.startTime} · {session.endTime}
                </InfoItem>
                {session.location && (
                  <InfoItem icon="pin" tone={full ? 'muted' : 'default'}>
                    {session.location.building}, {session.location.room}
                  </InfoItem>
                )}
                {!full && (
                  <InfoItem icon={session.format === 'onsite' ? 'building' : 'video'}>
                    {tCommon(session.format === 'onsite' ? 'session.onsite' : 'session.remote')}
                  </InfoItem>
                )}
                {!full && session.seatsLeft !== null && (
                  <InfoItem icon="people" tone="success">
                    {tCommon('session.seats', { count: session.seatsLeft })}
                  </InfoItem>
                )}
              </div>
              {full ? (
                <span className="shrink-0 text-[13px] font-semibold text-danger-text">
                  {tCommon('session.full')}
                </span>
              ) : session.isRegistered ? (
                <span className="shrink-0 text-[13px] font-semibold text-accent">
                  {tCommon('session.registered')}
                </span>
              ) : (
                <button
                  type="button"
                  className={`flex h-11 shrink-0 items-center rounded-lg px-5 text-sm font-semibold ${
                    session.id === primarySessionId
                      ? 'bg-accent text-white hover:bg-accent-hover'
                      : 'border border-btn-outline bg-card text-ink'
                  }`}
                >
                  {tCommon('actions.register')}
                </button>
              )}
            </div>
          </Fragment>
        );
      })}

      <div className="flex items-center gap-2.5 p-1">
        <MailIcon size={15} />
        <span className="text-xs text-ink-tertiary">{t('mailNote')}</span>
      </div>
    </div>
  );
}
