import { format } from "date-fns";
import { toZonedTime, formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { User } from "@/types/user";

export function getUserTimezone(user: User | null): string {
  if (user?.timezone) {
    return user.timezone;
  }
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return detectedTimezone;
    } catch {
      return "UTC";
    }
  }
  return "UTC";
}

function parseDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof date === "string") {
    // If it's already an ISO string with Z or offset, parse it directly
    if (date.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(date)) {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    // Otherwise, assume it's a UTC timestamp from the backend and append 'Z'
    const utcString = date.includes('T') ? (date.endsWith('Z') ? date : date + 'Z') : date;
    const parsedDate = new Date(utcString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
  
  return null;
}

export function formatDateInTimezone(
  date: Date | string | null | undefined,
  formatStr: string,
  timezone?: string
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "";

  const tz = timezone || "UTC";
  
  // Use formatInTimeZone directly to avoid double-shifting in non-UTC browsers
  return formatInTimeZone(parsedDate, tz, formatStr);
}

export function formatDateTimeInTimezone(
  date: Date | string | null | undefined,
  timezone?: string
): string {
  return formatDateInTimezone(date, "MMM d, yyyy h:mm a", timezone);
}

export function formatDateOnly(
  date: Date | string | null | undefined,
  timezone?: string
): string {
  return formatDateInTimezone(date, "MMM d, yyyy", timezone);
}

export function formatTimeOnly(
  date: Date | string | null | undefined,
  timezone?: string
): string {
  return formatDateInTimezone(date, "h:mm a", timezone);
}

export function formatRelativeTime(
  date: Date | string | null | undefined,
  timezone?: string
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "";

  const tz = timezone || "UTC";
  const now = new Date();
  
  // Compare times in UTC to get the correct difference
  const diffMs = now.getTime() - parsedDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatInTimeZone(parsedDate, tz, "MMM d");
}

export function getDateLabel(
  date: Date | string | null | undefined,
  timezone?: string
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "";

  const tz = timezone || "UTC";
  const now = new Date();
  
  const nowInTzStr = formatInTimeZone(now, tz, "yyyy-MM-dd");
  const dateInTzStr = formatInTimeZone(parsedDate, tz, "yyyy-MM-dd");

  if (nowInTzStr === dateInTzStr) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayInTzStr = formatInTimeZone(yesterday, tz, "yyyy-MM-dd");
  
  if (yesterdayInTzStr === dateInTzStr) return "Yesterday";

  const nowYear = formatInTimeZone(now, tz, "yyyy");
  const dateYear = formatInTimeZone(parsedDate, tz, "yyyy");

  if (nowYear === dateYear) {
    return formatInTimeZone(parsedDate, tz, "MMMM d");
  }

  return formatInTimeZone(parsedDate, tz, "MMMM d, yyyy");
}

export interface TimezoneGroup {
  label: string;
  zones: Array<{ value: string; label: string }>;
}

export const COMMON_TIMEZONES: TimezoneGroup[] = [
  {
    label: "UTC",
    zones: [
      { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    ],
  },
  {
    label: "Americas",
    zones: [
      { value: "America/New_York", label: "New York (Eastern)" },
      { value: "America/Chicago", label: "Chicago (Central)" },
      { value: "America/Denver", label: "Denver (Mountain)" },
      { value: "America/Los_Angeles", label: "Los Angeles (Pacific)" },
      { value: "America/Toronto", label: "Toronto" },
      { value: "America/Vancouver", label: "Vancouver" },
      { value: "America/Mexico_City", label: "Mexico City" },
      { value: "America/Sao_Paulo", label: "Sao Paulo" },
      { value: "America/Buenos_Aires", label: "Buenos Aires" },
      { value: "America/Lima", label: "Lima" },
      { value: "America/Bogota", label: "Bogota" },
    ],
  },
  {
    label: "Europe",
    zones: [
      { value: "Europe/London", label: "London" },
      { value: "Europe/Paris", label: "Paris" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Amsterdam", label: "Amsterdam" },
      { value: "Europe/Madrid", label: "Madrid" },
      { value: "Europe/Rome", label: "Rome" },
      { value: "Europe/Stockholm", label: "Stockholm" },
      { value: "Europe/Oslo", label: "Oslo" },
      { value: "Europe/Helsinki", label: "Helsinki" },
      { value: "Europe/Warsaw", label: "Warsaw" },
      { value: "Europe/Athens", label: "Athens" },
      { value: "Europe/Moscow", label: "Moscow" },
      { value: "Europe/Istanbul", label: "Istanbul" },
    ],
  },
  {
    label: "Asia",
    zones: [
      { value: "Asia/Dubai", label: "Dubai" },
      { value: "Asia/Kolkata", label: "India (IST)" },
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Hong_Kong", label: "Hong Kong" },
      { value: "Asia/Shanghai", label: "Shanghai" },
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Seoul", label: "Seoul" },
      { value: "Asia/Bangkok", label: "Bangkok" },
      { value: "Asia/Jakarta", label: "Jakarta" },
      { value: "Asia/Manila", label: "Manila" },
      { value: "Asia/Taipei", label: "Taipei" },
      { value: "Asia/Kuala_Lumpur", label: "Kuala Lumpur" },
      { value: "Asia/Karachi", label: "Karachi" },
      { value: "Asia/Dhaka", label: "Dhaka" },
      { value: "Asia/Tehran", label: "Tehran" },
      { value: "Asia/Jerusalem", label: "Jerusalem" },
    ],
  },
  {
    label: "Africa",
    zones: [
      { value: "Africa/Cairo", label: "Cairo" },
      { value: "Africa/Johannesburg", label: "Johannesburg" },
      { value: "Africa/Lagos", label: "Lagos" },
      { value: "Africa/Nairobi", label: "Nairobi" },
      { value: "Africa/Casablanca", label: "Casablanca" },
    ],
  },
  {
    label: "Australia & Pacific",
    zones: [
      { value: "Australia/Sydney", label: "Sydney" },
      { value: "Australia/Melbourne", label: "Melbourne" },
      { value: "Australia/Perth", label: "Perth" },
      { value: "Australia/Brisbane", label: "Brisbane" },
      { value: "Pacific/Auckland", label: "Auckland" },
      { value: "Pacific/Fiji", label: "Fiji" },
      { value: "Pacific/Honolulu", label: "Honolulu (Hawaii)" },
      { value: "America/Anchorage", label: "Anchorage (Alaska)" },
    ],
  },
];