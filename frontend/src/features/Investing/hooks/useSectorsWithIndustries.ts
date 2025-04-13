import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys, type SectorWithIndustries } from "@my-dashboard/shared";

interface SectorsQueryOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

interface UseSectorsWithIndustriesOptions {
	queryOptions?: SectorsQueryOptions;
}

const sectorsApi = api.sectors;

export const useSectorsWithIndustries = (
	options: UseSectorsWithIndustriesOptions = {},
) => {
	const { queryOptions = {} } = options;

	const queryKey = queryKeys.sectors.withIndustries("all");

	const queryFn = async () => {
		const sectors = await sectorsApi.getAll();
		const sectorsWithIndustries = await Promise.all(
			sectors.map(async (sector) => {
				const sectorWithIndustries = await sectorsApi.getWithIndustries(
					sector.key,
				);
				return sectorWithIndustries || { ...sector, industries: [] };
			}),
		);
		return sectorsWithIndustries.filter(
			(sector): sector is SectorWithIndustries => sector !== null,
		);
	};

	const {
		data: sectors = [],
		isLoading,
		isError,
		refetch,
	} = useQuery<SectorWithIndustries[]>({
		queryKey,
		queryFn,
		staleTime: queryOptions.staleTime ?? 1000 * 60 * 5, // 5 minutes default
		retry: queryOptions.retry ?? 1,
		enabled: queryOptions.enabled ?? true,
	});

	return {
		sectors,
		isLoading,
		isError,
		refetch,
	};
};
