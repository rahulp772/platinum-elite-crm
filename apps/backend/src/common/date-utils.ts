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
      
      const utcString = date.includes('T') ? (date.endsWith('Z') ? date : date + 'Z') : date;
      const parsedDate = new Date(utcString);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    return null;
  },

  toISOString(date: Date | string | null | undefined): string | null {
    const utcDate = dateUtils.toUTC(date);
    return utcDate ? utcDate.toISOString() : null;
  },

  toLocalDateTimeInput(isoDate: Date | string | null | undefined): string {
    const utcDate = dateUtils.toUTC(isoDate);
    if (!utcDate) return '';
    
    return utcDate.toISOString().slice(0, 16);
  },

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  },

  startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  },

  daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  isExpired(date: Date | string | null | undefined): boolean {
    const utcDate = dateUtils.toUTC(date);
    if (!utcDate) return false;
    return utcDate < new Date();
  },

  formatRelative(date: Date | string | null | undefined): string {
    const utcDate = dateUtils.toUTC(date);
    if (!utcDate) return '';

    const now = new Date();
    const diffMs = now.getTime() - utcDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return utcDate.toLocaleDateString();
  }
};