/**
 * Date helpers local to the trainings section.
 *
 * The fixtures carry `expiresAt` but leave `lastValidatedAt` empty, so the
 * validation date is rebuilt from the business rule of the domain:
 * `valid_until = last_validation + validity`. Subtracting the validity period
 * from the expiry date therefore gives the exact validation date, and the two
 * columns stay consistent instead of showing "up to date" next to "never".
 */

/** "2028-07-22" minus 24 months -> "2026-07-22". Returns undefined without input. */
export function subtractMonths(iso: string | undefined, months: number): string | undefined {
  if (!iso) return undefined;

  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return undefined;

  // Day 1 of the shifted month, then clamp the day to that month's length.
  const shifted = new Date(Date.UTC(year, month - 1 - months, 1));
  const lastDayOfMonth = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 0),
  ).getUTCDate();
  shifted.setUTCDate(Math.min(day, lastDayOfMonth));

  return shifted.toISOString().slice(0, 10);
}
