'use client';

/**
 * Month calendar view of the sessions list. Respects the same filters as the
 * table view (the caller passes the already-filtered sessions).
 */
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { AdminSession } from '@/lib/admin-types';
import { seatsLeft } from './sessionUtils';

interface SessionsCalendarProps {
  sessions: AdminSession[];
  /** ISO date of the reference day (highlighted). */
  today: string;
}

interface DayCell {
  iso: string;
  dayNumber: number;
  inMonth: boolean;
}

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

/** Builds the 5-6 weeks (Monday first) covering the given month. */
function buildWeeks(year: number, month: number): DayCell[][] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month, 1 - startOffset);
  const weeks: DayCell[][] = [];
  const cursor = new Date(start);
  do {
    const week: DayCell[] = [];
    for (let i = 0; i < 7; i += 1) {
      week.push({
        iso: toIso(cursor),
        dayNumber: cursor.getDate(),
        inMonth: cursor.getMonth() === month,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  } while (cursor.getMonth() === month);
  return weeks;
}

const STATUS_CHIP: Record<AdminSession['status'], string> = {
  planned: 'border-accent-border bg-accent-tint text-accent',
  done: 'border-card-border bg-card-muted text-ink-secondary',
  cancelled: 'border-danger-tint bg-danger-tint text-danger-text line-through',
};

export function SessionsCalendar({ sessions, today }: SessionsCalendarProps) {
  const t = useTranslations('adminSessions');
  const locale = useLocale();
  const router = useRouter();

  const [year, setYear] = useState(() => Number(today.slice(0, 4)));
  const [month, setMonth] = useState(() => Number(today.slice(5, 7)) - 1);

  const weeks = useMemo(() => buildWeeks(year, month), [year, month]);
  const byDay = useMemo(() => {
    const map = new Map<string, AdminSession[]>();
    for (const session of sessions) {
      const list = map.get(session.date) ?? [];
      list.push(session);
      map.set(session.date, list);
    }
    return map;
  }, [sessions]);

  const monthLabel = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1));

  const weekdayFormat = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'short',
  });
  const weekdays = weeks[0].map((cell) => {
    const [y, m, d] = cell.iso.split('-').map(Number);
    return weekdayFormat.format(new Date(y, m - 1, d));
  });

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  const monthHasSessions = weeks.some((week) =>
    week.some((cell) => cell.inMonth && (byDay.get(cell.iso)?.length ?? 0) > 0),
  );

  const navButton =
    'ui-pressable flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-card-border text-ink-secondary transition-colors duration-150 hover:bg-card-muted';

  return (
    <div className="ui-card flex flex-col overflow-hidden rounded-xl border border-card-border bg-card">
      <div className="flex items-center justify-between border-b border-divider px-4 py-3">
        <span className="font-display text-[15px] font-semibold text-ink capitalize">
          {monthLabel}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="ui-pressable h-8 cursor-pointer rounded-lg border border-card-border px-3 text-[12px] font-medium text-ink-secondary transition-colors duration-150 hover:bg-card-muted"
            onClick={() => {
              setYear(Number(today.slice(0, 4)));
              setMonth(Number(today.slice(5, 7)) - 1);
            }}
          >
            {t('calendar.today')}
          </button>
          <button
            type="button"
            aria-label={t('calendar.prev')}
            className={navButton}
            onClick={() => shiftMonth(-1)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M14 6L8 12L14 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label={t('calendar.next')}
            className={navButton}
            onClick={() => shiftMonth(1)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M10 6L16 12L10 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-divider bg-card-muted">
        {weekdays.map((weekday) => (
          <span
            key={weekday}
            className="px-2 py-2 text-center text-[11px] font-semibold tracking-[0.05em] text-ink-tertiary uppercase"
          >
            {weekday}
          </span>
        ))}
      </div>

      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 border-b border-divider last:border-b-0">
          {week.map((cell) => {
            const daySessions = byDay.get(cell.iso) ?? [];
            const isToday = cell.iso === today;
            return (
              <div
                key={cell.iso}
                className={`flex min-h-[92px] flex-col gap-1 border-r border-divider p-1.5 last:border-r-0 ${
                  cell.inMonth ? '' : 'bg-card-muted/60'
                }`}
              >
                <span
                  className={`self-end text-[11px] font-medium ${
                    isToday
                      ? 'flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white'
                      : cell.inMonth
                        ? 'text-ink-secondary'
                        : 'text-ink-disabled'
                  }`}
                >
                  {cell.dayNumber}
                </span>
                {daySessions.map((session) => {
                  const left = seatsLeft(session.registered, session.capacity);
                  return (
                    <button
                      key={session.id}
                      type="button"
                      title={`${session.trainingNames.join(', ')} · ${session.startTime} · ${session.site}`}
                      onClick={() => router.push(`/admin/sessions/${session.id}`)}
                      className={`ui-pressable w-full cursor-pointer truncate rounded-md border px-1.5 py-1 text-left text-[10.5px] leading-tight font-medium transition-colors duration-150 hover:brightness-95 ${STATUS_CHIP[session.status]}`}
                    >
                      <span className="font-semibold">{session.startTime}</span>{' '}
                      {session.trainingNames[0]}
                      {session.status === 'planned' && left === 0 ? ' · ✕' : ''}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}

      {!monthHasSessions ? (
        <p className="px-4 py-6 text-center text-[13px] text-ink-tertiary">{t('calendar.empty')}</p>
      ) : null}
    </div>
  );
}
