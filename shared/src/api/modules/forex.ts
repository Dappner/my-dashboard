import { Database } from "@/supabase";
import { CurrencyPair, ForexRate } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const forexApiKeys = {
  all: ["forex"] as const,
  historicalRates: (base?: string, target?: string, startDate?: string, endDate?: string) =>
    [...forexApiKeys.all, "historicalRates", base, target, startDate, endDate] as const,
  latestRate: (base?: string, target?: string) =>
    [...forexApiKeys.all, "latestRate", base, target] as const,
  currencyPairs: () =>
    [...forexApiKeys.all, "currencyPairs"] as const,
};

// Create the FOREX API
export function createForexApi(supabase: SupabaseClient<Database>) {
  return {
    async getHistoricalRates(
      baseCurrency?: string,
      targetCurrency?: string,
      startDate?: string,
      endDate?: string
    ): Promise<ForexRate[]> {
      if (!baseCurrency || !targetCurrency) return [];

      let query = supabase
        .from("forex_rates")
        .select("*")
        .eq("base_currency", baseCurrency)
        .eq("target_currency", targetCurrency)
        .order("date", { ascending: true });

      // Apply date range if provided
      if (startDate) {
        query = query.gte("date", startDate);
      }
      if (endDate) {
        query = query.lte("date", endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch historical rates: ${error.message}`);
      }

      return (data as ForexRate[]) || [];
    },

    async getLatestRate(baseCurrency?: string, targetCurrency?: string): Promise<ForexRate | null> {
      if (!baseCurrency || !targetCurrency) return null;

      const { data, error } = await supabase
        .from("forex_rates")
        .select("*")
        .eq("base_currency", baseCurrency)
        .eq("target_currency", targetCurrency)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        throw new Error(`Failed to fetch latest rate: ${error.message}`);
      }

      return (data as ForexRate) || null;
    },

    async getCurrencyPairs(): Promise<CurrencyPair[]> {
      const { data, error } = await supabase
        .rpc("get_unique_currency_pairs");
      if (error) {
        throw new Error(`Failed to fetch currency pairs: ${error.message}`);
      }
      return (data as CurrencyPair[]) || [];
    }
  };
}
