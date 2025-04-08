import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import type { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { useAuthContext } from "@/contexts/AuthContext";

export function usePortfolioDailyMetrics(timeframe: Timeframe = "ALL") {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ["portfolioDailyMetrics", timeframe, user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Determine date range based on timeframe
      let daysToFetch = 0;
      switch (timeframe) {
        case "1W":
          daysToFetch = 7;
          break;
        case "1M":
          daysToFetch = 30;
          break;
        case "3M":
          daysToFetch = 90;
          break;
        case "1Y":
          daysToFetch = 365;
          break;
        case "YTD": {
          const now = new Date();
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          daysToFetch = Math.floor(
            (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24),
          );
          break;
        }
        case "ALL":
        default:
          daysToFetch = 9999; // Large number to get all data
      }

      const now = new Date();
      const startDate = new Date();
      startDate.setDate(now.getDate() - daysToFetch);

      const { data, error } = await supabase
        .from("portfolio_daily_metrics")
        .select("*")
        .eq("user_id", user.id)
        .gte("current_date", startDate.toISOString().split("T")[0])
        .order("current_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
