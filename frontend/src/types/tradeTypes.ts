import { Database } from "./supabase";


export type Trade = Database["public"]["Tables"]['trades']['Row'];

export type TradeView = Database["public"]["Views"]['trades_view']['Row'];

export type InsertTrade = Database["public"]["Tables"]['trades']['Insert'];
export type UpdateTrade = Database["public"]["Tables"]['trades']['Update'];
