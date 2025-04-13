import { Database } from "@/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { InsertTicker, Ticker, UpdateTicker } from "@/types";

export const tickersApiKeys = {
  all: ["tickers"] as const,
  ticker: (exchange: string, symbol: string) =>
    [...tickersApiKeys.all, exchange, symbol] as const,
};

export function createTickersApi(supabase: SupabaseClient<Database>) {
  return {
    async getTickers() {
      const { data } = await supabase.from("tickers").select().order("symbol")
        .is("tradeable", true);

      return data as Ticker[];
    },

    async getTicker(exchange: string, symbol: string) {
      const { data, error } = await supabase
        .from("tickers")
        .select()
        .eq("symbol", symbol)
        .eq("exchange", exchange)
        .single();
      if (error) throw error;

      return data as Ticker;
    },
    async getTickerById(tickerId: string) {
      const { data, error } = await supabase
        .from("tickers")
        .select()
        .eq("id", tickerId)
        .single();
      if (error) throw error;

      return data as Ticker;
    },

    async addTicker(newTicker: InsertTicker): Promise<Ticker> {
      const { data, error } = await supabase
        .from("tickers")
        .insert([newTicker])
        .select("*")
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("This ticker already exists in the database");
        }
        throw error;
      }

      return data;
    },

    async updateTicker(ticker: UpdateTicker): Promise<Ticker | null> {
      const { id, ...tickerData } = ticker;
      if (!id) return null;
      const { data, error } = await supabase
        .from("tickers")
        .update({ ...tickerData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error(
            "This ticker symbol and exchange combination already exists",
          );
        }
        throw error;
      }

      return data;
    },

    async deleteTicker(id: string): Promise<void> {
      const { error } = await supabase.from("tickers").delete().eq("id", id);

      if (error) {
        throw error;
      }
    },
  };
}
