import { api } from "@/lib/api";
import { type Holding, queryKeys } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface HoldingQueryOptions {
	exchange: string;
	tickerSymbol: string;
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

interface UseHoldingOptions {
	queryOptions: HoldingQueryOptions;
}

export const useHolding = (options: UseHoldingOptions) => {
	const { queryOptions } = options;
	const { exchange, tickerSymbol, staleTime, retry, enabled } = queryOptions;

	const {
		data: holding,
		isLoading,
		isError,
		refetch,
	} = useQuery<Holding | null>({
		queryKey: queryKeys.holdings.ticker(exchange, tickerSymbol),
		queryFn: () => api.holdings.getByTicker(exchange, tickerSymbol),
		staleTime,
		retry,
		enabled: enabled ?? true,
	});

	return {
		holding,
		isLoading,
		isError,
		refetch,
	};
};
