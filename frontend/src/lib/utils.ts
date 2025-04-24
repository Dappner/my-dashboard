import type { Timeframe } from "@my-dashboard/shared";
import { type ClassValue, clsx } from "clsx";
import {
	addMonths,
	addQuarters,
	addWeeks,
	addYears,
	endOfMonth,
	endOfQuarter,
	endOfWeek,
	endOfYear,
	format,
	parse,
	startOfMonth,
	startOfQuarter,
	startOfWeek,
	startOfYear,
	subDays,
	subMonths,
} from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function parseDate(date: string) {
	return parse(date, "yyyy-MM-dd", new Date());
}

export function formatDate(
	date: Date | string | null,
	customFormat?: string,
): string {
	const dateFormat = customFormat ? customFormat : "yyyy-MM-dd";
	if (date instanceof Date) {
		return format(date, dateFormat);
	}
	// Slightly Cheeky
	if (date) {
		return formatDate(parseDate(date as string), dateFormat);
	}
	return "NA";
}

export const getUTCDate = (
	year: number,
	month: number,
	day: number,
): string => {
	return new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
};

export const getMonthYear = (selectedDate: Date) => {
	return format(selectedDate, "yyyy-MM");
};

export interface CustomRange {
	start: Date;
	end: Date;
}

/**
 * Calculate date range based on timeframe and reference date
 * @param referenceDate The date to calculate the range from
 * @param timeframe The timeframe type
 * @param customRange Optional custom date range (used when timeframe is "custom")
 * @returns Object with start and end dates in ISO format (YYYY-MM-DD)
 */
export function getTimeframeRange(
	referenceDate: Date = new Date(),
	timeframe: Timeframe = "m",
	customRange?: CustomRange,
): {
	start: string;
	end: string;
} {
	// Handle custom range
	if (timeframe === "custom" && customRange) {
		return {
			start: format(customRange.start, "yyyy-MM-dd"),
			end: format(customRange.end, "yyyy-MM-dd"),
		};
	}

	let start: Date;
	let end: Date = referenceDate;

	// Process timeframe
	switch (timeframe) {
		// Calendar periods
		case "w":
			start = startOfWeek(referenceDate, { weekStartsOn: 1 });
			end = endOfWeek(referenceDate, { weekStartsOn: 1 });
			break;

		case "m":
			start = startOfMonth(referenceDate);
			end = endOfMonth(referenceDate);
			break;

		case "q":
			start = startOfQuarter(referenceDate);
			end = endOfQuarter(referenceDate);
			break;

		case "y":
			start = startOfYear(referenceDate);
			end = endOfYear(referenceDate);
			break;

		case "all":
			start = new Date(2020, 0, 1);
			end = referenceDate;
			break;

		// rolling periods still end “now”
		case "r1w":
			start = subDays(referenceDate, 7);
			end = referenceDate;
			break;
		case "r1m":
			start = subDays(referenceDate, 30);
			end = referenceDate;
			break;
		case "r3m":
			start = subDays(referenceDate, 90);
			end = referenceDate;
			break;
		case "r1y":
			start = subDays(referenceDate, 365);
			end = referenceDate;
			break;
		// Legacy timeframes - maintain backward compatibility
		case "1W":
			start = subDays(referenceDate, 7);
			break;

		case "1M":
			start = subDays(referenceDate, 30);
			break;

		case "3M":
			start = subMonths(referenceDate, 3);
			break;

		case "YTD":
			start = startOfYear(referenceDate);
			break;

		case "1Y":
			start = subMonths(referenceDate, 12);
			break;

		// Default to current month
		default:
			start = startOfMonth(referenceDate);
	}

	// Format dates to ISO strings (YYYY-MM-DD)
	return {
		start: format(start, "yyyy-MM-dd"),
		end: format(end, "yyyy-MM-dd"),
	};
}

export function alignToPeriodStart(tf: Timeframe, d: Date): Date {
	switch (tf) {
		case "w":
			return startOfWeek(d, { weekStartsOn: 1 });
		case "m":
			return startOfMonth(d);
		case "q":
			return startOfQuarter(d);
		case "y":
			return startOfYear(d);
		default:
			return d;
	}
}
export function stepPeriod(tf: Timeframe, base: Date, dir: -1 | 1): Date {
	const start = alignToPeriodStart(tf, base);
	switch (tf) {
		case "w":
			return addWeeks(start, dir);
		case "m":
			return addMonths(start, dir);
		case "q":
			return addQuarters(start, dir);
		case "y":
			return addYears(start, dir);
		default:
			return base;
	}
}
export function capitalizeFirstLetter(val: string) {
	return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

// Format game duration (seconds to mm:ss)
export const formatDuration = (seconds: number | null) => {
	if (!seconds) return "00:00";
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const formatPeriodName = (date: Date, timeframe: Timeframe) => {
	switch (timeframe) {
		case "w":
			return `Week of ${format(date, "MMM d, yyyy")}`;
		case "m":
			return format(date, "MMMM yyyy");
		case "q": {
			const quarter = Math.floor(date.getMonth() / 3) + 1;
			return `Q${quarter} ${date.getFullYear()}`;
		}
		case "y":
			return format(date, "yyyy");
		case "all":
			return "All Time";
		default:
			return format(date, "MMMM yyyy");
	}
};
