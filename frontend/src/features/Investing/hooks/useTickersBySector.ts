import { api } from "@/lib/api";
import { queryKeys, type Ticker } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface UseTickersBySectorOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

export const useTickersBySector = (
	sectorKey: string,
	options: UseTickersBySectorOptions = {},
) => {
	const {
		data: tickers = [],
		isLoading,
		isError,
		refetch,
	} = useQuery<Ticker[]>({
		queryKey: queryKeys.marketStructure.tickersBySector(sectorKey),
		queryFn: () => api.marketStructure.getTickersBySector(sectorKey),
		staleTime: options.staleTime,
		retry: options.retry,
		enabled: options.enabled ?? Boolean(sectorKey),
	});

	return {
		tickers,
		isLoading,
		isError,
		refetch,
	};
};
