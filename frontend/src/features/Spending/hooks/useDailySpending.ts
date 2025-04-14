import { spendingMetricsApi, spendingMetricsApiKeys } from "@/api/spendingApi";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

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

	/**
	 * Stale time in milliseconds
	 * @default 5 * 60 * 1000 (5 minutes)
	 */
	staleTime?: number;
}

/**
 * Hook to fetch daily spending data for a specific month
 *
 * @example
 * ```tsx
 * const { data: dailySpending, isLoading } = useDailySpending({
 *   selectedDate: new Date(),
 * });
 * ```
 */
export function useDailySpending({
	selectedDate,
	enabled = true,
	staleTime = 5 * 60 * 1000, // 5 minutes default
}: UseDailySpendingOptions) {
	// Create a consistent cache key based on year-month
	const cacheKey = format(selectedDate, "yyyy-MM");

	return useQuery({
		queryKey: spendingMetricsApiKeys.dailySpending(cacheKey),
		queryFn: () => spendingMetricsApi.getDailySpending(selectedDate),
		enabled,
		staleTime,
		refetchOnWindowFocus: false, // Historical data doesn't need frequent refetching
		select: (data) => {
			// Sort data by date for consistent presentation
			return [...data].sort((a, b) => {
				if (!a.date || !b.date) return 0;
				return new Date(a.date).getTime() - new Date(b.date).getTime();
			});
		},
	});
}
