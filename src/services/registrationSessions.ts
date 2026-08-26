/**
 * Registration page session catalog.
 * Backend switch point: replace the function body with a real API call when
 * the backend exists. The signature is the contract, callers never change.
 */
import type { SessionSlot } from '@/lib/types';
import { sessionsFixture } from './fixtures/sessions';
import { registrationSessionsFixture } from './fixtures/registrationSessions';

/** All open session slots a user can see for one training, sorted by date. */
export async function getRegistrableSessions(trainingId: string): Promise<SessionSlot[]> {
  return [...sessionsFixture, ...registrationSessionsFixture]
    .filter((s) => s.trainingId === trainingId)
    .sort((a, b) => a.date.localeCompare(b.date));
}
