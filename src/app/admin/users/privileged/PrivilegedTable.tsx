'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ButtonLink } from '@/components/admin/Button';
import { Drawer } from '@/components/admin/Drawer';
import { FilterChips, type FilterChip } from '@/components/admin/FilterChips';
import { Table, TableEmptyRow, Td, Th, Tr } from '@/components/admin/DataTable';
import type { AdminRole, AdminTrainingState, Site } from '@/lib/admin-types';
import { Avatar, FieldBlock, StateChip, Tag, staggerClass } from '../UserBits';

export interface PrivilegedRow {
  id: string;
  name: string;
  initials: string;
  email: string;
  site: Site;
  role: AdminRole;
  /** True for administrators, whose perimeter covers every site and training. */
  allSites: boolean;
  allTrainings: boolean;
  managedSites: Site[];
  managedTrainings: string[];
  ownTotal: number;
  ownLate: number;
  ownTrainings: { name: string; state: AdminTrainingState }[];
}

const ROLES: AdminRole[] = ['perimeter_manager', 'training_manager', 'admin'];

/** How many managed trainings are listed inline before the "+n" overflow. */
const INLINE_TRAININGS = 2;

/** Cross table of the privileged users, with a drawer detailing both sides. */
export function PrivilegedTable({ rows }: { rows: PrivilegedRow[] }) {
  const t = useTranslations('adminUsers');
  const tCommon = useTranslations('adminCommon');

  const [role, setRole] = useState<string>('');
  const [openRow, setOpenRow] = useState<PrivilegedRow | null>(null);

  const chips: FilterChip[] = [
    { value: '', label: t('list.filters.all'), count: rows.length },
    ...ROLES.map((item) => ({
      value: item,
      label: tCommon(`roles.${item}`),
      count: rows.filter((row) => row.role === item).length,
    })),
  ];

  const visible = role ? rows.filter((row) => row.role === role) : rows;

  return (
    <section className="flex flex-col gap-4">
      <FilterChips
        options={chips}
        value={role}
        onChange={setRole}
        ariaLabel={t('privileged.filterAria')}
      />

      <Table
        head={
          <tr>
            <Th>{t('privileged.columns.name')}</Th>
            <Th>{t('privileged.columns.role')}</Th>
            <Th>{t('privileged.columns.sites')}</Th>
            <Th>{t('privileged.columns.trainings')}</Th>
            <Th align="right">{t('privileged.columns.own')}</Th>
          </tr>
        }
      >
        {visible.length === 0 ? (
          <TableEmptyRow colSpan={5}>
            <span className="font-display block text-[15px] font-semibold text-ink">
              {t('privileged.empty')}
            </span>
            <span className="mt-1 block">{t('privileged.emptyHint')}</span>
          </TableEmptyRow>
        ) : (
          visible.map((row, index) => (
            <Tr key={row.id} className={`${staggerClass(index)} cursor-pointer`}>
              <Td>
                <button
                  type="button"
                  onClick={() => setOpenRow(row)}
                  className="flex cursor-pointer items-center gap-3 text-left"
                >
                  <Avatar initials={row.initials} tone="accent" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[13.5px] font-medium whitespace-nowrap text-ink">
                      {row.name}
                    </span>
                    <span className="text-[12px] text-ink-tertiary">{row.site}</span>
                  </span>
                </button>
              </Td>
              <Td className="whitespace-nowrap">
                <span className="text-[12.5px] font-medium text-ink-secondary">
                  {tCommon(`roles.${row.role}`)}
                </span>
              </Td>
              <Td>
                {row.allSites ? (
                  <Tag tone="accent">{t('privileged.sitesAll')}</Tag>
                ) : row.managedSites.length > 0 ? (
                  <span className="flex flex-wrap gap-1">
                    {row.managedSites.map((site) => (
                      <Tag key={site}>{site}</Tag>
                    ))}
                  </span>
                ) : (
                  <span className="text-ink-tertiary">{t('privileged.sitesNone')}</span>
                )}
              </Td>
              <Td>
                {row.allTrainings ? (
                  <Tag tone="accent">{t('privileged.trainingsAll')}</Tag>
                ) : row.managedTrainings.length === 0 ? (
                  <span className="text-ink-tertiary">{t('privileged.trainingsNone')}</span>
                ) : (
                  <span className="flex flex-wrap items-center gap-1">
                    {row.managedTrainings.slice(0, INLINE_TRAININGS).map((name) => (
                      <Tag key={name}>{name}</Tag>
                    ))}
                    {row.managedTrainings.length > INLINE_TRAININGS ? (
                      <span className="font-display text-[12px] text-ink-tertiary tabular-nums">
                        {t('privileged.trainingsMore', {
                          count: row.managedTrainings.length - INLINE_TRAININGS,
                        })}
                      </span>
                    ) : null}
                  </span>
                )}
              </Td>
              <Td align="right">
                <span className="flex flex-col items-end gap-0.5">
                  <span className="font-display text-[12.5px] font-medium text-ink tabular-nums">
                    {t('privileged.ownCount', { count: row.ownTotal })}
                  </span>
                  {row.ownLate > 0 ? (
                    <span className="text-[12px] font-medium text-danger-text">
                      {t('privileged.ownLate', { count: row.ownLate })}
                    </span>
                  ) : null}
                </span>
              </Td>
            </Tr>
          ))
        )}
      </Table>

      <Drawer
        open={openRow !== null}
        onClose={() => setOpenRow(null)}
        title={openRow?.name ?? ''}
        subtitle={openRow ? tCommon(`roles.${openRow.role}`) : ''}
        closeLabel={tCommon('actions.close')}
        footer={
          openRow ? (
            <ButtonLink href={`/admin/users/${openRow.id}`} variant="outline" size="sm">
              {t('privileged.seeProfile')}
            </ButtonLink>
          ) : null
        }
      >
        {openRow ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 rounded-xl border border-accent-border bg-accent-surface p-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-[14px] font-semibold text-ink">
                  {t('privileged.drawerPerimeter')}
                </h3>
                <p className="text-[12.5px] text-ink-secondary">
                  {t('privileged.drawerPerimeterHint')}
                </p>
              </div>

              <FieldBlock label={t('privileged.drawerSites')}>
                {openRow.allSites ? (
                  <Tag tone="accent">{t('privileged.sitesAll')}</Tag>
                ) : openRow.managedSites.length > 0 ? (
                  openRow.managedSites.map((site) => <Tag key={site}>{site}</Tag>)
                ) : (
                  <span className="text-ink-tertiary">{t('privileged.sitesNone')}</span>
                )}
              </FieldBlock>

              <FieldBlock label={t('privileged.drawerTrainings')}>
                {openRow.allTrainings ? (
                  <Tag tone="accent">{t('privileged.trainingsAll')}</Tag>
                ) : openRow.managedTrainings.length > 0 ? (
                  openRow.managedTrainings.map((name) => <Tag key={name}>{name}</Tag>)
                ) : (
                  <span className="text-ink-tertiary">{t('privileged.trainingsNone')}</span>
                )}
              </FieldBlock>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-card-border bg-card-muted p-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-[14px] font-semibold text-ink">
                  {t('privileged.drawerOwn')}
                </h3>
                <p className="text-[12.5px] text-ink-secondary">{t('privileged.drawerOwnHint')}</p>
              </div>

              <ul className="flex flex-col divide-y divide-divider">
                {openRow.ownTrainings.map((entry) => (
                  <li
                    key={entry.name}
                    className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <span className="text-[13px] text-ink">{entry.name}</span>
                    <StateChip state={entry.state} label={tCommon(`status.${entry.state}`)} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Drawer>
    </section>
  );
}
