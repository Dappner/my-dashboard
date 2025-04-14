import {
	type SpendingMetrics,
	spendingMetricsApi,
	spendingMetricsApiKeys,
} from "@/api/spendingApi";
import { useQuery } from "@tanstack/react-query";
import React from "react";

// Individual hooks for specific data needs
export function useCurrentMonthData(selectedDate: Date) {
	const dateKey = selectedDate.toISOString().split("T")[0];
	return useQuery({
		queryKey: spendingMetricsApiKeys.currentMonth(dateKey),
		queryFn: () => spendingMetricsApi.getCurrentMonth(selectedDate),
		staleTime: 5 * 60 * 1000,
	});
}

export function useLastMonthData(selectedDate: Date) {
	const dateKey = selectedDate.toISOString().split("T")[0];
	return useQuery({
		queryKey: spendingMetricsApiKeys.lastMonth(dateKey),
		queryFn: () => spendingMetricsApi.getLastMonth(selectedDate),
		staleTime: 5 * 60 * 1000,
	});
}

// Computed hook that depends on other queries
export function useMonthlyTrend(selectedDate: Date) {
	const currentMonth = useCurrentMonthData(selectedDate);
	const lastMonth = useLastMonthData(selectedDate);

	// Calculate trend only when both queries have completed successfully
	const trend = React.useMemo(() => {
		if (currentMonth.data?.totalSpent && lastMonth.data && lastMonth.data > 0) {
			return (
				((currentMonth.data.totalSpent - lastMonth.data) / lastMonth.data) * 100
			);
		}
		return 0;
	}, [currentMonth.data, lastMonth.data]);

	return {
		trend,
		isLoading: currentMonth.isLoading || lastMonth.isLoading,
		error: currentMonth.error || lastMonth.error,
	};
}

// Combined hook for spending dashboard
export function useSpendingMetrics(selectedDate: Date) {
	const currentMonth = useCurrentMonthData(selectedDate);
	const monthlyTrend = useMonthlyTrend(selectedDate);
	const dateKey = selectedDate.toISOString().split("T")[0];
	const monthlyData = useQuery({
		queryKey: spendingMetricsApiKeys.monthlyData(dateKey),
		queryFn: () => spendingMetricsApi.getMonthlyData(selectedDate),
		staleTime: 5 * 60 * 1000,
	});
	const categories = useQuery({
		queryKey: spendingMetricsApiKeys.categories(dateKey),
		queryFn: () => spendingMetricsApi.getCategories(selectedDate),
		staleTime: 5 * 60 * 1000,
	});

	// Combine all data into a single metrics object
	const metrics: SpendingMetrics = {
		totalSpent: currentMonth.data?.totalSpent || 0,
		receiptCount: currentMonth.data?.receiptCount || 0,
		monthlyTrend: monthlyTrend.trend,
		monthlyData: monthlyData.data || [],
		categories: categories.data || [],
	};

	const isLoading =
		currentMonth.isLoading ||
		monthlyTrend.isLoading ||
		monthlyData.isLoading ||
		categories.isLoading;

	const error =
		currentMonth.error ||
		monthlyTrend.error ||
		monthlyData.error ||
		categories.error;

	return { spendingMetrics: metrics, isLoading, error };
}
