/**
 * Detail of one relance run: KPI banner, summary sentence, six figures and the
 * priority / exclusion / unassigned distributions, as described by the guide.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import {
  Breadcrumb,
  EmptyState,
  EXCLUSION_COLORS,
  PRIORITY_COLORS,
  PriorityBar,
  StatTile,
  UNASSIGNED_COLORS,
} from '@/components/admin';
import {
  AlertCircleIcon,
  InfoCircleIcon,
  MailStackIcon,
  UsersIcon,
} from '@/components/admin/adminIcons';
import {
  getRelanceExecution,
  getRelanceExecutions,
  getRelanceMailPreview,
  getRelanceSettings,
  getRelanceSlotAssignments,
} from '@/services/admin/mails';
import { Table, Td, Th } from '@/components/admin';
import { formatLongDate } from '@/lib/format';
import { ChevronLeftIcon, ClockIcon, FunnelIcon, ScaleIcon, SeatsIcon } from '../mailIcons';
import {
  countExcluded,
  countNewcomers,
  EXCLUSION_ORDER,
  formatRunDateTime,
  PRIORITY_ORDER,
  STATUS_PILL,
  sumBreakdown,
  TYPE_PILL,
  UNASSIGNED_ORDER,
} from '../relanceDisplay';

export async function generateStaticParams() {
  const executions = await getRelanceExecutions();
  return executions.map((run) => ({ id: run.id }));
}

interface RelanceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RelanceDetailPage({ params }: RelanceDetailPageProps) {
  const { id } = await params;
  const execution = await getRelanceExecution(id);

  if (!execution) {
    notFound();
  }

  const [t, tCommon, settings, slotAssignments, mailPreview] = await Promise.all([
    getTranslations('adminMails'),
    getTranslations('adminCommon'),
    getRelanceSettings(),
    getRelanceSlotAssignments(),
    getRelanceMailPreview(execution.type !== 'simulation' && execution.status === 'done'),
  ]);
  const previewRows = mailPreview.slice(0, 8);

  const newcomers = countNewcomers(execution);
  const excluded = countExcluded(execution);
  const isSimulation = execution.type === 'simulation';
  const hasBreakdowns = execution.priorityBreakdown.length > 0;

  const summaryValues = {
    analysed: execution.analysed,
    eligible: execution.eligible,
    newcomers,
    seats: execution.seats,
    sessions: execution.sessionsWithSeats,
    mails: execution.mailsToSend,
    fillRate: execution.fillRatePercent,
    excluded,
  };

  const prioritySegments = PRIORITY_ORDER.map((category) => ({
    key: category,
    label: t(`priority.categories.${category}`),
    count: execution.priorityBreakdown.find((entry) => entry.category === category)?.count ?? 0,
    color: PRIORITY_COLORS[category],
  }));

  const exclusionSegments = EXCLUSION_ORDER.map((reason) => ({
    key: reason,
    label: t(`exclusions.reasons.${reason}`),
    count: execution.exclusionBreakdown.find((entry) => entry.reason === reason)?.count ?? 0,
    color: EXCLUSION_COLORS[reason],
  }));

  const unassignedSegments = UNASSIGNED_ORDER.map((reason) => ({
    key: reason,
    label: t(`unassigned.reasons.${reason}`),
    count: execution.unassignedBreakdown.find((entry) => entry.reason === reason)?.count ?? 0,
    color: UNASSIGNED_COLORS[reason],
  }));

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: tCommon('breadcrumb.root'), href: '/admin' },
            { label: t('title'), href: '/admin/mails' },
            { label: t('detail.title', { number: execution.number }) },
          ]}
          ariaLabel={tCommon('breadcrumb.ariaLabel')}
        />

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[26px] font-semibold">
            {t('detail.title', { number: execution.number })}
          </h1>
          <Pill className={TYPE_PILL[execution.type]}>{t(`types.${execution.type}`)}</Pill>
          <Pill className={STATUS_PILL[execution.status]}>
            {tCommon(`status.${execution.status}`)}
          </Pill>
        </div>

        <p className="text-sm text-ink-secondary">
          {t('detail.meta', {
            type: t(`types.${execution.type}`),
            date: formatRunDateTime(execution.date),
            author: execution.launchedBy,
          })}
        </p>

        <Link
          href="/admin/mails"
          className="mt-1 inline-flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-accent! hover:text-accent-hover!"
        >
          <ChevronLeftIcon size={13} />
          {t('detail.back')}
        </Link>
      </header>

      <section
        aria-label={t('detail.summaryTitle')}
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-card-border bg-card-border lg:grid-cols-4"
      >
        <KpiCell
          icon={<UsersIcon size={15} />}
          label={t('metrics.eligible')}
          value={execution.eligible}
          tone="accent"
        />
        <KpiCell
          icon={<SeatsIcon size={15} />}
          label={t('metrics.seats')}
          value={execution.seats}
          tone="success"
        />
        <KpiCell
          icon={<MailStackIcon size={15} />}
          label={t('metrics.mails')}
          value={execution.mailsToSend}
          tone="warning"
        />
        <KpiCell
          icon={<ClockIcon size={15} />}
          label={t('metrics.duration')}
          value={t('metrics.seconds', { seconds: execution.durationSeconds })}
          tone="neutral"
        />
      </section>

      {execution.status === 'failed' ? (
        <Notice
          icon={<AlertCircleIcon size={16} />}
          title={t('detail.failedTitle')}
          body={t('detail.failedBody')}
        />
      ) : (
        <section className="flex flex-col gap-3 rounded-xl border border-card-border bg-card px-5 py-4">
          <h2 className="font-display text-[15px] font-semibold text-ink">
            {t('detail.summaryTitle')}
          </h2>
          <p className="text-[13.5px] leading-relaxed text-ink-secondary">
            {isSimulation
              ? t('detail.summarySimulation', summaryValues)
              : t('detail.summary', summaryValues)}
          </p>
          {isSimulation ? (
            <p className="flex items-start gap-2 rounded-lg border border-accent-border bg-accent-surface px-3 py-2.5 text-[12.5px] font-medium text-accent">
              <span className="mt-px shrink-0">
                <InfoCircleIcon size={14} />
              </span>
              {t('detail.noMailNotice')}
            </p>
          ) : null}
        </section>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile
          value={execution.analysed}
          label={t('detail.cards.analysed')}
          hint={t('detail.cards.analysedHint')}
          className="ui-stagger"
        />
        <StatTile
          value={execution.eligible}
          label={t('detail.cards.eligible')}
          hint={t('detail.cards.eligibleHint')}
          tone="accent"
          className="ui-stagger [--ui-index:1]"
        />
        <StatTile
          value={newcomers}
          label={t('detail.cards.newcomers')}
          hint={t('detail.cards.newcomersHint')}
          tone="danger"
          className="ui-stagger [--ui-index:2]"
        />
        <StatTile
          value={execution.seats}
          label={t('detail.cards.seats')}
          hint={t('detail.cards.seatsHint', { sessions: execution.sessionsWithSeats })}
          tone="success"
          className="ui-stagger [--ui-index:3]"
        />
        <StatTile
          value={execution.mailsToSend}
          label={t('detail.cards.mails')}
          hint={t('detail.cards.mailsHint')}
          tone="warning"
          className="ui-stagger [--ui-index:4]"
        />
        <StatTile
          value={excluded}
          label={t('detail.cards.excluded')}
          hint={t('detail.cards.excludedHint')}
          className="ui-stagger [--ui-index:5]"
        />
      </section>

      {execution.status === 'failed' ? null : (
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          <Panel
            icon={<ScaleIcon size={15} />}
            title={t('priority.title')}
            hint={t('priority.hint', { count: execution.eligible })}
          >
            {hasBreakdowns ? (
              <>
                <PriorityBar segments={prioritySegments} height={12} />

                <div className="mt-5 flex flex-col gap-2 border-t border-divider pt-4">
                  <p className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
                    {t('priority.scoringTitle')}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {PRIORITY_ORDER.map((category) => (
                      <li key={category} className="flex items-start gap-2.5">
                        <span
                          aria-hidden
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: PRIORITY_COLORS[category] }}
                        />
                        <span className="flex min-w-0 grow flex-col gap-0.5">
                          <span className="text-[12.5px] font-medium text-ink">
                            {t(`priority.categories.${category}`)}
                          </span>
                          <span className="text-[12px] text-ink-tertiary">
                            {t(`priority.criteria.${category}`, {
                              days: settings.expiringSoonDays,
                            })}
                          </span>
                        </span>
                        <span className="shrink-0 font-display text-[12px] font-medium tabular-nums text-ink-secondary">
                          {t(`priority.ranges.${category}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <EmptyState title={t('priority.empty')} />
            )}
          </Panel>

          <div className="flex flex-col gap-5">
            <Panel
              icon={<FunnelIcon size={15} />}
              title={t('exclusions.title')}
              hint={t('exclusions.hint', { count: excluded })}
            >
              {execution.exclusionBreakdown.length > 0 ? (
                <>
                  <PriorityBar segments={exclusionSegments} height={12} hideLegend />

                  <ul className="mt-4 flex flex-col divide-y divide-divider">
                    {exclusionSegments
                      .filter((segment) => segment.count > 0)
                      .map((segment) => (
                        <li key={segment.key} className="flex items-center gap-2.5 py-2">
                          <span
                            aria-hidden
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          />
                          <span className="grow text-[12.5px] text-ink-secondary">
                            {segment.label}
                          </span>
                          <span className="font-display text-[13px] font-medium tabular-nums text-ink">
                            {segment.count}
                          </span>
                          <span className="w-11 text-right font-display text-[12px] tabular-nums text-ink-tertiary">
                            {share(segment.count, excluded)}
                          </span>
                        </li>
                      ))}
                  </ul>
                </>
              ) : (
                <EmptyState title={t('exclusions.empty')} />
              )}
            </Panel>

            <Panel
              icon={<UsersIcon size={15} />}
              title={t('unassigned.title')}
              hint={t('unassigned.hint', { count: execution.unassigned })}
            >
              {sumBreakdown(execution.unassignedBreakdown) > 0 ? (
                <PriorityBar segments={unassignedSegments} height={12} />
              ) : (
                <EmptyState title={t('unassigned.empty')} />
              )}
            </Panel>
          </div>
        </div>
      )}

      {execution.status === 'failed' ? null : (
        <>
          {/* The engine, step by step */}
          <section className="flex flex-col gap-4 rounded-xl border border-card-border bg-card p-5">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-display text-[15px] font-semibold text-ink">
                {t('funnel.title')}
              </h2>
              <p className="text-[12px] text-ink-tertiary">{t('funnel.hint')}</p>
            </div>
            <ol className="flex flex-col gap-3">
              {(
                [
                  {
                    step: 'analysed',
                    value: execution.analysed,
                    color: 'var(--color-ink-tertiary)',
                  },
                  { step: 'excluded', value: excluded, color: 'var(--color-gauge-danger)' },
                  { step: 'eligible', value: execution.eligible, color: 'var(--color-accent)' },
                  {
                    step: 'assigned',
                    value: execution.mailsToSend,
                    color: 'var(--color-gauge-success)',
                  },
                  {
                    step: 'unassigned',
                    value: execution.unassigned,
                    color: 'var(--color-gauge-warning)',
                  },
                ] as const
              ).map((row) => (
                <li key={row.step} className="flex items-center gap-4">
                  <span className="flex w-64 shrink-0 flex-col">
                    <span className="text-[12.5px] font-medium text-ink">
                      {t(`funnel.steps.${row.step}.label`)}
                    </span>
                    <span className="text-[11.5px] leading-snug text-ink-tertiary">
                      {t(`funnel.steps.${row.step}.hint`, { margin: settings.seatMargin })}
                    </span>
                  </span>
                  <span className="flex h-4 grow overflow-hidden rounded-full bg-gauge-neutral-track">
                    <span
                      className="rounded-full"
                      style={{
                        width: `${Math.max(2, Math.round((row.value / Math.max(1, execution.analysed)) * 100))}%`,
                        background: row.color,
                      }}
                    />
                  </span>
                  <span className="w-14 shrink-0 text-right font-display text-[15px] font-semibold tabular-nums text-ink">
                    {row.value}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Exclusions, explained */}
          <section className="flex flex-col gap-4 rounded-xl border border-card-border bg-card p-5">
            <h2 className="font-display text-[15px] font-semibold text-ink">
              {t('exclusionsTable.title')}
            </h2>
            <Table
              head={
                <tr>
                  <Th>{t('exclusionsTable.columns.reason')}</Th>
                  <Th>{t('exclusionsTable.columns.description')}</Th>
                  <Th align="right">{t('exclusionsTable.columns.count')}</Th>
                  <Th align="right">{t('exclusionsTable.columns.share')}</Th>
                </tr>
              }
            >
              {EXCLUSION_ORDER.map((reason) => {
                const entry = execution.exclusionBreakdown.find((item) => item.reason === reason);
                const count = entry?.count ?? 0;
                return (
                  <tr key={reason} className="ui-row">
                    <Td>
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <span
                          aria-hidden
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: EXCLUSION_COLORS[reason] }}
                        />
                        <span className="text-[12.5px] font-medium text-ink">
                          {t(`exclusions.reasons.${reason}`)}
                        </span>
                      </span>
                    </Td>
                    <Td>
                      <span className="text-[12px] text-ink-secondary">
                        {t(`exclusionsTable.descriptions.${reason}`, {
                          days: settings.daysBetweenMails,
                        })}
                      </span>
                    </Td>
                    <Td align="right">
                      <span className="font-display text-[13px] font-medium tabular-nums">
                        {count}
                      </span>
                    </Td>
                    <Td align="right">
                      <span className="font-display text-[12px] tabular-nums text-ink-tertiary">
                        {share(count, excluded)}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </Table>
          </section>

          {/* Assignments per slot */}
          <section className="flex flex-col gap-4 rounded-xl border border-card-border bg-card p-5">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-display text-[15px] font-semibold text-ink">
                {t('slots.title')}
              </h2>
              <p className="text-[12px] text-ink-tertiary">
                {t('slots.hint', { margin: settings.seatMargin })}
              </p>
            </div>
            <Table
              head={
                <tr>
                  <Th>{t('slots.columns.session')}</Th>
                  <Th>{t('slots.columns.site')}</Th>
                  <Th>{t('slots.columns.occupancy')}</Th>
                  <Th align="right">{t('slots.columns.free')}</Th>
                  <Th align="right">{t('slots.columns.invitations')}</Th>
                </tr>
              }
            >
              {slotAssignments.map((slot) => (
                <tr key={slot.sessionId} className="ui-row">
                  <Td>
                    <Link
                      href={`/admin/sessions/${slot.sessionId}`}
                      className="flex flex-col gap-0.5"
                    >
                      <span className="text-[13px] font-medium text-ink">
                        {slot.trainingNames.join(', ')}
                      </span>
                      <span className="text-[11.5px] text-ink-tertiary">
                        {formatLongDate(slot.date)} · {slot.startTime}
                      </span>
                    </Link>
                  </Td>
                  <Td>
                    <span className="text-[12.5px] text-ink-secondary">{slot.site}</span>
                  </Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <span className="flex h-1.5 w-24 overflow-hidden rounded-full bg-gauge-neutral-track">
                        <span
                          className="rounded-full bg-accent"
                          style={{
                            width: `${Math.round((slot.registered / slot.capacity) * 100)}%`,
                          }}
                        />
                      </span>
                      <span className="font-display text-[12px] tabular-nums text-ink-secondary">
                        {slot.registered}/{slot.capacity}
                      </span>
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-display text-[13px] tabular-nums">{slot.freeSeats}</span>
                  </Td>
                  <Td align="right">
                    <span className="font-display text-[13px] font-semibold tabular-nums text-accent">
                      {slot.invitations}
                    </span>
                  </Td>
                </tr>
              ))}
            </Table>
          </section>

          {/* Mails preview */}
          <section className="flex flex-col gap-4 rounded-xl border border-card-border bg-card p-5">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-display text-[15px] font-semibold text-ink">
                {t('mailsPreview.title')}
              </h2>
              <p className="text-[12px] text-ink-tertiary">{t('mailsPreview.hint')}</p>
            </div>
            <Table
              head={
                <tr>
                  <Th>{t('mailsPreview.columns.user')}</Th>
                  <Th>{t('mailsPreview.columns.training')}</Th>
                  <Th>{t('mailsPreview.columns.priority')}</Th>
                  <Th align="right">{t('mailsPreview.columns.score')}</Th>
                  <Th>{t('mailsPreview.columns.status')}</Th>
                </tr>
              }
            >
              {previewRows.map((mail) => (
                <tr key={`${mail.userId}-${mail.trainingName}`} className="ui-row">
                  <Td>
                    <Link href={`/admin/users/${mail.userId}`} className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-medium text-ink">{mail.userName}</span>
                      <span className="text-[11.5px] text-ink-tertiary">{mail.site}</span>
                    </Link>
                  </Td>
                  <Td>
                    <span className="text-[12.5px] text-ink-secondary">{mail.trainingName}</span>
                  </Td>
                  <Td>
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: PRIORITY_COLORS[mail.category] }}
                      />
                      <span className="text-[12.5px] text-ink-secondary">
                        {t(`priority.categories.${mail.category}`)}
                      </span>
                    </span>
                  </Td>
                  <Td align="right">
                    <span className="font-display text-[13px] font-semibold tabular-nums">
                      {mail.score}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${
                        mail.status === 'sent'
                          ? 'bg-success-tint text-success'
                          : 'bg-accent-tint text-accent'
                      }`}
                    >
                      {t(`mailsPreview.status.${mail.status}`)}
                    </span>
                  </Td>
                </tr>
              ))}
            </Table>
            <p className="text-[11.5px] text-ink-tertiary">
              {t('mailsPreview.footer', {
                shown: previewRows.length,
                total: execution.mailsToSend,
              })}
            </p>
          </section>
        </>
      )}
    </div>
  );
}

/** Share of a total, "31 %". */
function share(count: number, total: number): string {
  if (total <= 0) return '0 %';
  return `${Math.round((count / total) * 100)} %`;
}

const KPI_TONE = {
  neutral: 'bg-card-muted text-ink-tertiary',
  accent: 'bg-accent-tint text-accent',
  success: 'bg-success-tint text-success',
  warning: 'bg-warning-tint text-warning-text',
} as const;

function KpiCell({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  tone: keyof typeof KPI_TONE;
}) {
  return (
    <div className="flex flex-col gap-2.5 bg-card px-5 py-4">
      <span className="flex items-center gap-2 text-[12px] font-medium text-ink-tertiary">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${KPI_TONE[tone]}`}>
          {icon}
        </span>
        {label}
      </span>
      <span className="font-display text-[30px] leading-none font-semibold text-ink">{value}</span>
    </div>
  );
}

function Panel({
  icon,
  title,
  hint,
  children,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-xl border border-card-border bg-card">
      <header className="flex items-start gap-2.5 border-b border-divider px-5 py-3.5">
        <span className="mt-0.5 shrink-0 text-ink-tertiary">{icon}</span>
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>
          <p className="text-[12px] text-ink-tertiary">{hint}</p>
        </div>
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Notice({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <section className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-tint px-4 py-3.5 text-danger-text">
      <span className="mt-px shrink-0">{icon}</span>
      <div className="flex flex-col gap-1">
        <p className="text-[13px] font-semibold">{title}</p>
        <p className="text-[12.5px] leading-relaxed">{body}</p>
      </div>
    </section>
  );
}

/** Small rounded label. */
function Pill({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}
