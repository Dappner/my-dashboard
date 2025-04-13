import { supabase } from "@/lib/supabase";
import type { Receipt } from "./receiptsApi";

export interface MonthlyData {
	month: string;
	amount: number;
}

export interface CategoryData {
	name: string;
	amount: number;
}

export interface SpendingMetrics {
	totalSpent: number;
	receiptCount: number;
	monthlyTrend: number;
	monthlyData: MonthlyData[];
	categories: CategoryData[];
}

const getUTCDate = (year: number, month: number, day: number): string => {
	return new Date(Date.UTC(year, month, day)).toISOString().split("T")[0];
};

export const spendingMetricsApiKeys = {
	all: ["spendingMetrics"] as const,
	currentMonth: (date: string) =>
		[...spendingMetricsApiKeys.all, "currentMonth", date] as const,
	lastMonth: (date: string) =>
		[...spendingMetricsApiKeys.all, "lastMonth", date] as const,
	monthlyData: (date: string) =>
		[...spendingMetricsApiKeys.all, "monthlyData", date] as const,
	categories: (date: string) =>
		[...spendingMetricsApiKeys.all, "categories", date] as const,
};

export const spendingMetricsApi = {
	async getRecentReceipts(selectedDate: Date) {
		const year = selectedDate.getUTCFullYear();
		const month = selectedDate.getUTCMonth();
		const monthStart = new Date(Date.UTC(year, month, 1))
			.toISOString()
			.split("T")[0];
		const nextMonthStart = new Date(Date.UTC(year, month + 1, 1))
			.toISOString()
			.split("T")[0];
		const { data, error } = await supabase
			.schema("grocery")
			.from("receipts")
			.select("id, purchase_date, total_amount, store_name")
			.gte("purchase_date", monthStart)
			.lt("purchase_date", nextMonthStart)
			.order("purchase_date", { ascending: false })
			.limit(5);

		if (error) throw new Error("Error fetching receipts");

		return data as Receipt[];
	},

	async getCurrentMonth(selectedDate: Date) {
		const year = selectedDate.getUTCFullYear();
		const month = selectedDate.getUTCMonth();
		const monthStart = getUTCDate(year, month, 1);
		const nextMonthStart = getUTCDate(year, month + 1, 1);

		const { data, error } = await supabase
			.schema("grocery")
			.from("receipts")
			.select("total_amount, id")
			.gte("purchase_date", monthStart)
			.lt("purchase_date", nextMonthStart);

		if (error) throw new Error(`Current month data error: ${error.message}`);

		return {
			totalSpent:
				data?.reduce((sum, receipt) => sum + (receipt.total_amount || 0), 0) ||
				0,
			receiptCount: data?.length || 0,
		};
	},

	async getLastMonth(selectedDate: Date) {
		const year = selectedDate.getUTCFullYear();
		const month = selectedDate.getUTCMonth();
		const lastMonthStart = getUTCDate(year, month - 1, 1);
		const monthStart = getUTCDate(year, month, 1);

		const { data, error } = await supabase
			.schema("grocery")
			.from("receipts")
			.select("total_amount")
			.gte("purchase_date", lastMonthStart)
			.lt("purchase_date", monthStart);

		if (error) throw new Error(`Last month data error: ${error.message}`);

		return (
			data?.reduce((sum, receipt) => sum + (receipt.total_amount || 0), 0) || 0
		);
	},

	async getMonthlyData(selectedDate: Date) {
		const year = selectedDate.getUTCFullYear();
		const month = selectedDate.getUTCMonth();
		const sixMonthsAgo = getUTCDate(year, month - 6, 1);

		const { data, error } = await supabase
			.schema("grocery")
			.from("receipts")
			.select("purchase_date, total_amount")
			.gte("purchase_date", sixMonthsAgo)
			.order("purchase_date", { ascending: true });

		if (error) throw new Error(`Monthly data error: ${error.message}`);

		return Object.entries(
			data?.reduce(
				(acc, receipt) => {
					const date = new Date(receipt.purchase_date);
					const monthKey = date.toLocaleString("default", {
						month: "short",
						year: "numeric",
						timeZone: "UTC",
					});
					acc[monthKey] = (acc[monthKey] || 0) + (receipt.total_amount || 0);
					return acc;
				},
				{} as Record<string, number>,
			) || {},
		).map(([month, amount]) => ({ month, amount }));
	},

	async getCategories(selectedDate: Date) {
		const year = selectedDate.getUTCFullYear();
		const month = selectedDate.getUTCMonth();
		const monthStart = getUTCDate(year, month, 1);

		const { data, error } = await supabase
			.schema("grocery")
			.from("receipt_items")
			.select("categories(name), total_price")
			.gte("created_at", monthStart)
			.not("category_id", "is", null);

		if (error) throw new Error(`Category data error: ${error.message}`);

		return Object.entries(
			data?.reduce(
				(acc, item) => {
					const categoryName = item.categories?.name || "Uncategorized";
					acc[categoryName] =
						(acc[categoryName] || 0) + (item.total_price || 0);
					return acc;
				},
				{} as Record<string, number>,
			) || {},
		).map(([name, amount]) => ({ name, amount }));
	},
};
