import { api } from "@/lib/api";
import { type Holding, queryKeys } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface HoldingsQueryOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

interface UseHoldingsOptions {
	queryOptions?: HoldingsQueryOptions;
}

export const useHoldings = (options: UseHoldingsOptions = {}) => {
	const { queryOptions = {} } = options;

	const {
		data: holdings = [],
		isLoading,
		isError,
		refetch,
	} = useQuery<Holding[]>({
		queryKey: queryKeys.holdings.all,
		queryFn: () => api.holdings.getAll(),
		staleTime: queryOptions.staleTime,
		retry: queryOptions.retry,
		enabled: queryOptions.enabled ?? true,
	});

	return {
		holdings,
		isLoading,
		isError,
		refetch,
	};
};
