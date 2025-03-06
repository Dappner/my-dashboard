import { Database } from "./supabase";

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UpdateUser = Database["public"]["Tables"]["users"]["Update"];


