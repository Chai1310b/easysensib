'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/admin/Button';
import { Table, TableEmptyRow, Td, Th, Tr } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { Select } from '@/components/admin/Select';
import { DonutChart } from '@/components/admin/charts';
import { useToast } from '@/components/admin/Toast';
import { ValidityGauge } from '@/components/ValidityGauge';
import type { AdminTrainingState, Site } from '@/lib/admin-types';
import type { StatusTone } from '@/lib/types';
import { StateChip, staggerClass } from '../UserBits';
import type { ValidityLabel } from '../userDisplay';

export interface UserTrainingRow {
  trainingId: string;
  trainingName: string;
  category: string;
  state: AdminTrainingState;
  validatedBy?: 'session' | 'certificate';
  /** Gauge fill, or null when no gauge applies. */
  percent: number | null;
  tone: StatusTone;
  labelKey: ValidityLabel['key'];
  labelCount: number;
  expiresLabel?: string;
  lastValidatedLabel?: string;
}

export interface RequeueSession {
  id: string;
  trainingIds: string[];
  dateLabel: string;
  site: Site;
  time: string;
}

const REASONS = [
  'sessionInvalid',
  'trainerNotQualified',
  'attendanceError',
  'certificateInvalid',
  'other',
] as const;

type Reason = (typeof REASONS)[number];

/** A validation can only be cancelled while one is actually on record. */
function isCancellable(state: AdminTrainingState): boolean {
  return state === 'valid' || state === 'expiring' || state === 'overdue';
}

const FIELD =
  'w-full rounded-lg border border-card-border bg-card px-3 text-[13px] text-ink transition-[border-color,box-shadow] duration-200 outline-none focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)]';

const COUNT_TONE = {
  success: 'text-success',
  warning: 'text-warning-text',
  danger: 'text-danger-text',
  accent: 'text-accent',
  neutral: 'text-ink-tertiary',
} as const;

/** Display order, tone and donut color of each obligation state. */
const STATE_DISPLAY: { state: AdminTrainingState; tone: keyof typeof COUNT_TONE; color: string }[] =
  [
    { state: 'overdue', tone: 'danger', color: 'var(--color-gauge-danger)' },
    { state: 'never', tone: 'neutral', color: 'var(--color-ink-tertiary)' },
    { state: 'expiring', tone: 'warning', color: 'var(--color-gauge-warning)' },
    { state: 'registered', tone: 'accent', color: 'var(--color-accent)' },
    { state: 'valid', tone: 'success', color: 'var(--color-gauge-success)' },
  ];

/** One of the three counters shown on the right of the profile header. */
function HeaderCount({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: keyof typeof COUNT_TONE;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dd className={`font-display text-[26px] leading-none font-semibold ${COUNT_TONE[tone]}`}>
        {value}
      </dd>
      <dt className="text-[12px] text-ink-tertiary">{label}</dt>
    </div>
  );
}

/**
 * Profile header counters plus the table of assigned trainings.
 * Both live in the same component so that cancelling a validation updates the
 * counters and the row together; the identity block stays server-rendered and
 * arrives as a node.
 */
