import { spendingMetricsApiKeys, spendingMetricsApi } from "@/api/spendingApi";
import { getMonthYear } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export function useMonthSpending(date: Date) {
	const monthKey = getMonthYear(date);

	return useQuery({
		queryKey: spendingMetricsApiKeys.month(monthKey),
		queryFn: () => spendingMetricsApi.getMonthData(date),
		staleTime: 5 * 60 * 1000,
	});
}
