import {
  type SpendingMetrics,
  spendingMetricsApi,
  spendingMetricsApiKeys,
} from "@/api/spendingApi";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useSpendingMetrics(selectedDate: Date): {
  spendingMetrics: SpendingMetrics;
  isLoading: boolean;
  error: Error | null;
} {
  const dateKey = selectedDate.toISOString().split("T")[0];

  const {
    data: currentMonthData,
    isLoading: currentLoading,
    error: currentError,
  } = useSuspenseQuery({
    queryKey: spendingMetricsApiKeys.currentMonth(dateKey),
    queryFn: () => spendingMetricsApi.getCurrentMonth(selectedDate),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: lastMonthData,
    isLoading: lastLoading,
    error: lastError,
  } = useSuspenseQuery({
    queryKey: spendingMetricsApiKeys.lastMonth(dateKey),
    queryFn: () => spendingMetricsApi.getLastMonth(selectedDate),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: monthlyData,
    isLoading: monthlyLoading,
    error: monthlyError,
  } = useSuspenseQuery({
    queryKey: spendingMetricsApiKeys.monthlyData(dateKey),
    queryFn: () => spendingMetricsApi.getMonthlyData(selectedDate),
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useSuspenseQuery({
    queryKey: spendingMetricsApiKeys.categories(dateKey),
    queryFn: () => spendingMetricsApi.getCategories(selectedDate),
    staleTime: 5 * 60 * 1000,
  });

  const monthlyTrend = lastMonthData && currentMonthData?.totalSpent
    ? ((currentMonthData.totalSpent - lastMonthData) / lastMonthData) * 100
    : 0;

  return {
    spendingMetrics: {
      totalSpent: currentMonthData?.totalSpent || 0,
      receiptCount: currentMonthData?.receiptCount || 0,
      monthlyTrend,
      monthlyData: monthlyData || [],
      categories: categories || [],
    },
    isLoading: currentLoading || lastLoading || monthlyLoading ||
      categoriesLoading,
    error: currentError || lastError || monthlyError || categoriesError || null,
  };
}
