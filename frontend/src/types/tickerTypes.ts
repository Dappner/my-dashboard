import { Database } from "./supabase";

export type Ticker = Database["public"]["Tables"]["tickers"]["Row"];
export type TickerDaily = Database["public"]["Views"]["ticker_daily_view"]["Row"];


export type InsertTicker = Database["public"]["Tables"]["tickers"]["Insert"];
export type UpdateTicker = Database["public"]["Tables"]["tickers"]["Update"];
