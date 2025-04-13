import { Database } from "@/supabase";
import { MarketIndex } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const marketIndicesApiKeys = {
  sectorIndex: (sectorKey: string) =>
    ["market-indices", "sector", sectorKey] as const,
  industryIndex: (industryKey: string) =>
    ["market-indices", "industry", industryKey] as const,
  allSectorIndices: () => ["market-indices", "sectors", "all"] as const,
  allIndustryIndices: () => ["market-indices", "industries", "all"] as const,
};

export function createMarketIndicesApi(supabase: SupabaseClient<Database>) {
  return {
    async getSectorIndex(sectorKey: string): Promise<MarketIndex | null> {
      const { data, error } = await supabase
        .from("market_indices")
        .select()
        .eq("sector_key", sectorKey)
        .eq("index_type", "SECTOR_INDEX")
        .single();

      if (error) {
        if (error.code === "PGRST116") { // No rows returned
          return null;
        }
        throw error;
      }

      return data as MarketIndex;
    },

    async getIndustryIndex(industryKey: string): Promise<MarketIndex | null> {
      const { data, error } = await supabase
        .from("market_indices")
        .select()
        .eq("industry_key", industryKey)
        .eq("index_type", "INDUSTRY_INDEX")
        .single();

      if (error) {
        if (error.code === "PGRST116") { // No rows returned
          return null;
        }
        throw error;
      }

      return data as MarketIndex;
    },

    async getAllSectorIndices(): Promise<MarketIndex[]> {
      const { data, error } = await supabase
        .from("market_indices")
        .select()
        .eq("index_type", "SECTOR_INDEX");

      if (error) throw error;
      return data as MarketIndex[];
    },

    async getAllIndustryIndices(): Promise<MarketIndex[]> {
      const { data, error } = await supabase
        .from("market_indices")
        .select()
        .eq("index_type", "INDUSTRY_INDEX");

      if (error) throw error;
      return data as MarketIndex[];
    },
  };
}
