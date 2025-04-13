import { api } from "@/lib/api";
import {
	type ForexRate,
	type Timeframe,
	queryKeys,
} from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface UseLatestForexRateOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
	timeframe?: Timeframe;
}

export function useLatestForexRate(
	pairId: string, // e.g., "USD/EUR"
	options: UseLatestForexRateOptions = {},
) {
	const [baseCurrency, targetCurrency] = pairId.split("/");

	const {
		data: rate,
		isLoading,
		isError,
		error,
	} = useQuery<ForexRate | null>({
		queryKey: queryKeys.forex.latestRate(pairId),
		queryFn: () => api.forex.getLatestRate(baseCurrency, targetCurrency),
		staleTime: options.staleTime,
		retry: options.retry,
		enabled:
			options.enabled ?? Boolean(pairId && baseCurrency && targetCurrency),
	});

	return {
		rate,
		isLoading,
		isError,
		error,
	};
}
