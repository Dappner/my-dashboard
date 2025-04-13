import { api } from "@/lib/api";
import { queryKeys, type Ticker } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface UseTickersByIndustryOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

export const useTickersByIndustry = (
	industryKey: string,
	options: UseTickersByIndustryOptions = {},
) => {
	const {
		data: tickers = [],
		isLoading,
		isError,
		refetch,
	} = useQuery<Ticker[]>({
		queryKey: queryKeys.marketStructure.tickersByIndustry(industryKey),
		queryFn: () => api.marketStructure.getTickersByIndustry(industryKey),
		staleTime: options.staleTime,
		retry: options.retry,
		enabled: options.enabled ?? Boolean(industryKey),
	});

	return {
		tickers,
		isLoading,
		isError,
		refetch,
	};
};
