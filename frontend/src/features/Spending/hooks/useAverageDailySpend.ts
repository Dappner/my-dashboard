import type { DailySpending } from "@/api/spendingApi";
import { endOfMonth, isSameMonth, isSameYear } from "date-fns";
import { useMemo } from "react";

interface UseAverageDailySpendOptions {
	dailySpending: DailySpending[] | undefined;
	selectedDate: Date;
}

/**
 * Calculate the average daily spend based on daily spending data
 * Uses different calculation strategies based on whether viewing current month or past months
 */
/**
 * Calculate the average daily spend based on daily spending data
 * Uses different calculation strategies based on whether viewing current month or past months
 *
 * For current month: total spent / days elapsed so far
 * For past months: total spent / total days in month
 */
export function useAverageDailySpend({
	dailySpending,
	selectedDate,
}: UseAverageDailySpendOptions): number {
	return useMemo(() => {
		if (!dailySpending) {
			return 0;
		}

		const today = new Date();
		const isCurrentMonth =
			isSameMonth(today, selectedDate) && isSameYear(today, selectedDate);

		// Calculate total spent for the month
		const totalSpent = dailySpending.reduce(
			(sum, d) => sum + (d.total_amount || 0),
			0,
		);

		// Calculate denominator based on month type
		let daysInPeriod: number;

		if (isCurrentMonth) {
			// For current month, use days elapsed so far
			daysInPeriod = today.getDate();
		} else {
			// For past months, use total days in that month
			daysInPeriod = endOfMonth(selectedDate).getDate();
		}

		// Return the average - total spent divided by all days in the period
		return daysInPeriod > 0 ? totalSpent / daysInPeriod : 0;
	}, [dailySpending, selectedDate]);
}
