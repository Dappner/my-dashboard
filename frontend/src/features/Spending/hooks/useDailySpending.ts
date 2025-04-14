import { spendingMetricsApiKeys, spendingMetricsApi } from "@/api/spendingApi";
import { useQuery } from "@tanstack/react-query";

interface UseDailySpendingOptions {
	/**
	 * Date for Month
	 */
	selectedDate: Date;

	/**
	 * Whether to enable the query
	 * @default true
	 */
	enabled?: boolean;
}

/**
 * Hook to fetch daily spending data within a date range
 */
export function useDailySpending({
	selectedDate,
	enabled = true,
}: UseDailySpendingOptions) {
	const dateKey = selectedDate.toISOString().split("T")[0];
	return useQuery({
		queryKey: spendingMetricsApiKeys.dailySpending(dateKey),
		queryFn: () => spendingMetricsApi.getDailySpending(selectedDate),
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
