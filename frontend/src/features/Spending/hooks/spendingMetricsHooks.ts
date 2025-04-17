import type { Receipt } from "@/api/receiptsApi";
import {
	type CategoryData,
	type CategoryDetailsResponse,
	type CategoryReceiptsResponse,
	type CurrentMonthResponse,
	type MonthlyData,
	spendingMetricsApi,
	spendingMetricsApiKeys,
} from "@/api/spendingApi";
import { getMonthYear } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch recent receipts for a selected date
 */
export function useRecentReceipts(selectedDate: Date) {
	return useQuery<Receipt[]>({
		queryKey: ["receipts", "recent", getMonthYear(selectedDate)],
		queryFn: () => spendingMetricsApi.getRecentReceipts(selectedDate),
	});
}

/**
 * Hook to fetch current month spending data
 */
export function useCurrentMonthSpending(selectedDate: Date) {
	return useQuery<CurrentMonthResponse>({
		queryKey: spendingMetricsApiKeys.currentMonth(getMonthYear(selectedDate)),
		queryFn: () => spendingMetricsApi.getCurrentMonth(selectedDate),
	});
}

/**
 * Hook to fetch last month spending data
 */
export function useLastMonthSpending(selectedDate: Date) {
	// biome-ignore lint/suspicious/noExplicitAny: TODO: FIX
	return useQuery<any>({
		queryKey: spendingMetricsApiKeys.lastMonth(getMonthYear(selectedDate)),
		queryFn: () => spendingMetricsApi.getLastMonth(selectedDate),
	});
}

/**
 * Hook to fetch monthly spending data for charts
 */
export function useMonthlySpendingData(selectedDate: Date) {
	return useQuery<MonthlyData[]>({
		queryKey: spendingMetricsApiKeys.monthlyData(getMonthYear(selectedDate)),
		queryFn: () => spendingMetricsApi.getMonthlyData(selectedDate),
	});
}

/**
 * Hook to fetch spending categories
 */
export function useSpendingCategories(selectedDate: Date) {
	return useQuery<CategoryData[]>({
		queryKey: spendingMetricsApiKeys.categories(getMonthYear(selectedDate)),
		queryFn: () => spendingMetricsApi.getCategories(selectedDate),
	});
}

/**
 * Hook to fetch all receipts containing items from a specific category
 */
export function useCategoryReceipts(categoryId: string) {
	return useQuery<CategoryReceiptsResponse>({
		queryKey: spendingMetricsApiKeys.categoryReceipts(categoryId),
		queryFn: () => spendingMetricsApi.getCategoryReceipts(categoryId),
		enabled: !!categoryId,
	});
}

/**
 * Hook to fetch details about a specific category
 */
export function useCategoryDetails(categoryId: string) {
	return useQuery<CategoryDetailsResponse>({
		queryKey: spendingMetricsApiKeys.categoryDetails(categoryId),
		queryFn: () => spendingMetricsApi.getCategoryDetails(categoryId),
		enabled: !!categoryId,
	});
}
