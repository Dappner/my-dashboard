import type { Database } from "@/supabase";

// Calendar Events View
export type CalendarEventsView =
  Database["public"]["Views"]["calendar_events_with_tickers"]["Row"];

// Funds
export type TopHolding =
  Database["public"]["Tables"]["fund_top_holdings"]["Row"];
export type SectorWeighting =
  Database["public"]["Tables"]["fund_sector_weightings"]["Row"];
export type AssetClass =
  Database["public"]["Tables"]["fund_asset_classes"]["Row"];

// Holdings
export type Holding = Database["public"]["Views"]["current_holdings"]["Row"];
export type HoldingAllocation =
  Database["public"]["Views"]["portfolio_holdings_allocation"]["Row"];

// Industries
export type Industry = Database["public"]["Tables"]["industries"]["Row"];
export type IndustryWithSector = Industry & {
  sector: Database["public"]["Tables"]["sectors"]["Row"];
};

// Sectors
export type Sector = Database["public"]["Tables"]["sectors"]["Row"];
export type SectorWithIndustries = Sector & { industries: Industry[] };

// Portfolio Daily Metric
export type PortfolioDailyMetric =
  Database["public"]["Views"]["portfolio_daily_metrics"]["Row"];

// Historical Prices
export type HistoricalPrice =
  Database["public"]["Tables"]["historical_prices"]["Row"];

// Tickers
export type Ticker = Database["public"]["Tables"]["tickers"]["Row"];
export type TickerDaily =
  Database["public"]["Views"]["ticker_daily_view"]["Row"];

export type InsertTicker = Database["public"]["Tables"]["tickers"]["Insert"];
export type UpdateTicker = Database["public"]["Tables"]["tickers"]["Update"];

// Transactions
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TradeView = Database["public"]["Views"]["trades_view"]["Row"];

export type TransactionType =
  Database["public"]["Enums"]["transaction_type_enum"];
export type InsertTransaction =
  Database["public"]["Tables"]["transactions"]["Insert"];
export type UpdateTransaction =
  Database["public"]["Tables"]["transactions"]["Update"];

// Market Index
export type MarketIndex = Database["public"]["Views"]["market_indices"]["Row"];


// FOREX
export type ForexRate = Database["public"]["Tables"]["forex_rates"]["Row"];
export type CurrencyType = Database["public"]["Enums"]["currency_type"];
export interface CurrencyPair {
  base_currency: string;
  target_currency: string;
}
