import { receiptsApi, receiptsApiKeys } from "@/api/spending/receiptsApi";
import { spendingApi, spendingApiKeys } from "@/api/spending/spendingApi";
import type { CategoryData } from "@/api/spending/types";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { stepPeriod } from "@/lib/utils";
import type { Timeframe } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo } from "react";

export function useTimeframeSpendingSummary(
	date: Date,
	timeframe: Timeframe = "m",
) {
	const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}`;

	return useQuery({
		queryKey: spendingApiKeys.summary(cacheKey),
		queryFn: () => spendingApi.fetchSpendingSummary(date, timeframe),
		staleTime: 5 * 60 * 1000,
	});
}

export function useCurrentTimeframeSpendingSummary(
	date: Date,
	timeframe: Timeframe = "m",
) {
	return useTimeframeSpendingSummary(date, timeframe);
}

/**
 * Hook to fetch previous timeframe spending data
 */
export function usePreviousTimeframeSpendingSummary(
	date: Date,
	timeframe: Timeframe = "m",
) {
	const previousDate = stepPeriod(timeframe, date, -1);
	return useTimeframeSpendingSummary(previousDate, timeframe);
}

/**
 * Hook to calculate spending trend by comparing current timeframe with previous timeframe
 */
export function useTimeframeTrend(date: Date, timeframe: Timeframe = "m") {
	const { convertAmount } = useCurrencyConversion();
	const currentTimeframe = useCurrentTimeframeSpendingSummary(date, timeframe);
	const previousTimeframe = usePreviousTimeframeSpendingSummary(
		date,
		timeframe,
	);

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
 * Hook to fetch spending categories (with amounts) for timeframe
 */
export function useSpendingCategoriesDetail(
	date: Date,
	timeframe: Timeframe = "m",
) {
	const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}`;

	return useQuery<CategoryData[]>({
		queryKey: spendingApiKeys.categoriesDetail(cacheKey),
		queryFn: () => spendingApi.fetchCategoriesDetail(date, timeframe),
		staleTime: 5 * 60 * 1000,
	});
}

export function useSpendingCategoryReceipts(
	date: Date,
	timeframe: Timeframe = "m",
	categoryId?: string,
) {
	const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}`;

	return useQuery({
		// biome-ignore lint/style/noNonNullAssertion: Fine since it's not enabled if null...
		queryKey: receiptsApiKeys.byCategory(categoryId!, cacheKey),
		queryFn: () =>
			// biome-ignore lint/style/noNonNullAssertion: Fine since it's not enabled if catId == null
			receiptsApi.fetchCategoryReceipts(categoryId!, date, timeframe),
		staleTime: 5 * 60 * 1000,
		enabled: !!categoryId,
	});
}

export function useSpendingTimeSeries(date: Date, timeframe: Timeframe = "m") {
	const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}`;

	return useQuery({
		queryFn: () => spendingApi.fetchSpendingTimeSeries(date, timeframe),
		queryKey: spendingApiKeys.timeSeries(cacheKey),
	});
}
