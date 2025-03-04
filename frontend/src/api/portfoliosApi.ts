import { supabase } from "@/lib/supabase";
import { Portfolio } from "@/types/portfolioTypes";

export const portfoliosApiKey = {
  all: ['portfolios'] as const
}

export const portfoliosApi = {

  async fetchAll() {
    const { data, error } = await supabase.from("portfolio").select();
    if (error) throw error;

    return data as Portfolio[];
  },

  async fetchUserPortfolio(userId: string) {
    const { data, error } = await supabase.from("portfolio").select()
      .eq("user_id", userId).single();

    if (error) throw error;

    return data as Portfolio;

  }
}
