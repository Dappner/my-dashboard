import { spendingMetricsApi, spendingMetricsApiKeys } from "@/api/spendingApi";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSpendingMetrics() {
	const { data, isLoading, error } = useSuspenseQuery({
		queryKey: spendingMetricsApiKeys.overview(),
		queryFn: () => spendingMetricsApi.getSpendingMetrics(),
	});

	return {
		spendingMetrics: data,
		isLoading,
		error: error ? new Error("Failed to fetch spending metrics") : null,
	};
}
