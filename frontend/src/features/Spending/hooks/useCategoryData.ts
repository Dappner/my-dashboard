import { spendingMetricsApiKeys, spendingMetricsApi } from "@/api/spendingApi";
import { useQuery } from "@tanstack/react-query";

export function useCategoryData(categoryId: string, selectedDate?: Date) {
	const dateKey = selectedDate
		? selectedDate.toISOString().split("T")[0]
		: "all";

	// Category details query
	const detailsQuery = useQuery({
		queryKey: [...spendingMetricsApiKeys.categoryDetails(categoryId), dateKey],
		queryFn: () =>
			spendingMetricsApi.getCategoryDetails(categoryId, selectedDate),
		enabled: !!categoryId,
	});

	// Category receipts query
	const receiptsQuery = useQuery({
		queryKey: [...spendingMetricsApiKeys.categoryReceipts(categoryId), dateKey],
		queryFn: () =>
			spendingMetricsApi.getCategoryReceipts(categoryId, selectedDate),
		enabled: !!categoryId,
	});

	return {
		details: detailsQuery.data,
		receipts: receiptsQuery.data?.receipts || [],
		items: receiptsQuery.data?.items || [],
		totalSpent: receiptsQuery.data?.totalSpent || 0,
		isLoading: detailsQuery.isLoading || receiptsQuery.isLoading,
		error: detailsQuery.error || receiptsQuery.error,
	};
}
