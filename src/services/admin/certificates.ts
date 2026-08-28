/**
 * E-learning certificates service. A deposited certificate counts as
 * validated right away; a manager can invalidate it afterwards.
 * Backend switch point: only the function bodies change once the API exists.
 */
import type { CertificateReview } from '@/lib/admin-types';
import { certificateReviewsFixture } from './fixtures';

export async function getCertificatesForTraining(trainingId: string): Promise<CertificateReview[]> {
  return certificateReviewsFixture
    .filter((certificate) => certificate.trainingId === trainingId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function getCertificatesForUser(userId: string): Promise<CertificateReview[]> {
  return certificateReviewsFixture
    .filter((certificate) => certificate.userId === userId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

/** Certificates deposited over the last 30 days (dashboard indicator). */
export async function countRecentCertificates(): Promise<number> {
  return certificateReviewsFixture.filter((c) => c.uploadedAt >= '2026-07-27').length;
}
