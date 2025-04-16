import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import type { Receipt, ReceiptItem, SpendingCategory } from "./receiptsApi";
import type { CurrencyType } from "@my-dashboard/shared";

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
      .select("id, purchase_date, total_amount, store_name, currency_code")
      .gte("purchase_date", monthStart)
      .lt("purchase_date", nextMonthStart)
      .order("purchase_date", { ascending: false })
      .limit(5);

    if (error) throw new Error(`Error fetching receipts: ${error.message}`);
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
      .select("total_amount, id, currency_code")
      .gte("purchase_date", monthStart)
      .lt("purchase_date", nextMonthStart);

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

  async getLastMonth(selectedDate: Date): Promise<{
    totalSpent: number;
    currencyBreakdown: { currency: CurrencyType; amount: number }[];
  }> {
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();
    const lastMonthStart = getUTCDate(year, month - 1, 1);
    const monthStart = getUTCDate(year, month, 1);

    const { data, error } = await supabase
      .schema("grocery")
      .from("receipts")
      .select("total_amount, currency_code")
      .gte("purchase_date", lastMonthStart)
      .lt("purchase_date", monthStart);

    if (error) throw new Error(`Last month data error: ${error.message}`);

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
    };
  },

  async getMonthlyData(selectedDate: Date): Promise<MonthlyData[]> {
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();
    const sixMonthsAgo = getUTCDate(year, month - 6, 1);

    const { data, error } = await supabase
      .schema("grocery")
      .from("receipts")
      .select("purchase_date, total_amount, currency_code")
      .gte("purchase_date", sixMonthsAgo)
      .order("purchase_date", { ascending: true });

    if (error) throw new Error(`Monthly data error: ${error.message}`);

    // Need to group by month AND currency
    const monthCurrencyTotals: Record<string, Record<string, number>> = {};

    if (data) {
      for (const receipt of data) {
        const date = new Date(receipt.purchase_date);
        const monthKey = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        });
        const currency = receipt.currency_code as CurrencyType;
        const amount = receipt.total_amount || 0;

        if (!monthCurrencyTotals[monthKey]) {
          monthCurrencyTotals[monthKey] = {};
        }

        monthCurrencyTotals[monthKey][currency] =
          (monthCurrencyTotals[monthKey][currency] || 0) + amount;
      }
    }

    // Transform into the required format
    const result: MonthlyData[] = [];
    for (const [month, currencies] of Object.entries(monthCurrencyTotals)) {
      for (const [currency, amount] of Object.entries(currencies)) {
        result.push({
          month,
          amount,
          currency: currency as CurrencyType,
        });
      }
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
      .select(
        "categories(id, name), total_price, category_id, receipts(currency_code)",
      )
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd)
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
    selectedDate?: Date,
  ): Promise<CategoryReceiptsResponse> {
    // Define the type for the query result
    type CategoryItemsResult = {
      id: string;
      receipt_id: string;
      item_name: string;
      readable_name: string | null;
      total_price: number | null;
      quantity: number | null;
      unit_price: number;
      receipts: { currency_code: string } | null;
    };

    // Step 1: Get all receipt items with this category
    let query = supabase
      .schema("grocery")
      .from("receipt_items")
      .select(
        "id, receipt_id, item_name, readable_name, total_price, quantity, unit_price, receipts(currency_code)",
      )
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
      return {
        receipts: [],
        items: [],
        totalSpent: 0,
        currencyBreakdown: [],
      };
    }

    // Get unique receipt IDs
    const receiptIds = [
      ...new Set(
        (receiptItems as CategoryItemsResult[])
          .filter((item) => item.receipt_id)
          .map((item) => item.receipt_id),
      ),
    ];

    // Step 2: Get the full receipt data for these IDs
    const { data: receipts, error: receiptsError } = await supabase
      .schema("grocery")
      .from("receipts")
      .select("id, purchase_date, total_amount, store_name, currency_code")
      .in("id", receiptIds)
      .order("purchase_date", { ascending: false });

    if (receiptsError) {
      throw new Error(`Error fetching receipts: ${receiptsError.message}`);
    }

    // Calculate total spent on this category by currency
    const currencyMap: Record<string, number> = {};
    let totalSpent = 0;

    for (const item of receiptItems as CategoryItemsResult[]) {
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

    return {
      receipts: (receipts as Receipt[]) || [],
      items: receiptItems as unknown as ReceiptItem[],
      totalSpent,
      currencyBreakdown,
    };
  },

  async getCategoryDetails(
    categoryId: string,
    selectedDate?: Date,
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
    if (selectedDate) {
      const year = selectedDate.getUTCFullYear();
      const month = selectedDate.getUTCMonth();
      const monthStart = getUTCDate(year, month, 1);
      const nextMonthStart = getUTCDate(year, month + 1, 1);

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
        .gte("created_at", monthStart)
        .lt("created_at", nextMonthStart);

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
