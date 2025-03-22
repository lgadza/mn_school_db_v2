import {
  format,
  parse,
  addDays,
  addHours,
  addMinutes,
  differenceInDays,
  isValid,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

/**
 * Date format options
 */
export enum DateFormat {
  ISO = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  DATE = "yyyy-MM-dd",
  TIME = "HH:mm:ss",
  DATETIME = "yyyy-MM-dd HH:mm:ss",
  HUMAN = "MMM dd, yyyy",
  MONTH_YEAR = "MMMM yyyy",
  DAY_MONTH = "dd MMM",
}

/**
 * Time unit for date operations
 */
export type TimeUnit = "days" | "hours" | "minutes";

/**
 * Timezone for date operations
 */
const DEFAULT_TIMEZONE = "UTC";

/**
 * Date utility class
 */
export default class DateTimeUtil {
  /**
   * Format a date to string
   */
  public static formatDate(
    date: Date | string | number,
    formatType: DateFormat = DateFormat.ISO
  ): string {
    try {
      // If date is string or number, convert to Date
      const dateObj =
        typeof date === "string" || typeof date === "number"
          ? new Date(date)
          : date;

      if (!isValid(dateObj)) {
        throw new Error("Invalid date");
      }

      return format(dateObj, formatType);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  }

  /**
   * Parse a string to Date
   */
  public static parseDate(
    dateString: string,
    formatType: DateFormat = DateFormat.ISO
  ): Date {
    try {
      return parse(dateString, formatType, new Date());
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  }

  /**
   * Add time to a date
   */
  public static addTime(date: Date, amount: number, unit: TimeUnit): Date {
    try {
      switch (unit) {
        case "days":
          return addDays(date, amount);
        case "hours":
          return addHours(date, amount);
        case "minutes":
          return addMinutes(date, amount);
        default:
          return date;
      }
    } catch (error) {
      console.error("Error adding time:", error);
      return date;
    }
  }

  /**
   * Get difference between two dates in days
   */
  public static getDayDifference(date1: Date, date2: Date): number {
    try {
      return differenceInDays(date1, date2);
    } catch (error) {
      console.error("Error calculating day difference:", error);
      return 0;
    }
  }

  /**
   * Convert date to a specific timezone
   */
  public static toTimezone(
    date: Date,
    timezone: string = DEFAULT_TIMEZONE
  ): Date {
    try {
      return toZonedTime(date, timezone);
    } catch (error) {
      console.error("Error converting to timezone:", error);
      return date;
    }
  }

  /**
   * Convert date from a specific timezone to UTC
   */
  public static fromTimezone(
    date: Date,
    timezone: string = DEFAULT_TIMEZONE
  ): Date {
    try {
      return toZonedTime(date, timezone);
    } catch (error) {
      console.error("Error converting from timezone:", error);
      return date;
    }
  }

  /**
   * Get current date in a specific timezone
   */
  public static now(timezone: string = DEFAULT_TIMEZONE): Date {
    return this.toTimezone(new Date(), timezone);
  }

  /**
   * Check if a date is valid
   */
  public static isValidDate(date: any): boolean {
    if (!date) return false;

    const dateObj =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;

    return isValid(dateObj);
  }
}
