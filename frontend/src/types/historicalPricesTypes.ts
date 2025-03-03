import { Database } from "./supabase";

export type HistoricalPrice = Database["public"]["Tables"]['historical_prices']['Row'];
