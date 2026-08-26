/**
 * Certificates to review service (e-learning proofs uploaded by users).
 * Backend switch point: only the function bodies change once the API exists.
 */
import type { CertificateReview, CertificateReviewStatus } from '@/lib/admin-types';
import { certificateReviewsFixture } from './fixtures';

export interface CertificateReviewFilters {
  status?: CertificateReviewStatus;
  /** Case-insensitive match on user name, training name or file name. */
  search?: string;
}

export async function getCertificateReviews(
  filters: CertificateReviewFilters = {},
): Promise<CertificateReview[]> {
  const search = filters.search?.trim().toLowerCase();

  return certificateReviewsFixture
    .filter((review) => {
      if (filters.status && review.status !== filters.status) return false;
      if (search) {
        const haystack =
          `${review.userName} ${review.trainingName} ${review.fileName}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    })
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function getCertificateReview(id: string): Promise<CertificateReview | null> {
  return certificateReviewsFixture.find((review) => review.id === id) ?? null;
}

/** Number of certificates waiting for a decision. */
export async function countPendingCertificates(): Promise<number> {
  return certificateReviewsFixture.filter((review) => review.status === 'pending').length;
}
