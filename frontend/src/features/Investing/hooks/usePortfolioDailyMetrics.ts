import { api } from "@/lib/api";
import { type Timeframe, queryKeys } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

export function usePortfolioDailyMetrics(timeframe: Timeframe) {
	const {
		data: dailyMetrics,
		isLoading,
		error,
	} = useQuery({
		queryKey: queryKeys.dailyMetrics.timeframe(timeframe),
		queryFn: () => api.dailyMetrics.getDailyMetrics(timeframe),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	return {
		dailyMetrics,
		isLoading,
		isError: !!error,
		error: error instanceof Error ? error : undefined,
	};
}
