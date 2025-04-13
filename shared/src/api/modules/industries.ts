import { Database } from "@/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { Industry, IndustryWithSector } from "@/types";

export const industriesApiKeys = {
  all: ["industries"] as const,
  bySector: (sectorKey: string) =>
    [...industriesApiKeys.all, "sector", sectorKey] as const,
  details: (key: string) => [...industriesApiKeys.all, key] as const,
};

export function createIndustriesApi(supabase: SupabaseClient<Database>) {
  return {
    async getAll() {
      const { data, error } = await supabase
        .from("industries")
        .select()
        .order("name");
      if (error) throw error;
      return data as Industry[];
    },

    async getBySector(sectorKey: string) {
      const { data: sector, error: sectorError } = await supabase
        .from("sectors")
        .select("id")
        .eq("key", sectorKey)
        .single();

      if (sectorError) {
        if (sectorError.code === "PGRST116") {
          return [];
        }
        throw sectorError;
      }

      const { data, error } = await supabase
        .from("industries")
        .select()
        .eq("sector_id", sector.id)
        .order("name");

      if (error) throw error;
      return data as Industry[];
    },

    async getByKey(key: string) {
      const { data, error } = await supabase
        .from("industries")
        .select(`
          *,
          sectors:sector_id (*)
        `)
        .eq("key", key)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return {
        ...data,
        sector: data.sectors,
      } as IndustryWithSector;
    },
  };
}
