import { Database } from "@/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { Ticker } from "@/types";

export const marketStructureApiKeys = {
  tickersBySector: (sectorKey: string) =>
    ["tickers", "sector", sectorKey] as const,
  tickersByIndustry: (industryKey: string) =>
    ["tickers", "industry", industryKey] as const,
};

export function createMarketStructureApi(supabase: SupabaseClient<Database>) {
  return {
    async getTickersBySector(sectorKey: string) {
      const { data: sector, error: sectorError } = await supabase
        .from("sectors")
        .select("id")
        .eq("key", sectorKey)
        .single();

      if (sectorError) {
        if (sectorError.code === "PGRST116") {
          return [];
        }
        throw sectorError;
      }

      const { data, error } = await supabase
        .from("tickers")
        .select()
        .eq("sector_id", sector.id)
        .eq("tradeable", true)
        .order("symbol");

      if (error) throw error;
      return data as Ticker[];
    },

    async getTickersByIndustry(industryKey: string) {
      const { data: industry, error: industryError } = await supabase
        .from("industries")
        .select("id")
        .eq("key", industryKey)
        .single();

      if (industryError) {
        if (industryError.code === "PGRST116") {
          return [];
        }
        throw industryError;
      }

      const { data, error } = await supabase
        .from("tickers")
        .select()
        .eq("industry_id", industry.id)
        .eq("tradeable", true)
        .order("symbol");

      if (error) throw error;
      return data as Ticker[];
    },
  };
}
