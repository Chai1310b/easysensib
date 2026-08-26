/** Pure helpers shared by the session screens (list, creation, detail). */

/** Repetition step of the multiple creation shortcut. */
export type RepeatFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

/** "09:00" (input value) -> "9h00" (display value used by the fixtures). */
export function toDisplayTime(value: string): string {
  const [hours, minutes] = value.split(':');
  if (!hours || !minutes) return value;
  return `${Number(hours)}h${minutes}`;
}

/** "9h00" (fixture value) -> "09:00" (value of a time input). */
export function toInputTime(value: string): string {
  const match = /^(\d{1,2})h(\d{2})$/.exec(value.trim());
  if (!match) return value;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

/** Free seats of a session, never negative. */
export function seatsLeft(registered: number, capacity: number): number {
  return Math.max(0, capacity - registered);
}

/** Fill rate of a session, 0 to 100. */
export function fillPercent(registered: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.round((registered / capacity) * 100));
}

/** ISO date "2026-09-08" shifted by `days` days, still ISO. */
function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toIso(date);
}

/** ISO date shifted by `months` months, clamped to the end of the month. */
function addMonths(iso: string, months: number): string {
  const date = new Date(`${iso}T00:00:00`);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toIso(date);
}

function toIso(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Dates of the sessions produced by the multiple creation shortcut.
 * The first occurrence is always the date typed in the form.
 */
export function repeatDates(
  startIso: string,
  frequency: RepeatFrequency,
  occurrences: number,
): string[] {
  if (!startIso) return [];
  const count = Math.max(1, Math.min(24, Math.round(occurrences)));
  const dates: string[] = [];
  for (let index = 0; index < count; index += 1) {
    if (frequency === 'monthly') {
      dates.push(addMonths(startIso, index));
    } else {
      const step = frequency === 'daily' ? 1 : frequency === 'weekly' ? 7 : 14;
      dates.push(addDays(startIso, index * step));
    }
  }
  return dates;
}

/** Today as an ISO date, computed once per render on the server. */
export function todayIso(): string {
  return toIso(new Date());
}
