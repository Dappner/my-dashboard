import { supabase } from "@/lib/supabase";
import { PortfolioDailyMetric, Timeframe } from "@/types/portfolioDailyMetricTypes";

export const dailyMetricsApiKeys = {
  all: ['dailyMetrics'] as const,
  timeframe: (timeframe: Timeframe) => [...dailyMetricsApiKeys.all, timeframe] as const,
}

export const dailyMetricsApi = {
  async getDailyMetrics(timeframe: Timeframe): Promise<PortfolioDailyMetric[]> {
    // Get current date
    const now = new Date();
    let query = supabase
      .from("portfolio_daily_metrics")
      .select("*")
      .order("current_date", { ascending: true });

    // Apply date filters based on timeframe
    switch (timeframe) {
      case "1W": {
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
        query = query.gte("current_date", oneWeekAgo);
        break;
      }
      case "1M": {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        query = query.gte("current_date", oneMonthAgo);
        break;
      }
      case "3M": {
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3)).toISOString();
        query = query.gte("current_date", threeMonthsAgo);
        break;
      }
      case "YTD": {
        const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
        query = query.gte("current_date", yearStart);
        break;
      }
      case "1Y": {
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
        query = query.gte("current_date", oneYearAgo);
        break;
      }
      case "ALL":
        // No date filter needed for ALL
        break;
      default:
        throw new Error(`Unsupported timeframe: ${timeframe}`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch daily metrics: ${error.message}`);
    }

    return data as PortfolioDailyMetric[];
  }
};
