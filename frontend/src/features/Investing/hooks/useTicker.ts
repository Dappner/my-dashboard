import { api } from "@/lib/api";
import { type Ticker, queryKeys } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface TickerQueryOptions {
	exchange: string;
	tickerSymbol: string;
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

interface UseTickerOptions {
	queryOptions: TickerQueryOptions;
}

export const useTicker = (options: UseTickerOptions) => {
	const { queryOptions } = options;
	const { exchange, tickerSymbol, staleTime, retry, enabled } = queryOptions;

	const {
		data: ticker,
		isLoading,
		isError,
		refetch,
	} = useQuery<Ticker | null>({
		queryKey: queryKeys.tickers.ticker(exchange, tickerSymbol),
		queryFn: () => api.tickers.getTicker(exchange, tickerSymbol),
		staleTime,
		retry,
		enabled: enabled ?? true,
	});

	return {
		ticker,
		isLoading,
		isError,
		refetch,
	};
};
