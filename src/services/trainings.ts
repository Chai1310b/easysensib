/**
 * Trainings (sensibilisations) service.
 * Backend switch point: replace the function bodies with real API calls when
 * the backend exists. The signatures are the contract, callers never change.
 */
import type { Training } from '@/lib/types';
import { trainingsFixture } from './fixtures/trainings';

/** All trainings of the current user, in display order (actions first). */
export async function getTrainings(): Promise<Training[]> {
  return trainingsFixture;
}

export async function getTraining(id: string): Promise<Training | null> {
  return trainingsFixture.find((t) => t.id === id) ?? null;
}
