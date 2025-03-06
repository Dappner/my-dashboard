import { dailyMetricsApi, dailyMetricsApiKeys } from "@/api/dailyMetricsApi";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { useQuery } from "@tanstack/react-query";

export function usePortfolioDailyMetrics(timeframe: Timeframe) {
  const { data: dailyMetrics, isLoading, error } = useQuery({
    queryKey: dailyMetricsApiKeys.timeframe(timeframe),
    queryFn: () => dailyMetricsApi.getDailyMetrics(timeframe),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    dailyMetrics,
    isLoading,
    isError: !!error,
    error: error instanceof Error ? error : undefined
  };
}
