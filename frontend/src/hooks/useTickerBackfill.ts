import { supabase } from "@/lib/supabase";
import { AppRoutes } from "@/navigation";
import type { Database } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Define the type for ticker event data from Supabase
type TickerEvent = Database["public"]["Tables"]["ticker_events"]["Row"];

export function useTickerBackfillStatus(tickerId: string) {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ["tickerBackfill", tickerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticker_events")
        .select()
        .eq("ticker_id", tickerId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      return (data[0] as TickerEvent) || null;
    },
    refetchInterval: (query) => {
      const data = query.state.data as TickerEvent | null;
      return data?.status === "pending" ? 5000 : false;
    },
    onSuccess: (data) => {
      if (!data) return;

      // Get ticker details from the data
      const tickerDetails = data.details?.ticker_data;
      const symbol = tickerDetails?.symbol;
      const exchange = tickerDetails?.exchange || "NASDAQ";

      // Handle completed backfill
      if (data.status === "completed" && data.completed_at) {
        // Show success notification with action to navigate to ticker
        toast.success("Ticker backfill completed", {
          description: `${symbol} data has been successfully loaded`,
          action: {
            label: "View Ticker",
            onClick: () =>
              navigate(AppRoutes.investing.ticker(exchange, symbol)),
          },
        });
      }

      // Handle failed backfill
      if (data.status === "failed") {
        toast.error("Ticker backfill failed", {
          description:
            data.error_message || "An error occurred during backfill",
        });
      }
    },
  });
}
