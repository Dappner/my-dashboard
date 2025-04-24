import { supabase } from "@/lib/supabase";
import { type CustomRange, formatDate, getTimeframeRange } from "@/lib/utils";
import type { CurrencyType, Timeframe } from "@my-dashboard/shared";
import type {
	CategoryData,
	CurrencyBreakdown,
	SpendingCategory,
	SpendingSummary,
	TimeSeriesPoint,
} from "./types";

export const spendingApiKeys = {
	all: ["spending"] as const,
	summary: (tfKey: string) =>
		[...spendingApiKeys.all, "summary", tfKey] as const,
	timeSeries: (tfKey: string) =>
		[...spendingApiKeys.all, "timeSeries", tfKey] as const,
	categoryList: () => [...spendingApiKeys.all, "categories", "list"] as const,

	categoryDetail: (catId: string, tfKey: string) =>
		[...spendingApiKeys.all, "category", catId, tfKey] as const,
	categoriesDetail: (tfKey: string) =>
		[...spendingApiKeys.all, "categories", "detail", tfKey] as const,

	// timeframe: (cacheKey: string) =>
	// 	[...spendingApiKeys.all, "timeframe", cacheKey] as const,
	// overTimeData: (cacheKey: string) =>
	// 	[...spendingApiKeys.all, "overTimeData", cacheKey] as const,
	// categoryReceipts: (categoryId: string, cacheKey?: string) =>
	// 	cacheKey
	// 		? ([
	// 				...spendingApiKeys.all,
	// 				"categoryReceipts",
	// 				categoryId,
	// 				cacheKey,
	// 			] as const)
	// 		: ([...spendingApiKeys.all, "categoryReceipts", categoryId] as const),
	// categoryDetails: (categoryId: string, cacheKey?: string) =>
	// 	cacheKey
	// 		? ([
	// 				...spendingApiKeys.all,
	// 				"categoryDetails",
	// 				categoryId,
	// 				cacheKey,
	// 			] as const)
	// 		: ([...spendingApiKeys.all, "categoryDetails", categoryId] as const),
	// dailySpending: (cacheKey: string) =>
	// 	[...spendingApiKeys.all, "dailySpending", cacheKey] as const,
};

export const spendingApi = {
	async fetchSpendingSummary(
		date: Date,
		timeframe: Timeframe = "m",
		customRange?: CustomRange,
	): Promise<SpendingSummary> {
		const { start, end } = getTimeframeRange(date, timeframe, customRange);

		const { data, error } = await supabase
			.schema("spending")
			.from("receipts")
			.select("total_amount, id, currency_code")
			.gte("purchase_date", start)
			.lte("purchase_date", end);

		if (error) throw new Error(`Current month data error: ${error.message}`);

		// Group by currency
		const currencyBreakdown: CurrencyBreakdown[] = [];
		const indexMap: Partial<Record<CurrencyType, number>> = {};

		for (const receipt of data ?? []) {
			const curr = receipt.currency_code as CurrencyType;
			const amount = receipt.total_amount ?? 0;

			if (indexMap[curr] === undefined) {
				indexMap[curr] = currencyBreakdown.length;
				currencyBreakdown.push({ currency: curr, amount });
			} else {
				currencyBreakdown[indexMap[curr]].amount += amount;
			}
		}

		return {
			currencyBreakdown,
			receiptCount: data?.length || 0,
		};
	},

	async fetchSpendingTimeSeries(
		date: Date,
		timeframe: Timeframe = "m",
		dateRange?: CustomRange,
	): Promise<TimeSeriesPoint[]> {
		const { start, end } = getTimeframeRange(date, timeframe, dateRange);
		const startDate = formatDate(start);
		const endDate = formatDate(end);

		// For longer time periods, we group by month rather than day
		const groupByMonth = ["q", "y", "all"].includes(timeframe);

		const { data, error } = await supabase
			.schema("spending")
			.from("daily_spending")
			.select("date, total_amount, currency_code")
			.gte("date", startDate)
			.lte("date", endDate)
			.order("date", { ascending: true });

		if (error) throw new Error(`Time series data error: ${error.message}`);

		const periodMap: Record<string, Partial<Record<CurrencyType, number>>> = {};

		for (const row of data ?? []) {
			if (!row.date) continue;
			// "YYYY-MM" for month-based grouping, otherwise full date (daily)
			const period = groupByMonth ? row.date.substring(0, 7) : row.date;
			const curr = row.currency_code as CurrencyType;
			const amt = row.total_amount ?? 0;

			if (!periodMap[period]) periodMap[period] = {};
			periodMap[period][curr] = (periodMap[period][curr] ?? 0) + amt;
		}

		return Object.keys(periodMap)
			.sort()
			.map((period) => ({
				period,
				amounts: (
					Object.entries(periodMap[period]) as [CurrencyType, number][]
				).map(([currency, amount]) => ({ currency, amount })),
			}));
	},

	async fetchCategoriesDetail(
		date: Date,
		timeframe: Timeframe = "m",
		dateRange?: CustomRange,
	): Promise<CategoryData[]> {
		const { start, end } = dateRange || getTimeframeRange(date, timeframe);
		const startDate = formatDate(start);
		const endDate = formatDate(end);

		const { data, error } = await supabase
			.schema("spending")
			.from("receipt_items")
			.select(
				"categories(id, name), total_price, category_id, receipts(currency_code, purchase_date)",
			)
			.gte("receipts.purchase_date", startDate)
			.lte("receipts.purchase_date", endDate);

		if (error) throw new Error(`Category data error: ${error.message}`);

		const catsById: Record<
			string,
			{
				id: string;
				name: string;
				amounts: Partial<Record<CurrencyType, number>>;
			}
		> = {};

		for (const row of data) {
			const cat = row.categories;
			const rec = row.receipts;
			if (!cat || !rec) continue; // skip nulls
			const { id, name } = cat;
			const curr = rec.currency_code;

			if (!catsById[id]) {
				catsById[id] = { id, name, amounts: {} };
			}

			const bucket = catsById[id].amounts;
			bucket[curr] = (bucket[curr] ?? 0) + (row?.total_price || 0);
		}

		return Object.values(catsById).map(({ id, name, amounts }) => ({
			id,
			name,
			amounts: (Object.entries(amounts) as [CurrencyType, number][]).map(
				([currency, amount]) => ({ currency, amount }),
			),
		}));
	},

	async fetchCategoriesList(): Promise<SpendingCategory[]> {
		const { data, error } = await supabase
			.schema("spending")
			.from("categories")
			.select();

		if (error) {
			throw new Error(`Error fetching spending categories: ${error.message}`);
		}

		return data as SpendingCategory[];
	},
};
