import { Database } from "@/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { Holding } from "./types";

export const holdingsApiKeys = {
  all: ["holdings"] as const,
  ticker: (exchange: string, symbol: string) =>
    [...holdingsApiKeys.all, exchange, symbol] as const,
};

export function createHoldingsApi(supabase: SupabaseClient<Database>) {
  return {
    async getAll() {
      const { data, error } = await supabase
        .from("current_holdings")
        .select()
        .order("current_market_value", { ascending: false });

      if (error) throw error;
      return data as Holding[];
    },

    async getByTicker(exchange: string, symbol: string) {
      const { data, error } = await supabase
        .from("current_holdings")
        .select()
        .eq("exchange", exchange)
        .eq("symbol", symbol)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data as Holding;
    },
  };
}
