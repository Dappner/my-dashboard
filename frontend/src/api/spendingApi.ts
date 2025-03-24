import { supabase } from "@/lib/supabase";

interface MonthlyData {
  month: string;
  amount: number;
}

interface CategoryData {
  name: string;
  amount: number;
}

interface SpendingMetrics {
  totalSpent: number;
  receiptCount: number;
  monthlyTrend: number;
  monthlyData: MonthlyData[];
  categories: CategoryData[];
}

export const spendingMetricsApiKeys = {
  all: ["spendingMetrics"] as const,
  overview: () => [...spendingMetricsApiKeys.all, "overview"] as const,
};

export const spendingMetricsApi = {
  async getSpendingMetrics(): Promise<SpendingMetrics> {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString();
    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    ).toISOString();
    const sixMonthsAgo = new Date(today.setMonth(today.getMonth() - 6))
      .toISOString();

    // Fetch total spent and receipt count for current month
    const { data: currentMonthData, error: currentError } = await supabase
      .schema("grocery")
      .from("receipts")
      .select("total_amount, id")
      .gte("purchase_date", currentMonthStart);

    if (currentError) {
      throw new Error(
        `Failed to fetch current month data: ${currentError.message}`,
      );
    }

    const totalSpent = currentMonthData?.reduce(
      (sum, receipt) => sum + (receipt.total_amount || 0),
      0,
    ) || 0;
    const receiptCount = currentMonthData?.length || 0;

    // Fetch last month's total for trend calculation
    const { data: lastMonthData, error: lastMonthError } = await supabase
      .schema("grocery")
      .from("receipts")
      .select("total_amount")
      .gte("purchase_date", lastMonthStart)
      .lt("purchase_date", currentMonthStart);

    if (lastMonthError) {
      throw new Error(
        `Failed to fetch last month data: ${lastMonthError.message}`,
      );
    }

    const lastMonthTotal = lastMonthData?.reduce(
      (sum, receipt) => sum + (receipt.total_amount || 0),
      0,
    ) || 0;
    const monthlyTrend = lastMonthTotal > 0
      ? ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100
      : 0;

    // Fetch 6 months of data for trend chart
    const { data: monthlyDataRaw, error: monthlyError } = await supabase
      .schema("grocery")
      .from("receipts")
      .select("purchase_date, total_amount")
      .gte("purchase_date", sixMonthsAgo)
      .order("purchase_date", { ascending: true });

    if (monthlyError) {
      throw new Error(`Failed to fetch monthly data: ${monthlyError.message}`);
    }

    const monthlyData = Object.entries(
      monthlyDataRaw?.reduce((acc, receipt) => {
        const month = new Date(receipt.purchase_date).toLocaleString(
          "default",
          { month: "short", year: "numeric" },
        );
        acc[month] = (acc[month] || 0) + (receipt.total_amount || 0);
        return acc;
      }, {} as Record<string, number>) || {},
    ).map(([month, amount]) => ({ month, amount }));

    // Fetch category breakdown
    const { data: categoryDataRaw, error: categoryError } = await supabase
      .schema("grocery")
      .from("receipt_items")
      .select("categories(name), total_price")
      .gte("created_at", currentMonthStart)
      .not("category_id", "is", null);

    if (categoryError) {
      throw new Error(
        `Failed to fetch category data: ${categoryError.message}`,
      );
    }

    const categories = Object.entries(
      categoryDataRaw?.reduce((acc, item) => {
        const categoryName = item.categories?.name || "Uncategorized";
        acc[categoryName] = (acc[categoryName] || 0) + (item.total_price || 0);
        return acc;
      }, {} as Record<string, number>) || {},
    ).map(([name, amount]) => ({ name, amount }));

    return {
      totalSpent,
      receiptCount,
      monthlyTrend,
      monthlyData,
      categories,
    };
  },
};
