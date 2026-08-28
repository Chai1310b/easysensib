import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/Card';
import { IconButton } from '@/components/IconButton';
import { StatusPill } from '@/components/StatusPill';
import { ChevronLeftIcon, FileIcon, UploadIcon } from '@/components/icons';
import { formatLongDate, formatMonthYear } from '@/lib/format';
import type { Certificate } from '@/lib/types';
import { getCertificates } from '@/services/certificates';

/** E-learning certificates page (mockup: Certificats). */
export default async function CertificatesPage() {
  const [certificates, t, tCommon] = await Promise.all([
    getCertificates(),
    getTranslations('certificates'),
    getTranslations('common'),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-6 pt-8 pb-14 min-[1032px]:px-0">
      <Link
        href="/"
        className="flex items-center gap-2 text-[13px] font-medium text-ink-secondary! hover:text-ink-secondary!"
      >
        <ChevronLeftIcon size={14} />
        {tCommon('actions.backToHome')}
      </Link>

      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[26px] font-semibold">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>

      <Card className="flex flex-col">
        {certificates.map((certificate) => (
          <CertificateRow
            key={certificate.id}
            certificate={certificate}
            uploadedLabel={buildMetaLine(certificate, t)}
            statusLabel={buildStatusLabel(certificate, t)}
            downloadLabel={tCommon('actions.download')}
            reuploadLabel={t('reupload')}
          />
        ))}
      </Card>

      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#c8cbc4] bg-[#fafaf8] p-7">
        <input type="file" accept=".pdf,image/*" className="hidden" />
        <UploadIcon size={26} />
        <span className="text-sm font-semibold text-ink">{t('dropzone.title')}</span>
        <span className="text-xs text-ink-tertiary">{t('dropzone.hint')}</span>
      </label>
    </div>
  );
}

type Translate = Awaited<ReturnType<typeof getTranslations<'certificates'>>>;

/** "certificat-accueil.pdf · déposé le 2 mai 2026" plus the rejection reason when rejected. */
function buildMetaLine(certificate: Certificate, t: Translate): string {
  const parts = [
    certificate.fileName,
    t('uploadedOn', { date: formatLongDate(certificate.uploadedAt) }),
  ];
  if (certificate.status === 'invalidated' && certificate.rejectionReason) {
    parts.push(t('rejectionReason', { reason: certificate.rejectionReason }));
  }
  return parts.join(' · ');
}

function buildStatusLabel(certificate: Certificate, t: Translate): string {
  if (certificate.status === 'approved') {
    return t('status.approved', {
      monthYear: certificate.validUntil ? formatMonthYear(certificate.validUntil) : '',
    });
  }
  return t('status.invalidated');
}

const PILL_BY_STATUS = {
  approved: { tone: 'success', icon: 'check' },
  invalidated: { tone: 'danger', icon: 'cross' },
} as const;

interface CertificateRowProps {
  certificate: Certificate;
  uploadedLabel: string;
  statusLabel: string;
  downloadLabel: string;
  reuploadLabel: string;
}

function CertificateRow({
  certificate,
  uploadedLabel,
  statusLabel,
  downloadLabel,
  reuploadLabel,
}: CertificateRowProps) {
  const pill = PILL_BY_STATUS[certificate.status];

  return (
    <div className="flex items-center gap-[18px] border-b border-divider px-[22px] py-[18px] last:border-b-0">
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg bg-btn-secondary">
        <FileIcon size={20} />
      </div>
      <div className="flex min-w-0 grow flex-col gap-[3px]">
        <span className="truncate text-[15px] font-semibold">{certificate.trainingName}</span>
        <span className="truncate text-xs text-ink-tertiary">{uploadedLabel}</span>
      </div>
      <StatusPill tone={pill.tone} icon={pill.icon}>
        {statusLabel}
      </StatusPill>
      {certificate.status === 'invalidated' ? (
        <Link href="/certificates" className="shrink-0 text-[13px] font-semibold">
          {reuploadLabel}
        </Link>
      ) : (
        <IconButton icon="download" label={downloadLabel} />
      )}
    </div>
  );
}
