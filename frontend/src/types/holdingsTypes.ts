import { Database } from "./supabase";

export type Holding = Database["public"]["Views"]["current_holdings"]["Row"];


