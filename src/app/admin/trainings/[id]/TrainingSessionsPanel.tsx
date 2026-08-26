import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { CSSProperties } from 'react';
import { EmptyState } from '@/components/admin';
import { ChevronRightIcon } from '@/components/admin/adminIcons';
import { BuildingIcon, ClockIcon, LaptopIcon, PinIcon } from '@/components/icons';
import { formatDayNumber, formatMonthAbbr, formatYear } from '@/lib/format';
import type { AdminSession, SessionStatus } from '@/lib/admin-types';

const STATUS_STYLE: Record<SessionStatus, string> = {
  planned: 'bg-accent-tint text-accent',
  done: 'bg-success-tint text-success',
  cancelled: 'bg-danger-tint text-danger-text',
};

/** Fill bar colour follows the same reading as the user-side gauges. */
function fillColor(ratio: number): string {
  if (ratio >= 0.85) return 'bg-gauge-success';
  if (ratio >= 0.5) return 'bg-gauge-warning';
  return 'bg-gauge-danger';
}

/** Sessions carrying this training, soonest first. */
export async function TrainingSessionsPanel({ sessions }: { sessions: AdminSession[] }) {
  const [t, tCommon] = await Promise.all([
    getTranslations('adminTrainings'),
    getTranslations('adminCommon'),
  ]);

  if (sessions.length === 0) {
    return <EmptyState title={t('sessions.empty')} description={t('sessions.emptyHint')} />;
  }

  return (
    <section className="rounded-xl border border-card-border bg-card">
      <header className="flex items-center justify-between border-b border-divider px-5 py-3.5">
        <h2 className="font-display text-[15px] font-semibold text-ink">{t('sessions.title')}</h2>
        <span className="font-display text-[12.5px] tabular-nums text-ink-tertiary">
          {sessions.length}
        </span>
      </header>

      <ul className="flex flex-col p-2.5">
        {sessions.map((session, index) => {
          const ratio = session.capacity === 0 ? 0 : session.registered / session.capacity;
          const percent = Math.min(100, Math.round(ratio * 100));

          return (
            <li
              key={session.id}
              className="ui-stagger"
              style={{ '--ui-index': Math.min(index, 12) } as CSSProperties}
            >
              <Link
                href={`/admin/sessions/${session.id}`}
                className="ui-row flex items-center gap-4 rounded-lg px-2.5 py-3 text-ink! transition-colors duration-150 hover:bg-card-muted hover:text-ink!"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg ${
                    session.status === 'cancelled' ? 'bg-danger-tint' : 'bg-accent-tint'
                  }`}
                >
                  <span
                    className={`font-display text-[16px] leading-none font-semibold ${
                      session.status === 'cancelled' ? 'text-danger-text' : 'text-accent'
                    }`}
                  >
                    {formatDayNumber(session.date)}
                  </span>
                  <span
                    className={`mt-0.5 text-[9px] font-semibold tracking-[0.06em] ${
                      session.status === 'cancelled' ? 'text-danger-text' : 'text-accent'
                    }`}
                  >
                    {formatMonthAbbr(session.date)}
                  </span>
                </span>

                <span className="flex min-w-0 grow flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-medium">
                      {formatDayNumber(session.date)} {formatMonthAbbr(session.date).toLowerCase()}{' '}
                      {formatYear(session.date)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[session.status]}`}
                    >
                      {tCommon(`status.${session.status}`)}
                    </span>
                  </span>

                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-tertiary">
                    <span className="flex items-center gap-1">
                      <ClockIcon size={12} />
                      {session.startTime} · {session.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      {session.format === 'remote' ? (
                        <LaptopIcon size={12} color="#8a8e96" />
                      ) : (
                        <PinIcon size={12} />
                      )}
                      {session.site} · {tCommon(`format.${session.format}`)}
                    </span>
                    {session.location ? (
                      <span className="flex items-center gap-1">
                        <BuildingIcon size={12} />
                        {session.location.building} · {session.location.room}
                      </span>
                    ) : null}
                    <span>
                      {t('sessions.trainer')} : {session.trainerName}
                    </span>
                  </span>
                </span>

                <span className="flex w-[104px] shrink-0 flex-col items-end gap-1.5">
                  <span className="font-display text-[13px] font-medium tabular-nums text-ink">
                    {t('sessions.seats', {
                      registered: session.registered,
                      capacity: session.capacity,
                    })}
                  </span>
                  <span className="h-1.5 w-full overflow-hidden rounded-full bg-gauge-neutral-track">
                    <span
                      className={`block h-full rounded-full ${fillColor(ratio)}`}
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="text-[10.5px] text-ink-tertiary">
                    {t('sessions.seatsLabel')}
                  </span>
                </span>

                <span className="shrink-0 text-ink-disabled">
                  <ChevronRightIcon size={13} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
