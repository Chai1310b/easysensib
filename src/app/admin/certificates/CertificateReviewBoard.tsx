'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/admin/EmptyState';
import { SearchInput } from '@/components/admin/SearchInput';
import { StatTile } from '@/components/admin/StatTile';
import { Table, TableEmptyRow, Td, Th, Tr } from '@/components/admin/DataTable';
import { BadgeCheckIcon, InboxIcon } from '@/components/admin/adminIcons';
import { useToast } from '@/components/admin/Toast';
import { formatLongDate } from '@/lib/format';
import type { CertificateReview } from '@/lib/admin-types';
import { CertificatePreviewModal } from './CertificatePreviewModal';
import { RejectCertificateModal } from './RejectCertificateModal';
import {
  ArchiveIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CrossIcon,
  EyeIcon,
  FileImageIcon,
  FileTextIcon,
} from './certificateIcons';

/** A review plus its age in days, computed once on the server. */
export interface CertificateRow extends CertificateReview {
  ageDays: number;
}

/** Above this age an upload is flagged as waiting for too long. */
const AGEING_DAYS = 7;

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

/**
 * Literal `--ui-index` classes so the row cascade survives the Tailwind scan
 * (dynamically built class names are never generated).
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
];

function staggerClass(index: number): string {
  return `ui-stagger ${STAGGER[Math.min(index, STAGGER.length - 1)]}`;
}

interface LocalDecision {
  status: 'approved' | 'rejected';
  reason?: string;
}

interface ProcessedItem {
  row: CertificateRow;
  decision: LocalDecision;
  /** True when the decision was taken during this visit. */
  isLocal: boolean;
}

interface CertificateReviewBoardProps {
  rows: CertificateRow[];
}

/**
 * Client shell of the certificate review page: search, decisions taken in local
 * state (the backend does not exist yet) and the collapsible history below.
 */