export function UserProfile({
  identity,
  notes,
  userName,
  rows,
  sessions,
  obligationsTitle,
  asideCards,
}: {
  identity: ReactNode;
  notes: ReactNode;
  userName: string;
  rows: UserTrainingRow[];
  sessions: RequeueSession[];
  /** Title of the obligations donut card, already translated. */
  obligationsTitle: string;
  /** Server-rendered indicator cards shown next to the obligations donut. */
  asideCards: ReactNode;
}) {
  const t = useTranslations('adminUsers');
  const tCommon = useTranslations('adminCommon');
  const { showToast } = useToast();

  const [items, setItems] = useState(rows);
  const [target, setTarget] = useState<UserTrainingRow | null>(null);
  const [reason, setReason] = useState<Reason>('sessionInvalid');
  const [comment, setComment] = useState('');
  const [requeue, setRequeue] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const candidates = target
    ? sessions.filter((session) => session.trainingIds.includes(target.trainingId))
    : [];

  function openCancel(row: UserTrainingRow) {
    const compatible = sessions.filter((session) => session.trainingIds.includes(row.trainingId));
    setTarget(row);
    setReason('sessionInvalid');
    setComment('');
    setRequeue(false);
    setSessionId(compatible[0]?.id ?? '');
  }

  function confirmCancel() {
    if (!target) return;
    const requeued = requeue && sessionId !== '';

    setItems((current) =>
      current.map((row) =>
        row.trainingId === target.trainingId
          ? {
              ...row,
              state: requeued ? 'registered' : 'never',
              percent: null,
              tone: requeued ? 'warning' : 'danger',
              labelKey: requeued ? 'registered' : 'never',
              labelCount: 0,
              expiresLabel: undefined,
              lastValidatedLabel: undefined,
              validatedBy: undefined,
            }
          : row,
      ),
    );

    showToast(requeued ? t('cancel.doneRequeued') : t('cancel.done'), 'success');
    setTarget(null);
  }

  function validityLabel(row: UserTrainingRow): string {
    return t(`validity.${row.labelKey}`, { count: row.labelCount });
  }

  function lastValidation(row: UserTrainingRow): string {
    if (row.state === 'registered') return t('detail.registeredHint');
    if (!row.lastValidatedLabel) return t('detail.neverValidated');
    return row.validatedBy === 'certificate'
      ? t('detail.validatedByCertificate', { date: row.lastValidatedLabel })
      : t('detail.validatedBySession', { date: row.lastValidatedLabel });
  }

  const stateCounts = Object.fromEntries(
    STATE_DISPLAY.map(({ state }) => [state, items.filter((row) => row.state === state).length]),
  ) as Record<AdminTrainingState, number>;

  return (
    <>
      <header className="ui-stagger flex flex-col gap-5 rounded-xl border border-card-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          {identity}
          <dl className="flex gap-6">
            {STATE_DISPLAY.filter(({ state }) => stateCounts[state] > 0).map(({ state, tone }) => (
              <HeaderCount
                key={state}
                value={stateCounts[state]}
                label={tCommon(`status.${state}`)}
                tone={tone}
              />
            ))}
          </dl>
        </div>
        {notes}
      </header>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="ui-card flex flex-col gap-4 rounded-xl border border-card-border bg-card p-5">
          <h2 className="text-[14px] font-semibold text-ink">{obligationsTitle}</h2>
          <DonutChart
            size={116}
            data={STATE_DISPLAY.map(({ state, color }) => ({
              label: tCommon(`status.${state}`),
              value: stateCounts[state],
              color,
            }))}
          />
        </div>
        {asideCards}
      </section>

      <section className="ui-stagger [--ui-index:1] flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-[17px] font-semibold">{t('detail.trainingsTitle')}</h2>
          <p className="text-[13px] text-ink-secondary">{t('detail.trainingsSubtitle')}</p>
        </div>

        <Table
          head={
            <tr>
              <Th>{t('detail.columns.training')}</Th>
              <Th>{t('detail.columns.state')}</Th>
              <Th>{t('detail.columns.validity')}</Th>
              <Th>{t('detail.columns.lastValidation')}</Th>
              <Th align="right">{t('detail.columns.action')}</Th>
            </tr>
          }
        >
          {items.length === 0 ? (
            <TableEmptyRow colSpan={5}>
              <span className="font-display block text-[15px] font-semibold text-ink">
                {t('detail.empty')}
              </span>
              <span className="mt-1 block">{t('detail.emptyHint')}</span>
            </TableEmptyRow>
          ) : (
            items.map((row, index) => (
              <Tr key={row.trainingId} className={staggerClass(index)}>
                <Td>
                  <span className="flex flex-col gap-0.5">
                    <Link
                      href={`/admin/trainings/${row.trainingId}`}
                      className="text-[13.5px] font-medium text-ink! underline-offset-2 hover:text-accent! hover:underline"
                    >
                      {row.trainingName}
                    </Link>
                    {row.category ? (
                      <span className="text-[12px] text-ink-tertiary">{row.category}</span>
                    ) : null}
                  </span>
                </Td>
                <Td>
                  <StateChip state={row.state} label={tCommon(`status.${row.state}`)} />
                </Td>
                <Td>
                  {row.percent === null ? (
                    <span
                      className={`text-xs font-semibold ${
                        row.tone === 'danger' ? 'text-danger-text' : 'text-warning-text'
                      }`}
                    >
                      {validityLabel(row)}
                    </span>
                  ) : (
                    <span className="flex flex-col gap-1">
                      <ValidityGauge
                        label={validityLabel(row)}
                        tone={row.tone}
                        percent={row.percent}
                        width={140}
                      />
                      {row.expiresLabel ? (
                        <span className="text-[11.5px] text-ink-tertiary">{row.expiresLabel}</span>
                      ) : null}
                    </span>
                  )}
                </Td>
                <Td className="text-ink-secondary">{lastValidation(row)}</Td>
                <Td align="right">
                  {isCancellable(row.state) ? (
                    <Button variant="ghost" size="sm" onClick={() => openCancel(row)}>
                      {t('cancel.action')}
                    </Button>
                  ) : (
                    <span className="text-ink-disabled">·</span>
                  )}
                </Td>
              </Tr>
            ))
          )}
        </Table>

        <Modal
          open={target !== null}
          onClose={() => setTarget(null)}
          title={t('cancel.title')}
          subtitle={
            target ? t('cancel.subtitle', { training: target.trainingName, user: userName }) : ''
          }
          closeLabel={tCommon('actions.close')}
          width={520}
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setTarget(null)}>
                {t('cancel.keep')}
              </Button>
              <Button variant="danger" size="sm" onClick={confirmCancel}>
                {t('cancel.confirm')}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <p className="rounded-lg bg-danger-tint px-3 py-2.5 text-[12.5px] text-danger-text">
              {t('cancel.warning')}
            </p>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-ink-secondary">
                {t('cancel.reasonLabel')}
              </span>
              <Select
                value={reason}
                onChange={(value) => setReason(value as Reason)}
                ariaLabel={t('cancel.reasonLabel')}
                options={REASONS.map((item) => ({
                  value: item,
                  label: t(`cancel.reasons.${item}`),
                }))}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-ink-secondary">
                {t('cancel.commentLabel')}
              </span>
              <textarea
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t('cancel.commentPlaceholder')}
                className={`${FIELD} resize-none py-2 placeholder:text-ink-disabled`}
              />
            </label>

            <div className="flex flex-col gap-2.5 rounded-lg border border-card-border bg-card-muted p-3">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={requeue}
                  onChange={(event) => setRequeue(event.target.checked)}
                  disabled={candidates.length === 0}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#2b3fbf] disabled:cursor-default"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-ink">
                    {t('cancel.requeueLabel')}
                  </span>
                  <span className="text-[12px] text-ink-tertiary">
                    {candidates.length === 0 ? t('cancel.noSession') : t('cancel.requeueHint')}
                  </span>
                </span>
              </label>

              {requeue && candidates.length > 0 ? (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium text-ink-secondary">
                    {t('cancel.sessionLabel')}
                  </span>
                  <Select
                    value={sessionId}
                    onChange={setSessionId}
                    ariaLabel={t('cancel.sessionLabel')}
                    options={candidates.map((session) => ({
                      value: session.id,
                      label: t('cancel.sessionOption', {
                        date: session.dateLabel,
                        site: session.site,
                        time: session.time,
                      }),
                    }))}
                  />
                </label>
              ) : null}
            </div>
          </div>
        </Modal>
      </section>
    </>
  );
}
