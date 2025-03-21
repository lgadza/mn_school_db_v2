import {
  parseISO,
  format,
  isValid,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import {
  toZonedTime,
  //   utcToZonedTime,
  formatInTimeZone,
} from "date-fns-tz";
import logger from "@/common/utils/logging/logger";

/**
 * Date format options
 */
export enum DateFormat {
  ISO = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  DATE = "yyyy-MM-dd",
  TIME = "HH:mm:ss",
  DATETIME = "yyyy-MM-dd HH:mm:ss",
  HUMAN_READABLE = "MMMM d, yyyy h:mm a",
  DAY_MONTH_YEAR = "dd/MM/yyyy",
  MONTH_DAY_YEAR = "MM/dd/yyyy",
}

/**
 * Duration unit type
 */
export type DurationUnit =
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "months"
  | "years";

/**
 * Date range interface
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Date/Time Utility
 * Provides standardized methods for date and time operations
 */
export class DateTimeUtil {
  /**
   * Default timezone
   */
  private static readonly DEFAULT_TIMEZONE = "UTC";

  /**
   * Format a date
   *
   * @param date - Date to format
   * @param formatStr - Format string
   * @param timezone - Timezone
   * @returns Formatted date string
   */
  public static formatDate(
    date: Date | string | number,
    formatStr: string = DateFormat.DATETIME,
    timezone: string = this.DEFAULT_TIMEZONE
  ): string {
    try {
      const parsedDate = this.parseDate(date);

      if (!isValid(parsedDate)) {
        throw new Error("Invalid date");
      }

      // If timezone is provided, convert date to that timezone
      if (timezone !== this.DEFAULT_TIMEZONE) {
        return formatInTimeZone(parsedDate, timezone, formatStr);
      }

      return format(parsedDate, formatStr);
    } catch (error) {
      logger.error("Error formatting date:", error);
      return "Invalid Date";
    }
  }

  /**
   * Parse a date
   *
   * @param date - Date to parse
   * @returns Parsed date
   */
  public static parseDate(date: Date | string | number): Date {
    if (date instanceof Date) {
      return date;
    }

    if (typeof date === "string") {
      return parseISO(date);
    }

    return new Date(date);
  }

  /**
   * Convert a date to a different timezone
   *
   * @param date - Date to convert
   * @param timezone - Target timezone
   * @returns Converted date
   */
  public static convertToTimezone(
    date: Date | string | number,
    timezone: string
  ): Date {
    const parsedDate = this.parseDate(date);
    return toZonedTime(parsedDate, timezone);
  }

  /**
   * Convert a date to UTC
   *
   * @param date - Date to convert
   * @param sourceTimezone - Source timezone
   * @returns UTC date
   */
  public static convertToUTC(
    date: Date | string | number,
    sourceTimezone: string
  ): Date {
    const parsedDate = this.parseDate(date);
    // Convert from zoned time to UTC
    // Note: date-fns-tz doesn't have a direct zonedTimeToUtc function
    // We're using the UTC date as is since parsedDate should already be in UTC
    return new Date(parsedDate.toISOString());
  }

  /**
   * Get the duration between two dates
   *
   * @param startDate - Start date
   * @param endDate - End date
   * @param unit - Duration unit
   * @returns Duration value
   */
  public static getDuration(
    startDate: Date | string | number,
    endDate: Date | string | number,
    unit: DurationUnit = "seconds"
  ): number {
    const parsedStartDate = this.parseDate(startDate);
    const parsedEndDate = this.parseDate(endDate);

    switch (unit) {
      case "seconds":
        return differenceInSeconds(parsedEndDate, parsedStartDate);
      case "minutes":
        return differenceInMinutes(parsedEndDate, parsedStartDate);
      case "hours":
        return differenceInHours(parsedEndDate, parsedStartDate);
      case "days":
        return differenceInDays(parsedEndDate, parsedStartDate);
      case "months":
        return differenceInMonths(parsedEndDate, parsedStartDate);
      case "years":
        return differenceInYears(parsedEndDate, parsedStartDate);
      default:
        return differenceInSeconds(parsedEndDate, parsedStartDate);
    }
  }

  /**
   * Add time to a date
   *
   * @param date - Date to modify
   * @param amount - Amount to add
   * @param unit - Duration unit
   * @returns Modified date
   */
  public static addTime(
    date: Date | string | number,
    amount: number,
    unit: DurationUnit = "days"
  ): Date {
    const parsedDate = this.parseDate(date);

    switch (unit) {
      case "seconds":
        return addSeconds(parsedDate, amount);
      case "minutes":
        return addMinutes(parsedDate, amount);
      case "hours":
        return addHours(parsedDate, amount);
      case "days":
        return addDays(parsedDate, amount);
      case "months":
        return addMonths(parsedDate, amount);
      case "years":
        return addYears(parsedDate, amount);
      default:
        return addDays(parsedDate, amount);
    }
  }

  /**
   * Check if a date is after another date
   *
   * @param date - Date to check
   * @param dateToCompare - Date to compare
   * @returns Whether the date is after the comparison date
   */
  public static isAfter(
    date: Date | string | number,
    dateToCompare: Date | string | number
  ): boolean {
    return isAfter(this.parseDate(date), this.parseDate(dateToCompare));
  }

  /**
   * Check if a date is before another date
   *
   * @param date - Date to check
   * @param dateToCompare - Date to compare
   * @returns Whether the date is before the comparison date
   */
  public static isBefore(
    date: Date | string | number,
    dateToCompare: Date | string | number
  ): boolean {
    return isBefore(this.parseDate(date), this.parseDate(dateToCompare));
  }

  /**
   * Check if two dates are equal
   *
   * @param firstDate - First date
   * @param secondDate - Second date
   * @returns Whether the dates are equal
   */
  public static isEqual(
    firstDate: Date | string | number,
    secondDate: Date | string | number
  ): boolean {
    return isEqual(this.parseDate(firstDate), this.parseDate(secondDate));
  }

  /**
   * Get the start of a time period
   *
   * @param date - Reference date
   * @param unit - Time unit
   * @returns Start date
   */
  public static getStartOf(
    date: Date | string | number,
    unit: "day" | "week" | "month" | "year"
  ): Date {
    const parsedDate = this.parseDate(date);

    switch (unit) {
      case "day":
        return startOfDay(parsedDate);
      case "week":
        return startOfWeek(parsedDate, { weekStartsOn: 1 }); // Week starts on Monday
      case "month":
        return startOfMonth(parsedDate);
      case "year":
        return startOfYear(parsedDate);
      default:
        return startOfDay(parsedDate);
    }
  }

  /**
   * Get the end of a time period
   *
   * @param date - Reference date
   * @param unit - Time unit
   * @returns End date
   */
  public static getEndOf(
    date: Date | string | number,
    unit: "day" | "week" | "month" | "year"
  ): Date {
    const parsedDate = this.parseDate(date);

    switch (unit) {
      case "day":
        return endOfDay(parsedDate);
      case "week":
        return endOfWeek(parsedDate, { weekStartsOn: 1 }); // Week starts on Monday
      case "month":
        return endOfMonth(parsedDate);
      case "year":
        return endOfYear(parsedDate);
      default:
        return endOfDay(parsedDate);
    }
  }

  /**
   * Get a date range
   *
   * @param date - Reference date
   * @param unit - Time unit
   * @returns Date range
   */
  public static getDateRange(
    date: Date | string | number,
    unit: "day" | "week" | "month" | "year"
  ): DateRange {
    return {
      start: this.getStartOf(date, unit),
      end: this.getEndOf(date, unit),
    };
  }

  /**
   * Format a timestamp in a human-readable format
   *
   * @param timestamp - Timestamp in milliseconds or ISO string
   * @returns Human-readable timestamp
   */
  public static formatHumanReadable(timestamp: number | string | Date): string {
    const date = this.parseDate(timestamp);

    const now = new Date();
    const seconds = Math.floor(differenceInSeconds(now, date));

    if (seconds < 60) {
      return "just now";
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    // For older dates, use standard format
    return this.formatDate(date, DateFormat.HUMAN_READABLE);
  }
}

export default DateTimeUtil;
