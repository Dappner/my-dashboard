import {
	type DailySpending,
	spendingMetricsApi,
	spendingMetricsApiKeys,
} from "@/api/spendingApi";
import type { Timeframe } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface UseDailySpendingOptions {
	selectedDate: Date;
	timeframe?: Timeframe;
	enabled?: boolean;
	staleTime?: number;
}

export function useDailySpending({
	selectedDate,
	timeframe = "m",
	enabled = true,
	staleTime = 5 * 60 * 1000,
}: UseDailySpendingOptions) {
	const cacheKey = `${timeframe}-${format(selectedDate, "yyyy-MM-dd")}`;

	return useQuery<DailySpending[]>({
		queryKey: spendingMetricsApiKeys.dailySpending(cacheKey),
		queryFn: () => spendingMetricsApi.getDailySpending(selectedDate, timeframe),
		enabled,
		staleTime,
		refetchOnWindowFocus: false, // Historical data doesn't need frequent refetching
	});
}
