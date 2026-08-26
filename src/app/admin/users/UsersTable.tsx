'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { FilterChips, type FilterChip } from '@/components/admin/FilterChips';
import { Pagination } from '@/components/admin/Pagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { SortableTh, Table, TableEmptyRow, Td, Th, Tr } from '@/components/admin/DataTable';
import type { AdminRole, Site } from '@/lib/admin-types';
import { Avatar, CountDot, InactiveBadge, RoleLabel, VipBadge, staggerClass } from './UserBits';
import type { TrainingCounts } from './userDisplay';

export interface UserRow {
  id: string;
  name: string;
  initials: string;
  email: string;
  site: Site;
  role: AdminRole;
  isVip: boolean;
  isActive: boolean;
  lastActivity: string;
  lastActivityLabel: string;
  counts: TrainingCounts;
}

type StateFilter = '' | 'late' | 'upToDate' | 'vip' | 'inactive';
type SortKey = 'name' | 'site' | 'late' | 'lastActivity';

const PAGE_SIZE = 12;

/** Sortable header cell rendered as a button inside a `Th`. */

/** Searchable, filterable and sortable list of users. */
export function UsersTable({ rows, sites }: { rows: UserRow[]; sites: Site[] }) {
  const t = useTranslations('adminUsers');
  const tCommon = useTranslations('adminCommon');

  const [search, setSearch] = useState('');
  const [site, setSite] = useState<string>('');
  const [state, setState] = useState<StateFilter>('');
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({
    key: 'name',
    descending: false,
  });
  const [page, setPage] = useState(1);

  const siteChips: FilterChip[] = [
    { value: '', label: t('list.filters.all'), count: rows.length },
    ...sites.map((item) => ({
      value: item,
      label: item,
      count: rows.filter((row) => row.site === item).length,
    })),
  ];

  const stateChips: FilterChip[] = [
    { value: '', label: t('list.filters.all') },
    {
      value: 'late',
      label: t('list.filters.late'),
      count: rows.filter((r) => r.counts.late > 0).length,
    },
    {
      value: 'upToDate',
      label: t('list.filters.upToDate'),
      count: rows.filter((r) => r.counts.late === 0).length,
    },
    { value: 'vip', label: t('list.filters.vip'), count: rows.filter((r) => r.isVip).length },
    {
      value: 'inactive',
      label: t('list.filters.inactive'),
      count: rows.filter((r) => !r.isActive).length,
    },
  ];

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    const kept = rows.filter((row) => {
      if (site && row.site !== site) return false;
      if (state === 'late' && row.counts.late === 0) return false;
      if (state === 'upToDate' && row.counts.late > 0) return false;
      if (state === 'vip' && !row.isVip) return false;
      if (state === 'inactive' && row.isActive) return false;
      if (needle && !`${row.name} ${row.email}`.toLowerCase().includes(needle)) return false;
      return true;
    });

    const direction = sort.descending ? -1 : 1;
    return [...kept].sort((a, b) => {
      if (sort.key === 'site') {
        const bySite = a.site.localeCompare(b.site, 'fr');
        return (bySite !== 0 ? bySite : a.name.localeCompare(b.name, 'fr')) * direction;
      }
      if (sort.key === 'late') {
        const byLate = a.counts.late - b.counts.late;
        return (byLate !== 0 ? byLate : a.name.localeCompare(b.name, 'fr')) * direction;
      }
      if (sort.key === 'lastActivity') {
        return a.lastActivity.localeCompare(b.lastActivity) * direction;
      }
      return a.name.localeCompare(b.name, 'fr') * direction;
    });
  }, [rows, search, site, state, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  function onSort(key: SortKey) {
    setSort((current) =>
      current.key === key ? { key, descending: !current.descending } : { key, descending: false },
    );
    setPage(1);
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          placeholder={t('list.searchPlaceholder')}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <FilterChips
          options={stateChips}
          value={state}
          onChange={(value) => {
            setState(value as StateFilter);
            setPage(1);
          }}
          ariaLabel={t('list.filters.stateAria')}
        />
      </div>

      <FilterChips
        options={siteChips}
        value={site}
        onChange={(value) => {
          setSite(value);
          setPage(1);
        }}
        ariaLabel={t('list.filters.siteAria')}
      />

      <Table
        className="min-w-0"
        head={
          <tr>
            <SortableTh
              label={t('list.columns.name')}
              active={sort.key === 'name'}
              descending={sort.descending}
              onClick={() => onSort('name')}
              ariaLabel={t('list.sortAria', { column: t('list.columns.name') })}
            />
            <SortableTh
              label={t('list.columns.site')}
              active={sort.key === 'site'}
              descending={sort.descending}
              onClick={() => onSort('site')}
              ariaLabel={t('list.sortAria', { column: t('list.columns.site') })}
            />
            <SortableTh
              label={t('list.columns.trainings')}
              active={sort.key === 'late'}
              descending={sort.descending}
              onClick={() => onSort('late')}
              ariaLabel={t('list.sortAria', { column: t('list.columns.trainings') })}
            />
            <Th>{t('list.columns.role')}</Th>
            <SortableTh
              label={t('list.columns.lastActivity')}
              active={sort.key === 'lastActivity'}
              descending={sort.descending}
              onClick={() => onSort('lastActivity')}
              ariaLabel={t('list.sortAria', { column: t('list.columns.lastActivity') })}
              align="right"
            />
          </tr>
        }
      >
        {visible.length === 0 ? (
          <TableEmptyRow colSpan={5}>
            <span className="font-display block text-[15px] font-semibold text-ink">
              {t('list.empty')}
            </span>
            <span className="mt-1 block">{t('list.emptyHint')}</span>
          </TableEmptyRow>
        ) : (
          visible.map((row, index) => (
            <Tr key={row.id} className={staggerClass(index)}>
              <Td className="max-w-[320px]">
                <Link
                  href={`/admin/users/${row.id}`}
                  className="flex items-center gap-3 text-ink! hover:text-ink!"
                >
                  <Avatar initials={row.initials} tone={row.isVip ? 'accent' : 'neutral'} />
                  <span className="flex min-w-0 flex-col">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[13.5px] font-medium">{row.name}</span>
                      {row.isVip ? (
                        <VipBadge label={tCommon('labels.vip')} title={t('list.vipTitle')} />
                      ) : null}
                      {!row.isActive ? (
                        <InactiveBadge
                          label={tCommon('status.inactive')}
                          title={t('list.inactiveTitle')}
                        />
                      ) : null}
                    </span>
                    <span className="truncate text-[12px] text-ink-tertiary">
                      {row.email || tCommon('labels.noEmail')}
                    </span>
                  </span>
                </Link>
              </Td>
              <Td className="text-ink-secondary">{row.site}</Td>
              <Td>
                {row.counts.total === 0 ? (
                  <span className="text-ink-tertiary">{t('list.trainings.none')}</span>
                ) : (
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {row.counts.valid > 0 ? (
                      <CountDot
                        tone="success"
                        label={t('list.trainings.valid', { count: row.counts.valid })}
                      />
                    ) : null}
                    {row.counts.late > 0 ? (
                      <CountDot
                        tone="danger"
                        label={t('list.trainings.late', { count: row.counts.late })}
                      />
                    ) : null}
                    {row.counts.registered > 0 ? (
                      <CountDot
                        tone="accent"
                        label={t('list.trainings.registered', { count: row.counts.registered })}
                      />
                    ) : null}
                  </span>
                )}
              </Td>
              <Td>
                <RoleLabel role={row.role} label={tCommon(`roles.${row.role}`)} />
              </Td>
              <Td align="right" className="whitespace-nowrap text-ink-tertiary">
                {row.lastActivityLabel}
              </Td>
            </Tr>
          ))
        )}
      </Table>

      <Pagination
        page={currentPage}
        pageCount={pageCount}
        onChange={setPage}
        labels={{
          previous: tCommon('table.previous'),
          next: tCommon('table.next'),
          summary: tCommon('table.summary', {
            from: filtered.length === 0 ? 0 : start + 1,
            to: Math.min(start + PAGE_SIZE, filtered.length),
            total: filtered.length,
          }),
        }}
      />
    </section>
  );
}
