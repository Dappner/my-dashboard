import { type ClassValue, clsx } from "clsx";
import { format, parse } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function parseDate(date: string) {
	return parse(date, "yyyy-MM-dd", new Date());
}

export function formatDate(date: Date | string | null): string {
	if (date instanceof Date) {
		return format(date, "yyyy-MM-dd");
	}
	// Slightly Cheeky
	if (date) {
		return formatDate(parseDate(date as string));
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
