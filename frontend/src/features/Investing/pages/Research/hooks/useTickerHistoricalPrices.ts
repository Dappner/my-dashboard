import { api } from "@/lib/api";
import { type Timeframe, queryKeys } from "@my-dashboard/shared";
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
		queryKey: queryKeys.tickerPrices.timeframe(tickerId, timeframe),
		queryFn: async () =>
			api.tickerPrices.getTickerHistoricalPrices(tickerId, timeframe),
		enabled: enabled,
	});

	return {
		historicalPrices,
		historicalPricesLoading,
		historicalPricesError,
	};
}
