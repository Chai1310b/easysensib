'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/admin/Button';
import { Modal } from '@/components/admin/Modal';
import { CrossIcon } from './certificateIcons';
import type { CertificateRow } from './CertificateReviewBoard';

const PRESET_KEYS = ['unreadable', 'expired', 'wrongTraining', 'incomplete'] as const;

interface RejectCertificateModalProps {
  row: CertificateRow | null;
  onClose: () => void;
  onConfirm: (row: CertificateRow, reason: string) => void;
}

/**
 * Asks for the rejection reason before dropping a certificate.
 * The caller remounts it per row (`key`), so the draft reason resets by itself.
 */
export function RejectCertificateModal({ row, onClose, onConfirm }: RejectCertificateModalProps) {
  const t = useTranslations('adminCertificates');
  const tCommon = useTranslations('adminCommon');
  const [reason, setReason] = useState('');

  if (!row) return null;

  const trimmed = reason.trim();

  return (
    <Modal
      open
      onClose={onClose}
      title={t('reject.title')}
      subtitle={t('reject.subtitle', { name: row.userName, training: row.trainingName })}
      closeLabel={tCommon('actions.close')}
      width={480}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {tCommon('actions.cancel')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={trimmed.length === 0}
            onClick={() => onConfirm(row, trimmed)}
          >
            <CrossIcon size={13} />
            {t('reject.confirm')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="rounded-lg bg-danger-tint px-3 py-2 text-[12.5px] text-danger-text">
          {t('reject.notice')}
        </p>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
            {t('reject.suggestions')}
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_KEYS.map((key) => {
              const label = t(`reject.presets.${key}`);
              const active = trimmed === label;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setReason(label)}
                  className={`ui-pressable flex h-8 cursor-pointer items-center rounded-full border px-3 text-[12.5px] font-medium transition-colors duration-200 ${
                    active
                      ? 'border-accent-border bg-accent-tint text-accent'
                      : 'border-card-border bg-card text-ink-secondary hover:bg-card-muted'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold tracking-[0.06em] text-ink-tertiary uppercase">
            {t('reject.label')}
          </span>
          <textarea
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t('reject.placeholder')}
            className="w-full resize-none rounded-lg border border-card-border bg-card px-3 py-2.5 text-[13px] text-ink transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-ink-disabled focus:border-accent-border focus:shadow-[0_0_0_3px_var(--color-accent-surface)]"
          />
        </label>
      </div>
    </Modal>
  );
}
