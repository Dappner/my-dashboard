import { HistoricalPrice } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/supabase";
import { convertTimeframeToDateRange, Timeframe } from "@/utils";

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
      let query = supabase
        .from("historical_prices")
        .select("*")
        .eq("ticker_id", tickerId)
        .order("date", { ascending: true });

      const dateRange = convertTimeframeToDateRange(timeframe);

      if (dateRange.startDate) {
        query = query.gte("date", dateRange.startDate);
      }
      if (dateRange.endDate) {
        query = query.lte("date", dateRange.endDate);
      }
      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch historical prices: ${error.message}`);
      }

      return data as HistoricalPrice[];
    },
    async getHistoricalPricesBySymbol(
      symbol: string,
      timeframe: Timeframe,
    ): Promise<HistoricalPrice[]> {
      // Use the new view
      let query = supabase
        .from("ticker_historical_prices")
        .select("*")
        .eq("symbol", symbol)
        .order("date", { ascending: true });

      const dateRange = convertTimeframeToDateRange(timeframe);
      if (dateRange.startDate) {
        query = query.gte("date", dateRange.startDate);
      }
      if (dateRange.endDate) {
        query = query.lte("date", dateRange.endDate);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(`Failed to fetch historical prices: ${error.message}`);
      }
      return data as HistoricalPrice[];
    },
  };
}
