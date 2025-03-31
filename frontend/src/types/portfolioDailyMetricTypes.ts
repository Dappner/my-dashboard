import type { Database } from "./supabase";

export type Timeframe = "1W" | "1M" | "3M" | "YTD" | "1Y" | "ALL";

export type PortfolioDailyMetric =
	Database["public"]["Views"]["portfolio_daily_metrics"]["Row"];
