import { tickerPricesApi, tickerPricesApiKeys } from "@/api/tickerPricesApi";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { useQuery } from "@tanstack/react-query";

export function useTickerHistoricalPrices(
  tickerId: string,
  timeframe: Timeframe,
) {
  const {
    data: historicalPrices,
    isLoading: historicalPricesLoading,
    error: historicalPricesError,
  } = useQuery({
    queryKey: tickerPricesApiKeys.timeframe(tickerId, timeframe),
    queryFn: async () =>
      tickerPricesApi.getTickerHistoricalPrices(tickerId, timeframe),
    enabled: !!tickerId,
  });

  return {
    historicalPrices,
    historicalPricesLoading,
    historicalPricesError,
  };
}
