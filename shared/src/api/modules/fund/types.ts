import type { Database } from "@/supabase";

export type TopHolding =
  Database["public"]["Tables"]["fund_top_holdings"]["Row"];
export type SectorWeighting =
  Database["public"]["Tables"]["fund_sector_weightings"]["Row"];
export type AssetClass =
  Database["public"]["Tables"]["fund_asset_classes"]["Row"];
