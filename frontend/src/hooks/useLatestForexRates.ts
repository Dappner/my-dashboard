import { api } from "@/lib/api";
import {
	type CurrencyType,
	type ForexRate,
	queryKeys,
} from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface UseLatestForexRateOptions {
	staleTime?: number;
	retry?: number | boolean;
}

export function useLatestForexRates(options: UseLatestForexRateOptions = {}) {
	const {
		data: rates,
		isLoading,
		isError,
		error,
	} = useQuery<ForexRate[] | null>({
		queryKey: queryKeys.forex.latestRates(),
		queryFn: api.forex.getLatestRates,
		staleTime: options.staleTime,
		retry: options.retry,
	});

	return {
		rates,
		isLoading,
		isError,
		error,
	};
}

interface UseLatestForexRateOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

export function useLatestForexRate(
	pairId: string,
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
		queryFn: () =>
			api.forex.getLatestRate(
				baseCurrency as CurrencyType,
				targetCurrency as CurrencyType,
			),
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
