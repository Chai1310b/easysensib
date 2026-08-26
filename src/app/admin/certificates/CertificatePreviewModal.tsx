'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/admin/Button';
import { Modal } from '@/components/admin/Modal';
import { formatLongDate } from '@/lib/format';
import { CheckIcon } from './certificateIcons';
import type { CertificateRow } from './CertificateReviewBoard';

interface CertificatePreviewModalProps {
  row: CertificateRow | null;
  onClose: () => void;
  /** Approve straight from the preview; omitted for already reviewed rows. */
  onApprove?: (row: CertificateRow) => void;
}

/**
 * Mock rendering of the uploaded proof. No document is fetched: the panel shows
 * the metadata the review actually carries, framed like a paper certificate.
 */
export function CertificatePreviewModal({ row, onClose, onApprove }: CertificatePreviewModalProps) {
  const t = useTranslations('adminCertificates');
  const tCommon = useTranslations('adminCommon');

  if (!row) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title={t('preview.title')}
      subtitle={t('preview.subtitle', { fileName: row.fileName, size: row.fileSizeKb })}
      closeLabel={tCommon('actions.close')}
      width={520}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {tCommon('actions.close')}
          </Button>
          {onApprove ? (
            <Button
              size="sm"
              onClick={() => {
                onApprove(row);
                onClose();
              }}
            >
              <CheckIcon size={14} />
              {t('preview.approveFromPreview')}
            </Button>
          ) : null}
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="rounded-lg bg-accent-surface px-3 py-2 text-[12.5px] text-ink-tertiary">
          {t('preview.demoNotice')}
        </p>

        <div className="relative overflow-hidden rounded-lg border border-card-border bg-card-muted p-5">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-3 right-4 rotate-[14deg] font-display text-[40px] leading-none font-semibold text-ink-disabled/25 select-none"
          >
            DEMO
          </span>

          <p className="font-display text-[15px] font-semibold text-ink">{t('preview.docTitle')}</p>
          <p className="mt-0.5 text-[12.5px] text-ink-tertiary">{t('preview.docSubtitle')}</p>

          <div className="my-4 h-px bg-card-border" />

          <dl className="flex flex-col gap-2.5">
            <PreviewField label={t('preview.fieldUser')} value={row.userName} />
            <PreviewField label={t('preview.fieldTraining')} value={row.trainingName} />
            <PreviewField
              label={t('preview.fieldCompletedAt')}
              value={row.completedAt ? formatLongDate(row.completedAt) : t('file.completedUnknown')}
            />
            <PreviewField
              label={t('preview.fieldScore')}
              value={t('preview.score')}
              tone="success"
            />
          </dl>

          <div className="mt-5 flex flex-col gap-1.5">
            <span className="h-1.5 w-[62%] rounded-full bg-card-border" />
            <span className="h-1.5 w-[46%] rounded-full bg-card-border" />
            <span className="h-1.5 w-[54%] rounded-full bg-card-border" />
          </div>

          <p className="mt-4 text-[11px] tracking-[0.04em] text-ink-disabled uppercase">
            {t('preview.signature')}
          </p>
        </div>
      </div>
    </Modal>
  );
}

function PreviewField({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'success';
}) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-[132px] shrink-0 text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
        {label}
      </dt>
      <dd className={`text-[13px] font-medium ${tone === 'success' ? 'text-success' : 'text-ink'}`}>
        {value}
      </dd>
    </div>
  );
}
