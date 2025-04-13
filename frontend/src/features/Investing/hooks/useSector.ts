import { api } from "@/lib/api";
import {
	queryKeys,
	type Sector,
	type SectorWithIndustries,
} from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface UseSectorOptions {
	withIndustries?: boolean;
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

export const useSector = (
	sectorKey: string,
	options: UseSectorOptions = {},
) => {
	const { withIndustries = false, ...queryOptions } = options;

	const queryKey = withIndustries
		? queryKeys.sectors.withIndustries(sectorKey)
		: queryKeys.sectors.details(sectorKey);

	const queryFn = withIndustries
		? () => api.sectors.getWithIndustries(sectorKey)
		: () => api.sectors.getByKey(sectorKey);

	const {
		data: sector,
		isLoading,
		isError,
		refetch,
	} = useQuery<Sector | SectorWithIndustries | null>({
		queryKey,
		queryFn,
		staleTime: queryOptions.staleTime,
		retry: queryOptions.retry,
		enabled: queryOptions.enabled ?? Boolean(sectorKey),
	});

	return {
		sector,
		isLoading,
		isError,
		refetch,
	};
};
