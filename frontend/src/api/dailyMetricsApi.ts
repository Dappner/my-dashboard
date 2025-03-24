import { getDateRangeFilter } from "@/lib/dateRangeFilter";
import { supabase } from "@/lib/supabase";
import {
  PortfolioDailyMetric,
  Timeframe,
} from "@/types/portfolioDailyMetricTypes";

export const dailyMetricsApiKeys = {
  all: ["dailyMetrics"] as const,
  timeframe: (timeframe: Timeframe) =>
    [...dailyMetricsApiKeys.all, timeframe] as const,
};

export const dailyMetricsApi = {
  async getDailyMetrics(timeframe: Timeframe): Promise<PortfolioDailyMetric[]> {
    const { startDate } = getDateRangeFilter(timeframe);

    let query = supabase
      .from("portfolio_daily_metrics")
      .select("*")
      .order("current_date", { ascending: true });

    if (startDate) {
      query = query.gte("current_date", startDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch daily metrics: ${error.message}`);
    }

    return data as PortfolioDailyMetric[];
  },
};
