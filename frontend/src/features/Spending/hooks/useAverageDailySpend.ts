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
export function useAverageDailySpend({
	dailySpending,
	selectedDate,
}: UseAverageDailySpendOptions): number {
	return useMemo(() => {
		if (!dailySpending || dailySpending.length === 0) {
			return 0;
		}

		const today = new Date();
		const isCurrentMonth =
			isSameMonth(today, selectedDate) && isSameYear(today, selectedDate);

		// Count days with actual spending data
		const daysWithData = dailySpending.filter(
			(d) => d.total_amount && d.total_amount > 0,
		).length;

		// Calculate total spent
		const totalSpent = dailySpending.reduce(
			(sum, d) => sum + (d.total_amount || 0),
			0,
		);

		// For average calculation:
		// 1. Prioritize using days with actual spending data if available
		// 2. For current month, use elapsed days
		// 3. For past months, use total days in month
		let divisor: number;

		if (daysWithData > 0) {
			// If we have spending data, average across days with spending
			divisor = daysWithData;
		} else if (isCurrentMonth) {
			// Current month - use elapsed days
			divisor = today.getDate();
		} else {
			// Past month - use total days in month
			divisor = endOfMonth(selectedDate).getDate();
		}

		return divisor > 0 ? totalSpent / divisor : 0;
	}, [dailySpending, selectedDate]);
}
