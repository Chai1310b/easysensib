/**
 * Session slots service.
 * Backend switch point: replace the function bodies with real API calls when
 * the backend exists. The signatures are the contract, callers never change.
 */
import type { SessionSlot } from '@/lib/types';
import { sessionsFixture } from './fixtures/sessions';

/** All upcoming sessions relevant to the current user, sorted by date. */
export async function getUpcomingSessions(): Promise<SessionSlot[]> {
  return [...sessionsFixture].sort((a, b) => a.date.localeCompare(b.date));
}

/** Upcoming sessions for one training, sorted by date. */
export async function getSessionsForTraining(trainingId: string): Promise<SessionSlot[]> {
  return sessionsFixture
    .filter((s) => s.trainingId === trainingId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getSession(id: string): Promise<SessionSlot | null> {
  return sessionsFixture.find((s) => s.id === id) ?? null;
}
