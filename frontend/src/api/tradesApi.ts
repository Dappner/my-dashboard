import { supabase } from "@/lib/supabase"
import { InsertTrade, TradeView, UpdateTrade } from "@/types/tradeTypes";

export const tradesApiKeys = {
  all: ['trades'] as const,
  ticker: (exchange: string, symbol: string) => [...tradesApiKeys.all, exchange, symbol] as const,
}

export const tradesApi = {
  async getTrades(limit?: number) {
    const query = supabase.from("trades_view").select()
      .order("transaction_date", { ascending: false });
    if (limit) {
      query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error
    }
    return data as TradeView[];
  },

  async getTickerTrades(exchange: string, ticker: string, limit?: number) {
    const query = supabase.from("trades_view").select()
      .eq("symbol", ticker)
      .eq("exchange", exchange)
      .order("transaction_date", { ascending: false })

    if (limit) {
      query.limit(limit)
    }

    const { data, error } = await query;
    if (error) throw error;

    return data as TradeView[];
  },

  async addTrade(newTrade: InsertTrade) {
    const { error } = await supabase.from("trades").insert(newTrade)

    if (error) {
      console.log("BIG SHIT")
    }

    return true;
  },

  async updateTrade(updateTrade: UpdateTrade) {
    const { id, ...trade_data } = updateTrade;
    const { data, error } = await supabase
      .from("trades")
      .update({ ...trade_data, updated_at: new Date().toISOString() })
      .eq("id", id!)
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") {
        throw new Error("This ticker symbol and exchange combination already exists");
      }
      throw error;
    }

    return data;
  },

  async deleteTrade(id: string): Promise<void> {
    const { error } = await supabase
      .from("trades")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  }
}

