import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { HistoricalPrice, Timeframe } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface UseHistoricalPricesOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
	timeframe?: Timeframe;
}

export const historicalPricesApiKeys = {
	byTicker: (tickerId: string) => ["historical-prices", tickerId] as const,
	byTimeframe: (tickerId: string, timeframe: Timeframe) =>
		["historical-prices", tickerId, timeframe] as const,
	bySymbol: (symbol: string) => ["historical-prices-symbol", symbol] as const,
};

export function useHistoricalPrices(
	tickerId: string,
	options: UseHistoricalPricesOptions = {},
) {
	const { timeframe = "ALL", ...queryOptions } = options;

	const {
		data: prices = [],
		isLoading,
		isError,
		error,
	} = useQuery<HistoricalPrice[]>({
		queryKey:
			timeframe === "ALL"
				? historicalPricesApiKeys.byTicker(tickerId)
				: historicalPricesApiKeys.byTimeframe(tickerId, timeframe),
		queryFn: () =>
			api.tickerPrices.getTickerHistoricalPrices(tickerId, timeframe),
		staleTime: queryOptions.staleTime,
		retry: queryOptions.retry,
		enabled: queryOptions.enabled ?? Boolean(tickerId),
	});

	return {
		prices,
		isLoading,
		isError,
		error,
	};
}

// New hook to get prices by symbol
export function useHistoricalPricesBySymbol(
	symbol: string,
	options: UseHistoricalPricesOptions = {},
) {
	const { timeframe = "ALL", ...queryOptions } = options;

	const fetchHistoricalPricesBySymbol = async (): Promise<
		HistoricalPrice[]
	> => {
		// First, get ticker ID from symbol
		const { data: tickerData, error: tickerError } = await supabase
			.from("tickers")
			.select("id")
			.eq("name", symbol)
			.single();

		if (tickerError) {
			throw new Error(`Failed to find ticker: ${tickerError.message}`);
		}

		if (!tickerData) {
			throw new Error(`No ticker found with symbol: ${symbol}`);
		}

		// Then, use the existing API to get historical prices
		return api.tickerPrices.getTickerHistoricalPrices(tickerData.id, timeframe);
	};

	const {
		data: prices = [],
		isLoading,
		isError,
		error,
	} = useQuery<HistoricalPrice[]>({
		queryKey: [historicalPricesApiKeys.bySymbol(symbol), timeframe],
		queryFn: fetchHistoricalPricesBySymbol,
		staleTime: queryOptions.staleTime,
		retry: queryOptions.retry,
		enabled: queryOptions.enabled ?? Boolean(symbol),
	});

	return {
		prices,
		isLoading,
		isError,
		error,
	};
}
