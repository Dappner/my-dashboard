import type { Database } from "./supabase";

export type Holding = Database["public"]["Views"]["current_holdings"]["Row"];
export type HoldingAllocation =
	Database["public"]["Views"]["portfolio_holdings_allocation"]["Row"];
