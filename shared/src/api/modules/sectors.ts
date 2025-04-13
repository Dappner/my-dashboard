import { Database } from "@/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { Sector, SectorWithIndustries } from "@/types";

export const sectorsApiKeys = {
  all: ["sectors"] as const,
  details: (key: string) => [...sectorsApiKeys.all, key] as const,
  withIndustries: (key: string) =>
    [...sectorsApiKeys.all, key, "industries"] as const,
};

export function createSectorsApi(supabase: SupabaseClient<Database>) {
  return {
    async getAll() {
      const { data, error } = await supabase
        .from("sectors")
        .select()
        .order("name");
      if (error) throw error;
      return data as Sector[];
    },

    async getByKey(key: string) {
      const { data, error } = await supabase
        .from("sectors")
        .select()
        .eq("key", key)
        .single();
      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }
      return data as Sector;
    },

    async getWithIndustries(key: string): Promise<SectorWithIndustries | null> {
      const { data: sector, error: sectorError } = await supabase
        .from("sectors")
        .select()
        .eq("key", key)
        .single();

      if (sectorError) {
        if (sectorError.code === "PGRST116") {
          return null;
        }
        throw sectorError;
      }

      const { data: industries, error: industriesError } = await supabase
        .from("industries")
        .select()
        .eq("sector_id", sector.id)
        .order("name");

      if (industriesError) throw industriesError;

      return {
        ...sector,
        industries: industries || [],
      } as SectorWithIndustries;
    },
  };
}
