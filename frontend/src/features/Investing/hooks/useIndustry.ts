import { api } from "@/lib/api";
import { type IndustryWithSector, queryKeys } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";

interface UseIndustryOptions {
	staleTime?: number;
	retry?: number | boolean;
	enabled?: boolean;
}

export const useIndustry = (
	industryKey: string,
	options: UseIndustryOptions = {},
) => {
	const {
		data: industry,
		isLoading,
		isError,
		refetch,
	} = useQuery<IndustryWithSector | null>({
		queryKey: queryKeys.industries.details(industryKey),
		queryFn: () => api.industries.getByKey(industryKey),
		staleTime: options.staleTime,
		retry: options.retry,
		enabled: options.enabled ?? Boolean(industryKey),
	});

	return {
		industry,
		isLoading,
		isError,
		refetch,
	};
};
