'use client';

/**
 * E-learning certificates list shared by the training page and the user page.
 * A deposited certificate counts as validated; a manager can invalidate it
 * with a reason (simulated with a toast).
 */
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CertificateReview } from '@/lib/admin-types';
import { formatLongDate } from '@/lib/format';
import { FileIcon } from '@/components/icons';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import { Modal } from './Modal';
import { useToast } from './Toast';

interface CertificatesPanelProps {
  certificates: CertificateReview[];
  /** 'user' shows the user column (training page); 'training' the opposite. */
  context: 'user' | 'training';
}

const FIELD =
  'w-full rounded-lg border border-card-border bg-card px-3 py-2 text-[13px] text-ink transition-[border-color,box-shadow] duration-200 outline-none focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)]';

export function CertificatesPanel({ certificates, context }: CertificatesPanelProps) {
  const t = useTranslations('adminCommon');
  const { showToast } = useToast();
  const [items, setItems] = useState(certificates);
  const [target, setTarget] = useState<CertificateReview | null>(null);
  const [reason, setReason] = useState('');

  function confirmInvalidate() {
    if (!target || reason.trim().length === 0) return;
    setItems((current) =>
      current.map((item) =>
        item.id === target.id
          ? { ...item, status: 'invalidated' as const, invalidationReason: reason.trim() }
          : item,
      ),
    );
    showToast(t('certificatesPanel.invalidatedToast'), 'success');
    setTarget(null);
    setReason('');
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('certificatesPanel.empty')}
        description={t('certificatesPanel.emptyHint')}
      />
    );
  }

  return (
    <>
      <ul className="flex flex-col overflow-hidden rounded-xl border border-card-border bg-card">
        {items.map((certificate) => (
          <li
            key={certificate.id}
            className="flex items-center gap-4 border-b border-divider px-5 py-4 last:border-b-0"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-btn-secondary">
              <FileIcon size={18} />
            </span>
            <span className="flex min-w-0 grow flex-col gap-0.5">
              <Link
                href={
                  context === 'user'
                    ? `/admin/users/${certificate.userId}`
                    : `/admin/trainings/${certificate.trainingId}`
                }
                className="truncate text-[14px] font-semibold text-ink! hover:text-accent!"
              >
                {context === 'user' ? certificate.userName : certificate.trainingName}
              </Link>
              <span className="truncate text-[12px] text-ink-tertiary">
                {certificate.fileName} ·{' '}
                {t('certificatesPanel.uploadedOn', {
                  date: formatLongDate(certificate.uploadedAt),
                })}
                {certificate.status === 'invalidated' && certificate.invalidationReason
                  ? ` · ${t('certificatesPanel.reasonInline', {
                      reason: certificate.invalidationReason,
                    })}`
                  : ''}
              </span>
            </span>
            {certificate.status === 'invalidated' ? (
              <span className="rounded-full bg-danger-tint px-2.5 py-0.5 text-[11.5px] font-semibold text-danger-text">
                {t('certificatesPanel.invalidated')}
              </span>
            ) : (
              <>
                <span className="rounded-full bg-success-tint px-2.5 py-0.5 text-[11.5px] font-semibold text-success">
                  {t('certificatesPanel.valid')}
                </span>
                <Button variant="outline" size="sm" onClick={() => setTarget(certificate)}>
                  {t('certificatesPanel.invalidate')}
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title={t('certificatesPanel.modalTitle')}
        subtitle={
          target ? `${target.userName} · ${target.trainingName} · ${target.fileName}` : undefined
        }
        closeLabel={t('actions.cancel')}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setTarget(null)}>
              {t('actions.cancel')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={reason.trim().length === 0}
              onClick={confirmInvalidate}
            >
              {t('certificatesPanel.confirm')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <p>{t('certificatesPanel.modalBody')}</p>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-ink-secondary">
              {t('certificatesPanel.reasonLabel')}
            </span>
            <textarea
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className={FIELD}
            />
          </label>
        </div>
      </Modal>
    </>
  );
}
