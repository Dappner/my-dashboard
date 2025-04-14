import { spendingMetricsApi, spendingMetricsApiKeys } from "@/api/spendingApi";
import { useQuery } from "@tanstack/react-query";

export function useCategoryReceipts(categoryId: string) {
	return useQuery({
		queryKey: spendingMetricsApiKeys.categoryReceipts(categoryId),
		queryFn: () => spendingMetricsApi.getCategoryReceipts(categoryId),
		enabled: !!categoryId,
	});
}

export function useCategoryDetails(categoryId: string) {
	return useQuery({
		queryKey: spendingMetricsApiKeys.categoryDetails(categoryId),
		queryFn: () => spendingMetricsApi.getCategoryDetails(categoryId),
		enabled: !!categoryId,
	});
}
