import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";

export function usePortfolioDailyMetrics() {
  const { data: dailyMetrics, isLoading } = useQuery({
    queryFn: async () => {
      const { data } = await supabase.from("portfolio_daily_metrics").select();
      return data as Database["public"]["Views"]["portfolio_daily_metrics"]["Row"][];
    },
    queryKey: ["30Day"],
  });

  return {
    dailyMetrics,
    isLoading
  }
}
