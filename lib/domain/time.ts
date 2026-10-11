// TBS RoamAgent - Time Utilities (Explicit Asia/Kolkata)

export const TIMEZONE_OFFSET_STR = '+05:30';
export const TIMEZONE_OFFSET_MINUTES = 330;

/**
 * Parses an ISO string or time string into a reliable Date object.
 */
export function parseKolkataTime(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Returns an ISO 8601 string with +05:30 offset for a given Date or timestamp
 */
export function toKolkataIsoString(date: Date): string {
  const tzOffset = TIMEZONE_OFFSET_MINUTES * 60000;
  // Compute local time in IST
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + tzOffset);

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const seconds = String(istDate.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;
}

/**
 * Adds minutes to an ISO string and returns a new ISO string in +05:30
 */
export function addMinutesToIso(isoString: string, minutesToAdd: number): string {
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() + minutesToAdd);
  return toKolkataIsoString(d);
}

/**
 * Computes difference in minutes (timeB - timeA)
 */
export function diffMinutes(isoA: string, isoB: string): number {
  const msA = new Date(isoA).getTime();
  const msB = new Date(isoB).getTime();
  return Math.round((msB - msA) / 60000);
}

/**
 * Formats time for display e.g. "09:00 PM"
 */
export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString.substring(11, 16);
  }
}

/**
 * Formats date and time e.g. "09:00 AM · 11 Oct"
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const time = d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const date = d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
    });
    return `${time} (${date})`;
  } catch {
    return isoString;
  }
}

/**
 * Formats duration in minutes e.g. "9h 30m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Checks if candidate is strictly after reference
 */
export function isAfter(isoCandidate: string, isoReference: string): boolean {
  return new Date(isoCandidate).getTime() > new Date(isoReference).getTime();
}

/**
 * Checks if candidate is before or equal to reference
 */
export function isBeforeOrEqual(isoCandidate: string, isoReference: string): boolean {
  return new Date(isoCandidate).getTime() <= new Date(isoReference).getTime();
}
