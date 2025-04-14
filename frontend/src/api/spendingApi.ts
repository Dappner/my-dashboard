import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import type { Receipt, ReceiptItem, SpendingCategory } from "./receiptsApi";

export interface MonthlyData {
	month: string;
	amount: number;
}

export interface CategoryData {
	id: string;
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

export interface CurrentMonthResponse {
	totalSpent: number;
	receiptCount: number;
}

export type CategoryReceiptsResponse = {
	receipts: Receipt[];
	items: ReceiptItem[];
	totalSpent: number;
};

export type CategoryDetailsResponse = SpendingCategory;
export type DailySpending =
	Database["grocery"]["Views"]["daily_spending"]["Row"];

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
	categoryReceipts: (categoryId: string) =>
		[...spendingMetricsApiKeys.all, "categoryReceipts", categoryId] as const,
	categoryDetails: (categoryId: string) =>
		[...spendingMetricsApiKeys.all, "categoryDetails", categoryId] as const,
	dailySpending: (date: string) =>
		[...spendingMetricsApiKeys.all, "dailySpending", date] as const,
};

export const spendingMetricsApi = {
	async getRecentReceipts(selectedDate: Date): Promise<Receipt[]> {
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

	async getCurrentMonth(selectedDate: Date): Promise<CurrentMonthResponse> {
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

		let totalSpent = 0;
		if (data) {
			for (const receipt of data) {
				totalSpent += receipt.total_amount || 0;
			}
		}

		return {
			totalSpent,
			receiptCount: data?.length || 0,
		};
	},

	async getLastMonth(selectedDate: Date): Promise<number> {
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

		let totalSpent = 0;
		if (data) {
			for (const receipt of data) {
				totalSpent += receipt.total_amount || 0;
			}
		}

		return totalSpent;
	},

	async getMonthlyData(selectedDate: Date): Promise<MonthlyData[]> {
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

		const monthlyTotals: Record<string, number> = {};

		if (data) {
			for (const receipt of data) {
				const date = new Date(receipt.purchase_date);
				const monthKey = date.toLocaleString("default", {
					month: "short",
					year: "numeric",
					timeZone: "UTC",
				});

				if (!monthlyTotals[monthKey]) {
					monthlyTotals[monthKey] = 0;
				}

				monthlyTotals[monthKey] += receipt.total_amount || 0;
			}
		}

		const result: MonthlyData[] = [];
		for (const [month, amount] of Object.entries(monthlyTotals)) {
			result.push({ month, amount });
		}

		return result;
	},

	async getCategories(selectedDate: Date): Promise<CategoryData[]> {
		const year = selectedDate.getUTCFullYear();
		const month = selectedDate.getUTCMonth();
		const monthStart = getUTCDate(year, month, 1);
		const monthEnd = getUTCDate(year, month + 1, 0);

		const { data, error } = await supabase
			.schema("grocery")
			.from("receipt_items")
			.select("categories(id, name), total_price, category_id")
			.gte("created_at", monthStart)
			.lte("created_at", monthEnd)
			.not("category_id", "is", null);

		if (error) throw new Error(`Category data error: ${error.message}`);

		if (!data) {
			return [];
		}
		const categoryMap: Record<string, CategoryData> = {};

		for (const item of data) {
			if (item.category_id && item.categories && item.total_price != null) {
				const categoryId = item.category_id;
				const categoryName = item.categories.name || "Uncategorized";

				categoryMap[categoryId] = categoryMap[categoryId] || {
					id: categoryId,
					name: categoryName,
					amount: 0,
				};

				categoryMap[categoryId].amount += item.total_price;
			}
		}

		// Convert map to array and sort by amount (descending)
		return Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
	},

	async getCategoryReceipts(
		categoryId: string,
		selectedDate?: Date,
	): Promise<CategoryReceiptsResponse> {
		// Step 1: Get all receipt items with this category
		let query = supabase
			.schema("grocery")
			.from("receipt_items")
			.select("id, receipt_id, item_name, total_price, quantity, unit_price")
			.eq("category_id", categoryId);

		// Apply date filtering if provided
		if (selectedDate) {
			const year = selectedDate.getUTCFullYear();
			const month = selectedDate.getUTCMonth();
			const monthStart = getUTCDate(year, month, 1);
			const nextMonthStart = getUTCDate(year, month + 1, 1);

			query = query
				.gte("created_at", monthStart)
				.lt("created_at", nextMonthStart);
		}

		const { data: receiptItems, error: itemsError } = await query;
		if (itemsError) {
			throw new Error(`Error fetching category items: ${itemsError.message}`);
		}

		if (!receiptItems || receiptItems.length === 0) {
			return { receipts: [], items: [], totalSpent: 0 };
		}

		// Get unique receipt IDs
		const receiptIds: string[] = [];
		for (const item of receiptItems) {
			if (item.receipt_id && !receiptIds.includes(item.receipt_id)) {
				receiptIds.push(item.receipt_id);
			}
		}

		// Step 2: Get the full receipt data for these IDs
		const { data: receipts, error: receiptsError } = await supabase
			.schema("grocery")
			.from("receipts")
			.select("id, purchase_date, total_amount, store_name")
			.in("id", receiptIds)
			.order("purchase_date", { ascending: false });

		if (receiptsError) {
			throw new Error(`Error fetching receipts: ${receiptsError.message}`);
		}

		// Calculate total spent on this category
		let totalSpent = 0;
		for (const item of receiptItems) {
			totalSpent += item.total_price || 0;
		}

		return {
			receipts: receipts || [],
			items: receiptItems,
			totalSpent,
		};
	},

	async getCategoryDetails(
		categoryId: string,
		selectedDate?: Date,
	): Promise<CategoryDetailsResponse & { totalSpent?: number }> {
		// Get basic category details
		const { data, error } = await supabase
			.schema("grocery")
			.from("categories")
			.select("id, name, description")
			.eq("id", categoryId)
			.single();

		if (error) {
			throw new Error(`Error fetching category details: ${error.message}`);
		}

		// If date is provided, also fetch spending total for this category in the selected month
		if (selectedDate) {
			const year = selectedDate.getUTCFullYear();
			const month = selectedDate.getUTCMonth();
			const monthStart = getUTCDate(year, month, 1);
			const nextMonthStart = getUTCDate(year, month + 1, 1);

			const { data: items, error: itemsError } = await supabase
				.schema("grocery")
				.from("receipt_items")
				.select("total_price")
				.eq("category_id", categoryId)
				.gte("created_at", monthStart)
				.lt("created_at", nextMonthStart);

			if (!itemsError && items) {
				const totalSpent = items.reduce(
					(sum, item) => sum + (item.total_price || 0),
					0,
				);
				return { ...data, totalSpent };
			}
		}

		return data;
	},
	async getDailySpending(selectedDate: Date): Promise<DailySpending[]> {
		const year = selectedDate.getUTCFullYear();
		const month = selectedDate.getUTCMonth();
		const monthStart = getUTCDate(year, month, 1);
		const monthEnd = getUTCDate(year, month + 1, 0);

		const { data, error } = await supabase
			.schema("grocery")
			.from("daily_spending")
			.select("*")
			.gte("date", monthStart)
			.lte("date", monthEnd)
			.order("date", { ascending: false });

		if (error) throw new Error(`Daily spending data error: ${error.message}`);

		return data || [];
	},
};
