import { Timeframe } from "@/types";
import { HistoricalPrice } from "./types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase";

export const tickerPricesApiKeys = {
  all: ["tickerPrices"] as const,
  ticker: (tickerId: string) => [...tickerPricesApiKeys.all, tickerId] as const,
  timeframe: (tickerId: string, timeframe: Timeframe) =>
    [...tickerPricesApiKeys.ticker(tickerId), timeframe] as const,
};

export function createTickerPricesApi(supabase: SupabaseClient<Database>) {
  return {
    async getTickerHistoricalPrices(
      tickerId: string,
      timeframe: Timeframe,
    ): Promise<HistoricalPrice[]> {
      const now = new Date();
      let query = supabase
        .from("historical_prices")
        .select("*")
        .eq("ticker_id", tickerId)
        .order("date", { ascending: true });

      switch (timeframe) {
        case "1W": {
          const oneWeekAgo = new Date(
            now.setDate(now.getDate() - 7),
          ).toISOString();
          query = query.gte("date", oneWeekAgo);
          break;
        }
        case "1M": {
          const oneMonthAgo = new Date(
            now.setMonth(now.getMonth() - 1),
          ).toISOString();
          query = query.gte("date", oneMonthAgo);
          break;
        }
        case "3M": {
          const threeMonthsAgo = new Date(
            now.setMonth(now.getMonth() - 3),
          ).toISOString();
          query = query.gte("date", threeMonthsAgo);
          break;
        }
        case "YTD": {
          const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
          query = query.gte("date", yearStart);
          break;
        }
        case "1Y": {
          const oneYearAgo = new Date(
            now.setFullYear(now.getFullYear() - 1),
          ).toISOString();
          query = query.gte("date", oneYearAgo);
          break;
        }
        case "ALL":
          break;
        default:
          throw new Error(`Unsupported timeframe: ${timeframe}`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch historical prices: ${error.message}`);
      }

      return data as HistoricalPrice[];
    },
  };
}
