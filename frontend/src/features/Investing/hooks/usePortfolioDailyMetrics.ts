import { supabase } from "@/lib/supabase";
import { PortfolioDailyMetric } from "@/types/portfolioDailyMetricTypes";
import { useQuery } from "@tanstack/react-query";

export function usePortfolioDailyMetrics() {
  const { data: dailyMetrics, isLoading, isError } = useQuery({
    queryFn: async () => {
      const { data } = await supabase.from("portfolio_daily_metrics").select();
      return data as PortfolioDailyMetric[];
    },
    queryKey: ["30Day"],
  });

  return {
    dailyMetrics,
    isLoading,
    isError
  }
}
