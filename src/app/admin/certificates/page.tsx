import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { getCertificateReviews } from '@/services/admin/certificates';
import { CertificateReviewBoard, type CertificateRow } from './CertificateReviewBoard';

const MS_PER_DAY = 86_400_000;

/**
 * Age of an upload in whole days. Computed on the server so the client never
 * re-derives it from its own clock (which would break hydration).
 */
function daysSince(iso: string, today: Date): number {
  const uploaded = new Date(`${iso}T00:00:00`);
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.round((midnight.getTime() - uploaded.getTime()) / MS_PER_DAY));
}

/**
 * Certificate review page: e-learning proofs uploaded by users wait here for an
 * approval or a rejection ("validation par contrôle" of the open questions doc).
 */
export default async function AdminCertificatesPage() {
  const [t, tCommon, reviews] = await Promise.all([
    getTranslations('adminCertificates'),
    getTranslations('adminCommon'),
    getCertificateReviews(),
  ]);

  const today = new Date();
  const rows: CertificateRow[] = reviews.map((review) => ({
    ...review,
    ageDays: daysSince(review.uploadedAt, today),
  }));

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <Breadcrumb
          items={[
            { label: tCommon('breadcrumb.root'), href: '/admin' },
            { label: t('breadcrumb') },
          ]}
          ariaLabel={tCommon('breadcrumb.ariaLabel')}
        />
        <h1 className="font-display text-[26px] font-semibold">{t('title')}</h1>
        <p className="max-w-[720px] text-sm text-ink-secondary">{t('subtitle')}</p>
      </header>

      <CertificateReviewBoard rows={rows} />
    </div>
  );
}
