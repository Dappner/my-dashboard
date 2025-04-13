import { api } from "@/lib/api";
import { type MarketIndex, queryKeys } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface UseMarketIndexOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

export function useSectorIndex(
	sectorKey: string,
	options: UseMarketIndexOptions = {},
) {
	const {
		data: sectorIndex,
		isLoading,
		isError,
	} = useQuery<MarketIndex | null>({
		queryKey: queryKeys.marketIndices.sectorIndex(sectorKey),
		queryFn: () => api.marketIndices.getSectorIndex(sectorKey),
		staleTime: options.staleTime,
		retry: options.retry,
		enabled: options.enabled ?? Boolean(sectorKey),
	});

	return {
		sectorIndex,
		isLoading,
		isError,
	};
}

export function useIndustryIndex(
	industryKey: string,
	options: UseMarketIndexOptions = {},
) {
	const {
		data: industryIndex,
		isLoading,
		isError,
	} = useQuery<MarketIndex | null>({
		queryKey: queryKeys.marketIndices.industryIndex(industryKey),
		queryFn: () => api.marketIndices.getIndustryIndex(industryKey),
		staleTime: options.staleTime,
		retry: options.retry,
		enabled: options.enabled ?? Boolean(industryKey),
	});

	return {
		industryIndex,
		isLoading,
		isError,
	};
}
