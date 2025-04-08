import { Database } from "@/supabase";

export type Trade = Database["public"]["Tables"]["transactions"]["Row"];
export type TradeView = Database["public"]["Views"]["trades_view"]["Row"];

export type TransactionType =
  Database["public"]["Enums"]["transaction_type_enum"];
export type InsertTransaction =
  Database["public"]["Tables"]["transactions"]["Insert"];
export type UpdateTransaction =
  Database["public"]["Tables"]["transactions"]["Update"];
