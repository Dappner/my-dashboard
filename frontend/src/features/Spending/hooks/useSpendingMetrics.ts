import type {
	CategoryData,
	MonthlyData,
	SpendingMetrics,
} from "@/api/spendingApi";

import { spendingMetricsApi, spendingMetricsApiKeys } from "@/api/spendingApi";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useCallback, useMemo } from "react";

/**
 * Hook to fetch current month spending data
 */
export function useCurrentMonthSpending(selectedDate: Date) {
	const cacheKey = format(selectedDate, "yyyy-MM");

	return useQuery({
		queryKey: spendingMetricsApiKeys.currentMonth(cacheKey),
		queryFn: () => spendingMetricsApi.getCurrentMonth(selectedDate),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch last month spending data
 */
export function useLastMonthSpending(selectedDate: Date) {
	const cacheKey = format(selectedDate, "yyyy-MM");

	return useQuery({
		queryKey: spendingMetricsApiKeys.lastMonth(cacheKey),
		queryFn: () => spendingMetricsApi.getLastMonth(selectedDate),
		staleTime: 10 * 60 * 1000, // 10 minutes - historical data changes less frequently
	});
}

/**
 * Hook to calculate monthly trend by comparing current month with last month (average Spending)
 */
export function useMonthlyTrend(selectedDate: Date) {
	const currentMonth = useCurrentMonthSpending(selectedDate);
	const lastMonth = useLastMonthSpending(selectedDate);

	// Calculate trend based on average daily spend
	const trend = useMemo(() => {
		// Get current month info
		const currentMonthTotal = currentMonth.data?.totalSpent || 0;
		const currentMonthDays = new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth() + 1,
			0,
		).getDate();

		// For current month, use days elapsed if we're in that month
		const today = new Date();
		const isCurrentMonthNow =
			today.getMonth() === selectedDate.getMonth() &&
			today.getFullYear() === selectedDate.getFullYear();
		const currentDaysToUse = isCurrentMonthNow
			? today.getDate()
			: currentMonthDays;

		// Get last month info
		const lastMonthTotal = lastMonth.data || 0;
		const lastMonthDate = new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth() - 1,
			1,
		);
		const lastMonthDays = new Date(
			lastMonthDate.getFullYear(),
			lastMonthDate.getMonth() + 1,
			0,
		).getDate();

		// Calculate average daily spend for both months
		const currentDailyAvg =
			currentDaysToUse > 0 ? currentMonthTotal / currentDaysToUse : 0;
		const lastDailyAvg = lastMonthDays > 0 ? lastMonthTotal / lastMonthDays : 0;

		// Calculate trend percentage
		if (currentDailyAvg > 0 && lastDailyAvg > 0) {
			return ((currentDailyAvg - lastDailyAvg) / lastDailyAvg) * 100;
		}

		return 0;
	}, [currentMonth.data, lastMonth.data, selectedDate]);

	return {
		trend,
		isLoading: currentMonth.isLoading || lastMonth.isLoading,
		error: currentMonth.error || lastMonth.error,
	};
}

/**
 * Hook to fetch monthly spending data for trend analysis
 */
export function useMonthlySpendingData(selectedDate: Date) {
	const cacheKey = format(selectedDate, "yyyy-MM");

	return useQuery<MonthlyData[]>({
		queryKey: spendingMetricsApiKeys.monthlyData(cacheKey),
		queryFn: () => spendingMetricsApi.getMonthlyData(selectedDate),
		staleTime: 15 * 60 * 1000, // 15 minutes
	});
}

/**
 * Hook to fetch spending categories
 */
export function useSpendingCategories(selectedDate: Date) {
	const cacheKey = format(selectedDate, "yyyy-MM");

	return useQuery<CategoryData[]>({
		queryKey: spendingMetricsApiKeys.categories(cacheKey),
		queryFn: () => spendingMetricsApi.getCategories(selectedDate),
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Combined hook for spending dashboard
 * Aggregates data from multiple sources into a unified metrics object
 */
export function useSpendingMetrics(selectedDate: Date) {
	const currentMonth = useCurrentMonthSpending(selectedDate);
	const monthlyTrend = useMonthlyTrend(selectedDate);
	const monthlyData = useMonthlySpendingData(selectedDate);
	const categories = useSpendingCategories(selectedDate);

	// Function to get all related queries
	const getQueries = useCallback(
		() => [currentMonth, monthlyData, categories],
		[currentMonth, monthlyData, categories],
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
		if (!currentMonth.data) return undefined;

		return {
			totalSpent: currentMonth.data.totalSpent,
			receiptCount: currentMonth.data.receiptCount,
			monthlyTrend: monthlyTrend.trend,
			monthlyData: monthlyData.data || [],
			categories: categories.data || [],
		};
	}, [
		currentMonth.data,
		monthlyTrend.trend,
		monthlyData.data,
		categories.data,
	]);

	return {
		spendingMetrics,
		isLoading,
		error,
		// biome-ignore lint/complexity/noForEach: Fine.
		refetch: () => getQueries().forEach((query) => query.refetch()),
	};
}

// Add a hook for recent receipts
export function useRecentReceipts(selectedDate: Date) {
	const cacheKey = format(selectedDate, "yyyy-MM");

	return useQuery({
		queryKey: ["receipts", "recent", cacheKey],
		queryFn: () => spendingMetricsApi.getRecentReceipts(selectedDate),
		staleTime: 2 * 60 * 1000, // 2 minutes - more recent data changes frequently
	});
}
