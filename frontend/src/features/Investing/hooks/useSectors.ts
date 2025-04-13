import { api } from "@/lib/api";
import { queryKeys, type Sector } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface SectorsQueryOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

interface UseSectorsOptions {
	queryOptions?: SectorsQueryOptions;
}

export const useSectors = (options: UseSectorsOptions = {}) => {
	const { queryOptions = {} } = options;
	const {
		data: sectors = [],
		isLoading,
		isError,
		refetch,
	} = useQuery<Sector[]>({
		queryKey: queryKeys.sectors.all,
		queryFn: () => api.sectors.getAll(),
		staleTime: queryOptions.staleTime,
		retry: queryOptions.retry,
		enabled: queryOptions.enabled ?? true,
	});

	return {
		sectors,
		isLoading,
		isError,
		refetch,
	};
};
