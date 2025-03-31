import { tickerPricesApi, tickerPricesApiKeys } from "@/api/tickerPricesApi";
import type { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { useQuery } from "@tanstack/react-query";

export function useTickerHistoricalPrices(
	tickerId: string,
	timeframe: Timeframe,
	enabled: boolean,
) {
	const {
		data: historicalPrices,
		isLoading: historicalPricesLoading,
		error: historicalPricesError,
	} = useQuery({
		queryKey: tickerPricesApiKeys.timeframe(tickerId, timeframe),
		queryFn: async () =>
			tickerPricesApi.getTickerHistoricalPrices(tickerId, timeframe),
		enabled: enabled,
	});

	return {
		historicalPrices,
		historicalPricesLoading,
		historicalPricesError,
	};
}
