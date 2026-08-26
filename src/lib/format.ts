/** French date formatting helpers shared by all pages. */

const DAY_FORMAT = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' });
const MONTH_SHORT_FORMAT = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const LONG_DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const MONTH_YEAR_FORMAT = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

/** "2026-09-18" -> "18" */
export function formatDayNumber(iso: string): string {
  return DAY_FORMAT.format(toDate(iso));
}

/** "2026-09-18" -> "SEPT" (uppercase French month abbreviation, no trailing dot) */
export function formatMonthAbbr(iso: string): string {
  return MONTH_SHORT_FORMAT.format(toDate(iso)).replace(/\.$/, '').toUpperCase();
}

/** "2026-03-14" -> "14 mars 2026" */
export function formatLongDate(iso: string): string {
  return LONG_DATE_FORMAT.format(toDate(iso));
}

/** "2029-05-01" -> "mai 2029" */
export function formatMonthYear(iso: string): string {
  return MONTH_YEAR_FORMAT.format(toDate(iso));
}

/** "2026-03-14" -> "2026" */
export function formatYear(iso: string): string {
  return iso.slice(0, 4);
}

/** "2026-09-01" -> "SEPTEMBRE" (uppercase French month name, for list group headers) */
export function formatMonthUpper(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(toDate(iso)).toUpperCase();
}
