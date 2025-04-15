import { api } from "@/lib/api";
import { type Industry, queryKeys } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface IndustriesQueryOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

interface UseIndustriesOptions {
	sectorKey?: string;
	queryOptions?: IndustriesQueryOptions;
}

export const useIndustries = (options: UseIndustriesOptions = {}) => {
	const { sectorKey, queryOptions = {} } = options;

	const queryKey = sectorKey
		? queryKeys.industries.bySector(sectorKey)
		: queryKeys.industries.all;

	const queryFn = sectorKey
		? () => api.industries.getBySector(sectorKey)
		: () => api.industries.getAll();

	const {
		data: industries = [],
		isLoading,
		isError,
		refetch,
	} = useQuery<Industry[]>({
		queryKey,
		queryFn,
		staleTime: queryOptions.staleTime || 600,
		retry: queryOptions.retry,
		enabled: queryOptions.enabled ?? true,
	});

	return {
		industries,
		isLoading,
		isError,
		refetch,
	};
};
