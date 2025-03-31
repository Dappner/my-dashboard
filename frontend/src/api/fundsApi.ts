import { supabase } from "@/lib/supabase";
import type {
  AssetClass,
  SectorWeighting,
  TopHolding,
} from "@/types/fundTypes";

export const fundApiKeys = {
  all: ["funds"] as const,
  topHoldings: (tickerId?: string) =>
    [...fundApiKeys.all, "topHoldings", tickerId] as const,
  sectorWeightings: (tickerId?: string) =>
    [...fundApiKeys.all, "sectorWeightings", tickerId] as const,
  assetClasses: (tickerId?: string) =>
    [...fundApiKeys.all, "assetClasses", tickerId] as const,
};

export const fundApi = {
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
