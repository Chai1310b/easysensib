/**
 * User service.
 * Backend switch point: replace the function bodies with real API calls when
 * the backend exists. The signatures are the contract, callers never change.
 */
import type { CurrentUser } from '@/lib/types';
import { currentUserFixture } from './fixtures/user';

export async function getCurrentUser(): Promise<CurrentUser> {
  return currentUserFixture;
}
