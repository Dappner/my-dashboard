import {
	type DailySpending,
	spendingMetricsApi,
	spendingMetricsApiKeys,
} from "@/api/spendingApi";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface UseDailySpendingOptions {
	selectedDate: Date;
	enabled?: boolean;
	staleTime?: number;
}

export function useDailySpending({
	selectedDate,
	enabled = true,
	staleTime = 5 * 60 * 1000, // 5 minutes default
}: UseDailySpendingOptions) {
	// Create a consistent cache key based on year-month
	const cacheKey = format(selectedDate, "yyyy-MM");

	return useQuery<DailySpending[]>({
		queryKey: spendingMetricsApiKeys.dailySpending(cacheKey),
		queryFn: () => spendingMetricsApi.getDailySpending(selectedDate),
		enabled,
		staleTime,
		refetchOnWindowFocus: false, // Historical data doesn't need frequent refetching
	});
}
