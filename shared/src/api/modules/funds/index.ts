import { Database } from "@/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { AssetClass, SectorWeighting, TopHolding } from "./types";

export const fundsApiKeys = {
  all: ["funds"] as const,
  topHoldings: (tickerId?: string) =>
    [...fundsApiKeys.all, "topHoldings", tickerId] as const,
  sectorWeightings: (tickerId?: string) =>
    [...fundsApiKeys.all, "sectorWeightings", tickerId] as const,
  assetClasses: (tickerId?: string) =>
    [...fundsApiKeys.all, "assetClasses", tickerId] as const,
};

export function createFundsApi(supabase: SupabaseClient<Database>) {
  return {
    async getTopHoldings(tickerId?: string): Promise<TopHolding[]> {
      if (!tickerId) return [];

      const { data, error } = await supabase
        .from("fund_top_holdings")
        .select("*")
        .order("weight", { ascending: false })
        .eq("ticker_id", tickerId);

      if (error) {
        throw new Error(`Failed to fetch top holdings: ${error.message}`);
      }

      return (data as TopHolding[]) || [];
    },

    async getSectorWeightings(tickerId?: string): Promise<SectorWeighting[]> {
      if (!tickerId) return [];

      const { data, error } = await supabase
        .from("fund_sector_weightings")
        .select("*")
        .order("weight", { ascending: false })
        .eq("ticker_id", tickerId);

      if (error) {
        throw new Error(`Failed to fetch sector weightings: ${error.message}`);
      }

      return (data as SectorWeighting[]) || [];
    },

    async getAssetClasses(tickerId?: string): Promise<AssetClass[]> {
      if (!tickerId) return [];

      const { data, error } = await supabase
        .from("fund_asset_classes")
        .select("*")
        .order("weight", { ascending: false })
        .eq("ticker_id", tickerId);

      if (error) {
        throw new Error(`Failed to fetch asset classes: ${error.message}`);
      }

      return (data as AssetClass[]) || [];
    },
  };
}

export * from "./types";
