import { supabase } from "@/lib/supabase";
import { Holding } from "@/types/holdingsTypes";

export const holdingsApiKeys = {
  all: ['holdings'] as const,
  ticker: (exchange: string, symbol: string) => [...holdingsApiKeys.all, exchange, symbol] as const,
}

export const holdingsApi = {

  async getHoldings() {
    const { data, error } = await supabase.from("current_holdings").select()
    if (error) throw error;

    return data as Holding[];
  },

  async getTickerHolding(exchange: string, ticker: string) {
    const { data, error } = await supabase.from("current_holdings").select()
      .eq("exchange", exchange)
      .eq("symbol", ticker)
      .single()
    if (error) {
      if (error.code == "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as Holding;
  }
};

