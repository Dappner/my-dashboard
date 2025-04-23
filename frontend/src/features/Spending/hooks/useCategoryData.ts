import { spendingMetricsApi, spendingMetricsApiKeys } from "@/api/spendingApi";
import type { Timeframe } from "@my-dashboard/shared";
import { useQueries } from "@tanstack/react-query";
import { format } from "date-fns";

interface UseCategoryDataOptions {
	staleTime?: number;
	enabled?: boolean;
}

export function useCategoryData(
	categoryId: string,
	date: Date = new Date(),
	timeframe: Timeframe = "m",
	{ staleTime, enabled = true }: UseCategoryDataOptions = {},
) {
	const formattedDate = format(date, "yyyy-MM-dd");
	const cacheKey = [timeframe, formattedDate];

	const [detailsQuery, receiptsQuery] = useQueries({
		queries: [
			{
				queryKey: [
					...spendingMetricsApiKeys.categoryDetails(categoryId),
					cacheKey,
				],
				queryFn: () =>
					spendingMetricsApi.getCategoryDetails(categoryId, date, timeframe),
				enabled: enabled && !!categoryId,
				staleTime,
			},
			{
				queryKey: [
					...spendingMetricsApiKeys.categoryReceipts(categoryId),
					cacheKey,
				],
				queryFn: () =>
					spendingMetricsApi.getCategoryReceipts(categoryId, date, timeframe),
				enabled: enabled && !!categoryId,
				staleTime,
			},
		],
	});

	return {
		details: detailsQuery.data,
		receipts: receiptsQuery.data,
		isLoading: detailsQuery.isLoading || receiptsQuery.isLoading,
		isFetching: detailsQuery.isFetching || receiptsQuery.isFetching,
		error: detailsQuery.error || receiptsQuery.error,
		refetch: () => {
			detailsQuery.refetch();
			receiptsQuery.refetch();
		},
	};
}
