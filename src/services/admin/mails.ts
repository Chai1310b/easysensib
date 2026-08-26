/**
 * Mail relance console service (executions and engine settings).
 * Backend switch point: only the function bodies change once the API exists.
 */
import type { RelanceExecution, RelanceSettings, RelanceType } from '@/lib/admin-types';
import { relanceExecutionsFixture, relanceSettingsFixture } from './fixtures';

export interface RelanceExecutionFilters {
  type?: RelanceType;
}

/** Executions, most recent first. */
export async function getRelanceExecutions(
  filters: RelanceExecutionFilters = {},
): Promise<RelanceExecution[]> {
  return relanceExecutionsFixture
    .filter((run) => (filters.type ? run.type === filters.type : true))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getRelanceExecution(id: string): Promise<RelanceExecution | null> {
  return relanceExecutionsFixture.find((run) => run.id === id) ?? null;
}

/** The most recent executions, for the dashboard list. */
export async function getRecentRelanceExecutions(limit = 4): Promise<RelanceExecution[]> {
  const runs = await getRelanceExecutions();
  return runs.slice(0, limit);
}

export async function getRelanceSettings(): Promise<RelanceSettings> {
  return relanceSettingsFixture;
}
