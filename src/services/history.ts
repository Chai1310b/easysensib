/**
 * Participation history service.
 * Backend switch point: replace the function bodies with real API calls when
 * the backend exists. The signatures are the contract, callers never change.
 */
import type { ParticipationRecord } from '@/lib/types';
import { historyFixture } from './fixtures/history';

/** Past participations of the current user, most recent first. */
export async function getParticipationHistory(): Promise<ParticipationRecord[]> {
  return historyFixture;
}
