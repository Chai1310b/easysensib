'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type CSSProperties } from 'react';
import { FilterChips, SearchInput, Table, TableEmptyRow, Td, Th } from '@/components/admin';
import type { AdminSession, SessionFormat, Site } from '@/lib/admin-types';
import { formatLongDate } from '@/lib/format';
import { SelectInput } from './formFields';
import { Chip, DateBadge, FormatBadge, SeatsCell, SessionStatusPill } from './sessionUi';
import { seatsLeft } from './sessionUtils';

type Period = 'all' | 'upcoming' | 'past' | 'cancelled';
type SortKey = 'date' | 'seats';

const FORMATS: SessionFormat[] = ['onsite', 'remote', 'hybrid'];
const MAX_VISIBLE_TAGS = 2;

interface SessionsViewProps {
  sessions: AdminSession[];
  sites: Site[];
  /** ISO date used to split upcoming sessions from past ones. */
  today: string;
}

function periodOf(session: AdminSession, today: string): Exclude<Period, 'all'> {
  if (session.status === 'cancelled') return 'cancelled';
  return session.date >= today ? 'upcoming' : 'past';
}

/** Filterable and sortable list of every session. */
export function SessionsView({ sessions, sites, today }: SessionsViewProps) {
  const t = useTranslations('adminSessions');
  const tCommon = useTranslations('adminCommon');
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<Period>('upcoming');
  const [site, setSite] = useState('');
  const [format, setFormat] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(true);

  const periodCounts = useMemo(() => {
    const counts = { all: sessions.length, upcoming: 0, past: 0, cancelled: 0 };
    for (const session of sessions) counts[periodOf(session, today)] += 1;
    return counts;
  }, [sessions, today]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    const filtered = sessions.filter((session) => {
      if (period !== 'all' && periodOf(session, today) !== period) return false;
      if (site && session.site !== site) return false;
      if (format && session.format !== format) return false;
      if (needle) {
        const haystack = [
          ...session.trainingNames,
          ...session.tags,
          session.trainerName,
          session.site,
          session.location ? `${session.location.building} ${session.location.room}` : '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    const direction = sortAsc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'seats') {
        const delta = a.registered / a.capacity - b.registered / b.capacity;
        if (delta !== 0) return delta * direction;
        return a.date.localeCompare(b.date);
      }
      return a.date.localeCompare(b.date) * direction;
    });
  }, [sessions, search, period, site, format, sortKey, sortAsc, today]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc((current) => !current);
      return;
    }
    setSortKey(key);
    setSortAsc(key === 'date');
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SearchInput
            placeholder={t('list.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full max-w-[320px]"
          />
          <div className="flex items-center gap-2">
            <SelectInput
              value={site}
              onChange={setSite}
              ariaLabel={t('list.siteLabel')}
              className="w-[172px]"
              options={[
                { value: '', label: t('list.siteAll') },
                ...sites.map((value) => ({ value, label: value })),
              ]}
            />
            <SelectInput
              value={format}
              onChange={setFormat}
              ariaLabel={t('list.formatLabel')}
              className="w-[160px]"
              options={[
                { value: '', label: t('list.formatAll') },
                ...FORMATS.map((value) => ({ value, label: tCommon(`format.${value}`) })),
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterChips
            ariaLabel={t('list.periodLabel')}
            value={period}
            onChange={(value) => setPeriod(value as Period)}
            options={[
              { value: 'upcoming', label: t('list.periodUpcoming'), count: periodCounts.upcoming },
              { value: 'past', label: t('list.periodPast'), count: periodCounts.past },
              {
                value: 'cancelled',
                label: t('list.periodCancelled'),
                count: periodCounts.cancelled,
              },
              { value: 'all', label: t('list.periodAll'), count: periodCounts.all },
            ]}
          />
          <p className="font-display text-[12.5px] tabular-nums text-ink-tertiary">
            {t('list.results', { count: rows.length })}
          </p>
        </div>
      </div>

      <Table
        head={
          <tr>
            <SortableTh
              label={t('columns.date')}
              active={sortKey === 'date'}
              asc={sortAsc}
              onClick={() => toggleSort('date')}
            />
            <Th>{t('columns.trainings')}</Th>
            <Th>{t('columns.place')}</Th>
            <Th>{t('columns.format')}</Th>
            <SortableTh
              label={t('columns.seats')}
              active={sortKey === 'seats'}
              asc={sortAsc}
              onClick={() => toggleSort('seats')}
            />
            <Th>{t('columns.status')}</Th>
            <Th>{t('columns.tags')}</Th>
          </tr>
        }
      >
        {rows.length === 0 ? (
          <TableEmptyRow colSpan={7}>
            <span className="flex flex-col gap-1">
              <span className="font-display text-[14px] font-semibold text-ink">
                {t('list.empty')}
              </span>
              <span>{t('list.emptyHint')}</span>
            </span>
          </TableEmptyRow>
        ) : (
          rows.map((session, index) => {
            const href = `/admin/sessions/${session.id}`;
            const left = seatsLeft(session.registered, session.capacity);
            const visibleTags = session.tags.slice(0, MAX_VISIBLE_TAGS);
            const hiddenTags = session.tags.length - visibleTags.length;

            return (
              <tr
                key={session.id}
                role="link"
                tabIndex={0}
                aria-label={session.trainingNames.join(', ')}
                onClick={() => router.push(href)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    router.push(href);
                  }
                }}
                style={{ '--ui-index': Math.min(index, 12) } as CSSProperties}
                className="ui-row ui-stagger cursor-pointer transition-colors duration-150 hover:bg-card-muted focus-visible:bg-accent-surface focus-visible:outline-none"
              >
                <Td>
                  <span className="flex items-center gap-3">
                    <DateBadge
                      date={session.date}
                      tone={session.status === 'planned' ? 'accent' : 'muted'}
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-medium whitespace-nowrap text-ink">
                        {formatLongDate(session.date)}
                      </span>
                      <span className="text-[11.5px] whitespace-nowrap text-ink-tertiary">
                        {session.startTime} · {session.endTime}
                      </span>
                    </span>
                  </span>
                </Td>

                <Td>
                  <span className="flex max-w-[280px] flex-col gap-1">
                    <span className="flex flex-wrap gap-1">
                      {session.trainingNames.map((name) => (
                        <Chip key={name} tone="accent">
                          {name}
                        </Chip>
                      ))}
                    </span>
                    <span className="text-[11.5px] text-ink-tertiary">
                      {t('row.trainer', { name: session.trainerName })}
                    </span>
                  </span>
                </Td>

                <Td>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[13px] whitespace-nowrap text-ink">{session.site}</span>
                    <span className="text-[11.5px] whitespace-nowrap text-ink-tertiary">
                      {session.location
                        ? `${session.location.building} · ${session.location.room}`
                        : t('row.remotePlace')}
                    </span>
                  </span>
                </Td>

                <Td>
                  <FormatBadge
                    format={session.format}
                    label={tCommon(`format.${session.format}`)}
                  />
                </Td>

                <Td>
                  <SeatsCell
                    registered={session.registered}
                    capacity={session.capacity}
                    label={t('row.seats', {
                      registered: session.registered,
                      capacity: session.capacity,
                    })}
                    hint={session.status === 'planned' ? t('row.seatsLeft', { count: left }) : ''}
                  />
                </Td>

                <Td>
                  <SessionStatusPill
                    status={session.status}
                    label={tCommon(`status.${session.status}`)}
                  />
                </Td>

                <Td>
                  {session.tags.length === 0 ? (
                    <span className="text-[12px] text-ink-disabled">{t('row.noTags')}</span>
                  ) : (
                    <span className="flex max-w-[190px] flex-wrap gap-1">
                      {visibleTags.map((tag) => (
                        <Chip key={tag}>{tag}</Chip>
                      ))}
                      {hiddenTags > 0 ? (
                        <Chip>{t('row.moreTags', { count: hiddenTags })}</Chip>
                      ) : null}
                    </span>
                  )}
                </Td>
              </tr>
            );
          })
        )}
      </Table>
    </section>
  );
}

/** Header cell carrying the sort control of its column. */
function SortableTh({
  label,
  active,
  asc,
  onClick,
}: {
  label: string;
  active: boolean;
  asc: boolean;
  onClick: () => void;
}) {
  return (
    <Th aria-sort={active ? (asc ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex cursor-pointer items-center gap-1 tracking-[0.06em] uppercase transition-colors duration-200 hover:text-ink-secondary ${
          active ? 'text-accent' : ''
        }`}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d={active && !asc ? 'M12 5v14M6 13l6 6 6-6' : 'M12 19V5M6 11l6-6 6 6'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={active ? 1 : 0.45}
          />
        </svg>
      </button>
    </Th>
  );
}
