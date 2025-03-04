import { Database } from "./supabase";

export type Portfolio = Database["public"]["Tables"]["portfolio"]["Row"];
export type UpdatePortfolio = Database["public"]["Tables"]["portfolio"]["Update"];


