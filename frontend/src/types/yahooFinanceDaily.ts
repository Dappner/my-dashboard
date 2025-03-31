import type { Database } from "./supabase";

export type YahooFinanceDaily =
	Database["public"]["Tables"]["yh_finance_daily"]["Row"];
