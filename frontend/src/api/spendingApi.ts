import { supabase } from "@/lib/supabase";
import { type CustomRange, formatDate, getTimeframeRange } from "@/lib/utils";
import type { Database } from "@/types/supabase";
import type { CurrencyType, Timeframe } from "@my-dashboard/shared";
import type { Receipt, ReceiptItem, SpendingCategory } from "./receiptsApi";

export interface MonthlyData {
  month: string;
  amount: number;
  currency: CurrencyType;
}

export interface CategoryData {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyType;
}

export interface SpendingMetrics {
  totalSpent: number;
  currencyBreakdown: {
    currency: CurrencyType;
    amount: number;
  }[];
  receiptCount: number;
  monthlyTrend: number;
  monthlyData: MonthlyData[];
  categories: CategoryData[];
}

export interface CurrentMonthResponse {
  totalSpent: number;
  currencyBreakdown: {
    currency: CurrencyType;
    amount: number;
  }[];
  receiptCount: number;
}

export type CategoryReceiptsResponse = {
  receipts: Receipt[];
  items: ReceiptItem[];
  totalSpent: number;
  currencyBreakdown: {
    currency: CurrencyType;
    amount: number;
  }[];
};

// Define the type for the query result
type CategoryQueryResult = {
  categories: { id: string; name: string } | null;
  total_price: number | null;
  category_id: string | null;
  receipts: { currency_code: string } | null;
};

export type CategoryDetailsResponse = SpendingCategory;
export type DailySpending =
  Database["grocery"]["Views"]["daily_spending"]["Row"];

export type CategoryReceiptRow = {
  id: string;
  store_name: string | null;
  purchase_date: string;
  currency_code: CurrencyType;
  total_amount: number;
  receipt_items: Array<{
    id: string;
    receipt_id: string;
    readable_name: string;
    total_price: number | null;
    quantity: number | null;
    unit_price: number;
  }>;
};

export const spendingMetricsApiKeys = {
  all: ["spendingMetrics"] as const,
  timeframe: (cacheKey: string) =>
    [...spendingMetricsApiKeys.all, "timeframe", cacheKey] as const,
  overTimeData: (cacheKey: string) =>
    [...spendingMetricsApiKeys.all, "overTimeData", cacheKey] as const,
  categories: (cacheKey: string) =>
    [...spendingMetricsApiKeys.all, "categories", cacheKey] as const,
  categoryReceipts: (categoryId: string, cacheKey?: string) =>
    cacheKey
      ? ([
        ...spendingMetricsApiKeys.all,
        "categoryReceipts",
        categoryId,
        cacheKey,
      ] as const)
      : ([
        ...spendingMetricsApiKeys.all,
        "categoryReceipts",
        categoryId,
      ] as const),
  categoryDetails: (categoryId: string, cacheKey?: string) =>
    cacheKey
      ? ([
        ...spendingMetricsApiKeys.all,
        "categoryDetails",
        categoryId,
        cacheKey,
      ] as const)
      : ([
        ...spendingMetricsApiKeys.all,
        "categoryDetails",
        categoryId,
      ] as const),
  dailySpending: (cacheKey: string) =>
    [...spendingMetricsApiKeys.all, "dailySpending", cacheKey] as const,
};

