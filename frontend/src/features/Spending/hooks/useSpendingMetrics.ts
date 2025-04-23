import type {
	CategoryData,
	MonthlyData,
	SpendingMetrics,
} from "@/api/spendingApi";

import { spendingMetricsApi, spendingMetricsApiKeys } from "@/api/spendingApi";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { getTimeframeRange, stepPeriod } from "@/lib/utils";
import type { Timeframe } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useCallback, useMemo } from "react";

/**
 * Hook to fetch spending data for a specific timeframe
 */
export function useTimeframeSpending(date: Date, timeframe: Timeframe = "m") {
	const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}`;
	const { start, end } = getTimeframeRange(date, timeframe);

	return useQuery({
		queryKey: spendingMetricsApiKeys.timeframe(cacheKey),
		queryFn: () =>
			spendingMetricsApi.getTimeframeData(date, timeframe, {
				start: new Date(start),
				end: new Date(end),
			}),
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Hook to fetch current timeframe spending data
 */
export function useCurrentTimeframeSpending(
	date: Date,
	timeframe: Timeframe = "m",
) {
	return useTimeframeSpending(date, timeframe);
}

/**
 * Hook to fetch previous timeframe spending data
 */
export function usePreviousTimeframeSpending(
	date: Date,
	timeframe: Timeframe = "m",
) {
	const previousDate = stepPeriod(timeframe, date, -1);
	return useTimeframeSpending(previousDate, timeframe);
}

/**
 * Hook to calculate spending trend by comparing current timeframe with previous timeframe
 */
export function useTimeframeTrend(date: Date, timeframe: Timeframe = "m") {
	const { convertAmount } = useCurrencyConversion();
	const currentTimeframe = useCurrentTimeframeSpending(date, timeframe);
	const previousTimeframe = usePreviousTimeframeSpending(date, timeframe);

	// Calculate trend based on average daily spend or total spend
	const trend = useMemo(() => {
		// Get current timeframe info
		const currentData = currentTimeframe.data;
		if (!currentData) return 0;

		// Convert all currencies to user's preferred currency
		const currentTotal = currentData.currencyBreakdown.reduce(
			(sum, item) => sum + convertAmount(item.amount, item.currency),
			0,
		);

		// Get previous timeframe info
		const previousData = previousTimeframe.data;
		if (!previousData) return 0;

		// Convert all currencies to user's preferred currency
		const previousTotal = previousData.currencyBreakdown.reduce(
			(sum, item) => sum + convertAmount(item.amount, item.currency),
			0,
		);

		// Calculate trend percentage
		if (previousTotal > 0) {
			return ((currentTotal - previousTotal) / previousTotal) * 100;
		}

		return 0;
	}, [currentTimeframe.data, previousTimeframe.data, convertAmount]);

	return {
		trend,
		isLoading: currentTimeframe.isLoading || previousTimeframe.isLoading,
		error: currentTimeframe.error || previousTimeframe.error,
	};
}

/**
 * Hook to fetch spending categories for a specific timeframe
 */
export function useSpendingCategories(date: Date, timeframe: Timeframe = "m") {
	const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}`;
	const { start, end } = getTimeframeRange(date, timeframe);

	return useQuery<CategoryData[]>({
		queryKey: spendingMetricsApiKeys.categories(cacheKey),
		queryFn: () =>
			spendingMetricsApi.getCategories(date, timeframe, {
				start: new Date(start),
				end: new Date(end),
			}),
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Hook to fetch spending over time data for trend analysis
 */
export function useSpendingOverTimeData(
	date: Date,
	timeframe: Timeframe = "m",
) {
	const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}`;
	const { start, end } = getTimeframeRange(date, timeframe);

	return useQuery<MonthlyData[]>({
		queryKey: spendingMetricsApiKeys.overTimeData(cacheKey),
		queryFn: () =>
			spendingMetricsApi.getOverTimeData(date, timeframe, {
				start: new Date(start),
				end: new Date(end),
			}),
		staleTime: 15 * 60 * 1000, // 15 minutes
	});
}

/**
 * Combined hook for spending dashboard
 * Aggregates data from multiple sources into a unified metrics object with currency conversion
 */
export function useSpendingMetrics(date: Date, timeframe: Timeframe = "m") {
	const { convertAmount, displayCurrency } = useCurrencyConversion();
	const currentTimeframe = useCurrentTimeframeSpending(date, timeframe);
	const timeframeTrend = useTimeframeTrend(date, timeframe);
	const overTimeData = useSpendingOverTimeData(date, timeframe);
	const categories = useSpendingCategories(date, timeframe);

	// Function to get all related queries
	const getQueries = useCallback(
		() => [currentTimeframe, overTimeData, categories],
		[currentTimeframe, overTimeData, categories],
	);

	// Compute overall loading state
	const isLoading = useMemo(() => {
		return getQueries().some((query) => query.isLoading);
	}, [getQueries]);

	// Compute overall error state
	const error = useMemo(() => {
		return getQueries().find((query) => query.error)?.error;
	}, [getQueries]);

	// Combine all data into a single metrics object
	const spendingMetrics: SpendingMetrics | undefined = useMemo(() => {
		// Only create metrics object if we have the minimal required data
		if (!currentTimeframe.data) return undefined;

		// Convert all monetary values to the user's preferred currency
		const convertedTotalSpent = currentTimeframe.data.currencyBreakdown.reduce(
			(sum, item) => sum + convertAmount(item.amount, item.currency),
			0,
		);

		// Convert category amounts
		const convertedCategories = categories.data
			? categories.data
					.map((category) => ({
						...category,
						// Keep the original amount and currency for reference, but add a convertedAmount field
						convertedAmount: convertAmount(category.amount, category.currency),
					}))
					// Sort by converted amount
					.sort((a, b) => b.convertedAmount - a.convertedAmount)
					// Map back to the expected format
					.map(({ convertedAmount, ...rest }) => ({
						...rest,
						amount: convertedAmount,
					}))
			: [];

		// Convert time-series data by date
		const timeMap = new Map<string, { amount: number; data: MonthlyData[] }>();

		if (overTimeData.data) {
			for (const item of overTimeData.data) {
				const convertedAmount = convertAmount(item.amount, item.currency);
				const timeKey = item.period || item.month; // Support both period and month fields

				if (!timeMap.has(timeKey)) {
					timeMap.set(timeKey, { amount: 0, data: [] });
				}

				// biome-ignore lint/style/noNonNullAssertion: timeMap.get() is safe after timeMap.has() check
				const timeEntry = timeMap.get(timeKey)!;
				timeEntry.amount += convertedAmount;
				timeEntry.data.push(item);
			}
		}

		// Convert to array and sort by time
		const convertedTimeData = Array.from(timeMap.entries())
			.map(([period, { amount }]) => ({
				period,
				amount,
				currency: displayCurrency,
			}))
			.sort((a, b) => {
				// Sort chronologically
				try {
					const dateA = new Date(a.period);
					const dateB = new Date(b.period);
					return dateA.getTime() - dateB.getTime();
				} catch {
					// Fallback if dates can't be parsed
					return a.period.localeCompare(b.period);
				}
			});

		return {
			totalSpent: convertedTotalSpent,
			receiptCount: currentTimeframe.data.receiptCount,
			monthlyTrend: timeframeTrend.trend,
			currencyBreakdown: currentTimeframe.data.currencyBreakdown,
			timeSeriesData: convertedTimeData,
			categories: convertedCategories,
		};
	}, [
		currentTimeframe.data,
		timeframeTrend.trend,
		overTimeData.data,
		categories.data,
		convertAmount,
		displayCurrency,
	]);

	return {
		spendingMetrics,
		isLoading,
		error,
		// biome-ignore lint/complexity/noForEach: To be fixed later
		refetch: () => getQueries().forEach((query) => query.refetch()),
	};
}

// Add a hook for recent receipts
export function useRecentReceipts(date: Date, timeframe: Timeframe = "m") {
	const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}`;
	const { start, end } = getTimeframeRange(date, timeframe);

	return useQuery({
		queryKey: ["receipts", "recent", cacheKey],
		queryFn: () =>
			spendingMetricsApi.getRecentReceipts(date, timeframe, {
				start: new Date(start),
				end: new Date(end),
			}),
		staleTime: 2 * 60 * 1000, // 2 minutes - more recent data changes frequently
	});
}
