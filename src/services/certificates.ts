/**
 * E-learning certificates service.
 * Backend switch point: replace the function bodies with real API calls when
 * the backend exists. The signatures are the contract, callers never change.
 */
import type { Certificate } from '@/lib/types';
import { certificatesFixture } from './fixtures/certificates';

/** Certificates uploaded by the current user, most recent first. */
export async function getCertificates(): Promise<Certificate[]> {
  return [...certificatesFixture].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}
