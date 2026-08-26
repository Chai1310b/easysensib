'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type CSSProperties } from 'react';
import {
  Button,
  FilterBar,
  FilterChips,
  SearchInput,
  type FilterSelection,
  SortableTh,
  Table,
  TableEmptyRow,
  Td,
  Th,
} from '@/components/admin';
import { ChevronRightIcon } from '@/components/admin/adminIcons';
import type { AdminTraining, TrainingCategory } from '@/lib/admin-types';
import { CategoryChip, ModeTags } from './TrainingBadges';

type SortKey = 'name' | 'category' | 'validityMonths' | 'usersConcerned' | 'usersLate' | 'sessions';
type SortDirection = 'asc' | 'desc';

interface TrainingsClientProps {
  trainings: AdminTraining[];
  categories: TrainingCategory[];
}

function compare(a: AdminTraining, b: AdminTraining, key: SortKey): number {
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name, 'fr');
    case 'category':
      return a.category.localeCompare(b.category, 'fr') || a.name.localeCompare(b.name, 'fr');
    case 'validityMonths':
      return a.validityMonths - b.validityMonths;
    case 'usersConcerned':
      return a.usersConcerned - b.usersConcerned;
    case 'usersLate':
      return a.usersLate - b.usersLate;
    case 'sessions':
      return a.sessionsPlanned - b.sessionsPlanned;
  }
}

/** Search, business-line chips and the sortable catalogue table. */
export function TrainingsClient({ trainings, categories }: TrainingsClientProps) {
  const t = useTranslations('adminTrainings');
  const tCommon = useTranslations('adminCommon');
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [advanced, setAdvanced] = useState<FilterSelection>({});
  const [sortKey, setSortKey] = useState<SortKey>('category');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const chips = useMemo(
    () => [
      { value: '', label: t('list.allCategories'), count: trainings.length },
      ...categories.map((item) => ({
        value: item,
        label: item,
        count: trainings.filter((training) => training.category === item).length,
      })),
    ],
    [categories, t, trainings],
  );

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const modeFilter = advanced.mode ?? [];
    const lateFilter = advanced.late ?? [];
    const filtered = trainings.filter((training) => {
      if (category && training.category !== category) return false;
      if (needle && !training.name.toLowerCase().includes(needle)) return false;
      if (modeFilter.length > 0 && !modeFilter.includes(training.mode)) return false;
      if (lateFilter.length === 1) {
        if (lateFilter[0] === 'with' && training.usersLate === 0) return false;
        if (lateFilter[0] === 'without' && training.usersLate > 0) return false;
      }
      return true;
    });
    const sorted = [...filtered].sort((a, b) => compare(a, b, sortKey));
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [advanced, category, search, sortDirection, sortKey, trainings]);

  const filtersActive =
    search.trim().length > 0 ||
    category !== '' ||
    Object.values(advanced).some((values) => values.length > 0);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    // Counters read better highest first, text columns alphabetically.
    setSortDirection(key === 'name' || key === 'category' ? 'asc' : 'desc');
  }

  const sortProps = (key: SortKey) => ({
    active: key === sortKey,
    descending: sortDirection === 'desc',
    onClick: () => toggleSort(key),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          placeholder={t('list.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex items-center gap-3">
          <FilterBar
            groups={[
              {
                id: 'mode',
                label: t('filterGroups.mode'),
                options: [
                  { value: 'session', label: t('filterGroups.modeSession') },
                  { value: 'elearning', label: t('filterGroups.modeElearning') },
                  { value: 'both', label: t('filterGroups.modeBoth') },
                ],
              },
              {
                id: 'late',
                label: t('filterGroups.late'),
                options: [
                  {
                    value: 'with',
                    label: t('filterGroups.withLate'),
                    count: trainings.filter((item) => item.usersLate > 0).length,
                  },
                  {
                    value: 'without',
                    label: t('filterGroups.withoutLate'),
                    count: trainings.filter((item) => item.usersLate === 0).length,
                  },
                ],
              },
            ]}
            selection={advanced}
            onChange={setAdvanced}
            labels={{
              filters: tCommon('filters.button'),
              reset: tCommon('filters.reset'),
              close: tCommon('filters.close'),
            }}
          />
          <span className="font-display text-[12.5px] tabular-nums text-ink-tertiary">
            {t('list.resultCount', { count: rows.length })}
          </span>
        </div>
      </div>

      <FilterChips
        options={chips}
        value={category}
        onChange={setCategory}
        ariaLabel={t('list.categoryAria')}
      />

      <Table
        head={
          <tr>
            <SortableTh label={t('list.columns.name')} {...sortProps('name')} />
            <SortableTh label={t('list.columns.category')} {...sortProps('category')} />
            <Th>{t('list.columns.mode')}</Th>
            <SortableTh
              label={t('list.columns.validity')}
              align="right"
              {...sortProps('validityMonths')}
            />
            <SortableTh
              label={t('list.columns.usersConcerned')}
              align="right"
              {...sortProps('usersConcerned')}
            />
            <SortableTh
              label={t('list.columns.usersLate')}
              align="right"
              {...sortProps('usersLate')}
            />
            <SortableTh
              label={t('list.columns.sessions')}
              align="right"
              {...sortProps('sessions')}
            />
            <Th align="right" className="w-8">
              <span className="sr-only">{tCommon('actions.seeDetail')}</span>
            </Th>
          </tr>
        }
      >
        {rows.length === 0 ? (
          <TableEmptyRow colSpan={8}>
            <span className="flex flex-col items-center gap-2">
              <span className="font-display text-[14px] font-semibold text-ink">
                {t('list.empty')}
              </span>
              <span>{t('list.emptyHint')}</span>
              {filtersActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setCategory('');
                  }}
                  className="mt-1"
                >
                  {t('list.emptyAction')}
                </Button>
              ) : null}
            </span>
          </TableEmptyRow>
        ) : (
          rows.map((training, index) => (
            <tr
              key={training.id}
              onClick={() => router.push(`/admin/trainings/${training.id}`)}
              style={{ '--ui-index': Math.min(index, 12) } as CSSProperties}
              className="ui-row ui-stagger cursor-pointer transition-colors duration-150 hover:bg-card-muted"
            >
              <Td className="max-w-[280px]">
                <Link
                  href={`/admin/trainings/${training.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="block truncate font-medium text-ink! hover:text-accent!"
                >
                  {training.name}
                </Link>
              </Td>
              <Td>
                <CategoryChip category={training.category} />
              </Td>
              <Td>
                <ModeTags mode={training.mode} />
              </Td>
              <Td align="right" numeric className="whitespace-nowrap text-ink-secondary">
                {t('units.months', { count: training.validityMonths })}
              </Td>
              <Td align="right" numeric>
                {training.usersConcerned}
              </Td>
              <Td align="right" numeric>
                <span className={training.usersLate > 0 ? 'text-danger-text' : 'text-ink-disabled'}>
                  {training.usersLate}
                </span>
              </Td>
              <Td align="right" numeric>
                <span className={training.sessionsPlanned > 0 ? 'text-ink' : 'text-ink-disabled'}>
                  {training.sessionsPlanned}
                </span>
              </Td>
              <Td align="right" className="text-ink-disabled">
                <ChevronRightIcon size={13} />
              </Td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
}
