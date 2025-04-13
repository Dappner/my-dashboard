import { api } from "@/lib/api";
import {
	type ForexRate,
	type Timeframe,
	convertTimeframeToDateRange,
	queryKeys,
} from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface UseForexRatesOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
	timeframe?: Timeframe;
}

export function useHistoricalForexRates(
	pairId: string, // e.g., "USD/EUR"
	options: UseForexRatesOptions = {},
) {
	const { timeframe = "ALL", ...queryOptions } = options;

	// Calculate date range based on timeframe
	const { startDate, endDate } = convertTimeframeToDateRange(timeframe);
	const [baseCurrency, targetCurrency] = pairId.split("/");

	const {
		data: rates = [],
		isLoading,
		isError,
		error,
	} = useQuery<ForexRate[]>({
		queryKey: queryKeys.forex.historicalRates(pairId, timeframe),
		queryFn: async () => {
			return api.forex.getHistoricalRates(
				baseCurrency,
				targetCurrency,
				startDate || undefined,
				endDate || undefined,
			);
		},
		staleTime: queryOptions.staleTime,
		retry: queryOptions.retry,
		enabled:
			queryOptions.enabled ?? Boolean(pairId && baseCurrency && targetCurrency),
	});

	return {
		rates,
		isLoading,
		isError,
		error,
	};
}
