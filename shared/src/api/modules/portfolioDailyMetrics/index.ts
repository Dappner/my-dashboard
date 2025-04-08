import { getDateRangeFilter } from "@/utils/dateRangeFilter";
import { PortfolioDailyMetric } from "./types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase";
import { Timeframe } from "@/types";

export const dailyMetricsApiKeys = {
  all: ["dailyMetrics"] as const,
  timeframe: (timeframe: Timeframe) =>
    [...dailyMetricsApiKeys.all, timeframe] as const,
};

export function createDailyMetricsApi(supabase: SupabaseClient<Database>) {
  return {
    async getDailyMetrics(
      timeframe: Timeframe,
    ): Promise<PortfolioDailyMetric[]> {
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
}