export function CertificateReviewBoard({ rows }: CertificateReviewBoardProps) {
  const t = useTranslations('adminCertificates');
  const tCommon = useTranslations('adminCommon');
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [decisions, setDecisions] = useState<Record<string, LocalDecision>>({});
  const [previewRow, setPreviewRow] = useState<CertificateRow | null>(null);
  const [rejectRow, setRejectRow] = useState<CertificateRow | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const pending = useMemo(
    () => rows.filter((row) => row.status === 'pending' && !decisions[row.id]),
    [rows, decisions],
  );

  const visiblePending = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return pending;
    return pending.filter((row) =>
      `${row.userName} ${row.trainingName} ${row.fileName} ${row.site}`
        .toLowerCase()
        .includes(needle),
    );
  }, [pending, search]);

  const processed = useMemo<ProcessedItem[]>(() => {
    const justDecided: ProcessedItem[] = [];
    const fromFixtures: ProcessedItem[] = [];

    for (const row of rows) {
      const local = decisions[row.id];
      if (local) {
        justDecided.push({ row, decision: local, isLocal: true });
      } else if (row.status !== 'pending') {
        fromFixtures.push({
          row,
          decision: {
            status: row.status,
            ...(row.rejectionReason ? { reason: row.rejectionReason } : {}),
          },
          isLocal: false,
        });
      }
    }

    return [...justDecided, ...fromFixtures];
  }, [rows, decisions]);

  const approvedCount = processed.filter((item) => item.decision.status === 'approved').length;
  const rejectedCount = processed.filter((item) => item.decision.status === 'rejected').length;
  const ageingCount = pending.filter((row) => row.ageDays > AGEING_DAYS).length;

  const approve = (row: CertificateRow) => {
    setDecisions((current) => ({ ...current, [row.id]: { status: 'approved' } }));
    showToast(t('toast.approved', { name: row.userName }), 'success');
  };

  const reject = (row: CertificateRow, reason: string) => {
    setDecisions((current) => ({ ...current, [row.id]: { status: 'rejected', reason } }));
    setRejectRow(null);
    showToast(t('toast.rejected', { name: row.userName }), 'error');
  };

  const pendingCountLabel =
    pending.length === 0
      ? t('pending.countZero')
      : pending.length === 1
        ? t('pending.countOne')
        : t('pending.countOther', { count: pending.length });

  return (
    <div className="flex flex-col gap-7">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          value={pending.length}
          label={t('stats.pending')}
          hint={t('stats.pendingHint', { total: rows.length })}
          tone="warning"
          icon={<InboxIcon size={16} />}
          className="ui-stagger"
        />
        <StatTile
          value={ageingCount}
          label={t('stats.aging')}
          hint={t('stats.agingHint')}
          tone="danger"
          icon={<ClockIcon size={16} />}
          className="ui-stagger [--ui-index:1]"
        />
        <StatTile
          value={approvedCount}
          label={t('stats.approved')}
          hint={t('stats.approvedHint')}
          tone="success"
          icon={<BadgeCheckIcon size={16} />}
          className="ui-stagger [--ui-index:2]"
        />
        <StatTile
          value={rejectedCount}
          label={t('stats.rejected')}
          hint={t('stats.rejectedHint')}
          tone="neutral"
          icon={<CrossIcon size={16} />}
          className="ui-stagger [--ui-index:3]"
        />
      </section>

      <section className="flex flex-col gap-3.5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              {t('pending.title')}
            </h2>
            <span className="font-display text-[13px] tabular-nums text-ink-tertiary">
              {pendingCountLabel}
            </span>
          </div>
          <SearchInput
            placeholder={t('pending.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </header>

        {pending.length === 0 ? (
          <EmptyState title={t('pending.empty')} description={t('pending.emptyHint')} />
        ) : (
          <Table
            head={
              <tr>
                <Th>{t('columns.user')}</Th>
                <Th>{t('columns.training')}</Th>
                <Th>{t('columns.file')}</Th>
                <Th>{t('columns.uploadedAt')}</Th>
                <Th>{t('columns.age')}</Th>
                <Th align="right">{t('columns.actions')}</Th>
              </tr>
            }
          >
            {visiblePending.length === 0 ? (
              <TableEmptyRow colSpan={6}>
                <span className="font-medium text-ink-secondary">{t('pending.emptySearch')}</span>
                <br />
                {t('pending.emptySearchHint')}
              </TableEmptyRow>
            ) : (
              visiblePending.map((row, index) => (
                <Tr key={row.id} className={staggerClass(index)}>
                  <Td>
                    <UserCell name={row.userName} site={row.site} />
                  </Td>
                  <Td>
                    <span className="font-medium">{row.trainingName}</span>
                  </Td>
                  <Td>
                    <FileCell
                      fileName={row.fileName}
                      sizeLabel={t('file.size', { size: row.fileSizeKb })}
                    />
                  </Td>
                  <Td>
                    <span className="whitespace-nowrap text-ink-secondary">
                      {formatLongDate(row.uploadedAt)}
                    </span>
                  </Td>
                  <Td>
                    <AgeBadge
                      ageDays={row.ageDays}
                      todayLabel={t('age.today')}
                      oneDayLabel={t('age.oneDay')}
                      daysLabel={t('age.days', { days: row.ageDays })}
                      lateAria={t('age.ariaLate')}
                    />
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton
                        label={t('actions.previewAria', { name: row.userName })}
                        onClick={() => setPreviewRow(row)}
                      >
                        <EyeIcon size={15} />
                      </IconButton>
                      <DecisionButton
                        tone="approve"
                        label={t('actions.approve')}
                        ariaLabel={t('actions.approveAria', { name: row.userName })}
                        onClick={() => approve(row)}
                      >
                        <CheckIcon size={13} />
                      </DecisionButton>
                      <DecisionButton
                        tone="reject"
                        label={t('actions.reject')}
                        ariaLabel={t('actions.rejectAria', { name: row.userName })}
                        onClick={() => setRejectRow(row)}
                      >
                        <CrossIcon size={13} />
                      </DecisionButton>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </Table>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-card-border bg-card">
        <button
          type="button"
          aria-expanded={historyOpen}
          onClick={() => setHistoryOpen((open) => !open)}
          className="ui-row flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left transition-colors duration-200 hover:bg-card-muted"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card-muted text-ink-tertiary">
            <ArchiveIcon size={16} />
          </span>
          <span className="flex min-w-0 grow flex-col gap-0.5">
            <span className="font-display text-[15px] font-semibold text-ink">
              {t('processed.title')}
            </span>
            <span className="truncate text-xs text-ink-tertiary">{t('processed.hint')}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2 text-[12.5px] font-medium text-ink-secondary">
            <span className="font-display tabular-nums">{processed.length}</span>
            <span className="hidden sm:inline">
              {historyOpen ? t('processed.hide') : t('processed.show')}
            </span>
            <span
              className={`text-ink-tertiary transition-transform duration-200 ${
                historyOpen ? 'rotate-180' : ''
              }`}
            >
              <ChevronDownIcon size={14} />
            </span>
          </span>
        </button>

        {historyOpen ? (
          <div className="border-t border-divider">
            {processed.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="font-display text-[15px] font-semibold text-ink">
                  {t('processed.empty')}
                </p>
                <p className="mt-1 text-[13px] text-ink-tertiary">{t('processed.emptyHint')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <Th>{t('columns.user')}</Th>
                      <Th>{t('columns.training')}</Th>
                      <Th>{t('columns.decision')}</Th>
                      <Th>{t('columns.reviewedBy')}</Th>
                      <Th>{t('columns.reason')}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {processed.map(({ row, decision, isLocal }, index) => (
                      <Tr key={row.id} className={staggerClass(index)}>
                        <Td>
                          <UserCell name={row.userName} site={row.site} />
                        </Td>
                        <Td>{row.trainingName}</Td>
                        <Td>
                          <DecisionPill
                            status={decision.status}
                            label={tCommon(`status.${decision.status}`)}
                          />
                        </Td>
                        <Td>
                          <span className="flex flex-col gap-0.5">
                            <span className="text-ink-secondary">
                              {isLocal ? t('processed.you') : (row.reviewedBy ?? '')}
                            </span>
                            <span className="text-xs whitespace-nowrap text-ink-tertiary">
                              {isLocal
                                ? t('processed.justNow')
                                : t('processed.uploadedOn', {
                                    date: formatLongDate(row.uploadedAt),
                                  })}
                            </span>
                          </span>
                        </Td>
                        <Td>
                          {decision.reason ? (
                            <span className="text-ink-secondary">{decision.reason}</span>
                          ) : (
                            <span className="text-ink-disabled">{t('processed.noReason')}</span>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </section>

      <CertificatePreviewModal
        row={previewRow}
        onClose={() => setPreviewRow(null)}
        onApprove={approve}
      />
      <RejectCertificateModal
        key={rejectRow?.id ?? 'reject-none'}
        row={rejectRow}
        onClose={() => setRejectRow(null)}
        onConfirm={reject}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cells                                                               */
/* ------------------------------------------------------------------ */

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function UserCell({ name, site }: { name: string; site: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-tint font-display text-[11.5px] font-semibold text-accent">
        {initials(name)}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs text-ink-tertiary">{site}</span>
      </span>
    </span>
  );
}

function FileCell({ fileName, sizeLabel }: { fileName: string; sizeLabel: string }) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  const isImage = IMAGE_EXTENSIONS.includes(extension);

  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card-muted text-ink-tertiary">
        {isImage ? <FileImageIcon size={15} /> : <FileTextIcon size={15} />}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="block max-w-[200px] truncate">{fileName}</span>
        <span className="font-display text-xs tabular-nums text-ink-tertiary">{sizeLabel}</span>
      </span>
    </span>
  );
}

function AgeBadge({
  ageDays,
  todayLabel,
  oneDayLabel,
  daysLabel,
  lateAria,
}: {
  ageDays: number;
  todayLabel: string;
  oneDayLabel: string;
  daysLabel: string;
  lateAria: string;
}) {
  const label = ageDays === 0 ? todayLabel : ageDays === 1 ? oneDayLabel : daysLabel;

  if (ageDays <= AGEING_DAYS) {
    return <span className="whitespace-nowrap text-ink-tertiary">{label}</span>;
  }

  return (
    <span
      title={lateAria}
      className="inline-flex items-center gap-1.5 rounded-full bg-warning-tint px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-warning-text"
    >
      <ClockIcon size={12} />
      {label}
    </span>
  );
}

function DecisionPill({ status, label }: { status: 'approved' | 'rejected'; label: string }) {
  const tone =
    status === 'approved' ? 'bg-success-tint text-success' : 'bg-danger-tint text-danger-text';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap ${tone}`}
    >
      {status === 'approved' ? <CheckIcon size={12} /> : <CrossIcon size={12} />}
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="ui-pressable flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-card-border bg-card text-ink-secondary transition-colors duration-200 hover:border-accent-border hover:bg-accent-surface hover:text-accent"
    >
      {children}
    </button>
  );
}

function DecisionButton({
  tone,
  label,
  ariaLabel,
  onClick,
  children,
}: {
  tone: 'approve' | 'reject';
  label: string;
  ariaLabel: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const style =
    tone === 'approve'
      ? 'bg-success-tint text-success hover:bg-[#dceadf]'
      : 'bg-danger-tint text-danger-text hover:bg-[#f3ddda]';

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`ui-pressable inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold transition-colors duration-200 ${style}`}
    >
      {children}
      {label}
    </button>
  );
}