export const spendingMetricsApi = {
  async getRecentReceipts(
    date: Date,
    timeframe: Timeframe = "m",
    customRange?: CustomRange,
  ): Promise<Receipt[]> {
    const { start, end } = getTimeframeRange(date, timeframe, customRange);

    const { data, error } = await supabase
      .schema("grocery")
      .from("receipts")
      .select("id, purchase_date, total_amount, store_name, currency_code")
      .gte("purchase_date", start)
      .lte("purchase_date", end)
      .order("purchase_date", { ascending: false })
      .limit(5);

    if (error) throw new Error(`Error fetching receipts: ${error.message}`);
    return data as Receipt[];
  },

  async getTimeframeData(
    date: Date,
    timeframe: Timeframe = "m",
    customRange?: CustomRange,
  ): Promise<CurrentMonthResponse> {
    const { start, end } = getTimeframeRange(date, timeframe, customRange);

    const { data, error } = await supabase
      .schema("grocery")
      .from("receipts")
      .select("total_amount, id, currency_code")
      .gte("purchase_date", start)
      .lte("purchase_date", end);

    if (error) throw new Error(`Current month data error: ${error.message}`);

    // Group by currency
    const currencyMap: Record<string, number> = {};
    let totalSpent = 0;

    if (data) {
      for (const receipt of data) {
        const currency = receipt.currency_code as CurrencyType;
        const amount = receipt.total_amount || 0;

        currencyMap[currency] = (currencyMap[currency] || 0) + amount;
        totalSpent += amount;
      }
    }

    // Convert to array format
    const currencyBreakdown = Object.entries(currencyMap).map(
      ([currency, amount]) => ({
        currency: currency as CurrencyType,
        amount,
      }),
    );

    return {
      totalSpent,
      currencyBreakdown,
      receiptCount: data?.length || 0,
    };
  },

  async getOverTimeData(
    date: Date,
    timeframe: Timeframe = "m",
    dateRange?: CustomRange,
  ): Promise<MonthlyData[]> {
    const { start, end } = getTimeframeRange(date, timeframe, dateRange);
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    // For longer time periods, we might want to group by month rather than day
    const groupByMonth = ["q", "y", "all"].includes(timeframe);

    // Use daily_spending view which has date based data
    const { data, error } = await supabase
      .schema("grocery")
      .from("daily_spending")
      .select("date, total_amount, currency_code")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) throw new Error(`Time series data error: ${error.message}`);

    // For shorter timeframes, return daily data
    if (!groupByMonth) {
      return (data || []).map((row) => ({
        period: row.date,
        amount: row.total_amount || 0,
        currency: (row.currency_code as CurrencyType) || "USD",
      }));
    }

    // For longer timeframes, group by month
    const monthlyData: Record<string, Record<string, number>> = {};

    if (data) {
      for (const row of data) {
        if (!row.date) continue;

        // Extract month from date (YYYY-MM)
        const month = row.date.substring(0, 7);
        const currency = (row.currency_code as CurrencyType) || "USD";
        const amount = row.total_amount || 0;

        if (!monthlyData[month]) {
          monthlyData[month] = {};
        }

        monthlyData[month][currency] =
          (monthlyData[month][currency] || 0) + amount;
      }
    }

    // Convert to array format
    const result: MonthlyData[] = [];

    for (const [month, currencies] of Object.entries(monthlyData)) {
      for (const [currency, amount] of Object.entries(currencies)) {
        result.push({
          period: month,
          month: month, // For backward compatibility
          amount,
          currency: currency as CurrencyType,
        });
      }
    }

    return result;
  },

  async getCategories(
    date: Date,
    timeframe: Timeframe = "m",
    dateRange?: CustomRange,
  ): Promise<CategoryData[]> {
    const { start, end } = dateRange || getTimeframeRange(date, timeframe);
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    const { data, error } = await supabase
      .schema("grocery")
      .from("receipt_items")
      .select(
        "categories(id, name), total_price, category_id, receipts(currency_code, purchase_date)",
      )
      .gte("receipts.purchase_date", startDate)
      .lte("receipts.purchase_date", endDate)
      .not("category_id", "is", null);

    if (error) throw new Error(`Category data error: ${error.message}`);

    if (!data) {
      return [];
    }

    // Group by category and currency
    const categoryMap: Record<
      string,
      Record<string, { amount: number; name: string }>
    > = {};

    for (const item of data as CategoryQueryResult[]) {
      if (
        item.category_id &&
        item.categories &&
        item.total_price != null &&
        item.receipts &&
        item.receipts.currency_code
      ) {
        const categoryId = item.category_id;
        const categoryName = item.categories.name || "Uncategorized";
        const currency = item.receipts.currency_code as CurrencyType;

        if (!categoryMap[categoryId]) {
          categoryMap[categoryId] = {};
        }

        if (!categoryMap[categoryId][currency]) {
          categoryMap[categoryId][currency] = { amount: 0, name: categoryName };
        }

        categoryMap[categoryId][currency].amount += item.total_price;
      }
    }

    // Transform into the required format
    const result: CategoryData[] = [];
    for (const [categoryId, currencies] of Object.entries(categoryMap)) {
      for (const [currency, { amount, name }] of Object.entries(currencies)) {
        result.push({
          id: categoryId,
          name,
          amount,
          currency: currency as CurrencyType,
        });
      }
    }

    // Sort by amount (descending)
    return result.sort((a, b) => b.amount - a.amount);
  },

  async getCategoryReceipts(
    categoryId: string,
    date?: Date,
    timeframe?: Timeframe,
    dateRange?: CustomRange,
  ): Promise<CategoryReceiptRow[]> {
    const { start, end } = getTimeframeRange(date, timeframe || "m", dateRange);

    const { data, error } = await supabase
      .schema("grocery")
      .from("receipts")
      .select(`
      id,
      store_name,
      purchase_date,
      currency_code,
      total_amount,
      receipt_items!inner(
        id,
        receipt_id,
        readable_name,
        total_price,
        quantity,
        unit_price
      )
    `)
      .eq("receipt_items.category_id", categoryId)
      .gte("purchase_date", start)
      .lte("purchase_date", end)
      .order("purchase_date", { ascending: false });

    if (error) {
      throw new Error(`Could not load category receipts: ${error.message}`);
    }

    // cast to our minimal shape
    return (data ?? []) as CategoryReceiptRow[];
  },
  async getCategoryDetails(
    categoryId: string,
    date?: Date,
    timeframe?: Timeframe,
    dateRange?: CustomRange,
  ): Promise<
    CategoryDetailsResponse & {
      totalSpent?: number;
      currencyBreakdown?: { currency: CurrencyType; amount: number }[];
    }
  > {
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
    if (date && (timeframe || dateRange)) {
      const { start, end } = getTimeframeRange(
        date,
        timeframe || "m",
        dateRange,
      );
      const startDate = formatDate(start);
      const endDate = formatDate(end);

      // Define the type for the query result
      type CategoryItemsResult = {
        total_price: number | null;
        receipts: { currency_code: string } | null;
      };

      const { data: items, error: itemsError } = await supabase
        .schema("grocery")
        .from("receipt_items")
        .select("total_price, receipts(currency_code)")
        .eq("category_id", categoryId)
        .gte("receipts.purchase_date", startDate)
        .lte("receipts.purchase_date", endDate);

      if (!itemsError && items && items.length > 0) {
        // Calculate total spending by currency
        const currencyMap: Record<string, number> = {};
        let totalSpent = 0;

        for (const item of items as CategoryItemsResult[]) {
          if (
            item.total_price !== null &&
            item.receipts &&
            item.receipts.currency_code
          ) {
            const amount = item.total_price;
            const currency = item.receipts.currency_code as CurrencyType;

            currencyMap[currency] = (currencyMap[currency] || 0) + amount;
            totalSpent += amount;
          }
        }

        // Convert to array format
        const currencyBreakdown = Object.entries(currencyMap).map(
          ([currency, amount]) => ({
            currency: currency as CurrencyType,
            amount,
          }),
        );

        return { ...data, totalSpent, currencyBreakdown };
      }
    }

    return data;
  },

  async getDailySpending(
    selectedDate: Date,
    timeframe: Timeframe = "m",
    dateRange?: CustomRange,
  ): Promise<DailySpending[]> {
    const { start, end } =
      dateRange || getTimeframeRange(selectedDate, timeframe);
    const startDate = formatDate(start);
    const endDate = formatDate(end);

    const { data, error } = await supabase
      .schema("grocery")
      .from("daily_spending")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) throw new Error(`Daily spending data error: ${error.message}`);

    return data || [];
  },
};
