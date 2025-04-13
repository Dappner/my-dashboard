import { Database } from "@/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { InsertTicker, Ticker, UpdateTicker } from "@/types";

export const tickersApiKeys = {
  all: ["tickers"] as const,

  lists: () => [...tickersApiKeys.all, "list"] as const,
  list: (filters?: {
    tradeable?: boolean;
    sector?: string;
    industry?: string;
    quoteType?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }) => [...tickersApiKeys.lists(), { ...filters }] as const,

  details: () => [...tickersApiKeys.all, "detail"] as const,
  detail: (identifiers: { id?: string; symbol?: string; exchange?: string }) =>
    [...tickersApiKeys.details(), identifiers] as const,

  related: {
    bySymbol: (symbol: string) =>
      [...tickersApiKeys.all, "related", "symbol", symbol] as const,
    bySector: (sectorId: string) =>
      [...tickersApiKeys.all, "related", "sector", sectorId] as const,
    byIndustry: (industryId: string) =>
      [...tickersApiKeys.all, "related", "industry", industryId] as const,
  },

  mutations: {
    create: () => [...tickersApiKeys.all, "mutations", "create"] as const,
    update: (id: string) =>
      [...tickersApiKeys.all, "mutations", "update", id] as const,
    delete: (id: string) =>
      [...tickersApiKeys.all, "mutations", "delete", id] as const,
  },
};

export function createTickersApi(supabase: SupabaseClient<Database>) {
  return {
    async getTickers(filters?: {
      tradeable?: boolean;
      sector?: string;
      industry?: string;
      quoteType?: string;
      search?: string;
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortDirection?: "asc" | "desc";
    }) {
      let query = supabase.from("tickers").select();

      // Apply filters
      if (filters?.tradeable !== undefined) {
        query = query.eq("tradeable", filters.tradeable);
      }

      if (filters?.sector) {
        query = query.eq("sector_id", filters.sector);
      }

      if (filters?.industry) {
        query = query.eq("industry_id", filters.industry);
      }

      if (filters?.quoteType) {
        query = query.eq("quote_type", filters.quoteType);
      }

      if (filters?.search) {
        query = query.or(
          `symbol.ilike.%${filters.search}%,name.ilike.%${filters.search}%`,
        );
      }

      // Apply sorting
      if (filters?.sortBy) {
        const direction = filters.sortDirection || "asc";
        query = query.order(filters.sortBy, { ascending: direction === "asc" });
      } else {
        query = query.order("symbol");
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 20) - 1,
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Ticker[];
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

    async getTickerBySymbolAndExchange(symbol: string, exchange: string) {
      const { data, error } = await supabase
        .from("tickers")
        .select()
        .eq("symbol", symbol)
        .eq("exchange", exchange)
        .single();
      if (error) throw error;
      return data as Ticker;
    },

    async getTickersBySector(sectorId: string) {
      const { data, error } = await supabase
        .from("tickers")
        .select()
        .eq("sector_id", sectorId)
        .order("symbol");
      if (error) throw error;
      return data as Ticker[];
    },

    async getTickersByIndustry(industryId: string) {
      const { data, error } = await supabase
        .from("tickers")
        .select()
        .eq("industry_id", industryId)
        .order("symbol");
      if (error) throw error;
      return data as Ticker[];
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
