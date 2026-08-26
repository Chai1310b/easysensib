'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type ReactNode } from 'react';
import {
  Button,
  FilterChips,
  SearchInput,
  Table,
  TableEmptyRow,
  Td,
  Th,
  Tr,
  Modal,
  useToast,
} from '@/components/admin';
import { InfoCircleIcon, MailStackIcon, UsersIcon } from '@/components/admin/adminIcons';
import type { RelanceExecution, RelanceSettings, RelanceType } from '@/lib/admin-types';
import { PlayIcon, SeatsIcon } from './mailIcons';
import { formatRunDateTime, STATUS_PILL, TYPE_PILL } from './relanceDisplay';

const TYPES: RelanceType[] = ['auto', 'simulation', 'manual'];

/**
 * Literal stagger classes: Tailwind only generates arbitrary properties it can
 * read in the source, so the per-row delay cannot be interpolated.
 */
const STAGGER = [
  '[--ui-index:0]',
  '[--ui-index:1]',
  '[--ui-index:2]',
  '[--ui-index:3]',
  '[--ui-index:4]',
  '[--ui-index:5]',
  '[--ui-index:6]',
  '[--ui-index:7]',
  '[--ui-index:8]',
  '[--ui-index:9]',
  '[--ui-index:10]',
  '[--ui-index:11]',
];

interface MailsConsoleProps {
  executions: RelanceExecution[];
  settings: RelanceSettings;
}

/**
 * Interactive part of the mail console: type filter, search, simulation modal
 * and the run table. Every row opens the matching run detail.
 */
