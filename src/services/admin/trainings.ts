/**
 * Admin trainings service.
 * Backend switch point: only the function bodies change once the API exists.
 */
import type { AdminTraining, TrainingCategory } from '@/lib/admin-types';
import { adminTrainingsFixture, categoriesFixture } from './fixtures';

export interface AdminTrainingFilters {
  category?: TrainingCategory;
  /** Case-insensitive match on the training name. */
  search?: string;
}

/** All trainings of the target model, ordered by category then name. */
export async function getAdminTrainings(
  filters: AdminTrainingFilters = {},
): Promise<AdminTraining[]> {
  const search = filters.search?.trim().toLowerCase();

  return adminTrainingsFixture.filter((training) => {
    if (filters.category && training.category !== filters.category) return false;
    if (search && !training.name.toLowerCase().includes(search)) return false;
    return true;
  });
}

export async function getAdminTraining(id: string): Promise<AdminTraining | null> {
  return adminTrainingsFixture.find((training) => training.id === id) ?? null;
}

/** Closed list of business lines used as a filter. */
export async function getTrainingCategories(): Promise<TrainingCategory[]> {
  return categoriesFixture;
}
