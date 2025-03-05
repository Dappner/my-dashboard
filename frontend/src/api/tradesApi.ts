import { supabase } from "@/lib/supabase"
import { InsertTransaction, TradeView, UpdateTransaction } from "@/types/transactionsTypes";

export const transactionsApiKeys = {
  all: ['transactions'] as const,
  ticker: (exchange: string, symbol: string) => [...transactionsApiKeys.all, exchange, symbol] as const,
}

export const transactionsApi = {
  async getTransactions(limit?: number) {
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

  async addTransaction(newTrade: InsertTransaction) {
    const { error } = await supabase.from("transactions").insert(newTrade)

    if (error) {
      console.log("BIG SHIT")
    }

    return true;
  },

  async updateTransaction(updateTrade: UpdateTransaction) {
    const { id, ...trade_data } = updateTrade;
    const { data, error } = await supabase
      .from("transactions")
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

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  }
}