export function MailsConsole({ executions, settings }: MailsConsoleProps) {
  const t = useTranslations('adminMails');
  const tCommon = useTranslations('adminCommon');
  const router = useRouter();
  const { showToast } = useToast();

  const [type, setType] = useState('');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const chips = useMemo(
    () => [
      { value: '', label: t('filters.all'), count: executions.length },
      ...TYPES.map((value) => ({
        value,
        label: t(`types.${value}`),
        count: executions.filter((run) => run.type === value).length,
      })),
    ],
    [executions, t],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return executions.filter((run) => {
      if (type && run.type !== type) return false;
      if (!needle) return true;
      return String(run.number).includes(needle) || run.launchedBy.toLowerCase().includes(needle);
    });
  }, [executions, query, type]);

  const marginPercent = Math.round(settings.seatMargin * 100);

  function launchSimulation() {
    setModalOpen(false);
    showToast(t('simulation.launched'), 'info');
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            placeholder={t('filters.searchPlaceholder')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <FilterChips
            options={chips}
            value={type}
            onChange={setType}
            ariaLabel={t('filters.ariaLabel')}
          />
        </div>

        <Button onClick={() => setModalOpen(true)} className="shrink-0 self-start md:self-auto">
          <PlayIcon size={15} />
          {t('actions.newSimulation')}
        </Button>
      </div>

      <Table
        head={
          <tr>
            <Th>{t('table.execution')}</Th>
            <Th>{t('table.date')}</Th>
            <Th>{t('table.type')}</Th>
            <Th>{t('table.status')}</Th>
            <Th>{t('table.launchedBy')}</Th>
            <Th>{t('table.metrics')}</Th>
            <Th align="right">{t('table.duration')}</Th>
          </tr>
        }
      >
        {rows.length === 0 ? (
          <TableEmptyRow colSpan={7}>
            <span className="font-display text-[14px] font-semibold text-ink">
              {t('empty.title')}
            </span>
            <span className="mt-1 block text-[13px] text-ink-tertiary">
              {executions.length === 0 ? t('empty.noRun') : t('empty.description')}
            </span>
          </TableEmptyRow>
        ) : (
          rows.map((run, index) => {
            const href = `/admin/mails/${run.id}`;
            const cell = { onClick: () => router.push(href) };

            return (
              <Tr key={run.id} className={`ui-stagger cursor-pointer ${STAGGER[index] ?? ''}`}>
                <Td {...cell}>
                  <Link
                    href={href}
                    aria-label={t('actions.openDetail', { number: run.number })}
                    className="font-display text-[13.5px] font-semibold text-accent! hover:text-accent-hover!"
                  >
                    {t('table.number', { number: run.number })}
                  </Link>
                </Td>

                <Td {...cell} className="whitespace-nowrap text-ink-secondary">
                  {formatRunDateTime(run.date)}
                </Td>

                <Td {...cell}>
                  <Pill className={TYPE_PILL[run.type]}>{t(`types.${run.type}`)}</Pill>
                </Td>

                <Td {...cell}>
                  <Pill className={STATUS_PILL[run.status]}>{tCommon(`status.${run.status}`)}</Pill>
                </Td>

                <Td {...cell} className="whitespace-nowrap text-ink-secondary">
                  {run.launchedBy}
                </Td>

                <Td {...cell}>
                  <span className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
                    <Metric
                      icon={<UsersIcon size={13} />}
                      value={run.eligible}
                      title={t('metrics.eligible')}
                    />
                    <Metric
                      icon={<SeatsIcon size={13} />}
                      value={run.seats}
                      title={t('metrics.seats')}
                    />
                    <Metric
                      icon={<MailStackIcon size={13} />}
                      value={run.mailsToSend}
                      title={t('metrics.mails')}
                      strong
                    />
                  </span>
                </Td>

                <Td
                  {...cell}
                  align="right"
                  numeric
                  className="whitespace-nowrap text-ink-secondary"
                >
                  {t('metrics.seconds', { seconds: run.durationSeconds })}
                </Td>
              </Tr>
            );
          })
        )}
      </Table>

      <p className="text-[12.5px] text-ink-tertiary">{t('table.count', { count: rows.length })}</p>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('simulation.title')}
        closeLabel={tCommon('actions.close')}
        width={480}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              {tCommon('actions.cancel')}
            </Button>
            <Button size="sm" onClick={launchSimulation}>
              <PlayIcon size={14} />
              {t('actions.launch')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="flex items-start gap-2 rounded-lg border border-accent-border bg-accent-surface px-3 py-2.5 text-[12.5px] font-medium text-accent">
            <span className="mt-px shrink-0">
              <InfoCircleIcon size={14} />
            </span>
            {t('simulation.notice')}
          </p>

          <p className="text-[13px] text-ink-secondary">{t('simulation.description')}</p>

          <div className="rounded-lg border border-card-border bg-card-muted px-3.5 py-3">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
              {t('simulation.settingsTitle')}
            </p>
            <dl className="flex flex-col gap-1.5">
              <SettingRow
                label={t('simulation.margin')}
                value={t('simulation.marginValue', { margin: marginPercent })}
              />
              <SettingRow
                label={t('simulation.days')}
                value={t('simulation.daysValue', { days: settings.daysBetweenMails })}
              />
              <SettingRow
                label={t('simulation.sessions')}
                value={t('simulation.sessionsValue', { count: settings.sessionsPerMail })}
              />
              <SettingRow label={t('simulation.sender')} value={settings.senderEmail} />
            </dl>
          </div>
        </div>
      </Modal>
    </section>
  );
}

function Pill({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}

function Metric({
  icon,
  value,
  title,
  strong = false,
}: {
  icon: ReactNode;
  value: number;
  title: string;
  strong?: boolean;
}) {
  return (
    <span
      title={title}
      className={`flex items-center gap-1.5 whitespace-nowrap ${
        strong ? 'text-ink' : 'text-ink-secondary'
      }`}
    >
      <span className="text-ink-tertiary">{icon}</span>
      <span className="font-display text-[13px] font-medium tabular-nums">{value}</span>
    </span>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[12.5px] text-ink-tertiary">{label}</dt>
      <dd className="font-display text-[12.5px] font-medium text-ink">{value}</dd>
    </div>
  );
}
