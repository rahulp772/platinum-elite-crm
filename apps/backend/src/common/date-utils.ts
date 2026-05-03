import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import {
  startOfDay,
  endOfDay,
  addDays,
  addHours,
  differenceInDays,
} from 'date-fns';

export const dateUtils = {
  toUTC(date: Date | string | null | undefined): Date | null {
    if (!date) return null;

    if (date instanceof Date) {
      return isNaN(date.getTime()) ? null : date;
    }

    if (typeof date === 'string') {
      if (date.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(date)) {
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? null : parsed;
      }

      // No timezone indicator - treat as UTC
      const utcString = date.includes('T') ? date + 'Z' : date;
      const parsedDate = new Date(utcString);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    return null;
  },

  toISOString(date: Date | string | null | undefined): string | null {
    const utcDate = dateUtils.toUTC(date);
    return utcDate ? utcDate.toISOString() : null;
  },

  /**
   * Returns start of day for a given date in the target timezone, as a UTC Date object.
   */
  getZonedStartOfDay(date: Date | string, timezone: string): Date {
    const utcDate = dateUtils.toUTC(date) || new Date();
    const zonedDate = toZonedTime(utcDate, timezone);
    const zonedStart = startOfDay(zonedDate);
    return fromZonedTime(zonedStart, timezone);
  },

  /**
   * Returns end of day for a given date in the target timezone, as a UTC Date object.
   */
  getZonedEndOfDay(date: Date | string, timezone: string): Date {
    const utcDate = dateUtils.toUTC(date) || new Date();
    const zonedDate = toZonedTime(utcDate, timezone);
    const zonedEnd = endOfDay(zonedDate);
    return fromZonedTime(zonedEnd, timezone);
  },

  addDays(date: Date, days: number): Date {
    return addDays(date, days);
  },

  addHours(date: Date, hours: number): Date {
    return addHours(date, hours);
  },

  isExpired(date: Date | string | null | undefined): boolean {
    const utcDate = dateUtils.toUTC(date);
    if (!utcDate) return false;
    return utcDate < new Date();
  },

  formatInTimezone(
    date: Date | string,
    timezone: string,
    formatStr: string,
  ): string {
    const utcDate = dateUtils.toUTC(date) || new Date();
    return formatInTimeZone(utcDate, timezone, formatStr);
  },
};
